# ReliaTech

A phone-app mockup for ReliaTech Services (Long Beach HVAC). Job, customer, invoice, and estimate records are loaded from Housecall Pro exports. The Price book tab is seeded from confirmed service rates and recorded supplier costs (AC Pro ticket, Sigler quotes, Payne bundles, and Sigler duct material prices). Costed items use Steve’s default 40% GP (sell = cost ÷ (1 − 0.40), 35% floor, rounded to the nearest dollar or to the nearest $0.50 under $20). Refrigerant uses a 125% markup (sell = cost × 2.25, about 55.6% GP). Confirmed service rates are not marked up again. Items Steve hasn’t confirmed stay marked Needs Steve’s OK; he can approve one item or Approve all. The page is public — treat the link accordingly.

Open this on an iPhone in Safari (no account or sign-in):

**https://tempmaster-1968.github.io/reliatech-app-mockup/**

This is the permanent address. Future updates are published to the same URL.

## Add to Home Screen (iPhone)

1. Open the link in Safari (not Chrome).
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Tap **Add**. The app opens full screen with the ReliaTech icon.

## What’s in the app

Jobs, customers, Price book, and Money tabs; color-coded job cards from the Housecall Pro import; a Jobs tab that shows in-progress work plus scheduled jobs in the next 14 days, with a Plan visits due preview limited to overdue or due within 14 days, a See all plan visits link, a Show all link for everything else (still in search and on customer pages), and an Unpaid balances link for jobs with a balance but no recent activity; a customer profile with one or more service addresses (each with its own equipment, on-site contact, access notes, plan, and job history), a Billing same as service address checkbox and a job-level Bill to that can be changed (a revised estimate E02 is kept when billing changes after a quote), estimates and invoices that always print Bill to and Service location blocks,  (visits marked due, scheduled, done, or overdue); a Plan visits due list on the Jobs tab; a New job button on the customer page that pre-fills the customer and assigns the next ReliaTech job number (25076 and up; 25083 is reserved, 25084 and 25085 are voided, next is 25086); a Plan prospects list on the Jobs tab and Plan visits screen for customers to offer the $225 prepaid annual; time tracking (clock in/out for Steve and independent techs, a running timer, an Acting as tech selector with Steve as admin, a Can edit own times setting that defaults to off, correction requests that Steve approves or rejects with an audit trail, and a Time on site block on the invoice); visit, maintenance, and scope note templates, including a nameplate prompt that saves to the customer’s equipment profile; photo, voice memo, and note buttons on each job (captures attach to that job; leftover items land in Unfiled on the Jobs tab); a mic button that clocks in by spoken customer name or street against active and next-14-day jobs (one match confirms, several show a pick list, none offers a new job) and that can start a draft job such as “New job for Lisa Mezo, AC not cooling, Saturday morning” (Safari’s Web Speech API, with a type-in fallback — Steve confirms before it saves); a three-step New call flow; cooling and heating readings; and a price book with search, categories, add/edit, proposed sell prices, a 35% GP floor warning on items and estimates, and Save to price book on estimate lines that aren’t already in the book. Settings hold the default GP, minimum GP, and refrigerant minimum markup.

Customer booking links use `book.html?v=<token>`. A customer only sees open weekday-evening and Saturday slots from the published `slots.json` file (free/busy blocks, no event titles or customer details). The customer picks a weekday-evening or Saturday opening, enters a name and phone, and reviews a prefilled text or email to Steve; a copy is saved on that phone. It is not booked until Steve confirms and asks the assistant to put it on his calendar. The Acting as switch and time-edit permissions are not a login and are not secure until there is a shared backend with sign-in.

New jobs, equipment, time entries, notes, photos, voice memos, price book edits, readings, estimates, plan-visit times, and booking requests you add in this mockup stay on this phone or browser only (localStorage). They are not uploaded to a shared server. If you clear Safari data or switch phones, they are gone. Rebuild public booking hours with `/workspace/reliatech-setup/scripts/update_slots.py`.
