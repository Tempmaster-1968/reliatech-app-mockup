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
  function reliaTechJobNum(id) {
    const n = Number(id);
    /* ReliaTech jobs start at 25076. Historical Housecall Pro jobs are 55xxx (and a few 25062–25075 estimates). */
    return (Number.isFinite(n) && n >= 25076 && n < 50000) ? n : 0;
  }
  function nextJobId(jobs) {
    const lists = (jobs || []).concat((state && state.moneyJobs) ? state.moneyJobs : []);
    const maxRt = lists.reduce(function (m, j) { return Math.max(m, reliaTechJobNum(j.id)); }, 25075);
    return String(maxRt + 1);
  }
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

  const EQUIPMENT_TYPES = [
    { id: "furnace", label: "Furnace / air handler" },
    { id: "coil", label: "Evaporator coil" },
    { id: "condenser", label: "Condenser / heat pump" },
    { id: "thermostat", label: "Thermostat" },
    { id: "minisplit", label: "Mini split" },
    { id: "other", label: "Other" }
  ];
  const EQUIPMENT_LOCATIONS = ["Attic", "Garage", "Side yard", "Closet", "Roof", "Crawlspace", "Laundry", "Other"];
  const STORE_KEY = "reliatech-app-state-v1";

  function equipmentTypeLabel(a) {
    if (!a) return "Equipment";
    if (a.type === "other" && a.typeOther) return a.typeOther;
    const t = EQUIPMENT_TYPES.find(function (x) { return x.id === a.type; });
    return t ? t.label : (a.type || "Equipment");
  }
  function assetTitle(a) {
    const mm = [a.make, a.model].filter(Boolean).join(" · ");
    return mm ? equipmentTypeLabel(a) + " · " + mm : equipmentTypeLabel(a);
  }
  function assetSub(a) {
    const parts = [];
    if (a.capacity) parts.push(a.capacity);
    if (a.refrigerant) parts.push(a.refrigerant);
    if (a.location) parts.push(a.location);
    if (a.serial) parts.push("S/N " + a.serial);
    if (a.filterSize) parts.push("Filter " + a.filterSize);
    return parts.join(" · ");
  }
  function emptyAsset() {
    return {
      id: "a" + Date.now(),
      type: "furnace",
      typeOther: "",
      make: "",
      model: "",
      serial: "",
      installDate: "",
      manufactureDate: "",
      capacity: "",
      refrigerant: "",
      filterSize: "",
      location: "",
      warranty: "",
      notes: "",
      photo: "",
      sample: false
    };
  }
  function isAssetShape(e) {
    return !!(e && (e.type || e.make || e.model || e.serial || e.capacity || e.location || e.filterSize || e.refrigerant));
  }
  function normalizeCustomer(c) {
    const copy = JSON.parse(JSON.stringify(c));
    const assets = Array.isArray(copy.assets) ? copy.assets.slice() : [];
    const mentions = Array.isArray(copy.mentions) ? copy.mentions.slice() : [];
    (copy.equipment || []).forEach(function (e) {
      if (!e) return;
      if (isAssetShape(e)) assets.push(e);
      else if (e.name) mentions.push({ name: e.name, detail: e.detail || "From Housecall Pro job or estimate description" });
    });
    copy.assets = assets;
    copy.mentions = mentions;
    delete copy.equipment;
    return copy;
  }
  function customerAssets(c) { return (c && c.assets) ? c.assets : []; }
  function assetPreview(c) {
    const assets = customerAssets(c);
    if (assets.length) return assetTitle(assets[0]) + (assets.length > 1 ? " +" + (assets.length - 1) : "");
    if (c.mentions && c.mentions[0]) return c.mentions[0].name;
    return "";
  }
  function getCustomer(id) { return state.customers.find(function (c) { return c.id === id; }) || null; }

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
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/>',
    mic: '<path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>'
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

  const DEFAULT_TECH = "Steve Seguine";
  const LABOR_RATE = 85;
  const TZ = "America/Los_Angeles";

  function jobTimeEntries(job) { return (job && job.timeEntries) ? job.timeEntries : []; }
  function normalizeJob(j) {
    const copy = JSON.parse(JSON.stringify(j));
    if (!Array.isArray(copy.timeEntries)) copy.timeEntries = [];
    if (!Array.isArray(copy.timeline)) copy.timeline = [];
    return copy;
  }
  function isLaborLine(l) {
    const s = ((l && (l.label || l.name)) || "").toLowerCase();
    return /(tech labor|\blabor\b|\/hr|\bper hour\b|\bhours?\b)/.test(s);
  }
  function isHourlyJob(job) {
    if (!job) return false;
    if (job.billingType === "hourly") return true;
    if (job.billingType === "flat") return false;
    return (job.lineItems || []).some(isLaborLine);
  }
  function showTimeOnInvoice(job) {
    if (!job) return false;
    if (job.showTimeOnInvoice === true) return true;
    if (job.showTimeOnInvoice === false) return false;
    return isHourlyJob(job);
  }
  function billedLaborHours(job) {
    return (job.lineItems || []).reduce(function (s, l) {
      if (!isLaborLine(l)) return s;
      if (l.hours != null && l.hours !== "") return s + Number(l.hours);
      if ((l.unit === "hr" || l.unit === "hour") && l.qty) return s + Number(l.qty);
      if (l.amount) return s + (Number(l.amount) / LABOR_RATE);
      return s;
    }, 0);
  }
  function tzParts(d) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    const map = {};
    fmt.formatToParts(d).forEach(function (p) { map[p.type] = p.value; });
    if (map.hour === "24") map.hour = "00";
    return map;
  }
  function isoNow() { return new Date().toISOString(); }
  function parseStamp(s) {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  function formatDate(s) {
    const d = parseStamp(s); if (!d) return "—";
    const p = tzParts(d);
    return p.month + "/" + p.day + "/" + p.year;
  }
  function formatTime(s) {
    const d = parseStamp(s); if (!d) return "—";
    const p = tzParts(d);
    let h = Number(p.hour); const am = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12; else if (h > 12) h -= 12;
    return h + ":" + p.minute + " " + am;
  }
  function formatDateTime(s) {
    const d = parseStamp(s); if (!d) return "—";
    return formatDate(s) + " " + formatTime(s);
  }
  function formatPrettyDateTime(s) {
    const d = parseStamp(s); if (!d) return String(s || "");
    return new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
  }
  function todayInput() {
    const p = tzParts(new Date());
    return p.year + "-" + p.month + "-" + p.day;
  }
  function toInputValue(s) {
    const d = parseStamp(s); if (!d) return "";
    const p = tzParts(d);
    return p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":" + p.minute;
  }
  function fromInputValue(v) {
    if (!v) return "";
    const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!m) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? "" : d.toISOString();
    }
    const y = +m[1], mo = +m[2], day = +m[3], h = +m[4], mi = +m[5], s = +(m[6] || 0);
    let ms = Date.UTC(y, mo - 1, day, h, mi, s);
    for (let i = 0; i < 3; i++) {
      const p = tzParts(new Date(ms));
      const got = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +(p.second || 0));
      const want = Date.UTC(y, mo - 1, day, h, mi, s);
      if (got === want) break;
      ms -= (got - want);
    }
    return new Date(ms).toISOString();
  }
  function hoursBetween(a, b) {
    const d1 = parseStamp(a), d2 = parseStamp(b);
    if (!d1 || !d2) return 0;
    return Math.max(0, (d2.getTime() - d1.getTime()) / 3600000);
  }
  function formatHours(n) {
    if (n == null || isNaN(n)) return "—";
    const rounded = Math.round(n * 100) / 100;
    return rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1") + " hr";
  }
  function entryHours(e, now) {
    if (!e || !e.clockIn) return 0;
    return hoursBetween(e.clockIn, e.clockOut || (now || new Date()).toISOString());
  }
  function entryFlags(e, now) {
    const flags = [];
    if (!e || !e.clockIn) return flags;
    const nowD = now || new Date();
    const open = !e.clockOut;
    const hrs = entryHours(e, nowD);
    if (hrs >= 10) flags.push(open ? "Open over 10 hours" : "Over 10 hours");
    if (open) {
      const pIn = tzParts(parseStamp(e.clockIn));
      const pNow = tzParts(nowD);
      const inDay = pIn.year + pIn.month + pIn.day;
      const nowDay = pNow.year + pNow.month + pNow.day;
      if (inDay !== nowDay) flags.push("Still open from a previous day");
      else if (Number(pNow.hour) >= 20) flags.push("Still open at the end of the day");
    }
    return flags;
  }
  function openEntryFor(job, tech) {
    return jobTimeEntries(job).find(function (e) { return !e.clockOut && (!tech || e.tech === tech); }) || null;
  }
  function anyOpenEntry(job) { return jobTimeEntries(job).find(function (e) { return e.clockIn && !e.clockOut; }) || null; }
  function completedTimeEntries(job) {
    return jobTimeEntries(job).filter(function (e) { return e.clockIn && e.clockOut; });
  }
  function loggedHours(job) {
    return completedTimeEntries(job).reduce(function (s, e) { return s + entryHours(e); }, 0);
  }
  function hoursMismatch(job) {
    if (!isHourlyJob(job)) return null;
    const billed = billedLaborHours(job);
    const logged = loggedHours(job);
    if (!billed && !logged) return null;
    if (!logged && billed) return "No completed time on site is logged, but " + formatHours(billed) + " of labor is billed.";
    if (Math.abs(logged - billed) > 0.15) return "Logged time on site is " + formatHours(logged) + ", but billed labor is " + formatHours(billed) + ".";
    return null;
  }
  function formatElapsed(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return (h ? h + ":" : "") + pad(m) + ":" + pad(sec);
  }
  function clockInJob(job, tech, when) {
    if (!job.timeEntries) job.timeEntries = [];
    if (openEntryFor(job, tech)) return { ok: false, msg: tech + " is already clocked in on this job." };
    const entry = { id: "te" + Date.now(), tech: tech, clockIn: when || isoNow(), clockOut: null, edits: [] };
    job.timeEntries.push(entry);
    if (job.status !== "invoiced" && job.status !== "paid") job.status = "progress";
    job.timeline = [{ id: "cin" + Date.now(), kind: "system", time: "Just now", title: "Clocked in", body: tech + " clocked in." }].concat(job.timeline || []);
    return { ok: true, entry: entry };
  }
  function clockOutJob(job, tech, when) {
    const entry = openEntryFor(job, tech) || anyOpenEntry(job);
    if (!entry) return { ok: false, msg: "No open time entry to clock out." };
    entry.clockOut = when || isoNow();
    job.timeline = [{ id: "cout" + Date.now(), kind: "system", time: "Just now", title: "Clocked out", body: entry.tech + " clocked out · " + formatHours(entryHours(entry)) + "." }].concat(job.timeline || []);
    return { ok: true, entry: entry };
  }
  function applyTimeEdit(job, entry, draft, editor) {
    const edits = [];
    function change(field, next) {
      const prev = entry[field] || "";
      const val = next || "";
      if (prev === val) return;
      edits.push({ id: "ed" + Date.now() + field, field: field, oldValue: prev, newValue: val, reason: draft.reason, editedBy: editor, editedAt: isoNow() });
      entry[field] = val || null;
    }
    change("tech", (draft.tech || "").trim());
    change("clockIn", draft.clockIn);
    change("clockOut", draft.clockOut || null);
    if (entry.clockOut && entry.clockIn && parseStamp(entry.clockOut) < parseStamp(entry.clockIn)) {
      return { ok: false, msg: "Depart time can’t be before arrive time." };
    }
    if (!edits.length) return { ok: false, msg: "No changes to save." };
    entry.edits = (entry.edits || []).concat(edits);
    return { ok: true };
  }
  function techNameOf(t) {
    return typeof t === "string" ? t : (t && t.name) || "";
  }
  function defaultTechRec(name) {
    const isSteve = name === DEFAULT_TECH;
    return { name: name, role: isSteve ? "admin" : "independent", canEditOwnTimes: false };
  }
  function normalizeTechRecords(names, savedRecs) {
    const byName = {};
    (savedRecs || []).forEach(function (r) {
      const n = techNameOf(r);
      if (n) byName[n] = Object.assign(defaultTechRec(n), r, { name: n });
    });
    const list = [];
    const seen = {};
    (names || []).forEach(function (n) {
      const name = techNameOf(n);
      if (!name || seen[name]) return;
      seen[name] = true;
      list.push(byName[name] || defaultTechRec(name));
    });
    Object.keys(byName).forEach(function (name) {
      if (!seen[name]) { seen[name] = true; list.push(byName[name]); }
    });
    if (!seen[DEFAULT_TECH]) list.unshift(defaultTechRec(DEFAULT_TECH));
    const steve = list.find(function (r) { return r.name === DEFAULT_TECH; });
    if (steve) { steve.role = "admin"; }
    return list;
  }
  function techNamesFrom(recs) {
    return (recs || []).map(function (r) { return r.name; }).filter(Boolean);
  }
  function getTechRec(name) {
    name = name || DEFAULT_TECH;
    const recs = (typeof state !== "undefined" && state.techRecords) || [];
    return recs.find(function (r) { return r.name === name; }) || defaultTechRec(name);
  }
  function isAdminTech(name) {
    const rec = getTechRec(name || DEFAULT_TECH);
    return rec.role === "admin" || rec.name === DEFAULT_TECH;
  }
  function actingAs() { return (state.currentTech || DEFAULT_TECH); }
  function canEditTimestamps(name, entry) {
    if (isAdminTech(name)) return true;
    const rec = getTechRec(name);
    if (rec.canEditOwnTimes && entry && entry.tech === name) return true;
    return false;
  }
  function pendingOnEntry(entry) {
    return ((entry && entry.corrections) || []).find(function (c) { return c.status === "pending"; }) || null;
  }
  function allPendingCorrections() {
    const out = [];
    (state.jobs || []).forEach(function (job) {
      jobTimeEntries(job).forEach(function (e) {
        (e.corrections || []).forEach(function (c) {
          if (c.status === "pending") out.push({ job: job, entry: e, correction: c });
        });
      });
    });
    return out;
  }
  function correctionSummary(c) {
    if (!c || !c.proposed) return "";
    const p = c.proposed;
    return "Arrive " + (p.clockIn ? formatDateTime(p.clockIn) : "—") + " · Depart " + (p.clockOut ? formatDateTime(p.clockOut) : "—");
  }
  function submitCorrectionRequest(job, entry, draft, requester) {
    const proposed = {
      tech: (draft.tech || entry.tech || "").trim(),
      clockIn: draft.clockIn || null,
      clockOut: draft.clockOut || null
    };
    if (proposed.clockOut && proposed.clockIn && parseStamp(proposed.clockOut) < parseStamp(proposed.clockIn)) {
      return { ok: false, msg: "Depart time can’t be before arrive time." };
    }
    const same = (proposed.tech === (entry.tech || "")) &&
      (proposed.clockIn || "") === (entry.clockIn || "") &&
      (proposed.clockOut || "") === (entry.clockOut || "");
    if (same) return { ok: false, msg: "No changes to request." };
    if (pendingOnEntry(entry)) return { ok: false, msg: "A correction request is already pending on this entry." };
    const rec = {
      id: "cr" + Date.now(),
      requestedBy: requester,
      requestedAt: isoNow(),
      reason: (draft.reason || "").trim(),
      proposed: proposed,
      previous: { tech: entry.tech, clockIn: entry.clockIn || null, clockOut: entry.clockOut || null },
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: ""
    };
    entry.corrections = (entry.corrections || []).concat([rec]);
    job.timeline = [{ id: "crq" + Date.now(), kind: "system", time: "Just now", title: "Time correction requested", body: requester + " asked to change times on this job. Pending Steve’s approval. Reason: " + rec.reason }].concat(job.timeline || []);
    return { ok: true, correction: rec };
  }
  function reviewCorrection(job, entry, correctionId, decision, reviewer, note) {
    const rec = (entry.corrections || []).find(function (c) { return c.id === correctionId; });
    if (!rec || rec.status !== "pending") return { ok: false, msg: "That request is no longer pending." };
    rec.status = decision;
    rec.reviewedBy = reviewer;
    rec.reviewedAt = isoNow();
    rec.reviewNote = (note || "").trim();
    if (decision === "approved") {
      const res = applyTimeEdit(job, entry, {
        tech: rec.proposed.tech,
        clockIn: rec.proposed.clockIn,
        clockOut: rec.proposed.clockOut,
        reason: "Approved correction request from " + rec.requestedBy + ": " + rec.reason + (rec.reviewNote ? " Review note: " + rec.reviewNote : "")
      }, reviewer);
      if (!res.ok) {
        rec.status = "pending";
        rec.reviewedBy = null;
        rec.reviewedAt = null;
        rec.reviewNote = "";
        return res;
      }
      job.timeline = [{ id: "cra" + Date.now(), kind: "system", time: "Just now", title: "Time correction approved", body: reviewer + " approved " + rec.requestedBy + "’s request." }].concat(job.timeline || []);
    } else {
      job.timeline = [{ id: "crr" + Date.now(), kind: "system", time: "Just now", title: "Time correction rejected", body: reviewer + " rejected " + rec.requestedBy + "’s request." + (rec.reviewNote ? " Note: " + rec.reviewNote : "") }].concat(job.timeline || []);
    }
    return { ok: true };
  }

  function emptyNoteDraft(type) {
    type = type || "visit";
    return {
      type: type,
      visitDate: todayInput(),
      checkIn: "",
      findings: "",
      work: "",
      readings: { pressures: "", temps: "", shsc: "", static: "", amps: "", gas: "", caveats: "" },
      recs: [{ text: "", reason: "" }],
      leftover: "",
      departure: "All systems operating on departure.",
      filterSize: "",
      filterDate: todayInput(),
      prevFilterDate: "",
      tasks: "",
      maintReadings: "",
      scopeDesc: "",
      included: "",
      exclusions: "",
      assumptions: "",
      nameplate: { make: "", model: "", serial: "", refrigerant: "", filterSize: "", photo: "", type: "furnace" }
    };
  }
  function formatVisitNote(d) {
    const recs = (d.recs || []).filter(function (r) { return (r.text || "").trim(); });
    const r = d.readings || {};
    const readingLines = [];
    function addR(lab, val) { if (String(val || "").trim()) readingLines.push(lab + ": " + String(val).trim()); }
    addR("Pressures", r.pressures);
    addR("Temps", r.temps);
    addR("SH/SC", r.shsc);
    addR("Static", r.static);
    addR("Amps", r.amps);
    addR("Gas pressure", r.gas);
    if (String(r.caveats || "").trim()) readingLines.push("Not measured / caveats: " + r.caveats.trim());
    const parts = [];
    parts.push((d.visitDate ? formatDate(d.visitDate + "T12:00") : formatDate(isoNow())) + " visit");
    if (d.checkIn) parts.push("Check-in: " + d.checkIn.trim());
    if (d.findings) parts.push("Findings: " + d.findings.trim());
    if (d.work) parts.push("Work performed: " + d.work.trim());
    if (readingLines.length) parts.push("Readings: " + readingLines.join("; "));
    if (recs.length) parts.push("Recommendations: " + recs.map(function (x) { return x.text.trim() + (x.reason ? " (reason: " + x.reason.trim() + ")" : ""); }).join("; "));
    if (d.leftover) parts.push("What’s left / return visit: " + d.leftover.trim());
    parts.push(d.departure || "All systems operating on departure.");
    return parts.join("\n\n");
  }
  function formatMaintNote(d) {
    const parts = ["Maintenance visit" + (d.visitDate ? " · " + formatDate(d.visitDate + "T12:00") : "")];
    if (d.filterSize) parts.push("Filter size: " + d.filterSize.trim());
    if (d.filterDate) parts.push("Filter replaced: " + formatDate(d.filterDate + "T12:00"));
    if (d.prevFilterDate) parts.push("Previous filter date: " + formatDate(d.prevFilterDate + "T12:00"));
    if (d.tasks) parts.push("Tasks done: " + d.tasks.trim());
    if (d.maintReadings) parts.push("Readings: " + d.maintReadings.trim());
    if (d.departure) parts.push(d.departure);
    return parts.join("\n\n");
  }
  function formatScopeNote(d) {
    const parts = [];
    if (d.scopeDesc) parts.push("Description: " + d.scopeDesc.trim());
    if (d.included) parts.push("Included in scope: " + d.included.trim());
    if (d.exclusions) parts.push("Exclusions / notes: " + d.exclusions.trim());
    if (d.assumptions) parts.push("Assumptions: " + d.assumptions.trim());
    return parts.join("\n\n") || "Scope";
  }
  function nameplateFilled(np) {
    if (!np) return false;
    return !!(np.make || np.model || np.serial || np.refrigerant || np.filterSize || np.photo);
  }
  function saveNameplateToCustomer(customer, np) {
    if (!customer || !nameplateFilled(np)) return false;
    if (!customer.assets) customer.assets = [];
    const asset = emptyAsset();
    asset.type = np.type || "furnace";
    asset.make = (np.make || "").trim();
    asset.model = (np.model || "").trim();
    asset.serial = (np.serial || "").trim();
    asset.refrigerant = (np.refrigerant || "").trim();
    asset.filterSize = (np.filterSize || "").trim();
    asset.photo = np.photo || "";
    customer.assets.push(asset);
    return true;
  }

  function normalizeName(s) {
    return String(s || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function scoreName(query, name) {
    const q = normalizeName(query), n = normalizeName(name);
    if (!q || !n) return 0;
    if (n === q) return 100;
    if (n.indexOf(q) !== -1 || q.indexOf(n) !== -1) return 90;
    const qt = q.split(" ").filter(function (t) { return t.length > 1; });
    const nt = n.split(" ");
    if (!qt.length) return 0;
    let hits = 0;
    qt.forEach(function (t) {
      if (nt.some(function (x) { return x === t || x.indexOf(t) === 0 || (t.length > 3 && x.indexOf(t) !== -1); })) hits++;
    });
    if (!hits) return 0;
    return 40 + (hits / qt.length) * 50;
  }
  function rankedCustomers(query) {
    return state.customers.map(function (c) { return { c: c, score: scoreName(query, c.name) }; })
      .filter(function (x) { return x.score >= 50; })
      .sort(function (a, b) { return b.score - a.score; });
  }
  function openJobsForCustomer(customerId) {
    return state.jobs.filter(function (j) { return j.customerId === customerId && j.status !== "paid"; });
  }
  function scoreJobWork(work, job) {
    if (!work) return 0;
    return scoreName(work, (job.problem || "") + " " + ((job.lineItems || []).map(function (l) { return l.label; }).join(" ")));
  }
  function pickJobForVoice(customerId, work, contextJob) {
    const opens = openJobsForCustomer(customerId);
    if (contextJob && contextJob.customerId === customerId && contextJob.status !== "paid") {
      if (!work || scoreJobWork(work, contextJob) >= 50 || opens.length === 1) return contextJob;
    }
    if (work) {
      const ranked = opens.map(function (j) { return { j: j, score: scoreJobWork(work, j) }; })
        .filter(function (x) { return x.score >= 50; })
        .sort(function (a, b) { return b.score - a.score; });
      if (ranked.length) return ranked[0].j;
    }
    if (opens.length === 1) return opens[0];
    if (opens.length > 1) return opens[0];
    return null;
  }
  function parseVoiceCommand(text, context) {
    const raw = String(text || "").trim();
    const s = raw.toLowerCase().replace(/[.,!?]/g, " ").replace(/\s+/g, " ").trim();
    if (!s) return { error: "Say or type a command, like “clock me in” or “clock me out.”", raw: raw };
    const contextJob = context && context.job ? context.job : (state.openJobId ? getJob(state.openJobId) : null);
    const contextCust = context && context.customer ? context.customer : (state.openCustomerId ? getCustomer(state.openCustomerId) : null);
    let action = null, customerQuery = "", work = "";
    const startFor = s.match(/^(?:start|start work(?:ing)? on|start a|begin)\s+(.+?)\s+for\s+(.+)$/);
    const clockInFor = s.match(/^(?:clock(?: me| us| him| her| them)? in|set me in progress)(?:\s+(?:for|on|at|with)\s+|\s+)(.+)$/);
    const clockOutFor = s.match(/^(?:clock(?: me| us| him| her| them)? out)(?:\s+(?:of|on|for|at)\s+(.+))?$/);
    if (/^(clock(?: me| us)? out|clock out)$/.test(s) || (clockOutFor && !/clock(?: me| us)? in/.test(s) && /\bclock(?: me| us| him| her| them)? out\b/.test(s))) {
      action = "clockOut";
      if (clockOutFor && clockOutFor[1] && !/^(this|this job)$/.test(clockOutFor[1])) customerQuery = clockOutFor[1];
    } else if (startFor) {
      action = "clockIn";
      work = startFor[1].trim();
      customerQuery = startFor[2].trim();
    } else if (clockInFor && clockInFor[1] && !/^(this|this job|on this|on this job)$/.test(clockInFor[1])) {
      action = "clockIn";
      customerQuery = clockInFor[1].replace(/^(for|on|at|with)\s+/, "").replace(/\s+job$/, "").trim();
    } else if (/clock(?: me| us)? in|set me in progress|clock in/.test(s)) {
      action = "clockIn";
    } else {
      return { error: "I didn’t catch a clock-in or clock-out command. Try “clock me in”, “clock me in for Lewis”, “start AC repair for Lewis”, or “clock me out.”", raw: raw };
    }

    let customer = null, job = null;
    if (customerQuery) {
      const matches = rankedCustomers(customerQuery);
      if (!matches.length) return { error: "I couldn’t find a customer matching “" + customerQuery + ".”", raw: raw, action: action };
      customer = matches[0].c;
    } else if (contextJob) {
      customer = getCustomer(contextJob.customerId) || { id: contextJob.customerId, name: contextJob.customer };
    } else if (contextCust) {
      customer = contextCust;
    }

    if (customer) {
      job = pickJobForVoice(customer.id, work, contextJob);
    } else if (contextJob) {
      job = contextJob;
      customer = getCustomer(contextJob.customerId) || { id: contextJob.customerId, name: contextJob.customer };
    }

    const needsNewJob = !!(customer && !job && action === "clockIn");
    if (!customer && !job) {
      return { error: "I need a job or a customer for that. Open a job, or say “clock me in for [customer].”", raw: raw, action: action };
    }
    if (action === "clockOut" && job && !anyOpenEntry(job) && !openEntryFor(job, state.currentTech)) {
      /* still confirm; the confirm handler will explain if nothing is open */
    }
    return {
      action: action,
      raw: raw,
      tech: state.currentTech || DEFAULT_TECH,
      customer: customer,
      customerId: customer ? customer.id : "",
      customerName: customer ? customer.name : (job ? job.customer : ""),
      job: job,
      jobId: job ? job.id : "",
      problem: job ? job.problem : (work || ""),
      work: work,
      needsNewJob: needsNewJob
    };
  }

  function timeOnSiteTable(job, opts) {
    opts = opts || {};
    const rows = completedTimeEntries(job);
    if (!rows.length) return '<div class="muted">No completed visits to show yet.</div>';
    const total = loggedHours(job);
    return '<table class="tos-table"><thead><tr><th>Date</th><th>Tech</th><th>Arrive</th><th>Depart</th><th>Hours</th></tr></thead><tbody>' +
      rows.map(function (e) {
        return "<tr><td>" + esc(formatDate(e.clockIn)) + "</td><td>" + esc(e.tech) + "</td><td>" + esc(formatTime(e.clockIn)) + "</td><td>" + esc(formatTime(e.clockOut)) + "</td><td>" + esc(formatHours(entryHours(e))) + "</td></tr>";
      }).join("") +
      '</tbody><tfoot><tr><td colspan="4">Total</td><td>' + esc(formatHours(total)) + "</td></tr></tfoot></table>";
  }
  function correctionTrailHtml(entry) {
    const items = entry.corrections || [];
    if (!items.length && !(entry.edits || []).length) return "";
    let html = '<div class="edit-hist"><div class="field-lab">Audit trail (app only — not on the invoice)</div>';
    items.slice().reverse().forEach(function (c) {
      const st = c.status === "pending" ? "Pending" : c.status === "approved" ? "Approved" : "Rejected";
      html += '<div class="muted" style="margin-top:4px">' + esc(formatDateTime(c.requestedAt)) + " · " + esc(c.requestedBy) + " requested: " + esc(correctionSummary(c)) + ". Reason: " + esc(c.reason) + " · " + st;
      if (c.reviewedBy) html += " by " + esc(c.reviewedBy) + (c.reviewedAt ? " " + formatDateTime(c.reviewedAt) : "") + (c.reviewNote ? ". Note: " + esc(c.reviewNote) : "");
      html += "</div>";
    });
    (entry.edits || []).slice().reverse().forEach(function (ed) {
      const fieldLab = ed.field === "clockIn" ? "Arrive" : ed.field === "clockOut" ? "Depart" : "Tech";
      const oldV = ed.field === "tech" ? ed.oldValue : formatDateTime(ed.oldValue);
      const newV = ed.field === "tech" ? ed.newValue : formatDateTime(ed.newValue);
      html += '<div class="muted" style="margin-top:4px">' + esc(formatDateTime(ed.editedAt)) + " · " + esc(ed.editedBy) + " changed " + fieldLab + " from " + esc(oldV || "—") + " to " + esc(newV || "—") + ". Reason: " + esc(ed.reason) + "</div>";
    });
    return html + "</div>";
  }
  function timeSection(job) {
    const entries = jobTimeEntries(job);
    const tech = actingAs();
    const mine = openEntryFor(job, tech);
    const open = mine || anyOpenEntry(job);
    const flags = entries.reduce(function (acc, e) { return acc.concat(entryFlags(e).map(function (f) { return { e: e, f: f }; })); }, []);
    const mismatch = hoursMismatch(job);
    const admin = isAdminTech(tech);
    return '<div class="section-row"><div class="section" style="margin:0">Time on site</div></div>' +
      '<div class="muted" style="margin:0 0 10px">Clock in sets this job to In progress. Independents can clock in and out. Timestamp edits are limited by the acting-as role. Time is saved on this phone only.</div>' +
      '<div class="acting-inline muted" style="margin:0 0 10px">Acting as <strong>' + esc(tech) + "</strong> · " + (admin ? "Admin" : "Independent") + ' · <button class="link-btn" style="margin:0" ' + act("openActingAs") + ">Change</button></div>" +
      (open ? '<div class="timer-card">' +
        '<div class="k-up">Clocked in' + (open.tech ? " · " + esc(open.tech) : "") + "</div>" +
        '<div class="timer" data-timer-start="' + esc(open.clockIn) + '">' + esc(formatElapsed(Date.now() - parseStamp(open.clockIn).getTime())) + "</div>" +
        '<div class="muted">Arrived ' + esc(formatDateTime(open.clockIn)) + "</div></div>" : "") +
      (flags.length ? flags.map(function (x) {
        return '<div class="warn-banner">' + esc(x.f) + " · " + esc(x.e.tech) + (x.e.clockIn ? " · arrived " + formatDateTime(x.e.clockIn) : "") + "</div>";
      }).join("") : "") +
      '<div class="quick" style="margin-top:8px">' +
        (mine ? '<button class="btn accent" ' + act("clockOut") + ">Clock out</button>" :
          '<button class="btn teal" ' + act("clockIn") + ">Clock in</button>") +
      "</div>" +
      (entries.length ? '<div class="stack" style="margin-bottom:14px">' + entries.slice().reverse().map(function (e) {
        const fl = entryFlags(e);
        const pending = pendingOnEntry(e);
        const canEdit = canEditTimestamps(tech, e);
        let actions = "";
        if (pending && admin) {
          actions = '<div class="pending-box"><div class="k-up">Pending correction request</div>' +
            '<div class="muted" style="margin-top:4px">' + esc(pending.requestedBy) + " asked to change this to " + esc(correctionSummary(pending)) + ".</div>" +
            '<div class="muted" style="margin-top:4px">Reason: ' + esc(pending.reason) + "</div>" +
            '<div class="quick" style="margin-top:8px">' +
            '<button class="btn teal" ' + act("approveCorrection", job.id + "|" + e.id + "|" + pending.id) + ">Approve</button>" +
            '<button class="btn ghost" ' + act("rejectCorrection", job.id + "|" + e.id + "|" + pending.id) + ">Reject</button></div></div>";
        } else if (pending) {
          actions = '<div class="pending-box"><div class="k-up">Pending correction request</div>' +
            '<div class="muted" style="margin-top:4px">Waiting for Steve to approve or reject. Proposed: ' + esc(correctionSummary(pending)) + ".</div>" +
            '<div class="muted" style="margin-top:4px">Reason: ' + esc(pending.reason) + "</div></div>";
        } else if (canEdit) {
          actions = '<button class="link-btn" ' + act("editTime", e.id) + ">Edit timestamps</button>";
        } else if (e.tech === tech || admin) {
          actions = '<button class="link-btn" ' + act("requestCorrection", e.id) + ">Request a correction</button>";
        }
        return '<div class="panel time-entry">' +
          '<div class="row"><div class="h2">' + esc(e.tech) + "</div><div class=\"meta\">" + esc(formatHours(entryHours(e))) + "</div></div>" +
          '<div class="muted" style="margin:4px 0">' + esc(formatDate(e.clockIn)) + " · Arrive " + esc(formatTime(e.clockIn)) + " · Depart " + (e.clockOut ? esc(formatTime(e.clockOut)) : "—") + "</div>" +
          (fl.length ? '<div class="warn-inline">' + esc(fl.join(" · ")) + "</div>" : "") +
          actions + correctionTrailHtml(e) + "</div>";
      }).join("") + "</div>" : '<div class="muted" style="margin-bottom:14px">No time entries yet.</div>') +
      (mismatch ? '<div class="warn-banner">' + esc(mismatch) + " This warning stays in the app; it is not printed on the invoice.</div>" : "") +
      '<button class="dash' + (showTimeOnInvoice(job) ? " sel" : "") + '" style="margin-bottom:16px" ' + act("toggleTimeOnInvoice") + ">" +
        (showTimeOnInvoice(job) ? "Time on site will print on this invoice" : "Time on site hidden on this invoice") + ". Default is on for hourly jobs, off for flat-rate." +
      "</button>";
  }

  const INITIAL_CUSTOMERS = (window.RT_DATA && window.RT_DATA.customers) ? window.RT_DATA.customers : [];
  const INITIAL_JOBS = (window.RT_DATA && window.RT_DATA.jobs) ? window.RT_DATA.jobs : [];
  const PAST_JOBS = (window.RT_DATA && window.RT_DATA.moneyJobs) ? window.RT_DATA.moneyJobs : [];
  const SHOW_SAMPLE_BADGE = !!(window.RT_DATA && window.RT_DATA.showSampleBadge);
  const PRICE_BOOK_NOTE = (window.RT_DATA && window.RT_DATA.priceBookNote) || "Prices come from ReliaTech Price Books in Drive.";
  const MONEY_NOTE = (window.RT_DATA && window.RT_DATA.moneyNote) || "";

  /* state and remaining UI will be appended */
  window.__RT_BOOT = { INITIAL_CUSTOMERS: INITIAL_CUSTOMERS, INITIAL_JOBS: INITIAL_JOBS, PAST_JOBS: PAST_JOBS };

  function loadPersisted() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function mergeCustomers(initial, saved) {
    const byId = {};
    initial.forEach(function (c) { byId[c.id] = c; });
    const extraIds = [];
    (saved || []).forEach(function (sc) {
      const n = normalizeCustomer(sc);
      if (byId[n.id]) {
        const base = byId[n.id];
        byId[n.id] = Object.assign({}, base, {
          name: n.name || base.name,
          address: n.address != null ? n.address : base.address,
          city: n.city != null ? n.city : base.city,
          phone: n.phone != null ? n.phone : base.phone,
          email: n.email != null ? n.email : base.email,
          assets: n.assets || [],
          mentions: (n.mentions && n.mentions.length) ? n.mentions : base.mentions
        });
      } else {
        byId[n.id] = n;
        extraIds.push(n.id);
      }
    });
    return initial.map(function (c) { return byId[c.id]; }).concat(extraIds.map(function (id) { return byId[id]; }));
  }
  function mergeJobs(initial, saved) {
    const byId = {};
    initial.forEach(function (j) { byId[j.id] = j; });
    const extra = [];
    (saved || []).forEach(function (sj) {
      if (byId[sj.id]) byId[sj.id] = normalizeJob(sj);
      else extra.push(normalizeJob(sj));
    });
    return extra.concat(initial.map(function (j) { return normalizeJob(byId[j.id]); }));
  }

  const PLAN_SEED = window.RT_PLANS || {};
  const SETTINGS_DEFAULTS = Object.assign({
    weekdayStart: "16:30", weekdayEnd: "20:00",
    saturdayStart: "08:00", saturdayEnd: "18:00",
    sundayOpen: false, timezone: TZ,
    stevePhone: "(562) 487-8750", steveEmail: "steveseguine51@gmail.com"
  }, PLAN_SEED.settingsDefaults || {});
  function mergeById(initial, saved) {
    const byId = {};
    (initial || []).forEach(function (x) { byId[x.id] = JSON.parse(JSON.stringify(x)); });
    const extra = [];
    (saved || []).forEach(function (x) {
      if (!x || !x.id) return;
      if (byId[x.id]) byId[x.id] = Object.assign({}, byId[x.id], x);
      else { byId[x.id] = x; extra.push(x.id); }
    });
    return (initial || []).map(function (x) { return byId[x.id]; }).concat(extra.map(function (id) { return byId[id]; }));
  }

  const _saved = loadPersisted();
  const _initialCustomers = INITIAL_CUSTOMERS.map(normalizeCustomer);
  const _seedPlanJobs = PLAN_SEED.planJobs || [];
  const _initialJobs = INITIAL_JOBS.map(function (j) { return JSON.parse(JSON.stringify(j)); });
  _seedPlanJobs.forEach(function (pj) {
    if (!_initialJobs.some(function (j) { return j.id === pj.id; })) _initialJobs.push(JSON.parse(JSON.stringify(pj)));
  });

  let state = {
    tab: "jobs",
    filter: "open",
    query: "",
    openJobId: null,
    openCustomerId: null,
    sheet: null,
    toast: "",
    jobs: mergeJobs(_initialJobs, _saved && _saved.jobs),
    customers: mergeCustomers(_initialCustomers, _saved && _saved.customers),
    moneyJobs: PAST_JOBS.map((j) => JSON.parse(JSON.stringify(j))),
    newCallStep: 1,
    newCall: { chips: [], detail: "", urgency: "today", customerId: "", isNew: false, fromCustomer: false, newName: "", newPhone: "", newAddress: "", newCity: "Long Beach", newEmail: "", custQuery: "" },
    readingDraft: { mode: "cooling", label: "Arrival", values: {}, fromScreenshot: false },
    assetDraft: emptyAsset(),
    assetEditingId: null,
    currentTech: (_saved && _saved.currentTech) || DEFAULT_TECH,
    techs: (_saved && Array.isArray(_saved.techs) && _saved.techs.length) ? _saved.techs : [DEFAULT_TECH],
    techRecords: [],
    boardMode: "board",
    noteDraft: emptyNoteDraft("visit"),
    timeEdit: null,
    voice: { listening: false, text: "", fallback: false, error: "" },
    voiceConfirm: null,
    _newTech: "",
    clockInAfterCreate: false,
    compareIds: [],
    packTab: "repair",
    packQuery: "",
    packTons: 3,
    packDraft: [],
    plans: mergeById(PLAN_SEED.plans || [], _saved && _saved.plans),
    visits: mergeById(PLAN_SEED.visits || [], _saved && _saved.visits),
    settings: Object.assign({}, SETTINGS_DEFAULTS, (_saved && _saved.settings) || {}),
    showCompleted: !!(!_saved ? false : _saved.showCompleted),
    screen: null,
    scheduleVisitId: null,
    scheduleDraft: { date: "", time: "" }
  };
  state.techRecords = normalizeTechRecords(state.techs, _saved && _saved.techRecords);
  state.techs = techNamesFrom(state.techRecords);
  (function migratePlanData() {
    const forcePlan = (PLAN_SEED.plans || []).find(function (p) { return p.id === "p-doreen-offer"; });
    if (forcePlan) {
      let found = false;
      state.plans = state.plans.map(function (p) {
        if (p.id !== forcePlan.id) return p;
        found = true;
        return Object.assign({}, p, JSON.parse(JSON.stringify(forcePlan)));
      });
      if (!found) state.plans.push(JSON.parse(JSON.stringify(forcePlan)));
    }
    (PLAN_SEED.visits || []).forEach(function (sv) {
      if (sv.id !== "v-doreen-followup" && sv.id !== "v-doreen-2026-aug") return;
      let found = false;
      state.visits = state.visits.map(function (v) {
        if (v.id !== sv.id) return v;
        found = true;
        return Object.assign({}, v, JSON.parse(JSON.stringify(sv)));
      });
      if (!found) state.visits.push(JSON.parse(JSON.stringify(sv)));
    });
    state.jobs = state.jobs.filter(function (j) {
      return j.id !== "25083" || !!j.scheduledStart;
    });
  })();
  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        v: 1,
        customers: state.customers,
        jobs: state.jobs,
        currentTech: state.currentTech,
        techs: state.techs,
        techRecords: state.techRecords,
        plans: state.plans,
        visits: state.visits,
        settings: state.settings,
        showCompleted: false
      }));
    } catch (e) {}
  }
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
    state.voiceConfirm = null;
    if (state.voice) state.voice.listening = false;
    if (recognition) { try { recognition.abort(); } catch (e) {} }
    render();
  }
  function nextCustomerId() {
    const n = state.customers.reduce(function (m, c) { return Math.max(m, Number(c.id.slice(1))); }, 0);
    return "c" + (n + 1);
  }

  function pad2(n) { return String(n).padStart(2, "0"); }
  function todayYmd() {
    const p = tzParts(new Date());
    return p.year + "-" + pad2(p.month) + "-" + pad2(p.day);
  }
  function addDaysYmd(ymd, days) {
    const p = String(ymd || todayYmd()).split("-");
    const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + days);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }
  function visitForJob(jobId) {
    return (state.visits || []).find(function (v) { return v.jobId === jobId; }) || null;
  }
  function planById(id) { return (state.plans || []).find(function (p) { return p.id === id; }) || null; }
  function visitsForCustomer(cid) { return (state.visits || []).filter(function (v) { return v.customerId === cid; }); }
  function plansForCustomer(cid) { return (state.plans || []).filter(function (p) { return p.customerId === cid; }); }
  function visitStatus(v) {
    if (!v) return "upcoming";
    if (v.status === "cancelled" || v.status === "canceled") return "cancelled";
    if (v.status === "done" || v.completedOn) return "done";
    if (v.scheduledStart) {
      const end = parseStamp(v.scheduledEnd || v.scheduledStart);
      if (end && end.getTime() < Date.now() && !v.completedOn) return "overdue";
      return "scheduled";
    }
    if (v.dateUnknown || !v.dueWindowEnd) return "upcoming";
    const today = todayYmd();
    if (today > v.dueWindowEnd) return "overdue";
    const dueFrom = addDaysYmd(v.dueWindowStart || v.dueWindowEnd, -30);
    if (today >= dueFrom) return "due";
    return "upcoming";
  }
  function visitStatusLabel(st) {
    return ({ due: "Due", overdue: "Overdue", scheduled: "Scheduled", done: "Done", upcoming: "Upcoming", cancelled: "Cancelled" })[st] || st;
  }
  function visitBadge(v) {
    const st = visitStatus(v);
    return '<span class="v-badge v-' + st + '">' + esc(visitStatusLabel(st)) + "</span>";
  }
  function visitTagLabel(v, plan) {
    const tags = [];
    if ((v && v.confirmWithSteve) || (plan && plan.confirmWithSteve)) tags.push("Confirm with Steve");
    const tag = (v && v.tag) || (plan && plan.tag) || "";
    if (tag === "install_commitment") tags.push("Install commitment");
    if (tag === "offer_prepaid_annual") tags.push("Offer $225 prepaid annual");
    if (v && v.dateUnknown) tags.push("Date not found — confirm with Steve");
    else if (v && v.needsFollowUp) tags.push("Needs follow-up");
    return tags;
  }
  function bookingUrl(v) {
    if (!v || !v.bookingToken) return "";
    return (PLAN_SEED.bookingBase || "book.html?v=") + v.bookingToken;
  }
  function formatYmd(s) {
    if (!s) return "";
    const p = String(s).split("-");
    if (p.length !== 3) return s;
    const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function formatWindow(v) {
    if (v.dateUnknown) return "No scheduled date found in Housecall Pro";
    if (v.scheduledStart) return formatPrettyDateTime(v.scheduledStart) + " PT";
    if (v.dueWindowStart && v.dueWindowEnd && v.dueWindowStart === v.dueWindowEnd) return "Due " + formatYmd(v.dueWindowStart);
    if (v.dueWindowStart && v.dueWindowEnd) return "Due " + formatYmd(v.dueWindowStart) + " – " + formatYmd(v.dueWindowEnd);
    return "";
  }
  function parseLooseDate(s) {
    if (!s) return null;
    const iso = parseStamp(s);
    if (iso) return iso;
    const t = Date.parse(s);
    return isNaN(t) ? null : new Date(t);
  }
  function jobScheduleIso(job) {
    if (!job) return null;
    if (job.scheduledStart) return job.scheduledStart;
    const v = visitForJob(job.id);
    if (v && v.scheduledStart) return v.scheduledStart;
    const ev = (job.timeline || []).find(function (t) { return t && t.title === "Scheduled" && t.time; });
    return ev ? ev.time : null;
  }
  function jobScheduleDate(job) {
    return parseLooseDate(jobScheduleIso(job));
  }
  function isHcpId(id) {
    const n = Number(id);
    return Number.isFinite(n) && n >= 50000 && n < 60000;
  }
  function linkedOpenVisit(job) {
    const v = visitForJob(job && job.id);
    if (!v) return null;
    const st = visitStatus(v);
    return (st !== "done" && st !== "cancelled") ? v : null;
  }
  function isPastHcpHistory(job) {
    if (!job || !isHcpId(job.id)) return false;
    if (linkedOpenVisit(job)) return false;
    const due = Number(job.dueAmount || 0);
    if (due > 0 && job.status !== "paid" && job.status !== "done") return false;
    if (job.status === "paid" || job.status === "done" || job.status === "cancelled" || job.status === "canceled") return true;
    if (job.status === "estimate" || job.status === "invoiced") return false;
    const d = jobScheduleDate(job);
    const now = new Date();
    if (d && d.getTime() < now.getTime() && due <= 0) return true;
    if (due <= 0 && !job.scheduledStart) {
      const ev = (job.timeline || []).find(function (t) { return t && t.title === "Scheduled" && t.time; });
      const sd = ev ? parseLooseDate(ev.time) : null;
      if (sd && sd.getTime() > now.getTime()) return false;
      return true;
    }
    return false;
  }
  function isCompletedJob(job) {
    if (!job) return true;
    if (job.status === "paid" || job.status === "done" || job.status === "cancelled" || job.status === "canceled") return true;
    return isPastHcpHistory(job);
  }
  function isUpcomingPlanHold(job) {
    if (!job || !job.planJob) return false;
    if (job.scheduledStart) return false;
    const v = visitForJob(job.id);
    if (!v) return false;
    return visitStatus(v) === "upcoming";
  }
  function isActiveJob(job) {
    if (!job) return false;
    if (isCompletedJob(job)) return false;
    if (isUpcomingPlanHold(job)) return false;
    return true;
  }
  const BOARD_DAYS = 14;
  function startOfTodayLocal() {
    const p = tzParts(new Date());
    return new Date(Number(p.year), Number(p.month) - 1, Number(p.day));
  }
  function boardHorizon() {
    return new Date(startOfTodayLocal().getTime() + BOARD_DAYS * 24 * 60 * 60 * 1000);
  }
  function isWithinBoardWindow(d) {
    if (!d) return false;
    return d.getTime() >= startOfTodayLocal().getTime() && d.getTime() < boardHorizon().getTime();
  }
  function ymdToLocalDate(s) {
    if (!s) return null;
    const p = String(s).split("-");
    if (p.length < 3) return null;
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function visitWindowHitsBoard(v) {
    const start = startOfTodayLocal();
    const end = boardHorizon();
    const ws = ymdToLocalDate(v.dueWindowStart);
    const we = ymdToLocalDate(v.dueWindowEnd);
    if (!ws && !we) return false;
    const a = ws || we;
    const b = we || ws;
    const bEnd = new Date(b.getTime() + 24 * 60 * 60 * 1000);
    return bEnd.getTime() > start.getTime() && a.getTime() < end.getTime();
  }
  function visitOnBoardPreview(v) {
    if (!v || v.dateUnknown) return false;
    const st = visitStatus(v);
    if (st === "overdue") return true;
    if (st === "scheduled") return isWithinBoardWindow(parseStamp(v.scheduledStart));
    if (st === "due") return visitWindowHitsBoard(v);
    return false;
  }
  function isInProgressWork(job) {
    if (!job || isCompletedJob(job)) return false;
    if (anyOpenEntry(job)) return true;
    if (job.status !== "progress") return false;
    const v = linkedOpenVisit(job);
    if (v) {
      const st = visitStatus(v);
      if (st === "overdue" || st === "due") return false;
    }
    return true;
  }
  function isBoardJob(job) {
    if (!job || isCompletedJob(job)) return false;
    if (isInProgressWork(job)) return true;
    const d = jobScheduleDate(job);
    if (d && isWithinBoardWindow(d)) return true;
    const v = linkedOpenVisit(job);
    if (v && visitStatus(v) === "scheduled" && isWithinBoardWindow(parseStamp(v.scheduledStart))) return true;
    return false;
  }
  function unpaidBalanceJobs() {
    return (state.jobs || []).filter(function (j) {
      if (Number(j.dueAmount || 0) <= 0) return false;
      if (j.status === "paid" || j.status === "done" || j.status === "cancelled" || j.status === "canceled") return false;
      if (isBoardJob(j)) return false;
      return true;
    }).sort(function (a, b) {
      return String(a.customer).localeCompare(String(b.customer));
    });
  }
  function boardPlanVisits() {
    return (state.visits || []).filter(visitOnBoardPreview).sort(function (a, b) {
      const ra = visitStatus(a) === "overdue" ? 0 : 1;
      const rb = visitStatus(b) === "overdue" ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return String(a.dueWindowStart || a.scheduledStart || "").localeCompare(String(b.dueWindowStart || b.scheduledStart || ""));
    });
  }
  function jobSortGroup(job) {
    if (job.status === "progress" || anyOpenEntry(job)) return 0;
    const d = jobScheduleDate(job);
    if (d && d.getTime() >= Date.now() - 60 * 60 * 1000) return 1;
    const v = linkedOpenVisit(job);
    if (v && visitStatus(v) === "scheduled") return 1;
    return 2;
  }
  function sortJobsList(list) {
    return list.slice().sort(function (a, b) {
      const ga = jobSortGroup(a), gb = jobSortGroup(b);
      if (ga !== gb) return ga - gb;
      if (ga === 1) {
        const da = jobScheduleDate(a), db = jobScheduleDate(b);
        return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
      }
      const va = visitForJob(a.id), vb = visitForJob(b.id);
      const sa = va ? visitStatus(va) : "", sb = vb ? visitStatus(vb) : "";
      const rank = { overdue: 0, due: 1 };
      const ra = rank[sa] != null ? rank[sa] : 2, rb = rank[sb] != null ? rank[sb] : 2;
      if (ra !== rb) return ra - rb;
      return String(a.customer).localeCompare(String(b.customer));
    });
  }
  function attentionVisits() {
    return (state.visits || []).filter(function (v) {
      const st = visitStatus(v);
      return st === "due" || st === "overdue";
    }).sort(function (a, b) {
      const ra = visitStatus(a) === "overdue" ? 0 : 1;
      const rb = visitStatus(b) === "overdue" ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return String(a.dueWindowStart || "").localeCompare(String(b.dueWindowStart || ""));
    });
  }
  function availabilitySummary() {
    const s = state.settings || SETTINGS_DEFAULTS;
    function t(v) {
      const p = (v || "").split(":");
      const h = Number(p[0]), m = Number(p[1] || 0);
      const am = h >= 12 ? "PM" : "AM";
      const h12 = ((h + 11) % 12) + 1;
      return h12 + ":" + pad2(m) + " " + am;
    }
    return "Weekday evenings " + t(s.weekdayStart) + "–" + t(s.weekdayEnd) + " PT, Saturday " + t(s.saturdayStart) + "–" + t(s.saturdayEnd) + " PT" + (s.sundayOpen ? ", Sunday open" : "") + ".";
  }
  function getVisit(id) { return (state.visits || []).find(function (v) { return v.id === id; }) || null; }
  function updateVisit(id, patch) {
    state.visits = (state.visits || []).map(function (v) { return v.id === id ? Object.assign({}, v, patch) : v; });
  }

  window.RT = {
    setQuery: function (v) { state.query = v; renderKeepFocus("search-q"); },
    setCustQuery: function (v) { state.newCall.custQuery = v; renderKeepFocus("nc-q"); },
    setNew: function (k, v) { state.newCall[k] = v; renderKeepFocus("nc-" + k); },
    setDetail: function (v) { state.newCall.detail = v; renderKeepFocus("nc-detail"); },
    setNote: function (v) { state._note = v; },
    setPackQ: function (v) { state.packQuery = v; renderKeepFocus("pack-q"); },
    setReadLabel: function (v) { state.readingDraft.label = v; renderKeepFocus("rd-label"); },
    setReadVal: function (k, v) { state.readingDraft.values[k] = v; },
    setAsset: function (k, v) { state.assetDraft[k] = v; renderKeepFocus("eq-" + k); },
    setAssetPhoto: function (el) {
      const f = el.files && el.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () { state.assetDraft.photo = String(reader.result || ""); render(); };
      reader.readAsDataURL(f);
    },
    setNewTech: function (v) { state._newTech = v; },
    setNoteField: function (k, v) { state.noteDraft[k] = v; },
    setNoteReading: function (k, v) { if (!state.noteDraft.readings) state.noteDraft.readings = {}; state.noteDraft.readings[k] = v; },
    setRec: function (i, k, v) { if (!state.noteDraft.recs[i]) state.noteDraft.recs[i] = { text: "", reason: "" }; state.noteDraft.recs[i][k] = v; },
    setNameplate: function (k, v) { if (!state.noteDraft.nameplate) state.noteDraft.nameplate = emptyNoteDraft().nameplate; state.noteDraft.nameplate[k] = v; renderKeepFocus("np-" + k); },
    setNameplatePhoto: function (el) {
      const f = el.files && el.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () { state.noteDraft.nameplate.photo = String(reader.result || ""); render(); };
      reader.readAsDataURL(f);
    },
    setTimeEdit: function (k, v) { state.timeEdit[k] = v; },
    setVoiceText: function (v) { state.voice.text = v; },
    setSetting: function (k, v) { state.settings[k] = v; renderKeepFocus("st-" + k); },
    setSched: function (k, v) { state.scheduleDraft[k] = v; }
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
      "</div>" +
      (opts.voice === false ? "" : '<button class="icon-btn" ' + act("openVoice") + ' aria-label="Voice command">' + icon("mic") + "</button>") +
      (opts.settings ? '<button class="icon-btn" ' + act("openSettings") + ' aria-label="Settings">' + icon("gear") + "</button>" : "") +
      "</div>";
  }
  function tabBar() {
    const tabs = [["jobs", "Jobs", "jobs"], ["capture", "Capture", "capture"], ["customers", "Customers", "customers"], ["money", "Money", "money"]];
    return '<div class="tabbar">' + tabs.map(function (t) {
      return '<button class="tab' + (state.tab === t[0] ? " on" : "") + '" ' + act("tab", t[0]) + '>' + icon(t[2], 22) + "<span>" + t[1] + "</span></button>";
    }).join("") + "</div>";
  }

  function actingAsBar() {
    const tech = actingAs();
    const pending = isAdminTech(tech) ? allPendingCorrections().length : 0;
    return '<div class="acting-bar"><div class="acting-who">Acting as <strong>' + esc(tech) + "</strong> · " + (isAdminTech(tech) ? "Admin" : "Independent") + "</div>" +
      '<div class="acting-links"><button class="link-btn" style="margin:0" ' + act("openActingAs") + ">Change</button>" +
      (pending ? '<button class="link-btn" style="margin:0" ' + act("openTimeCorrections") + ">Time corrections · " + pending + "</button>" : "") +
      "</div></div>";
  }
  function jobsList() {
    const q = state.query.trim().toLowerCase();
    const searching = !!q;
    const mode = state.boardMode || "board";
    let list = state.jobs.filter(function (j) {
      const hit = !q || [j.id, j.customer, j.address, j.city, j.problem].join(" ").toLowerCase().indexOf(q) !== -1;
      if (!hit) return false;
      if (searching) return true;
      if (mode === "all") {
        if (state.filter === "all") return true;
        if (state.filter === "open") return j.status !== "paid";
        return j.status === state.filter;
      }
      if (mode === "unpaid") return unpaidBalanceJobs().some(function (u) { return u.id === j.id; });
      return isBoardJob(j);
    });
    list = mode === "unpaid" && !searching ? unpaidBalanceJobs() : sortJobsList(list);
    const due = boardPlanVisits();
    let dueHtml = "";
    if (!searching && mode === "board") {
      dueHtml = '<div class="section-row"><div class="section" style="margin:0">Plan visits due</div>' +
        '<button class="link-btn" style="margin:0" ' + act("openPlans") + ">See all plan visits</button></div>";
      if (due.length) dueHtml += '<div class="due-list">' + due.map(dueVisitCard).join("") + "</div>";
      else dueHtml += '<div class="muted" style="margin:-4px 0 14px">Nothing overdue or due in the next 14 days. Older and later visits are on See all plan visits and on each customer page.</div>';
    }
    const unpaid = unpaidBalanceJobs();
    const chips = (mode === "all" && !searching)
      ? '<div class="chips">' + FILTERS.map(function (f) {
          return '<button class="chip' + (state.filter === f[0] ? " on" : "") + '" ' + act("filter", f[0]) + ">" + esc(f[1]) + "</button>";
        }).join("") + "</div>"
      : "";
    const heading = searching ? "Search results" : mode === "all" ? "All jobs" : mode === "unpaid" ? "Unpaid balances" : "Active and next 14 days";
    const empty = searching ? "No jobs match that search." :
      mode === "unpaid" ? "No unpaid balances sitting outside the board." :
      mode === "all" ? "No jobs in this filter." :
      "No in-progress work or scheduled jobs in the next 14 days. Overdue and due-soon plan visits are listed above. Everything else stays in search, on customer pages, and behind Show all.";
    const links = searching ? "" : '<div class="board-links">' +
      (mode !== "board" ? '<button class="link-btn" style="margin:0" ' + act("setBoardMode", "board") + ">Back to board</button>" : "") +
      (mode !== "all" ? '<button class="link-btn" style="margin:0" ' + act("setBoardMode", "all") + ">Show all</button>" : "") +
      (mode !== "unpaid" ? '<button class="link-btn" style="margin:0" ' + act("setBoardMode", "unpaid") + ">Unpaid balances" + (unpaid.length ? " · " + unpaid.length : "") + "</button>" : "") +
      "</div>";
    return topBar({ kicker: "ReliaTech Services", title: "Jobs", badge: SHOW_SAMPLE_BADGE, settings: true }) +
      actingAsBar() +
      '<div class="content"><div class="pad pad-fab">' +
      '<div class="search">' + icon("search", 16) + '<input id="search-q" type="search" placeholder="Search jobs or addresses" value="' + esc(state.query) + '" oninput="RT.setQuery(this.value)"></div>' +
      '<div class="jobs-toolbar"><div class="section" style="margin:0">' + heading + "</div>" + links + "</div>" +
      chips +
      dueHtml +
      '<div class="stack">' + (list.length ? list.map(jobCard).join("") : '<div class="muted">' + esc(empty) + "</div>") + "</div></div></div>" +
      '<button class="fab" ' + act("openNewCall") + ' aria-label="New call">' + icon("plus", 28) + "</button>" +
      tabBar();
  }
  function jobCard(job) {
    const st = STATUS[job.status] || STATUS.new, col = sc(job.status || "new");
    return '<button class="job-card" ' + act("openJob", job.id) + ">" +
      '<div class="stripe" style="background:' + col.bar + '"></div>' +
      '<div class="job-body"><div class="row"><div class="meta">#' + job.id + " · " + job.city + "</div>" + jobStatusPill(job, st, col) + "</div>" +
      '<div class="job-name">' + esc(job.customer) + "</div>" +
      '<div class="job-prob">' + esc(job.problem) + "</div>" +
      '<div class="row"><div class="addr">' + esc(job.address) + "</div>" + (job.total ? '<div class="amt">' + money(job.total) + "</div>" : "") + "</div>" +
      (jobWhenLine(job) ? '<div class="job-when">' + jobWhenLine(job) + "</div>" : "") +
      "</div><div class=\"chev\">" + icon("chevron", 18) + "</div></button>";
  }
  function jobStatusPill(job, st, col) {
    const v = linkedOpenVisit(job);
    if (v) {
      const vs = visitStatus(v);
      if (vs === "overdue") return pill("Overdue visit", "var(--alert-text)", "var(--alert-bg)");
      if (vs === "due") return pill("Plan visit due", "#0C5C5C", "#E6F4F4");
      if (vs === "scheduled") return pill("Scheduled", col.text, col.bg);
    }
    return pill(st.label, col.text, col.bg);
  }
  function jobWhenLine(job) {
    const v = visitForJob(job.id);
    const st = v ? visitStatus(v) : "";
    if (st === "scheduled" && v.scheduledStart) return formatPrettyDateTime(v.scheduledStart) + " PT";
    if (st === "overdue") {
      if (v.priorScheduledStart) return "Missed " + formatPrettyDateTime(v.priorScheduledStart) + " PT · needs reschedule";
      return formatWindow(v);
    }
    if (st === "due") return formatWindow(v);
    if (job.scheduledStart) {
      const d = parseStamp(job.scheduledStart);
      if (d && d.getTime() >= Date.now() - 60 * 60 * 1000) return formatPrettyDateTime(job.scheduledStart) + " PT";
    }
    const ev = (job.timeline || []).find(function (t) { return t && t.title === "Scheduled" && t.time; });
    const sd = ev ? parseLooseDate(ev.time) : null;
    if (sd && sd.getTime() >= Date.now()) return ev.time;
    return "";
  }
  function dueVisitCard(v) {
    const c = getCustomer(v.customerId);
    const plan = planById(v.planId);
    const tags = visitTagLabel(v, plan);
    return '<button class="due-card" ' + act("openVisit", v.id) + '><div class="visit-top"><div class="job-name" style="margin:0">' + esc(c ? c.name : v.customerId) + "</div>" + visitBadge(v) + "</div>" +
      '<div class="job-prob" style="margin-top:4px">' + esc(v.label) + (plan ? " · " + esc(plan.name) : "") + "</div>" +
      '<div class="muted" style="margin-top:4px">' + esc(formatWindow(v)) + (v.jobId ? " · #" + v.jobId : "") + "</div>" +
      (tags.length ? tags.map(function (t) { return '<span class="tag-note">' + esc(t) + "</span>"; }).join(" ") : "") +
      "</button>";
  }
  function visitActionButtons(v) {
    const st = visitStatus(v);
    let b = "";
    if (st !== "done" && st !== "cancelled") {
      b += '<button class="btn" ' + act("scheduleVisit", v.id) + ">" + (st === "scheduled" ? "Reschedule" : "Schedule") + "</button>";
      if (v.bookingToken) b += '<button class="btn" ' + act("copyBooking", v.id) + ">Copy booking link</button>";
      if (v.jobId) b += '<button class="btn" ' + act("openJob", v.jobId) + ">Open job · #" + esc(v.jobId) + "</button>";
      if (st !== "upcoming") b += '<button class="btn" ' + act("markVisitDone", v.id) + ">Mark done</button>";
    }
    return b ? '<div class="visit-actions">' + b + "</div>" : "";
  }
  function visitBlock(v, showCustomer) {
    const plan = planById(v.planId);
    const c = getCustomer(v.customerId);
    const tags = visitTagLabel(v, plan);
    return '<div class="visit-row" style="cursor:default"><div class="visit-top"><div><div class="job-name" style="margin:0">' + (showCustomer ? esc(c ? c.name : "") + " · " : "") + esc(v.label) + "</div></div>" + visitBadge(v) + "</div>" +
      '<div class="muted" style="margin-top:4px">' + esc(formatWindow(v)) + (v.jobId ? " · Job #" + v.jobId : "") + (v.billing === "prepaid_covered" ? " · Already paid" : v.billing === "included" ? " · Included, no maintenance charge" : v.billing === "offer" ? " · Offer, not enrolled" : v.billing === "custom" ? " · Custom billing" : v.billing === "pm_primary" ? " · $125, billed on completion" : "") + "</div>" +
      (v.notes ? '<div class="muted" style="margin-top:6px">' + esc(v.notes) + "</div>" : "") +
      (tags.length ? '<div>' + tags.map(function (t) { return '<span class="tag-note">' + esc(t) + "</span>"; }).join(" ") + "</div>" : "") +
      visitActionButtons(v) + "</div>";
  }
  function planCard(plan, customer) {
    const visits = (state.visits || []).filter(function (v) { return v.planId === plan.id; });
    const term = (plan.startDate && plan.renewalDate) ? (formatYmd(plan.startDate) + " – " + formatYmd(plan.renewalDate)) : "";
    const price = plan.billingMode === "included" ? "Included" : plan.billingMode === "custom" ? "Custom billing" : (plan.price ? money(plan.price) : "");
    return '<div class="plan-card"><div class="plan-head"><div><div class="k-up">Service plan</div><div class="h2" style="margin-top:2px">' + esc(plan.name) + "</div></div>" +
      pill(plan.status === "active" ? "Active" : plan.status === "follow_up" ? "Follow-up" : String(plan.status || ""), "#0C5C5C", "#E6F4F4") + "</div>" +
      '<div class="muted">' + esc([term, price, plan.visitsPerYear ? (plan.visitsPerYear + " visits / year") : "", plan.siteAddress].filter(Boolean).join(" · ")) + "</div>" +
      (plan.notes ? '<div class="muted" style="margin-top:8px">' + esc(plan.notes) + "</div>" : "") +
      visits.map(function (v) { return visitBlock(v, false); }).join("") +
      "</div>";
  }
  function plansScreen() {
    const due = attentionVisits();
    const upcoming = (state.visits || []).filter(function (v) {
      const st = visitStatus(v);
      return st === "scheduled" || st === "upcoming";
    }).sort(function (a, b) {
      return String(a.scheduledStart || a.dueWindowStart || "").localeCompare(String(b.scheduledStart || b.dueWindowStart || ""));
    });
    return topBar({ back: "closePlans", title: "Plan visits due", badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      '<div class="muted" style="margin-bottom:12px">Due and overdue plan visits, plus visits that need follow-up. Scheduling here updates the customer’s visit list on this phone. Ask the assistant to put a confirmed time on your Google Calendar.</div>' +
      (due.length ? '<div class="due-list">' + due.map(dueVisitCard).join("") + "</div>" : '<div class="muted" style="margin-bottom:16px">Nothing is due right now.</div>') +
      (upcoming.length ? '<div class="section">Scheduled and upcoming</div>' + upcoming.map(function (v) { return visitBlock(v, true); }).join("") : "") +
      "</div></div>";
  }
  function actingAsSheet() {
    const recs = state.techRecords || [];
    const tech = actingAs();
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Acting as</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">This is not a login. Anyone with this phone can switch who they are acting as. Real sign-in needs a shared backend.</div>' +
      '<div class="chips">' + recs.map(function (r) {
        const lab = r.name + (r.role === "admin" ? " · Admin" : " · Independent");
        return '<button class="chip' + (tech === r.name ? " on" : "") + '" ' + act("pickTech", r.name) + ">" + esc(lab) + "</button>";
      }).join("") + "</div>" +
      '<label class="field"><div class="field-lab">Add an independent tech</div><input id="new-tech" type="text" placeholder="Tech name" value="" oninput="RT.setNewTech(this.value)"></label>' +
      '<button class="btn ghost" ' + act("addTech") + ">Add tech</button>"
    );
  }
  function timeCorrectionsScreen() {
    const pending = allPendingCorrections();
    return topBar({ back: "closeTimeCorrections", title: "Time corrections", badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      '<div class="muted" style="margin-bottom:12px">Requests from techs who cannot edit timestamps. Approving applies the proposed times and keeps an audit trail in the app, not on the invoice.</div>' +
      (pending.length ? pending.map(function (row) {
        const c = row.correction, e = row.entry, job = row.job;
        return '<div class="panel pending-box" style="margin-bottom:12px">' +
          '<div class="k-up">Pending</div>' +
          '<div class="h2" style="margin-top:4px">' + esc(job.customer) + " · #" + esc(job.id) + "</div>" +
          '<div class="muted" style="margin-top:6px">' + esc(c.requestedBy) + " · " + esc(formatDateTime(c.requestedAt)) + "</div>" +
          '<div class="muted" style="margin-top:6px">Current: Arrive ' + esc(e.clockIn ? formatDateTime(e.clockIn) : "—") + " · Depart " + esc(e.clockOut ? formatDateTime(e.clockOut) : "—") + "</div>" +
          '<div class="muted">Proposed: ' + esc(correctionSummary(c)) + "</div>" +
          '<div class="muted" style="margin-top:6px">Reason: ' + esc(c.reason) + "</div>" +
          '<div class="quick" style="margin-top:10px">' +
          '<button class="btn teal" ' + act("approveCorrection", job.id + "|" + e.id + "|" + c.id) + ">Approve</button>" +
          '<button class="btn ghost" ' + act("rejectCorrection", job.id + "|" + e.id + "|" + c.id) + ">Reject</button></div></div>";
      }).join("") : '<div class="muted">No pending correction requests.</div>') +
      "</div></div>";
  }
  function settingsScreen() {
    const s = state.settings || SETTINGS_DEFAULTS;
    const recs = state.techRecords || [];
    const admin = isAdminTech(actingAs());
    return topBar({ back: "closeSettings", title: "Settings", badge: SHOW_SAMPLE_BADGE, voice: false }) +
      '<div class="content screen"><div class="pad">' +
      actingAsBar() +
      '<div class="section">Techs and time edits</div>' +
      '<div class="muted" style="margin:-4px 0 12px">Independents can clock in and out. Only Steve (admin) can edit any timestamp, unless you turn on “Can edit own times” for that tech. This Acting as switch is not a login and is not secure until there is a shared backend with sign-in.</div>' +
      recs.map(function (r) {
        const on = !!r.canEditOwnTimes;
        return '<div class="panel" style="margin-bottom:8px"><div class="row"><div><div class="h2" style="margin:0">' + esc(r.name) + "</div><div class=\"meta\">" + (r.role === "admin" ? "Admin" : "Independent") + "</div></div>" +
          (r.role === "admin" ? '<div class="meta">Can edit any time</div>' :
            (admin ? '<button class="dash' + (on ? " sel" : "") + '" ' + act("toggleCanEditOwnTimes", r.name) + ">" + (on ? "Can edit own times · on" : "Can edit own times · off") + "</button>" :
              '<div class="meta">Can edit own times: ' + (on ? "on" : "off") + "</div>")) +
          "</div></div>";
      }).join("") +
      '<label class="field"><div class="field-lab">Add an independent tech</div><input id="new-tech" type="text" placeholder="Tech name" value="" oninput="RT.setNewTech(this.value)"></label>' +
      '<button class="dash" style="margin-top:-4px;margin-bottom:16px" ' + act("addTech") + ">Add tech</button>" +
      '<div class="section">Availability</div>' +
      '<div class="muted" style="margin:-4px 0 12px">Used when you pick a time and when a customer booking link shows open slots. The public booking page also reads published slots.json, so after you change these hours run the update_slots script and publish that file.</div>' +
      '<label class="field"><div class="field-lab">Weekday evening start (PT)</div><input id="st-weekdayStart" type="time" value="' + esc(s.weekdayStart) + '" oninput="RT.setSetting(\'weekdayStart\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Weekday evening end (PT)</div><input id="st-weekdayEnd" type="time" value="' + esc(s.weekdayEnd) + '" oninput="RT.setSetting(\'weekdayEnd\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Saturday start (PT)</div><input id="st-saturdayStart" type="time" value="' + esc(s.saturdayStart) + '" oninput="RT.setSetting(\'saturdayStart\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Saturday end (PT)</div><input id="st-saturdayEnd" type="time" value="' + esc(s.saturdayEnd) + '" oninput="RT.setSetting(\'saturdayEnd\', this.value)"></label>' +
      '<div class="cal-note">' + esc(availabilitySummary()) + " Sunday is closed unless you turn it on in the published slots file.</div>" +
      '<div class="section">Calendar</div>' +
      '<div class="muted">Job appointments go on steveseguine51@gmail.com, titled like “#25076 Dan Correa — Cooling maintenance.” The customer is never invited. This app cannot write to Google Calendar by itself. After you confirm a time, ask the assistant to add or update the event.</div>' +
      "</div></div>";
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
      jobEquipmentSection(job) +
      timeSection(job) +
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
      (job.status === "invoiced" || job.status === "paid" ? '<button class="btn ghost" ' + act("sheet", "invoice") + ">View invoice</button>" : "") +
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

  function jobEquipmentSection(job) {
    const c = getCustomer(job.customerId);
    const assets = c ? customerAssets(c) : [];
    let html = '<div class="section-row"><div class="section" style="margin:0">Equipment at this home</div>';
    if (c) html += '<button class="link-btn" style="margin:0" ' + act("openCustomer", c.id) + ">Customer profile</button>";
    html += "</div>";
    if (!assets.length) {
      html += '<div class="muted" style="margin:8px 0 16px">No equipment on this customer profile yet.</div>';
      return html;
    }
    html += '<div class="stack" style="margin:8px 0 16px">' + assets.map(function (a) {
      return assetCard(a, c ? c.id : "", true);
    }).join("") + "</div>";
    return html;
  }
  function assetCard(a, customerId, compact) {
    return '<button class="eq-card" ' + act("openAsset", (customerId || state.openCustomerId || "") + "|" + a.id) + ">" +
      (a.photo ? '<img class="eq-thumb" src="' + esc(a.photo) + '" alt="Nameplate">' : '<div class="eq-thumb ph">' + icon("photo", 18) + "</div>") +
      '<div class="eq-body"><div class="eq-type">' + esc(equipmentTypeLabel(a)) + (a.sample ? ' · Example only' : "") + "</div>" +
      '<div class="h2">' + esc([a.make, a.model].filter(Boolean).join(" · ") || "Make and model not entered") + "</div>" +
      (assetSub(a) ? '<div class="muted" style="margin-top:2px">' + esc(assetSub(a)) + "</div>" : "") +
      (!compact && a.warranty ? '<div class="meta" style="margin-top:4px">Warranty · ' + esc(a.warranty) + "</div>" : "") +
      "</div>" + icon("chevron", 18) + "</button>";
  }

  function customersList() {
    const q = state.query.trim().toLowerCase();
    const list = state.customers.filter(function (c) {
      return !q || [c.name, c.address, c.city, c.phone].join(" ").toLowerCase().indexOf(q) !== -1;
    });
    return topBar({ kicker: "ReliaTech Services", title: "Customers", badge: SHOW_SAMPLE_BADGE, settings: true }) +
      '<div class="content"><div class="pad">' +
      '<div class="search">' + icon("search", 16) + '<input id="search-q" type="search" placeholder="Search customers" value="' + esc(state.query) + '" oninput="RT.setQuery(this.value)"></div>' +
      '<div class="stack">' + list.map(function (c) {
        const preview = assetPreview(c);
        return '<button class="list-card" ' + act("openCustomer", c.id) + '><div class="job-body" style="display:flex;gap:12px;align-items:flex-start">' +
          '<div class="avatar">' + esc(initials(c.name)) + "</div><div style=\"min-width:0\"><div class=\"job-name\" style=\"margin-top:0\">" + esc(c.name) + "</div>" +
          '<div class="muted">' + esc(c.address) + ", " + esc(c.city) + "</div><div class=\"muted\">" + esc(c.phone) + "</div>" +
          (preview ? '<div class="meta" style="margin-top:4px">' + esc(preview) + "</div>" : "") +
          "</div></div><div class=\"chev\">" + icon("chevron", 18) + "</div></button>";
      }).join("") + "</div></div></div>" + tabBar();
  }
  function customerDetail(c) {
    const jobs = state.jobs.concat(state.moneyJobs).filter(function (j) { return j.customerId === c.id; });
    const assets = customerAssets(c);
    const mentions = c.mentions || [];
    const nextId = nextJobId(state.jobs);
    return topBar({ back: "closeCustomer", title: c.name, badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      '<div class="panel" style="margin-bottom:14px"><div class="muted">' + esc(c.address) + (c.city ? ", " + esc(c.city) : "") + "</div>" +
      (c.phone ? '<div class="teal" style="margin:6px 0 0">' + esc(c.phone) + "</div>" : "") +
      (c.email ? '<div class="muted" style="margin-top:4px">' + esc(c.email) + "</div>" : "") + "</div>" +
      '<button class="btn" style="margin-bottom:16px" ' + act("newJobFromCustomer", c.id) + ">New job · #" + nextId + "</button>" +
      plansForCustomer(c.id).map(function (p) { return planCard(p, c); }).join("") +
      '<div class="section-row"><div class="section" style="margin:0">Equipment</div></div>' +
      '<button class="dash" style="margin:10px 0 12px" ' + act("addEquipment", c.id) + ">Add equipment</button>" +
      (assets.length ? '<div class="stack" style="margin-bottom:16px">' + assets.map(function (a) { return assetCard(a, c.id, false); }).join("") + "</div>" :
        '<div class="muted" style="margin-bottom:16px">No equipment recorded yet. Add the furnace, coil, and condenser from the nameplate when you are on site.</div>') +
      (mentions.length ? '<div class="section">Mentioned in job history</div><div class="muted" style="margin:-4px 0 10px">These came from Housecall Pro job or estimate descriptions. They are not full equipment records.</div>' + mentions.map(function (e) {
        return '<div class="panel" style="margin-bottom:10px"><div class="h2">' + esc(e.name) + "</div><div class=\"muted\" style=\"margin-top:4px\">" + esc(e.detail) + "</div></div>";
      }).join("") : "") +
      '<div class="section">Jobs</div><div class="stack">' + (jobs.length ? jobs.map(function (j) {
        if (state.jobs.some(function (x) { return x.id === j.id; })) return jobCard(j);
        const col = sc(j.status);
        return '<div class="job-card" style="cursor:default"><div class="stripe" style="background:' + col.bar + '"></div><div class="job-body"><div class="row"><div class="meta">#' + j.id + "</div>" + pill(STATUS[j.status].label, col.text, col.bg) + "</div><div class=\"job-prob\" style=\"margin-top:6px\">" + esc(j.problem) + "</div><div class=\"row\"><div class=\"addr\">" + (j.invoiceId || "") + "</div><div class=\"amt\">" + money(j.total) + "</div></div></div></div>";
      }).join("") : '<div class="muted">No jobs for this customer yet.</div>') + "</div></div></div>";
  }

  function moneyScreen() {
    const all = state.jobs.concat(state.moneyJobs);
    const collected = (window.RT_DATA && typeof window.RT_DATA.collected === "number") ? window.RT_DATA.collected : all.filter(function (j) { return j.status === "paid"; }).reduce(function (s, j) { return s + j.total; }, 0);
    const outstanding = (window.RT_DATA && typeof window.RT_DATA.outstanding === "number") ? window.RT_DATA.outstanding : all.filter(function (j) { return j.status === "invoiced"; }).reduce(function (s, j) { return s + (j.dueAmount || j.total); }, 0);
    const openEst = (window.RT_DATA && typeof window.RT_DATA.openEstimates === "number") ? window.RT_DATA.openEstimates : all.filter(function (j) { return j.status === "estimate" || j.status === "approved"; }).reduce(function (s, j) { return s + j.total; }, 0);
    const unpaid = all.filter(function (j) { return (j.dueAmount || 0) > 0 || j.status === "invoiced"; });
    return topBar({ kicker: "ReliaTech Services", title: "Money", badge: SHOW_SAMPLE_BADGE, settings: true }) +
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
    return topBar({ kicker: "ReliaTech Services", title: "Capture", badge: SHOW_SAMPLE_BADGE, settings: true }) +
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
    const fromCust = !!nc.fromCustomer;
    const steps = fromCust
      ? '<div class="steps">' +
        '<span style="color:' + (step === 1 ? TEAL : "var(--muted)") + '">1. Report</span>' +
        '<span style="color:' + (step === 3 ? TEAL : "var(--muted)") + '">2. Confirm</span></div>'
      : '<div class="steps">' +
        '<span style="color:' + (step === 1 ? TEAL : "var(--muted)") + '">1. Report</span>' +
        '<span style="color:' + (step === 2 ? TEAL : "var(--muted)") + '">2. Customer</span>' +
        '<span style="color:' + (step === 3 ? TEAL : "var(--muted)") + '">3. Confirm</span></div>';
    const head = '<div class="sheet-head"><div class="sheet-title">' + (fromCust ? "New job" : "New call") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" + steps;
    if (step === 1) {
      const lockedCust = fromCust ? getCustomer(nc.customerId) : null;
      const locked = lockedCust
        ? '<div class="panel" style="margin-bottom:12px;padding:12px"><div class="k-up">Customer</div><div class="h2">' + esc(lockedCust.name) + '</div><div class="muted">' + esc(lockedCust.address) + (lockedCust.city ? ", " + esc(lockedCust.city) : "") + "</div>" +
          (lockedCust.phone ? '<div class="teal" style="margin:4px 0 0">' + esc(lockedCust.phone) + "</div>" : "") + "</div>"
        : "";
      return backdrop(head + locked +
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
        '<button class="btn" ' + act("ncNext") + ">" + (fromCust ? "Next · Confirm" : "Next · Customer") + "</button>");
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
            const preview = assetPreview(c);
            return '<button class="list-card' + (on ? " sel" : "") + '" style="border:1.5px solid ' + (on ? TEAL : "transparent") + '" ' + act("pickCust", c.id) + ">" +
              '<div class="job-body"><div class="job-name" style="margin-top:0">' + esc(c.name) + "</div><div class=\"muted\">" + esc(c.address) + ", " + esc(c.city) + "</div><div class=\"muted\">" + esc(c.phone) + "</div>" +
              (preview ? '<div class="meta" style="margin-top:4px">' + esc(preview) + "</div>" : "") + "</div></button>";
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
    let equipmentHtml = "";
    if (!nc.isNew && nc.customerId) {
      const cust = getCustomer(nc.customerId);
      const assets = cust ? customerAssets(cust) : [];
      if (assets.length) {
        equipmentHtml = '<div class="section">Equipment on file</div><div class="stack" style="margin-bottom:12px">' + assets.map(function (a) {
          return '<div class="panel" style="padding:12px"><div class="eq-type">' + esc(equipmentTypeLabel(a)) + (a.sample ? " · Example only" : "") + "</div>" +
            '<div class="h2">' + esc([a.make, a.model].filter(Boolean).join(" · ") || "Make and model not entered") + "</div>" +
            (assetSub(a) ? '<div class="muted">' + esc(assetSub(a)) + "</div>" : "") + "</div>";
        }).join("") + "</div>";
      } else {
        equipmentHtml = '<div class="muted" style="margin-bottom:12px">No equipment on this customer profile yet. You can add it from the customer page.</div>';
      }
    }
    return backdrop(head +
      '<div class="panel" style="margin-bottom:12px;box-shadow:none;background:var(--field)">' +
      '<div class="k-up">Next job</div><div class="h1" style="margin:4px 0">#' + jobId + "</div>" +
      '<div class="h2">' + esc(custName) + "</div><div class=\"muted\">" + esc(custAddr) + "</div><div class=\"teal\">" + esc(custPhone) + "</div>" +
      '<div style="margin-top:10px">' + esc(report) + "</div></div>" +
      equipmentHtml +
      '<div class="note" style="margin-top:0;margin-bottom:12px">This job is saved on this phone only. It is not uploaded to a shared server.</div>' +
      '<button class="btn accent" ' + act("createJob") + ">Create job</button>");
  }

  function noteSheet() {
    const d = state.noteDraft || emptyNoteDraft("visit");
    const typ = d.type || "visit";
    const recs = d.recs && d.recs.length ? d.recs : [{ text: "", reason: "" }];
    const r = d.readings || {};
    const np = d.nameplate || {};
    const types = [["visit", "Visit note"], ["maintenance", "Maintenance"], ["scope", "Repair / estimate scope"]];
    let body = "";
    if (typ === "visit") {
      body =
        '<label class="field"><div class="field-lab">Date / visit</div><input id="nt-visitDate" type="date" value="' + esc(d.visitDate) + '" oninput="RT.setNoteField(\'visitDate\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Check-in</div><input id="nt-checkIn" type="text" placeholder="Arrival notes, who was on site" value="' + esc(d.checkIn) + '" oninput="RT.setNoteField(\'checkIn\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Findings</div><textarea id="nt-findings" rows="3" placeholder="What you found" oninput="RT.setNoteField(\'findings\', this.value)">' + esc(d.findings) + "</textarea></label>" +
        '<label class="field"><div class="field-lab">Work performed</div><textarea id="nt-work" rows="3" placeholder="What you did" oninput="RT.setNoteField(\'work\', this.value)">' + esc(d.work) + "</textarea></label>" +
        '<div class="section">Readings</div><div class="muted" style="margin:-4px 0 8px">Leave a field blank and note it under caveats if you did not measure it.</div>' +
        '<label class="field"><div class="field-lab">Pressures</div><input id="nt-pressures" type="text" placeholder="Suction / liquid, psig" value="' + esc(r.pressures || "") + '" oninput="RT.setNoteReading(\'pressures\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Temps</div><input id="nt-temps" type="text" placeholder="Return / supply / outdoor, °F" value="' + esc(r.temps || "") + '" oninput="RT.setNoteReading(\'temps\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">SH / SC</div><input id="nt-shsc" type="text" placeholder="Superheat / subcool, °F" value="' + esc(r.shsc || "") + '" oninput="RT.setNoteReading(\'shsc\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Static</div><input id="nt-static" type="text" placeholder="Return / supply / TESP, in. WC" value="' + esc(r.static || "") + '" oninput="RT.setNoteReading(\'static\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Amps</div><input id="nt-amps" type="text" placeholder="Compressor / blower / condenser fan" value="' + esc(r.amps || "") + '" oninput="RT.setNoteReading(\'amps\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Gas pressure</div><input id="nt-gas" type="text" placeholder="Inlet / manifold, in. WC" value="' + esc(r.gas || "") + '" oninput="RT.setNoteReading(\'gas\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Caveats for anything not measured</div><textarea id="nt-caveats" rows="2" placeholder="e.g. Could not confirm static — no access to return" oninput="RT.setNoteReading(\'caveats\', this.value)">' + esc(r.caveats || "") + "</textarea></label>" +
        '<div class="section">Recommendations</div>' + recs.map(function (rec, i) {
          return '<div class="panel" style="margin-bottom:8px;padding:12px">' +
            '<label class="field"><div class="field-lab">Recommendation</div><input id="nt-rec-' + i + '" type="text" value="' + esc(rec.text) + '" oninput="RT.setRec(' + i + ',\'text\', this.value)"></label>' +
            '<label class="field" style="margin-bottom:0"><div class="field-lab">Reason</div><input id="nt-rec-r-' + i + '" type="text" value="' + esc(rec.reason) + '" oninput="RT.setRec(' + i + ',\'reason\', this.value)"></label></div>';
        }).join("") +
        '<button class="dash" style="margin-bottom:12px" ' + act("addRec") + ">Add recommendation</button>" +
        '<label class="field"><div class="field-lab">What’s left / return visit</div><textarea id="nt-leftover" rows="2" placeholder="Open items, parts on order, scheduled return" oninput="RT.setNoteField(\'leftover\', this.value)">' + esc(d.leftover) + "</textarea></label>" +
        '<label class="field"><div class="field-lab">Final line</div><input id="nt-departure" type="text" value="' + esc(d.departure) + '" oninput="RT.setNoteField(\'departure\', this.value)"></label>';
    } else if (typ === "maintenance") {
      body =
        '<label class="field"><div class="field-lab">Visit date</div><input id="nt-visitDate" type="date" value="' + esc(d.visitDate) + '" oninput="RT.setNoteField(\'visitDate\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Filter size</div><input id="nt-filterSize" type="text" placeholder="e.g. 16x25x1" value="' + esc(d.filterSize) + '" oninput="RT.setNoteField(\'filterSize\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Date replaced</div><input id="nt-filterDate" type="date" value="' + esc(d.filterDate) + '" oninput="RT.setNoteField(\'filterDate\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Previous filter date</div><input id="nt-prevFilterDate" type="date" value="' + esc(d.prevFilterDate) + '" oninput="RT.setNoteField(\'prevFilterDate\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Tasks done</div><textarea id="nt-tasks" rows="3" placeholder="Filters, coils, drain, belts, safeties…" oninput="RT.setNoteField(\'tasks\', this.value)">' + esc(d.tasks) + "</textarea></label>" +
        '<label class="field"><div class="field-lab">Readings</div><textarea id="nt-maintReadings" rows="3" placeholder="Temps, static, amps, or other readings taken" oninput="RT.setNoteField(\'maintReadings\', this.value)">' + esc(d.maintReadings) + "</textarea></label>" +
        '<label class="field"><div class="field-lab">Final line</div><input id="nt-departure" type="text" value="' + esc(d.departure) + '" oninput="RT.setNoteField(\'departure\', this.value)"></label>';
    } else {
      body =
        '<label class="field"><div class="field-lab">Description</div><textarea id="nt-scopeDesc" rows="3" placeholder="Repair or estimate scope" oninput="RT.setNoteField(\'scopeDesc\', this.value)">' + esc(d.scopeDesc) + "</textarea></label>" +
        '<label class="field"><div class="field-lab">Included in scope</div><textarea id="nt-included" rows="3" placeholder="What is included" oninput="RT.setNoteField(\'included\', this.value)">' + esc(d.included) + "</textarea></label>" +
        '<label class="field"><div class="field-lab">Exclusions / notes</div><textarea id="nt-exclusions" rows="3" placeholder="What is not included" oninput="RT.setNoteField(\'exclusions\', this.value)">' + esc(d.exclusions) + "</textarea></label>" +
        '<label class="field"><div class="field-lab">Assumptions</div><textarea id="nt-assumptions" rows="3" placeholder="Access, existing conditions, allowances" oninput="RT.setNoteField(\'assumptions\', this.value)">' + esc(d.assumptions) + "</textarea></label>";
    }
    const nameplate =
      '<div class="section">Nameplate while you’re on site</div>' +
      '<div class="muted" style="margin:-4px 0 8px">Grab make, model, serial, refrigerant, and filter size off the nameplate. This saves to the customer’s Equipment profile on this phone.</div>' +
      '<div class="chips">' + EQUIPMENT_TYPES.map(function (t) {
        return '<button class="chip teal' + (np.type === t.id ? " on" : "") + '" ' + act("npType", t.id) + ">" + esc(t.label) + "</button>";
      }).join("") + "</div>" +
      '<label class="field"><div class="field-lab">Make</div><input id="np-make" type="text" value="' + esc(np.make || "") + '" oninput="RT.setNameplate(\'make\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Model</div><input id="np-model" type="text" value="' + esc(np.model || "") + '" oninput="RT.setNameplate(\'model\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Serial</div><input id="np-serial" type="text" value="' + esc(np.serial || "") + '" oninput="RT.setNameplate(\'serial\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Refrigerant</div><input id="np-refrigerant" type="text" value="' + esc(np.refrigerant || "") + '" oninput="RT.setNameplate(\'refrigerant\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Filter size</div><input id="np-filterSize" type="text" value="' + esc(np.filterSize || "") + '" oninput="RT.setNameplate(\'filterSize\', this.value)"></label>' +
      '<div class="nameplate">' + (np.photo ? '<img src="' + esc(np.photo) + '" alt="Nameplate photo">' : '<div class="nameplate-empty">' + icon("photo", 22) + "<span>Nameplate photo</span></div>") +
      '<input type="file" accept="image/*" capture="environment" aria-label="Nameplate photo" onchange="RT.setNameplatePhoto(this)"></div>' +
      (np.photo ? '<button class="link-btn" style="margin-bottom:12px" ' + act("clearNpPhoto") + ">Remove photo</button>" : "");
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Add a note</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="chips">' + types.map(function (t) {
        return '<button class="chip' + (typ === t[0] ? " on" : "") + '" ' + act("noteType", t[0]) + ">" + esc(t[1]) + "</button>";
      }).join("") + "</div>" +
      body + nameplate +
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
    const existing = job.status === "invoiced" || job.status === "paid";
    const mismatch = hoursMismatch(job);
    const showTos = showTimeOnInvoice(job);
    const completed = completedTimeEntries(job);
    const openLeft = anyOpenEntry(job);
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (existing ? "Invoice" : "Make invoice") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="doc"><div class="k-up">Invoice ' + esc(job.invoiceId || (job.id + "-01")) + "</div><div class=\"h2\" style=\"margin:6px 0\">" + esc(job.customer) + "</div>" +
      (job.lineItems || []).map(function (l) { return '<div class="row" style="margin-top:6px"><div>' + esc(l.label) + "</div><div>" + money(l.amount) + "</div></div>"; }).join("") +
      '<div class="row" style="margin-top:10px;font-weight:750"><div>Total</div><div>' + money(job.total) + "</div></div>" +
      '<div class="section-row" style="margin-top:16px"><div class="k-up" style="margin:0">Time on site</div></div>' +
      '<button class="dash' + (showTos ? " sel" : "") + '" style="margin:8px 0" ' + act("toggleTimeOnInvoice") + ">" +
        (showTos ? "Time on site will print on this invoice" : "Time on site hidden on this invoice") + ". Default is on for hourly jobs, off for flat-rate." +
      "</button>" +
      (mismatch ? '<div class="warn-banner">' + esc(mismatch) + " This warning stays in the app; it is not printed on the invoice.</div>" : "") +
      (openLeft && showTos ? '<div class="muted" style="margin-bottom:8px">Open entries are kept in the app until you clock out. They are not printed.</div>' : "") +
      (showTos ? timeOnSiteTable(job) : '<div class="muted">Time on site will not print on this invoice. Travel, breaks, and edit history are never printed.</div>') +
      "</div>" +
      (existing ? '<button class="btn" ' + act("closeSheet") + ">Done</button>" : '<button class="btn teal" ' + act("makeInvoice") + ">Create invoice</button>"));
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

  function equipmentSheet() {
    const d = state.assetDraft || emptyAsset();
    const editing = !!state.assetEditingId;
    const locOther = d.location && EQUIPMENT_LOCATIONS.indexOf(d.location) === -1;
    const fields = [
      ["make", "Make", "text", "Carrier, Rheem, Payne…"],
      ["model", "Model", "text", "From the nameplate"],
      ["serial", "Serial", "text", "From the nameplate"],
      ["installDate", "Install date", "date", ""],
      ["manufactureDate", "Manufacture date", "date", ""],
      ["capacity", "Tonnage or BTU", "text", "e.g. 3 ton or 80,000 BTU"],
      ["refrigerant", "Refrigerant", "text", "e.g. R-410A"],
      ["filterSize", "Filter size", "text", "e.g. 16x25x1"],
      ["warranty", "Warranty", "text", "Parts, labor, or remaining term"]
    ];
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (editing ? "Equipment" : "Add equipment") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="field-lab">Type</div><div class="chips">' + EQUIPMENT_TYPES.map(function (t) {
        const on = d.type === t.id;
        return '<button class="chip' + (on ? " on teal" : "") + '" ' + act("assetType", t.id) + ">" + esc(t.label) + "</button>";
      }).join("") + "</div>" +
      (d.type === "other" ? '<label class="field"><div class="field-lab">Type name</div><input id="eq-typeOther" value="' + esc(d.typeOther || "") + '" placeholder="e.g. Humidifier" oninput="RT.setAsset(\'typeOther\', this.value)"></label>' : "") +
      fields.map(function (f) {
        return '<label class="field"><div class="field-lab">' + esc(f[1]) + '</div><input id="eq-' + f[0] + '" type="' + f[2] + '" value="' + esc(d[f[0]] || "") + '" placeholder="' + esc(f[3]) + '" oninput="RT.setAsset(\'' + f[0] + '\', this.value)"></label>';
      }).join("") +
      '<div class="field-lab">Location</div><div class="chips">' + EQUIPMENT_LOCATIONS.map(function (loc) {
        const on = loc === "Other" ? locOther : d.location === loc;
        return '<button class="chip' + (on ? " on" : "") + '" ' + act("assetLocation", loc) + ">" + esc(loc) + "</button>";
      }).join("") + "</div>" +
      ((locOther || !d.location) ? '<label class="field"><div class="field-lab">' + (locOther ? "Location" : "Location (or type one)") + '</div><input id="eq-location" value="' + esc(locOther ? d.location : "") + '" placeholder="Attic, garage, side yard…" oninput="RT.setAsset(\'location\', this.value)"></label>' : "") +
      '<label class="field"><div class="field-lab">Notes</div><textarea id="eq-notes" rows="3" placeholder="Condition, access, anything to remember" oninput="RT.setAsset(\'notes\', this.value)">' + esc(d.notes || "") + "</textarea></label>" +
      '<div class="field"><div class="field-lab">Nameplate photo</div>' +
      '<div class="nameplate">' +
        (d.photo ? '<img src="' + esc(d.photo) + '" alt="Nameplate">' : '<div class="nameplate-empty">' + icon("photo", 28) + "<span>Tap to add a nameplate photo</span></div>") +
        '<input type="file" accept="image/*" capture="environment" aria-label="Nameplate photo" onchange="RT.setAssetPhoto(this)">' +
      "</div>" +
      (d.photo ? '<button class="link-btn" ' + act("clearAssetPhoto") + ">Remove photo</button>" : "") +
      "</div>" +
      '<button class="dash' + (d.sample ? " sel" : "") + '" style="margin-bottom:14px" ' + act("toggleAssetSample") + ">" + (d.sample ? "Marked as example only — not a real unit" : "Mark as example only (not a real unit)") + "</button>" +
      '<div class="note" style="margin-top:0;margin-bottom:12px">Saved on this phone only. Not uploaded to a shared server.</div>' +
      '<button class="btn" ' + act("saveEquipment") + ">" + (editing ? "Save equipment" : "Add equipment") + "</button>" +
      (editing ? '<button class="btn ghost" style="margin-top:8px" ' + act("removeEquipment") + ">Remove</button>" : "")
    );
  }

  function timeEditSheet(job) {
    const d = state.timeEdit || {};
    const entry = jobTimeEntries(job).find(function (e) { return e.id === d.entryId; });
    if (!entry) return backdrop('<div class="sheet-head"><div class="sheet-title">Edit time</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div><div class=\"muted\">That time entry is no longer here.</div>");
    const request = !!d.request;
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (request ? "Request a correction" : "Edit timestamps") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">' + (request
        ? "The times will not change until Steve approves this request. A reason is required. The request and his decision stay in the app and are never printed on the invoice."
        : "Use this to fix a forgotten clock-out or a wrong time. A reason is required. The edit history stays in the app and is never printed on the invoice.") + "</div>" +
      '<label class="field"><div class="field-lab">Tech</div><input id="te-tech" type="text" value="' + esc(d.tech || "") + '" oninput="RT.setTimeEdit(\'tech\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Arrive</div><input id="te-clockIn" type="datetime-local" value="' + esc(d.clockIn || "") + '" oninput="RT.setTimeEdit(\'clockIn\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Depart</div><input id="te-clockOut" type="datetime-local" value="' + esc(d.clockOut || "") + '" oninput="RT.setTimeEdit(\'clockOut\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Reason (required)</div><textarea id="te-reason" rows="3" placeholder="e.g. Forgot to clock out at the end of the day" oninput="RT.setTimeEdit(\'reason\', this.value)">' + esc(d.reason || "") + "</textarea></label>" +
      correctionTrailHtml(entry) +
      '<button class="btn" style="margin-top:12px" ' + act(request ? "saveCorrectionRequest" : "saveTimeEdit") + ">" + (request ? "Submit request" : "Save changes") + "</button>");
  }

  function voiceSheet() {
    const v = state.voice || {};
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Voice command</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (v.listening ? '<div class="voice-orb" aria-hidden="true"></div><div class="h2" style="text-align:center;margin-bottom:8px">Listening…</div>' : "") +
      '<div id="voice-status" class="muted" style="text-align:center;margin-bottom:10px">' +
        esc(v.listening ? "Try “clock me in”, “clock me in for Lewis”, “start AC repair for Lewis”, or “clock me out.”" : (v.error || "Voice is ready when you are.")) +
      "</div>" +
      '<div id="voice-text" class="voice-text">' + esc(v.text || "") + "</div>" +
      (v.fallback || !v.listening ? '<label class="field"><div class="field-lab">' + (v.fallback ? "Type the command" : "Or type it") + "</div>" +
        '<input id="voice-input" type="text" placeholder="clock me in for Lewis" value="' + esc(v.text || "") + '" oninput="RT.setVoiceText(this.value)"></label>' +
        '<button class="btn" ' + act("submitVoice") + ">Continue</button>" +
        (speechAvailable() && !v.listening ? '<button class="btn ghost" style="margin-top:8px" ' + act("openVoice") + ">Listen again</button>" : "") : "")
    );
  }


  function voiceConfirmSheet() {
    const c = state.voiceConfirm;
    if (!c) return "";
    const actionLab = c.action === "clockOut" ? "Clock out" : "Clock in";
    const jobLine = c.needsNewJob
      ? ("No open job for " + (c.customerName || "this customer") + ". You can create a new job, same as New job on the customer page" + (c.work ? ' ("' + c.work + '")' : '') + ".")
      : (c.jobId ? ("Job #" + c.jobId + (c.problem ? " · " + c.problem : "")) : "No job selected");
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Confirm</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="confirm-card">' +
        '<div class="k-up">Voice command</div>' +
        (c.raw ? '<div class="muted" style="margin:6px 0 12px">“' + esc(c.raw) + '”</div>' : "") +
        '<div class="confirm-row"><div class="field-lab">Tech</div><div class="h2">' + esc(c.tech || state.currentTech) + "</div></div>" +
        '<div class="confirm-row"><div class="field-lab">Customer</div><div class="h2">' + esc(c.customerName || "—") + "</div></div>" +
        '<div class="confirm-row"><div class="field-lab">Job</div><div class="h2">' + esc(c.needsNewJob ? "New job needed" : (c.jobId ? ("#" + c.jobId) : "—")) + "</div>" +
          '<div class="muted">' + esc(jobLine) + "</div></div>" +
        '<div class="confirm-row"><div class="field-lab">Action</div><div class="h2">' + esc(actionLab) + "</div></div>" +
      "</div>" +
      (c.needsNewJob
        ? '<button class="btn accent" ' + act("voiceNewJob") + ">New job for " + esc(c.customerName || "customer") + "</button>" +
          '<div class="note">This opens the same New job flow as the customer page. After the job is created you’ll be asked to confirm clock-in.</div>'
        : '<button class="btn teal" ' + act("confirmVoice") + ">Confirm " + esc(actionLab.toLowerCase()) + "</button>") +
      '<button class="btn ghost" style="margin-top:8px" ' + act("closeSheet") + ">Cancel</button>"
    );
  }


  function sheetHtml() {
    const s = state.sheet;
    if (!s) return "";
    if (s === "newCall") return newCallSheet();
    if (s === "equipment") return equipmentSheet();
    const job = getJob(state.openJobId);
    if (s === "note") return noteSheet();
    if (s === "timeEdit") return job ? timeEditSheet(job) : "";
    if (s === "actingAs") return actingAsSheet();
    if (s === "voice") return voiceSheet();
    if (s === "voiceConfirm") return voiceConfirmSheet();
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
    if (state.sheet === "scheduleVisit") {
      const v = getVisit(state.scheduleVisitId);
      const d = state.scheduleDraft || { date: "", time: "" };
      const c = v ? getCustomer(v.customerId) : null;
      return backdrop(
        '<div class="sheet-head"><div class="sheet-title">Schedule visit</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
        (v ? '<div class="h2" style="margin-bottom:6px">' + esc(c ? c.name : "") + " · " + esc(v.label) + "</div>" : "") +
        '<div class="cal-note">This saves the time on this phone’s visit list only. It does not write to Google Calendar. After the customer confirms, ask the assistant to put it on steveseguine51@gmail.com. ' + esc(availabilitySummary()) + "</div>" +
        '<label class="field"><div class="field-lab">Date</div><input id="sv-date" type="date" value="' + esc(d.date) + '" oninput="RT.setSched(\'date\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Arrive (PT)</div><input id="sv-time" type="time" value="' + esc(d.time) + '" oninput="RT.setSched(\'time\', this.value)"></label>' +
        '<button class="btn accent" ' + act("saveSchedule") + ">Save time on this visit</button>"
      );
    }
    return "";
  }

  function mainHtml() {
    if (state.screen === "settings") return settingsScreen();
    if (state.screen === "plans") return plansScreen();
    if (state.screen === "timeCorrections") return timeCorrectionsScreen();
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
    persist();
    ensureTimer();
  }

  function handle(name, arg) {
    if (name === "tab") { state.tab = arg; state.openJobId = null; state.openCustomerId = null; state.screen = null; state.query = ""; render(); return; }
    if (name === "filter") { state.filter = arg; render(); return; }
    if (name === "openJob") { state.openJobId = arg; state.openCustomerId = null; render(); return; }
    if (name === "closeJob") { state.openJobId = null; render(); return; }
    if (name === "openCustomer") { state.openCustomerId = arg; render(); return; }
    if (name === "closeCustomer") { state.openCustomerId = null; render(); return; }
    if (name === "closeSheet") { closeSheet(); return; }
    if (name === "openPlans") { state.screen = "plans"; state.openJobId = null; state.openCustomerId = null; render(); return; }
    if (name === "closePlans") { state.screen = null; state.tab = "jobs"; render(); return; }
    if (name === "openSettings") { state.screen = "settings"; render(); return; }
    if (name === "closeSettings") { state.screen = null; render(); return; }
    if (name === "toggleCompleted" || name === "setBoardMode") {
      const mode = name === "setBoardMode" ? (arg || "board") : (state.boardMode === "all" ? "board" : "all");
      state.boardMode = mode;
      if (mode === "all") state.filter = "all";
      else state.filter = "open";
      if (mode !== "all") state.query = state.query; // keep search only when user is searching
      render(); return;
    }
    if (name === "openActingAs") { state.sheet = "actingAs"; render(); return; }
    if (name === "openTimeCorrections") { state.screen = "timeCorrections"; state.sheet = null; state.openJobId = null; state.openCustomerId = null; render(); return; }
    if (name === "closeTimeCorrections") { state.screen = null; state.tab = "jobs"; render(); return; }
    if (name === "toggleCanEditOwnTimes") {
      if (!isAdminTech(actingAs())) { showToast("Only Steve can change that setting"); return; }
      state.techRecords = (state.techRecords || []).map(function (r) {
        if (r.name !== arg || r.role === "admin") return r;
        return Object.assign({}, r, { canEditOwnTimes: !r.canEditOwnTimes });
      });
      render(); return;
    }
    if (name === "openVisit") {
      const v = getVisit(arg);
      if (!v) return;
      state.screen = null;
      state.openCustomerId = v.customerId;
      state.openJobId = null;
      render(); return;
    }
    if (name === "scheduleVisit") {
      const v = getVisit(arg);
      if (!v) return;
      state.scheduleVisitId = v.id;
      const existing = v.scheduledStart ? toInputValue(v.scheduledStart) : "";
      // toInputValue is datetime-local; split
      let date = "", time = "";
      if (v.scheduledStart) {
        const d = parseStamp(v.scheduledStart);
        if (d) {
          const p = tzParts(d);
          date = p.year + "-" + pad2(p.month) + "-" + pad2(p.day);
          time = pad2(p.hour) + ":" + pad2(p.minute);
        }
      }
      state.scheduleDraft = { date: date, time: time };
      state.sheet = "scheduleVisit";
      render(); return;
    }
    if (name === "saveSchedule") {
      const v = getVisit(state.scheduleVisitId);
      const d = state.scheduleDraft || {};
      if (!v || !d.date || !d.time) { showToast("Pick a date and time"); return; }
      const start = fromInputValue(d.date + "T" + d.time);
      if (!start) { showToast("Could not read that time"); return; }
      const plan = planById(v.planId);
      const dur = (plan && plan.type === "calvary_3x") ? 4 : 2;
      const end = new Date(parseStamp(start).getTime() + dur * 60 * 60 * 1000).toISOString();
      updateVisit(v.id, { scheduledStart: start, scheduledEnd: end, status: "scheduled" });
      const job = getJob(v.jobId);
      if (job) {
        job.scheduledStart = start;
        job.scheduledEnd = end;
        if (job.status === "new") job.status = "approved";
        job.timeline = [t("tsched" + Date.now(), "system", formatDateTime(start) + " PT", "Scheduled", "Saved on this phone. Ask the assistant to put it on Google Calendar.")].concat(job.timeline || []);
      }
      closeSheet();
      showToast("Time saved on this phone. Calendar is not updated yet.");
      return;
    }
    if (name === "copyBooking") {
      const v = getVisit(arg);
      const url = bookingUrl(v);
      if (!url) { showToast("No booking link for this visit"); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { showToast("Booking link copied"); }).catch(function () { window.prompt("Copy booking link", url); });
      } else {
        window.prompt("Copy booking link", url);
      }
      return;
    }
    if (name === "markVisitDone") {
      const v = getVisit(arg);
      if (!v) return;
      updateVisit(v.id, { status: "done", completedOn: todayYmd() });
      const job = getJob(v.jobId);
      if (job && job.status !== "paid") {
        job.status = "done";
        job.timeline = [t("tdone" + Date.now(), "system", "Just now", "Visit done", "Marked done on this phone.")].concat(job.timeline || []);
      }
      state.openJobId = v.jobId || state.openJobId;
      state.openCustomerId = v.jobId ? null : v.customerId;
      state.sheet = "note";
      state.noteDraft = emptyNoteDraft("maintenance");
      showToast("Visit marked done. Add the maintenance note.");
      return;
    }
    if (name === "sheet") {
      state.sheet = arg;
      if (arg === "reading") { const j = getJob(state.openJobId); state.readingDraft = { mode: defaultMode(j), label: "Arrival", values: {}, fromScreenshot: false }; }
      if (arg === "note") state.noteDraft = emptyNoteDraft("visit");
      render(); return;
    }
    if (name === "openNewCall") {
      state.sheet = "newCall"; state.newCallStep = 1;
      state.newCall = { chips: [], detail: "", urgency: "today", customerId: "", isNew: false, fromCustomer: false, newName: "", newPhone: "", newAddress: "", newCity: "Long Beach", newEmail: "", custQuery: "" };
      render(); return;
    }
    if (name === "newJobFromCustomer") {
      const c = getCustomer(arg);
      if (!c) return;
      state.openCustomerId = c.id;
      state.sheet = "newCall";
      state.newCallStep = 1;
      state.newCall = { chips: [], detail: "", urgency: "today", customerId: c.id, isNew: false, fromCustomer: true, newName: "", newPhone: "", newAddress: "", newCity: "Long Beach", newEmail: "", custQuery: c.name };
      render(); return;
    }
    if (name === "addEquipment") {
      state.openCustomerId = arg || state.openCustomerId;
      state.assetCustomerId = state.openCustomerId;
      state.assetDraft = emptyAsset();
      state.assetEditingId = null;
      state.sheet = "equipment";
      render(); return;
    }
    if (name === "openAsset") {
      const parts = String(arg || "").split("|");
      const cid = parts[0];
      const aid = parts.slice(1).join("|");
      const c = getCustomer(cid);
      const a = c && (c.assets || []).find(function (x) { return x.id === aid; });
      if (!c || !a) return;
      state.assetCustomerId = cid;
      state.assetDraft = JSON.parse(JSON.stringify(a));
      state.assetEditingId = a.id;
      state.sheet = "equipment";
      render(); return;
    }
    if (name === "assetType") { state.assetDraft.type = arg; if (arg !== "other") state.assetDraft.typeOther = ""; render(); return; }
    if (name === "assetLocation") {
      if (arg === "Other") {
        if (EQUIPMENT_LOCATIONS.indexOf(state.assetDraft.location) !== -1) state.assetDraft.location = "";
      } else {
        state.assetDraft.location = arg;
      }
      render(); return;
    }
    if (name === "toggleAssetSample") { state.assetDraft.sample = !state.assetDraft.sample; render(); return; }
    if (name === "clearAssetPhoto") { state.assetDraft.photo = ""; render(); return; }
    if (name === "saveEquipment") {
      const c = getCustomer(state.assetCustomerId || state.openCustomerId);
      if (!c) return;
      const draft = JSON.parse(JSON.stringify(state.assetDraft));
      if (!draft.id) draft.id = "a" + Date.now();
      if (!c.assets) c.assets = [];
      if (state.assetEditingId) {
        const i = c.assets.findIndex(function (x) { return x.id === state.assetEditingId; });
        if (i >= 0) c.assets[i] = draft;
        else c.assets.push(draft);
      } else {
        c.assets.push(draft);
      }
      state.sheet = null;
      showToast(draft.sample ? "Example equipment saved on this phone only" : "Equipment saved on this phone only");
      return;
    }
    if (name === "removeEquipment") {
      const c = getCustomer(state.assetCustomerId || state.openCustomerId);
      if (!c || !state.assetEditingId) return;
      c.assets = (c.assets || []).filter(function (x) { return x.id !== state.assetEditingId; });
      state.sheet = null;
      showToast("Equipment removed");
      return;
    }
    if (name === "toggleChip") {
      const chips = state.newCall.chips.slice();
      const i = chips.indexOf(arg);
      if (i === -1) chips.push(arg); else chips.splice(i, 1);
      state.newCall.chips = chips; render(); return;
    }
    if (name === "urgency") { state.newCall.urgency = arg; render(); return; }
    if (name === "ncNext") {
      if (state.newCallStep === 1) state.newCallStep = state.newCall.fromCustomer ? 3 : 2;
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
        state.customers = [{ id: customerId, name: customer, address: address, city: city, phone: phone, email: (nc.newEmail || "").trim(), assets: [], mentions: [] }].concat(state.customers);
      } else {
        const c = state.customers.find(function (x) { return x.id === customerId; });
        customer = c.name; address = c.address; city = c.city; phone = c.phone;
      }
      const problem = reportText(nc.chips, nc.detail, nc.urgency);
      const job = { id: id, customerId: customerId, customer: customer, address: address, city: city, phone: phone, problem: problem, status: "new", lineItems: [{ label: "Diagnostic", amount: 150 }], total: 150, readingSets: [], timeline: [t("t" + id, "call", "Just now", "Call", problem)] };
      state.jobs = [job].concat(state.jobs);
      state.sheet = null;
      state.openCustomerId = null;
      state.openJobId = id;
      state.tab = "jobs";
      state.filter = "open";
      if (state.clockInAfterCreate) {
        state.clockInAfterCreate = false;
        state.voiceConfirm = {
          action: "clockIn",
          raw: state._pendingVoiceRaw || "",
          tech: state.currentTech || DEFAULT_TECH,
          customer: getCustomer(customerId),
          customerId: customerId,
          customerName: customer,
          job: job,
          jobId: id,
          problem: problem,
          work: "",
          needsNewJob: false
        };
        state.sheet = "voiceConfirm";
        showToast("Job " + id + " created · confirm clock-in");
        return;
      }
      showToast("Job " + id + " created");
      return;
    }
    if (name === "saveNote") {
      const job = getJob(state.openJobId); if (!job) return;
      const d = state.noteDraft || emptyNoteDraft("visit");
      let body = "";
      let title = "Note";
      if (d.type === "maintenance") { body = formatMaintNote(d); title = "Maintenance note"; }
      else if (d.type === "scope") { body = formatScopeNote(d); title = "Scope"; }
      else { body = formatVisitNote(d); title = "Visit note"; }
      if (!body.trim()) body = "Note captured on site.";
      job.timeline = [{ id: "n" + Date.now(), kind: "note", time: "Just now", title: title, body: body }].concat(job.timeline);
      let extra = "";
      const c = getCustomer(job.customerId);
      if (saveNameplateToCustomer(c, d.nameplate)) extra = " Nameplate saved to the customer’s equipment profile.";
      state.noteDraft = emptyNoteDraft("visit");
      state.sheet = "saved";
      showToast(title + " saved on this phone only." + extra);
      return;
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
    if (name === "pickTech") {
      state.currentTech = arg;
      if (state.sheet === "actingAs") state.sheet = null;
      render(); return;
    }
    if (name === "addTech") {
      const n = (state._newTech || "").trim();
      if (!n) { showToast("Enter a tech name"); return; }
      state.techRecords = normalizeTechRecords((state.techs || []).concat([n]), state.techRecords);
      state.techs = techNamesFrom(state.techRecords);
      state.currentTech = n;
      state._newTech = "";
      if (state.sheet === "actingAs") state.sheet = null;
      render(); return;
    }
    if (name === "clockIn") {
      const job = getJob(state.openJobId); if (!job) return;
      const res = clockInJob(job, state.currentTech || DEFAULT_TECH);
      if (!res.ok) { showToast(res.msg); return; }
      showToast("Clocked in · " + (state.currentTech || DEFAULT_TECH));
      return;
    }
    if (name === "clockOut") {
      const job = getJob(state.openJobId); if (!job) return;
      const res = clockOutJob(job, state.currentTech || DEFAULT_TECH);
      if (!res.ok) { showToast(res.msg); return; }
      showToast("Clocked out · " + formatHours(entryHours(res.entry)));
      return;
    }
    if (name === "toggleTimeOnInvoice") {
      const job = getJob(state.openJobId); if (!job) return;
      job.showTimeOnInvoice = !showTimeOnInvoice(job);
      render(); return;
    }
    if (name === "editTime" || name === "requestCorrection") {
      const job = getJob(state.openJobId); if (!job) return;
      const entry = jobTimeEntries(job).find(function (e) { return e.id === arg; });
      if (!entry) return;
      const request = name === "requestCorrection" || !canEditTimestamps(actingAs(), entry);
      if (request && pendingOnEntry(entry)) { showToast("A correction request is already pending on this entry."); return; }
      state.timeEdit = { entryId: entry.id, tech: entry.tech, clockIn: toInputValue(entry.clockIn), clockOut: entry.clockOut ? toInputValue(entry.clockOut) : "", reason: "", request: request };
      state.sheet = "timeEdit";
      render(); return;
    }
    if (name === "saveTimeEdit") {
      const job = getJob(state.openJobId); if (!job) return;
      const d = state.timeEdit || {};
      if (!(d.reason || "").trim()) { showToast("A reason is required"); return; }
      const entry = jobTimeEntries(job).find(function (e) { return e.id === d.entryId; });
      if (!entry) return;
      if (!canEditTimestamps(actingAs(), entry)) { showToast("You can’t edit timestamps directly. Submit a correction request."); return; }
      const res = applyTimeEdit(job, entry, { tech: d.tech, clockIn: fromInputValue(d.clockIn), clockOut: fromInputValue(d.clockOut), reason: d.reason.trim() }, actingAs());
      if (!res.ok) { showToast(res.msg); return; }
      state.sheet = null;
      showToast("Time entry updated · history stays in the app");
      return;
    }
    if (name === "saveCorrectionRequest") {
      const job = getJob(state.openJobId); if (!job) return;
      const d = state.timeEdit || {};
      if (!(d.reason || "").trim()) { showToast("A reason is required"); return; }
      const entry = jobTimeEntries(job).find(function (e) { return e.id === d.entryId; });
      if (!entry) return;
      const res = submitCorrectionRequest(job, entry, { tech: d.tech, clockIn: fromInputValue(d.clockIn), clockOut: fromInputValue(d.clockOut), reason: d.reason.trim() }, actingAs());
      if (!res.ok) { showToast(res.msg); return; }
      state.sheet = null;
      showToast("Correction request sent · waiting for Steve");
      return;
    }
    if (name === "approveCorrection" || name === "rejectCorrection") {
      if (!isAdminTech(actingAs())) { showToast("Only Steve can approve or reject time corrections"); return; }
      const parts = String(arg || "").split("|");
      const job = getJob(parts[0]);
      const entry = job && jobTimeEntries(job).find(function (e) { return e.id === parts[1]; });
      if (!job || !entry) return;
      let note = "";
      if (name === "rejectCorrection") {
        note = (window.prompt("Optional note for the rejection:") || "").trim();
      }
      const res = reviewCorrection(job, entry, parts[2], name === "approveCorrection" ? "approved" : "rejected", actingAs(), note);
      if (!res.ok) { showToast(res.msg); return; }
      showToast(name === "approveCorrection" ? "Correction approved · times updated" : "Correction rejected · times unchanged");
      return;
    }
    if (name === "noteType") { state.noteDraft.type = arg; render(); return; }
    if (name === "addRec") { state.noteDraft.recs = (state.noteDraft.recs || []).concat([{ text: "", reason: "" }]); render(); return; }
    if (name === "npType") { state.noteDraft.nameplate.type = arg; render(); return; }
    if (name === "clearNpPhoto") { state.noteDraft.nameplate.photo = ""; render(); return; }
    if (name === "openVoice") { startListening(); return; }
    if (name === "submitVoice") { applyVoiceText((state.voice && state.voice.text) || ""); return; }
    if (name === "confirmVoice") {
      const c = state.voiceConfirm; if (!c) return;
      let job = c.jobId ? getJob(c.jobId) : null;
      if (!job) { showToast("That job isn’t available."); return; }
      state.openJobId = job.id;
      state.openCustomerId = null;
      const tech = c.tech || state.currentTech || DEFAULT_TECH;
      const res = c.action === "clockOut" ? clockOutJob(job, tech) : clockInJob(job, tech);
      state.voiceConfirm = null;
      state.sheet = null;
      if (!res.ok) { showToast(res.msg); return; }
      showToast(c.action === "clockOut" ? ("Clocked out · " + formatHours(entryHours(res.entry))) : ("Clocked in · " + tech));
      return;
    }
    if (name === "voiceNewJob") {
      const c = state.voiceConfirm; if (!c || !c.customerId) return;
      state.clockInAfterCreate = true;
      state._pendingVoiceRaw = c.raw || "";
      const cust = getCustomer(c.customerId);
      if (!cust) return;
      state.openCustomerId = cust.id;
      state.sheet = "newCall";
      state.newCallStep = 1;
      state.newCall = { chips: [], detail: c.work || "", urgency: "today", customerId: cust.id, isNew: false, fromCustomer: true, newName: "", newPhone: "", newAddress: "", newCity: "Long Beach", newEmail: "", custQuery: cust.name };
      render(); return;
    }
    if (name === "captureNeedJob") { state._pendingCapture = arg; state.sheet = "pickJob"; render(); return; }
    if (name === "pickJobCapture") {
      state.openJobId = arg; state.openCustomerId = null;
      const kind = state._pendingCapture || "note";
      if (kind === "reading") { const j = getJob(arg); state.readingDraft = { mode: defaultMode(j), label: "Arrival", values: {}, fromScreenshot: false }; }
      state.sheet = kind; render(); return;
    }
  }

  function speechAvailable() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  let recognition = null;
  function voiceContext() {
    return {
      job: state.openJobId ? getJob(state.openJobId) : null,
      customer: state.openCustomerId ? getCustomer(state.openCustomerId) : null
    };
  }
  function applyVoiceText(text) {
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    const parsed = parseVoiceCommand(text, voiceContext());
    state.voice.listening = false;
    state.voice.text = text || "";
    if (parsed.error) {
      state.voice.fallback = true;
      state.voice.error = parsed.error;
      state.sheet = "voice";
      render();
      return;
    }
    state.voiceConfirm = parsed;
    state.sheet = "voiceConfirm";
    render();
  }
  function startListening() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      state.voice = { listening: false, text: state.voice && state.voice.text || "", fallback: true, error: "This browser doesn’t support voice. Type the command instead. On iPhone, use Safari." };
      state.sheet = "voice";
      render();
      return;
    }
    try {
      if (recognition) { try { recognition.abort(); } catch (e) {} }
      recognition = new Ctor();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.onresult = function (ev) {
        let said = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) said += ev.results[i][0].transcript;
        state.voice.text = said.trim();
        const el = document.getElementById("voice-text");
        if (el) el.textContent = state.voice.text;
        if (ev.results[ev.results.length - 1].isFinal) applyVoiceText(state.voice.text);
      };
      recognition.onerror = function (ev) {
        state.voice.listening = false;
        state.voice.fallback = true;
        state.voice.error = ev.error === "not-allowed"
          ? "Microphone permission was denied. Type the command instead."
          : "Voice isn’t available right now. Type the command instead.";
        state.sheet = "voice";
        render();
      };
      recognition.onend = function () { state.voice.listening = false; };
      state.voice = { listening: true, text: "", fallback: false, error: "" };
      state.sheet = "voice";
      render();
      recognition.start();
    } catch (err) {
      state.voice = { listening: false, text: "", fallback: true, error: "Voice isn’t available. Type the command instead." };
      state.sheet = "voice";
      render();
    }
  }
  let timerInterval = null;
  function tickTimers() {
    const nodes = document.querySelectorAll("[data-timer-start]");
    nodes.forEach(function (el) {
      const start = Date.parse(el.getAttribute("data-timer-start"));
      if (!isNaN(start)) el.textContent = formatElapsed(Date.now() - start);
    });
  }
  function ensureTimer() {
    if (!timerInterval) timerInterval = setInterval(tickTimers, 1000);
    tickTimers();
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

  function applyHash() {
    const h = (location.hash || "").replace(/^#/, "");
    if (!h) return;
    if (h === "plans") { state.screen = "plans"; state.openJobId = null; state.openCustomerId = null; return; }
    if (h === "settings") { state.screen = "settings"; return; }
    if (h === "time-corrections") { state.screen = "timeCorrections"; state.openJobId = null; state.openCustomerId = null; return; }
    if (h.indexOf("job/") === 0) {
      const id = h.slice(4);
      if (getJob(id) || (state.moneyJobs || []).some(function (j) { return j.id === id; })) {
        state.openJobId = id; state.openCustomerId = null; state.screen = null;
      }
      return;
    }
    if (h.indexOf("customer/") === 0) {
      const id = h.slice(9);
      if (getCustomer(id)) { state.openCustomerId = id; state.openJobId = null; state.screen = null; }
    }
  }
  function syncHash() {
    let want = "";
    if (state.screen === "settings") want = "settings";
    else if (state.screen === "plans") want = "plans";
    else if (state.screen === "timeCorrections") want = "time-corrections";
    else if (state.openCustomerId) want = "customer/" + state.openCustomerId;
    else if (state.openJobId) want = "job/" + state.openJobId;
    const next = want ? ("#" + want) : (location.pathname + (location.search || "") + (location.hash && !want ? "" : ""));
    const cur = want ? ("#" + (location.hash || "").replace(/^#/, "")) : (location.pathname + (location.search || ""));
    if (want) {
      if (location.hash !== "#" + want) try { history.replaceState(null, "", "#" + want); } catch (e) {}
    } else if (location.hash) {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    }
  }
  const _render0 = render;
  render = function () {
    _render0();
    syncHash();
  };

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  }
  window.addEventListener("hashchange", function () { applyHash(); _render0(); });
  applyHash();
  render();
})();
