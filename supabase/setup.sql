-- ReliaTech app: cross-device sync setup.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run. Run it once.
-- It is safe to run again: it never deletes rows or files.
--
-- What it creates:
--   1. public.rt_records: one row per saved app record (a job, a customer, a plan, a price book item, settings ...).
--      Each row belongs to the signed-in user (user_id). Row Level Security lets a user see and change only their own rows.
--      The anon (signed-out) role gets no access at all. Nobody can hard-delete rows through the API; a delete in the
--      app is saved as deleted = true and the last copy of the record is kept, so a mistake can be undone.
--   2. public.rt_push(records): saves a batch of records with last-write-wins. A record is replaced only when the
--      incoming copy was edited at the same time or later (client_updated_at) than the copy already saved.
--      A brand-new record never overwrites an existing one with the same key (two devices, same new job number).
--   3. A private storage bucket "rt-photos" for job photos (used in sync phase 2). Each user can read and add files
--      only under a folder named with their own user id. No public links, no deletes through the API.

-- 1. Records table ---------------------------------------------------------------------------------------------
create table if not exists public.rt_records (
  user_id           uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  collection        text        not null check (char_length(collection) between 1 and 40),
  id                text        not null check (char_length(id) between 1 and 200),
  data              jsonb,
  deleted           boolean     not null default false,
  client_updated_at timestamptz not null,
  updated_at        timestamptz not null default now(),
  device            text,
  primary key (user_id, collection, id)
);

comment on table public.rt_records is 'ReliaTech app records, one row per job/customer/plan/etc. Last-write-wins by client_updated_at.';

create index if not exists rt_records_user_updated_idx on public.rt_records (user_id, updated_at);

-- Server time of the last change; the app pulls rows changed since its last pull using this column.
create or replace function public.rt_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists rt_records_touch on public.rt_records;
create trigger rt_records_touch
  before insert or update on public.rt_records
  for each row execute function public.rt_touch();

-- Lock it down: RLS on, no anon access, signed-in users see only their own rows, no hard deletes.
alter table public.rt_records enable row level security;

revoke all on table public.rt_records from anon;
revoke all on table public.rt_records from authenticated;
grant select, insert, update on table public.rt_records to authenticated;

drop policy if exists "rt_records select own" on public.rt_records;
create policy "rt_records select own" on public.rt_records
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "rt_records insert own" on public.rt_records;
create policy "rt_records insert own" on public.rt_records
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "rt_records update own" on public.rt_records;
create policy "rt_records update own" on public.rt_records
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on function public.rt_touch() from public;
revoke all on function public.rt_touch() from anon;
revoke all on function public.rt_touch() from authenticated;

-- 2. Batch save with last-write-wins --------------------------------------------------------------------------
-- records: a JSON array of {collection, id, data, deleted, client_updated_at, device, is_new}.
--   A record is replaced only when the incoming copy was edited at the same time or later than the saved copy.
--   is_new = true means "this device made this record and has never seen it online". If a row with that key already
--   exists (for example both devices made job #55725 while offline), it is NOT overwritten; the app renumbers its copy.
-- Returns the [collection, id] pairs that were written. Skipped records are not errors.
drop function if exists public.rt_push(jsonb);
create or replace function public.rt_push(records jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  written jsonb := '[]'::jsonb;
  part jsonb;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  if jsonb_typeof(records) is distinct from 'array' then
    raise exception 'records must be a JSON array';
  end if;

  -- New records: insert only if nobody has used that key yet.
  with i as (
    select distinct on (x.collection, x.id)
           x.collection, x.id, x.data, coalesce(x.deleted, false) as deleted, x.client_updated_at, x.device,
             coalesce(x.is_new, false) as is_new
        from jsonb_to_recordset(records)
             as x(collection text, id text, data jsonb, deleted boolean, client_updated_at timestamptz, device text, is_new boolean)
       where x.collection is not null and x.id is not null and x.client_updated_at is not null
       order by x.collection, x.id, x.client_updated_at desc
  ), w as (
    insert into public.rt_records (user_id, collection, id, data, deleted, client_updated_at, device)
    select uid, i.collection, i.id, i.data, i.deleted, i.client_updated_at, i.device
      from i
     where i.is_new
    on conflict (user_id, collection, id) do nothing
    returning collection, id
  )
  select coalesce(jsonb_agg(jsonb_build_array(w.collection, w.id)), '[]'::jsonb) into part from w;
  written := written || part;

  -- Known records: last write wins.
  with i as (
    select distinct on (x.collection, x.id)
           x.collection, x.id, x.data, coalesce(x.deleted, false) as deleted, x.client_updated_at, x.device,
             coalesce(x.is_new, false) as is_new
        from jsonb_to_recordset(records)
             as x(collection text, id text, data jsonb, deleted boolean, client_updated_at timestamptz, device text, is_new boolean)
       where x.collection is not null and x.id is not null and x.client_updated_at is not null
       order by x.collection, x.id, x.client_updated_at desc
  ), w as (
    insert into public.rt_records as r (user_id, collection, id, data, deleted, client_updated_at, device)
    select uid, i.collection, i.id, i.data, i.deleted, i.client_updated_at, i.device
      from i
     where not i.is_new
    on conflict (user_id, collection, id) do update
       set data              = case when excluded.deleted then coalesce(excluded.data, r.data) else excluded.data end,
           deleted           = excluded.deleted,
           client_updated_at = excluded.client_updated_at,
           device            = excluded.device
     where excluded.client_updated_at >= r.client_updated_at
    returning collection, id
  )
  select coalesce(jsonb_agg(jsonb_build_array(w.collection, w.id)), '[]'::jsonb) into part from w;
  written := written || part;

  return written;
end;
$$;

revoke all on function public.rt_push(jsonb) from public;
revoke all on function public.rt_push(jsonb) from anon;
grant execute on function public.rt_push(jsonb) to authenticated;

-- 3. Private photo bucket (phase 2) ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('rt-photos', 'rt-photos', false, 26214400)
on conflict (id) do nothing;

drop policy if exists "rt-photos read own" on storage.objects;
create policy "rt-photos read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'rt-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "rt-photos add own" on storage.objects;
create policy "rt-photos add own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'rt-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "rt-photos update own" on storage.objects;
create policy "rt-photos update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'rt-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'rt-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Done. You should see "Success. No rows returned".
