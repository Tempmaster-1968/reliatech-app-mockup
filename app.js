/* ReliaTech job-flow app. Customer and job records load from data.js (Housecall Pro import). */
(function () {
  const BRAND = "#0B3A4F";
  const TEAL = "#148A8A";
  const ACCENT = "#F26B2A";

  const STATUS = {
    new: { label: "New call", short: "New", step: 0, bar: "#3B6FBF", bg: "#E8F0FA", text: "#1E4A8A", bgDark: "#1A2C44", textDark: "#A8C6F0" },
    diagnosis: { label: "Diagnosis", short: "Diag.", step: 1, bar: TEAL, bg: "#E6F4F4", text: "#0C5C5C", bgDark: "#143333", textDark: "#8ED4D4" },
    estimate: { label: "Estimate sent", short: "Est.", step: 2, bar: "#D49A12", bg: "#FBF3D8", text: "#7A5800", bgDark: "#3A2F12", textDark: "#F0D48A" },
    approved: { label: "Approved", short: "Appr.", step: 3, bar: "#2F8F4E", bg: "#E5F6EA", text: "#1B5C30", bgDark: "#163322", textDark: "#8FDBA8" },
    progress: { label: "In progress", short: "Work", step: 4, bar: ACCENT, bg: "#FDE8DC", text: "#A43A0A", bgDark: "#3A2218", textDark: "#F5B089" },
    done: { label: "Work done", short: "Work", step: 4, bar: "#6B5CE0", bg: "#EEEDFB", text: "#3D3399", bgDark: "#26224A", textDark: "#C0B8F5" },
    invoiced: { label: "Invoiced", short: "Inv.", step: 5, bar: "#C45C1A", bg: "#FAE8DB", text: "#8A3A0C", bgDark: "#3A2418", textDark: "#F0B090" },
    paid: { label: "Paid", short: "Paid", step: 6, bar: "#1F7A4D", bg: "#E3F5EC", text: "#145C38", bgDark: "#143326", textDark: "#8FDBB0" }
  };
  const PIPELINE = [
    { step: 0, label: "New" }, { step: 1, label: "Diag." }, { step: 2, label: "Est." },
    { step: 3, label: "Appr." }, { step: 4, label: "Work" }, { step: 5, label: "Inv." }, { step: 6, label: "Paid" }
  ];
  const FILTERS = [
    ["open", "Open"], ["all", "All"], ["new", "New call"], ["diagnosis", "Diagnosis"], ["estimate", "Estimate sent"],
    ["approved", "Approved"], ["progress", "In progress"], ["done", "Work done"], ["invoiced", "Invoiced"], ["paid", "Paid"]
  ];
  const MODE_META = { cooling: { label: "Cooling", short: "Cooling" }, furnace: { label: "Heating · furnace", short: "Furnace" }, heatPumpHeat: { label: "Heating · heat pump", short: "Heat pump" } };
  const REPORT_CHIPS = ["No cool", "No heat", "Noise", "Leak", "Maintenance", "Thermostat", "Estimate request"];
  const URGENCY = [
    { id: "today", label: "Today", hint: "As soon as you can" },
    { id: "soon", label: "Soon", hint: "In the next few days" },
    { id: "schedule", label: "Schedule", hint: "When you have an opening" }
  ];
  const LABEL_CHIPS = {
    cooling: ["Arrival", "After cleaning coil", "After charge adjustment", "Final"],
    furnace: ["Arrival", "After igniter", "After airflow adjustment", "Final"],
    heatPumpHeat: ["Arrival", "After defrost", "Final"]
  };
  const COOLING_FIELDS = [
    ["outdoorDb", "Outdoor dry bulb", "°F", "Air temps"], ["indoorDb", "Indoor dry bulb", "°F", "Air temps"],
    ["indoorWb", "Indoor wet bulb (return)", "°F", "Air temps"], ["returnTemp", "Return temp", "°F", "Air temps"],
    ["supplyTemp", "Supply temp", "°F", "Air temps"], ["deltaT", "Delta T", "°F", "Air temps"],
    ["refrigerant", "Refrigerant", "", "Refrigerant"], ["suctionPsi", "Suction pressure", "psig", "Refrigerant"],
    ["suctionSat", "Suction saturation", "°F", "Refrigerant"], ["liquidPsi", "Liquid pressure", "psig", "Refrigerant"],
    ["liquidSat", "Liquid saturation", "°F", "Refrigerant"], ["superheat", "Superheat", "°F", "Refrigerant"],
    ["targetSH", "Target superheat", "°F", "Refrigerant"], ["subcool", "Subcool", "°F", "Refrigerant"],
    ["targetSC", "Target subcool", "°F", "Refrigerant"], ["returnStatic", "Return static", "in. WC", "Airflow"],
    ["supplyStatic", "Supply static", "in. WC", "Airflow"], ["tesp", "Total external static", "in. WC", "Airflow"],
    ["cfm", "Airflow", "CFM", "Airflow"], ["compAmps", "Compressor amps", "A", "Electrical"],
    ["compVolts", "Compressor volts", "V", "Electrical"], ["fanAmps", "Condenser fan amps", "A", "Electrical"],
    ["fanVolts", "Condenser fan volts", "V", "Electrical"]
  ];
  const FURNACE_FIELDS = [
    ["inletGas", "Inlet gas pressure", "in. WC", "Gas"], ["manifoldGas", "Manifold gas pressure", "in. WC", "Gas"],
    ["returnTemp", "Return temp", "°F", "Temperature rise"], ["supplyTemp", "Supply temp", "°F", "Temperature rise"],
    ["tempRise", "Temperature rise", "°F", "Temperature rise"], ["nameplateRise", "Nameplate rise range", "°F", "Temperature rise"],
    ["co", "Flue CO", "ppm", "Combustion"], ["o2", "Flue O₂", "%", "Combustion"], ["stackTemp", "Stack temp", "°F", "Combustion"],
    ["blowerAmps", "Blower amps", "A", "Airflow"], ["returnStatic", "Return static", "in. WC", "Airflow"],
    ["supplyStatic", "Supply static", "in. WC", "Airflow"], ["tesp", "Total external static", "in. WC", "Airflow"]
  ];
  const HP_FIELDS = [
    ["outdoorDb", "Outdoor dry bulb", "°F", "Conditions"], ["dischargePsi", "Discharge pressure", "psig", "Refrigerant"],
    ["suctionPsi", "Suction pressure", "psig", "Refrigerant"], ["returnTemp", "Return temp", "°F", "Air temps"],
    ["supplyTemp", "Supply temp", "°F", "Air temps"], ["deltaT", "Delta T", "°F", "Air temps"], ["defrost", "Defrost check", "", "Defrost"]
  ];
  const FIELDS = { cooling: COOLING_FIELDS, furnace: FURNACE_FIELDS, heatPumpHeat: HP_FIELDS };
  const KEY_FIELDS = {
    cooling: ["superheat", "targetSH", "subcool", "targetSC", "deltaT", "tesp", "cfm", "refrigerant"],
    furnace: ["tempRise", "nameplateRise", "manifoldGas", "tesp", "co", "blowerAmps"],
    heatPumpHeat: ["dischargePsi", "suctionPsi", "supplyTemp", "returnTemp", "deltaT", "defrost"]
  };
  const TIER = { good: { label: "Good", color: TEAL }, better: { label: "Better", color: BRAND }, best: { label: "Best", color: ACCENT } };
  const PRICE_BOOK = (window.RT_DATA && window.RT_DATA.priceBook) ? window.RT_DATA.priceBook : [];
  const DEMO = {
    cooling: { outdoorDb: "76", indoorDb: "78", indoorWb: "66", returnTemp: "78", supplyTemp: "67", deltaT: "11", refrigerant: "R-410A", suctionPsi: "108", suctionSat: "36", liquidPsi: "255", liquidSat: "84", superheat: "28", targetSH: "11", subcool: "4", targetSC: "9", returnStatic: "0.52", supplyStatic: "0.38", tesp: "0.90", cfm: "680", compAmps: "9.4", compVolts: "239", fanAmps: "0.9", fanVolts: "239" },
    furnace: { inletGas: "7.0", manifoldGas: "3.8", returnTemp: "70", supplyTemp: "142", tempRise: "72", nameplateRise: "40–70", co: "18", o2: "7.2", stackTemp: "325", blowerAmps: "5.8", returnStatic: "0.42", supplyStatic: "0.48", tesp: "0.90" },
    heatPumpHeat: { outdoorDb: "48", dischargePsi: "320", suctionPsi: "95", returnTemp: "68", supplyTemp: "90", deltaT: "22", defrost: "Clear, no ice" }
  };

  function rv(value, unit, flag, fromShot) { return { value: String(value), unit: unit || "", flag: flag || "ok", fromScreenshot: !!fromShot }; }
  function dark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function sc(status) {
    const c = STATUS[status];
    return dark() ? { bar: c.bar, bg: c.bgDark, text: c.textDark } : { bar: c.bar, bg: c.bg, text: c.text };
  }
  function money(n) { return n.toLocaleString("en-US", { style: "currency", currency: "USD" }); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function numOf(v) {
    if (!v) return null;
    const n = parseFloat(String(typeof v === "string" ? v : v.value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  function displayVal(v) { return !v || !v.value ? "—" : (v.unit ? v.value + " " + v.unit : v.value); }
  function flagClass(flag) { return flag === "alert" ? "alert" : flag === "watch" ? "watch" : "ok"; }
  function flagColors(flag) {
    if (flag === "ok") return { text: "var(--ok-text)", bg: "var(--ok-bg)", bar: "var(--ok)" };
    if (flag === "watch") return { text: "var(--watch-text)", bg: "var(--watch-bg)", bar: "var(--watch)" };
    return { text: "var(--alert-text)", bg: "var(--alert-bg)", bar: "var(--alert)" };
  }
  function vsTarget(a, t) { const d = Math.abs(a - t); return d <= 3 ? "ok" : d <= 6 ? "watch" : "alert"; }
  function flagDeltaCool(dt) { return dt >= 16 && dt <= 22 ? "ok" : (dt >= 14 && dt < 16) || (dt > 22 && dt <= 24) ? "watch" : "alert"; }
  function flagDeltaHeat(dt) { return dt >= 15 && dt <= 30 ? "ok" : (dt >= 12 && dt < 15) || (dt > 30 && dt <= 35) ? "watch" : "alert"; }
  function flagTesp(n) { return n <= 0.65 ? "ok" : n <= 0.8 ? "watch" : "alert"; }
  function flagCO(n) { return n <= 50 ? "ok" : n <= 100 ? "watch" : "alert"; }
  function parseRange(s) {
    const m = String(s).replace("–", "-").replace("—", "-").match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
  }
  function flagRise(rise, range) {
    const r = parseRange(range);
    if (!r) return "ok";
    if (rise >= r.min && rise <= r.max) return "ok";
    if (rise >= r.min - 5 && rise <= r.max + 5) return "watch";
    return "alert";
  }
  function worse(a, b) { const r = { ok: 0, watch: 1, alert: 2 }; return r[b] > r[a] ? b : a; }
  function flagAll(mode, values) {
    const v = Object.assign({}, values);
    const ret = numOf(v.returnTemp), sup = numOf(v.supplyTemp);
    if (ret != null && sup != null && !v.deltaT && !v.tempRise) {
      if (mode === "furnace") {
        const rise = Math.round((sup - ret) * 10) / 10;
        const range = v.nameplateRise ? v.nameplateRise.value : "";
        v.tempRise = rv(rise, "°F", range ? flagRise(rise, range) : "ok");
      } else if (mode === "heatPumpHeat") {
        const rise = Math.round((sup - ret) * 10) / 10;
        v.deltaT = rv(rise, "°F", flagDeltaHeat(rise));
      } else {
        const dt = Math.round((ret - sup) * 10) / 10;
        v.deltaT = rv(dt, "°F", flagDeltaCool(dt));
      }
    }
    const rs = numOf(v.returnStatic), ss = numOf(v.supplyStatic);
    if (rs != null && ss != null && !v.tesp) v.tesp = rv(Math.round((rs + ss) * 100) / 100, "in. WC", flagTesp(rs + ss));
    const set = (k, f) => { if (v[k]) v[k] = Object.assign({}, v[k], { flag: f }); };
    if (mode === "cooling") {
      const sh = numOf(v.superheat), tsh = numOf(v.targetSH), scv = numOf(v.subcool), tsc = numOf(v.targetSC), dt = numOf(v.deltaT), tesp = numOf(v.tesp);
      if (sh != null && tsh != null) set("superheat", vsTarget(sh, tsh));
      if (scv != null && tsc != null) set("subcool", vsTarget(scv, tsc));
      if (dt != null) set("deltaT", flagDeltaCool(dt));
      if (tesp != null) set("tesp", flagTesp(tesp));
    } else if (mode === "furnace") {
      const rise = numOf(v.tempRise), range = v.nameplateRise ? v.nameplateRise.value : "", tesp = numOf(v.tesp), co = numOf(v.co);
      if (rise != null && range) set("tempRise", flagRise(rise, range));
      if (tesp != null) set("tesp", flagTesp(tesp));
      if (co != null) set("co", flagCO(co));
    } else {
      const dt = numOf(v.deltaT);
      if (dt != null) set("deltaT", flagDeltaHeat(dt));
      const d = (v.defrost && v.defrost.value || "").toLowerCase();
      if (d) {
        if (d.includes("ice") && !d.includes("no ice") && !d.includes("clear")) set("defrost", "alert");
        else if (d.includes("frost")) set("defrost", "watch");
        else set("defrost", "ok");
      }
    }
    return v;
  }
  function evaluateValues(mode, values) {
    const g = (k) => numOf(values[k]);
    const parts = [];
    let tone = "ok";
    const mark = (f) => { tone = worse(tone, f); return f; };
    if (mode === "cooling") {
      const sh = g("superheat"), tsh = g("targetSH"), scv = g("subcool"), tsc = g("targetSC"), dt = g("deltaT"), tesp = g("tesp");
      if (sh != null && tsh != null) {
        const f = mark(vsTarget(sh, tsh));
        if (f !== "ok" && scv != null && tsc != null && scv < tsc - 3 && sh > tsh + 3) parts.push("Superheat high vs target, likely undercharged or a restriction.");
        else if (f !== "ok" && scv != null && tsc != null && scv > tsc + 3 && sh < tsh - 3) parts.push("Superheat low and subcool high vs target — possible overcharge.");
        else if (f !== "ok") parts.push("Superheat " + sh + "°F vs target " + tsh + "°F.");
      }
      if (scv != null && tsc != null && !(sh != null && tsh != null && scv < tsc - 3 && sh > tsh + 3) && !(sh != null && tsh != null && scv > tsc + 3 && sh < tsh - 3)) {
        const f = mark(vsTarget(scv, tsc));
        if (f !== "ok") parts.push("Subcool " + scv + "°F vs target " + tsc + "°F.");
      }
      if (dt != null) { const f = mark(flagDeltaCool(dt)); if (f !== "ok") parts.push("Delta T is " + (f === "alert" ? "out of range" : "marginal") + " at " + dt + "°F."); }
      if (tesp != null) { const f = mark(flagTesp(tesp)); if (f !== "ok") parts.push("Static " + tesp + " in. WC is high."); }
      if (!parts.length) parts.push("Readings are in range. Superheat and subcool are on target and airflow looks good.");
    } else if (mode === "furnace") {
      const rise = g("tempRise"), range = values.nameplateRise ? values.nameplateRise.value : "", tesp = g("tesp"), co = g("co");
      if (rise != null && range) { const f = mark(flagRise(rise, range)); if (f !== "ok") parts.push("Temperature rise " + rise + "°F vs nameplate " + range + "°F."); }
      if (tesp != null) { const f = mark(flagTesp(tesp)); if (f !== "ok") parts.push("Static " + tesp + " in. WC is high and may be cutting airflow."); }
      if (co != null) { const f = mark(flagCO(co)); if (f !== "ok") parts.push("Flue CO is elevated at " + co + " ppm."); }
      if (!parts.length) parts.push("Temperature rise is in the nameplate range. Gas pressure and combustion look clean.");
    } else {
      const dt = g("deltaT"), defrost = (values.defrost && values.defrost.value || "").toLowerCase();
      if (dt != null) { const f = mark(flagDeltaHeat(dt)); if (f !== "ok") parts.push("Supply/return split is " + dt + "°F for heating."); }
      if (defrost.includes("ice") && !defrost.includes("no ice") && !defrost.includes("clear")) { mark("alert"); parts.push("Outdoor coil icing — check defrost."); }
      else if (defrost.includes("frost")) { mark("watch"); parts.push("Light frost on the outdoor coil; watch defrost."); }
      if (!parts.length) parts.push("Heat pump heating split and pressures recorded. Defrost looks clear.");
    }
    return { summary: parts.join(" "), tone: tone };
  }
  function reportText(chips, detail, urgency) {
    const bits = [];
    if (chips.length) bits.push(chips.join(", "));
    if (detail.trim()) bits.push(detail.trim());
    const urg = urgency === "today" ? "Urgent — needs a visit today" : urgency === "soon" ? "Soon" : "To be scheduled";
    return bits.length ? bits.join(" — ") + ". " + urg + "." : urg;
  }
  function nextJobId(jobs) { return String(jobs.reduce((m, j) => Math.max(m, Number(j.id)), 25061) + 1); }
  function draftTotal(lines) { return lines.reduce((s, l) => s + l.amount * l.qty, 0); }
  function draftLabel(l) { return l.unit === "lb" ? l.label + ", " + l.qty + " lb" : l.qty > 1 ? l.label + " × " + l.qty : l.label; }
  function defaultMode(job) {
    if (!job) return "cooling";
    const p = job.problem.toLowerCase();
    if (p.includes("furnace") || p.includes("igniter") || p.includes("no heat")) return "furnace";
    if (p.includes("heat pump")) return "heatPumpHeat";
    return "cooling";
  }
  function initials(name) {
    return name.split(" ").filter((w) => w !== "The" && w !== "household").slice(0, 2).map((w) => w[0]).join("");
  }

  const ICONS = {
    jobs: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5V4h8v1M8 10h8M8 14h5"/>',
    capture: '<path d="M4 8h3l1.4-2h7.2L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/>',
    customers: '<circle cx="9" cy="8" r="3"/><path d="M4 19c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="17" cy="9" r="2.2"/><path d="M16.2 14.2c1.8.4 3.8 1.8 3.8 4.8"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/><path d="M7 12h.01M17 12h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    note: '<path d="M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M14 4v5h5M8 13h8M8 17h5"/>',
    photo: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="1.6"/><path d="M3 17l5.5-5 4 4 2.5-2.5L21 17"/>',
    reading: '<path d="M12 3v4M8 5.2l1.4 2.2M16 5.2l-1.4 2.2"/><path d="M7 20h10a3 3 0 0 0 0-6h-1.2L12 8.5 8.2 14H7a3 3 0 0 0 0 6z"/>',
    chat: '<path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    phone: '<path d="M7 3h4l1 4-2 1.5a12 12 0 0 0 5.5 5.5L17 12l4 1v4a2 2 0 0 1-2 2A16 16 0 0 1 5 7a2 2 0 0 1 2-2z"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/>'
  };
  function icon(name, size) {
    size = size || 22;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || "") + "</svg>";
  }
  function pill(label, color, bg) {
    return '<span class="pill" style="color:' + color + ';background:' + bg + '">' + esc(label) + "</span>";
  }
  function shot() {
    return '<div class="shot"><div class="s1">SCREENSHOT</div><div><div style="font-size:9px;opacity:.7">SH</div><div class="s2">28°</div></div><div class="s3">Job Link · sample</div></div>';
  }

  function t(id, kind, time, title, body) { return { id: id, kind: kind, time: time, title: title, body: body }; }

  const INITIAL_CUSTOMERS = (window.RT_DATA && window.RT_DATA.customers) ? window.RT_DATA.customers : [];
  const INITIAL_JOBS = (window.RT_DATA && window.RT_DATA.jobs) ? window.RT_DATA.jobs : [];
  const PAST_JOBS = (window.RT_DATA && window.RT_DATA.moneyJobs) ? window.RT_DATA.moneyJobs : [];
  const SHOW_SAMPLE_BADGE = !!(window.RT_DATA && window.RT_DATA.showSampleBadge);
  const PRICE_BOOK_NOTE = (window.RT_DATA && window.RT_DATA.priceBookNote) || "Prices come from ReliaTech Price Books in Drive.";
  const MONEY_NOTE = (window.RT_DATA && window.RT_DATA.moneyNote) || "";

  /* state and remaining UI will be appended */
  window.__RT_BOOT = { INITIAL_CUSTOMERS: INITIAL_CUSTOMERS, INITIAL_JOBS: INITIAL_JOBS, PAST_JOBS: PAST_JOBS };

  let state = {
    tab: "jobs",
    filter: "open",
    query: "",
    openJobId: null,
    openCustomerId: null,
    sheet: null,
    toast: "",
    jobs: INITIAL_JOBS.map((j) => JSON.parse(JSON.stringify(j))),
    customers: INITIAL_CUSTOMERS.map((c) => JSON.parse(JSON.stringify(c))),
    moneyJobs: PAST_JOBS.map((j) => JSON.parse(JSON.stringify(j))),
    newCallStep: 1,
    newCall: { chips: [], detail: "", urgency: "today", customerId: "", isNew: false, newName: "", newPhone: "", newAddress: "", newCity: "Long Beach", newEmail: "", custQuery: "" },
    readingDraft: { mode: "cooling", label: "Arrival", values: {}, fromScreenshot: false },
    compareIds: [],
    packTab: "repair",
    packQuery: "",
    packTons: 3,
    packDraft: []
  };
  let toastTimer = null;

  function setState(patch) { Object.assign(state, patch); render(); }
  function getJob(id) { return state.jobs.find((j) => j.id === id) || null; }
  function showToast(msg) {
    state.toast = msg;
    render();
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { state.toast = ""; render(); }, 2600);
  }
  function closeSheet() {
    state.sheet = null;
    state.compareIds = [];
    render();
  }
  function nextCustomerId() {
    const n = state.customers.reduce(function (m, c) { return Math.max(m, Number(c.id.slice(1))); }, 0);
    return "c" + (n + 1);
  }

  window.RT = {
    setQuery: function (v) { state.query = v; renderKeepFocus("search-q"); },
    setCustQuery: function (v) { state.newCall.custQuery = v; renderKeepFocus("nc-q"); },
    setNew: function (k, v) { state.newCall[k] = v; renderKeepFocus("nc-" + k); },
    setDetail: function (v) { state.newCall.detail = v; renderKeepFocus("nc-detail"); },
    setNote: function (v) { state._note = v; },
    setPackQ: function (v) { state.packQuery = v; renderKeepFocus("pack-q"); },
    setReadLabel: function (v) { state.readingDraft.label = v; renderKeepFocus("rd-label"); },
    setReadVal: function (k, v) { state.readingDraft.values[k] = v; }
  };

  function renderKeepFocus(id) {
    const el = document.getElementById(id);
    const start = el ? el.selectionStart : null;
    const end = el ? el.selectionEnd : null;
    render();
    const n = document.getElementById(id);
    if (n) { n.focus(); if (start != null) try { n.setSelectionRange(start, end); } catch (e) {} }
  }

  function act(name, arg) { return 'data-act="' + esc(name) + '" data-arg="' + esc(arg == null ? "" : String(arg)) + '"'; }

  /* ——— screens ——— */
  function topBar(opts) {
    return '<div class="topbar">' +
      (opts.back ? '<button class="icon-btn" ' + act(opts.back) + ' aria-label="Back">' + icon("back") + "</button>" : "") +
      '<div style="flex:1;min-width:0">' +
        (opts.kicker ? '<div class="kicker">' + esc(opts.kicker) + "</div>" : "") +
        '<div class="title-row"><div class="' + (opts.kicker ? "title" : "nav-title") + '">' + esc(opts.title) + "</div>" +
        (opts.badge ? '<span class="badge">Sample data</span>' : "") + "</div>" +
      "</div></div>";
  }
  function tabBar() {
    const tabs = [["jobs", "Jobs", "jobs"], ["capture", "Capture", "capture"], ["customers", "Customers", "customers"], ["money", "Money", "money"]];
    return '<div class="tabbar">' + tabs.map(function (t) {
      return '<button class="tab' + (state.tab === t[0] ? " on" : "") + '" ' + act("tab", t[0]) + '>' + icon(t[2], 22) + "<span>" + t[1] + "</span></button>";
    }).join("") + "</div>";
  }

  function jobsList() {
    const q = state.query.trim().toLowerCase();
    const list = state.jobs.filter(function (j) {
      const hit = !q || [j.id, j.customer, j.address, j.city, j.problem].join(" ").toLowerCase().indexOf(q) !== -1;
      const statusHit = state.filter === "all" || (state.filter === "open" ? j.status !== "paid" : j.status === state.filter);
      return hit && statusHit;
    });
    return topBar({ kicker: "ReliaTech Services", title: "Jobs", badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content"><div class="pad pad-fab">' +
      '<div class="search">' + icon("search", 16) + '<input id="search-q" type="search" placeholder="Search jobs or addresses" value="' + esc(state.query) + '" oninput="RT.setQuery(this.value)"></div>' +
      '<div class="chips">' + FILTERS.map(function (f) {
        return '<button class="chip' + (state.filter === f[0] ? " on" : "") + '" ' + act("filter", f[0]) + ">" + esc(f[1]) + "</button>";
      }).join("") + "</div>" +
      '<div class="stack">' + list.map(jobCard).join("") + "</div></div></div>" +
      '<button class="fab" ' + act("openNewCall") + ' aria-label="New call">' + icon("plus", 28) + "</button>" +
      tabBar();
  }
  function jobCard(job) {
    const st = STATUS[job.status], col = sc(job.status);
    return '<button class="job-card" ' + act("openJob", job.id) + ">" +
      '<div class="stripe" style="background:' + col.bar + '"></div>' +
      '<div class="job-body"><div class="row"><div class="meta">#' + job.id + " · " + job.city + "</div>" + pill(st.label, col.text, col.bg) + "</div>" +
      '<div class="job-name">' + esc(job.customer) + "</div>" +
      '<div class="job-prob">' + esc(job.problem) + "</div>" +
      '<div class="row"><div class="addr">' + esc(job.address) + "</div>" + (job.total ? '<div class="amt">' + money(job.total) + "</div>" : "") + "</div>" +
      "</div><div class=\"chev\">" + icon("chevron", 18) + "</div></button>";
  }

  function stepper(status) {
    const current = STATUS[status].step;
    return '<div class="stepper">' + PIPELINE.map(function (p, i) {
      const done = current >= p.step;
      const color = done ? TEAL : "var(--border)";
      return '<div class="step"><div class="step-row">' +
        (i === 0 ? '<div style="width:10px;flex-shrink:0"></div>' : '<div class="step-line" style="background:' + color + '"></div>') +
        '<div class="dot" style="width:' + (done ? 10 : 8) + "px;height:" + (done ? 10 : 8) + "px;background:" + (done ? TEAL : "var(--border)") + '"></div>' +
        (i === PIPELINE.length - 1 ? '<div style="width:10px;flex-shrink:0"></div>' : '<div class="step-line" style="background:' + (current > p.step ? TEAL : "var(--border)") + '"></div>') +
        "</div><div class=\"step-lab\" style=\"color:" + (done ? "var(--text)" : "var(--muted)") + ';font-weight:' + (done ? 700 : 500) + '">' + p.label + "</div></div>";
    }).join("") + "</div>";
  }

  function jobDetail(job) {
    const st = STATUS[job.status], col = sc(job.status);
    const iconFor = { call: "phone", note: "note", photo: "photo", reading: "reading", system: "chat" };
    return topBar({ back: "closeJob", title: "Job " + job.id, badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      '<div class="linkish" ' + act("openCustomer", job.customerId) + ' style="cursor:pointer">' + icon("pin", 16) + "<span>" + esc(job.customer) + " · " + esc(job.address) + ", " + esc(job.city) + "</span></div>" +
      '<div class="h1">' + esc(job.problem) + "</div>" +
      '<div class="teal">' + esc(job.phone) + "</div>" +
      '<div style="margin-bottom:16px">' + pill(st.label, col.text, col.bg) + (job.schedule ? '<span class="muted" style="margin-left:8px;font-size:12px">' + esc(job.schedule) + "</span>" : "") + "</div>" +
      '<div class="panel" style="margin-bottom:16px">' + stepper(job.status) + "</div>" +
      '<div class="section">Quick capture</div><div class="quick">' +
      '<button class="quick-btn" ' + act("sheet", "note") + ">" + icon("note") + "<span>Note</span></button>" +
      '<button class="quick-btn" ' + act("sheet", "photo") + ">" + icon("photo") + "<span>Photo</span></button>" +
      '<button class="quick-btn" ' + act("sheet", "reading") + ">" + icon("reading") + "<span>Reading</span></button>" +
      "</div>" +
      readingsSection(job) +
      '<div class="section">Timeline</div><div class="timeline">' + job.timeline.map(function (item) {
        return '<div class="t-item"><div class="t-ico">' + icon(iconFor[item.kind] || "note", 16) + "</div><div style=\"min-width:0\"><div class=\"meta\">" + esc(item.time) + "</div><div style=\"font-weight:700;font-size:14px;margin:2px 0\">" + esc(item.title) + "</div><div class=\"muted\">" + esc(item.body) + "</div></div></div>";
      }).join("") + "</div>" +
      '<div class="actions">' +
      '<button class="btn" ' + act("openPriceBook") + ">Build estimate</button>" +
      (job.estimateId ? '<button class="btn ghost" ' + act("sheet", "approval") + ">Send for approval · " + job.estimateId + "</button>" : "") +
      (job.status === "done" || job.status === "approved" || job.status === "progress" ? '<button class="btn teal" ' + act("sheet", "invoice") + ">Make invoice</button>" : "") +
      (job.status === "invoiced" ? '<button class="btn accent" ' + act("sheet", "paid") + ">Mark paid</button>" : "") +
      '<button class="btn ask" ' + act("sheet", "ask") + ">" + icon("chat", 18) + "<span>Ask ReliaTech</span></button>" +
      "</div></div></div>";
  }

  function evalCard(ev) {
    if (!ev) return "";
    const c = flagColors(ev.tone);
    const kicker = ev.tone === "ok" ? "In range" : ev.tone === "watch" ? "Watch" : "Out of range";
    return '<div class="eval" style="background:' + c.bg + ';margin-bottom:10px"><div class="eval-bar" style="background:' + c.bar + '"></div><div class="eval-body"><div class="eval-k" style="color:' + c.text + '">' + kicker + "</div><div class=\"eval-t\" style=\"color:" + c.text + '">' + esc(ev.summary) + "</div></div></div>";
  }
  function valueBox(label, reading) {
    const c = flagColors(reading && reading.flag ? reading.flag : "ok");
    const flagged = reading && reading.flag && reading.flag !== "ok";
    return '<div class="val-box"><div class="val-lab">' + esc(label) + "</div><div class=\"val-num\" style=\"color:" + (flagged ? c.text : "var(--text)") + '">' +
      (flagged ? '<span class="flag" style="background:' + c.bar + '"></span>' : "") + esc(displayVal(reading)) + "</div></div>";
  }
  function setCard(job, set, compact) {
    const keys = KEY_FIELDS[set.mode] || KEY_FIELDS.cooling;
    const fields = FIELDS[set.mode] || COOLING_FIELDS;
    const meta = MODE_META[set.mode];
    return '<div class="panel" style="margin-bottom:10px">' +
      '<div class="row" style="margin-bottom:8px"><div><div style="font-weight:750;font-size:15px">' + esc(set.label) + "</div><div class=\"meta\">" + esc(set.time) + " · " + esc(meta.short) + (set.hasScreenshot ? " · from screenshot" : "") + "</div></div></div>" +
      (set.hasScreenshot && !compact ? '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px">' + shot() + '<div class="muted" style="font-size:12px;line-height:18px">Sample Job Link screenshot. ReliaTech would read the values and fill the fields below.</div></div>' : "") +
      evalCard(set.evaluation) +
      '<div class="val-grid">' + keys.map(function (k) {
        const f = fields.find(function (x) { return x[0] === k; });
        return valueBox(f ? f[1] : k, set.values[k]);
      }).join("") + "</div>" +
      (compact ? "" : '<button class="link-btn" ' + act("openSet", job.id + "|" + set.id) + ">Open full set</button>") +
      "</div>";
  }
  function readingsSection(job) {
    const sets = job.readingSets || [];
    if (!sets.length) return "";
    const canCompare = sets.length >= 2;
    return '<div class="section">Readings</div>' +
      (canCompare ? '<div style="margin:-4px 0 10px"><button class="chip" ' + act("openCompare", job.id) + ">Compare sets</button></div>" : "") +
      sets.map(function (s) { return setCard(job, s, false); }).join("");
  }

  function customersList() {
    const q = state.query.trim().toLowerCase();
    const list = state.customers.filter(function (c) {
      return !q || [c.name, c.address, c.city, c.phone].join(" ").toLowerCase().indexOf(q) !== -1;
    });
    return topBar({ kicker: "ReliaTech Services", title: "Customers", badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content"><div class="pad">' +
      '<div class="search">' + icon("search", 16) + '<input id="search-q" type="search" placeholder="Search customers" value="' + esc(state.query) + '" oninput="RT.setQuery(this.value)"></div>' +
      '<div class="stack">' + list.map(function (c) {
        const eq = c.equipment[0];
        return '<button class="list-card" ' + act("openCustomer", c.id) + '><div class="job-body" style="display:flex;gap:12px;align-items:flex-start">' +
          '<div class="avatar">' + esc(initials(c.name)) + "</div><div style=\"min-width:0\"><div class=\"job-name\" style=\"margin-top:0\">" + esc(c.name) + "</div>" +
          '<div class="muted">' + esc(c.address) + ", " + esc(c.city) + "</div><div class=\"muted\">" + esc(c.phone) + "</div>" +
          (eq ? '<div class="meta" style="margin-top:4px">' + esc(eq.name) + "</div>" : "") +
          "</div></div><div class=\"chev\">" + icon("chevron", 18) + "</div></button>";
      }).join("") + "</div></div></div>" + tabBar();
  }
  function customerDetail(c) {
    const jobs = state.jobs.concat(state.moneyJobs).filter(function (j) { return j.customerId === c.id; });
    return topBar({ back: "closeCustomer", title: c.name, badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      '<div class="panel" style="margin-bottom:14px"><div class="muted">' + esc(c.address) + (c.city ? ", " + esc(c.city) : "") + "</div>" +
      (c.phone ? '<div class="teal" style="margin:6px 0 0">' + esc(c.phone) + "</div>" : "") +
      (c.email ? '<div class="muted" style="margin-top:4px">' + esc(c.email) + "</div>" : "") + "</div>" +
      '<div class="section">Equipment</div>' + ((c.equipment && c.equipment.length) ? c.equipment.map(function (e) {
        return '<div class="panel" style="margin-bottom:10px"><div class="h2">' + esc(e.name) + "</div><div class=\"muted\" style=\"margin-top:4px\">" + esc(e.detail) + "</div></div>";
      }).join("") : '<div class="muted" style="margin-bottom:12px">No equipment listed in the Housecall Pro export.</div>') +
      '<div class="section">Past jobs</div><div class="stack">' + jobs.map(function (j) {
        if (state.jobs.some(function (x) { return x.id === j.id; })) return jobCard(j);
        const col = sc(j.status);
        return '<div class="job-card" style="cursor:default"><div class="stripe" style="background:' + col.bar + '"></div><div class="job-body"><div class="row"><div class="meta">#' + j.id + "</div>" + pill(STATUS[j.status].label, col.text, col.bg) + "</div><div class=\"job-prob\" style=\"margin-top:6px\">" + esc(j.problem) + "</div><div class=\"row\"><div class=\"addr\">" + (j.invoiceId || "") + "</div><div class=\"amt\">" + money(j.total) + "</div></div></div></div>";
      }).join("") + "</div></div></div>";
  }

  function moneyScreen() {
    const all = state.jobs.concat(state.moneyJobs);
    const collected = (window.RT_DATA && typeof window.RT_DATA.collected === "number") ? window.RT_DATA.collected : all.filter(function (j) { return j.status === "paid"; }).reduce(function (s, j) { return s + j.total; }, 0);
    const outstanding = (window.RT_DATA && typeof window.RT_DATA.outstanding === "number") ? window.RT_DATA.outstanding : all.filter(function (j) { return j.status === "invoiced"; }).reduce(function (s, j) { return s + (j.dueAmount || j.total); }, 0);
    const openEst = (window.RT_DATA && typeof window.RT_DATA.openEstimates === "number") ? window.RT_DATA.openEstimates : all.filter(function (j) { return j.status === "estimate" || j.status === "approved"; }).reduce(function (s, j) { return s + j.total; }, 0);
    const unpaid = all.filter(function (j) { return (j.dueAmount || 0) > 0 || j.status === "invoiced"; });
    return topBar({ kicker: "ReliaTech Services", title: "Money", badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content"><div class="pad">' +
      '<div class="money-tile brand" style="margin-bottom:10px"><div class="k-up" style="color:rgba(255,255,255,.7)">Collected</div><div class="money-val">' + money(collected) + '</div><div style="font-size:12px;opacity:.8">' + (MONEY_NOTE || "From Housecall Pro job amounts minus remaining balances.") + '</div></div>' +
      '<div style="display:flex;gap:10px;margin-bottom:16px">' +
      '<div class="money-tile" style="flex:1"><div class="k-up">Outstanding</div><div class="money-val" style="font-size:22px">' + money(outstanding) + "</div></div>" +
      '<div class="money-tile" style="flex:1"><div class="k-up">Open estimates</div><div class="money-val" style="font-size:22px">' + money(openEst) + "</div></div></div>" +
      '<div class="section">Unpaid invoices</div><div class="stack">' + unpaid.map(jobCard).join("") + (unpaid.length ? "" : '<div class="muted">No job balances are marked due in the import.</div>') +
      "</div></div></div>" + tabBar();
  }

  function captureScreen() {
    const recent = [];
    state.jobs.forEach(function (j) {
      (j.readingSets || []).forEach(function (s) { recent.push({ job: j, set: s }); });
    });
    recent.sort(function (a, b) { return 0; });
    return topBar({ kicker: "ReliaTech Services", title: "Capture", badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content"><div class="pad">' +
      '<div class="muted" style="margin-bottom:14px">Start a note, photo, or reading, then attach it to a job. Or open a job and use Quick capture there.</div>' +
      '<div class="quick" style="margin-bottom:20px">' +
      '<button class="quick-btn" ' + act("captureNeedJob", "note") + ">" + icon("note") + "<span>Note</span></button>" +
      '<button class="quick-btn" ' + act("captureNeedJob", "photo") + ">" + icon("photo") + "<span>Photo</span></button>" +
      '<button class="quick-btn" ' + act("captureNeedJob", "reading") + ">" + icon("reading") + "<span>Reading</span></button>" +
      "</div>" +
      '<div class="section">Recent readings</div>' +
      recent.slice(0, 6).map(function (r) {
        return '<div style="margin-bottom:12px"><div class="meta" style="margin-bottom:6px">Job ' + r.job.id + " · " + esc(r.job.customer) + "</div>" + setCard(r.job, r.set, true) + "</div>";
      }).join("") +
      "</div></div>" + tabBar();
  }

  /* remaining sheets + handlers appended next */

  function backdrop(inner) {
    return '<div class="backdrop" id="backdrop"><div class="sheet" id="sheet">' +
      '<div class="handle"><span></span></div>' + inner + "</div></div>";
  }

  function newCallSheet() {
    const nc = state.newCall;
    const jobId = nextJobId(state.jobs);
    const step = state.newCallStep;
    const steps = '<div class="steps">' +
      '<span style="color:' + (step === 1 ? TEAL : "var(--muted)") + '">1. Report</span>' +
      '<span style="color:' + (step === 2 ? TEAL : "var(--muted)") + '">2. Customer</span>' +
      '<span style="color:' + (step === 3 ? TEAL : "var(--muted)") + '">3. Confirm</span></div>';
    const head = '<div class="sheet-head"><div class="sheet-title">New call</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" + steps;
    if (step === 1) {
      return backdrop(head +
        '<div class="muted" style="margin-bottom:10px">What\'s going on? Pick one or more, then add a little detail.</div>' +
        '<div class="chips">' + REPORT_CHIPS.map(function (c) {
          const on = nc.chips.indexOf(c) !== -1;
          return '<button class="chip' + (on ? " on accent" : "") + '" ' + act("toggleChip", c) + ">" + esc(c) + "</button>";
        }).join("") + "</div>" +
        '<label class="field"><div class="field-lab">What happened</div><textarea id="nc-detail" rows="3" placeholder="A little more, if you have it" oninput="RT.setDetail(this.value)">' + esc(nc.detail) + "</textarea></label>" +
        '<div class="field-lab">When should this be seen?</div>' +
        URGENCY.map(function (u) {
          const on = nc.urgency === u.id;
          return '<button class="list-card" style="margin-bottom:8px;padding:12px;display:block;border:' + (on ? "1.5px solid " + TEAL : "1.5px solid transparent") + '" ' + act("urgency", u.id) + "><div style=\"font-weight:750\">" + esc(u.label) + '</div><div class="muted">' + esc(u.hint) + "</div></button>";
        }).join("") +
        '<button class="btn" ' + act("ncNext") + ">Next · Customer</button>");
    }
    if (step === 2) {
      const q = (nc.custQuery || "").trim().toLowerCase();
      const matches = state.customers.filter(function (c) {
        return !q || [c.name, c.address, c.city, c.phone].join(" ").toLowerCase().indexOf(q) !== -1;
      });
      const none = q && !matches.length && !nc.isNew;
      let body;
      if (nc.isNew) {
        body = '<button class="link-btn" style="margin-bottom:10px" ' + act("ncBackList") + ">← Back to customer list</button>" +
          '<label class="field"><div class="field-lab">Name</div><input id="nc-newName" value="' + esc(nc.newName) + '" oninput="RT.setNew(\'newName\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Phone</div><input id="nc-newPhone" type="tel" value="' + esc(nc.newPhone) + '" oninput="RT.setNew(\'newPhone\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Address</div><input id="nc-newAddress" value="' + esc(nc.newAddress) + '" oninput="RT.setNew(\'newAddress\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">City</div><input id="nc-newCity" value="' + esc(nc.newCity) + '" oninput="RT.setNew(\'newCity\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Email (optional)</div><input id="nc-newEmail" type="email" value="' + esc(nc.newEmail) + '" oninput="RT.setNew(\'newEmail\', this.value)"></label>' +
          '<button class="btn"' + (nc.newName.trim() && nc.newPhone.trim() && nc.newAddress.trim() ? "" : " disabled") + ' ' + act("ncNext") + ">Next · Confirm</button>";
      } else {
        body = '<div class="search">' + icon("search", 16) + '<input id="nc-q" type="search" placeholder="Search name, address, or phone" value="' + esc(nc.custQuery) + '" oninput="RT.setCustQuery(this.value)"></div>' +
          (none ? '<button class="btn accent" style="margin-bottom:12px" ' + act("ncAddQuery") + ">Add “" + esc(nc.custQuery.trim()) + "” as a new customer</button>" : "") +
          '<button class="dash" style="margin-bottom:12px" ' + act("ncNewCust") + ">New customer</button>" +
          '<div class="stack">' + matches.map(function (c) {
            const on = nc.customerId === c.id;
            const eq = c.equipment[0];
            return '<button class="list-card' + (on ? " sel" : "") + '" style="border:1.5px solid ' + (on ? TEAL : "transparent") + '" ' + act("pickCust", c.id) + ">" +
              '<div class="job-body"><div class="job-name" style="margin-top:0">' + esc(c.name) + "</div><div class=\"muted\">" + esc(c.address) + ", " + esc(c.city) + "</div><div class=\"muted\">" + esc(c.phone) + "</div>" +
              (eq ? '<div class="meta" style="margin-top:4px">' + esc(eq.name) + "</div>" : "") + "</div></button>";
          }).join("") + "</div>" +
          (nc.customerId ? '<div style="height:12px"></div><button class="btn" ' + act("ncNext") + ">Next · Confirm</button>" : "");
      }
      return backdrop(head + body);
    }
    const report = reportText(nc.chips, nc.detail, nc.urgency);
    let custName, custAddr, custPhone;
    if (nc.isNew) {
      custName = nc.newName; custAddr = nc.newAddress + ", " + nc.newCity; custPhone = nc.newPhone;
    } else {
      const c = state.customers.find(function (x) { return x.id === nc.customerId; });
      custName = c ? c.name : "—"; custAddr = c ? c.address + ", " + c.city : "—"; custPhone = c ? c.phone : "—";
    }
    return backdrop(head +
      '<div class="panel" style="margin-bottom:12px;box-shadow:none;background:var(--field)">' +
      '<div class="k-up">Next job</div><div class="h1" style="margin:4px 0">#' + jobId + "</div>" +
      '<div class="h2">' + esc(custName) + "</div><div class=\"muted\">" + esc(custAddr) + "</div><div class=\"teal\">" + esc(custPhone) + "</div>" +
      '<div style="margin-top:10px">' + esc(report) + "</div></div>" +
      '<button class="btn accent" ' + act("createJob") + ">Create job</button>");
  }

  function noteSheet() {
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Add a note</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<label class="field"><div class="field-lab">Note</div><textarea id="note-body" rows="4" placeholder="What did you see or do?" oninput="RT.setNote(this.value)"></textarea></label>' +
      '<button class="btn" ' + act("saveNote") + ">Save note</button>");
  }
  function photoSheet() {
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Add a photo</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="photo-ph">' + icon("photo", 28) + "<span>Camera stays on the phone in the real app</span></div>" +
      '<button class="btn" ' + act("savePhoto") + ">Add sample photo</button>");
  }
  function askSheet(job) {
    const q = "What should I check first?";
    const a = "I'd start with the complaint, then a first set of readings and a look at the obvious parts (filter, cap, igniter, or fan). Capture a Job Link screenshot or log the readings here, and I can help you read them.";
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Ask ReliaTech</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">Sample conversation for job ' + job.id + "</div>" +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px"><div class="bubble-me">' + esc(q) + '</div><div class="bubble-bot">' + esc(a) + "</div></div>" +
      '<div class="muted">In the real app this would be your ReliaTech bot, with the job, readings, and Drive records in context.</div>');
  }
  function approvalSheet(job) {
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Send for approval</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">Estimate ' + esc(job.estimateId || (job.id + "-E01")) + " for " + money(job.total) + " would go to " + esc(job.customer) + " for approval. This mockup doesn’t send anything.</div>" +
      '<button class="btn" ' + act("closeSheet") + ">Got it</button>");
  }
  function invoiceSheet(job) {
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Make invoice</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="doc"><div class="k-up">Invoice ' + job.id + "-01</div><div class=\"h2\" style=\"margin:6px 0\">" + esc(job.customer) + "</div>" +
      (job.lineItems || []).map(function (l) { return '<div class="row" style="margin-top:6px"><div>' + esc(l.label) + "</div><div>" + money(l.amount) + "</div></div>"; }).join("") +
      '<div class="row" style="margin-top:10px;font-weight:750"><div>Total</div><div>' + money(job.total) + "</div></div></div>" +
      '<button class="btn teal" ' + act("makeInvoice") + ">Create invoice</button>");
  }
  function paidSheet(job) {
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Mark paid</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">Mark invoice ' + esc(job.invoiceId || (job.id + "-01")) + " for " + money(job.total) + " as paid. This mockup doesn’t collect a payment.</div>" +
      '<button class="btn accent" ' + act("markPaid") + ">Mark paid</button>");
  }
  function savedSheet() {
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Saved</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">Captured on this job. In the real app this would be stored with the job records in Drive.</div>' +
      '<button class="btn" ' + act("closeSheet") + ">Done</button>");
  }

  function readingSheet(job) {
    const d = state.readingDraft;
    const fields = FIELDS[d.mode];
    const ev = evaluateValues(d.mode, flagAll(d.mode, Object.keys(d.values).reduce(function (o, k) { o[k] = rv(d.values[k], ""); return o; }, {})));
    const groups = [];
    fields.forEach(function (f) {
      const last = groups[groups.length - 1];
      if (!last || last.g !== f[3]) groups.push({ g: f[3], fields: [f] });
      else last.fields.push(f);
    });
    const labels = LABEL_CHIPS[d.mode] || LABEL_CHIPS.cooling;
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Add readings</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="chips">' +
        '<button class="chip teal' + (d.mode === "cooling" ? " on" : "") + '" ' + act("readMode", "cooling") + ">Cooling</button>" +
        '<button class="chip teal' + (d.mode === "furnace" ? " on" : "") + '" ' + act("readMode", "furnace") + ">Heating · furnace</button>" +
        '<button class="chip teal' + (d.mode === "heatPumpHeat" ? " on" : "") + '" ' + act("readMode", "heatPumpHeat") + ">Heating · heat pump</button>" +
      "</div>" +
      '<div class="chips">' + labels.map(function (l) {
        return '<button class="chip' + (d.label === l ? " on" : "") + '" ' + act("readLabelChip", l) + ">" + esc(l) + "</button>";
      }).join("") + "</div>" +
      '<label class="field"><div class="field-lab">Set label</div><input id="rd-label" value="' + esc(d.label) + '" oninput="RT.setReadLabel(this.value)"></label>' +
      '<button class="dash" style="margin-bottom:12px" ' + act("addScreenshot") + ">Add Job Link screenshot</button>" +
      (d.fromScreenshot ? '<div style="display:flex;gap:10px;margin-bottom:12px">' + shot() + '<div class="muted" style="font-size:12px">Sample values filled as if ReliaTech read a Job Link screenshot. You can edit any field.</div></div>' : "") +
      evalCard(ev) +
      groups.map(function (g) {
        return '<div class="section">' + esc(g.g) + "</div>" + g.fields.map(function (f) {
          return '<label class="field"><div class="field-lab">' + esc(f[1]) + (f[2] ? " (" + f[2] + ")" : "") + '</div><input value="' + esc(d.values[f[0]] || "") + '" oninput="RT.setReadVal(\'' + f[0] + '\', this.value)"></label>';
        }).join("");
      }).join("") +
      '<button class="btn" ' + act("saveReading") + ">Save reading set</button>");
  }

  function fullSetSheet(job, set) {
    const fields = FIELDS[set.mode];
    const groups = [];
    fields.forEach(function (f) {
      const last = groups[groups.length - 1];
      if (!last || last.g !== f[3]) groups.push({ g: f[3], fields: [f] });
      else last.fields.push(f);
    });
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + esc(set.label) + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="meta" style="margin-bottom:10px">' + esc(set.time) + " · " + esc(MODE_META[set.mode].label) + (set.hasScreenshot ? " · from screenshot" : "") + "</div>" +
      (set.hasScreenshot ? '<div style="display:flex;gap:10px;margin-bottom:12px">' + shot() + '<div class="muted" style="font-size:12px">Sample Job Link screenshot.</div></div>' : "") +
      evalCard(set.evaluation) +
      groups.map(function (g) {
        return '<div class="section">' + esc(g.g) + '</div><div class="val-grid">' + g.fields.map(function (f) { return valueBox(f[1], set.values[f[0]]); }).join("") + "</div>";
      }).join(""));
  }

  function compareSheet(job) {
    const sets = job.readingSets || [];
    const ids = state.compareIds.length ? state.compareIds : sets.slice(0, 2).map(function (s) { return s.id; });
    const chosen = ids.map(function (id) { return sets.find(function (s) { return s.id === id; }); }).filter(Boolean);
    const mode = chosen[0] ? chosen[0].mode : "cooling";
    const fields = FIELDS[mode];
    const cols = chosen.length;
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Compare sets</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="chips">' + sets.filter(function (s) { return s.mode === mode; }).map(function (s) {
        const on = ids.indexOf(s.id) !== -1;
        return '<button class="chip' + (on ? " on" : "") + '" ' + act("toggleCompare", s.id) + ">" + esc(s.label) + "</button>";
      }).join("") + "</div>" +
      (chosen.length < 2 ? '<div class="muted">Pick at least two sets in the same mode to compare.</div>' :
        '<div class="compare"><div class="compare-grid" style="grid-template-columns:minmax(90px,1.2fr) repeat(' + cols + ', minmax(70px,1fr))">' +
        '<div class="meta" style="padding:6px">Field</div>' + chosen.map(function (s) { return '<div class="meta" style="padding:6px">' + esc(s.label) + "</div>"; }).join("") +
        fields.map(function (f) {
          const vals = chosen.map(function (s) { return displayVal(s.values[f[0]]); });
          const changed = vals.some(function (v) { return v !== vals[0]; });
          return '<div style="padding:6px;font-size:12px" class="' + (changed ? "changed" : "") + '">' + esc(f[1]) + "</div>" +
            chosen.map(function (s) {
              const r = s.values[f[0]];
              return '<div style="padding:6px;font-size:12px;font-weight:650" class="' + (changed ? "changed" : "") + '">' + esc(displayVal(r)) + "</div>";
            }).join("");
        }).join("") + "</div></div>"));
  }

  function priceBookSheet(job) {
    const q = state.packQuery.trim().toLowerCase();
    const tab = state.packTab;
    let items = PRICE_BOOK.filter(function (p) {
      const kindOk = tab === "repair" ? p.kind === "repair" : (p.kind === "package" || p.kind === "addon");
      const tonsOk = p.kind !== "package" || p.tons === state.packTons;
      const hit = !q || [p.name, p.detail || ""].join(" ").toLowerCase().indexOf(q) !== -1;
      return kindOk && tonsOk && hit;
    });
    const total = draftTotal(state.packDraft);
    function lineRow(l, i) {
      return '<div class="row" style="margin-bottom:8px"><div style="min-width:0"><div style="font-weight:650;font-size:13px">' + esc(l.label) + '</div><div class="meta">From price book' + (l.unit === "lb" ? " · per lb" : "") + "</div></div>" +
        '<div class="qty"><button ' + act("qty", i + "|-") + ">−</button><span style=\"min-width:16px;text-align:center;font-weight:700\">" + l.qty + "</span><button " + act("qty", i + "|+") + ">+</button></div>" +
        "<div style=\"font-weight:700;min-width:64px;text-align:right\">" + money(l.amount * l.qty) + "</div></div>";
    }
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Price book</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:10px">' + PRICE_BOOK_NOTE + '</div>' +
      (state.packDraft.length ? '<div class="cart"><div class="k-up">This estimate</div>' + state.packDraft.map(lineRow).join("") + '<div class="row" style="font-weight:750;margin-top:6px"><div>Total</div><div>' + money(total) + "</div></div></div>" : "") +
      '<div class="search">' + icon("search", 16) + '<input id="pack-q" type="search" placeholder="Search the price book" value="' + esc(state.packQuery) + '" oninput="RT.setPackQ(this.value)"></div>' +
      '<div class="chips"><button class="chip' + (tab === "repair" ? " on" : "") + '" ' + act("packTab", "repair") + ">Repairs</button><button class=\"chip" + (tab === "replace" ? " on" : "") + '" ' + act("packTab", "replace") + ">Replacements</button></div>" +
      (tab === "replace" ? '<div class="chips">' + [2, 2.5, 3, 3.5, 4, 5].map(function (t) { return '<button class="chip teal' + (state.packTons === t ? " on" : "") + '" ' + act("packTons", String(t)) + ">" + t + "-ton</button>"; }).join("") + "</div>" : "") +
      items.map(function (p) {
        const tier = p.tier ? TIER[p.tier] : null;
        return '<div class="book-item"><button ' + act("addItem", p.id) + '><div class="row"><div style="font-weight:750">' + esc(p.name) + "</div><div style=\"font-weight:750\">" + money(p.price) + (p.unit ? "<span class=\"meta\">/" + p.unit + "</span>" : "") + "</div></div>" +
          (p.detail ? '<div class="muted" style="margin-top:2px">' + esc(p.detail) + "</div>" : "") +
          ((tier || p.tag) ? '<div style="margin-top:6px">' + pill(tier ? tier.label : p.tag, "#fff", tier ? tier.color : "#148A8A") + "</div>" : "") +
          "</button></div>";
      }).join("") +
      (state.packDraft.length ? '<button class="btn accent" style="margin-top:8px" ' + act("previewEst") + ">Preview estimate</button>" : ""));
  }

  function estimatePreviewSheet(job) {
    const lines = state.packDraft;
    const total = draftTotal(lines);
    const estId = job.estimateId || (job.id + "-E01");
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Estimate ' + esc(estId) + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="doc"><div class="k-up">ReliaTech Services · sample</div><div class="h2" style="margin:6px 0">' + esc(job.customer) + "</div>" +
      '<div class="muted" style="margin-bottom:10px">' + esc(job.address) + ", " + esc(job.city) + "</div>" +
      lines.map(function (l) { return '<div class="row" style="margin-top:6px"><div>' + esc(draftLabel(l)) + '<div class="meta">From price book</div></div><div>' + money(l.amount * l.qty) + "</div></div>"; }).join("") +
      '<div class="row" style="margin-top:12px;font-weight:750"><div>Total</div><div>' + money(total) + "</div></div></div>" +
      '<div class="note">' + PRICE_BOOK_NOTE + ' This preview stays on the phone and is not sent.</div>' +
      '<button class="btn" style="margin-top:12px" ' + act("saveEstimate") + ">Save estimate to job</button>");
  }

  function sheetHtml() {
    const s = state.sheet;
    if (!s) return "";
    if (s === "newCall") return newCallSheet();
    const job = getJob(state.openJobId);
    if (s === "note") return noteSheet();
    if (s === "photo") return photoSheet();
    if (s === "reading") return job ? readingSheet(job) : "";
    if (s === "ask") return job ? askSheet(job) : "";
    if (s === "approval") return job ? approvalSheet(job) : "";
    if (s === "invoice") return job ? invoiceSheet(job) : "";
    if (s === "paid") return job ? paidSheet(job) : "";
    if (s === "saved") return savedSheet();
    if (s === "priceBook") return job ? priceBookSheet(job) : "";
    if (s === "estimatePreview") return job ? estimatePreviewSheet(job) : "";
    if (s === "fullSet") {
      const set = job && (job.readingSets || []).find(function (x) { return x.id === state._setId; });
      return job && set ? fullSetSheet(job, set) : "";
    }
    if (s === "compare") return job ? compareSheet(job) : "";
    if (s === "pickJob") {
      return backdrop(
        '<div class="sheet-head"><div class="sheet-title">Pick a job</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
        '<div class="muted" style="margin-bottom:10px">Choose a job to attach this capture.</div>' +
        '<div class="stack">' + state.jobs.map(function (j) {
          return '<button class="list-card" ' + act("pickJobCapture", j.id) + '><div class="job-body"><div class="meta">#' + j.id + '</div><div class="job-name">' + esc(j.customer) + '</div><div class="job-prob">' + esc(j.problem) + "</div></div></button>";
        }).join("") + "</div>");
    }
    return "";
  }

  function mainHtml() {
    if (state.openCustomerId) {
      const c = state.customers.find(function (x) { return x.id === state.openCustomerId; });
      if (c) return customerDetail(c);
    }
    if (state.openJobId) {
      const j = getJob(state.openJobId);
      if (j) return jobDetail(j);
    }
    if (state.tab === "customers") return customersList();
    if (state.tab === "money") return moneyScreen();
    if (state.tab === "capture") return captureScreen();
    return jobsList();
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    const toast = state.toast ? '<div class="toast">' + esc(state.toast) + "</div>" : "";
    root.innerHTML = mainHtml() + sheetHtml() + toast;
  }

  function handle(name, arg) {
    if (name === "tab") { state.tab = arg; state.openJobId = null; state.openCustomerId = null; state.query = ""; render(); return; }
    if (name === "filter") { state.filter = arg; render(); return; }
    if (name === "openJob") { state.openJobId = arg; state.openCustomerId = null; render(); return; }
    if (name === "closeJob") { state.openJobId = null; render(); return; }
    if (name === "openCustomer") { state.openCustomerId = arg; render(); return; }
    if (name === "closeCustomer") { state.openCustomerId = null; render(); return; }
    if (name === "closeSheet") { closeSheet(); return; }
    if (name === "sheet") { state.sheet = arg; if (arg === "reading") { const j = getJob(state.openJobId); state.readingDraft = { mode: defaultMode(j), label: "Arrival", values: {}, fromScreenshot: false }; } render(); return; }
    if (name === "openNewCall") {
      state.sheet = "newCall"; state.newCallStep = 1;
      state.newCall = { chips: [], detail: "", urgency: "today", customerId: "", isNew: false, newName: "", newPhone: "", newAddress: "", newCity: "Long Beach", newEmail: "", custQuery: "" };
      render(); return;
    }
    if (name === "toggleChip") {
      const chips = state.newCall.chips.slice();
      const i = chips.indexOf(arg);
      if (i === -1) chips.push(arg); else chips.splice(i, 1);
      state.newCall.chips = chips; render(); return;
    }
    if (name === "urgency") { state.newCall.urgency = arg; render(); return; }
    if (name === "ncNext") {
      if (state.newCallStep === 1) state.newCallStep = 2;
      else if (state.newCallStep === 2) state.newCallStep = 3;
      render(); return;
    }
    if (name === "ncNewCust") { state.newCall.isNew = true; state.newCall.customerId = ""; render(); return; }
    if (name === "ncBackList") { state.newCall.isNew = false; render(); return; }
    if (name === "ncAddQuery") { state.newCall.isNew = true; state.newCall.newName = state.newCall.custQuery.trim(); render(); return; }
    if (name === "pickCust") { state.newCall.customerId = arg; state.newCall.isNew = false; render(); return; }
    if (name === "createJob") {
      const nc = state.newCall;
      const id = nextJobId(state.jobs);
      let customerId = nc.customerId, customer, address, city, phone;
      if (nc.isNew) {
        customerId = nextCustomerId();
        customer = nc.newName.trim(); address = nc.newAddress.trim(); city = nc.newCity.trim() || "Long Beach"; phone = nc.newPhone.trim();
        state.customers = [{ id: customerId, name: customer, address: address, city: city, phone: phone, equipment: [] }].concat(state.customers);
      } else {
        const c = state.customers.find(function (x) { return x.id === customerId; });
        customer = c.name; address = c.address; city = c.city; phone = c.phone;
      }
      const problem = reportText(nc.chips, nc.detail, nc.urgency);
      const job = { id: id, customerId: customerId, customer: customer, address: address, city: city, phone: phone, problem: problem, status: "new", lineItems: [{ label: "Diagnostic", amount: 150 }], total: 150, readingSets: [], timeline: [t("t" + id, "call", "Just now", "Call", problem)] };
      state.jobs = [job].concat(state.jobs);
      state.sheet = null; state.openJobId = null; state.tab = "jobs"; state.filter = "all";
      showToast("Job " + id + " created · New call");
      return;
    }
    if (name === "saveNote") {
      const job = getJob(state.openJobId); if (!job) return;
      const body = (state._note || "").trim() || "Note captured on site.";
      job.timeline = [{ id: "n" + Date.now(), kind: "note", time: "Just now", title: "Note", body: body }].concat(job.timeline);
      state._note = ""; state.sheet = "saved"; render(); return;
    }
    if (name === "savePhoto") {
      const job = getJob(state.openJobId); if (!job) return;
      job.timeline = [{ id: "p" + Date.now(), kind: "photo", time: "Just now", title: "Photo", body: "Sample photo added to this job." }].concat(job.timeline);
      state.sheet = "saved"; render(); return;
    }
    if (name === "readMode") { state.readingDraft.mode = arg; state.readingDraft.values = {}; state.readingDraft.fromScreenshot = false; if ((LABEL_CHIPS[arg] || []).indexOf(state.readingDraft.label) === -1) state.readingDraft.label = "Arrival"; render(); return; }
    if (name === "readLabelChip") { state.readingDraft.label = arg; render(); return; }
    if (name === "addScreenshot") {
      const demo = DEMO[state.readingDraft.mode] || DEMO.cooling;
      state.readingDraft.values = Object.assign({}, demo);
      state.readingDraft.fromScreenshot = true;
      render(); return;
    }
    if (name === "saveReading") {
      const job = getJob(state.openJobId); if (!job) return;
      const d = state.readingDraft;
      const raw = {};
      Object.keys(d.values).forEach(function (k) { if (String(d.values[k]).trim()) raw[k] = rv(d.values[k], "", "ok", d.fromScreenshot); });
      const values = flagAll(d.mode, raw);
      const ev = evaluateValues(d.mode, values);
      const set = { id: "rs-" + job.id + "-" + Date.now(), label: d.label || "Reading", time: "Just now", mode: d.mode, hasScreenshot: d.fromScreenshot, values: values, evaluation: ev };
      job.readingSets = (job.readingSets || []).concat([set]);
      job.timeline = [{ id: "r" + Date.now(), kind: "reading", time: "Just now", title: "Readings · " + set.label, body: ev.summary }].concat(job.timeline);
      state.sheet = "saved"; render(); return;
    }
    if (name === "openSet") {
      const parts = arg.split("|"); state.openJobId = parts[0]; state._setId = parts[1]; state.sheet = "fullSet"; render(); return;
    }
    if (name === "openCompare") { state.openJobId = arg; state.compareIds = []; state.sheet = "compare"; render(); return; }
    if (name === "toggleCompare") {
      const ids = state.compareIds.slice();
      const i = ids.indexOf(arg);
      if (i === -1) ids.push(arg); else ids.splice(i, 1);
      state.compareIds = ids; render(); return;
    }
    if (name === "openPriceBook") { state.packTab = "repair"; state.packQuery = ""; state.packTons = 3; state.packDraft = []; state.sheet = "priceBook"; render(); return; }
    if (name === "packTab") { state.packTab = arg; render(); return; }
    if (name === "packTons") { state.packTons = Number(arg); render(); return; }
    if (name === "addItem") {
      const p = PRICE_BOOK.find(function (x) { return x.id === arg; }); if (!p) return;
      const existing = state.packDraft.find(function (l) { return l.id === p.id; });
      if (existing) existing.qty += 1;
      else state.packDraft = state.packDraft.concat([{ id: p.id, label: p.name, amount: p.price, qty: 1, unit: p.unit }]);
      render(); return;
    }
    if (name === "qty") {
      const parts = arg.split("|"); const i = Number(parts[0]); const dir = parts[1];
      const lines = state.packDraft.slice();
      if (!lines[i]) return;
      lines[i] = Object.assign({}, lines[i], { qty: lines[i].qty + (dir === "+" ? 1 : -1) });
      state.packDraft = lines.filter(function (l) { return l.qty > 0; });
      render(); return;
    }
    if (name === "previewEst") { if (state.packDraft.length) { state.sheet = "estimatePreview"; render(); } return; }
    if (name === "saveEstimate") {
      const job = getJob(state.openJobId); if (!job) return;
      const lines = state.packDraft;
      job.lineItems = lines.map(function (l) { return { label: draftLabel(l), amount: l.amount * l.qty }; });
      job.total = draftTotal(lines);
      job.estimateId = job.estimateId || (job.id + "-E01");
      if (job.status === "new" || job.status === "diagnosis") job.status = "estimate";
      job.timeline = [{ id: "e" + Date.now(), kind: "system", time: "Just now", title: "Estimate saved", body: "Estimate " + job.estimateId + " for " + money(job.total) + " saved from the price book." }].concat(job.timeline);
      state.sheet = null;
      showToast("Estimate " + job.estimateId + " saved");
      return;
    }
    if (name === "makeInvoice") {
      const job = getJob(state.openJobId); if (!job) return;
      job.invoiceId = job.invoiceId || (job.id + "-01");
      job.status = "invoiced";
      job.timeline = [{ id: "i" + Date.now(), kind: "system", time: "Just now", title: "Invoice sent", body: "Invoice " + job.invoiceId + " for " + money(job.total) + "." }].concat(job.timeline);
      state.sheet = null; showToast("Invoice " + job.invoiceId + " created"); return;
    }
    if (name === "markPaid") {
      const job = getJob(state.openJobId); if (!job) return;
      job.status = "paid";
      job.timeline = [{ id: "pay" + Date.now(), kind: "system", time: "Just now", title: "Paid", body: "Invoice " + (job.invoiceId || (job.id + "-01")) + " marked paid, " + money(job.total) + "." }].concat(job.timeline);
      state.sheet = null; showToast("Marked paid · sample only"); return;
    }
    if (name === "captureNeedJob") { state._pendingCapture = arg; state.sheet = "pickJob"; render(); return; }
    if (name === "pickJobCapture") {
      state.openJobId = arg; state.openCustomerId = null;
      const kind = state._pendingCapture || "note";
      if (kind === "reading") { const j = getJob(arg); state.readingDraft = { mode: defaultMode(j), label: "Arrival", values: {}, fromScreenshot: false }; }
      state.sheet = kind; render(); return;
    }
  }

  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-act]");
    if (!t) {
      if (e.target.id === "backdrop") closeSheet();
      return;
    }
    e.preventDefault();
    handle(t.getAttribute("data-act"), t.getAttribute("data-arg") || "");
  });

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  }
  render();
})();
