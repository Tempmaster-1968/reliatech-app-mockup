(function () {
  const TZ = "America/Los_Angeles";
  const STEVE_PHONE = "(562) 487-8750";
  const STEVE_SMS = "+15624878750";
  const STEVE_EMAIL = "steveseguine51@gmail.com";
  const STORE = "reliatech-booking-requests-v1";
  const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const main = document.getElementById("main");
  const params = new URLSearchParams(location.search);
  const token = (params.get("v") || "").trim();

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function parseTS(s) { const d = new Date(s); return isNaN(d.getTime()) ? null : d; }
  function tzParts(d) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false
    });
    const o = {};
    fmt.formatToParts(d).forEach(function (p) { if (p.type !== "literal") o[p.type] = p.value; });
    return o;
  }
  function ymd(d) { const p = tzParts(d); return p.year + "-" + p.month + "-" + p.day; }
  function hm(d) { const p = tzParts(d); return p.hour + ":" + p.minute; }
  function prettyDate(d) {
    return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(d);
  }
  function prettyTime(d) {
    return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);
  }
  function minutesOf(hhmm) {
    const p = hhmm.split(":");
    return Number(p[0]) * 60 + Number(p[1]);
  }
  function atLocal(dateStr, minutes) {
    const h = Math.floor(minutes / 60), m = minutes % 60;
    // Construct a time that is that clock time in PT.
    // Use a noon UTC guess and adjust? Better: ISO with offset is messy around DST.
    // Parse as local by using Date with America/Los_Angeles via format iteration.
    const guess = new Date(dateStr + "T" + pad(h) + ":" + pad(m) + ":00");
    // guess is interpreted as local (box is PT) — good on this host; in browsers we should be careful.
    // Adjust if displayed PT clock doesn't match.
    const p = tzParts(guess);
    const got = Number(p.hour) * 60 + Number(p.minute);
    const delta = (minutes - got) * 60000;
    const adj = new Date(guess.getTime() + delta);
    // Also fix date mismatch across DST
    if (ymd(adj) !== dateStr) {
      const d2 = new Date(guess.getTime() + (minutes - got) * 60000);
      return d2;
    }
    return adj;
  }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
  }

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch (e) { return []; }
  }
  function saveStore(list) {
    try { localStorage.setItem(STORE, JSON.stringify(list)); } catch (e) {}
  }

  function banner() {
    return '<div class="request-banner">This is a request, not a confirmed appointment. Steve will confirm the time with you before it goes on his calendar.</div>';
  }

  function renderError(title, body) {
    main.innerHTML = '<div class="pad">' + banner() +
      '<div class="panel"><div class="h2">' + esc(title) + '</div><div class="muted" style="margin-top:8px">' + esc(body) + "</div></div>" +
      '<div class="muted" style="margin-top:16px">ReliaTech Services · Long Beach, CA<br>Call or text Steve at ' + esc(STEVE_PHONE) + ".</div></div>";
  }

  function buildSlots(slotsDoc, meta) {
    const duration = meta.durationMinutes || 120;
    const step = slotsDoc.slotStepMinutes || 30;
    const avail = slotsDoc.availability || {};
    const busy = (slotsDoc.busy || []).map(function (b) {
      return { start: parseTS(b.start), end: parseTS(b.end) };
    }).filter(function (b) { return b.start && b.end; });

    const startDate = parseDay(meta.windowStart) || startOfToday();
    const endDate = parseDay(meta.windowEnd) || addDays(startOfToday(), 60);
    const today = startOfToday();
    const from = startDate < today ? today : startDate;

    const out = [];
    for (let d = from; ymd(d) <= ymd(endDate); d = addDays(d, 1)) {
      const p = tzParts(d);
      const dayName = DAYS[new Date(d.getFullYear(), d.getMonth(), d.getDate()).getDay()];
      // getDay() is the box-local weekday; box is PT. For robustness use weekday from tzParts.
      const weekday = (p.weekday || "").toLowerCase();
      const windows = avail[weekday] || [];
      windows.forEach(function (w) {
        const wStart = minutesOf(w[0]), wEnd = minutesOf(w[1]);
        for (let m = wStart; m + duration <= wEnd; m += step) {
          const s = atLocal(ymd(d), m);
          const e = new Date(s.getTime() + duration * 60000);
          if (s.getTime() <= Date.now()) continue;
          const hit = busy.some(function (b) { return overlaps(s, e, b.start, b.end); });
          if (!hit) out.push({ start: s, end: e });
        }
      });
    }
    return out;
  }

  function parseDay(s) {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return parseTS(s);
    return atLocal(s, 12 * 60);
  }
  function startOfToday() {
    const p = tzParts(new Date());
    return atLocal(p.year + "-" + p.month + "-" + p.day, 0);
  }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }

  function groupSlots(list) {
    const g = [];
    list.forEach(function (s) {
      const key = ymd(s.start);
      if (!g.length || g[g.length - 1].key !== key) g.push({ key: key, label: prettyDate(s.start), slots: [] });
      g[g.length - 1].slots.push(s);
    });
    return g;
  }

  let state = { meta: null, slots: [], picked: null, name: "", phone: "", note: "", sent: false, step: 1 };

  function requestBody() {
    const s = state.picked;
    const when = s ? prettyDate(s.start) + " at " + prettyTime(s.start) + "–" + prettyTime(s.end) + " PT" : "(no time selected)";
    return "Hi Steve,\n\n" +
      "I'd like to request this ReliaTech visit:\n\n" +
      "Visit: " + (state.meta.label || "Maintenance visit") + "\n" +
      "Time: " + when + "\n" +
      "Name: " + (state.name || "") + "\n" +
      "Phone: " + (state.phone || "") + "\n" +
      (state.note ? "Note: " + state.note + "\n" : "") +
      "\nThis is a request only. Please confirm the time.\n";
  }

  function smsHref() {
    return "sms:" + STEVE_SMS + "?&body=" + encodeURIComponent(requestBody());
  }
  function mailHref() {
    const sub = "Visit request — " + (state.meta.label || "ReliaTech");
    return "mailto:" + STEVE_EMAIL + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(requestBody());
  }

  function persistRequest() {
    const s = state.picked;
    const rec = {
      savedAt: new Date().toISOString(),
      token: token,
      label: state.meta.label,
      start: s ? s.start.toISOString() : null,
      end: s ? s.end.toISOString() : null,
      name: state.name,
      phone: state.phone,
      note: state.note,
      status: "request_only"
    };
    const list = loadStore();
    list.push(rec);
    saveStore(list);
  }

  function render() {
    if (!state.meta) return;
    const groups = groupSlots(state.slots);
    let html = '<div class="pad">' + banner();
    html += '<div class="panel" style="margin-bottom:16px"><div class="k-up">Visit</div>' +
      '<div class="h2" style="margin-top:4px">' + esc(state.meta.label) + "</div>" +
      '<div class="muted" style="margin-top:6px">Times are in Pacific Time and are already limited to Steve’s usual hours: weekday evenings and Saturdays. Closed times are not shown.</div></div>';

    if (state.step === 1) {
      if (!groups.length) {
        html += '<div class="panel"><div class="muted">No open times are published in this window. Call or text Steve at ' + esc(STEVE_PHONE) + " to find a time.</div></div>";
      } else {
        html += '<div class="section">Pick a time</div>';
        groups.forEach(function (g) {
          html += '<div class="slot-day"><h2>' + esc(g.label) + '</h2><div class="slot-row">';
          g.slots.forEach(function (s) {
            const on = state.picked && state.picked.start.getTime() === s.start.getTime();
            html += '<button type="button" class="slot-btn' + (on ? " on" : "") + '" data-slot="' + esc(s.start.toISOString()) + '">' +
              esc(prettyTime(s.start)) + "</button>";
          });
          html += "</div></div>";
        });
      }
      if (state.picked) {
        html += '<div class="book-actions"><button type="button" class="btn accent" id="bk-continue">Continue</button></div>';
      }
    } else if (state.step === 2) {
      const s = state.picked;
      html += '<button type="button" class="link-btn book-back" id="bk-back">Change time</button>';
      html += '<div class="picked-line">' + (s ? esc(prettyDate(s.start) + " at " + prettyTime(s.start) + "–" + prettyTime(s.end) + " PT") : "No time selected") + "</div>";
      html += '<div class="book-confirm"><div class="section">Your contact</div>' +
        '<label class="field"><div class="field-lab">Name</div><input id="bk-name" type="text" autocomplete="name" value="' + esc(state.name) + '"></label>' +
        '<label class="field"><div class="field-lab">Phone</div><input id="bk-phone" type="tel" autocomplete="tel" value="' + esc(state.phone) + '"></label>' +
        '<label class="field"><div class="field-lab">Note (optional)</div><textarea id="bk-note" rows="3">' + esc(state.note) + "</textarea></label></div>";
      html += '<div class="book-actions"><button type="button" class="btn accent" id="bk-review">Review request</button></div>';
    } else {
      const s = state.picked;
      html += '<button type="button" class="link-btn book-back" id="bk-back">Edit request</button>';
      html += '<div class="picked-line">' + (s ? esc(prettyDate(s.start) + " at " + prettyTime(s.start) + "–" + prettyTime(s.end) + " PT") : "No time selected") + "</div>";
      if (state.sent) {
        html += '<div class="panel" style="margin-bottom:12px"><div class="h2">Request saved on this phone</div><div class="muted" style="margin-top:6px">It is not booked until Steve confirms. If the text or email app did not open, text or call him at ' + esc(STEVE_PHONE) + ".</div></div>";
      } else {
        html += '<div class="section">Request confirmation</div><div class="muted" style="margin-bottom:8px">This is the message that will go to Steve. It is a request only.</div>';
      }
      html += '<pre class="msg-preview">' + esc(requestBody()) + "</pre>";
      html += '<div class="book-actions">';
      html += '<a class="btn accent" id="bk-sms" href="' + esc(smsHref()) + '">Text this request to Steve</a>';
      html += '<a class="btn" id="bk-mail" href="' + esc(mailHref()) + '">Email this request to Steve</a>';
      html += "</div>";
    }

    html += '<div class="muted" style="margin-top:16px;margin-bottom:24px">ReliaTech Services · Long Beach, CA<br>This page does not book the time by itself.</div></div>';
    main.innerHTML = html;

    main.querySelectorAll("[data-slot]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const iso = btn.getAttribute("data-slot");
        state.picked = state.slots.find(function (s) { return s.start.toISOString() === iso; }) || null;
        render();
      });
    });
    const cont = document.getElementById("bk-continue");
    if (cont) cont.addEventListener("click", function () {
      if (!state.picked) { alert("Pick a time first."); return; }
      state.step = 2;
      render();
    });
    const back = document.getElementById("bk-back");
    if (back) back.addEventListener("click", function () {
      state.sent = false;
      state.step = state.step === 3 ? 2 : 1;
      render();
    });
    const nameEl = document.getElementById("bk-name");
    const phoneEl = document.getElementById("bk-phone");
    const noteEl = document.getElementById("bk-note");
    function sync() {
      if (nameEl) state.name = nameEl.value;
      if (phoneEl) state.phone = phoneEl.value;
      if (noteEl) state.note = noteEl.value;
    }
    ["input", "change"].forEach(function (ev) {
      if (nameEl) nameEl.addEventListener(ev, sync);
      if (phoneEl) phoneEl.addEventListener(ev, sync);
      if (noteEl) noteEl.addEventListener(ev, sync);
    });
    const review = document.getElementById("bk-review");
    if (review) review.addEventListener("click", function () {
      sync();
      if (!state.picked) { alert("Pick a time first."); return; }
      if (!state.name.trim() || !state.phone.trim()) {
        alert("Please enter your name and phone so Steve can confirm with you.");
        return;
      }
      state.step = 3;
      render();
    });
    function onSend(e) {
      if (!state.picked) {
        e.preventDefault();
        alert("Pick a time first.");
        return;
      }
      if (!state.name.trim() || !state.phone.trim()) {
        e.preventDefault();
        alert("Please enter your name and phone so Steve can confirm with you.");
        return;
      }
      persistRequest();
      state.sent = true;
    }
    const sms = document.getElementById("bk-sms");
    const mail = document.getElementById("bk-mail");
    if (sms) sms.addEventListener("click", onSend);
    if (mail) mail.addEventListener("click", onSend);
  }

  if (!token) {
    renderError("Missing booking link", "This page needs a booking link from Steve. Ask him to send the link for your visit, or call " + STEVE_PHONE + ".");
    return;
  }

  Promise.all([
    fetch("booking-tokens.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("tokens"); return r.json(); }),
    fetch("slots.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("slots"); return r.json(); })
  ]).then(function (pair) {
    const tokens = (pair[0] && pair[0].tokens) || {};
    const meta = tokens[token];
    if (!meta) {
      renderError("This link is not valid", "The booking link may be expired or mistyped. Call or text Steve at " + STEVE_PHONE + " to set up a time.");
      return;
    }
    state.meta = meta;
    state.slots = buildSlots(pair[1], meta);
    render();
  }).catch(function () {
    renderError("Could not load times", "Check your connection and try again, or call Steve at " + STEVE_PHONE + ".");
  });
})();
