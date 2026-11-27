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
    invoiced: { label: "Awaiting payment", short: "Await.", step: 5, bar: "#C45C1A", bg: "#FAE8DB", text: "#8A3A0C", bgDark: "#3A2418", textDark: "#F0B090" },
    paid: { label: "Paid", short: "Paid", step: 6, bar: "#1F7A4D", bg: "#E3F5EC", text: "#145C38", bgDark: "#143326", textDark: "#8FDBB0" },
    posted: { label: "Posted", short: "Posted", step: 6, bar: "#1F4D3A", bg: "#E1ECE6", text: "#123A2A", bgDark: "#12261D", textDark: "#9FD1B8" },
    superseded: { label: "Replaced", short: "Repl.", step: 2, bar: "#6B7280", bg: "#EEF0F2", text: "#4B5563", bgDark: "#2A2E32", textDark: "#C5CBD1" }
  };
  const PIPELINE = [
    { step: 0, label: "New" }, { step: 1, label: "Diag." }, { step: 2, label: "Est." },
    { step: 3, label: "Appr." }, { step: 4, label: "Work" }, { step: 5, label: "Inv." }, { step: 6, label: "Paid" }
  ];
  const FILTERS = [
    ["open", "Open"], ["all", "All"], ["new", "New call"], ["diagnosis", "Diagnosis"], ["estimate", "Estimate sent"],
    ["approved", "Approved"], ["progress", "In progress"], ["done", "Work done"], ["invoiced", "Awaiting payment"], ["paid", "Paid"]
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
    /* Continue the Housecall Pro 55xxx sequence. Ignore old 25xxx estimate-style numbers. */
    return (Number.isFinite(n) && n >= 50000) ? n : 0;
  }
  function nextJobId(jobs) {
    const lists = (jobs || []).concat((state && state.moneyJobs) ? state.moneyJobs : []);
    const maxRt = lists.reduce(function (m, j) { return Math.max(m, reliaTechJobNum(j.id)); }, 55720);
    const held = [].concat((PLAN_SEED && PLAN_SEED.voidedJobIds) || [], (PLAN_SEED && PLAN_SEED.reservedJobIds) || []);
    const maxHeld = held.reduce(function (m, id) { return Math.max(m, reliaTechJobNum(id)); }, 0);
    return String(Math.max(maxRt, maxHeld) + 1);
  }
  function lineTotal(l) {
    if (!l) return 0;
    if (l.flatTotal != null && l.flatTotal !== "") return Number(l.flatTotal);
    return (Number(l.amount) || 0) * (l.qty || 1);
  }
  function draftTotal(lines) { return (lines || []).reduce(function (s, l) { return s + lineTotal(l); }, 0); }
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
    { id: "furnace", label: "Furnace" },
    { id: "airhandler", label: "Air handler" },
    { id: "condenser", label: "Condenser (AC)" },
    { id: "heatpump", label: "Heat pump" },
    { id: "package", label: "Package unit" },
    { id: "minisplit_in", label: "Mini split (indoor)" },
    { id: "minisplit_out", label: "Mini split (outdoor)" },
    { id: "coil", label: "Evaporator coil" },
    { id: "waterheater", label: "Water heater" },
    { id: "thermostat", label: "Thermostat" },
    { id: "other", label: "Other" }
  ];
  const EQUIPMENT_LOCATIONS = ["Attic", "Garage", "Closet", "Side yard", "Backyard", "Rooftop", "Crawlspace", "Other"];
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
    if (a.hcpLabel) parts.push(a.hcpLabel);
    if (a.location) parts.push(a.location);
    if (a.serial) parts.push("S/N " + a.serial);
    if (a.filterSize) parts.push("Filter " + a.filterSize);
    if (a.lastServiced) parts.push("Last serviced " + a.lastServiced);
    if (a.source === "HCP") parts.push("from HCP");
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
  function customerAssets(c) {
    if (!c) return [];
    const fromAddr = serviceAddresses(c).reduce(function (acc, a) { return acc.concat(a.assets || []); }, []);
    if (fromAddr.length) return fromAddr;
    return c.assets ? c.assets : [];
  }
  function assetPreview(c) {
    const assets = customerAssets(c);
    if (assets.length) return assetTitle(assets[0]) + (assets.length > 1 ? " +" + (assets.length - 1) : "");
    return "";
  }
  function getCustomer(id) { return state.customers.find(function (c) { return c.id === id; }) || null; }

  function emptyAddress(partial) {
    return Object.assign({
      id: "",
      label: "",
      address: "",
      city: "",
      onsiteName: "",
      onsitePhone: "",
      accessNotes: "",
      assets: [],
      mentions: [],
      example: false
    }, partial || {});
  }
  function serviceAddresses(c) { return (c && Array.isArray(c.addresses)) ? c.addresses : []; }
  function primaryAddress(c) { return serviceAddresses(c)[0] || null; }
  function syncCustomerPrimary(c) {
    if (!c) return c;
    const a = primaryAddress(c);
    if (a) {
      c.address = a.address || "";
      c.city = a.city || "";
    } else if (!serviceAddresses(c).length) {
      /* billing-only contact may have no service address */
    }
    return c;
  }
  function nextAddressId(customerId, customers) {
    const list = customers || (state && state.customers) || [];
    const used = {};
    list.forEach(function (c) {
      serviceAddresses(c).forEach(function (a) { if (a && a.id) used[a.id] = true; });
    });
    let n = 1;
    const prefix = "sa-" + (customerId || "x") + "-";
    while (used[prefix + n]) n += 1;
    return prefix + n;
  }
  function getAddressById(id, customers) {
    if (!id) return null;
    const list = customers || (state && state.customers) || [];
    for (let i = 0; i < list.length; i++) {
      const addrs = serviceAddresses(list[i]);
      for (let k = 0; k < addrs.length; k++) {
        if (addrs[k].id === id) return addrs[k];
      }
    }
    return null;
  }
  function customerOfAddress(id, customers) {
    if (!id) return null;
    const list = customers || (state && state.customers) || [];
    for (let i = 0; i < list.length; i++) {
      if (serviceAddresses(list[i]).some(function (a) { return a.id === id; })) return list[i];
    }
    return null;
  }
  function ensureCustomerAddresses(c, customers) {
    if (!c) return c;
    if (c.billingSameAsService == null) c.billingSameAsService = true;
    if (c.billingAddress == null) c.billingAddress = "";
    if (c.billingCity == null) c.billingCity = "";
    if (!Array.isArray(c.addresses)) c.addresses = [];
    if (!c.addresses.length) {
      const hasHome = !!(c.address || c.city || (c.assets && c.assets.length) || (c.mentions && c.mentions.length));
      if (hasHome) {
        c.addresses.push(emptyAddress({
          id: nextAddressId(c.id, customers || [c]),
          address: c.address || "",
          city: c.city || "",
          assets: Array.isArray(c.assets) ? c.assets.slice() : [],
          mentions: Array.isArray(c.mentions) ? c.mentions.slice() : []
        }));
        c.assets = [];
        c.mentions = [];
      }
    } else {
      if ((c.assets && c.assets.length) || (c.mentions && c.mentions.length)) {
        const first = c.addresses[0];
        first.assets = (first.assets || []).concat(c.assets || []);
        first.mentions = (first.mentions || []).concat(c.mentions || []);
        c.assets = [];
        c.mentions = [];
      }
      c.addresses.forEach(function (a) {
        if (!a.id) a.id = nextAddressId(c.id, customers || [c]);
        if (!Array.isArray(a.assets)) a.assets = [];
        if (!Array.isArray(a.mentions)) a.mentions = [];
      });
    }
    return syncCustomerPrimary(c);
  }
  function ensureJobParties(j, customers) {
    if (!j) return j;
    if (!Array.isArray(j.estimates)) j.estimates = [];
    if (!j.billToCustomerId) j.billToCustomerId = j.customerId || "";
    if (!j.customerRef) j.customerRef = j.customerRef || "";
    if (!j.referredBy) j.referredBy = j.referredBy || "";
    if (j.addressId && getAddressById(j.addressId, customers)) return j;
    const c = (customers || (state && state.customers) || []).find(function (x) { return x.id === j.customerId; });
    if (c) {
      const addrs = serviceAddresses(c);
      const match = addrs.find(function (a) {
        return (a.address || "") === (j.address || "") && (a.city || "") === (j.city || "");
      }) || addrs[0];
      if (match) j.addressId = match.id;
    }
    return j;
  }
  function ensurePlanAddress(p, customers) {
    if (!p) return p;
    if (p.addressId && getAddressById(p.addressId, customers)) return p;
    const c = (customers || (state && state.customers) || []).find(function (x) { return x.id === p.customerId; });
    if (!c) return p;
    const addrs = serviceAddresses(c);
    if (!addrs.length) return p;
    const site = String(p.siteAddress || "").toLowerCase();
    const match = addrs.find(function (a) {
      const street = String(a.address || "").toLowerCase();
      return street && site.indexOf(street) !== -1;
    }) || addrs[0];
    p.addressId = match.id;
    return p;
  }
  function ensureVisitAddress(v, customers, plans) {
    if (!v) return v;
    if (v.addressId && getAddressById(v.addressId, customers)) return v;
    const plan = (plans || (state && state.plans) || []).find(function (p) { return p.id === v.planId; });
    if (plan && plan.addressId) { v.addressId = plan.addressId; return v; }
    const c = (customers || (state && state.customers) || []).find(function (x) { return x.id === v.customerId; });
    const a = c ? primaryAddress(c) : null;
    if (a) v.addressId = a.id;
    return v;
  }
  function formatAddrLine(address, city) {
    return [address, city].filter(function (x) { return x && String(x).trim(); }).join(", ");
  }
  function addressLine(a) {
    if (!a) return "";
    const line = formatAddrLine(a.address, a.city);
    return a.label ? (a.label + " · " + line) : line;
  }
  function serviceAddressOf(job) {
    if (!job) return null;
    const found = getAddressById(job.addressId);
    if (found) return found;
    const c = getCustomer(job.customerId);
    if (c) {
      const match = serviceAddresses(c).find(function (a) {
        return (a.address || "") === (job.address || "");
      });
      return match || primaryAddress(c);
    }
    if (job.address || job.city) return emptyAddress({ address: job.address || "", city: job.city || "" });
    return null;
  }
  function billToCustomer(job) {
    if (!job) return null;
    return getCustomer(job.billToCustomerId) || getCustomer(job.customerId);
  }
  function billingInfo(customer, job) {
    if (!customer) return { name: "", address: "", city: "", phone: "", email: "" };
    if (customer.billingSameAsService === false && (customer.billingAddress || customer.billingCity)) {
      return { name: customer.name, address: customer.billingAddress || "", city: customer.billingCity || "", phone: customer.phone || "", email: customer.email || "" };
    }
    const loc = job ? serviceAddressOf(job) : primaryAddress(customer);
    return {
      name: customer.name,
      address: loc ? loc.address : (customer.address || ""),
      city: loc ? loc.city : (customer.city || ""),
      phone: customer.phone || "",
      email: customer.email || ""
    };
  }
  function jobsForAddress(addressId) {
    if (!addressId) return [];
    return state.jobs.concat(state.moneyJobs || []).filter(function (j) { return j.addressId === addressId; });
  }
  function jobsForCustomer(c) {
    if (!c) return [];
    const addrIds = {};
    serviceAddresses(c).forEach(function (a) { if (a.id) addrIds[a.id] = true; });
    return state.jobs.concat(state.moneyJobs || []).filter(function (j) {
      return j.customerId === c.id || addrIds[j.addressId] || j.billToCustomerId === c.id;
    });
  }
  function serviceJobsForCustomer(c) {
    if (!c) return [];
    const addrIds = {};
    serviceAddresses(c).forEach(function (a) { if (a.id) addrIds[a.id] = true; });
    return state.jobs.concat(state.moneyJobs || []).filter(function (j) {
      return j.customerId === c.id || addrIds[j.addressId];
    });
  }
  function billedOnlyJobs(c) {
    if (!c) return [];
    const addrIds = {};
    serviceAddresses(c).forEach(function (a) { if (a.id) addrIds[a.id] = true; });
    return state.jobs.concat(state.moneyJobs || []).filter(function (j) {
      return j.billToCustomerId === c.id && j.customerId !== c.id && !addrIds[j.addressId];
    });
  }
  function plansForAddress(addressId) {
    return (state.plans || []).filter(function (p) { return p.addressId === addressId; });
  }
  function findAssetHome(customerId, assetId) {
    const c = getCustomer(customerId);
    if (!c || !assetId) return null;
    const addrs = serviceAddresses(c);
    for (let i = 0; i < addrs.length; i++) {
      const asset = (addrs[i].assets || []).find(function (x) { return x.id === assetId; });
      if (asset) return { customer: c, address: addrs[i], asset: asset };
    }
    const leftover = (c.assets || []).find(function (x) { return x.id === assetId; });
    if (leftover) return { customer: c, address: primaryAddress(c), asset: leftover };
    return null;
  }
  function nextEstimateId(job) {
    let max = 0;
    const ids = [(job && job.estimateId) || ""].concat(((job && job.estimates) || []).map(function (e) { return e.id; }));
    ids.forEach(function (id) {
      const m = String(id || "").match(/-E(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return job.id + "-E" + String(max + 1).padStart(2, "0");
  }
  function archiveCurrentEstimate(job) {
    if (!job || !job.estimateId) return;
    if (!Array.isArray(job.estimates)) job.estimates = [];
    const exists = job.estimates.some(function (e) { return e.id === job.estimateId && !e.superseded; });
    if (!exists) {
      const already = job.estimates.find(function (e) { return e.id === job.estimateId; });
      if (already) already.superseded = true;
      else {
        job.estimates.push({
          id: job.estimateId,
          lineItems: JSON.parse(JSON.stringify(job.lineItems || [])),
          total: job.total,
          billToCustomerId: job.billToCustomerId || job.customerId,
          createdAt: isoNow(),
          superseded: true
        });
      }
    } else {
      job.estimates.forEach(function (e) { if (e.id === job.estimateId) e.superseded = true; });
    }
  }
  function applyBillToChange(job, newBillToId) {
    const oldC = billToCustomer(job);
    const newC = getCustomer(newBillToId);
    if (!job || !newC || (oldC && oldC.id === newC.id)) return false;
    const oldName = oldC ? oldC.name : "—";
    const when = formatDate(isoNow()) || "today";
    if (job.estimateId) {
      archiveCurrentEstimate(job);
      const newId = nextEstimateId(job);
      const rev = {
        id: newId,
        lineItems: JSON.parse(JSON.stringify(job.lineItems || [])),
        total: job.total,
        billToCustomerId: newC.id,
        createdAt: isoNow(),
        superseded: false
      };
      job.estimates.push(rev);
      job.estimateId = newId;
    }
    job.billToCustomerId = newC.id;
    const note = "Billing changed from " + oldName + " to " + newC.name + " on " + when;
    job.timeline = [{ id: "bill" + Date.now(), kind: "system", time: "Just now", title: "Billing changed", body: note }].concat(job.timeline || []);
    return true;
  }
  function prettyDateLong() {
    const d = new Date();
    const p = tzParts(d);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[p.month - 1] + " " + p.day + ", " + p.year;
  }
  function docBlocksHtml(job, opts) {
    opts = opts || {};
    const payer = billToCustomer(job);
    const bill = billingInfo(payer, job);
    const loc = serviceAddressOf(job);
    const svcCust = getCustomer(job.customerId);
    const locLine = loc ? formatAddrLine(loc.address, loc.city) : formatAddrLine(job.address, job.city);
    const onsite = loc && (loc.onsiteName || loc.onsitePhone)
      ? ("On site: " + [loc.onsiteName, loc.onsitePhone].filter(Boolean).join(" · "))
      : "";
    const access = loc && loc.accessNotes ? ("Access: " + loc.accessNotes) : "";
    const po = job.customerRef ? ("Ref / PO: " + job.customerRef) : "";
    const referred = job.referredBy ? ("Referred by: " + job.referredBy) : "";
    let html = '<div class="doc-blocks">';
    html += '<div class="doc-block"><div class="k-up">Bill to</div>';
    html += '<div class="h2" style="margin-top:2px">' + esc(bill.name || (payer && payer.name) || job.customer || "—") + "</div>";
    html += '<div class="muted">' + esc(formatAddrLine(bill.address, bill.city) || "—") + "</div>";
    if (bill.phone) html += '<div class="teal" style="margin-top:4px">' + esc(bill.phone) + "</div>";
    if (po) html += '<div class="muted" style="margin-top:4px">' + esc(po) + "</div>";
    html += "</div>";
    html += '<div class="doc-block"><div class="k-up">Service location</div>';
    if (svcCust && payer && svcCust.id !== payer.id) {
      html += '<div class="h2" style="margin-top:2px">' + esc(svcCust.name) + "</div>";
    }
    html += '<div class="' + (svcCust && payer && svcCust.id !== payer.id ? "muted" : "h2") + '" style="margin-top:2px">' + esc(locLine || "—") + "</div>";
    if (onsite) html += '<div class="muted" style="margin-top:4px">' + esc(onsite) + "</div>";
    if (access && !opts.hideAccess) html += '<div class="muted" style="margin-top:4px">' + esc(access) + "</div>";
    html += "</div></div>";
    if (referred && opts.showReferred) html += '<div class="muted" style="margin-bottom:8px">' + esc(referred) + "</div>";
    return html;
  }
  function emptyNewCall(extra) {
    return Object.assign({
      chips: [], detail: "", urgency: "today", customerId: "", isNew: false, fromCustomer: false,
      newName: "", newPhone: "", newAddress: "", newCity: "Long Beach", newEmail: "", custQuery: "",
      addressId: "", billToCustomerId: "", customerRef: "", referredBy: ""
    }, extra || {});
  }
  function customerSearchHay(c) {
    const parts = [c.name, c.address, c.city, c.phone, c.email, c.billingAddress, c.billingCity];
    serviceAddresses(c).forEach(function (a) {
      parts.push(a.address, a.city, a.label, a.onsiteName, a.onsitePhone, a.accessNotes);
    });
    return parts.filter(Boolean).join(" ");
  }
  function addressCard(a, c, opts) {
    opts = opts || {};
    const jobs = jobsForAddress(a.id);
    const assets = a.assets || [];
    const preview = assets.length ? assetTitle(assets[0]) + (assets.length > 1 ? " +" + (assets.length - 1) : "") : "";
    const line = addressLine(a) || "Address not entered";
    const onsite = [a.onsiteName, a.onsitePhone].filter(Boolean).join(" · ");
    return '<button class="list-card" ' + act("openAddress", a.id) + '><div class="job-body" style="min-width:0">' +
      (a.example ? '<div class="meta">Example only · removable</div>' : "") +
      '<div class="job-name" style="margin-top:0">' + esc(line) + "</div>" +
      (onsite ? '<div class="muted">' + esc(onsite) + "</div>" : "") +
      '<div class="muted">' + (jobs.length ? (jobs.length + " job" + (jobs.length === 1 ? "" : "s")) : "No jobs yet") +
      (preview ? " · " + esc(preview) : "") + "</div></div><div class=\"chev\">" + icon("chevron", 18) + "</div></button>";
  }

  function customerMentions(c) {
    if (!c) return [];
    const fromAddr = serviceAddresses(c).reduce(function (acc, a) {
      return acc.concat(a.mentions || []);
    }, []);
    if (fromAddr.length) return fromAddr;
    return c.mentions || [];
  }

  function addressPickerHtml(customer, selectedId, actName) {
    const addrs = serviceAddresses(customer);
    if (!customer || addrs.length <= 1) return "";
    return '<div class="section">Service address</div><div class="stack" style="margin-bottom:12px">' + addrs.map(function (a) {
      const on = selectedId === a.id;
      return '<button class="list-card' + (on ? " sel" : "") + '" style="border:1.5px solid ' + (on ? TEAL : "transparent") + '" ' + act(actName || "pickAddress", a.id) + '><div class="job-body"><div class="job-name" style="margin-top:0">' + esc(addressLine(a) || "Address not entered") + "</div>" +
        (a.onsiteName ? '<div class="muted">' + esc("On site: " + a.onsiteName) + "</div>" : "") +
        (a.example ? '<div class="meta">Example only</div>' : "") +
        "</div></button>";
    }).join("") + "</div>";
  }
  function jobPartiesHeader(job) {
    const loc = serviceAddressOf(job);
    const svc = getCustomer(job.customerId);
    const payer = billToCustomer(job);
    const locLine = loc ? formatAddrLine(loc.address, loc.city) : formatAddrLine(job.address, job.city);
    const onsite = loc && (loc.onsiteName || loc.onsitePhone) ? [loc.onsiteName, loc.onsitePhone].filter(Boolean).join(" · ") : "";
    const bill = billingInfo(payer, job);
    const openArg = loc && loc.id ? loc.id : job.customerId;
    const openAct = loc && loc.id ? "openAddress" : "openCustomer";
    let html = '<div class="linkish" ' + act(openAct, openArg) + ' style="cursor:pointer">' + icon("pin", 16) + "<span>" + esc((svc && svc.name) || job.customer || "") + (locLine ? " · " + esc(locLine) : "") + "</span></div>";
    if (onsite) html += '<div class="muted" style="margin:4px 0 0">On site: ' + esc(onsite) + "</div>";
    html += '<div class="panel" style="margin:12px 0 14px"><div class="k-up">Bill to</div><div class="h2" style="margin-top:2px">' + esc(bill.name || "—") + "</div>" +
      '<div class="muted">' + esc(formatAddrLine(bill.address, bill.city) || "—") + "</div>" +
      (job.customerRef ? '<div class="muted" style="margin-top:4px">Ref / PO: ' + esc(job.customerRef) + "</div>" : "") +
      (job.referredBy ? '<div class="muted" style="margin-top:4px">Referred by: ' + esc(job.referredBy) + "</div>" : "") +
      '<button class="link-btn" style="margin-top:8px" ' + act("openBillTo") + ">Change Bill to</button></div>";
    html += '<label class="field"><div class="field-lab">Customer ref / PO (optional)</div><input id="job-ref" value="' + esc(job.customerRef || "") + '" oninput="RT.setJobField(\'customerRef\', this.value)"></label>';
    html += '<label class="field"><div class="field-lab">Referred by (optional)</div><input id="job-referred" placeholder="e.g. Rocky Gentner" value="' + esc(job.referredBy || "") + '" oninput="RT.setJobField(\'referredBy\', this.value)"></label>';
    return html;
  }
  function estimateHistoryHtml(job) {
    const list = (job.estimates || []).slice().sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    if (!list.length) return "";
    return '<div class="section">Estimates</div><div class="stack" style="margin-bottom:14px">' + list.map(function (e) {
      const payer = getCustomer(e.billToCustomerId);
      const current = e.id === job.estimateId && !e.superseded;
      return '<button class="list-card" ' + act("viewEstimate", e.id) + '><div class="job-body"><div class="row"><div class="h2" style="margin:0">' + esc(e.id) + "</div>" +
        (current ? pill("Current", "#0C5C5C", "#E6F4F4") : pill("Earlier", "#5C5C5C", "var(--field)")) + "</div>" +
        '<div class="muted">Bill to ' + esc(payer ? payer.name : "—") + (e.total != null ? " · " + money(e.total) : "") + "</div></div></button>";
    }).join("") + "</div>";
  }
  function viewEstimateSheet(job) {
    const id = state.viewEstimateId || job.estimateId;
    const rec = ((job.estimates || []).find(function (e) { return e.id === id; })) || {
      id: job.estimateId, lineItems: job.lineItems || [], total: job.total, billToCustomerId: job.billToCustomerId
    };
    const snap = Object.assign({}, job, {
      estimateId: rec.id,
      lineItems: rec.lineItems || [],
      total: rec.total,
      billToCustomerId: rec.billToCustomerId || job.billToCustomerId
    });
    const earlier = rec.superseded ? '<div class="muted" style="margin-bottom:8px">Earlier estimate · kept for reference. Current is ' + esc(job.estimateId || rec.id) + ".</div>" : "";
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Estimate ' + esc(rec.id || "") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      earlier +
      '<div class="doc"><div class="k-up">ReliaTech Services</div>' +
      docBlocksHtml(snap, { showReferred: true }) +
      (rec.lineItems || []).map(function (l, i) {
        const known = lineInBook(l.label);
        return '<div class="row" style="margin-top:6px;align-items:flex-start"><div>' + esc(l.label) +
          (known ? "" : '<div><button class="link-btn" ' + act("saveLineToBook", "saved|" + rec.id + "|" + i) + ">Save to price book</button></div>") +
          "</div><div>" + money(l.amount) + "</div></div>";
      }).join("") +
      '<div class="row" style="margin-top:12px;font-weight:750"><div>Total</div><div>' + money(rec.total || 0) + "</div></div></div>" +
      (rec.lineItems || []).filter(function (l) { return l.builder; }).map(function (l) { return '<div class="meta" style="margin-top:8px;font-weight:700">' + esc(l.label) + "</div>" + builderInternalHtml(l.builder); }).join("") +
      estimateGpHtml((rec.lineItems || []).map(function (l) { return { label: l.label, amount: l.amount, qty: 1, id: l.id, cost: l.cost, fromBook: !!l.fromBook }; })) +
      ((job.estimates || []).indexOf(rec) !== -1 ? estimateExtrasHtml(job, rec) : "") +
      '<button data-pin class="btn" style="margin-top:12px" ' + act("closeSheet") + ">Done</button>");
  }


  const ICONS = {
    home: '<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>',
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
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    book: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4z"/><path d="M9 8h8M9 12h8"/>'
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
  function saveNameplateToCustomer(customer, np, addressId) {
    if (!customer || !nameplateFilled(np)) return false;
    ensureCustomerAddresses(customer, state.customers);
    let loc = addressId ? getAddressById(addressId) : null;
    if (!loc) loc = primaryAddress(customer);
    if (!loc) {
      loc = emptyAddress({ id: nextAddressId(customer.id), address: customer.address || "", city: customer.city || "" });
      customer.addresses = [loc];
    }
    if (!loc.assets) loc.assets = [];
    const asset = emptyAsset();
    asset.type = np.type || "furnace";
    asset.make = (np.make || "").trim();
    asset.model = (np.model || "").trim();
    asset.serial = (np.serial || "").trim();
    asset.refrigerant = (np.refrigerant || "").trim();
    asset.filterSize = (np.filterSize || "").trim();
    asset.photo = np.photo || "";
    loc.assets.push(asset);
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
  function editDistance(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = [];
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }
  function soundKey(w) {
    w = String(w || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return "";
    const codes = { b: 1, f: 1, p: 1, v: 1, c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2, d: 3, t: 3, l: 4, m: 5, n: 5, r: 6 };
    let out = w[0], last = codes[w[0]] || 0;
    for (let i = 1; i < w.length && out.length < 4; i++) {
      const c = codes[w[i]] || 0;
      if (c && c !== last) out += c;
      if (w[i] !== "h" && w[i] !== "w") last = c;
    }
    return (out + "000").slice(0, 4);
  }
  function tokenSim(q, n) {
    if (q === n) return 1;
    if (n.indexOf(q) === 0 && q.length >= 2) return 0.95;
    if (q.indexOf(n) === 0 && n.length >= 3) return 0.85;
    const d = editDistance(q, n);
    const ratio = 1 - d / Math.max(q.length, n.length);
    let sim = ratio;
    if (q.length >= 3 && n.length >= 3 && soundKey(q) === soundKey(n)) sim = Math.max(sim, 0.82);
    return sim;
  }
  /* Fuzzy customer score 0–100: first or last name, either order, small misspellings,
     sound-alike names (Mezo / Meso), partial words, and spoken phone digits. */
  function scoreCustomer(query, c) {
    const base = scoreName(query, c.name);
    if (base >= 90) return base;
    const digits = String(query || "").replace(/\D/g, "");
    if (digits.length >= 4) {
      const phones = [c.phone].concat(serviceAddresses(c).map(function (a) { return a.onsitePhone; })).map(function (x) { return String(x || "").replace(/\D/g, ""); });
      if (phones.some(function (ph) { return ph && ph.indexOf(digits) !== -1; })) return 95;
    }
    const stop = { and: 1, the: 1, llc: 1, inc: 1, mr: 1, mrs: 1, ms: 1, for: 1, job: 1, new: 1 };
    const qt = normalizeName(query).split(" ").filter(function (t) { return t.length > 1 && !stop[t] && !/^\d+$/.test(t); });
    const nt = normalizeName(c.name).split(" ").filter(function (t) { return t.length > 1 && !stop[t]; });
    if (!qt.length || !nt.length) return base;
    let total = 0, strong = 0;
    qt.forEach(function (t) {
      let best = 0;
      nt.forEach(function (x) { best = Math.max(best, tokenSim(t, x)); });
      total += best;
      if (best >= 0.75) strong++;
    });
    const avg = total / qt.length;
    if (!strong) return base;
    const fuzzy = Math.round(35 + avg * 55);
    return Math.max(base, avg >= 0.6 ? fuzzy : 0);
  }
  function rankedCustomers(query) {
    return state.customers.map(function (c) { return { c: c, score: scoreCustomer(query, c) }; })
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

  function seedPriceBook() {
    return (window.RT_PRICEBOOK && Array.isArray(window.RT_PRICEBOOK.items))
      ? window.RT_PRICEBOOK.items.map(function (x) { return JSON.parse(JSON.stringify(x)); })
      : [];
  }
  function mergePriceBook(seed, saved) {
    const byId = {};
    (seed || []).forEach(function (it) { byId[it.id] = JSON.parse(JSON.stringify(it)); });
    const extra = [];
    (saved || []).forEach(function (s) {
      if (!s || !s.id) return;
      if (byId[s.id]) {
        const base = byId[s.id];
        byId[s.id] = Object.assign({}, base, {
          name: s.name != null ? s.name : base.name,
          category: s.category != null ? s.category : base.category,
          unit: s.unit != null ? s.unit : base.unit,
          sku: s.sku != null ? s.sku : base.sku,
          cost: s.cost !== undefined ? s.cost : base.cost,
          gp: (s.gpSource === "custom" || s.status === "confirmed") ? (s.gp !== undefined ? s.gp : base.gp) : ((s.gp != null && s.gp !== "") ? s.gp : base.gp),
          sell: (s.gpSource === "custom" || s.status === "confirmed") ? (s.sell !== undefined ? s.sell : base.sell) : ((s.sell != null && s.sell !== "") ? s.sell : base.sell),
          sellLocked: s.sellLocked != null ? s.sellLocked : base.sellLocked,
          status: s.status || base.status,
          detail: s.detail != null ? s.detail : base.detail,
          source: base.source,
          sourceFile: base.sourceFile,
          seeded: !!base.seeded,
          gpSource: s.gpSource || base.gpSource || "default",
          pricingRule: s.pricingRule || base.pricingRule,
          kind: base.kind || s.kind,
          scope: s.scope != null ? s.scope : base.scope,
          laborHours: s.laborHours != null ? s.laborHours : base.laborHours,
          hoursSource: base.hoursSource,
          hoursNote: base.hoursNote,
          partId: s.partId != null ? s.partId : base.partId,
          partName: s.partName != null ? s.partName : base.partName,
          partCost: s.partCost !== undefined ? s.partCost : base.partCost,
          partCostMissing: s.partCostMissing != null ? s.partCostMissing : base.partCostMissing,
          noPart: s.noPart != null ? s.noPart : base.noPart,
          diagnostic: base.diagnostic,
          truck: base.truck,
          laborRate: base.laborRate,
          firstPrice: (base.kind === "custom_quote") ? "" : ((s.gpSource === "custom" || s.status === "confirmed") ? (s.firstPrice != null ? s.firstPrice : base.firstPrice) : base.firstPrice),
          addOnPrice: (base.kind === "custom_quote") ? "" : ((s.gpSource === "custom" || s.status === "confirmed") ? (s.addOnPrice != null ? s.addOnPrice : base.addOnPrice) : base.addOnPrice),
          sell: (base.kind === "custom_quote") ? "" : (s.sell !== undefined ? s.sell : base.sell),
          needsOemCost: base.needsOemCost != null ? base.needsOemCost : s.needsOemCost,
          needsRefrigerant: base.needsRefrigerant != null ? base.needsRefrigerant : s.needsRefrigerant
        });
      } else {
        extra.push(JSON.parse(JSON.stringify(s)));
      }
    });
    return (seed || []).map(function (it) { return byId[it.id]; }).concat(extra);
  }
  function bookItems() { return state.priceBook || []; }
  function getBookItem(id) { return bookItems().find(function (x) { return x.id === id; }) || null; }
  function bookSettings() {
    const s = (typeof state !== "undefined" && state.settings) ? state.settings : {};
    return {
      defaultGp: Number(s.defaultGp != null && s.defaultGp !== "" ? s.defaultGp : 40),
      minGp: Number(s.minGp != null && s.minGp !== "" ? s.minGp : 35),
      refrigerantMinMarkup: Number(s.refrigerantMinMarkup != null && s.refrigerantMinMarkup !== "" ? s.refrigerantMinMarkup : 125)
    };
  }
  function isRefrigerantItem(item) {
    if (!item) return false;
    if (String(item.category || "").toLowerCase() === "refrigerant") return true;
    const hay = [item.name, item.id, item.detail].filter(Boolean).join(" ");
    return /\b(r-?\d{2,3}[a-z]?|refrigerant)\b/i.test(hay) && !/polar pad/i.test(hay);
  }
  function isFlatRateItem(item) {
    if (!item) return false;
    if (item.kind === "custom_quote") return false;
    if (item.kind === "flat_rate") return true;
    return String(item.category || "") === "Flat-rate repairs";
  }
  function isCustomQuoteItem(item) {
    if (!item) return false;
    if (item.kind === "custom_quote") return true;
    return String(item.category || "") === "Custom quote";
  }
  function isRepairLine(l, item) {
    const it = item || (l && l.id ? getBookItem(l.id) : null);
    return !!(l && (l.flatRate || l.customQuote || (it && (isFlatRateItem(it) || isCustomQuoteItem(it)))));
  }
  function oemPartSell(cost) {
    const c = Number(cost);
    if (!(c > 0)) return 0;
    const s = proposedSell({ cost: c, category: "Parts", name: "OEM part" });
    return s != null ? s : 0;
  }
  function refrigerantSell(costPerLb, lbs) {
    const c = Number(costPerLb), q = Number(lbs);
    if (!(c > 0) || !(q > 0)) return 0;
    const per = proposedSell({ cost: c, category: "Refrigerant", name: "Refrigerant" });
    if (per == null) return 0;
    return Math.round((per * q) * 100) / 100;
  }
  function customQuotePrices(item, inputs) {
    if (!item) return null;
    const rates = flatRateConstants();
    const hours = Number((inputs && inputs.laborHours != null && inputs.laborHours !== "") ? inputs.laborHours : item.laborHours) || 0;
    const laborSell = hours * rates.labor;
    const partCost = inputs && Number(inputs.partCost) > 0 ? Number(inputs.partCost) : 0;
    const partSell = oemPartSell(partCost);
    const refLbs = inputs && Number(inputs.refLbs) > 0 ? Number(inputs.refLbs) : 0;
    const refCost = inputs && Number(inputs.refCost) > 0 ? Number(inputs.refCost) : 0;
    const refSell = refrigerantSell(refCost, refLbs);
    const refCostTotal = (refCost > 0 && refLbs > 0) ? Math.round(refCost * refLbs * 100) / 100 : 0;
    const extras = partSell + refSell;
    return {
      hours: hours,
      laborSell: laborSell,
      partCost: partCost || null,
      partSell: partSell,
      refLbs: refLbs,
      refCost: refCost || null,
      refCostTotal: refCostTotal || null,
      refSell: refSell,
      diagnostic: rates.diagnostic,
      truck: rates.truck,
      laborRate: rates.labor,
      first: roundSell(rates.diagnostic + laborSell + rates.truck + extras),
      addOn: roundSell(laborSell + extras),
      hasPart: partCost > 0
    };
  }
  function flatRateConstants() {
    return { diagnostic: 150, labor: 85, truck: 65 };
  }
  function flatPartSell(item) {
    if (!item || item.noPart || item.partCostMissing) return 0;
    if (item.partId) {
      const part = getBookItem(item.partId);
      if (part) {
        const s = sellOf(part);
        if (s != null) return Number(s);
      }
    }
    const cost = Number(item.partCost != null && item.partCost !== "" ? item.partCost : item.cost);
    if (!(cost > 0)) return 0;
    const sell = proposedSell({ cost: cost, category: "Parts", name: item.partName || item.name });
    return sell != null ? sell : 0;
  }
  function flatRatePrices(item) {
    if (!isFlatRateItem(item)) return null;
    const rates = flatRateConstants();
    const hours = Number(item.laborHours) || 0;
    const laborSell = hours * rates.labor;
    const partSell = flatPartSell(item);
    const partCost = (!item.noPart && !item.partCostMissing && Number(item.partCost != null && item.partCost !== "" ? item.partCost : item.cost) > 0)
      ? Number(item.partCost != null && item.partCost !== "" ? item.partCost : item.cost)
      : null;
    if ((item.status === "confirmed" || item.gpSource === "custom") && item.firstPrice != null && item.firstPrice !== "" && item.addOnPrice != null && item.addOnPrice !== "") {
      return {
        first: Number(item.firstPrice),
        addOn: Number(item.addOnPrice),
        hours: hours,
        laborSell: laborSell,
        partSell: partSell,
        partCost: partCost,
        diagnostic: rates.diagnostic,
        truck: rates.truck,
        laborRate: rates.labor,
        locked: true
      };
    }
    return {
      first: roundSell(rates.diagnostic + laborSell + rates.truck + partSell),
      addOn: roundSell(laborSell + partSell),
      hours: hours,
      laborSell: laborSell,
      partSell: partSell,
      partCost: partCost,
      diagnostic: rates.diagnostic,
      truck: rates.truck,
      laborRate: rates.labor,
      locked: false
    };
  }
  function applyFlatPricing(item) {
    const copy = Object.assign({}, item);
    const p = flatRatePrices(copy);
    if (!p) return copy;
    if (!(copy.status === "confirmed" || copy.gpSource === "custom")) {
      copy.firstPrice = p.first;
      copy.addOnPrice = p.addOn;
      copy.sell = p.first;
      copy.pricingRule = "flat_rate_first_addon";
    } else if (copy.sell == null || copy.sell === "") {
      copy.sell = p.first;
    }
    return copy;
  }
  function repriceFlatRateDraft(draft) {
    let usedFirst = false;
    return (draft || []).map(function (l) {
      const item = l && l.id ? getBookItem(l.id) : null;
      const isCustom = !!(l && (l.customQuote || (item && isCustomQuoteItem(item))));
      const isFlat = !!(l && (l.flatRate || (item && isFlatRateItem(item)))) && !isCustom;
      if ((!isFlat && !isCustom) || !item) {
        const copy = Object.assign({}, l);
        delete copy.flatTotal;
        delete copy.flatRole;
        return copy;
      }
      const p = isCustom
        ? customQuotePrices(item, { partCost: l.partCost, refCost: l.refCost, refLbs: l.refLbs, laborHours: l.laborHours })
        : flatRatePrices(item);
      const qty = l.qty || 1;
      let total = 0;
      let firstCount = 0;
      for (let i = 0; i < qty; i++) {
        if (!usedFirst) { total += p.first; usedFirst = true; firstCount += 1; }
        else total += p.addOn;
      }
      const addCount = qty - firstCount;
      let role = "addon";
      if (firstCount && addCount) role = "mixed";
      else if (firstCount) role = "first";
      const costTotal = (p.partCost || 0) + (p.refCostTotal || 0);
      const sellTotal = (p.partSell || 0) + (p.refSell || 0);
      return Object.assign({}, l, {
        flatRate: !isCustom,
        customQuote: !!isCustom,
        label: item.name,
        amount: qty ? total / qty : p.addOn,
        flatTotal: total,
        flatRole: role,
        cost: costTotal > 0 ? costTotal : null,
        partSell: sellTotal
      });
    });
  }
  function flatRoleLabel(l) {
    if (!l || !l.flatRate) return "";
    if (l.flatRole === "first") return "First repair";
    if (l.flatRole === "addon") return "Add-on";
    if (l.flatRole === "mixed") {
      const add = (l.qty || 1) - 1;
      return "First repair + " + add + " add-on" + (add === 1 ? "" : "s");
    }
    if (l.customQuote) return "Custom quote";
    return "Flat-rate repair";
  }
  function flatBreakdownHtml(item) {
    const p = flatRatePrices(item);
    if (!p) return "";
    const partCost = p.partCost;
    const missing = !!(item.partCostMissing);
    const hoursFlag = item.hoursSource === "estimate";
    let html = '<div class="note steve-only" style="margin-top:10px"><div class="k-up">Steve only</div>';
    html += "<div>Diagnostic " + money(p.diagnostic) + "</div>";
    html += "<div>Labor " + p.hours + " hr × " + money(p.laborRate) + " = " + money(p.laborSell) + (hoursFlag ? " (hours are an estimate)" : "") + "</div>";
    html += "<div>Truck " + money(p.truck) + "</div>";
    if (item.noPart) {
      html += "<div>No part on this item (labor only).</div>";
    } else if (missing || !(partCost > 0)) {
      html += "<div>Part cost missing — flagged. Part sell is not included until a recorded cost is entered" + (item.partName ? " (" + esc(item.partName) + ")" : "") + ".</div>";
    } else {
      const gp = gpFromSell(partCost, p.partSell);
      html += "<div>Part cost " + money(partCost) + " → sell " + money(p.partSell) + (gp != null ? " · GP " + gp + "%" : " · 40% GP") + (item.partName ? " (" + esc(item.partName) + ")" : "") + "</div>";
    }
    html += '<div style="margin-top:6px;font-weight:700">First repair ' + money(p.first) + " · Add-on " + money(p.addOn) + "</div>";
    if (partCost > 0) {
      const afterFirst = p.first - partCost;
      const afterAdd = p.addOn - partCost;
      html += "<div>Amount remaining after part cost: first " + money(afterFirst) + " · add-on " + money(afterAdd) + ". Labor, diagnostic, and truck are selling rates, not costs, so they are not turned into a job GP.</div>";
    }
    if (item.hoursNote) html += '<div class="muted" style="margin-top:6px">' + esc(item.hoursNote) + "</div>";
    html += "</div>";
    return html;
  }
  function markupToGp(markupPct) {
    const m = Number(markupPct) / 100;
    if (!(m >= 0)) return null;
    return Math.round((m / (1 + m)) * 1000) / 10;
  }
  function defaultGpFor(item) {
    const s = bookSettings();
    if (isRefrigerantItem(item)) return markupToGp(s.refrigerantMinMarkup);
    return s.defaultGp;
  }
  function minGpFor(item) {
    const s = bookSettings();
    if (isRefrigerantItem(item)) return markupToGp(s.refrigerantMinMarkup);
    return s.minGp;
  }
  function roundSell(n) {
    const x = Number(n);
    if (!isFinite(x) || x < 0) return null;
    if (x < 20) return Math.round(x * 2) / 2;
    return Math.round(x);
  }
  function proposedSell(item) {
    const cost = Number(item && item.cost);
    if (!(cost > 0)) return null;
    if (isRefrigerantItem(item)) {
      const m = bookSettings().refrigerantMinMarkup;
      return roundSell(cost * (1 + (isFinite(m) ? m : 125) / 100));
    }
    const gp = defaultGpFor(item) / 100;
    if (!(gp >= 0 && gp < 1)) return null;
    return roundSell(cost / (1 - gp));
  }
  function sellOf(item) {
    if (!item) return null;
    if (isCustomQuoteItem(item)) return null;
    if (isFlatRateItem(item)) {
      const p = flatRatePrices(item);
      return p ? p.first : (item.sell != null && item.sell !== "" ? Number(item.sell) : null);
    }
    if (item.sellLocked) {
      return item.sell != null && item.sell !== "" ? Number(item.sell) : null;
    }
    if (item.gpSource === "custom") {
      if (item.sell != null && item.sell !== "" && (item._edited !== "gp")) return Number(item.sell);
      if (item.cost != null && item.cost !== "" && item.gp != null && item.gp !== "") {
        const gp = Number(item.gp) / 100;
        if (gp >= 0 && gp < 1) return roundSell(Number(item.cost) / (1 - gp));
      }
      if (item.sell != null && item.sell !== "") return Number(item.sell);
      return proposedSell(item);
    }
    const proposed = proposedSell(item);
    if (proposed != null) return proposed;
    if (item.sell != null && item.sell !== "") return Number(item.sell);
    if (item.cost != null && item.cost !== "" && item.gp != null && item.gp !== "") {
      const gp = Number(item.gp) / 100;
      if (gp >= 0 && gp < 1) return roundSell(Number(item.cost) / (1 - gp));
    }
    return null;
  }
  function gpFromSell(cost, sell) {
    const c = Number(cost), s = Number(sell);
    if (!(c > 0) || !(s > 0) || s <= c) return null;
    return Math.round((1 - c / s) * 1000) / 10;
  }
  function markupFromSell(cost, sell) {
    const c = Number(cost), s = Number(sell);
    if (!(c > 0) || !(s > 0)) return null;
    return Math.round((s / c - 1) * 1000) / 10;
  }
  function applyBookMath(item, edited) {
    const copy = Object.assign({}, item);
    if (isCustomQuoteItem(copy)) {
      if (edited === "category") copy.kind = "custom_quote";
      copy.sell = "";
      copy.firstPrice = "";
      copy.addOnPrice = "";
      return copy;
    }
    if (isFlatRateItem(copy)) {
      if (edited === "category") copy.kind = "flat_rate";
      if (copy.gpSource !== "custom" && copy.status !== "confirmed") return applyFlatPricing(copy);
      return copy;
    }
    if (copy.sellLocked) return copy;
    if (edited === "category" && copy.gpSource !== "custom") {
      copy.gp = defaultGpFor(copy);
      copy.sell = proposedSell(copy);
      copy.gpSource = "default";
      return copy;
    }
    if (edited === "gp" || edited === "sell" || edited === "cost") copy.gpSource = "custom";
    if (edited === "gp" && copy.cost != null && copy.cost !== "" && copy.gp != null && copy.gp !== "") {
      copy._edited = "gp";
      copy.sell = sellOf(copy);
      delete copy._edited;
    } else if (edited === "sell" && copy.cost != null && copy.cost !== "" && copy.sell != null && copy.sell !== "") {
      const g = gpFromSell(copy.cost, copy.sell);
      if (g != null) copy.gp = g;
    } else if (edited === "cost") {
      if (copy.gpSource === "custom" && copy.gp != null && copy.gp !== "") {
        copy._edited = "gp";
        copy.sell = sellOf(copy);
        delete copy._edited;
      } else {
        copy.gp = defaultGpFor(copy);
        copy.sell = proposedSell(copy);
        copy.gpSource = "default";
      }
    }
    return copy;
  }
  function applyProposedPricing(items) {
    return (items || []).map(function (it) {
      const copy = Object.assign({}, it);
      if (isCustomQuoteItem(copy)) {
        copy.sell = "";
        copy.firstPrice = "";
        copy.addOnPrice = "";
        copy.pricingRule = "custom_quote_oem";
        return copy;
      }
      if (isFlatRateItem(copy)) return applyFlatPricing(copy);
      if (copy.sellLocked || copy.status === "confirmed" || copy.gpSource === "custom") return copy;
      if (!(Number(copy.cost) > 0)) return copy;
      copy.gp = defaultGpFor(copy);
      copy.sell = proposedSell(copy);
      copy.gpSource = "default";
      copy.pricingRule = isRefrigerantItem(copy) ? "refrigerant_markup_125" : "default_gp_40";
      return copy;
    });
  }
  function gpBelowFloor(item) {
    if (isFlatRateItem(item)) {
      const p = flatRatePrices(item);
      if (!p || !(p.partCost > 0) || !(p.partSell > 0)) return null;
      const gp = (1 - p.partCost / p.partSell) * 100;
      if (gp + 0.05 < bookSettings().minGp) return "Part sell is below the " + bookSettings().minGp + "% GP floor.";
      return null;
    }
    const sell = sellOf(item);
    const cost = Number(item && item.cost);
    if (!(cost > 0) || !(sell > 0)) return null;
    const s = bookSettings();
    if (isRefrigerantItem(item)) {
      const markup = (sell / cost - 1) * 100;
      if (markup + 0.05 < s.refrigerantMinMarkup) {
        return "Below the refrigerant floor of " + s.refrigerantMinMarkup + "% markup (" + markupToGp(s.refrigerantMinMarkup) + "% GP). Sell should be at least cost × " + (1 + s.refrigerantMinMarkup / 100).toFixed(2).replace(/\.00$/, "") + ".";
      }
      return null;
    }
    const gp = (1 - cost / sell) * 100;
    if (gp + 0.05 < s.minGp) return "Below the " + s.minGp + "% GP floor.";
    return null;
  }
  function lineCostOf(l) {
    if (!l) return null;
    if (l.cost != null && l.cost !== "") return Number(l.cost) * (l.qty || 1);
    const book = (l.id && typeof getBookItem === "function") ? getBookItem(l.id) : null;
    const it = book || (typeof lineInBook === "function" ? lineInBook(l.label) : null);
    if (it && it.cost != null && it.cost !== "" && !it.sellLocked) return Number(it.cost) * (l.qty || 1);
    return null;
  }
  function estimateGpSummary(lines) {
    let cost = 0, sell = 0, n = 0;
    (lines || []).forEach(function (l) {
      const book = (l.id && typeof getBookItem === "function") ? getBookItem(l.id) : null;
      if (l.flatRate || l.customQuote || (book && (isFlatRateItem(book) || isCustomQuoteItem(book)))) {
        const p = book ? flatRatePrices(book) : null;
        const c = (l.cost != null && l.cost !== "") ? Number(l.cost) * (l.qty || 1) : (p && p.partCost != null ? p.partCost * (l.qty || 1) : null);
        const s = (l.partSell != null) ? Number(l.partSell) * (l.qty || 1) : (p ? p.partSell * (l.qty || 1) : null);
        if (c == null || !(c >= 0) || !(s > 0)) return;
        cost += c;
        sell += s;
        n += 1;
        return;
      }
      const c = lineCostOf(l);
      if (c == null || !(c >= 0)) return;
      const s = lineTotal(l);
      if (!(s > 0)) return;
      cost += c;
      sell += s;
      n += 1;
    });
    if (!n || !(sell > 0)) return null;
    const gp = (1 - cost / sell) * 100;
    return { gp: gp, cost: cost, sell: sell, counted: n, total: (lines || []).length, below: gp + 0.05 < bookSettings().minGp };
  }
  function estimateGpHtml(lines) {
    const sum = estimateGpSummary(lines);
    if (!sum) return '<div class="muted" style="margin-top:8px">Blended GP is shown when a line has a recorded cost.</div>';
    const label = "Blended GP on " + sum.counted + " costed line" + (sum.counted === 1 ? "" : "s") + ": " + (Math.round(sum.gp * 10) / 10) + "%";
    const extra = sum.counted < sum.total ? " Confirmed rates, flat-rate labor, diagnostic, truck, and lines without a cost are left out of the blend." : "";
    if (sum.below) return '<div class="warn-banner" style="margin-top:10px">' + esc(label) + " — below the " + bookSettings().minGp + "% floor." + extra + "</div>";
    return '<div class="note" style="margin-top:10px">' + esc(label + "." + extra) + "</div>";
  }
  function bookCategories() {
    const set = {};
    bookItems().forEach(function (it) { if (it.category) set[it.category] = true; });
    const rank = function (c) {
      if (c === "Flat-rate repairs") return 0;
      if (c === "Custom quote") return 1;
      return 2;
    };
    return Object.keys(set).sort(function (a, b) {
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b);
    });
  }
  function emptyBookItem() {
    const gp = bookSettings().defaultGp;
    return { id: "pb-new-" + Date.now(), name: "", category: "Parts", unit: "ea", sku: "", cost: "", gp: gp, sell: "", sellLocked: false, status: "needs_ok", source: "Added in the ReliaTech app.", sourceFile: "", detail: "", seeded: false, gpSource: "default" };
  }
  function lineInBook(label) {
    const n = normalizeName(label);
    if (!n) return null;
    let best = null, bestScore = 0;
    bookItems().forEach(function (it) {
      const sc = Math.max(scoreName(label, it.name), scoreName(label, (it.name || "") + (it.unit ? " " + it.unit : "")));
      if (sc > bestScore) { bestScore = sc; best = it; }
    });
    return bestScore >= 80 ? best : null;
  }
  function emptyPhotoDraft() { return { data: "", caption: "" }; }
  function emptyMemoDraft() { return { data: "", caption: "", recording: false, error: "" }; }
  function captureTargetJob() {
    return state.openJobId ? getJob(state.openJobId) : null;
  }
  function pushCapture(job, item) {
    if (job) {
      job.timeline = [item].concat(job.timeline || []);
      return "job";
    }
    state.unfiledCaptures = [Object.assign({ jobId: "" }, item)].concat(state.unfiledCaptures || []);
    return "unfiled";
  }
  function migrateLooseCaptures(saved) {
    const loose = ((saved && saved.captures) || []).concat((saved && saved.unfiledCaptures) || []);
    const out = [];
    loose.forEach(function (cap) {
      if (!cap) return;
      if (cap.jobId && getJob(cap.jobId)) {
        const job = getJob(cap.jobId);
        const id = cap.id || ("cap" + Date.now());
        if (!(job.timeline || []).some(function (t) { return t.id === id; })) {
          job.timeline = [Object.assign({}, cap, { id: id })].concat(job.timeline || []);
        }
      } else {
        out.push(cap);
      }
    });
    return out;
  }
  function nextSaturdayMorningIso() {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    /* Walk day by day in the user's zone until Saturday, 8:00 */
    const parts = tzParts(now);
    let d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 16, 0, 0)); /* noon-ish UTC probe */
    for (let i = 0; i < 8; i++) {
      const p = tzParts(d);
      const wd = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d);
      const isSat = wd === "Sat";
      const todaySat = isSat && p.year === parts.year && p.month === parts.month && p.day === parts.day;
      if (isSat && (!todaySat || Number(parts.hour) < 8)) {
        const guess = new Date(d.getTime());
        /* set 8:00 PT via iterating minutes is heavy; construct from Y-M-D 08:00 PT */
        const label = p.year + "-" + pad2(p.month) + "-" + pad2(p.day) + "T08:00";
        return fromInputValue(label);
      }
      d = new Date(d.getTime() + 24 * 3600 * 1000);
    }
    return null;
  }
  function resolveRequestedTime(phrase) {
    const raw = String(phrase || "").trim();
    if (!raw) return { label: "", iso: "" };
    const s = raw.toLowerCase();
    const weekdays = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    let hour = 8, minute = 0;
    if (/\bevening\b/.test(s)) { hour = 16; minute = 30; }
    else if (/\bafternoon\b/.test(s)) { hour = 13; minute = 0; }
    else if (/\bnight\b/.test(s) || /\btonight\b/.test(s)) { hour = 18; minute = 0; }
    else if (/\bmorning\b/.test(s)) { hour = 8; minute = 0; }
    const tm = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
    if (tm) {
      hour = Number(tm[1]); minute = Number(tm[2] || 0);
      if (tm[3] === "pm" && hour < 12) hour += 12;
      if (tm[3] === "am" && hour === 12) hour = 0;
    }
    const now = new Date();
    const pNow = tzParts(now);
    let addDays = 0;
    let named = null;
    Object.keys(weekdays).forEach(function (k) { if (s.indexOf(k) !== -1) named = weekdays[k]; });
    if (/\btomorrow\b/.test(s)) addDays = 1;
    else if (/\btonight\b/.test(s) || /\btoday\b/.test(s)) addDays = 0;
    else if (named != null) {
      const wdName = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(now);
      const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const today = map[wdName];
      addDays = (named - today + 7) % 7;
      if (addDays === 0 && (Number(pNow.hour) > hour || (Number(pNow.hour) === hour && Number(pNow.minute) >= minute))) addDays = 7;
    } else {
      return { label: raw, iso: "" };
    }
    const base = new Date(now.getTime() + addDays * 24 * 3600 * 1000);
    const p = tzParts(base);
    const iso = fromInputValue(p.year + "-" + pad2(p.month) + "-" + pad2(p.day) + "T" + pad2(hour) + ":" + pad2(minute));
    return { label: raw, iso: iso || "" };
  }
  function scoreJobVoice(query, job) {
    const c = getCustomer(job.customerId);
    const loc = serviceAddressOf(job);
    const names = [job.customer, c && c.name, job.address, job.city, loc && loc.address, loc && loc.city, loc && loc.label, loc && loc.onsiteName, job.problem].filter(Boolean);
    let best = 0;
    names.forEach(function (n) { best = Math.max(best, scoreName(query, n)); });
    const q = normalizeName(query);
    names.forEach(function (n) {
      const nn = normalizeName(n);
      if (q && nn && nn.indexOf(q) !== -1) best = Math.max(best, q.length >= 5 ? 92 : (q.length >= 3 ? 75 : 60));
    });
    return best;
  }
  function matchBoardJobs(query) {
    const q = String(query || "").trim();
    if (!q) return [];
    return state.jobs.filter(isBoardJob).map(function (j) { return { job: j, score: scoreJobVoice(q, j) }; })
      .filter(function (x) { return x.score >= 50; })
      .sort(function (a, b) { return b.score - a.score; });
  }
  function looksLikeTimePhrase(s) {
    const t = String(s || "").trim();
    if (!t) return false;
    if (t.length > 48) return false;
    return /^(?:this |next |on )?(?:tonight|tomorrow|today|(?:mon|tues|wednes|thurs|fri|satur|sun)day)(?:\s+(?:morning|afternoon|evening|night|am|pm))?$|^(?:in the |this )?(?:morning|afternoon|evening)$|^\d{1,2}(?::\d{2})?\s*(?:am|pm)$/i.test(t)
      || /\b(saturday|sunday|monday|tuesday|wednesday|thursday|friday|tonight|tomorrow|morning|afternoon|evening)\b/i.test(t);
  }
  function parseVoiceNewJob(raw) {
    const s = String(raw || "").trim();
    const m = s.match(/^(?:new job|create (?:a )?new job|create (?:a )?job|start (?:a )?(?:new )?job)(?:\s+for)?[:\s]+(.+)$/i);
    if (!m) return null;
    let rest = m[1].replace(/^for\s+/i, "").trim();
    const parts = rest.split(/\s*,\s*/).map(function (x) { return x.trim(); }).filter(Boolean);
    const customerPart = (parts[0] || rest).replace(/^for\s+/i, "").trim();
    let when = "", problemParts = [];
    for (let i = 1; i < parts.length; i++) {
      if (looksLikeTimePhrase(parts[i]) && !problemParts.length) when = parts[i];
      else if (looksLikeTimePhrase(parts[i]) && parts[i].length <= 32) when = parts[i];
      else problemParts.push(parts[i]);
    }
    if (parts.length === 1) {
      const end = rest.match(/^(.*?)\s+((?:this |next )?(?:tonight|tomorrow|(?:mon|tues|wednes|thurs|fri|satur|sun)day(?:\s+(?:morning|afternoon|evening|night)?)?))\s*$/i);
      if (end) {
        /* customer + maybe problem all in one phrase — keep as customer unless "for Name" already split */
      }
    }
    const ranked = rankedCustomers(customerPart);
    const customer = (ranked.length && ranked[0].score >= 85 && (ranked.length === 1 || ranked[1].score < ranked[0].score - 15)) ? ranked[0].c : null;
    const addrs = customer ? serviceAddresses(customer) : [];
    const resolved = resolveRequestedTime(when);
    const noMatches = !customer && !ranked.length;
    return {
      kind: "newJob",
      raw: raw,
      draft: {
        jobId: nextJobId(state.jobs),
        customerId: customer ? customer.id : "",
        customerName: customer ? customer.name : customerPart,
        isNewCustomer: false,
        custQuery: customer ? "" : customerPart,
        newName: customer ? "" : customerPart,
        newPhone: "",
        newAddress: "",
        newCity: "Long Beach",
        addressId: addrs.length === 1 ? addrs[0].id : "",
        problem: problemParts.join(", ") || "New call",
        whenLabel: when,
        whenIso: resolved.iso || "",
        billToCustomerId: customer ? customer.id : ""
      }
    };
  }

  function parseVoiceCommand(text, context) {
    const raw = String(text || "").trim();
    const newJob = parseVoiceNewJob(raw);
    if (newJob) return newJob;
    const s = raw.toLowerCase().replace(/[.,!?]/g, " ").replace(/\s+/g, " ").trim();
    if (!s) return { error: "Say or type a command, like “clock me in for Lopez”, “clock me in on Elm”, or “new job for Lisa Mezo, AC not cooling, Saturday morning.”", raw: raw };
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
      return { error: "I didn’t catch that. Try “clock me in”, “clock me in for Lopez”, “clock me in on Elm”, “clock me out”, or “new job for Lisa Mezo, AC not cooling, Saturday morning.”", raw: raw };
    }

    function result(extra) {
      const job = extra.job || null;
      const customer = extra.customer || (job ? (getCustomer(job.customerId) || { id: job.customerId, name: job.customer }) : null);
      return Object.assign({
        action: action,
        raw: raw,
        tech: state.currentTech || DEFAULT_TECH,
        customer: customer,
        customerId: customer ? customer.id : "",
        customerName: customer ? customer.name : (job ? job.customer : (extra.spoken || "")),
        job: job,
        jobId: job ? job.id : "",
        problem: job ? job.problem : (work || ""),
        work: work,
        needsNewJob: false
      }, extra);
    }

    if (customerQuery) {
      const boardHits = matchBoardJobs(customerQuery);
      if (boardHits.length === 1) return result({ job: boardHits[0].job });
      if (boardHits.length > 1) return result({ needsPick: true, matches: boardHits.map(function (x) { return x.job; }) });
      const custHits = rankedCustomers(customerQuery);
      if (custHits.length) {
        const customer = custHits[0].c;
        return result({
          customer: customer,
          needsNewJob: action === "clockIn",
          offerReason: "No active or upcoming job matches “" + customerQuery + ".” You can create one for " + customer.name + "."
        });
      }
      if (action === "clockIn") {
        return result({
          needsNewJob: true,
          noMatch: true,
          spoken: customerQuery,
          offerReason: "No active or upcoming job matches “" + customerQuery + ".” You can create a new job."
        });
      }
      return { error: "I couldn’t find an active or upcoming job matching “" + customerQuery + ".”", raw: raw, action: action };
    }

    if (contextJob) {
      return result({ job: contextJob });
    }
    if (contextCust) {
      const boardHits = state.jobs.filter(isBoardJob).filter(function (j) { return j.customerId === contextCust.id; });
      if (boardHits.length === 1) return result({ job: boardHits[0], customer: contextCust });
      if (boardHits.length > 1) return result({ needsPick: true, matches: boardHits, customer: contextCust });
      return result({
        customer: contextCust,
        needsNewJob: action === "clockIn",
        offerReason: "No active or upcoming job for " + contextCust.name + ". You can create one."
      });
    }
    return { error: "I need a customer or a street for that. Open a job, or say “clock me in for [customer]” or “clock me in on [street].”", raw: raw, action: action };
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
  const PRICE_BOOK_NOTE = (window.RT_PRICEBOOK && window.RT_PRICEBOOK.note) || "Confirmed service rates are not marked up again. Costed items use 40% GP by default (35% floor). Refrigerant uses a 125% markup (sell = cost × 2.25). Draft flat-rate repairs use a first-repair price and an add-on price. OEM-part repairs are Custom quote templates with no fixed price. Proposed sells need Steve’s OK.";
  const MONEY_NOTE = (window.RT_DATA && window.RT_DATA.moneyNote) || "";
  const PAYMENT = (window.RT_DATA && window.RT_DATA.payment) ? window.RT_DATA.payment : {
    venmoHandle: "Steve-Seguine",
    zellePhone: "5624878750",
    zellePhoneDisplay: "562-487-8750",
    stripeReusableUrl: "",
    links: {}
  };
  const PAY_METHODS = ["Card/Stripe", "Venmo", "Zelle", "Cash", "Check"];

  /* state and remaining UI will be appended */
  window.__RT_BOOT = { INITIAL_CUSTOMERS: INITIAL_CUSTOMERS, INITIAL_JOBS: INITIAL_JOBS, PAST_JOBS: PAST_JOBS };

  /* Phase 1 data layer. Every read and write of saved app data goes through
     RTStore. Today the backend is this browser's localStorage. A shared online
     database (Supabase or Firebase) can be plugged in later by giving RTStore a
     remote adapter, without touching the screens. */
  const RTStore = (function () {
    const subs = [];
    let lastSaved = "";
    const local = {
      name: "local",
      load: function () {
        try { const raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
      },
      save: function (snapshot, json) {
        try { localStorage.setItem(STORE_KEY, json || JSON.stringify(snapshot)); return true; } catch (e) { return false; }
      }
    };
    let remote = null; /* future: { name, push(snapshot), pull() -> Promise<snapshot> } */
    function notify(snapshot, source) { subs.forEach(function (fn) { try { fn(snapshot, source); } catch (e) {} }); }
    window.addEventListener("storage", function (ev) {
      if (ev.key !== STORE_KEY || !ev.newValue) return;
      try { notify(JSON.parse(ev.newValue), "other-tab"); } catch (e) {}
    });
    return {
      backend: function () { return remote ? remote.name : local.name; },
      load: function () { return local.load(); },
      save: function (snapshot) {
        const json = JSON.stringify(snapshot);
        if (json === lastSaved) return true;
        const ok = local.save(snapshot, json);
        if (ok) lastSaved = json;
        if (remote && remote.push) { try { remote.push(snapshot); } catch (e) {} }
        return ok;
      },
      subscribe: function (fn) { subs.push(fn); return function () { const i = subs.indexOf(fn); if (i !== -1) subs.splice(i, 1); }; },
      setRemote: function (adapter) { remote = adapter || null; }
    };
  })();
  window.RTStore = RTStore;
  function loadPersisted() { return RTStore.load(); }
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
          billingSameAsService: n.billingSameAsService != null ? n.billingSameAsService : base.billingSameAsService,
          billingAddress: n.billingAddress != null ? n.billingAddress : base.billingAddress,
          billingCity: n.billingCity != null ? n.billingCity : base.billingCity,
          addresses: (n.addresses && n.addresses.length) ? n.addresses : (base.addresses || []),
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
    stevePhone: "(562) 487-8750", steveEmail: "steveseguine51@gmail.com",
    defaultGp: 40, minGp: 35, refrigerantMinMarkup: 125
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
    tab: "home",
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
    newCall: emptyNewCall(),
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
    scheduleDraft: { date: "", time: "" },
    paidDraft: { method: "Card/Stripe", date: "" },
    openAddressId: null,
    addressDraft: null,
    addressEditingId: null,
    addressCustomerId: null,
    moveAddressId: null,
    moveQuery: "",
    billToDraft: null,
    assetAddressId: null,
    viewEstimateId: null,
    priceBook: [],
    priceBookQuery: "",
    priceBookCategory: "all",
    priceBookFilter: "all",
    priceDraft: null,
    customQuoteDraft: null,
    unfiledCaptures: [],
    photoDraft: { data: "", caption: "" },
    memoDraft: { data: "", caption: "", recording: false, error: "" },
    voicePick: null,
    voiceJobDraft: null,
    attachCaptureId: null,
    attachQuery: "",
    packCustomName: "",
    packCustomAmount: "",
    saveLineDraft: null,
    vendors: (_saved && Array.isArray(_saved.vendors)) ? _saved.vendors : [],
    vendorDraft: null,
    partDraft: null,
    poDraft: null,
    importReport: null
  };
  state.techRecords = normalizeTechRecords(state.techs, _saved && _saved.techRecords);
  state.priceBook = applyProposedPricing(mergePriceBook(seedPriceBook(), _saved && _saved.priceBook));
  state.unfiledCaptures = migrateLooseCaptures(_saved);
  if (state.tab === "capture") state.tab = "jobs";
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
    const dropPlanIds = { "p-ssmith-commitment": true };
    const dropVisitIds = { "v-ssmith-1": true, "v-ssmith-2": true };
    const dropJobIds = { "25084": true, "25085": true };
    state.plans = (state.plans || []).filter(function (p) { return !dropPlanIds[p.id]; });
    state.visits = (state.visits || []).filter(function (v) { return !dropVisitIds[v.id]; });
    state.jobs = state.jobs.filter(function (j) {
      if (!dropJobIds[j.id]) return true;
      return !!(j.scheduledStart || (j.timeEntries && j.timeEntries.length));
    });
    function markLewis25069Superseded(list) {
      return (list || []).map(function (j) {
        if (!j || j.id !== "25069") return j;
        if (j.supersededBy === "55720-E01" && j.status === "superseded") return j;
        const note = {
          id: "t25069-superseded",
          kind: "system",
          time: "Nov 25, 2026",
          title: "Replaced by 55720-E01",
          body: "Housecall Pro estimate 25069 ($865 furnace control board) was replaced by ReliaTech estimate 55720-E01."
        };
        const timeline = Array.isArray(j.timeline) ? j.timeline.slice() : [];
        if (!timeline.some(function (t) { return t && t.id === "t25069-superseded"; })) timeline.unshift(note);
        const estimates = Array.isArray(j.estimates) ? j.estimates.map(function (e) {
          return Object.assign({}, e, { superseded: true });
        }) : [];
        return Object.assign({}, j, {
          status: "superseded",
          supersededBy: "55720-E01",
          dueAmount: 0,
          timeline: timeline,
          estimates: estimates
        });
      });
    }
    state.jobs = markLewis25069Superseded(state.jobs);
    state.moneyJobs = markLewis25069Superseded(state.moneyJobs);
  })();
  (function migrateLewisEstimateParts() {
    const BOARD = { name: "Furnace control board (model TBD, confirm from nameplate)", partNo: "", qty: 1, cost: 334.31, costUnverified: true, note: "For Carrier furnace 58SU0B080M211220. Board cost $334.31 not yet verified with the supplier." };
    const TSTAT = [
      { name: "Venstar T2000 Explorer Mini Wi-Fi thermostat", partNo: "T2000", qty: 1, cost: 72, note: "Standard Wi-Fi thermostat assembly" },
      { name: "Venstar large wallplate", partNo: "ACC-EMIN-L", qty: 1, cost: 6, note: "Use ACC-EMIN-M only if the old footprint is extra-wide" }
    ];
    function fill(lines) {
      (lines || []).forEach(function (l) {
        if (!l || Array.isArray(l.parts)) return;
        const lab = String(l.label || "");
        if (/thermostat/i.test(lab) && Number(l.amount) > 0) l.parts = JSON.parse(JSON.stringify(TSTAT));
        else if (/control board/i.test(lab) && Number(l.amount) > 0) l.parts = [JSON.parse(JSON.stringify(BOARD))];
        else if (/discount/i.test(lab) || Number(l.amount) <= 0) l.parts = [];
      });
    }
    (state.jobs || []).forEach(function (j) {
      if (!j || j.id !== "55720") return;
      if (j.estimateId === "55720-E01") fill(j.lineItems);
      /* Remove only the rows the first Phase 1 build wrongly pulled (option names
         as parts), and only while still untouched: needed, no PO. */
      if (Array.isArray(j.parts)) j.parts = j.parts.filter(function (x) {
        return !(x && x.fromEstimate && x.status === "needed" && !x.po && /^(wi-fi thermostat upgrade|furnace control board replacement)$/i.test(String(x.name || "").trim()));
      });
      (j.estimates || []).forEach(function (e) { if (e && e.id === "55720-E01") fill(e.lineItems); });
    });
  })();
  (function migrateLewisScopeSeed() {
    const PDF = "https://drive.google.com/file/d/1BtvhWlcZEFAk3o5WmG5Tnb3bNubUpnSL/view";
    const SCOPE = "Option 1 · Wi-Fi Thermostat Upgrade · $485.50\n- Furnish and install a Venstar T2000 Explorer Mini Wi-Fi programmable thermostat with a large wallplate.\n- Turn off power to the thermostat.\n- Remove the existing thermostat.\n- Install the wallplate and new thermostat and reconnect the wiring.\n- Configure the thermostat for the system.\n- Program the schedule and complete Wi-Fi and app setup.\n- Test heating, cooling, and fan operation.\n- Walk the homeowner through operation.\n\nOption 2 · Furnace Control Board Replacement · $792.00\n- Replace the control board on the Carrier furnace, model 58SU0B080M211220.\n- Turn off power and apply lockout/tagout.\n- Remove the existing control board.\n- Install the replacement board and reconnect the wiring.\n- Configure the board to match the furnace nameplate and verify the settings.\n- Restore power and test heating, cooling, and blower operation.\n- Verify the display and check for fault codes.\n- Remove old parts and clean up the work area.\nNote: Final airflow setup and balancing will require completion of the ductwork.\n\nBundle discount if both are approved: -$65.00\nBoth options together: $1,212.50\nIssued November 25, 2026 · Expires December 25, 2026";
    (state.jobs || []).forEach(function (j) {
      if (!j || j.id !== "55720") return;
      if (j.estimateId === "55720-E01" && !(j.estimates || []).some(function (e) { return e && e.id === "55720-E01"; })) {
        j.estimates = (j.estimates || []).concat([{ id: "55720-E01", lineItems: JSON.parse(JSON.stringify(j.lineItems || [])), total: j.total, billToCustomerId: j.billToCustomerId, createdAt: "2026-11-25T22:00:00Z" }]);
      }
      (j.estimates || []).forEach(function (e) {
        if (!e || e.id !== "55720-E01") return;
        if (!e.pdfUrl) e.pdfUrl = PDF;
        if (!e.expires) e.expires = "2026-12-25";
        if (!Array.isArray(e.scopeVersions) || !e.scopeVersions.length) e.scopeVersions = [{ v: 1, text: SCOPE, status: "Final", at: "2026-11-25T22:00:00Z", source: "Estimate PDF 55720-E01" }];
      });
    });
  })();
  (function migrateDedupeTechs() {
    try { if (typeof dedupeTechs === "function") dedupeTechs(); } catch (e) {}
  })();
  (function migrateServiceAccounts() {
    state.customers = state.customers.map(function (c) { return ensureCustomerAddresses(c, state.customers); });
    state.jobs = state.jobs.map(function (j) { return ensureJobParties(j, state.customers); });
    state.moneyJobs = (state.moneyJobs || []).map(function (j) { return ensureJobParties(j, state.customers); });
    (state.plans || []).forEach(function (p) { ensurePlanAddress(p, state.customers); });
    (state.visits || []).forEach(function (v) { ensureVisitAddress(v, state.customers, state.plans); });
  })();
  /* Housecall Pro import (Nov 26, 2026): merge customers, service addresses, and
     property-profile equipment into phone data. Never overwrites a filled field.
     Idempotent: each equipment item is added once per address (hcpImported keys),
     so an item Steve removes is not added back. */
  function hcpNameKey(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function hcpStreetKey(s) {
    const toks = String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
    if (!toks.length || !/^\d+$/.test(toks[0])) return toks.join(" ");
    const rest = toks.slice(1).filter(function (t) { return ["n", "s", "e", "w", "north", "south", "east", "west"].indexOf(t) === -1; });
    return toks[0] + " " + (rest[0] || "");
  }
  function hcpPhoneKey(s) { const d = String(s || "").replace(/\D/g, ""); return d.length >= 10 ? d.slice(-10) : ""; }
  (function migrateHcpImport20261126() {
    const H = window.RT_HCP;
    if (!H || !Array.isArray(H.customers)) return;
    const report = { newCustomers: 0, newAddresses: 0, newAssets: 0, filled: 0 };
    H.customers.forEach(function (hc) {
      const nk = hcpNameKey(hc.name);
      let c = state.customers.find(function (x) { return hcpNameKey(x.name) === nk; });
      if (!c && hc.phone) c = state.customers.find(function (x) { return hcpPhoneKey(x.phone) && hcpPhoneKey(x.phone) === hcpPhoneKey(hc.phone) && hcpNameKey(x.name).indexOf(nk.slice(0, 4)) === 0; });
      if (!c) {
        c = ensureCustomerAddresses({ id: "c-hcp-" + nk.slice(0, 24), name: hc.name, address: "", city: "", phone: hc.phone || "", email: hc.email || "", addresses: [], assets: [], mentions: [], source: "HCP" }, state.customers);
        state.customers.push(c);
        report.newCustomers++;
      }
      if (!c.phone && hc.phone) { c.phone = hc.phone; report.filled++; }
      if (!c.email && hc.email) { c.email = hc.email; report.filled++; }
      if (!Array.isArray(c.addresses)) c.addresses = [];
      (hc.addresses || []).forEach(function (ha) {
        const sk = hcpStreetKey(ha.address);
        if (ha.billingOnly) {
          const already = serviceAddresses(c).some(function (a) { return hcpStreetKey(a.address) === sk; });
          if (!already && !c.billingAddress) { c.billingAddress = ha.address; c.billingCity = ha.city; c.billingSameAsService = false; report.filled++; }
          return;
        }
        let a = serviceAddresses(c).find(function (x) { return x.address && hcpStreetKey(x.address) === sk; });
        if (!a) {
          const blank = serviceAddresses(c).length === 1 && !serviceAddresses(c)[0].address && !(serviceAddresses(c)[0].assets || []).length ? serviceAddresses(c)[0] : null;
          if (blank) { a = blank; a.address = ha.address; if (!a.city) a.city = ha.city; }
          else {
            a = emptyAddress({ id: nextAddressId(c.id, state.customers), address: ha.address, city: ha.city, label: ha.label || "", source: "HCP" });
            c.addresses.push(a);
          }
          report.newAddresses++;
        }
        if (!a.city && ha.city) a.city = ha.city;
        if (!a.label && ha.label) a.label = ha.label;
        if (!Array.isArray(a.assets)) a.assets = [];
        if (!Array.isArray(a.hcpImported)) a.hcpImported = [];
        (ha.assets || []).forEach(function (hx) {
          if (a.hcpImported.indexOf(hx.hcpKey) !== -1) return;
          a.hcpImported.push(hx.hcpKey);
          const mk = hcpNameKey(hx.model);
          const dup = a.assets.some(function (x) { return x.id === hx.id || (mk && hcpNameKey(x.model) === mk && hcpNameKey(x.make) === hcpNameKey(hx.make) && (x.hcpLabel || "") === (hx.hcpLabel || "")); });
          if (dup) return;
          const asset = Object.assign(emptyAsset(), JSON.parse(JSON.stringify(hx)));
          asset.id = hx.id;
          a.assets.push(asset);
          report.newAssets++;
        });
      });
      syncCustomerPrimary(c);
    });
    /* Jobs that were parked on a customer's first address get linked to the address
       whose street matches the job's street, now that all addresses exist. */
    state.jobs.forEach(function (j) {
      const c = state.customers.find(function (x) { return x.id === j.customerId; });
      if (!c || !j.address) return;
      const jk = hcpStreetKey(j.address);
      const cur = j.addressId ? getAddressById(j.addressId) : null;
      if (cur && hcpStreetKey(cur.address) === jk) return;
      const m = serviceAddresses(c).find(function (a) { return a.address && hcpStreetKey(a.address) === jk; });
      if (m) j.addressId = m.id;
    });
    state._hcpImportReport = report;
  })();
  function hcpEstimatesFor(c, addr) {
    const H = window.RT_HCP;
    if (!H || !c) return [];
    const nk = hcpNameKey(c.name);
    const inApp = {};
    state.jobs.forEach(function (j) { if (j.estimateId) inApp[j.estimateId] = true; inApp[j.id] = true; (j.estimates || []).forEach(function (e) { inApp[e.id] = true; }); });
    return (H.estimates || []).filter(function (e) {
      if (hcpNameKey(e.customer) !== nk) return false;
      if (inApp[e.number] || inApp[String(e.number).split("-")[0]]) return false;
      if (addr) { const k = hcpStreetKey(String(e.address || "").split(",")[0]); if (k && k !== hcpStreetKey(addr.address)) return false; }
      return true;
    });
  }
  function hcpEstimatesHtml(c, addr) {
    const list = hcpEstimatesFor(c, addr);
    if (!list.length) return "";
    return '<div class="section">Housecall Pro estimates</div><div class="muted" style="margin:-4px 0 8px">History only. Approved estimates that became jobs are listed under Jobs.</div><div class="stack" style="margin-bottom:16px">' +
      list.map(function (e) {
        return '<div class="panel"><div class="row"><div class="meta">Estimate ' + esc(e.number) + "</div>" + '<div class="meta">' + esc(e.status) + "</div></div>" +
          '<div class="h2" style="margin-top:4px">' + esc(e.description || "No description") + "</div>" +
          '<div class="row" style="margin-top:4px"><div class="muted">' + esc(String(e.address || "").split(",")[0]) + "</div><div>" + money(e.amount) + "</div></div></div>";
      }).join("") + "</div>";
  }

  /* ——— Equipment record upgrade: pick lists, multi-photo (IndexedDB), unit work, history ——— */
  const PhotoStore = (function () {
    let dbp = null;
    const cache = {};
    function db() {
      if (!dbp) dbp = new Promise(function (res, rej) {
        if (!window.indexedDB) { rej(new Error("IndexedDB not available")); return; }
        const r = indexedDB.open("reliatech-photos", 1);
        r.onupgradeneeded = function () { if (!r.result.objectStoreNames.contains("photos")) r.result.createObjectStore("photos", { keyPath: "id" }); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
      return dbp;
    }
    function tx(mode, fn) {
      return db().then(function (d) {
        return new Promise(function (res, rej) {
          const t = d.transaction("photos", mode);
          const req = fn(t.objectStore("photos"));
          t.oncomplete = function () { res(req && "result" in req ? req.result : undefined); };
          t.onerror = function () { rej(t.error); };
          t.onabort = function () { rej(t.error || new Error("aborted")); };
        });
      });
    }
    return {
      put: function (rec) { cache[rec.id] = rec.data; return tx("readwrite", function (s) { return s.put(rec); }); },
      del: function (id) { delete cache[id]; return tx("readwrite", function (s) { return s.delete(id); }).catch(function () {}); },
      all: function () { return tx("readonly", function (s) { return s.getAll(); }); },
      loadAll: function () { return this.all().then(function (list) { (list || []).forEach(function (r) { cache[r.id] = r.data; }); return list || []; }); },
      get: function (id) { return cache[id] || ""; }
    };
  })();
  window.RTPhotos = PhotoStore;
  const PHOTO_LABELS = ["Nameplate", "Corner 1", "Corner 2", "Corner 3", "Corner 4", "Disconnect", "Other"];
  function compressImageFile(file, cb) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        const max = 1600;
        let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        if (w > max || h > max) { const s = Math.min(max / w, max / h); w = Math.round(w * s); h = Math.round(h * s); }
        const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        let out = "";
        try { out = cv.toDataURL("image/jpeg", 0.7); } catch (e) { out = String(reader.result || ""); }
        cb(out, w, h);
      };
      img.onerror = function () { cb("", 0, 0); };
      img.src = String(reader.result || "");
    };
    reader.onerror = function () { cb("", 0, 0); };
    reader.readAsDataURL(file);
  }
  function nextPhotoLabel(list) {
    const used = (list || []).map(function (p) { return p.label; });
    if (used.indexOf("Nameplate") === -1) return "Nameplate";
    for (let i = 1; i <= 4; i++) if (used.indexOf("Corner " + i) === -1) return "Corner " + i;
    return "Other";
  }
  function assetThumbSrc(a) {
    const ph = (a && a.photos) || [];
    const np = ph.find(function (p) { return p.label === "Nameplate" && PhotoStore.get(p.id); });
    const first = np || ph.find(function (p) { return PhotoStore.get(p.id); });
    if (first) return PhotoStore.get(first.id);
    return (a && a.photo) || "";
  }
  function photoDraftList(ctx) {
    if (ctx === "uw") return state.uwDraft ? (state.uwDraft.photos = state.uwDraft.photos || []) : [];
    return state.assetDraft ? (state.assetDraft.photos = state.assetDraft.photos || []) : [];
  }
  function photoGridHtml(ctx) {
    const list = photoDraftList(ctx);
    const inputs = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
      '<label class="dash" style="text-align:center;display:flex;align-items:center;justify-content:center;position:relative">Take photo<input type="file" accept="image/*" capture="environment" style="position:absolute;opacity:0;width:1px;height:1px" onchange="RT.addPhotos(\'' + ctx + '\', this)"></label>' +
      '<label class="dash" style="text-align:center;display:flex;align-items:center;justify-content:center;position:relative">Choose from library<input type="file" accept="image/*" multiple style="position:absolute;opacity:0;width:1px;height:1px" onchange="RT.addPhotos(\'' + ctx + '\', this)"></label></div>';
    const busy = state._photoBusy ? '<div class="note" style="margin:0 0 10px">Saving ' + state._photoBusy + " photo" + (state._photoBusy > 1 ? "s" : "") + "…</div>" : "";
    if (!list.length) return inputs + busy + '<div class="muted" style="margin-bottom:12px">No photos yet. Nameplate first, then the four corners so all sides of the unit are on file.</div>';
    return inputs + busy + '<div class="ph-grid">' + list.map(function (p, i) {
      const src = PhotoStore.get(p.id);
      return '<div class="ph-tile">' +
        (src ? '<button class="ph-img" ' + act("photoView", p.id) + '><img src="' + esc(src) + '" alt="' + esc(p.label) + '"></button>' : '<div class="ph-img ph-missing">Photo not on this device</div>') +
        '<select aria-label="Photo label" onchange="RT.setPhotoLabel(\'' + ctx + "', " + i + ', this.value)">' + PHOTO_LABELS.map(function (l) { return '<option' + (l === p.label ? " selected" : "") + ">" + l + "</option>"; }).join("") + "</select>" +
        '<div class="ph-btns"><button ' + act("photoMove", ctx + "|" + i + "|-1") + (i === 0 ? " disabled" : "") + ' aria-label="Move earlier">◀</button><button ' + act("photoMove", ctx + "|" + i + "|1") + (i === list.length - 1 ? " disabled" : "") + ' aria-label="Move later">▶</button><button ' + act("photoDel", ctx + "|" + i) + ' aria-label="Delete photo">✕</button></div></div>';
    }).join("") + '</div><div class="meta" style="margin:6px 0 12px">The first Nameplate photo (or the first photo) is the thumbnail. Photos are saved on this phone until sync is set up.</div>';
  }
  function photoViewHtml() {
    if (!state.photoViewId) return "";
    const src = PhotoStore.get(state.photoViewId);
    return '<div class="ph-view" ' + act("photoViewClose") + '>' + (src ? '<img src="' + esc(src) + '" alt="Photo">' : "") + '<button class="ph-view-x" ' + act("photoViewClose") + ' aria-label="Close">✕</button></div>';
  }
  function migrateLegacyPhotos() {
    const jobs = [];
    state.customers.forEach(function (c) {
      serviceAddresses(c).concat([{ assets: c.assets || [] }]).forEach(function (a) {
        (a.assets || []).forEach(function (x) {
          if (!x || !x.photo || String(x.photo).indexOf("data:") !== 0) return;
          const id = "ph-" + x.id + "-legacy";
          jobs.push(PhotoStore.put({ id: id, data: x.photo, ownerType: "asset", ownerId: x.id, label: "Nameplate", createdAt: isoNow(), uploaded: false }).then(function () {
            x.photos = [{ id: id, label: "Nameplate", at: isoNow() }].concat((x.photos || []).filter(function (p) { return p.id !== id; }));
            delete x.photo;
          }));
        });
      });
    });
    return Promise.all(jobs).then(function () { if (jobs.length) persist(); return jobs.length; });
  }
  PhotoStore.loadAll().then(function () { return migrateLegacyPhotos(); }).catch(function () {}).then(function () { try { render(); } catch (e) {} });

  /* Unit work (per-job incident on one piece of equipment) */
  const UW_FIELDS = [["supply", "Supply °F"], ["ret", "Return °F"], ["suction", "Suction psi"], ["head", "Liquid/head psi"], ["sh", "Superheat °F"], ["sc", "Subcool °F"], ["amps", "Amps"]];
  function jobUnitWork(job) { return (job && Array.isArray(job.unitWork)) ? job.unitWork : []; }
  function jobServiceAddress(job) {
    if (!job) return null;
    if (job.addressId) { const a = getAddressById(job.addressId); if (a) return a; }
    const c = getCustomer(job.customerId);
    return c ? primaryAddress(c) : null;
  }
  function findAssetAnywhere(assetId) {
    let out = null;
    state.customers.forEach(function (c) { serviceAddresses(c).forEach(function (a) { (a.assets || []).forEach(function (x) { if (x.id === assetId) out = { customer: c, address: a, asset: x }; }); }); });
    return out;
  }
  function assetShortName(x) {
    if (!x) return "Unit not found";
    return [equipmentTypeLabel(x), x.hcpLabel, [x.make, x.model].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  }
  function uwReadingText(r) {
    const vals = UW_FIELDS.filter(function (f) { return r.readingVals && String(r.readingVals[f[0]] || "").trim(); }).map(function (f) { return f[1] + " " + r.readingVals[f[0]]; });
    return [vals.join(", "), r.readings].filter(Boolean).join(". ");
  }
  function buildVisitSummary(job) {
    return jobUnitWork(job).map(function (r) {
      const h = findAssetAnywhere(r.assetId);
      const lines = [assetShortName(h && h.asset) + ":"];
      if (r.complaint) lines.push("Complaint: " + r.complaint);
      if (r.findings) lines.push("Findings: " + r.findings);
      const rd = uwReadingText(r); if (rd) lines.push("Readings: " + rd);
      if (r.workDone) lines.push("Work done: " + r.workDone);
      if (r.parts) lines.push("Parts used: " + r.parts);
      return lines.join("\n");
    }).join("\n\n");
  }
  function refreshVisitSummary(job) { if (job && !job.visitSummaryEdited) job.visitSummary = buildVisitSummary(job); }
  function unitWorkSectionHtml(job) {
    const list = jobUnitWork(job);
    let h = '<div class="section-row"><div class="section" style="margin:0">Unit work</div><div class="meta">' + list.length + " record" + (list.length === 1 ? "" : "s") + "</div></div>";
    h += list.length ? '<div class="stack" style="margin-bottom:10px">' + list.map(function (r) {
      const hm = findAssetAnywhere(r.assetId);
      return '<button class="list-card" ' + act("uwEdit", r.id) + '><div class="job-body"><div class="job-name" style="font-size:15px;margin-top:0">' + esc(assetShortName(hm && hm.asset)) + "</div>" +
        '<div class="job-prob">' + esc(r.workDone || r.findings || r.complaint || "No notes yet") + "</div>" +
        '<div class="meta" style="margin-top:2px">' + esc([r.tech, formatDate(r.at), (r.photos || []).length ? (r.photos.length + " photo" + (r.photos.length > 1 ? "s" : "")) : ""].filter(Boolean).join(" · ")) + "</div></div></button>";
    }).join("") + "</div>" : '<div class="muted" style="margin-bottom:10px">Record what you found and did on each unit. The visit summary builds itself from these.</div>';
    h += '<button class="dash" style="margin-bottom:14px" ' + act("uwAdd") + ">+ Add unit work</button>";
    h += '<label class="field"><div class="field-lab">Visit summary' + (job.visitSummaryEdited ? " (edited)" : list.length ? " (built from unit work)" : "") + '</div><textarea id="job-visit-summary" rows="5" placeholder="Builds from unit work. You can edit it." oninput="RT.setVisitSummary(this.value)">' + esc(job.visitSummary || "") + "</textarea></label>";
    if (job.visitSummaryEdited && list.length) h += '<button class="link-btn tap" style="margin:-6px 0 14px" ' + act("uwRebuildSummary") + ">Rebuild from unit work</button>";
    return h;
  }
  function unitWorkSheet(job) {
    const d = state.uwDraft; if (!d) return "";
    const addr = jobServiceAddress(job);
    const assets = (addr && addr.assets) || [];
    const techs = (state.techs || []).map(function (x) { return typeof x === "string" ? x : (x && x.name) || ""; }).filter(Boolean);
    if (d.tech && techs.indexOf(d.tech) === -1) techs.push(d.tech);
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (d.isNew ? "Add unit work" : "Unit work") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="field-lab">Which unit?</div>' +
      (assets.length ? '<div class="stack" style="margin-bottom:8px">' + assets.map(function (x) {
        const on = d.assetId === x.id;
        return '<button class="dash' + (on ? " sel" : "") + '" ' + act("uwPickAsset", x.id) + ">" + (on ? "✓ " : "") + esc(assetShortName(x)) + "</button>";
      }).join("") + "</div>" : '<div class="muted" style="margin-bottom:8px">No equipment at ' + esc((addr && addr.address) || "this address") + " yet.</div>") +
      '<button class="link-btn tap" style="margin:0 0 12px" ' + act("uwAddEquipment") + ">+ Add equipment at this address</button>" +
      [["complaint", "Complaint", 2], ["findings", "Findings / diagnosis", 3]].map(function (f) {
        return '<label class="field"><div class="field-lab">' + f[1] + '</div><textarea id="uw-' + f[0] + '" rows="' + f[2] + '"' + (f[0] === "complaint" && job.problem ? ' placeholder="Job: ' + esc(job.problem) + '"' : "") + ' oninput="RT.setUw(\'' + f[0] + '\', this.value)">' + esc(d[f[0]] || "") + "</textarea></label>";
      }).join("") +
      '<div class="field-lab">Readings (optional)</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' + UW_FIELDS.map(function (f) {
        return '<label class="field" style="margin:0"><div class="field-lab">' + f[1] + '</div><input id="uw-r-' + f[0] + '" inputmode="decimal" value="' + esc((d.readingVals || {})[f[0]] || "") + '" oninput="RT.setUwReading(\'' + f[0] + '\', this.value)"></label>';
      }).join("") + "</div>" +
      '<label class="field"><div class="field-lab">Other readings / notes</div><textarea id="uw-readings" rows="2" oninput="RT.setUw(\'readings\', this.value)">' + esc(d.readings || "") + "</textarea></label>" +
      [["workDone", "Work done", 3], ["parts", "Parts used", 2]].map(function (f) {
        return '<label class="field"><div class="field-lab">' + f[1] + '</div><textarea id="uw-' + f[0] + '" rows="' + f[2] + '" oninput="RT.setUw(\'' + f[0] + '\', this.value)">' + esc(d[f[0]] || "") + "</textarea></label>";
      }).join("") +
      '<label class="field"><div class="field-lab">Tech</div><select id="uw-tech" onchange="RT.setUw(\'tech\', this.value)">' + techs.map(function (n) { return "<option" + (n === d.tech ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("") + "</select></label>" +
      '<div class="field-lab">Photos</div>' + photoGridHtml("uw") +
      '<button data-pin class="btn" ' + act("uwSave") + ">Save unit work</button>" +
      (!d.isNew ? '<button class="btn ghost" style="margin-top:8px" ' + act("uwDelete") + ">Delete this record</button>" : "")
    );
  }
  function jobTextBlob(j) {
    return [j.problem].concat((j.lineItems || []).map(function (l) { return l.label; })).concat((j.timeline || []).map(function (t) { return (t.title || "") + " " + (t.body || ""); })).join(" ");
  }
  function jobWhen(j) {
    const c = (j.timeline || []).find(function (t) { return /-created$/.test(t.id || ""); });
    return c ? c.time : "";
  }
  function assetHistoryHtml(asset, addr) {
    if (!asset || !state.assetEditingId) return '<div class="muted">Save the equipment first. Its history fills in from unit work on jobs.</div>';
    const recs = [];
    state.jobs.forEach(function (j) { jobUnitWork(j).forEach(function (r) { if (r.assetId === asset.id) recs.push({ j: j, r: r }); }); });
    recs.sort(function (a, b) { return String(b.r.at || "").localeCompare(String(a.r.at || "")); });
    const withUw = {}; recs.forEach(function (x) { withUw[x.j.id] = true; });
    const mk = normalizeName(asset.model || "").replace(/\s/g, "");
    const lk = normalizeName(asset.hcpLabel || "").replace(/\s/g, "");
    const named = [], unrec = [];
    (addr ? jobsForAddress(addr.id) : []).forEach(function (j) {
      if (withUw[j.id]) return;
      const blob = normalizeName(jobTextBlob(j)).replace(/\s/g, "");
      if ((mk.length >= 5 && blob.indexOf(mk) !== -1) || (lk.length >= 6 && blob.indexOf(lk) !== -1)) named.push(j); else unrec.push(j);
    });
    const byIdDesc = function (a, b) { return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0); };
    named.sort(byIdDesc); unrec.sort(byIdDesc);
    let h = "";
    h += recs.length ? '<div class="stack" style="margin-bottom:14px">' + recs.map(function (x) {
      const r = x.r;
      const thumbs = (r.photos || []).map(function (p) { const s = PhotoStore.get(p.id); return s ? '<img src="' + esc(s) + '" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:8px">' : ""; }).join("");
      return '<button class="list-card" ' + act("uwOpenJob", x.j.id) + '><div class="job-body"><div class="row"><div class="meta">#' + esc(x.j.id) + " · " + esc(formatDate(r.at)) + "</div><div class=\"meta\">" + esc(r.tech || "") + "</div></div>" +
        (r.complaint ? '<div class="job-prob"><b>Complaint:</b> ' + esc(r.complaint) + "</div>" : "") +
        (r.findings ? '<div class="job-prob"><b>Findings:</b> ' + esc(r.findings) + "</div>" : "") +
        (uwReadingText(r) ? '<div class="job-prob"><b>Readings:</b> ' + esc(uwReadingText(r)) + "</div>" : "") +
        (r.workDone ? '<div class="job-prob"><b>Work done:</b> ' + esc(r.workDone) + "</div>" : "") +
        (r.parts ? '<div class="job-prob"><b>Parts:</b> ' + esc(r.parts) + "</div>" : "") +
        (thumbs ? '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">' + thumbs + "</div>" : "") + "</div></button>";
    }).join("") + "</div>" : '<div class="muted" style="margin-bottom:12px">No unit work recorded on this unit yet. Use “Add unit work” on a job.</div>';
    function jobRow(j, tag) {
      return '<button class="list-card" ' + act("uwOpenJob", j.id) + '><div class="job-body"><div class="row"><div class="meta">#' + esc(j.id) + (jobWhen(j) ? " · " + esc(jobWhen(j)) : "") + "</div>" + (tag ? '<div class="meta">' + tag + "</div>" : "") + '</div><div class="job-prob">' + esc(j.problem || "") + "</div></div></button>";
    }
    if (named.length) h += '<div class="section">Jobs that name this unit</div><div class="stack" style="margin-bottom:14px">' + named.map(function (j) { return jobRow(j, "from job text"); }).join("") + "</div>";
    if (unrec.length) h += '<div class="section">Visits at this address (unit not recorded)</div><div class="stack" style="margin-bottom:14px">' + unrec.map(function (j) { return jobRow(j, ""); }).join("") + "</div>";
    return h;
  }
  function equipmentSheetV2() {
    const d = state.assetDraft || emptyAsset();
    const editing = !!state.assetEditingId;
    const tab = state.assetTab || "details";
    const addr = state.assetAddressId ? getAddressById(state.assetAddressId) : null;
    const locOther = !!d.locOther || !!(d.location && EQUIPMENT_LOCATIONS.indexOf(d.location) === -1);
    const typeKnown = EQUIPMENT_TYPES.some(function (t) { return t.id === d.type; });
    const thumb = assetThumbSrc(d);
    const tabs = '<div class="seg" style="margin-bottom:12px">' + [["details", "Details"], ["photos", "Photos" + ((d.photos || []).length ? " (" + d.photos.length + ")" : "")], ["history", "History"]].map(function (x) {
      return '<button class="seg-btn' + (tab === x[0] ? " on" : "") + '" ' + act("assetTab", x[0]) + ">" + x[1] + "</button>";
    }).join("") + "</div>";
    let body = "";
    if (tab === "details") {
      const fields = [
        ["hcpLabel", "Unit label", "text", "e.g. FAU upstairs, Master suite CU"],
        ["make", "Make", "text", "Carrier, Rheem, Payne…"], ["model", "Model", "text", "From the nameplate"], ["serial", "Serial", "text", "From the nameplate"],
        ["installDate", "Install date", "date", ""], ["manufactureDate", "Manufacture date", "date", ""],
        ["capacity", "Tonnage or BTU", "text", "e.g. 3 ton or 80,000 BTU"], ["refrigerant", "Refrigerant", "text", "e.g. R-410A"],
        ["filterSize", "Filter size", "text", "e.g. 16x25x1"], ["warranty", "Warranty", "text", "Parts, labor, or remaining term"],
        ["lastServiced", "Last serviced", "text", "e.g. 10/31/2026"],
        ["factoryCharge", "Factory refrigerant charge (nameplate)", "text", "e.g. 5 lb 4 oz"]
      ];
      body = (thumb ? '<button class="eq-hero" ' + act("assetTab", "photos") + '><img src="' + esc(thumb) + '" alt="Thumbnail"></button>' : "") +
        '<label class="field"><div class="field-lab">Type</div><select id="eq-type" onchange="RT.setAssetType(this.value)">' +
        (typeKnown ? "" : '<option value="other" selected>Other</option>') +
        EQUIPMENT_TYPES.map(function (t) { return '<option value="' + t.id + '"' + (d.type === t.id ? " selected" : "") + ">" + esc(t.id === "other" ? "Other…" : t.label) + "</option>"; }).join("") + "</select></label>" +
        (d.type === "other" || !typeKnown ? '<label class="field"><div class="field-lab">Type name</div><input id="eq-typeOther" value="' + esc(d.typeOther || "") + '" placeholder="e.g. Humidifier" oninput="RT.setAsset(\'typeOther\', this.value)"></label>' : "") +
        '<label class="field"><div class="field-lab">Location</div><select id="eq-locsel" onchange="RT.setAssetLoc(this.value)">' +
        '<option value=""' + (!d.location && !locOther ? " selected" : "") + ">Pick a location</option>" +
        EQUIPMENT_LOCATIONS.filter(function (l) { return l !== "Other"; }).map(function (l) { return "<option" + (d.location === l && !d.locOther ? " selected" : "") + ">" + l + "</option>"; }).join("") +
        '<option value="__other"' + (locOther ? " selected" : "") + ">Other…</option></select></label>" +
        (locOther ? '<label class="field"><div class="field-lab">Location (type it)</div><input id="eq-location" value="' + esc(d.location || "") + '" placeholder="e.g. Hall closet upstairs" oninput="RT.setAsset(\'location\', this.value)"></label>' : "") +
        fields.map(function (f) {
          return '<label class="field"><div class="field-lab">' + esc(f[1]) + '</div><input id="eq-' + f[0] + '" type="' + f[2] + '" value="' + esc(d[f[0]] || "") + '" placeholder="' + esc(f[3]) + '" oninput="RT.setAsset(\'' + f[0] + '\', this.value)"></label>';
        }).join("") +
        '<label class="field"><div class="field-lab">Notes</div><textarea id="eq-notes" rows="3" placeholder="Condition, access, anything to remember" oninput="RT.setAsset(\'notes\', this.value)">' + esc(d.notes || "") + "</textarea></label>" +
        (d.source === "HCP" ? '<div class="meta" style="margin-bottom:10px">Imported from Housecall Pro.</div>' : "") +
        '<button class="dash' + (d.sample ? " sel" : "") + '" style="margin-bottom:14px" ' + act("toggleAssetSample") + ">" + (d.sample ? "Marked as example only — not a real unit" : "Mark as example only (not a real unit)") + "</button>";
    } else if (tab === "photos") {
      body = photoGridHtml("asset");
    } else {
      body = assetHistoryHtml(d, addr);
    }
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (editing ? esc(assetShortName(d)) : "Add equipment") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      tabs + body +
      (tab !== "history" ? '<div class="note" style="margin-top:0;margin-bottom:12px">Saved on this phone only until sync is set up.</div>' +
        '<button data-pin class="btn" ' + act("saveEquipment") + ">" + (editing ? "Save equipment" : "Add equipment") + "</button>" +
        (editing ? '<button class="btn ghost" style="margin-top:8px" ' + act("removeEquipment") + ">Remove</button>" : "") : "")
    );
  }
  (function migrateEquipTypes20261126() {
    state.customers.forEach(function (c) {
      serviceAddresses(c).forEach(function (a) {
        (a.assets || []).forEach(function (x) {
          if (!x || x.typeMap2) return;
          const lab = String(x.hcpLabel || "");
          const other = String(x.typeOther || "").trim();
          if (x.type === "minisplit") { x.type = "other"; x.typeOther = other || "Mini split"; }
          else if (x.type === "furnace" && /\bahu\b|air handler/i.test(lab + " " + other)) x.type = "airhandler";
          else if (x.type === "condenser" && /\bhp\b|heat pump/i.test(lab)) x.type = "heatpump";
          else if (x.type === "other") {
            const map = [[/^package unit$/i, "package"], [/^air handler$/i, "airhandler"], [/^heat pump$/i, "heatpump"], [/^water heater$/i, "waterheater"], [/^furnace$/i, "furnace"], [/^(condenser|ac|a\/c)$/i, "condenser"], [/^(evap(orator)? coil|coil)$/i, "coil"], [/^thermostat$/i, "thermostat"]];
            const m = map.find(function (p) { return p[0].test(other); });
            if (m) { x.type = m[1]; x.typeOther = ""; }
          }
          if (x.location === "Roof") x.location = "Rooftop";
          x.typeMap2 = 1;
        });
      });
    });
  })();
  function cleanupDraftPhotos(keepAdded) {
    const added = state._photoAdded || [], removed = state._photoRemoved || [];
    if (keepAdded) removed.forEach(function (id) { PhotoStore.del(id); });
    else added.forEach(function (id) { PhotoStore.del(id); });
    state._photoAdded = []; state._photoRemoved = [];
  }
  const RT_EQUIP = ({
    setAssetType: function (v) { state.assetDraft.type = v; if (v !== "other") state.assetDraft.typeOther = ""; render(); if (v === "other") { const el = document.getElementById("eq-typeOther"); if (el) try { el.focus({ preventScroll: true }); } catch (e) {} } },
    setAssetLoc: function (v) {
      const d = state.assetDraft;
      if (v === "__other") { d.locOther = true; if (EQUIPMENT_LOCATIONS.indexOf(d.location) !== -1) d.location = ""; }
      else { d.locOther = false; d.location = v; }
      render();
      if (v === "__other") { const el = document.getElementById("eq-location"); if (el) try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    },
    addPhotos: function (ctx, el) {
      const files = Array.prototype.slice.call((el && el.files) || []);
      el.value = "";
      if (!files.length) return;
      const ownerId = ctx === "uw" ? (state.uwDraft && state.uwDraft.id) : (state.assetDraft && state.assetDraft.id);
      state._photoBusy = (state._photoBusy || 0) + files.length; render();
      let chain = Promise.resolve();
      files.forEach(function (f, k) {
        chain = chain.then(function () {
          return new Promise(function (res) {
            compressImageFile(f, function (data, w, h) {
              state._photoBusy = Math.max(0, (state._photoBusy || 1) - 1);
              if (!data) { showToast("Couldn’t read one photo"); res(); return; }
              const id = "ph-" + Date.now() + "-" + k + "-" + Math.random().toString(36).slice(2, 6);
              const list = photoDraftList(ctx);
              const label = nextPhotoLabel(list);
              PhotoStore.put({ id: id, data: data, w: w, h: h, ownerType: ctx === "uw" ? "unitWork" : "asset", ownerId: ownerId, label: label, createdAt: isoNow(), uploaded: false }).then(function () {
                photoDraftList(ctx).push({ id: id, label: label, at: isoNow() });
                (state._photoAdded = state._photoAdded || []).push(id);
                render(); res();
              }).catch(function () { showToast("Photo storage isn’t available in this browser"); render(); res(); });
            });
          });
        });
      });
    },
    setPhotoLabel: function (ctx, i, v) { const l = photoDraftList(ctx); if (l[i]) l[i].label = v; render(); },
    setUw: function (k, v) { if (state.uwDraft) state.uwDraft[k] = v; },
    setUwReading: function (k, v) { if (state.uwDraft) { state.uwDraft.readingVals = state.uwDraft.readingVals || {}; state.uwDraft.readingVals[k] = v; } },
    setVisitSummary: function (v) { const j = getJob(state.openJobId); if (!j) return; j.visitSummary = v; j.visitSummaryEdited = true; persist(); }
  });
  function handleEquipV2(name, arg) {
    const job = getJob(state.openJobId);
    if (name === "addEquipment" || name === "openAsset") { state.assetTab = "details"; state._photoAdded = []; state._photoRemoved = []; return false; }
    if (name === "assetTab") { state.assetTab = arg; render(); return true; }
    if (name === "photoView") { state.photoViewId = arg; render(); return true; }
    if (name === "photoViewClose") { state.photoViewId = null; render(); return true; }
    if (name === "photoMove") {
      const p = String(arg).split("|"); const l = photoDraftList(p[0]); const i = Number(p[1]), j = i + Number(p[2]);
      if (l[i] && l[j]) { const tmp = l[i]; l[i] = l[j]; l[j] = tmp; }
      render(); return true;
    }
    if (name === "photoDel") {
      const p = String(arg).split("|"); const l = photoDraftList(p[0]); const i = Number(p[1]);
      if (!l[i] || !window.confirm("Delete this " + l[i].label + " photo?")) return true;
      const id = l.splice(i, 1)[0].id;
      const added = state._photoAdded || [];
      if (added.indexOf(id) !== -1) { PhotoStore.del(id); state._photoAdded = added.filter(function (x) { return x !== id; }); }
      else (state._photoRemoved = state._photoRemoved || []).push(id);
      render(); return true;
    }
    if (name === "closeSheet" && (state.sheet === "equipment" || state.sheet === "unitWork")) {
      if (state.sheet === "equipment" && state._uwReturn) {
        cleanupDraftPhotos(false);
        state._uwReturn = false; state.sheet = "unitWork"; state._photoAdded = state._uwPhotoAdded || []; state._photoRemoved = state._uwPhotoRemoved || [];
        render(); return true;
      }
      cleanupDraftPhotos(false);
      state.photoViewId = null;
      return false;
    }
    if (name === "saveEquipment") {
      if (state.assetDraft) { delete state.assetDraft.photo; if (!state.assetDraft.photos) state.assetDraft.photos = []; }
      cleanupDraftPhotos(true);
      state._savedAssetId = state.assetDraft && state.assetDraft.id;
      return false;
    }
    if (name === "removeEquipment") {
      if (!window.confirm("Remove this equipment and its photos from this phone?")) return true;
      (state.assetDraft && state.assetDraft.photos || []).forEach(function (p) { PhotoStore.del(p.id); });
      cleanupDraftPhotos(false);
      return false;
    }
    if (name === "uwAdd" || name === "uwEdit") {
      if (!job) return true;
      let d;
      if (name === "uwAdd") {
        const addr = jobServiceAddress(job);
        const assets = (addr && addr.assets) || [];
        d = { id: "uw" + Date.now(), isNew: true, assetId: assets.length === 1 ? assets[0].id : "", complaint: "", findings: "", readings: "", readingVals: {}, workDone: "", parts: "", photos: [], tech: state.currentTech || DEFAULT_TECH, at: isoNow() };
      } else {
        const r = jobUnitWork(job).find(function (x) { return x.id === arg; }); if (!r) return true;
        d = JSON.parse(JSON.stringify(r)); d.isNew = false;
      }
      state.uwDraft = d; state._photoAdded = []; state._photoRemoved = []; state.sheet = "unitWork"; render(); return true;
    }
    if (name === "uwPickAsset") { if (state.uwDraft) state.uwDraft.assetId = arg; render(); return true; }
    if (name === "uwAddEquipment") {
      if (!job) return true;
      const addr = jobServiceAddress(job);
      state._uwReturn = true; state._uwPhotoAdded = state._photoAdded || []; state._uwPhotoRemoved = state._photoRemoved || [];
      const keepC = state.openCustomerId, keepA = state.openAddressId;
      _handleV1("addEquipment", job.customerId + (addr ? "|" + addr.id : ""));
      state.openCustomerId = keepC; state.openAddressId = keepA; render();
      return true;
    }
    if (name === "uwSave") {
      const d = state.uwDraft; if (!job || !d) return true;
      if (!d.assetId) { showToast("Pick the unit first"); return true; }
      const rec = JSON.parse(JSON.stringify(d)); delete rec.isNew;
      const list = jobUnitWork(job).slice();
      const i = list.findIndex(function (x) { return x.id === rec.id; });
      if (i >= 0) list[i] = rec; else list.push(rec);
      job.unitWork = list;
      cleanupDraftPhotos(true);
      refreshVisitSummary(job);
      state.uwDraft = null; state.sheet = null;
      showToast("Unit work saved"); return true;
    }
    if (name === "uwDelete") {
      const d = state.uwDraft; if (!job || !d) return true;
      if (!window.confirm("Delete this unit work record and its photos?")) return true;
      (d.photos || []).forEach(function (p) { PhotoStore.del(p.id); });
      job.unitWork = jobUnitWork(job).filter(function (x) { return x.id !== d.id; });
      refreshVisitSummary(job);
      state.uwDraft = null; state.sheet = null; state._photoAdded = []; state._photoRemoved = [];
      showToast("Unit work deleted"); return true;
    }
    if (name === "uwRebuildSummary") { if (job) { job.visitSummaryEdited = false; refreshVisitSummary(job); render(); } return true; }
    if (name === "uwOpenJob") { cleanupDraftPhotos(false); state.sheet = null; state.photoViewId = null; state.openCustomerId = null; state.openAddressId = null; state.openJobId = arg; render(); return true; }
    if (name === "exportData") { exportBackupWithPhotos(); return true; }
    return false;
  }
  function postHandleEquipV2(name) {
    if (name === "saveEquipment" && state._uwReturn && state.uwDraft) {
      state._uwReturn = false;
      state.uwDraft.assetId = state._savedAssetId || state.uwDraft.assetId;
      state._photoAdded = state._uwPhotoAdded || []; state._photoRemoved = state._uwPhotoRemoved || [];
      state.sheet = "unitWork"; render();
    }
  }
  function exportBackupWithPhotos() {
    PhotoStore.all().then(function (list) {
      list = list || [];
      const bytes = list.reduce(function (s, p) { return s + String(p.data || "").length; }, 0);
      const mb = Math.round(bytes / 1048576);
      if (bytes > 60 * 1048576) {
        if (window.confirm("Photos add about " + mb + " MB, which is too big for one backup file on a phone. Save the backup WITHOUT photos? (Photos stay on this phone.)")) downloadBackup([]);
        return;
      }
      downloadBackup(list);
      if (list.length) showToast("Backup includes " + list.length + " photo" + (list.length > 1 ? "s" : "") + " (" + Math.max(1, mb) + " MB)");
    }).catch(function () { downloadBackup([]); showToast("Photos couldn’t be read; backup saved without them"); });
  }

  /* ——— Phase 2 · Custom repair builder ———
     Rates from /workspace/reliatech-setup/pricing.md: service labor $85/hr sell, truck $65,
     diagnostic $150 (initial call), price book GP 40% (35% floor), refrigerant 125% markup (cost × 2.25),
     filter drier $65 sell, refrigerant provisions $185. Purchase tax 10.25% is an assumption (pricing.md: "Long Beach assumed, confirm").
     Labor cost $55/hr is pricing.md's planning placeholder, used only for Steve's internal margin view. */
  const RB = { labor: 85, laborCost: 55, truck: 65, diag: 150, gp: 40, minGp: 35, tax: 10.25, refMarkup: 2.25, drierSell: 65, provisions: 185, ozPerFt: 0.6, stdFt: 15 };
  const RB_TYPES = [
    { id: "blower", label: "Blower motor / ECM replacement", hours: 4, refrig: false },
    { id: "board", label: "Control board replacement", hours: 2, refrig: false },
    { id: "txv", label: "TXV replacement", hours: 8, refrig: true },
    { id: "compressor", label: "Compressor replacement", hours: 8, refrig: true },
    { id: "coil", label: "Evaporator coil replacement", hours: "", refrig: true },
    { id: "leak", label: "Refrigerant leak repair", hours: "", refrig: true },
    { id: "other", label: "Other / manual", hours: "", refrig: false }
  ];
  function rbType(id) { return RB_TYPES.find(function (t) { return t.id === id; }) || RB_TYPES[RB_TYPES.length - 1]; }
  function rbNum(v) { const n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; }
  function rbRoundSell(x) { return x < 20 ? Math.round(x * 2) / 2 : Math.round(x); }
  function chargeLbFrom(s) {
    const t = String(s || "").toLowerCase();
    if (!t.trim()) return 0;
    const lb = t.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|#)/), oz = t.match(/(\d+(?:\.\d+)?)\s*oz/);
    if (lb || oz) return (lb ? parseFloat(lb[1]) : 0) + (oz ? parseFloat(oz[1]) / 16 : 0);
    return rbNum(t);
  }
  function rbJobAssets(job) { const a = jobServiceAddress(job); return (a && a.assets) || []; }
  function emptyRbDraft(job) {
    const assets = rbJobAssets(job);
    const out = assets.find(function (x) { return ["condenser", "heatpump", "package", "minisplit_out"].indexOf(x.type) !== -1; }) || assets[0] || null;
    const survey = (job && job.siteSurvey) || {};
    const d = { type: "blower", label: "", partName: "", partModel: "", partCost: "", hours: 4, initialCall: !(job && job.status && ["progress", "approved", "done"].indexOf(job.status) !== -1), truck: true, gp: RB.gp, tax: RB.tax,
      assetId: out ? out.id : "", drierOn: false, drierCost: "", provOn: true, refCostLb: "", lineSetFt: survey.lineSetFt || "", ozPerFt: RB.ozPerFt, lbsOverride: "" };
    return d;
  }
  function rbCalc(d, job) {
    const T = rbType(d.type);
    const tax = rbNum(d.tax) / 100, gp = Math.min(0.9, Math.max(0, rbNum(d.gp) / 100));
    const assets = rbJobAssets(job);
    const asset = assets.find(function (x) { return x.id === d.assetId; }) || null;
    const partCost = rbNum(d.partCost), partCostTaxed = partCost * (1 + tax);
    const partSell = partCost > 0 ? rbRoundSell(partCostTaxed / (1 - gp)) : 0;
    const hours = rbNum(d.hours);
    const laborSell = hours * RB.labor, laborCost = hours * RB.laborCost;
    let drierSell = 0, drierCost = 0, refSell = 0, refCost = 0, lbs = 0, chargeLb = 0, extraLb = 0, sellPerLb = 0, provSell = 0;
    const flags = [];
    if (T.refrig || d.drierOn) {
      if (rbNum(d.drierCost) > 0) { drierCost = rbNum(d.drierCost) * (1 + tax); drierSell = rbRoundSell(drierCost / (1 - gp)); }
      else { drierSell = RB.drierSell; flags.push("Filter drier at $65 sell (pricing.md); cost not entered"); }
    }
    if (T.refrig) {
      chargeLb = chargeLbFrom(asset && (asset.factoryCharge || ""));
      const ft = rbNum(d.lineSetFt);
      extraLb = ft > RB.stdFt ? (ft - RB.stdFt) * rbNum(d.ozPerFt) / 16 : 0;
      lbs = d.lbsOverride !== "" && d.lbsOverride != null ? rbNum(d.lbsOverride) : Math.round((chargeLb + extraLb) * 100) / 100;
      const cpl = rbNum(d.refCostLb);
      sellPerLb = cpl > 0 ? Math.round(cpl * RB.refMarkup) : 0;
      refSell = Math.round(lbs * sellPerLb * 100) / 100; refCost = lbs * cpl;
      if (!chargeLb && d.lbsOverride === "") flags.push("No factory charge on the equipment record; enter lbs");
      if (lbs > 0 && !(cpl > 0)) flags.push("Enter refrigerant cost per lb");
      if (d.provOn !== false) provSell = RB.provisions;
    }
    const diag = d.initialCall ? RB.diag : 0, truck = d.truck ? RB.truck : 0;
    const total = Math.round((partSell + drierSell + refSell + provSell + laborSell + diag + truck) * 100) / 100;
    const cost = Math.round((partCostTaxed + drierCost + refCost + laborCost) * 100) / 100;
    const gpPct = total > 0 ? (total - cost) / total * 100 : 0;
    if (!(partCost > 0) && d.type !== "leak") flags.push("Part cost not entered");
    if (!(hours > 0)) flags.push("Enter labor hours");
    flags.push("Purchase tax " + rbNum(d.tax) + "% is an assumption (pricing.md: confirm)");
    flags.push("Internal labor cost uses the $55/hr planning placeholder");
    return { T: T, asset: asset, partCost: partCost, partCostTaxed: partCostTaxed, partSell: partSell, hours: hours, laborSell: laborSell, laborCost: laborCost,
      drierSell: drierSell, drierCost: drierCost, chargeLb: chargeLb, extraLb: extraLb, lbs: lbs, sellPerLb: sellPerLb, refSell: refSell, refCost: refCost, provSell: provSell,
      diag: diag, truck: truck, total: total, cost: cost, gpPct: gpPct, flags: flags };
  }
  function rbParts(d, c) {
    const parts = [];
    if (d.partName || c.partCost > 0) parts.push({ name: (d.partName || c.T.label.replace(/ replacement$/i, "")) + (d.partModel ? "" : " (model TBD, confirm from nameplate)"), partNo: d.partModel || "", qty: 1, cost: c.partCost || null, note: "From the repair builder" });
    if (c.drierSell) parts.push({ name: "Filter drier 3/8\" 16 cu in", partNo: "", qty: 1, cost: rbNum(d.drierCost) || null, note: "Auto-added for a refrigerant repair" });
    if (c.lbs > 0) parts.push({ name: "Refrigerant" + (c.asset && c.asset.refrigerant ? " " + c.asset.refrigerant : ""), partNo: "", qty: c.lbs, cost: rbNum(d.refCostLb) || null, note: "lb (" + c.chargeLb + " lb charge + " + (Math.round(c.extraLb * 100) / 100) + " lb line set)" });
    return parts;
  }
  function rbBreakdownRows(b) {
    const rows = [["Part (cost " + money(b.partCost) + " + tax = " + money(b.partCostTaxed) + ")", b.partSell, b.partCostTaxed]];
    if (b.drierSell) rows.push(["Filter drier", b.drierSell, b.drierCost]);
    if (b.lbs > 0) rows.push(["Refrigerant " + b.lbs + " lb × " + money(b.sellPerLb) + "/lb (125% markup)", b.refSell, b.refCost]);
    if (b.provSell) rows.push(["Refrigerant provisions (recovery, evacuation, charging)", b.provSell, 0]);
    rows.push(["Labor " + b.hours + " hr × $85", b.laborSell, b.laborCost]);
    if (b.diag) rows.push(["Diagnostic (initial call)", b.diag, 0]);
    if (b.truck) rows.push(["Truck", b.truck, 0]);
    return rows;
  }
  function builderInternalHtml(b) {
    if (!b) return "";
    const rows = (b.rows || []);
    return '<div class="note steve-only" style="margin-top:8px"><div class="k-up">Steve only · cost / margin</div>' +
      rows.map(function (r) { return '<div class="row" style="font-size:12px"><div style="min-width:0">' + esc(r[0]) + "</div><div>" + money(r[1]) + (r[2] ? ' <span class="meta">(' + money(r[2]) + ")</span>" : "") + "</div></div>"; }).join("") +
      '<div class="row" style="font-weight:750;margin-top:4px"><div>Customer price</div><div>' + money(b.total) + "</div></div>" +
      '<div class="row" style="font-size:12px"><div>Internal cost · GP</div><div>' + money(b.cost) + " · " + (Math.round(b.gpPct * 10) / 10) + "%</div></div>" +
      (b.gpPct < RB.minGp ? '<div class="warn-banner" style="margin-top:6px">Below the 35% GP floor.</div>' : "") +
      ((b.flags || []).length ? '<div class="meta" style="margin-top:4px">' + b.flags.map(esc).join(" · ") + "</div>" : "") +
      (b.survey ? surveySummaryHtml(b.survey) : "") + "</div>";
  }
  function surveySummaryHtml(s) { return typeof siteSurveyText === "function" ? '<div class="meta" style="margin-top:6px;white-space:pre-wrap">Site survey: ' + esc(siteSurveyText(s)) + "</div>" : ""; }
  function repairBuilderSheet(job) {
    const d = state.rbDraft; if (!d) return "";
    const c = rbCalc(d, job);
    const assets = rbJobAssets(job);
    function inp(k, lab, ph, mode) { return '<label class="field"><div class="field-lab">' + lab + '</div><input id="rb-' + k + '" ' + (mode ? 'inputmode="' + mode + '" ' : "") + 'value="' + esc(d[k] == null ? "" : d[k]) + '" placeholder="' + esc(ph || "") + '" oninput="RT.setRb(\'' + k + '\', this.value)"></label>'; }
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Custom repair builder</div><button class="icon-btn ghost" ' + act("rbClose") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<label class="field"><div class="field-lab">Repair type</div><select id="rb-type" onchange="RT.setRbType(this.value)">' + RB_TYPES.map(function (t) { return '<option value="' + t.id + '"' + (t.id === d.type ? " selected" : "") + ">" + esc(t.label) + (t.hours ? " · " + t.hours + " hr" : "") + "</option>"; }).join("") + "</select></label>" +
      inp("label", "Line name (customer sees this)", c.T.label) +
      inp("partName", "Part name", "e.g. ECM blower motor") + inp("partModel", "Part model", "From the nameplate or supplier") +
      inp("partCost", "Part cost (pre-tax)", "e.g. 270.17", "decimal") +
      inp("hours", "Labor hours" + (c.T.hours ? " (suggested " + c.T.hours + ")" : " (enter)"), "", "decimal") +
      '<div class="chips"><button class="chip' + (d.initialCall ? " on" : "") + '" ' + act("rbToggle", "initialCall") + ">Initial call · $150 diagnostic</button>" +
      '<button class="chip' + (d.truck ? " on" : "") + '" ' + act("rbToggle", "truck") + ">Truck · $65</button>" +
      (c.T.refrig ? "" : '<button class="chip' + (d.drierOn ? " on" : "") + '" ' + act("rbToggle", "drierOn") + ">Filter drier</button>") + "</div>" +
      (c.T.refrig || d.drierOn ? '<div class="section">Filter drier' + (c.T.refrig ? " (auto-added)" : "") + "</div>" + inp("drierCost", "Drier cost (optional; blank = $65 sell from pricing.md)", "", "decimal") : "") +
      (c.T.refrig ? '<div class="section">Refrigerant</div>' +
        (assets.length ? '<label class="field"><div class="field-lab">Unit (nameplate charge)</div><select id="rb-asset" onchange="RT.setRb(\'assetId\', this.value, true)">' + assets.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === d.assetId ? " selected" : "") + ">" + esc(assetShortName(x) + (x.factoryCharge ? " · " + x.factoryCharge : " · no charge on file")) + "</option>"; }).join("") + "</select></label>" : '<div class="muted" style="margin-bottom:8px">No equipment at this address. Enter lbs below.</div>') +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + inp("lineSetFt", "Line set length (ft)", "15 = factory charge", "decimal") + inp("ozPerFt", "Oz per ft over 15 ft", "0.6", "decimal") + "</div>" +
        '<div class="meta" style="margin:-4px 0 8px">Charge ' + (Math.round(c.chargeLb * 100) / 100) + " lb + line set " + (Math.round(c.extraLb * 100) / 100) + " lb. 0.6 oz/ft is typical guidance for a 3/8\" liquid line; check the condenser’s install guide.</div>" +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + inp("lbsOverride", "Lbs (override)", String(c.lbs || ""), "decimal") + inp("refCostLb", "Refrigerant cost per lb", "e.g. 50 for R-22", "decimal") + "</div>" +
        '<div class="chips"><button class="chip' + (d.provOn !== false ? " on" : "") + '" ' + act("rbToggle", "provOn") + ">Refrigerant provisions · $185</button></div>" : "") +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + inp("gp", "Parts GP %", "40", "decimal") + inp("tax", "Purchase tax % (assumed)", "10.25", "decimal") + "</div>" +
      '<div class="doc"><div class="k-up">Customer sees</div><div class="row" style="font-weight:750;margin-top:6px"><div>' + esc(d.label || c.T.label) + "</div><div>" + money(c.total) + "</div></div></div>" +
      builderInternalHtml({ rows: rbBreakdownRows(c), total: c.total, cost: c.cost, gpPct: c.gpPct, flags: c.flags }) +
      '<button data-pin class="btn" style="margin-top:12px" ' + act("rbAdd") + ">Add to estimate · " + money(c.total) + "</button>"
    );
  }
  const RT_RB = {
    setRb: function (k, v, rerender) { if (!state.rbDraft) return; state.rbDraft[k] = v; if (k === "label") state.rbDraft.labelTouched = true; if (rerender) render(); else renderKeepFocus("rb-" + k); },
    setRbType: function (v) { const d = state.rbDraft; if (!d) return; const T = rbType(v); d.type = v; d.hours = T.hours; if (!d.labelTouched) d.label = ""; render(); }
  };
  function handleRepairBuilder(name, arg) {
    const job = getJob(state.openJobId);
    if (name === "rbOpen") { if (!job) return true; state.rbDraft = emptyRbDraft(job); state.sheet = "repairBuilder"; render(); return true; }
    if (name === "rbClose") { state.rbDraft = null; state.sheet = "priceBook"; render(); return true; }
    if (name === "rbToggle") { const d = state.rbDraft; if (d) { d[arg] = arg === "provOn" ? (d.provOn === false) : !d[arg]; } render(); return true; }
    if (name === "rbAdd") {
      const d = state.rbDraft; if (!job || !d) return true;
      const c = rbCalc(d, job);
      if (!(c.hours > 0)) { showToast("Enter labor hours"); return true; }
      if (!(c.total > 0)) { showToast("Nothing to price yet"); return true; }
      const rows = rbBreakdownRows(c);
      const line = { id: "rb-" + Date.now(), label: (d.label || c.T.label).trim(), amount: c.total, qty: 1, unit: "", fromBook: false, cost: c.cost, parts: rbParts(d, c),
        builder: { kind: "repair", type: d.type, rows: rows, total: c.total, cost: c.cost, gpPct: c.gpPct, flags: c.flags, inputs: JSON.parse(JSON.stringify(d)) } };
      state.packDraft = (state.packDraft || []).concat([line]);
      state.rbDraft = null; state.sheet = "priceBook";
      showToast("Added · " + money(c.total)); return true;
    }
    return false;
  }

  /* ——— Phase 2 · Replacement / retrofit / AC add builder + site survey ———
     Hours: pricing.md "Install labor hours: locked defaults" + Steve field times (2026-11-25).
     Install labor: cost $60/hr, sell $100/hr (pricing.md, Steve-approved 2026-11-25). Equipment: Payne/Sigler Aug 31, 2026 bundles; AC add 4/5-ton Sigler quotes. */
  const RP = { laborSell: 100, laborCost: 60, tax: 10.25, gp: 40 };
  const RP_BUNDLES = { "2": [4300.12, 4301.12], "2.5": [4467.12, 4468.12], "3": [4676.76, 4677.76], "3.5": [5084.36, 5012.36], "4": [5370.82, 5298.82], "5": [5894.82, 5863.82] };
  const RP_ACADD = { "4": 3520.91, "5": 3949.91 };
  const SV_FIELDS = [
    { k: "flueType", lab: "Flue / venting type", opts: ["PVC (90%+) reuse", "PVC (90%+) new", "B-vent (80%) reuse", "B-vent (80%) new", "None (AC add / electric)"] },
    { k: "flueFt", lab: "Flue length (ft)", num: true, when: function (s) { return /new/.test(s.flueType || ""); } },
    { k: "flueMaterial", lab: "Flue material / notes", text: true, opt: true },
    { k: "condRoute", lab: "Condensate route", opts: ["Gravity, existing drain OK", "Gravity, new drain line", "Pump required", "Difficult drain"] },
    { k: "drainFt", lab: "New drain pipe (ft)", num: true, when: function (s) { return /new drain/.test(s.condRoute || ""); } },
    { k: "condTerm", lab: "Condensate termination", text: true },
    { k: "secPan", lab: "Secondary pan", opts: ["Not needed", "Existing OK", "New pan"] },
    { k: "floatSw", lab: "Float switch", opts: ["Existing OK", "New float switch", "Not needed"] },
    { k: "lineSet", lab: "Line set", opts: ["Reuse (flush)", "New, accessible", "New, difficult / concealed", "None (no AC)"] },
    { k: "lineSetFt", lab: "Line set length (ft)", num: true, when: function (s) { return !/None/.test(s.lineSet || ""); } },
    { k: "lineSetCover", lab: "Line set cover", opts: ["No", "Yes"] },
    { k: "disconnect", lab: "Disconnect", opts: ["Existing OK", "New disconnect"] },
    { k: "circuit", lab: "Breaker / circuit", opts: ["Existing OK", "New condenser circuit", "Not applicable"] },
    { k: "wire", lab: "Wire size / notes", text: true },
    { k: "pad", lab: "Pad / stand", opts: ["Existing OK", "New pad", "New stand / wall brackets", "Not applicable"] },
    { k: "plenum", lab: "Plenum / transition", opts: ["Standard", "Beyond standard (custom)"] },
    { k: "platform", lab: "Attic platform", opts: ["Not needed", "Existing OK", "New, easy", "New, medium", "New, hard", "Extend / repair"] },
    { k: "gas", lab: "Gas", opts: ["Existing OK", "Needs work (price manually)", "Not applicable"] },
    { k: "permit", lab: "Permit / HERS", opts: ["Permit + HERS", "Permit only", "Not required"] },
    { k: "haulAway", lab: "Haul-away", opts: ["Yes (included)", "Customer keeps"] },
    { k: "startup", lab: "Startup / commissioning", opts: ["Yes (included)"] },
    { k: "warrantyReg", lab: "Warranty registration", opts: ["Yes (included)", "Customer will register"] }
  ];
  function svActive(s) { return SV_FIELDS.filter(function (f) { return !f.when || f.when(s); }); }
  function svMissing(s) { s = s || {}; return svActive(s).filter(function (f) { return !f.opt && String(s[f.k] == null ? "" : s[f.k]).trim() === ""; }).map(function (f) { return f.lab; }); }
  function siteSurveyText(s) { s = s || {}; return svActive(s).filter(function (f) { return String(s[f.k] || "").trim(); }).map(function (f) { return f.lab + ": " + s[f.k]; }).join("; ") + (s.at ? " (" + s.at + ")" : ""); }
  function rpAdders(s, kind) {
    s = s || {}; const out = [];
    function add(id, label, hrs, note) { out.push({ id: id, label: label, hours: Math.round(hrs * 100) / 100, note: note || "" }); }
    const ft = rbNum(s.lineSetFt);
    if (/New/.test(s.lineSet || "")) {
      if (/difficult/.test(s.lineSet)) add("lineset", "Line set, difficult/concealed " + (ft || "?") + " ft", 20 + Math.max(0, ft - 50) * 0.15, ft <= 25 ? "No locked time under 26 ft; 20 mh used, edit" : "");
      else if (ft > 25) add("lineset", "Line set, accessible " + ft + " ft", 7 + Math.max(0, ft - 50) * 0.15);
      else add("lineset", "Line set, accessible " + (ft || "?") + " ft", ft * 0.15, "No locked time under 26 ft; 0.15 hr/ft used, edit");
    }
    if (s.lineSetCover === "Yes") add("lscover", "Line set cover", 1.5);
    if (s.circuit === "New condenser circuit") add("circuit", "New condenser circuit", 9);
    if (s.disconnect === "New disconnect") add("disconnect", "New disconnect", 0, "No locked time; enter hours");
    if (s.plenum === "Beyond standard (custom)") add("plenum", "Plenum / transition beyond standard", 9);
    if (/Pump|Difficult/.test(s.condRoute || "")) add("condpump", "Condensate pump / difficult drain", 6);
    if (/new drain/.test(s.condRoute || "")) add("drain", "Drain pipe " + rbNum(s.drainFt) + " ft", rbNum(s.drainFt) * 0.12);
    if (s.secPan === "New pan") add("secpan", "Secondary drain pan", 1.5);
    if (s.floatSw === "New float switch") add("float", "Float switch", 0.75);
    if (s.flueType === "PVC (90%+) new") add("pvc", "PVC vent to 30 ft", 4, rbNum(s.flueFt) > 30 ? "Over 30 ft: no locked time, edit" : "");
    if (s.flueType === "B-vent (80%) new") add("bvent", "B-vent " + rbNum(s.flueFt) + " ft", rbNum(s.flueFt) * 0.11);
    if (s.pad === "New pad") add("pad", "Condenser pad", 1);
    if (s.pad === "New stand / wall brackets") add("stand", "Condenser stand / brackets", 0, "No locked time; enter hours");
    if (/^New, /.test(s.platform || "")) add("platform", "New attic platform (" + s.platform.slice(5) + ")", { easy: 3, medium: 4, hard: 6 }[s.platform.slice(5)] || 4);
    if (s.platform === "Extend / repair") add("platext", "Platform extension / repair", 2);
    if (/^Permit/.test(s.permit || "")) add("permit", "Permit / HERS coordination", 3, "Permit and HERS fees not included; add as material cost");
    if (/Needs work/.test(s.gas || "")) add("gas", "Gas work", 0, "No locked time; enter hours");
    return out;
  }
  function rpBase(d) {
    if (d.kind === "acadd") return { hours: 9, label: "AC add (condenser only base)", note: "Coil install / furnace work not in the locked list; add manual hours" };
    if (d.kind === "retrofit") return { hours: 32, label: "Closet furnace relocated to attic" };
    return d.config === "horizontal" ? { hours: 28, label: "Like-for-like split, horizontal" } : { hours: 26, label: "Like-for-like split, upflow" };
  }
  function rpDefaultEquipCost(d) {
    if (d.kind === "acadd") return RP_ACADD[d.tons] || "";
    const b = RP_BUNDLES[d.tons]; if (!b) return "";
    return (d.kind === "retrofit" || d.config === "horizontal") ? b[1] : b[0];
  }
  function emptyRpDraft(job) {
    const d = { kind: "replacement", tons: "3", config: "upflow", equipCost: "", materialsCost: "", gp: RP.gp, tax: RP.tax, refCostLb: "", ozPerFt: 0.6, hrs: {}, manualHours: "", label: "", labelTouched: false };
    d.equipCost = rpDefaultEquipCost(d); return d;
  }
  function rpCalc(d, job) {
    const s = (job && job.siteSurvey) || {};
    const missing = svMissing(s);
    const tax = rbNum(d.tax) / 100, gp = Math.min(0.9, Math.max(0, rbNum(d.gp) / 100));
    const base = rpBase(d);
    const adders = rpAdders(s, d.kind).map(function (a) { const o = d.hrs[a.id]; return Object.assign({}, a, { hours: o !== undefined && o !== "" ? rbNum(o) : a.hours }); });
    const baseHours = d.hrs.base !== undefined && d.hrs.base !== "" ? rbNum(d.hrs.base) : base.hours;
    const manual = rbNum(d.manualHours);
    const hours = baseHours + manual + adders.reduce(function (t, a) { return t + a.hours; }, 0);
    const eqCost = rbNum(d.equipCost) * (1 + tax), matCost = rbNum(d.materialsCost) * (1 + tax);
    const eqSell = eqCost > 0 ? Math.round(eqCost / (1 - gp)) : 0, matSell = matCost > 0 ? Math.round(matCost / (1 - gp)) : 0;
    const ft = rbNum(s.lineSetFt);
    const refLb = /None/.test(s.lineSet || "") ? 0 : Math.round(Math.max(0, ft - 15) * rbNum(d.ozPerFt) / 16 * 100) / 100;
    const cpl = rbNum(d.refCostLb), refSellLb = cpl > 0 ? Math.round(cpl * 2.25) : 0;
    const refSell = Math.round(refLb * refSellLb * 100) / 100, refCost = refLb * cpl;
    const laborSell = Math.round(hours * RP.laborSell * 100) / 100, laborCost = hours * RP.laborCost;
    const total = Math.round((eqSell + matSell + refSell + laborSell) * 100) / 100;
    const cost = Math.round((eqCost + matCost + refCost + laborCost) * 100) / 100;
    const gpPct = total > 0 ? (total - cost) / total * 100 : 0;
    const flags = ["Purchase tax " + rbNum(d.tax) + "% is an assumption (pricing.md: confirm)", "Haul-away, startup and warranty registration are included (no separate line)"];
    if (!(rbNum(d.materialsCost) > 0)) flags.push("Materials cost not entered (flagged; enter from the Sigler duct/misc sheet)");
    if (!(rbNum(d.equipCost) > 0)) flags.push("Equipment cost not entered" + (d.kind === "acadd" ? " (Sigler quotes cover 4 and 5 ton only)" : ""));
    if (refLb > 0 && !(cpl > 0)) flags.push("Enter refrigerant cost per lb for the extra " + refLb + " lb");
    if (base.note) flags.push(base.note);
    adders.forEach(function (a) { if (a.note) flags.push(a.label + ": " + a.note); });
    if (gpPct > 0 && gpPct < 30) flags.push("Below the 30–35% replacement project target");
    const rows = [["Equipment (cost " + money(rbNum(d.equipCost)) + " + tax)", eqSell, eqCost]];
    if (matSell) rows.push(["Materials", matSell, matCost]);
    if (refLb > 0) rows.push(["Extra refrigerant " + refLb + " lb (line set " + ft + " ft)", refSell, refCost]);
    rows.push([base.label + " · " + baseHours + " hr", baseHours * RP.laborSell, baseHours * RP.laborCost]);
    adders.forEach(function (a) { rows.push([a.label + " · " + a.hours + " hr", a.hours * RP.laborSell, a.hours * RP.laborCost]); });
    if (manual) rows.push(["Manual hours · " + manual + " hr", manual * RP.laborSell, manual * RP.laborCost]);
    return { missing: missing, base: base, baseHours: baseHours, adders: adders, hours: hours, eqSell: eqSell, matSell: matSell, refLb: refLb, refSell: refSell, laborSell: laborSell, total: total, cost: cost, gpPct: gpPct, flags: flags, rows: rows, survey: s };
  }
  function rpKindLabel(d) { return d.kind === "acadd" ? d.tons + "-ton AC add" : d.kind === "retrofit" ? d.tons + "-ton system replacement, closet to attic retrofit" : d.tons + "-ton system replacement (" + d.config + ")"; }
  function rpOpenButton() { return '<button class="btn teal" style="margin:0" ' + act("rpOpen") + ">Replacement / retrofit / AC add</button>"; }
  function rpSheet(job) {
    const d = state.rpDraft; if (!d) return "";
    const c = rpCalc(d, job);
    function inp(k, lab, ph) { return '<label class="field"><div class="field-lab">' + lab + '</div><input id="rp-' + k + '" inputmode="decimal" value="' + esc(d[k] == null ? "" : d[k]) + '" placeholder="' + esc(ph || "") + '" oninput="RT.setRp(\'' + k + '\', this.value)"></label>'; }
    function hrInp(id, val) { return '<input id="rp-h-' + id + '" inputmode="decimal" class="hr-in" value="' + esc(String(val)) + '" oninput="RT.setRpHr(\'' + id + '\', this.value)">'; }
    function seg(k, opts) { return '<div class="chips">' + opts.map(function (o) { return '<button class="chip' + (d[k] === o[0] ? " on" : "") + '" ' + act("rpSet", k + "|" + o[0]) + ">" + esc(o[1]) + "</button>"; }).join("") + "</div>"; }
    const done = c.missing.length === 0;
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Replacement / retrofit / AC add</div><button class="icon-btn ghost" ' + act("rpClose") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      seg("kind", [["replacement", "Replacement"], ["retrofit", "Retrofit (closet → attic)"], ["acadd", "AC add"]]) +
      seg("tons", [["2", "2 T"], ["2.5", "2.5 T"], ["3", "3 T"], ["3.5", "3.5 T"], ["4", "4 T"], ["5", "5 T"]]) +
      (d.kind === "replacement" ? seg("config", [["upflow", "Upflow"], ["horizontal", "Horizontal"]]) : "") +
      '<button class="btn ' + (done ? "ghost" : "accent") + '" style="margin:6px 0 10px" ' + act("svOpen") + ">Site survey · " + (done ? "complete ✓" : c.missing.length + " left") + "</button>" +
      (done ? "" : '<div class="warn-banner">Finish the site survey to price this job. Missing: ' + esc(c.missing.join(", ")) + ".</div>") +
      '<label class="field"><div class="field-lab">Line name (customer sees this)</div><input id="rp-label" value="' + esc(d.label) + '" placeholder="' + esc(rpKindLabel(d)) + '" oninput="RT.setRp(\'label\', this.value)"></label>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + inp("equipCost", "Equipment cost (pre-tax)", "Aug 31 bundle") + inp("materialsCost", "Materials cost (pre-tax)", "Enter") + "</div>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + inp("refCostLb", "Refrigerant cost / lb", "for line set over 15 ft") + inp("ozPerFt", "Oz per ft over 15 ft", "0.6") + "</div>" +
      '<div class="section">Labor · $100/hr sell · $60/hr cost</div>' +
      '<div class="row"><div>' + esc(c.base.label) + "</div><div>" + hrInp("base", c.baseHours) + " hr</div></div>" +
      c.adders.map(function (a) { return '<div class="row"><div style="min-width:0">' + esc(a.label) + (a.note ? '<div class="meta">' + esc(a.note) + "</div>" : "") + "</div><div>" + hrInp(a.id, a.hours) + " hr</div></div>"; }).join("") +
      (c.adders.length ? "" : '<div class="meta">Adders come from the site survey answers.</div>') +
      '<div class="row"><div>Manual hours (other)</div><div><input id="rp-manualHours" inputmode="decimal" class="hr-in" value="' + esc(d.manualHours) + '" oninput="RT.setRp(\'manualHours\', this.value)"> hr</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">' + inp("gp", "Equipment/materials GP %", "40") + inp("tax", "Purchase tax % (assumed)", "10.25") + "</div>" +
      (done ? '<div class="doc"><div class="k-up">Customer sees</div><div class="row" style="font-weight:750;margin-top:6px"><div>' + esc(d.label || rpKindLabel(d)) + "</div><div>" + money(c.total) + "</div></div></div>" +
        builderInternalHtml({ rows: c.rows, total: c.total, cost: c.cost, gpPct: c.gpPct, flags: c.flags, survey: c.survey }) +
        '<button data-pin class="btn" style="margin-top:12px" ' + act("rpAdd") + ">Add to estimate · " + money(c.total) + "</button>"
        : '<button data-pin class="btn" style="margin-top:12px;opacity:.5" ' + act("rpAdd") + ">Price locked until the survey is done</button>")
    );
  }
  function siteSurveySheet(job) {
    const s = state.svDraft || {};
    const miss = svMissing(s);
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Site survey</div><button class="icon-btn ghost" ' + act("svCancel") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:8px">Required before a replacement, retrofit or AC add can be priced. You can save it part-done. Answers set the adders.</div>' +
      svActive(s).map(function (f) {
        const v = s[f.k] == null ? "" : s[f.k];
        if (f.opts) return '<label class="field"><div class="field-lab">' + esc(f.lab) + '</div><select id="sv-' + f.k + '" onchange="RT.setSv(\'' + f.k + '\', this.value, true)"><option value="">Choose…</option>' + f.opts.map(function (o) { return '<option' + (o === v ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select></label>";
        return '<label class="field"><div class="field-lab">' + esc(f.lab) + (f.opt ? " (optional)" : "") + '</div><input id="sv-' + f.k + '"' + (f.num ? ' inputmode="decimal"' : "") + ' value="' + esc(v) + '" oninput="RT.setSv(\'' + f.k + '\', this.value)"></label>';
      }).join("") +
      '<div class="meta" style="margin:6px 0">' + (miss.length ? miss.length + " left: " + esc(miss.join(", ")) : "All required answers done.") + "</div>" +
      '<button data-pin class="btn" ' + act("svSave") + ">Save survey</button>"
    );
  }
  Object.assign(RT_RB, {
    setRp: function (k, v) { if (!state.rpDraft) return; state.rpDraft[k] = v; if (k === "label") state.rpDraft.labelTouched = true; renderKeepFocus("rp-" + k); },
    setRpHr: function (id, v) { if (!state.rpDraft) return; state.rpDraft.hrs[id] = v; renderKeepFocus("rp-h-" + id); },
    setSv: function (k, v, rerender) { if (!state.svDraft) return; state.svDraft[k] = v; if (rerender) render(); else renderKeepFocus("sv-" + k); }
  });
  function handleReplacementBuilder(name, arg) {
    const job = getJob(state.openJobId);
    if (name === "rpOpen") { if (!job) return true; state.rpDraft = emptyRpDraft(job); state.sheet = "rpBuilder"; render(); return true; }
    if (name === "rpClose") { state.rpDraft = null; state.sheet = "priceBook"; render(); return true; }
    if (name === "rpSet") {
      const d = state.rpDraft; if (!d) return true;
      const i = String(arg).indexOf("|"), k = String(arg).slice(0, i), v = String(arg).slice(i + 1);
      const oldDef = rpDefaultEquipCost(d);
      d[k] = v;
      if (String(d.equipCost) === String(oldDef) || d.equipCost === "") d.equipCost = rpDefaultEquipCost(d);
      if (k !== "tons") d.hrs.base = "";
      render(); return true;
    }
    if (name === "svOpen") { if (!job) return true; state.svDraft = Object.assign({}, job.siteSurvey || {}); state.svReturn = state.sheet; state.sheet = "siteSurvey"; render(); return true; }
    if (name === "svCancel") { state.svDraft = null; state.sheet = state.svReturn || null; render(); return true; }
    if (name === "svSave") {
      if (!job) return true;
      const s = Object.assign({}, state.svDraft || {}); s.at = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
      s.by = (typeof actingAs === "function" && actingAs()) || "";
      job.siteSurvey = s; state.svDraft = null; state.sheet = state.svReturn || null;
      showToast(svMissing(s).length ? "Survey saved · " + svMissing(s).length + " left" : "Survey complete"); return true;
    }
    if (name === "rpAdd") {
      const d = state.rpDraft; if (!job || !d) return true;
      const c = rpCalc(d, job);
      if (c.missing.length) { showToast("Finish the site survey first"); return true; }
      if (!(c.total > 0)) { showToast("Nothing to price yet"); return true; }
      const parts = [{ name: rpKindLabel(d) + " equipment (Payne/Sigler)", partNo: "", qty: 1, cost: rbNum(d.equipCost) || null, note: "From the replacement builder" }];
      if (c.refLb > 0) parts.push({ name: "Refrigerant (line set " + rbNum(c.survey.lineSetFt) + " ft)", partNo: "", qty: c.refLb, cost: rbNum(d.refCostLb) || null, note: "lb over factory charge" });
      const line = { id: "rp-" + Date.now(), label: (d.label || rpKindLabel(d)).trim(), amount: c.total, qty: 1, unit: "", fromBook: false, cost: c.cost, parts: parts,
        builder: { kind: d.kind, rows: c.rows, total: c.total, cost: c.cost, gpPct: c.gpPct, flags: c.flags, survey: JSON.parse(JSON.stringify(c.survey)), hours: c.hours, inputs: JSON.parse(JSON.stringify(d)) } };
      state.packDraft = (state.packDraft || []).concat([line]);
      state.rpDraft = null; state.sheet = "priceBook"; showToast("Added · " + money(c.total)); return true;
    }
    return false;
  }

  /* ——— Phase 2 · Multi-invoice (progress billing), T&M invoices, job closeout ———
     Default stays one invoice due on completion. Nothing here sends anything to a customer. */
  const CA_7159_NOTE = "California B&P Code §7159: on a home improvement contract the down payment may not exceed $1,000 or 10% of the contract price, whichever is less, and each progress payment may not exceed the value of the work performed or materials delivered. Bill this only when the equipment is delivered to the site, and keep the payment schedule in the signed contract. (Warning only; this does not block.)";
  function invList(job) { return job && Array.isArray(job.invoices) ? job.invoices : []; }
  function ensureInvoices(job) {
    if (!Array.isArray(job.invoices)) {
      job.invoices = [];
      if (job.invoiceId) {
        const paid = job.status === "paid";
        job.invoices.push({ id: String(job.invoiceId), kind: "single", title: "Invoice", lines: (job.lineItems || []).map(function (l) { return { label: l.label || l.name || "Item", amount: Number(l.amount) || 0 }; }),
          total: Number(job.total) || 0, due: paid ? 0 : (invoiceDue(job) || Number(job.total) || 0), status: paid ? "paid" : "open", paidMethod: job.paidMethod || "", paidDate: job.paidDate || "", legacy: true, createdAt: "" });
      }
    }
    return job.invoices;
  }
  function activeInvoice(job) {
    const l = invList(job); if (!l.length) return null;
    return l.find(function (i) { return i.id === job.activeInvoiceId; }) || l.find(function (i) { return i.status !== "paid"; }) || l[l.length - 1];
  }
  function setActiveInvoice(job, inv) { job.activeInvoiceId = inv.id; job.invoiceId = inv.id; job.dueAmount = inv.status === "paid" ? 0 : (Number(inv.due) || 0); }
  function nextInvoiceId(job) { const n = invList(job).length + 1; return job.id + "-" + (n < 10 ? "0" : "") + n; }
  function ptNow() { return new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) + " PT"; }
  function r2(x) { return Math.round((Number(x) || 0) * 100) / 100; }
  function invKindLabel(inv) { return inv.kind === "deposit" ? "Progress 1 · equipment delivery" : inv.kind === "final" ? "Final · balance" : inv.kind === "tm" ? "Time & materials" : "Invoice"; }
  function isInstallJob(job) {
    if (!job) return false;
    if (job.billingMode === "progress") return true;
    return (job.lineItems || []).some(function (l) { return (l.builder && ["replacement", "retrofit", "acadd"].indexOf(l.builder.kind) !== -1) || /replacement|retrofit|AC add|system install|changeout|change-out/i.test(l.label || ""); });
  }
  function jobMoney(job) {
    const l = invList(job);
    const billed = l.reduce(function (t, i) { return t + (Number(i.total) || 0); }, 0);
    const paid = l.reduce(function (t, i) { return t + (i.status === "paid" ? (Number(i.total) || 0) : 0); }, 0);
    return { billed: r2(billed), paid: r2(paid), open: r2(l.reduce(function (t, i) { return t + (i.status === "paid" ? 0 : (Number(i.due) || 0)); }, 0)) };
  }
  /* T&M: one labor line per visit date (from completed clock-ins) at $85/hr, truck $65 per visit (toggle), parts at price book GP */
  function ptDate(iso) { const ms = parseStamp(iso); if (!ms) return ""; return new Date(ms).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "2-digit", day: "2-digit", year: "numeric" }); }
  function tmLines(job, opts) {
    opts = opts || {};
    const byDate = {}, order = [];
    completedTimeEntries(job).forEach(function (e) { const d = ptDate(e.clockIn); if (!d) return; if (!byDate[d]) { byDate[d] = { hrs: 0, techs: [] }; order.push(d); } byDate[d].hrs += entryHours(e); if (byDate[d].techs.indexOf(e.tech) === -1) byDate[d].techs.push(e.tech); });
    order.sort(function (a, b) { return new Date(a) - new Date(b); });
    const lines = [], flags = [];
    order.forEach(function (d) {
      const h = Math.round(byDate[d].hrs * 100) / 100;
      lines.push({ label: "Labor " + d + " · " + h + " hr @ $85/hr" + (byDate[d].techs.length > 1 ? " (" + byDate[d].techs.join(", ") + ")" : ""), amount: r2(h * 85), tm: "labor", date: d, hours: h });
      if (opts.truck !== false) lines.push({ label: "Truck / trip " + d, amount: 65, tm: "truck", date: d });
    });
    if (!order.length) flags.push("No completed clock-ins on this job; labor lines are empty");
    jobParts(job).filter(function (p) { return ["returned", "cancelled", "canceled"].indexOf(p.status) === -1; }).forEach(function (p) {
      const qty = Number(p.qty) > 0 ? Number(p.qty) : 1;
      const cost = p.cost != null && p.cost !== "" ? Number(p.cost) : null;
      const refr = /refrigerant|r-?22|r-?410|r-?407|r-?454|r-?32/i.test(p.name || "");
      let each = 0;
      if (cost != null && cost > 0) each = refr ? Math.round(cost * 2.25) : rbRoundSell(cost * 1.1025 / 0.6);
      else flags.push((p.name || "Part") + ": no cost, enter a price");
      lines.push({ label: (p.name || "Part") + (qty !== 1 ? " × " + qty : ""), amount: r2(each * qty), tm: "part", partId: p.id });
    });
    flags.push("Parts at cost × 1.1025 tax ÷ 0.60 (40% GP); refrigerant at cost × 2.25 (pricing.md). Tax 10.25% is assumed.");
    return { lines: lines, total: r2(lines.reduce(function (t, l) { return t + l.amount; }, 0)), flags: flags, visits: order.length };
  }
  function buildFinalInvoice(job, mode, opts) {
    ensureInvoices(job);
    const dep = invList(job).filter(function (i) { return i.kind === "deposit"; });
    let inv = invList(job).find(function (i) { return i.kind !== "deposit" && i.status !== "paid"; });
    let lines, total, kind, title;
    if (mode === "tm") {
      const t = tmLines(job, opts); lines = t.lines; total = t.total; kind = "tm"; title = "Time & materials invoice";
      if (job.totalBeforeTm == null) job.totalBeforeTm = Number(job.total) || 0;
      job.total = total;
    } else {
      lines = (job.lineItems || []).map(function (l) { return { label: l.label || l.name || "Item", amount: Number(l.amount) || 0 }; });
      total = Number(job.total) || 0; kind = dep.length ? "final" : "single"; title = dep.length ? "Final invoice" : "Invoice";
    }
    let due = total;
    dep.forEach(function (d) { lines.push({ label: "Less progress payment " + d.id + (d.status === "paid" ? " (paid)" : " (billed)"), amount: -(Number(d.total) || 0) }); due -= Number(d.total) || 0; });
    due = r2(due);
    const rec = { id: inv ? inv.id : nextInvoiceId(job), legacy: false, kind: kind, title: title, lines: lines, total: dep.length ? due : r2(total), due: due, status: "open", draft: true, dueNote: "Due on completion", createdAt: ptNow() };
    if (inv) Object.assign(inv, rec); else { job.invoices.push(rec); inv = rec; }
    setActiveInvoice(job, inv);
    return inv;
  }
  function closeoutBannerHtml(job) {
    const calls = (job.callbackJobIds || []);
    const links = (job.callbackOf ? '<div class="meta" style="margin-top:4px">' + esc(job.callbackKind === "warranty" ? "Warranty" : "Callback") + ' for <button class="chip" style="padding:2px 8px;min-height:0" ' + act("openLinkedJob", job.callbackOf) + ">#" + esc(job.callbackOf) + "</button></div>" : "") +
      (calls.length ? '<div class="meta" style="margin-top:4px">Callback / warranty jobs: ' + calls.map(function (id) { return '<button class="chip" style="padding:2px 8px;min-height:0" ' + act("openLinkedJob", id) + ">#" + esc(id) + "</button>"; }).join(" ") + "</div>" : "");
    const m = jobMoney(job);
    const money3 = invList(job).length ? '<div class="meta" style="margin-top:4px">Invoiced ' + money(m.billed) + " · paid " + money(m.paid) + " · open " + money(m.open) + "</div>" : "";
    if (job.posted) return '<div class="note" style="margin-bottom:12px"><b>Posted · locked</b> ' + esc(job.posted.at || "") + (job.posted.auto ? " (paid in full)" : "") + money3 + links +
      '<div style="display:flex;gap:8px;margin-top:8px"><button class="btn ghost" style="flex:1;margin:0" ' + act("reopenOpen") + ">Reopen</button><button class=\"btn ghost\" style=\"flex:1;margin:0\" " + act("callbackOpen") + ">Callback / warranty</button></div></div>";
    if (job.workComplete) return '<div class="note" style="margin-bottom:12px"><b>Work complete · awaiting payment</b> ' + esc(job.workComplete.at || "") + money3 + links +
      '<div style="display:flex;gap:8px;margin-top:8px"><button class="btn ghost" style="flex:1;margin:0" ' + act("reopenOpen") + ">Reopen</button><button class=\"btn ghost\" style=\"flex:1;margin:0\" " + act("postJob") + ">Post now</button><button class=\"btn ghost\" style=\"flex:1;margin:0\" " + act("callbackOpen") + ">Callback</button></div></div>";
    if (job.status === "paid" || job.status === "done") return '<div style="margin-bottom:12px">' + money3 + links + '<div style="display:flex;gap:8px;margin-top:6px">' + (job.status === "paid" ? '<button class="btn ghost" style="flex:1;margin:0" ' + act("postJob") + ">Post (lock) job</button>" : "") + '<button class="btn ghost" style="flex:1;margin:0" ' + act("callbackOpen") + ">Callback / warranty</button></div></div>";
    return (money3 || links) ? '<div style="margin-bottom:12px">' + money3 + links + "</div>" : "";
  }
  function closeoutActionsHtml(job) {
    if (job.posted || job.workComplete) return "";
    let h = "";
    if (["approved", "progress", "done"].indexOf(job.status) !== -1) {
      if (isInstallJob(job) && !job.invoiceId && !invList(job).some(function (i) { return i.kind === "deposit"; })) h += '<button class="btn ghost" ' + act("progressOpen") + ">Progress billing · 50% at equipment delivery</button>";
      h += '<button class="btn teal" ' + act("closeoutOpen") + ">Work complete</button>";
    }
    return h;
  }
  function progressSheet(job) {
    const amt = r2((Number(job.total) || 0) * 0.5);
    const id = invList(job).length ? nextInvoiceId(job) : job.id + "-01";
    return backdrop('<div class="sheet-head"><div class="sheet-title">Progress billing</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:10px">Two invoices instead of one: ' + esc(id) + " for 50% when the equipment is delivered, then a final invoice for the balance when you tap Work complete. Use this only if you want it; the default is one invoice due on completion.</div>" +
      '<div class="doc"><div class="k-up">Invoice ' + esc(id) + " · due on equipment delivery</div>" +
      '<div class="row" style="margin-top:6px"><div>Progress payment 1 of 2: equipment delivery (50% of ' + money(job.total) + ")</div><div>" + money(amt) + "</div></div></div>" +
      '<div class="warn-banner" style="margin-top:10px">' + esc(CA_7159_NOTE) + "</div>" +
      (!(Number(job.total) > 0) ? '<div class="warn-banner">This job has no total yet. Save or approve the estimate first.</div>' : "") +
      '<button data-pin class="btn teal" ' + act("progressCreate") + ">Create " + esc(id) + " · " + money(amt) + "</button>" +
      '<div class="hint">Creating the invoice does not send it. Use Send invoice when the equipment is delivered.</div>');
  }
  function closeoutSheet(job) {
    const d = state.coDraft || { mode: "single", truck: true };
    const prog = invList(job).some(function (i) { return i.kind === "deposit"; });
    const open = jobTimeEntries(job).filter(function (e) { return e.clockIn && !e.clockOut; });
    let body = "";
    if (prog) {
      const dep = invList(job).filter(function (i) { return i.kind === "deposit"; });
      const depT = dep.reduce(function (t, i) { return t + (Number(i.total) || 0); }, 0);
      body = '<div class="doc"><div class="k-up">Final invoice · balance</div><div class="row" style="margin-top:6px"><div>Contract total</div><div>' + money(job.total) + "</div></div>" +
        dep.map(function (i) { return '<div class="row"><div>Less ' + esc(i.id) + (i.status === "paid" ? " (paid)" : " (billed, unpaid)") + "</div><div>−" + money(i.total) + "</div></div>"; }).join("") +
        '<div class="row" style="font-weight:750;margin-top:6px"><div>Balance due</div><div>' + money(r2((Number(job.total) || 0) - depT)) + "</div></div></div>";
    } else {
      body = '<div class="chips"><button class="chip' + (d.mode !== "tm" ? " on" : "") + '" ' + act("coMode", "single") + ">One invoice (estimate price)</button><button class=\"chip" + (d.mode === "tm" ? " on" : "") + '" ' + act("coMode", "tm") + ">Time & materials</button></div>";
      if (d.mode === "tm") {
        const t = tmLines(job, d);
        body += '<div class="chips"><button class="chip' + (d.truck !== false ? " on" : "") + '" ' + act("coTruck") + ">Truck $65 per visit</button></div>" +
          '<div class="doc"><div class="k-up">T&M · ' + t.visits + " visit" + (t.visits === 1 ? "" : "s") + "</div>" + t.lines.map(function (l) { return '<div class="row" style="margin-top:6px"><div style="min-width:0">' + esc(l.label) + "</div><div>" + money(l.amount) + "</div></div>"; }).join("") +
          '<div class="row" style="font-weight:750;margin-top:8px"><div>Total</div><div>' + money(t.total) + "</div></div></div>" +
          '<div class="meta" style="margin-top:6px">' + t.flags.map(esc).join(" · ") + "</div>" +
          (open.length ? '<div class="meta">Open clock-ins will be closed now and included.</div>' : "");
      } else {
        body += '<div class="doc"><div class="k-up">Invoice ' + esc(invList(job).length ? nextInvoiceId(job) : job.id + "-01") + "</div>" + (job.lineItems || []).map(function (l) { return '<div class="row" style="margin-top:6px"><div>' + esc(l.label) + "</div><div>" + money(l.amount) + "</div></div>"; }).join("") +
          '<div class="row" style="font-weight:750;margin-top:8px"><div>Total</div><div>' + money(job.total) + "</div></div></div>";
      }
    }
    return backdrop('<div class="sheet-head"><div class="sheet-title">Work complete</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:10px">This ' + (open.length ? "clocks out " + open.length + " open time entr" + (open.length === 1 ? "y" : "ies") + ", " : "") + "stops clock-in, writes the final invoice draft, and moves the job to Awaiting payment. Nothing is sent.</div>" +
      body + '<button data-pin class="btn teal" style="margin-top:12px" ' + act("workComplete") + ">Work complete · write invoice draft</button>");
  }
  function invoicesSheet(job) {
    const inv = activeInvoice(job);
    const l = invList(job), m = jobMoney(job);
    return backdrop('<div class="sheet-head"><div class="sheet-title">Invoices</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (l.length > 1 ? '<div class="chips">' + l.map(function (i) { return '<button class="chip' + (i === inv ? " on" : "") + '" ' + act("pickInvoice", i.id) + ">" + esc(i.id) + " · " + (i.status === "paid" ? "paid" : money(i.due)) + "</button>"; }).join("") + "</div>" : "") +
      '<div class="doc"><div class="k-up">Invoice ' + esc(inv.id) + " · " + esc(invKindLabel(inv)) + (inv.draft && inv.status !== "paid" ? " · draft" : "") + "</div>" +
      docBlocksHtml(job, { showReferred: true }) +
      inv.lines.map(function (x) { return '<div class="row" style="margin-top:6px"><div style="min-width:0">' + esc(x.label) + "</div><div>" + money(x.amount) + "</div></div>"; }).join("") +
      '<div class="row" style="margin-top:10px;font-weight:750"><div>' + (inv.status === "paid" ? "Paid" : "Amount due") + "</div><div>" + money(inv.status === "paid" ? inv.total : inv.due) + "</div></div>" +
      '<div class="meta">' + esc(inv.dueNote || "") + (inv.paidDate ? " · paid " + esc(inv.paidDate) + " · " + esc(inv.paidMethod || "") : "") + "</div></div>" +
      (inv.kind === "deposit" ? '<div class="warn-banner" style="margin-top:10px">' + esc(CA_7159_NOTE) + "</div>" : "") +
      (l.length > 1 ? '<div class="meta" style="margin-top:8px">Job: invoiced ' + money(m.billed) + " · paid " + money(m.paid) + " · open " + money(m.open) + "</div>" : "") +
      (inv.kind === "single" || inv.kind === "final" ? (showTimeOnInvoice(job) ? timeOnSiteTable(job) : "") : "") +
      (inv.status !== "paid" ? '<button class="btn teal" ' + act("sheet", "pay") + ">Pay now</button>" : "") +
      '<button data-pin class="btn teal" ' + act("sheet", "send") + ">Send invoice " + esc(inv.id) + "</button>" +
      (inv.status !== "paid" && !job.posted ? '<button class="btn accent" ' + act("sheet", "paid") + ">Mark " + esc(inv.id) + " paid</button>" : "") +
      '<button class="btn ghost" ' + act("closeSheet") + ">Done</button>");
  }
  function reasonSheet(job, kind) {
    const d = state.reasonDraft || { text: "", cb: "callback" };
    return backdrop('<div class="sheet-head"><div class="sheet-title">' + (kind === "reopen" ? "Reopen job" : "Callback / warranty") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (kind === "reopen" ? '<div class="muted" style="margin-bottom:10px">Unlocks job #' + esc(job.id) + " so you can clock in and edit again. The reason is logged on the job. Invoices and payments are kept.</div>"
        : '<div class="muted" style="margin-bottom:10px">Creates a new job linked to #' + esc(job.id) + " for the same customer and address.</div>" +
          '<div class="chips"><button class="chip' + (d.cb !== "warranty" ? " on" : "") + '" ' + act("cbKind", "callback") + ">Callback</button><button class=\"chip" + (d.cb === "warranty" ? " on" : "") + '" ' + act("cbKind", "warranty") + ">Warranty</button></div>") +
      '<label class="field"><div class="field-lab">Reason (required)</div><textarea id="reason-text" rows="3" oninput="RT.setReason(this.value)">' + esc(d.text) + "</textarea></label>" +
      '<button data-pin class="btn ' + (kind === "reopen" ? "accent" : "teal") + '" ' + act(kind === "reopen" ? "reopenJob" : "callbackCreate") + ">" + (kind === "reopen" ? "Reopen job" : "Create linked job") + "</button>");
  }
  RT_RB._testJob = function (id) { return getJob(id); };
  RT_RB._render = function () { render(); };
  RT_RB.setReason = function (v) { state.reasonDraft = state.reasonDraft || { text: "", cb: "callback" }; state.reasonDraft.text = v; };
  const LOCKED_ACTS = ["clockIn", "clockOut", "openPriceBook", "rbOpen", "rpOpen", "svOpen", "saveEstimate", "makeInvoice", "addPart", "editPart", "deletePart", "partStatus", "savePart", "partsFromEstimate", "editTime", "requestCorrection", "uwAdd", "uwEdit", "uwDelete", "uwSave", "toggleTimeOnInvoice", "workComplete", "closeoutOpen", "progressOpen", "progressCreate", "markPaid", "postJob"];
  function handleCloseout(name, arg) {
    const job = getJob(state.openJobId);
    if (job && job.posted && (LOCKED_ACTS.indexOf(name) !== -1 || (name === "sheet" && ["photo", "voiceMemo", "note", "reading", "paid"].indexOf(arg) !== -1))) { showToast("Job #" + job.id + " is posted and locked. Tap Reopen to change it."); return true; }
    if (job && job.workComplete && name === "clockIn") { showToast("Work is marked complete. Reopen the job to clock in."); return true; }
    if (name === "sheet" && arg === "invoice" && job && !invList(job).length && !job.invoiceId) { state.coDraft = { mode: "single", truck: true }; state.sheet = "closeout"; render(); return true; }
    if (name === "progressOpen") { if (job) { state.sheet = "progress"; render(); } return true; }
    if (name === "progressCreate") {
      if (!job) return true;
      if (!(Number(job.total) > 0)) { showToast("No job total yet"); return true; }
      ensureInvoices(job);
      if (invList(job).some(function (i) { return i.kind === "deposit"; })) { showToast("Progress invoice already exists"); return true; }
      const amt = r2(Number(job.total) * 0.5);
      const inv = { id: nextInvoiceId(job), kind: "deposit", title: "Progress invoice", lines: [{ label: "Progress payment 1 of 2: equipment delivery (50% of " + money(job.total) + " contract)", amount: amt }], total: amt, due: amt, status: "open", dueNote: "Due on equipment delivery", createdAt: ptNow() };
      job.invoices.push(inv); job.billingMode = "progress"; setActiveInvoice(job, inv);
      job.timeline = [{ id: "inv" + Date.now(), kind: "system", time: "Just now", title: "Progress invoice " + inv.id, body: money(amt) + " (50%) due on equipment delivery. Not sent." }].concat(job.timeline || []);
      state.sheet = "invoice"; showToast("Invoice " + inv.id + " created · not sent"); return true;
    }
    if (name === "closeoutOpen") { if (job) { state.coDraft = { mode: job.billingMode === "tm" ? "tm" : "single", truck: true }; state.sheet = "closeout"; render(); } return true; }
    if (name === "coMode") { state.coDraft = Object.assign({ truck: true }, state.coDraft || {}, { mode: arg }); render(); return true; }
    if (name === "coTruck") { state.coDraft = state.coDraft || { mode: "tm" }; state.coDraft.truck = state.coDraft.truck === false; render(); return true; }
    if (name === "workComplete") {
      if (!job) return true;
      const d = state.coDraft || { mode: "single", truck: true };
      let guard = 0, e;
      while ((e = anyOpenEntry(job)) && guard++ < 20) clockOutJob(job, e.tech);
      const prog = invList(job).some(function (i) { return i.kind === "deposit"; });
      const mode = prog ? "progress" : (d.mode === "tm" ? "tm" : "single");
      if (mode === "tm") job.billingMode = "tm";
      if (mode !== "tm" && !(Number(job.total) > 0)) { showToast("This job has no total. Save an estimate or choose Time & materials."); return true; }
      const inv = buildFinalInvoice(job, mode, d);
      job.workComplete = { at: ptNow(), by: actingAs() };
      job.status = "invoiced";
      job.timeline = [{ id: "wc" + Date.now(), kind: "system", time: "Just now", title: "Work complete", body: "Clock-in stopped. Final invoice draft " + inv.id + " for " + money(inv.due) + " written. Not sent." }].concat(job.timeline || []);
      state.coDraft = null; state.sheet = "invoice"; showToast("Awaiting payment · " + inv.id + " draft"); return true;
    }
    if (name === "pickInvoice") { const inv = invList(job).find(function (i) { return i.id === arg; }); if (inv) setActiveInvoice(job, inv); render(); return true; }
    if (name === "markPaid" && job && invList(job).length) {
      const d = state.paidDraft || emptyPaidDraft();
      const method = d.method || "Card/Stripe", date = d.date || todayYmd();
      if (PAY_METHODS.indexOf(method) === -1) { showToast("Choose a payment method"); return true; }
      const inv = activeInvoice(job); if (!inv || inv.status === "paid") { showToast("This invoice is already paid"); return true; }
      const amt = inv.due;
      inv.status = "paid"; inv.due = 0; inv.paidMethod = method; inv.paidDate = date; inv.draft = false;
      job.paidMethod = method; job.paidDate = date;
      const open = invList(job).filter(function (i) { return i.status !== "paid"; });
      let body = "Invoice " + inv.id + " marked paid, " + money(amt) + ", " + method + " on " + date + ".";
      if (open.length) { setActiveInvoice(job, open[0]); }
      else {
        job.dueAmount = 0;
        if (job.workComplete) { job.status = "paid"; job.posted = { at: ptNow(), by: actingAs(), auto: true }; body += " Paid in full; job posted and locked."; }
        else body += " Work is not complete yet.";
      }
      job.timeline = [{ id: "pay" + Date.now(), kind: "system", time: "Just now", title: "Paid", body: body }].concat(job.timeline || []);
      state.sheet = null; showToast("Marked paid · " + method + (job.posted ? " · posted" : "")); return true;
    }
    if (name === "postJob") {
      if (!job) return true;
      if (!window.confirm("Post job #" + job.id + "? Posting locks it. You can reopen it later with a reason.")) return true;
      job.posted = { at: ptNow(), by: actingAs(), auto: false };
      job.timeline = [{ id: "post" + Date.now(), kind: "system", time: "Just now", title: "Posted", body: "Posted and locked by " + actingAs() + "." }].concat(job.timeline || []);
      showToast("Job posted · locked"); return true;
    }
    if (name === "reopenOpen") { state.reasonDraft = { text: "", cb: "callback" }; state.sheet = "reopen"; render(); return true; }
    if (name === "callbackOpen") { state.reasonDraft = { text: "", cb: "callback" }; state.sheet = "callback"; render(); return true; }
    if (name === "cbKind") { state.reasonDraft = state.reasonDraft || { text: "" }; state.reasonDraft.cb = arg; render(); return true; }
    if (name === "reopenJob") {
      const reason = String((state.reasonDraft || {}).text || "").trim();
      if (!job) return true; if (!reason) { showToast("Enter a reason to reopen"); return true; }
      if (!window.confirm("Reopen job #" + job.id + "?")) return true;
      job.reopenLog = (job.reopenLog || []).concat([{ at: ptNow(), by: actingAs(), reason: reason, wasPosted: !!job.posted }]);
      job.posted = null; job.workComplete = null;
      if (job.status === "invoiced") job.status = "progress";
      job.timeline = [{ id: "ro" + Date.now(), kind: "system", time: "Just now", title: "Reopened", body: actingAs() + ": " + reason }].concat(job.timeline || []);
      state.reasonDraft = null; state.sheet = null; showToast("Job reopened"); return true;
    }
    if (name === "callbackCreate") {
      const d = state.reasonDraft || {}; const reason = String(d.text || "").trim();
      if (!job) return true; if (!reason) { showToast("Enter the reason for the callback"); return true; }
      const nid = nextJobId(state.jobs), kind = d.cb === "warranty" ? "warranty" : "callback";
      const nj = { id: nid, customerId: job.customerId, customer: job.customer, address: job.address, city: job.city, phone: job.phone, addressId: job.addressId, billToCustomerId: job.billToCustomerId,
        problem: (kind === "warranty" ? "Warranty: " : "Callback: ") + reason, status: "new", lineItems: [], total: 0, readingSets: [], timeline: [{ id: "cb" + Date.now(), kind: "system", time: "Just now", title: kind === "warranty" ? "Warranty job" : "Callback job", body: "Linked to job #" + job.id + ". " + reason }],
        estimates: [], linkedFromJobId: job.id, callbackOf: job.id, callbackKind: kind, customerRef: "", referredBy: "" };
      state.jobs = [nj].concat(state.jobs);
      job.callbackJobIds = (job.callbackJobIds || []).concat([nid]);
      job.linkedJobIds = (job.linkedJobIds || []).concat([nid]);
      job.timeline = [{ id: "cbl" + Date.now(), kind: "system", time: "Just now", title: (kind === "warranty" ? "Warranty" : "Callback") + " job #" + nid, body: reason }].concat(job.timeline || []);
      state.reasonDraft = null; state.sheet = null; state.openJobId = nid; showToast("Job #" + nid + " created"); return true;
    }
    return false;
  }

  /* ——— Scope step in the estimate build flow (customer-facing: no rates, hours, truck or diagnostic) ——— */
  function scopeCleanLabel(t) { return String(t || "").replace(/\s*[·@-]?\s*\$?\d+(\.\d+)?\s*\/\s*hr\b/gi, "").replace(/\s*[·(]?\s*\d+(\.\d+)?\s*(hr|hrs|hours?)\b\)?/gi, "").replace(/\s{2,}/g, " ").trim(); }
  function scopeIsFeeLine(t) { return /\b(truck|trip charge|diagnostic|service call fee|labor|per hour)\b|\/hr\b/i.test(String(t || "")); }
  function scopeBulletsForLine(l) {
    const b = l.builder, out = [];
    if (b && ["replacement", "retrofit", "acadd"].indexOf(b.kind) !== -1) {
      const d = b.inputs || {}, s = b.survey || {};
      if (b.kind === "acadd") out.push("Add central air conditioning: furnish and install a new " + (d.tons || "") + "-ton condenser and matching evaporator coil on the existing furnace.");
      else out.push("Furnish and install a new " + (d.tons || "") + "-ton Payne split system (gas furnace, evaporator coil and condenser)" + (b.kind === "retrofit" ? "." : ", " + (d.config === "horizontal" ? "horizontal" : "upflow") + " configuration, in the existing location."));
      if (b.kind === "retrofit") out.push("Relocate the furnace from the closet to the attic, with supply and return connections to suit.");
      const ft = function (k) { return Number(s[k]) > 0 ? " (about " + Number(s[k]) + " ft)" : ""; };
      if (s.flueType === "PVC (90%+) new") out.push("Install new PVC flue venting" + ft("flueFt") + ".");
      else if (s.flueType === "PVC (90%+) reuse") out.push("Reconnect to the existing PVC venting after inspection.");
      else if (s.flueType === "B-vent (80%) new") out.push("Install new B-vent flue" + ft("flueFt") + ".");
      else if (s.flueType === "B-vent (80%) reuse") out.push("Reconnect to the existing B-vent flue after inspection.");
      let cond = "";
      if (/existing drain OK/.test(s.condRoute || "")) cond = "Connect the condensate drain to the existing drain line";
      else if (/new drain line/.test(s.condRoute || "")) cond = "Run a new condensate drain line" + ft("drainFt");
      else if (/Pump/.test(s.condRoute || "")) cond = "Install a condensate pump and drain line";
      else if (/Difficult/.test(s.condRoute || "")) cond = "Route the condensate drain (difficult route)";
      if (cond) out.push(cond + (s.condTerm ? ", terminating at " + s.condTerm : "") + ".");
      if (s.secPan === "New pan") out.push("Install a secondary drain pan.");
      if (s.floatSw === "New float switch") out.push("Install a float switch (shuts the system off if the drain backs up).");
      else if (s.floatSw === "Existing OK") out.push("Reuse the existing float switch after testing.");
      if (s.lineSet === "Reuse (flush)") out.push("Reuse and flush the existing refrigerant line set.");
      else if (/^New/.test(s.lineSet || "")) out.push("Install a new refrigerant line set" + ft("lineSetFt") + ".");
      if (s.lineSetCover === "Yes") out.push("Install a line set cover.");
      if (s.disconnect === "New disconnect") out.push("Install a new outdoor disconnect.");
      else if (s.disconnect === "Existing OK") out.push("Reuse the existing disconnect.");
      if (s.circuit === "New condenser circuit") out.push("Install a new dedicated condenser circuit.");
      if (s.pad === "New pad") out.push("Set the condenser on a new pad.");
      else if (s.pad === "New stand / wall brackets") out.push("Mount the condenser on a new stand or wall brackets.");
      else if (s.pad === "Existing OK") out.push("Set the condenser on the existing pad.");
      if (s.plenum === "Beyond standard (custom)") out.push("Fabricate and install a custom plenum and transition.");
      else if (s.plenum === "Standard") out.push("Connect supply and return plenums and transitions.");
      if (/^New, /.test(s.platform || "")) out.push("Build a new attic equipment platform.");
      else if (s.platform === "Extend / repair") out.push("Extend or repair the attic equipment platform.");
      if (s.gas === "Existing OK") out.push("Reconnect gas at the existing shutoff.");
      else if (/Needs work/.test(s.gas || "")) out.push("Gas piping work as needed to connect the new furnace.");
      if (s.permit === "Permit + HERS") out.push("Pull the mechanical permit and coordinate HERS verification.");
      else if (s.permit === "Permit only") out.push("Pull the mechanical permit.");
      if (s.haulAway === "Yes (included)") out.push("Remove and haul away the old equipment.");
      out.push("Evacuate, charge, start up and commission the system, and verify operation.");
      if (s.warrantyReg === "Yes (included)") out.push("Register the manufacturer warranty.");
      else if (s.warrantyReg) out.push("Customer to register the manufacturer warranty.");
      return out;
    }
    if (b && b.kind === "repair") {
      const d = b.inputs || {}; const T = rbType(d.type);
      out.push("Replace the " + (d.partName ? d.partName : T.label.replace(/ replacement$/i, "").replace(/^Other \/ manual$/, "failed component")).toLowerCase().replace(/^(.)/, function (m) { return m; }) + (d.partModel ? " (" + d.partModel + ")" : "") + ".");
      if (T.refrig) out.push("Recover refrigerant as needed, replace the filter drier, evacuate, and recharge to the manufacturer’s specification.");
      out.push("Test operation and verify performance.");
      return out;
    }
    out.push("Furnish and install: " + scopeCleanLabel(draftLabel(l)) + ".");
    out.push("Test operation and verify performance.");
    return out;
  }
  function scopeDraftFromLines(job, lines) {
    const addr = [job.address, job.city].filter(Boolean).join(", ");
    const parts = ["Scope of work · Job #" + job.id + (addr ? " · " + addr : ""), ""];
    let n = 0;
    (lines || []).forEach(function (l) {
      const amt = lineTotal(l), lab = scopeCleanLabel(draftLabel(l));
      if (amt < 0) { parts.push("Discount: " + lab + " (" + money(amt) + ")"); parts.push(""); return; }
      if (!(amt > 0) || (!l.builder && scopeIsFeeLine(draftLabel(l)))) return;
      n++;
      parts.push("Option " + n + ": " + lab + " · " + money(amt) + " all-in (equipment or parts, labor and materials)");
      scopeBulletsForLine(l).forEach(function (x) { parts.push("• " + x); });
      parts.push("");
    });
    parts.push("Price shown for each option is all-in. Work not listed above is not included.");
    return parts.join("\n");
  }
  function estScopeSheet(job) {
    const sb = state.scopeBuild || { text: "" };
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Scope · draft v1</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<button class="btn accent" data-pin ' + act("previewEst") + ">Preview estimate ›</button>" +
      '<div class="muted" style="margin-bottom:8px">Starter scope from your lines' + (state.packDraft.some(function (l) { return l.builder && l.builder.survey; }) ? " and the site survey" : "") + ". Edit it here. It is saved with the estimate as a Draft version; mark it Final later on the saved estimate. The customer sees one all-in price per option, no rates or hours.</div>" +
      '<label class="field"><textarea id="sb-text" rows="16" oninput="RT.setScopeBuild(this.value)">' + esc(sb.text || "") + "</textarea></label>" +
      '<div style="display:flex;gap:8px"><button class="btn ghost" style="flex:1;margin:0" ' + act("scopeRedraft") + ">Re-draft from lines</button><button class=\"btn ghost\" style=\"flex:1;margin:0\" " + act("scopeBack") + ">‹ Back to lines</button></div>");
  }
  RT_RB.setScopeBuild = function (v) { state.scopeBuild = state.scopeBuild || {}; state.scopeBuild.text = v; state.scopeBuild.edited = true; };
  RT_RB._sheetOpen = function () { return !!state.sheet || !!state.proposal; };
  function handleScopeStep(name, arg) {
    const job = getJob(state.openJobId);
    if (name === "scopeStep") {
      if (!job || !state.packDraft.length) return true;
      const sb = state.scopeBuild;
      if (!sb || !sb.edited) {
        const rec = (job.estimates || []).find(function (e) { return e.id === job.estimateId && !e.superseded; });
        const prev = rec && latestScope(rec, false);
        state.scopeBuild = prev && !(sb && sb.fresh) ? { text: prev.text, edited: false, fromPrev: true } : { text: scopeDraftFromLines(job, state.packDraft), edited: false };
      }
      state.sheet = "estScope"; render(); return true;
    }
    if (name === "scopeRedraft") { if (job) state.scopeBuild = { text: scopeDraftFromLines(job, state.packDraft), edited: false, fresh: true }; render(); return true; }
    if (name === "scopeBack") { state.sheet = "priceBook"; render(); return true; }
    if (name === "openPriceBook") { state.scopeBuild = null; return false; }
    return false;
  }

  /* ——— Customer proposal view (ReliaTech estimate format), shown in-app with a Back button.
     Replaces the old pop-up window + auto print, which stranded the home-screen app. ——— */
  const BIZ = { name: "ReliaTech Services", addr: "5991 East Pacific Coast Highway, #5, Long Beach, CA 90803", phone: "(562) 487-8750", phoneRaw: "5624878750", email: "steveseguine51@gmail.com" };
  function propDate(d) { return d.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "long", day: "numeric", year: "numeric" }); }
  function propExp(d) { return d.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", weekday: "short", month: "short", day: "numeric", year: "numeric" }).replace(/,(?=[^,]*,)/, ""); }
  /* Free-text safe: keeps every line, its bullets and blank lines. Handles iOS paste line separators (U+2028)
     and headings like "Scope of Work – Option 1: Title". Drops only the app's own auto-draft boilerplate and
     price trailer lines that the option cards and bundle box already show. */
  const PP_HEAD = /^(?:scope\s+of\s+work\s*[-–—:·|]*\s*)?option\s*#?\s*(\d+)\b\s*[:.\-–—·)|]*\s*(.*)$/i;
  function proposalTitleClean(t) { return String(t || "").replace(/\s*[·|:\-–—]\s*\$\s?[\d,]+(\.\d+)?.*$/, "").replace(/\s*\$\s?[\d,]+(\.\d+)?\s*(all-in.*)?$/i, "").trim(); }
  function proposalDropLine(t) {
    if (/^scope of work\s*·\s*job\s*#/i.test(t) || /^price shown for each option is all-in/i.test(t) || /^scope of work\s*:?$/i.test(t)) return true;
    if (/\$\s?[\d,]/.test(t) && /^(bundle discount|both options together|all options together|discount:|if both|if all)/i.test(t)) return true;
    if (/^issued\b.*\bexpires\b/i.test(t)) return true;
    return false;
  }
  function proposalSections(text, nOpts) {
    const sec = {}, order = [], intro = [];
    const lines = String(text || "").replace(/\r\n?|\u2028|\u2029|\u0085/g, "\n").split("\n");
    let cur = null;
    lines.forEach(function (raw) {
      const line = raw.replace(/\s+$/, ""), t = line.trim();
      const m = t.match(PP_HEAD);
      if (m) { cur = Number(m[1]); if (!sec[cur]) { sec[cur] = { title: proposalTitleClean(m[2]), lines: [] }; order.push(cur); } return; }
      if (t && proposalDropLine(t)) return;
      (cur ? sec[cur].lines : intro).push(line);
    });
    const tidy = function (arr) { const o = []; arr.forEach(function (l) { if (!l.trim()) { if (o.length && o[o.length - 1] !== "") o.push(""); } else o.push(l); }); while (o.length && o[o.length - 1] === "") o.pop(); return o; };
    order.forEach(function (k) { sec[k].lines = tidy(sec[k].lines); });
    return { sec: sec, order: order, intro: tidy(intro), found: order.length > 0 };
  }
  function proposalLinesHtml(arr) {
    return arr.map(function (x) {
      if (!x) return '<div class="pp-gap"></div>';
      return '<div class="pp-ln' + (/^\s*note:/i.test(x) ? " pp-note" : "") + '">' + esc(x) + "</div>";
    }).join("");
  }
  function proposalHtml(job, rec, sc) {
    const payer = billToCustomer(job); const bill = billingInfo(payer, job);
    const loc = serviceAddressOf(job);
    const created = rec.createdAt && parseStamp(rec.createdAt) ? new Date(parseStamp(rec.createdAt)) : new Date();
    const issued = (sc && sc.finalAt && parseStamp(sc.finalAt)) ? new Date(parseStamp(sc.finalAt)) : created;
    const exp = new Date(issued.getTime() + 30 * DAY_MS);
    const all = estimateOptions(rec);
    const fees = all.filter(function (o) { const l = rec.lineItems[o.idx] || {}; return !l.builder && scopeIsFeeLine(o.label); });
    let opts = all.filter(function (o) { return fees.indexOf(o) === -1; });
    if (!opts.length) { opts = all; }
    const feeSum = opts === all ? 0 : fees.reduce(function (t, o) { return t + o.amount; }, 0);
    const disc = estimateDiscounts(rec);
    const P = proposalSections(sc ? sc.text : "", opts.length);
    const head = function (first) {
      return '<div class="pp-head"><div><div class="pp-biz">' + BIZ.name + "</div><div class=\"pp-small\">" + BIZ.addr + "<br>" + BIZ.phoneRaw + " &nbsp;|&nbsp; " + BIZ.email + "</div>" +
        (first ? "" : '<div class="pp-small">Estimate #' + esc(rec.id) + "</div>") + "</div>" +
        (window.RT_LOGO ? '<img class="pp-logo" src="' + window.RT_LOGO + '" alt="ReliaTech Services">' : "") + "</div>";
    };
    const addrLines = function (a, c) { return [a, c].filter(Boolean).map(esc).join("<br>"); };
    let h = head(true) +
      '<div class="pp-small" style="margin-top:6px">Estimate #' + esc(rec.id) + "</div>" +
      '<div class="pp-title">Estimate for ' + esc(bill.name || job.customer || "") + "</div>" +
      '<div class="pp-row pp-small"><div>Date: ' + propDate(issued) + "</div><div>Expires on: " + propExp(exp) + "</div></div>" +
      '<div class="pp-lab">BILL TO</div><div class="pp-strong">' + esc(bill.name || job.customer || "") + "</div><div>" + addrLines(bill.address, bill.city) + "</div>" +
      (bill.phone ? '<div class="pp-sm2">' + esc(bill.phone) + "</div>" : "") + (bill.email ? '<div class="pp-sm2">' + esc(bill.email) + "</div>" : "") +
      '<div class="pp-lab" style="margin-top:8px">SERVICE LOCATION</div><div>' + addrLines(loc ? loc.address : job.address, loc ? loc.city : job.city) + "</div>";
    const used = {};
    const pick = function (o, i) { const k = P.sec[i + 1] && !used[i + 1] ? i + 1 : (P.sec[o.n] && !used[o.n] ? o.n : null); if (k == null) return null; used[k] = true; return P.sec[k]; };
    const introCard = P.intro.length && (P.found || opts.length > 1);
    if (introCard && P.found) h += '<div class="pp-card"><div class="pp-svc">Scope of work</div><div class="pp-body">' + proposalLinesHtml(P.intro) + "</div></div>";
    let shown = introCard ? P.intro.length : 0;
    opts.forEach(function (o, i) {
      const price = Math.round((o.amount + feeSum) * 100) / 100;
      const s1 = P.found ? pick(o, i) : null;
      const body = P.found ? (s1 ? s1.lines : []) : (opts.length === 1 ? P.intro : []);
      shown += body.length;
      const title = (s1 && s1.title) || scopeCleanLabel(o.label);
      h += '<div class="pp-card"><div class="pp-opt">Option #' + (i + 1) + '</div><div class="pp-price">' + money(price) + '</div><div class="pp-svc">Services</div>' +
        '<div class="pp-item">' + esc(title) + '</div><div class="pp-body">' + proposalLinesHtml(body) + "</div>" +
        '<div class="pp-tot pp-sub"><div>Subtotal</div><div>' + money(price) + '</div></div><div class="pp-tot pp-total"><div>Total</div><div>' + money(price) + "</div></div></div>";
    });
    if (introCard && !P.found) h += '<div class="pp-card"><div class="pp-svc">Scope of work</div><div class="pp-body">' + proposalLinesHtml(P.intro) + "</div></div>";
    const left = P.order.filter(function (k) { return !used[k]; });
    if (left.length) {
      const arr = []; left.forEach(function (k) { arr.push("Option " + k + (P.sec[k].title ? ": " + P.sec[k].title : "")); P.sec[k].lines.forEach(function (l) { arr.push(l); }); arr.push(""); });
      shown += arr.length;
      h += '<div class="pp-card"><div class="pp-svc">Scope of work</div><div class="pp-body">' + proposalLinesHtml(arr) + "</div></div>";
    }
    if (!shown && sc && String(sc.text || "").trim()) h += '<div class="pp-card"><div class="pp-svc">Scope of work</div><div class="pp-body" style="white-space:pre-wrap">' + esc(String(sc.text).replace(/\r\n?|\u2028|\u2029/g, "\n")) + "</div></div>";
    if (opts.length > 1 || disc.length) {
      const together = Math.round((opts.reduce(function (t, o) { return t + o.amount; }, 0) + feeSum + disc.reduce(function (t, l) { return t + Number(l.amount); }, 0)) * 100) / 100;
      h += '<div class="pp-card"><div class="pp-svc2">' + (opts.length > 2 ? "If all options are approved" : opts.length > 1 ? "If both options are approved" : "Discount") + "</div>" +
        disc.map(function (l) { return '<div class="pp-tot"><div>' + esc(l.label) + "</div><div>−" + money(Math.abs(Number(l.amount))) + "</div></div>"; }).join("") +
        '<div class="pp-tot pp-total"><div>' + (opts.length > 2 ? "All options together" : opts.length > 1 ? "Both options together" : "Total") + "</div><div>" + money(together) + "</div></div></div>";
    }
    h += '<div class="pp-card pp-sign"><div class="pp-svc2">Customer approval</div><div class="pp-small">To approve, sign below and note the option(s) you are choosing, or reply to Steve by text or email.</div>' +
      '<div class="pp-lines"><div>Option(s) approved: ________________</div><div>Signature: ______________________________</div><div>Date: ____________</div></div></div>' +
      '<div class="pp-center"><div class="pp-strong">Not what you were looking for?</div><div class="pp-small">Please let us know if you\'d like to request some changes. We\'d love to win your business.</div>' +
      '<div class="pp-blue">Contact us</div><div class="pp-small">' + BIZ.phone + " · " + BIZ.email + "</div></div>" +
      '<div class="pp-thanks">Thank you for your business. We know there many choices when it comes to your home comfort, and we appreciate you chose us. If you have any questions, please don\'t hesitate to reach out to us in any form.<br><br>Thanks again.</div>' +
      '<div class="pp-foot"><div>ReliaTech Services</div><div>Estimate ' + esc(rec.id) + "</div></div>";
    return h;
  }
  function proposalScreen() {
    const pv = state.proposal; const job = pv && getJob(pv.jobId); const rec = job && currentEstimateRec(job, pv.estId); const sc = rec && latestScope(rec, true);
    if (!rec || !sc) { state.proposal = null; return ""; }
    return '<div class="pp-bar no-print"><button class="btn ghost" ' + act("proposalBack") + ">‹ Back to job</button>" +
      '<button class="btn accent" ' + act("proposalPrint") + ">Save PDF / Print</button></div>" +
      '<div class="pp-hint no-print">In the print screen, tap Share ⬆︎ then Save to Files to keep the PDF. Tap Back to job when you’re done.</div>' +
      '<div class="pp-scroll"><div class="pp-page" id="proposal">' + proposalHtml(job, rec, sc) + "</div>" +
      '<div class="pp-bar pp-bar-bottom no-print"><button class="btn ghost" ' + act("proposalBack") + ">‹ Back to job</button>" +
      '<button class="btn accent" ' + act("proposalPrint") + ">Save PDF / Print</button></div></div>";
  }
  function customerEstimateText(job, rec) {
    const who = (billToCustomer(job) || {}).name || job.customer;
    const addr = String(job.address || "").replace(/[()]/g, "").trim();
    return "Hi " + firstName(who) + ",\n\nHere is your ReliaTech estimate " + rec.id + (addr ? " for " + addr : "") + ". Please review the options and reply with the option you'd like to approve.\n\nThank you,\nSteve\nReliaTech Services";
  }
  RT_RB.setEstShareLink = function (v) { if (state.estShare) state.estShare.link = v; };
  function estShareSheet(job) {
    const d = state.estShare; const rec = d && currentEstimateRec(job, d.estId); if (!rec) return "";
    const box = function (txt, rows) { return '<textarea class="share-box" readonly rows="' + rows + '">' + esc(txt) + "</textarea>"; };
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Text the customer · ' + esc(rec.id) + '</div><button class="icon-btn ghost" ' + act("estShareBack") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:10px">Nothing is sent by the app. Copy box 1 into a text, then send box 2 as its own text so iMessage shows the PDF preview.</div>' +
      '<div class="field-lab">Box 1 · Message</div>' + box(customerEstimateText(job, rec), 9) +
      '<button class="btn" style="margin:8px 0 16px" ' + act("estShareCopyMsg") + ">Copy message</button>" +
      '<div class="field-lab">Box 2 · Drive link to “ReliaTech Estimate ' + esc(rec.id) + '”</div>' +
      (rec.pdfUrl ? box(rec.pdfUrl, 2) + '<button class="btn" style="margin:8px 0 12px" ' + act("estShareCopyLink") + ">Copy Drive link</button>"
        : '<div class="note" style="margin:0 0 8px">Save the PDF to the job\u2019s Drive folder, or ask ReliaTech to upload it, then paste the link here.</div>') +
      '<label class="field"><div class="field-lab">' + (rec.pdfUrl ? "Change Drive link" : "Paste Drive share link") + '</div><input id="es-link" type="url" autocomplete="off" autocapitalize="off" placeholder="https://drive.google.com/…" value="' + esc(d.link || "") + '" oninput="RT.setEstShareLink(this.value)"></label>' +
      '<button class="dash" style="margin-bottom:16px" ' + act("estShareSaveLink") + ">Save Drive link to " + esc(rec.id) + "</button>" +
      '<div class="note" style="margin:0 0 12px">When the customer replies with their choice, record it with Approve… and pick Text (or Phone / In person).</div>' +
      '<button class="link-btn tap" style="margin:0 0 8px" ' + act("estShareAdv") + ">" + (d.adv ? "▾" : "▸") + " Online approval link (advanced)</button>" +
      (d.adv ? '<div class="note" style="margin:0 0 8px">Long link to the online approval page. Not part of the normal text.</div><button class="dash" style="margin-bottom:12px" ' + act("copyApprovalLink", rec.id) + ">Copy online approval link</button>" : "") +
      '<button class="btn ghost" style="margin-top:4px" ' + act("estShareBack") + ">‹ Back to estimate</button>"
    );
  }
  function handleProposal(name, arg) {
    const job = getJob(state.openJobId);
    if (name === "printEstimate") {
      const rec = job && currentEstimateRec(job, arg); const sc = rec && latestScope(rec, true);
      if (!sc) { showToast("Mark a version Final first"); return true; }
      state.proposal = { jobId: job.id, estId: rec.id }; state.sheet = null; render(); return true;
    }
    if (name === "openEstShare" || name === "shareApprovalLink") {
      const rec = job && currentEstimateRec(job, arg); if (!rec) return true;
      state.estShare = { estId: rec.id, link: rec.pdfUrl || "", adv: false }; state.viewEstimateId = rec.id; state.sheet = "estShare"; render(); return true;
    }
    if (name === "estShareCopyMsg") { const rec = job && state.estShare && currentEstimateRec(job, state.estShare.estId); if (rec) copyText(customerEstimateText(job, rec), "Message copied. Nothing was sent."); return true; }
    if (name === "estShareSaveLink") {
      const d = state.estShare; const rec = job && d && currentEstimateRec(job, d.estId); if (!rec) return true;
      const v = String(d.link || "").trim();
      if (v && !/^https?:\/\/\S+$/i.test(v)) { showToast("That doesn't look like a link"); return true; }
      rec.pdfUrl = v; render(); showToast(v ? "Drive link saved" : "Drive link removed"); return true;
    }
    if (name === "estShareCopyLink") { const rec = job && state.estShare && currentEstimateRec(job, state.estShare.estId); if (rec && rec.pdfUrl) copyText(rec.pdfUrl, "Drive link copied. Nothing was sent."); return true; }
    if (name === "estShareAdv") { if (state.estShare) state.estShare.adv = !state.estShare.adv; render(); return true; }
    if (name === "estShareBack") { const d = state.estShare; state.estShare = null; if (d) { state.viewEstimateId = d.estId; state.sheet = "viewEstimate"; } else state.sheet = null; render(); return true; }
    if (name === "proposalBack") { const p = state.proposal; state.proposal = null; if (p) { state.openJobId = p.jobId; state.viewEstimateId = p.estId; state.sheet = "viewEstimate"; } document.title = "ReliaTech"; render(); return true; }
    if (name === "proposalPrint") {
      const p = state.proposal; if (!p) return true;
      const old = document.title; document.title = "ReliaTech Estimate " + p.estId;
      const restore = function () { document.title = old || "ReliaTech"; window.removeEventListener("afterprint", restore); };
      window.addEventListener("afterprint", restore);
      setTimeout(function () { try { window.print(); } catch (e) {} setTimeout(restore, 1500); }, 50);
      return true;
    }
    return false;
  }

  function snapshotState() {
    return {
        v: 1,
        customers: state.customers,
        jobs: state.jobs,
        currentTech: state.currentTech,
        techs: state.techs,
        techRecords: state.techRecords,
        plans: state.plans,
        visits: state.visits,
        settings: state.settings,
        showCompleted: false,
        priceBook: state.priceBook,
        unfiledCaptures: state.unfiledCaptures,
        vendors: state.vendors || []
    };
  }
  function persist() {
    try { RTStore.save(snapshotState()); } catch (e) {}
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
    if (typeof handleEquipV2 === "function" && state.sheet && handleEquipV2("closeSheet")) return;
    state.sheet = null;
    state.compareIds = [];
    state.voiceConfirm = null;
    state.viewEstimateId = null;
    state.voicePick = null;
    state.voiceJobDraft = null;
    state.attachCaptureId = null;
    state.priceDraft = null;
    state.saveLineDraft = null;
    state.partDraft = null;
    state.poDraft = null;
    state.vendorDraft = null;
    if (state.voice) state.voice.listening = false;
    if (typeof endVoiceSession === "function") { voiceSession++; endVoiceSession(); }
    if (typeof stopMemoRecord === "function") try { stopMemoRecord(true); } catch (e) {}
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
  function invoiceNumber(job) {
    return (job && job.invoiceId) ? String(job.invoiceId) : ((job && job.id) ? job.id + "-01" : "");
  }
  function invoiceDue(job) {
    if (!job || job.status === "paid") return 0;
    if (typeof job.dueAmount === "number") return Number(job.dueAmount) || 0;
    if (job.status === "invoiced") return Number(job.total) || 0;
    return 0;
  }
  function isPayable(job) {
    return invoiceDue(job) > 0;
  }
  function stripeLinkFor(job) {
    const ai = activeInvoice(job);
    if (ai && !ai.legacy && !(ai.kind === "single" && Math.abs((Number(ai.due) || 0) - (Number(job.total) || 0)) < 0.01)) return ai.stripeUrl || PAYMENT.stripeReusableUrl || "";
    if (job && job.stripePaymentUrl) return job.stripePaymentUrl;
    if (job && PAYMENT.links && PAYMENT.links[job.id]) return PAYMENT.links[job.id];
    return PAYMENT.stripeReusableUrl || "";
  }
  function usesReusableStripe(job) {
    const url = stripeLinkFor(job);
    return !!(url && PAYMENT.stripeReusableUrl && url === PAYMENT.stripeReusableUrl);
  }
  function venmoLink(job) {
    const handle = String(PAYMENT.venmoHandle || "Steve-Seguine").replace(/^@/, "");
    const amt = invoiceDue(job).toFixed(2);
    const note = encodeURIComponent("ReliaTech Invoice " + invoiceNumber(job));
    return "https://venmo.com/" + handle + "?txn=pay&amount=" + amt + "&note=" + note;
  }
  function zellePhoneDisplay() {
    return PAYMENT.zellePhoneDisplay || "562-487-8750";
  }
  function zelleMemo(job) {
    return "ReliaTech Invoice " + invoiceNumber(job);
  }
  const PUBLIC_PAY_BASE = "https://tempmaster-1968.github.io/reliatech-app-mockup/";
  function firstName(name) {
    const t = String(name || "").replace(/,/g, " ").trim().split(/\s+/).filter(Boolean)[0];
    return t || "there";
  }
  function invoiceParty(job) {
    const bill = (typeof billToCustomer === "function") ? billToCustomer(job) : null;
    const cust = job ? getCustomer(job.customerId) : null;
    return {
      name: (bill && bill.name) || (job && job.customer) || (cust && cust.name) || "",
      phone: (bill && bill.phone) || (job && job.phone) || (cust && cust.phone) || "",
      email: (bill && bill.email) || (job && job.email) || (cust && cust.email) || ""
    };
  }
  function smsNumber(phone) {
    const d = String(phone || "").replace(/\D/g, "");
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d[0] === "1") return "+" + d;
    if (d.length > 0) return "+" + d;
    return "";
  }
  function payFileId(job) {
    const id = job && job.payId ? String(job.payId) : "";
    return /^[A-Za-z0-9]{10,32}$/.test(id) ? id : "";
  }
  function invoicePayload(job) {
    const party = invoiceParty(job);
    const inv = invoiceNumber(job);
    const due = invoiceDue(job) || job.total || 0;
    return {
      invoiceId: inv,
      customerName: party.name,
      lineItems: ((activeInvoice(job) && activeInvoice(job).lines) || job.lineItems || []).map(function (l) {
        return { label: l.label || l.name || "Item", amount: Number(l.amount) || 0 };
      }),
      amount: due,
      stripeUrl: stripeLinkFor(job) || "",
      memo: zelleMemo(job)
    };
  }
  function encodePayPayload(payload) {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  function customerPayUrl(job) {
    const slug = invList(job).length && !(activeInvoice(job) || {}).legacy ? "" : payFileId(job);
    if (slug) return PUBLIC_PAY_BASE + "pay/" + encodeURIComponent(slug) + "/";
    return PUBLIC_PAY_BASE + "pay.html?d=" + encodePayPayload(invoicePayload(job));
  }
  function invoiceMessage(job) {
    const party = invoiceParty(job);
    const due = invoiceDue(job) || job.total || 0;
    return "Hi " + firstName(party.name) + ", here is your invoice " + invoiceNumber(job) +
      " from ReliaTech Services for " + money(due) + ". You can view and pay here: " +
      customerPayUrl(job) + ". Thank you! - Steve";
  }
  function smsHref(job) {
    const num = smsNumber(invoiceParty(job).phone);
    if (!num) return "";
    return "sms:" + num + "&body=" + encodeURIComponent(invoiceMessage(job));
  }
  function mailtoHref(job) {
    const email = invoiceParty(job).email || "";
    const subject = "Invoice " + invoiceNumber(job) + " from ReliaTech Services";
    return "mailto:" + (email ? encodeURIComponent(email) : "") +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(invoiceMessage(job));
  }
  function emptyPaidDraft() {
    return { method: "Card/Stripe", date: todayYmd() };
  }
  function copyText(text, okMsg) {
    const value = String(text || "");
    function ok() { showToast(okMsg || "Copied"); }
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { showToast("Copy failed"); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(ok).catch(fallback);
    } else {
      fallback();
    }
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
  function planProspects() {
    const list = [];
    const seen = {};
    ((PLAN_SEED && PLAN_SEED.prospects) || []).forEach(function (pr) {
      if (!pr || !pr.customerId || seen[pr.customerId]) return;
      seen[pr.customerId] = true;
      list.push(pr);
    });
    (state.plans || []).forEach(function (p) {
      if (p.type !== "offer_prepaid_annual" || seen[p.customerId]) return;
      seen[p.customerId] = true;
      list.push({
        id: "pr-plan-" + p.id,
        customerId: p.customerId,
        label: "Plan prospect: offer $225 prepaid annual",
        offer: "prepaid_annual",
        price: p.price || 225,
        visitsPerYear: p.visitsPerYear || 2,
        notes: p.notes || "",
        planId: p.id
      });
    });
    return list.sort(function (a, b) {
      const ca = getCustomer(a.customerId), cb = getCustomer(b.customerId);
      return String(ca ? ca.name : "").localeCompare(String(cb ? cb.name : ""));
    });
  }
  function prospectsForCustomer(cid) {
    return planProspects().filter(function (p) { return p.customerId === cid; });
  }
  function prospectCard(pr, opts) {
    opts = opts || {};
    const c = getCustomer(pr.customerId);
    const title = pr.label || "Plan prospect: offer $225 prepaid annual";
    return '<button class="plan-card prospect-card" ' + (opts.clickable === false ? "type=\"button\" style=\"cursor:default;text-align:left\"" : act("openCustomer", pr.customerId)) + ">" +
      '<div class="plan-head"><div><div class="k-up">Plan prospect</div><div class="h2" style="margin-top:2px">' + esc(opts.showCustomer && c ? c.name : title) + "</div></div>" +
      pill("$225", "#0C5C5C", "#E6F4F4") + "</div>" +
      (opts.showCustomer && c ? '<div class="muted">' + esc(title) + "</div>" : "") +
      '<div class="muted"' + (opts.showCustomer && c ? ' style="margin-top:4px"' : "") + ">" + esc([c && opts.showCustomer ? ((c.city || "") + (c.address ? " · " + c.address : "")) : "", pr.price ? money(pr.price) + " prepaid annual" : "", pr.visitsPerYear ? (pr.visitsPerYear + " visits / year") : ""].filter(Boolean).join(" · ")) + "</div>" +
      (pr.notes && !opts.compact ? '<div class="muted" style="margin-top:8px">' + esc(pr.notes) + "</div>" : "") +
      "</button>";
  }
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
  /* Only imported Housecall Pro / seed jobs can be "past HCP history". Jobs created in this app also use 557xx numbers
     and were being hidden from the board and Home as if they were old HCP jobs. */
  let _importedJobIds = null;
  function isImportedJobId(id) {
    if (!_importedJobIds) {
      _importedJobIds = {};
      [].concat(INITIAL_JOBS || [], (window.RT_DATA && window.RT_DATA.moneyJobs) || [], (window.RT_PLANS && window.RT_PLANS.planJobs) || []).forEach(function (j) { if (j && j.id != null) _importedJobIds[String(j.id)] = true; });
    }
    return !!_importedJobIds[String(id)];
  }
  function isPastHcpHistory(job) {
    if (!job || !isHcpId(job.id)) return false;
    if (!job.planJob && !isImportedJobId(job.id)) return false;
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
    if (job.status === "paid" || job.status === "done" || job.status === "cancelled" || job.status === "canceled" || job.status === "superseded" || job.supersededBy) return true;
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
  /* A new call that is not scheduled yet still belongs on the board and Home (it used to show only under Show all / search). */
  function isUnscheduledNewCall(job) {
    return !!job && isActiveJob(job) && (job.status === "new" || job.status === "diagnosis") && !job.planJob && !isBoardJob(job);
  }
  function unpaidBalanceJobs() {
    return (state.jobs || []).filter(function (j) {
      if (Number(j.dueAmount || 0) <= 0) return false;
      if (j.status === "paid" || j.status === "done" || j.status === "cancelled" || j.status === "canceled" || j.status === "superseded" || j.supersededBy) return false;
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
    setVoiceText: function (v) { state.voice.text = v; updateVoiceSuggest(v); },
    setSetting: function (k, v) {
      if (k === "defaultGp" || k === "minGp" || k === "refrigerantMinMarkup") {
        state.settings[k] = v === "" ? "" : Number(v);
        state.priceBook = applyProposedPricing(state.priceBook);
        renderKeepFocus("st-" + k);
        return;
      }
      state.settings[k] = v;
      renderKeepFocus("st-" + k);
    },
    setSched: function (k, v) { state.scheduleDraft[k] = v; },
    setBilling: function (k, v) {
      const c = getCustomer(state.openCustomerId);
      if (!c) return;
      c[k] = v;
      renderKeepFocus(k === "billingAddress" ? "bill-address" : "bill-city");
    },
    setAddressField: function (k, v) {
      if (!state.addressDraft) state.addressDraft = emptyAddress();
      state.addressDraft[k] = v;
      renderKeepFocus("ad-" + k);
    },
    setMoveQuery: function (v) { state.moveQuery = v; renderKeepFocus("mv-q"); },
    setBillToField: function (k, v) {
      if (!state.billToDraft) state.billToDraft = { query: "", isNew: false, newName: "", newPhone: "", newEmail: "", newAddress: "", newCity: "Long Beach" };
      state.billToDraft[k] = v;
      const id = k === "query" ? "bt-q" : "bt-" + k;
      renderKeepFocus(id);
    },
    setJobField: function (k, v) {
      const job = getJob(state.openJobId);
      if (!job) return;
      job[k] = v;
      renderKeepFocus(k === "customerRef" ? "job-ref" : "job-referred");
    },
    setPriceBookQuery: function (v) { state.priceBookQuery = v; renderKeepFocus("pb-q"); },
    setPriceDraft: function (k, v) {
      if (!state.priceDraft) return;
      let val = v;
      if (k === "cost" || k === "gp" || k === "sell" || k === "laborHours" || k === "partCost" || k === "firstPrice" || k === "addOnPrice") val = v === "" ? "" : Number(v);
      state.priceDraft[k] = val;
      if (k === "partCost") {
        state.priceDraft.cost = val;
        state.priceDraft.partCostMissing = !(Number(val) > 0);
      }
      if (k === "laborHours" || k === "partCost" || k === "firstPrice" || k === "addOnPrice") {
        if (k === "firstPrice" || k === "addOnPrice") state.priceDraft.gpSource = "custom";
        else if (state.priceDraft.gpSource !== "custom") state.priceDraft.gpSource = "default";
        if (isFlatRateItem(state.priceDraft) && k !== "firstPrice" && k !== "addOnPrice") {
          state.priceDraft = applyFlatPricing(state.priceDraft);
        }
      }
      state.priceDraft = applyBookMath(state.priceDraft, k === "partCost" ? "cost" : k);
      if (isFlatRateItem(state.priceDraft) && (k === "firstPrice" || k === "addOnPrice")) {
        state.priceDraft.sell = state.priceDraft.firstPrice;
      }
      const id = k === "name" ? "pb-name" : ("pb-" + k);
      renderKeepFocus(id);
    },
    setVoiceJobField: function (k, v) {
      if (!state.voiceJobDraft) return;
      state.voiceJobDraft[k] = v;
      if (k === "newName" || k === "newPhone") { state.voiceJobDraft.dupOk = false; state.voiceJobDraft.dupMatches = []; }
      if (k === "whenLabel") {
        const r = resolveRequestedTime(v);
        state.voiceJobDraft.whenIso = r.iso || "";
      }
      const ids = { custQuery: "vj-cq", newName: "vj-newName", newPhone: "vj-newPhone", newAddress: "vj-newAddress", newCity: "vj-newCity", problem: "vj-problem", whenLabel: "vj-whenLabel" };
      renderKeepFocus(ids[k] || "vj-problem");
    },
    setPhotoCaption: function (v) { if (!state.photoDraft) state.photoDraft = emptyPhotoDraft(); state.photoDraft.caption = v; renderKeepFocus("photo-cap"); },
    setMemoCaption: function (v) { if (!state.memoDraft) state.memoDraft = emptyMemoDraft(); state.memoDraft.caption = v; renderKeepFocus("memo-cap"); },
    setPhotoFile: function (el) {
      const f = el.files && el.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () {
        resizeDataUrl(String(reader.result || ""), function (data) {
          if (!state.photoDraft) state.photoDraft = emptyPhotoDraft();
          state.photoDraft.data = data;
          render();
        });
      };
      reader.readAsDataURL(f);
    },
    setMemoFile: function (el) {
      const f = el.files && el.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () {
        if (!state.memoDraft) state.memoDraft = emptyMemoDraft();
        state.memoDraft.data = String(reader.result || "");
        state.memoDraft.recording = false;
        state.memoDraft.error = "";
        render();
      };
      reader.readAsDataURL(f);
    },
    setAttachQuery: function (v) { state.attachQuery = v; renderKeepFocus("att-q"); },
    setPackCustom: function (k, v) {
      if (k === "name") state.packCustomName = v;
      else state.packCustomAmount = v;
      renderKeepFocus(k === "name" ? "pack-custom-name" : "pack-custom-amount");
    },
    setCustomQuoteField: function (k, v) {
      if (!state.customQuoteDraft) return;
      state.customQuoteDraft[k] = v === "" ? "" : Number(v);
      const ids = { partCost: "cq-partCost", refLbs: "cq-refLbs", refCost: "cq-refCost" };
      renderKeepFocus(ids[k] || "cq-partCost");
    },
    setPaidDate: function (v) {
      if (!state.paidDraft) state.paidDraft = emptyPaidDraft();
      state.paidDraft.date = v;
    }
  };

  /* ——— Phase 1: vendors, job parts, PO email, backup / move data ——— */
  const PART_STATUS = [["needed", "Needed"], ["ordered", "Ordered"], ["received", "Received"]];
  function partStatusPill(st) {
    if (st === "received") return pill("Received", "#145C38", "#E3F5EC");
    if (st === "ordered") return pill("Ordered", "#7A5800", "#FBF3D8");
    return pill("Needed", "#A12A2A", "#FBE4E4");
  }
  function vendorById(id) { return (state.vendors || []).find(function (v) { return v.id === id; }) || null; }
  function jobParts(job) { return (job && Array.isArray(job.parts)) ? job.parts : []; }
  function nextPoNumber(job) { return job.id + "-P" + pad2((Number(job.poSeq) || 0) + 1); }
  /* Parts inside flat-rate assemblies and custom/specialty repairs. Keyed by
     price book item id. Costs are pre-tax supplier costs from pricing.md. */
  const ASSEMBLY_PARTS = {
    "fr-tstat-wifi": [
      { name: "Venstar T2000 Explorer Mini Wi-Fi thermostat", partNo: "T2000", qty: 1, cost: 72, note: "Standard Wi-Fi thermostat assembly (Steve-approved Nov 25, 2026)" },
      { name: "Venstar large wallplate", partNo: "ACC-EMIN-L", qty: 1, cost: 6, note: "Use ACC-EMIN-M only if the old footprint is extra-wide" }
    ]
  };
  const CUSTOM_PART_NAMES = {
    "fr-control-board": "Furnace control board",
    "fr-blower-ecm": "ECM blower motor",
    "fr-txv": "TXV"
  };
  /* The parts that one estimate line carries. Used when the estimate is saved,
     so every flat-rate or custom repair line stores its own parts list. */
  function partsForLine(l) {
    if (!l) return [];
    if (Array.isArray(l.parts)) return l.parts;
    const item = l.id ? getBookItem(l.id) : null;
    const qty = Number(l.qty) > 0 ? Number(l.qty) : 1;
    if (l.id && ASSEMBLY_PARTS[l.id]) return ASSEMBLY_PARTS[l.id].map(function (x) { return Object.assign({}, x, { qty: x.qty * qty }); });
    if (item && (l.customQuote || isCustomQuoteItem(item))) {
      const base = CUSTOM_PART_NAMES[item.id] || ("OEM part for " + item.name);
      const cost = Number(l.partCost) > 0 ? Number(l.partCost) : null;
      return [{ name: base + " (model TBD, confirm from nameplate)", partNo: "", qty: qty, cost: cost, note: "" }];
    }
    if (item && (l.flatRate || isFlatRateItem(item))) {
      if (item.noPart) return [];
      const part = item.partId ? getBookItem(item.partId) : null;
      const pname = part ? part.name : (item.partName || "");
      const pno = part ? (part.sku || "") : (item.sku || "");
      if (pname || pno) return [{ name: pname || item.name + " part", partNo: pno, qty: qty, cost: part ? part.cost : (item.partCost || item.cost || null), note: "" }];
      return [];
    }
    return [];
  }
  const PART_CATS = /^(parts|equipment|duct & materials|refrigerant|materials?)$/i;
  const NOT_PART_RE = /(option|good|better|best|package|bundle|discount|upgrade|replacement|replace|repair|install|maintenance|tune|service|diagnostic|labor|trip|truck|permit|hers|warranty|plan|visit|inspection|cleaning|subtotal|total|deposit)/i;
  /* Pull only real parts and equipment off the estimate: price book Parts,
     Equipment, Duct & materials, and Refrigerant lines, plus the part inside a
     flat-rate or custom-quote repair. Option names, headers, services, and
     labor are skipped. Returns [{ name, qty }]. */
  function estimatePartLines(job) {
    const est = (job.estimates || []).filter(function (e) { return !e.superseded; }).slice(-1)[0];
    const lines = (est && est.lineItems) || job.lineItems || [];
    const out = [];
    lines.forEach(function (l) {
      if (!l || !l.label || !(Number(l.amount) > 0)) return;
      if (Array.isArray(l.parts)) { l.parts.forEach(function (x) { out.push(Object.assign({}, x)); }); return; }
      if (isLaborLine(l)) return;
      const lp = partsForLine(l);
      if (lp.length) { lp.forEach(function (x) { out.push(Object.assign({}, x)); }); return; }
      const item = (l.id && getBookItem(l.id)) || null;
      if (item && (l.flatRate || l.customQuote || isFlatRateItem(item) || isCustomQuoteItem(item))) {
        const part = item.partId ? getBookItem(item.partId) : null;
        const pname = part ? part.name : (item.partName || "");
        if (pname && !item.noPart) out.push({ name: pname, qty: 1 });
        return;
      }
      if (item) { if (PART_CATS.test(String(item.category || "").trim())) out.push({ name: item.name, qty: Number(l.qty) || 1 }); return; }
      const label = String(l.label).replace(/\s*\((first repair|add-on)\)\s*$/i, "").replace(/\s*×\s*\d+$/, "");
      if (NOT_PART_RE.test(label)) return;
      const match = lineInBook(label);
      if (match && !PART_CATS.test(String(match.category || "").trim())) return;
      out.push({ name: match ? match.name : label, qty: 1 });
    });
    return out;
  }
  function partsPullAllowed(job) {
    return !!job.approvedEstimateId || ["approved", "progress", "done"].indexOf(job.status) !== -1;
  }
  function approvedScopeHtml(job) {
    let h = "";
    if (job.linkedFromJobId) h += '<div class="note" style="margin:0 0 12px">Linked to job #' + esc(job.linkedFromJobId) + (job.linkedEstimateId ? " · approved estimate " + esc(job.linkedEstimateId) : "") + ' <button class="link-btn tap" ' + act("openLinkedJob", job.linkedFromJobId) + ">Open</button></div>";
    if ((job.linkedJobIds || []).length) h += '<div class="note" style="margin:0 0 12px">Approved work moved to ' + job.linkedJobIds.map(function (id) { return '<button class="link-btn tap" ' + act("openLinkedJob", id) + ">job #" + esc(id) + "</button>"; }).join(", ") + "</div>";
    if (!job.approvedEstimateId) return h;
    h += '<div class="section-row"><div class="section" style="margin:0">Approved scope</div><div class="meta">' + esc(job.approvedEstimateId) + (job.scopeVersion ? " · v" + job.scopeVersion : "") + "</div></div>";
    h += job.scope ? '<div class="doc" style="white-space:pre-wrap;font-size:13px;line-height:19px">' + esc(job.scope) + "</div>" : '<div class="muted" style="margin-bottom:10px">No scope text on the approved estimate.</div>';
    if (job.pdfUrl) h += '<a class="btn ghost" style="display:flex;text-decoration:none;margin-bottom:16px" href="' + esc(job.pdfUrl) + '" target="_blank" rel="noopener">Open estimate PDF</a>';
    return h;
  }
  function partsSection(job) {
    const parts = jobParts(job);
    const need = parts.filter(function (x) { return x.status === "needed"; }).length;
    const ord = parts.filter(function (x) { return x.status === "ordered"; }).length;
    let html = '<div id="job-parts" class="section-row" style="scroll-margin-top:12px"><div class="section" style="margin:0">Parts and equipment</div>' +
      (parts.length ? '<div class="meta">' + (need ? need + " needed" : "") + (need && ord ? " · " : "") + (ord ? ord + " on order" : "") + (!need && !ord ? "All received" : "") + "</div>" : "") + "</div>";
    html += '<div class="stack" style="margin-bottom:10px">' + (parts.length ? parts.map(function (x) {
      const v = vendorById(x.branchId);
      return '<button class="list-card" ' + act("editPart", x.id) + '><div class="job-body"><div class="row"><div class="job-name" style="font-size:15px">' + esc(x.name) + (Number(x.qty) > 1 ? " × " + esc(String(x.qty)) : "") + "</div>" + partStatusPill(x.status) + "</div>" +
        '<div class="job-prob">' + esc([x.partNo, x.cost != null && x.cost !== "" ? "cost " + money(Number(x.cost)) + (x.costUnverified ? " (unverified)" : "") : "", v ? v.name : "", x.po ? "PO " + x.po : ""].filter(Boolean).join(" · ") || "Tap to set part #, branch, or status") + "</div>" +
        (x.note ? '<div class="meta" style="margin-top:2px">' + esc(x.note) + "</div>" : "") + "</div></button>";
    }).join("") : '<div class="muted">No parts listed yet. Add them by hand or pull them from the estimate.</div>') + "</div>";
    html += '<div class="quick" style="grid-template-columns:1fr 1fr;margin-bottom:8px">' +
      '<button class="dash" ' + act("addPart") + ">+ Add part</button>" +
      (partsPullAllowed(job) ? '<button class="dash" ' + act("partsFromEstimate") + ">Pull from estimate</button>" : '<div class="meta" style="align-self:center">Estimate parts move here when it’s approved.</div>') + "</div>" +
      (need ? '<button class="btn ghost" style="margin-bottom:16px" ' + act("openPo") + ">Draft PO email · " + esc(nextPoNumber(job)) + "</button>" : '<div style="margin-bottom:16px"></div>');
    return html;
  }
  function partSheet() {
    const d = state.partDraft; if (!d) return "";
    const vendors = state.vendors || [];
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (d.isNew ? "Add part" : "Edit part") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<label class="field"><div class="field-lab">Part or equipment</div><input id="pt-name" autocomplete="off" value="' + esc(d.name || "") + '" oninput="RT.setPartField(\'name\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Part # / model (optional)</div><input id="pt-partNo" autocomplete="off" value="' + esc(d.partNo || "") + '" oninput="RT.setPartField(\'partNo\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Qty</div><input id="pt-qty" inputmode="decimal" autocomplete="off" value="' + esc(String(d.qty == null ? 1 : d.qty)) + '" oninput="RT.setPartField(\'qty\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Preferred branch</div><select id="pt-branch" onchange="RT.setPartField(\'branchId\', this.value)"><option value="">' + (vendors.length ? "Pick a branch" : "No branches yet (Settings › Vendors)") + "</option>" +
        vendors.map(function (v) { return '<option value="' + esc(v.id) + '"' + (d.branchId === v.id ? " selected" : "") + ">" + esc(v.name) + "</option>"; }).join("") + "</select></label>" +
      '<div class="field-lab">Status</div><div class="chips" style="margin-bottom:14px">' + PART_STATUS.map(function (x) {
        return '<button class="chip' + (d.status === x[0] ? " on" : "") + '" ' + act("partStatus", x[0]) + ">" + x[1] + "</button>";
      }).join("") + "</div>" +
      (d.po ? '<div class="muted" style="margin-bottom:10px">On PO ' + esc(d.po) + "</div>" : "") +
      '<button data-pin class="btn teal" ' + act("savePart") + ">Save part</button>" +
      (d.isNew ? "" : '<button class="btn ghost" style="margin-top:8px" ' + act("deletePart") + ">Remove from job</button>")
    );
  }
  function poParts(job, d) {
    return jobParts(job).filter(function (x) { return x.status === "needed" && (!d.branchId || !x.branchId || x.branchId === d.branchId); });
  }
  function poText(job, d) {
    const v = vendorById(d.branchId);
    const parts = poParts(job, d);
    const lines = [
      "PO: " + d.po,
      v && v.account ? "Account: " + v.account : "",
      "Job: " + job.id + " · " + (job.customer || ""),
      "Job address: " + [job.address, job.city].filter(Boolean).join(", "),
      d.delivery ? "Delivery to job address" : "Will-call pickup",
      "",
      "Parts:"
    ].filter(function (x, i) { return x !== "" || i === 5; });
    parts.forEach(function (x) { lines.push("- " + (Number(x.qty) || 1) + " × " + x.name + (x.partNo ? " (" + x.partNo + ")" : "")); });
    lines.push("", "Please confirm availability and pickup/delivery time. Thanks,", "Steve Seguine · ReliaTech Services · " + ((state.settings && state.settings.stevePhone) || "(562) 487-8750"));
    return lines.join("\n");
  }
  function poSubject(job, d) { return "PO " + d.po + " · " + (d.delivery ? "Delivery" : "Will-call") + " · " + (job.customer || "") ; }
  function poSheet(job) {
    const d = state.poDraft; if (!d) return "";
    const vendors = state.vendors || [];
    const v = vendorById(d.branchId);
    const parts = poParts(job, d);
    const href = "mailto:" + (v && v.email ? String(v.email).replace(/[^A-Za-z0-9@._+,-]/g, "") : "") + "?subject=" + encodeURIComponent(poSubject(job, d)) + "&body=" + encodeURIComponent(poText(job, d));
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">PO ' + esc(d.po) + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="field-lab">Branch</div><div class="stack" style="margin-bottom:10px">' + (vendors.length ? vendors.map(function (x) {
        return '<button class="dash' + (d.branchId === x.id ? " sel" : "") + '" ' + act("poBranch", x.id) + ">" + esc(x.name) + (x.email ? " · " + esc(x.email) : " · no email yet") + "</button>";
      }).join("") : '<div class="muted">No branches yet. Add them in Settings › Vendors. You can still copy the text below.</div>') + "</div>" +
      '<div class="chips" style="margin-bottom:10px"><button class="chip' + (!d.delivery ? " on" : "") + '" ' + act("poDelivery", "0") + ">Will-call</button><button class=\"chip" + (d.delivery ? " on" : "") + '" ' + act("poDelivery", "1") + ">Delivery</button></div>" +
      (parts.length ? "" : '<div class="note">No needed parts for this branch.</div>') +
      '<pre class="voice-text" style="white-space:pre-wrap;font-size:13px;text-align:left">' + esc(poText(job, d)) + "</pre>" +
      '<div class="muted" style="margin:6px 0 10px">Opens a draft in your mail app. Nothing is sent until you press Send.</div>' +
      (v && v.email ? '<a class="btn teal" style="display:flex;text-decoration:none" href="' + esc(href) + '">Open email to ' + esc(v.name) + "</a>" : "") +
      '<button class="btn ghost" style="margin-top:8px" ' + act("copyPo") + ">Copy PO text</button>" +
      (parts.length ? '<button data-pin class="btn" style="margin-top:8px" ' + act("markPoOrdered") + ">Mark these " + parts.length + " as ordered on " + esc(d.po) + "</button>" : "")
    );
  }
  function vendorsSection() {
    const list = state.vendors || [];
    return '<div class="section">Vendors</div>' +
      '<div class="muted" style="margin:-4px 0 12px">Supply house branches for PO emails. Add each counter’s email, your account number, and what you usually buy there.</div>' +
      '<div class="stack" style="margin-bottom:8px">' + list.map(function (v) {
        return '<button class="list-card" ' + act("editVendor", v.id) + '><div class="job-body"><div class="job-name" style="font-size:15px">' + esc(v.name) + '</div><div class="job-prob">' + esc([v.email, v.account ? "Acct " + v.account : "", v.buys].filter(Boolean).join(" · ") || "Tap to add details") + "</div></div></button>";
      }).join("") + "</div>" +
      '<button class="dash" style="margin-bottom:16px" ' + act("addVendor") + ">+ Add branch</button>";
  }
  function vendorSheet() {
    const d = state.vendorDraft; if (!d) return "";
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (d.isNew ? "Add branch" : "Edit branch") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<label class="field"><div class="field-lab">Branch name</div><input id="vd-name" autocomplete="off" placeholder="e.g. Sigler Long Beach" value="' + esc(d.name || "") + '" oninput="RT.setVendorField(\'name\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Counter email</div><input id="vd-email" type="email" inputmode="email" autocomplete="off" value="' + esc(d.email || "") + '" oninput="RT.setVendorField(\'email\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Counter phone (optional)</div><input id="vd-phone" type="tel" autocomplete="off" value="' + esc(d.phone || "") + '" oninput="RT.setVendorField(\'phone\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Account #</div><input id="vd-account" autocomplete="off" value="' + esc(d.account || "") + '" oninput="RT.setVendorField(\'account\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">What you buy there</div><input id="vd-buys" autocomplete="off" placeholder="e.g. Payne equipment, copper, filters" value="' + esc(d.buys || "") + '" oninput="RT.setVendorField(\'buys\', this.value)"></label>' +
      '<button data-pin class="btn teal" ' + act("saveVendor") + ">Save branch</button>" +
      (d.isNew ? "" : '<button class="btn ghost" style="margin-top:8px" ' + act("deleteVendor") + ">Remove branch</button>")
    );
  }
  function backupSection() {
    const r = state.importReport;
    return '<div class="section">Backup / Move data</div>' +
      '<div class="muted" style="margin:-4px 0 12px">Each phone or browser keeps its own copy until online sync is set up. To move techs, jobs, and customers between your iPhone and desktop: Save a backup file on one, then Import it on the other. Import adds what’s missing and never deletes or overwrites what’s already here.</div>' +
      '<button class="btn" style="margin-bottom:8px" ' + act("exportData") + ">Save backup file</button>" +
      '<label class="btn ghost" style="display:flex;margin-bottom:8px;cursor:pointer">Import backup file<input type="file" accept=".json,application/json" style="display:none" onchange="RT.importFile(this)"></label>' +
      (r ? '<div class="note" style="margin-bottom:16px">' + esc(r) + "</div>" : '<div style="margin-bottom:16px"></div>');
  }
  function downloadBackup(photos) {
    const snap = snapshotState();
    const payload = { app: "reliatech", kind: "backup", exportedAt: new Date().toISOString(), device: navigator.userAgent, data: snap, photos: Array.isArray(photos) ? photos : [] };
    const json = JSON.stringify(payload);
    const name = "reliatech-backup-" + todayYmd() + ".json";
    try {
      const file = typeof File !== "undefined" ? new File([json], name, { type: "application/json" }) : null;
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
        navigator.share({ files: [file], title: name }).catch(function () {});
        return;
      }
    } catch (e) {}
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    showToast("Backup saved: " + name);
  }
  function unionById(local, incoming) {
    const out = (local || []).slice();
    const have = {};
    out.forEach(function (x) { if (x && x.id) have[x.id] = true; });
    let added = 0;
    (incoming || []).forEach(function (x) { if (x && x.id && !have[x.id]) { out.push(x); have[x.id] = true; added++; } });
    return { list: out, added: added };
  }
  function importBackup(payload) {
    const d = payload && payload.data ? payload.data : payload;
    if (!d || (!Array.isArray(d.jobs) && !Array.isArray(d.customers) && !Array.isArray(d.techRecords))) throw new Error("not a backup");
    const counts = { customers: 0, jobs: 0, techs: 0, vendors: 0, plans: 0, visits: 0, items: 0, renumbered: 0 };
    // customers
    const custMap = {};
    (d.customers || []).forEach(function (ic) {
      if (!ic || !ic.id) return;
      const icPh = String(ic.phone || "").replace(/\D/g, "").slice(-10);
      const twin = state.customers.find(function (c) {
        return normalizeName(c.name) === normalizeName(ic.name) && String(c.phone || "").replace(/\D/g, "").slice(-10) === icPh;
      });
      if (twin) { if (twin.id !== ic.id) custMap[ic.id] = twin.id; return; }
      const mine = getCustomer(ic.id);
      if (!mine) { state.customers.push(normalizeCustomer(ic)); counts.customers++; return; }
      if (normalizeName(mine.name) === normalizeName(ic.name)) return;
      const nid = nextCustomerId();
      const copy = JSON.parse(JSON.stringify(ic));
      copy.id = nid;
      (copy.addresses || []).forEach(function (a) { if (a && a.id) a.id = String(a.id).replace("sa-" + ic.id + "-", "sa-" + nid + "-"); });
      custMap[ic.id] = nid;
      state.customers.push(normalizeCustomer(copy));
      counts.customers++;
    });
    // jobs
    (d.jobs || []).forEach(function (ij) {
      if (!ij || !ij.id) return;
      const j = JSON.parse(JSON.stringify(ij));
      if (custMap[j.customerId]) j.customerId = custMap[j.customerId];
      if (custMap[j.billToCustomerId]) j.billToCustomerId = custMap[j.billToCustomerId];
      if (j.addressId) Object.keys(custMap).forEach(function (old) { j.addressId = String(j.addressId).replace("sa-" + old + "-", "sa-" + custMap[old] + "-"); });
      const mine = getJob(j.id);
      if (!mine) { state.jobs.push(normalizeJob(j)); counts.jobs++; return; }
      if (normalizeName(mine.customer) !== normalizeName(j.customer)) {
        const nid = nextJobId(state.jobs);
        j.timeline = [t("timp" + Date.now() + counts.renumbered, "system", "Just now", "Imported as #" + nid, "This job was #" + j.id + " on the other device. That number was already used here.")].concat(j.timeline || []);
        j.id = nid;
        state.jobs.push(normalizeJob(j));
        counts.jobs++; counts.renumbered++;
        return;
      }
      ["timeEntries", "timeline", "parts", "captures", "readingSets"].forEach(function (k) {
        if (!Array.isArray(j[k]) || !j[k].length) return;
        const u = unionById(mine[k], j[k]);
        if (u.added) { mine[k] = u.list; counts.items += u.added; }
      });
    });
    // techs
    const before = (state.techRecords || []).length;
    state.techRecords = normalizeTechRecords((state.techs || []).concat(d.techs || []), (state.techRecords || []).concat((d.techRecords || []).filter(function (r) {
      return !(state.techRecords || []).some(function (x) { return x.name === techNameOf(r); });
    })));
    state.techs = techNamesFrom(state.techRecords);
    dedupeTechs();
    counts.techs = Math.max(0, state.techRecords.length - before);
    const vKey = function (v) { return normalizeName(v.name) + "|" + String(v.email || "").trim().toLowerCase() + "|" + String(v.phone || "").replace(/\D/g, ""); };
    const incomingVendors = (d.vendors || []).filter(function (v) { return v && !(state.vendors || []).some(function (x) { return vKey(x) === vKey(v); }); });
    let u = unionById(state.vendors, incomingVendors); state.vendors = u.list; counts.vendors = u.added;
    u = unionById(state.plans, d.plans); state.plans = u.list; counts.plans = u.added;
    u = unionById(state.visits, d.visits); state.visits = u.list; counts.visits = u.added;
    u = unionById(state.unfiledCaptures, d.unfiledCaptures); state.unfiledCaptures = u.list; counts.items += u.added;
    u = unionById(state.priceBook, d.priceBook); state.priceBook = u.list; counts.items += u.added;
    const parts = [];
    if (counts.techs) parts.push(counts.techs + " tech" + (counts.techs > 1 ? "s" : ""));
    if (counts.customers) parts.push(counts.customers + " customer" + (counts.customers > 1 ? "s" : ""));
    if (counts.jobs) parts.push(counts.jobs + " job" + (counts.jobs > 1 ? "s" : "") + (counts.renumbered ? " (" + counts.renumbered + " renumbered because the number was taken)" : ""));
    if (counts.vendors) parts.push(counts.vendors + " branch" + (counts.vendors > 1 ? "es" : ""));
    if (counts.plans || counts.visits) parts.push((counts.plans + counts.visits) + " plan records");
    if (counts.items) parts.push(counts.items + " notes, times, parts, or price book items");
    return parts.length ? "Imported " + parts.join(", ") + ". Nothing here was deleted or overwritten." : "Nothing new in that file. Everything in it is already on this device.";
  }
  Object.assign(window.RT, {
    setPartField: function (k, v) { if (state.partDraft) state.partDraft[k] = v; },
    setVendorField: function (k, v) { if (state.vendorDraft) state.vendorDraft[k] = v; },
    importFile: function (el) {
      const f = el.files && el.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const parsed = JSON.parse(String(reader.result || ""));
          state.importReport = importBackup(parsed);
          const pics = (parsed && Array.isArray(parsed.photos)) ? parsed.photos.filter(function (x) { return x && x.id && x.data; }) : [];
          if (pics.length) {
            Promise.all(pics.map(function (x) { return PhotoStore.put(x).catch(function () {}); })).then(function () { state.importReport += " " + pics.length + " photo" + (pics.length > 1 ? "s" : "") + " restored."; render(); });
          }
          showToast("Import finished");
        } catch (e) {
          state.importReport = "That file isn’t a ReliaTech backup. Nothing was changed.";
          render();
        }
      };
      reader.readAsText(f);
      el.value = "";
    }
  });
  function techKey(n) { return String(n || "").trim().replace(/\s+/g, " ").toLowerCase(); }
  function techFieldCount(r) { return Object.keys(r || {}).filter(function (k) { const v = r[k]; return v !== "" && v != null && v !== false; }).length; }
  function remapTechName(from, to) {
    if (!from || from === to) return;
    function walk(o) {
      if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) { if (o[i] === from) o[i] = to; else if (o[i] && typeof o[i] === "object") walk(o[i]); } return; }
      Object.keys(o).forEach(function (k) {
        if (o[k] === from && /tech|by|requester|reviewer|editor|who|assigned/i.test(k)) o[k] = to;
        else if (o[k] && typeof o[k] === "object") walk(o[k]);
      });
    }
    (state.jobs || []).forEach(function (j) { if (j.timeEntries) walk(j.timeEntries); if (j.assignedTechs) walk(j.assignedTechs); if (j.assignedTech === from) j.assignedTech = to; });
    if (state.currentTech === from) state.currentTech = to;
  }
  /* Merge tech records that are the same person: same name ignoring case and
     spaces, or the same phone or email. Keeps the record with the most data. */
  function dedupeTechs() {
    const recs = (state.techRecords || []).map(function (r) { return Object.assign({}, r, { name: String(r.name || "").trim().replace(/\s+/g, " ") }); });
    const groups = [];
    recs.forEach(function (r) {
      const ph = String(r.phone || "").replace(/\D/g, "").slice(-10), em = String(r.email || "").trim().toLowerCase();
      const g = groups.find(function (g) {
        return g.some(function (x) {
          if (techKey(x.name) === techKey(r.name)) return true;
          const xph = String(x.phone || "").replace(/\D/g, "").slice(-10), xem = String(x.email || "").trim().toLowerCase();
          return (ph && ph === xph) || (em && em === xem);
        });
      });
      if (g) g.push(r); else groups.push([r]);
    });
    let merged = 0;
    const out = groups.map(function (g) {
      let keep = g.find(function (x) { return x.name === DEFAULT_TECH; }) || g.slice().sort(function (a, b) { return techFieldCount(b) - techFieldCount(a); })[0];
      const combined = Object.assign({}, keep);
      if (keep.name !== DEFAULT_TECH) {
        const caseScore = function (n) { return /[A-Z]/.test(n) && n !== n.toUpperCase() ? 2 : (n === n.toUpperCase() && /[A-Z]/.test(n) ? 1 : 0); };
        combined.name = g.map(function (x) { return x.name; }).sort(function (a, b) { return caseScore(b) - caseScore(a); })[0];
      }
      g.forEach(function (x) {
        Object.keys(x).forEach(function (k) { if ((combined[k] === "" || combined[k] == null) && x[k] !== "" && x[k] != null) combined[k] = x[k]; });
        if (x.canEditOwnTimes) combined.canEditOwnTimes = true;
        if (x.role === "admin") combined.role = "admin";
      });
      g.forEach(function (x) { if (x !== keep) { merged++; } });
      return { keep: combined, names: g.map(function (x) { return x.name; }) };
    });
    // remap references using original (pre-trim) names too
    (state.techRecords || []).forEach(function (orig) {
      const hit = out.find(function (o) { return o.names.indexOf(String(orig.name || "").trim().replace(/\s+/g, " ")) !== -1; });
      if (hit && orig.name !== hit.keep.name) remapTechName(orig.name, hit.keep.name);
    });
    out.forEach(function (o) { o.names.forEach(function (n) { if (n !== o.keep.name) remapTechName(n, o.keep.name); }); });
    (state.techs || []).forEach(function (n) {
      const o = out.find(function (o) { return o.names.some(function (x) { return techKey(x) === techKey(n); }); });
      if (o && n !== o.keep.name) remapTechName(n, o.keep.name);
    });
    state.techRecords = normalizeTechRecords(out.map(function (o) { return o.keep.name; }), out.map(function (o) { return o.keep; }));
    state.techs = techNamesFrom(state.techRecords);
    if (state.techs.indexOf(state.currentTech) === -1) state.currentTech = DEFAULT_TECH;
    return merged;
  }
  function possibleTechDupes() {
    const recs = state.techRecords || [];
    const pairs = [];
    for (let i = 0; i < recs.length; i++) for (let j = i + 1; j < recs.length; j++) {
      const a = techKey(recs[i].name), b = techKey(recs[j].name);
      const at = a.split(" "), bt = b.split(" ");
      const firstSame = at[0] && at[0] === bt[0];
      const close = editDistance(a, b) <= 2 || a.indexOf(b) === 0 || b.indexOf(a) === 0 || (firstSame && (at.length === 1 || bt.length === 1));
      if (close) pairs.push([recs[i].name, recs[j].name]);
    }
    return pairs;
  }
  function possibleCustomerDupes() {
    const list = state.customers || [];
    const pairs = [];
    const byPhone = {}, byName = {};
    list.forEach(function (c) {
      const ph = String(c.phone || "").replace(/\D/g, "").slice(-10);
      const nm = normalizeName(c.name);
      if (nm && byName[nm]) pairs.push([byName[nm], c.id, "same name"]);
      else if (nm) byName[nm] = c.id;
      if (ph.length === 10 && byPhone[ph] && byPhone[ph] !== byName[nm] && normalizeName((getCustomer(byPhone[ph]) || {}).name) !== nm) {
        const other = getCustomer(byPhone[ph]);
        if (other && scoreCustomer(c.name, other) >= 60) pairs.push([byPhone[ph], c.id, "same phone"]);
      } else if (ph.length === 10 && !byPhone[ph]) byPhone[ph] = c.id;
    });
    return pairs.filter(function (p) { return p[0] !== p[1]; }).slice(0, 20);
  }
  function mergeCustomerInto(keepId, dropId) {
    const keep = getCustomer(keepId), drop = getCustomer(dropId);
    if (!keep || !drop || keep === drop) return false;
    const addrMap = {};
    (drop.addresses || []).forEach(function (a) {
      const dup = (keep.addresses || []).find(function (k) { return normalizeName(k.address) === normalizeName(a.address) && normalizeName(k.city) === normalizeName(a.city); });
      if (dup) { addrMap[a.id] = dup.id; return; }
      const nid = nextAddressId(keep.id, state.customers);
      addrMap[a.id] = nid;
      keep.addresses = (keep.addresses || []).concat([Object.assign({}, a, { id: nid })]);
    });
    ["phone", "email", "address", "city", "billingAddress", "billingCity"].forEach(function (k) { if (!keep[k] && drop[k]) keep[k] = drop[k]; });
    keep.assets = (keep.assets || []).concat((drop.assets || []).filter(function (x) { return !(keep.assets || []).some(function (y) { return y.id === x.id; }); }));
    (state.jobs || []).concat(state.moneyJobs || []).forEach(function (j) {
      if (j.customerId === dropId) { j.customerId = keepId; j.customer = keep.name; }
      if (j.billToCustomerId === dropId) j.billToCustomerId = keepId;
      if (j.addressId && addrMap[j.addressId]) j.addressId = addrMap[j.addressId];
    });
    (state.plans || []).forEach(function (x) { if (x.customerId === dropId) x.customerId = keepId; if (x.addressId && addrMap[x.addressId]) x.addressId = addrMap[x.addressId]; });
    (state.visits || []).forEach(function (x) { if (x.customerId === dropId) x.customerId = keepId; if (x.addressId && addrMap[x.addressId]) x.addressId = addrMap[x.addressId]; });
    state.customers = state.customers.filter(function (c) { return c.id !== dropId; });
    return true;
  }
  function duplicatesSection() {
    const tp = possibleTechDupes(), cp = possibleCustomerDupes();
    let h = '<div class="section">Possible duplicates</div>';
    if (!tp.length && !cp.length) return h + '<div class="muted" style="margin:-4px 0 16px">No likely duplicate techs or customers found.</div>';
    h += '<div class="muted" style="margin:-4px 0 10px">Only merge if they are the same person. Merging moves clock-ins, jobs, and addresses to the one you keep. Nothing merges on its own.</div>';
    tp.forEach(function (p) {
      h += '<div class="panel" style="margin-bottom:8px"><div class="h2" style="margin:0 0 8px">Tech: ' + esc(p[0]) + " / " + esc(p[1]) + "</div>" +
        '<div class="quick" style="grid-template-columns:1fr 1fr">' +
        '<button class="dash" ' + act("mergeTech", p[1] + "||" + p[0]) + ">Keep " + esc(p[0]) + "</button>" +
        '<button class="dash" ' + act("mergeTech", p[0] + "||" + p[1]) + ">Keep " + esc(p[1]) + "</button></div></div>";
    });
    cp.forEach(function (p) {
      const a = getCustomer(p[0]), b = getCustomer(p[1]); if (!a || !b) return;
      const na = jobsForCustomer(a).length, nb = jobsForCustomer(b).length;
      h += '<div class="panel" style="margin-bottom:8px"><div class="h2" style="margin:0 0 4px">Customer (' + esc(p[2]) + ")</div>" +
        '<div class="muted" style="margin-bottom:8px">' + esc(a.name) + " · " + esc(a.phone || "no phone") + " · " + na + " jobs<br>" + esc(b.name) + " · " + esc(b.phone || "no phone") + " · " + nb + " jobs</div>" +
        '<div class="quick" style="grid-template-columns:1fr 1fr">' +
        '<button class="dash" ' + act("mergeCustomer", a.id + "||" + b.id) + ">Keep " + esc(a.name) + " (" + esc(a.id) + ")</button>" +
        '<button class="dash" ' + act("mergeCustomer", b.id + "||" + a.id) + ">Keep " + esc(b.name) + " (" + esc(b.id) + ")</button></div></div>";
    });
    return h + '<div style="margin-bottom:16px"></div>';
  }
  /* ——— Pre-Phase 2: estimate approval, scope versions, PDF, Ask ReliaTech handoff ——— */
  function approvalHash(str) {
    let h = 0x811c9dc5;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 5; i++) { out += chars[h % chars.length]; h = Math.floor(h / chars.length); }
    return out;
  }
  function approvalNameKey(n) { return String(n || "").toLowerCase().replace(/[^a-z]/g, ""); }
  function approvalCode(estId, optNums, name) {
    const opts = optNums.slice().sort(function (a, b) { return a - b; }).join("-");
    return estId + "." + opts + "." + approvalHash(estId + "|" + opts + "|" + approvalNameKey(name));
  }
  function currentEstimateRec(job, id) {
    const want = id || job.estimateId;
    return (job.estimates || []).find(function (e) { return e.id === want; }) || null;
  }
  function estimateOptions(rec) {
    let n = 0;
    return (rec && rec.lineItems || []).map(function (l, i) {
      if (!(Number(l.amount) > 0)) return null;
      n++;
      return { n: n, idx: i, label: String(l.label || "Option " + n), amount: Number(l.amount) || 0, parts: Array.isArray(l.parts) ? l.parts : partsForLine(l) };
    }).filter(Boolean);
  }
  function estimateDiscounts(rec) {
    return (rec && rec.lineItems || []).filter(function (l) { return Number(l.amount) < 0; });
  }
  function approvedTotal(rec, optNums) {
    const opts = estimateOptions(rec);
    const picked = opts.filter(function (o) { return optNums.indexOf(o.n) !== -1; });
    let t = picked.reduce(function (s, o) { return s + o.amount; }, 0);
    const all = picked.length === opts.length && opts.length > 1;
    estimateDiscounts(rec).forEach(function (d) {
      const conditional = /if (both|all)/i.test(d.label || "");
      if (!conditional || all) t += Number(d.amount) || 0;
    });
    return Math.round(t * 100) / 100;
  }
  function latestScope(rec, finalOnly) {
    const v = (rec && rec.scopeVersions) || [];
    for (let i = v.length - 1; i >= 0; i--) if (!finalOnly || v[i].status === "Final") return v[i];
    return null;
  }
  function estimateIsOnOtherVisit(job) {
    return !!(job.invoiceId || jobTimeEntries(job).length || ["progress", "done", "invoiced", "paid"].indexOf(job.status) !== -1);
  }
  function customerApprovalUrl(job, rec) {
    const sc = latestScope(rec, true) || latestScope(rec, false);
    const payload = {
      e: rec.id, j: job.id, c: (billToCustomer(job) || {}).name || job.customer,
      a: [job.address, job.city].filter(Boolean).join(", "),
      o: estimateOptions(rec).map(function (o) { return [o.n, o.label, o.amount]; }),
      d: estimateDiscounts(rec).map(function (l) { return [l.label, Number(l.amount)]; }),
      s: sc ? sc.text : "",
      p: rec.pdfUrl || "",
      t: (state.settings && state.settings.stevePhone) || "(562) 487-8750",
      m: (state.settings && state.settings.steveEmail) || "steveseguine51@gmail.com",
      x: rec.expires || ""
    };
    return PUBLIC_PAY_BASE + "approve.html#d=" + encodePayPayload(payload);
  }
  function approvalLinkMessage(job, rec) {
    return "Hi " + firstName(job.customer) + ", here is ReliaTech estimate " + rec.id + " for " + (job.address || "your home") + ". Review the options and approve here: " + customerApprovalUrl(job, rec) + " — Steve, ReliaTech Services";
  }
  function estimateExtrasHtml(job, rec) {
    if (!rec || rec.superseded) return "";
    const ap = rec.approval;
    const opts = estimateOptions(rec);
    let h = '<div class="section">Approval</div>';
    if (ap) {
      const names = opts.filter(function (o) { return ap.options.indexOf(o.n) !== -1; }).map(function (o) { return "Option " + o.n + " · " + o.label; });
      h += '<div class="panel" style="margin-bottom:10px;border-left:4px solid #2F8F4E"><div class="h2" style="margin:0 0 4px">Approved · ' + money(ap.total || 0) + "</div>" +
        '<div class="muted">' + esc(names.join("; ")) + "</div>" +
        '<div class="meta" style="margin-top:6px">By ' + esc(ap.by || "—") + " · " + esc(ap.method || "") + " · " + esc(formatPrettyDateTime(ap.at)) + (ap.code ? " · code " + esc(ap.code) + (ap.codeVerified ? " ✓" : " (not verified)") : "") + "</div>" +
        (ap.result && ap.result.mode === "linked" ? '<div class="meta">Work moved to new linked job #' + esc(ap.result.jobId) + "</div>" : "") +
        "</div>" +
        (ap.result && ap.result.mode === "linked" ? '<button class="btn ghost" style="margin-bottom:8px" ' + act("openLinkedJob", ap.result.jobId) + ">Open job #" + esc(ap.result.jobId) + "</button>" : "") +
        '<button class="link-btn tap" style="margin:0 0 10px" ' + act("undoApproval", rec.id) + ">Undo approval</button>";
    } else {
      h += '<div class="muted" style="margin:-4px 0 8px">Awaiting approval. Scope, PDF link, and parts move to the job only after approval.</div>' +
        '<button class="btn teal" style="margin-bottom:8px" ' + act("openApproveEst", rec.id) + ">Approve…</button>" +
        '<button class="dash" style="margin-bottom:8px" ' + act("openEstShare", rec.id) + ">Text / share…</button>" +
        '<div class="note" style="margin:-4px 0 12px">Nothing is sent by the app. You get a short message and the Drive PDF link to copy. When the customer replies, record it with Approve….</div>';
    }
    h += '<div class="section">Estimate PDF</div>';
    h += rec.pdfUrl ? '<a class="btn ghost" style="display:flex;text-decoration:none;margin-bottom:12px" href="' + esc(rec.pdfUrl) + '" target="_blank" rel="noopener">Open PDF</a>'
      : '<div class="muted" style="margin:-4px 0 12px">No PDF yet. Mark a scope version Final, then Print / Save PDF.</div>';
    const versions = rec.scopeVersions || [];
    const cur = versions[versions.length - 1];
    h += '<div class="section-row"><div class="section" style="margin:0">Scope</div>' + (cur ? '<div class="meta">v' + cur.v + " · " + esc(cur.status) + "</div>" : "") + "</div>";
    h += cur ? '<div class="doc" style="white-space:pre-wrap;font-size:13px;line-height:19px">' + esc(cur.text) + "</div>" : '<div class="muted" style="margin:-4px 0 8px">No scope drafted yet.</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
      '<button class="dash" ' + act("editScope", rec.id) + ">" + (cur ? "Edit (new version)" : "Write scope") + "</button>" +
      '<button class="dash" ' + act("refineScope", rec.id) + ">Send to ReliaTech to refine</button></div>" +
      (cur && cur.status !== "Final" ? '<button class="dash" style="margin-bottom:8px" ' + act("finalizeScope", rec.id) + ">Mark v" + cur.v + " Final</button>" : "") +
      (latestScope(rec, true) ? '<button class="dash" style="margin-bottom:8px" ' + act("printEstimate", rec.id) + ">Print / Save PDF from v" + latestScope(rec, true).v + " (Final)</button>" : '<div class="note" style="margin:0 0 8px">A PDF can only be made from a version marked Final.</div>') +
      (versions.length > 1 ? '<div class="meta" style="margin-bottom:12px">History: ' + versions.map(function (v) { return "v" + v.v + " " + v.status + " (" + formatDate(v.at) + ")"; }).join(" · ") + "</div>" : "");
    const withParts = opts.filter(function (o) { return o.parts && o.parts.length; });
    if (withParts.length) {
      h += '<div class="section">Parts on this estimate</div><div class="muted" style="margin:-4px 0 8px">These move to the job’s parts list when the option is approved.</div>' +
        withParts.map(function (o) {
          return '<div class="panel" style="margin-bottom:8px"><div class="meta" style="margin-bottom:4px">Option ' + o.n + " · " + esc(o.label) + "</div>" +
            o.parts.map(function (p) { return '<div class="row" style="font-size:13px"><div>' + esc((Number(p.qty) || 1) + " × " + p.name + (p.partNo ? " (" + p.partNo + ")" : "")) + "</div><div>" + (p.cost != null && p.cost !== "" ? money(Number(p.cost)) + (p.costUnverified ? "*" : "") : "") + "</div></div>"; }).join("") + "</div>";
        }).join("");
    }
    return h;
  }
  function approveEstSheet(job) {
    const d = state.approveDraft; if (!d) return "";
    const rec = currentEstimateRec(job, d.estId); if (!rec) return "";
    const opts = estimateOptions(rec);
    const methods = ["In person", "Phone", "Text", "Customer link"];
    const tot = approvedTotal(rec, d.options);
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Approve ' + esc(rec.id) + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="field-lab">How was it approved?</div><div class="chips" style="margin-bottom:12px">' + methods.map(function (m) {
        return '<button class="chip' + (d.method === m ? " on" : "") + '" ' + act("approveMethod", m) + ">" + m + "</button>";
      }).join("") + "</div>" +
      (d.method === "Customer link" ? '<label class="field"><div class="field-lab">Paste the customer’s approval text or code</div><textarea id="ap-code" rows="3" placeholder="e.g. 55720-E01.1-2.K7Q2X" oninput="RT.setApproveField(\'paste\', this.value)">' + esc(d.paste || "") + "</textarea></label>" +
        '<button class="dash" style="margin-bottom:12px" ' + act("readApprovalCode") + ">Read code</button>" +
        (d.codeMsg ? '<div class="note" style="margin:-6px 0 12px">' + esc(d.codeMsg) + "</div>" : "") : "") +
      '<div class="field-lab">Options approved</div><div class="stack" style="margin-bottom:12px">' + opts.map(function (o) {
        const on = d.options.indexOf(o.n) !== -1;
        return '<button class="dash' + (on ? " sel" : "") + '" ' + act("approveToggleOpt", String(o.n)) + ">" + (on ? "✓ " : "") + "Option " + o.n + " · " + esc(o.label) + " · " + money(o.amount) + "</button>";
      }).join("") + "</div>" +
      '<label class="field"><div class="field-lab">Approved by</div><input id="ap-by" autocomplete="off" value="' + esc(d.by || "") + '" oninput="RT.setApproveField(\'by\', this.value)"></label>' +
      '<div class="h2" style="margin:4px 0 12px">Approved total ' + money(tot) + "</div>" +
      '<div class="note" style="margin:-6px 0 12px">' + (estimateIsOnOtherVisit(job) ? "This estimate was written on a visit that already has work or an invoice, so approval creates a new linked job (#" + esc(nextJobId(state.jobs)) + ")." : "Approval turns job #" + esc(job.id) + " into the approved job.") + " Scope, PDF link, and parts for the approved options move to the job.</div>" +
      '<button data-pin class="btn teal" ' + act("confirmApproveEst") + ">Confirm approval</button>"
    );
  }
  function scopeEditSheet(job) {
    const d = state.scopeDraft; if (!d) return "";
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Scope · ' + esc(d.estId) + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:8px">Saving makes a new Draft version. Earlier versions are kept.</div>' +
      '<label class="field"><textarea id="sc-text" rows="14" oninput="RT.setScopeText(this.value)">' + esc(d.text || "") + "</textarea></label>" +
      '<button data-pin class="btn teal" ' + act("saveScope") + ">Save as new Draft version</button>" +
      '<button class="btn ghost" style="margin-top:8px" ' + act("refineScope", d.estId) + ">Send to ReliaTech to refine</button>"
    );
  }
  function jobContextText(job) {
    const c = getCustomer(job.customerId);
    const lines = ["ReliaTech job #" + job.id + " · " + (job.customer || ""), "Address: " + [job.address, job.city].filter(Boolean).join(", "), "Status: " + ((STATUS[job.status] || {}).label || job.status), "Problem: " + (job.problem || "")];
    const addr = job.addressId ? getAddressById(job.addressId) : (c ? primaryAddress(c) : null);
    const assets = (addr && addr.assets) || [];
    if (assets.length) lines.push("Equipment: " + assets.map(function (a) { return [equipmentTypeLabel(a), a.make, a.model, a.location].filter(Boolean).join(" "); }).join("; "));
    const sets = job.readingSets || [];
    if (sets.length) lines.push("Latest readings: " + (sets[sets.length - 1].label || "") + " (" + Object.keys(sets[sets.length - 1].values || {}).length + " values in the app)");
    if (job.estimateId) lines.push("Estimate: " + job.estimateId + " · " + money(job.total || 0));
    if (jobParts(job).length) lines.push("Parts: " + jobParts(job).map(function (p) { return (p.qty || 1) + "× " + p.name + " [" + p.status + "]"; }).join("; "));
    if (job.scope) lines.push("Approved scope:\n" + job.scope);
    return lines.join("\n");
  }
  function shareOrCopy(text, okMsg) {
    if (navigator.share && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
      navigator.share({ text: text }).catch(function () { copyText(text, okMsg); });
      return;
    }
    copyText(text, okMsg);
  }
  function askSheetHandoff(job) {
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Ask ReliaTech</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="note" style="margin:0 0 10px">The app can’t message your ReliaTech assistant directly yet. Type your question, tap Copy, then paste it into your ReliaTech chat. The job details are included.</div>' +
      '<label class="field"><div class="field-lab">Your question</div><textarea id="ask-q" rows="4" placeholder="e.g. Board shows code 33, what should I check?" oninput="RT.setAskText(this.value)">' + esc(state.askText || "") + "</textarea></label>" +
      '<div class="field-lab">Job details that go with it</div><div class="doc" style="white-space:pre-wrap;font-size:12px;line-height:17px">' + esc(jobContextText(job)) + "</div>" +
      '<button data-pin class="btn teal" ' + act("askCopy") + ">Copy for ReliaTech chat</button>" +
      '<button class="btn ghost" style="margin-top:8px" ' + act("askShare") + ">Share…</button>"
    );
  }
  function printEstimateHtml(job, rec, sc) {
    const party = billToCustomer(job) || {};
    const opts = estimateOptions(rec);
    const rows = opts.map(function (o) { return "<tr><td>Option " + o.n + " · " + esc(o.label) + '</td><td style="text-align:right">' + money(o.amount) + "</td></tr>"; }).join("") +
      estimateDiscounts(rec).map(function (l) { return "<tr><td>" + esc(l.label) + '</td><td style="text-align:right">' + money(Number(l.amount)) + "</td></tr>"; }).join("");
    return "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>ReliaTech Estimate " + esc(rec.id) + "</title>" +
      "<style>body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#111;margin:32px;font-size:13px}h1{color:#0B3A4F;margin:0}table{width:100%;border-collapse:collapse;margin:16px 0}td{border-bottom:1px solid #ddd;padding:8px 4px}.scope{white-space:pre-wrap;line-height:1.5}.k{color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.5px}</style></head><body>" +
      "<h1>ReliaTech Services</h1><div class='k'>Estimate " + esc(rec.id) + " · scope v" + sc.v + " (Final)</div>" +
      "<p><b>Prepared for</b><br>" + esc(party.name || job.customer) + "<br>" + esc([job.address, job.city].filter(Boolean).join(", ")) + "</p>" +
      "<table>" + rows + "</table><div class='k'>Scope of work</div><div class='scope'>" + esc(sc.text) + "</div>" +
      "<p style='margin-top:24px'>Approved by: ______________________ &nbsp; Date: __________</p>" +
      "<script>setTimeout(function(){window.print()},400)<\/script></body></html>";
  }
  function applyEstimateApproval(job, rec, d) {
    const opts = estimateOptions(rec).filter(function (o) { return d.options.indexOf(o.n) !== -1; });
    const total = approvedTotal(rec, d.options);
    const sc = latestScope(rec, true) || latestScope(rec, false);
    const linked = estimateIsOnOtherVisit(job);
    let target = job;
    const result = { mode: linked ? "linked" : "converted", jobId: job.id, prev: null, addedPartIds: [] };
    if (linked) {
      const nid = nextJobId(state.jobs);
      target = {
        id: nid, customerId: job.customerId, customer: job.customer, address: job.address, city: job.city, phone: job.phone,
        addressId: job.addressId, billToCustomerId: rec.billToCustomerId || job.billToCustomerId, problem: opts.map(function (o) { return o.label; }).join(" + ") || job.problem,
        status: "approved", lineItems: [], total: 0, readingSets: [], timeline: [], estimates: [], linkedFromJobId: job.id, linkedEstimateId: rec.id, customerRef: "", referredBy: ""
      };
      state.jobs = [target].concat(state.jobs);
      job.linkedJobIds = (job.linkedJobIds || []).concat([nid]);
      result.jobId = nid;
    } else {
      result.prev = { status: job.status, lineItems: JSON.parse(JSON.stringify(job.lineItems || [])), total: job.total, scope: job.scope || null, pdfUrl: job.pdfUrl || null };
    }
    const approvedLines = (rec.lineItems || []).filter(function (l, i) {
      if (opts.some(function (o) { return o.idx === i; })) return true;
      if (Number(l.amount) < 0) { const all = opts.length === estimateOptions(rec).length && opts.length > 1; return !/if (both|all)/i.test(l.label || "") || all; }
      return false;
    });
    target.lineItems = JSON.parse(JSON.stringify(approvedLines));
    target.total = total;
    target.status = "approved";
    target.approvedEstimateId = rec.id;
    target.scope = sc ? sc.text : "";
    target.scopeVersion = sc ? sc.v : null;
    target.pdfUrl = rec.pdfUrl || "";
    const list = jobParts(target).slice();
    opts.forEach(function (o) {
      (o.parts || []).forEach(function (p, k) {
        if (list.some(function (x) { return normalizeName(x.name) === normalizeName(p.name) || (p.partNo && x.partNo && normalizeName(x.partNo) === normalizeName(p.partNo)); })) return;
        const id = "pt" + Date.now() + "-" + o.n + "-" + k;
        list.push({ id: id, name: p.name, partNo: p.partNo || "", qty: p.qty || 1, cost: p.cost != null && p.cost !== "" ? Number(p.cost) : null, costUnverified: !!p.costUnverified, note: p.note || "", branchId: "", status: "needed", po: "", fromEstimate: true });
        result.addedPartIds.push(id);
      });
    });
    target.parts = list;
    target.timeline = [t("tapp" + Date.now(), "system", "Just now", "Estimate " + rec.id + " approved", opts.map(function (o) { return "Option " + o.n + " " + o.label; }).join("; ") + " · " + money(total) + " · " + d.method + " · " + (d.by || ""))].concat(target.timeline || []);
    if (linked) job.timeline = [t("tlink" + Date.now(), "system", "Just now", "Approved work moved to #" + target.id, "Estimate " + rec.id + " approved. New linked job #" + target.id + ".")].concat(job.timeline || []);
    rec.approval = { options: d.options.slice(), by: d.by || "", method: d.method, at: isoNow(), code: d.code || "", codeVerified: !!d.codeVerified, total: total, result: result };
    return target;
  }
  function undoEstimateApproval(job, rec) {
    const ap = rec.approval; if (!ap) return "Not approved";
    const r = ap.result || {};
    if (r.mode === "linked") {
      const lj = getJob(r.jobId);
      if (lj && (jobTimeEntries(lj).length || lj.invoiceId || jobParts(lj).some(function (p) { return p.status !== "needed"; }))) return "Job #" + r.jobId + " already has time, an invoice, or ordered parts. Undo on that job by hand.";
      state.jobs = state.jobs.filter(function (x) { return x.id !== r.jobId; });
      job.linkedJobIds = (job.linkedJobIds || []).filter(function (x) { return x !== r.jobId; });
    } else {
      if (jobTimeEntries(job).length || job.invoiceId) return "This job already has time or an invoice. Undo by hand.";
      if (r.prev) { job.status = r.prev.status; job.lineItems = r.prev.lineItems; job.total = r.prev.total; job.scope = r.prev.scope || undefined; job.pdfUrl = r.prev.pdfUrl || undefined; }
      job.parts = jobParts(job).filter(function (p) { return (r.addedPartIds || []).indexOf(p.id) === -1 || p.status !== "needed"; });
      delete job.approvedEstimateId; delete job.scopeVersion;
    }
    job.timeline = [t("tundo" + Date.now(), "system", "Just now", "Approval of " + rec.id + " undone", "Recorded approval removed.")].concat(job.timeline || []);
    delete rec.approval;
    return "";
  }
  function readApprovalPaste(rec, d) {
    const txt = String(d.paste || "");
    const m = txt.match(/(\d{5}-E\d{2})\.([\d-]+)\.([A-Z2-9]{5})/);
    if (!m) { d.codeMsg = "No approval code found. It looks like 55720-E01.1-2.K7Q2X."; return; }
    if (m[1] !== rec.id) { d.codeMsg = "That code is for " + m[1] + ", not " + rec.id + "."; return; }
    const nums = m[2].split("-").map(Number).filter(function (n) { return n > 0; });
    const nm = (txt.match(/Name:\s*(.+)/i) || [])[1] || d.by || "";
    d.options = nums; d.code = m[0]; if (nm) d.by = nm.trim();
    d.codeVerified = approvalCode(rec.id, nums, d.by) === m[0];
    d.codeMsg = d.codeVerified ? "Code checks out for " + d.by + ": options " + nums.join(" and ") + "." : "Options read (" + nums.join(", ") + "), but the code doesn’t match the name “" + (d.by || "") + "”. Check the name, or record it anyway as not verified.";
  }
  Object.assign(window.RT, {
    setApproveField: function (k, v) { if (state.approveDraft) state.approveDraft[k] = v; },
    setScopeText: function (v) { if (state.scopeDraft) state.scopeDraft.text = v; },
    setAskText: function (v) { state.askText = v; }
  });
  function handlePrePhase2(name, arg) {
    const job = getJob(state.openJobId);
    if (name === "openApproveEst") {
      const rec = job && currentEstimateRec(job, arg); if (!rec) return true;
      state.approveDraft = { estId: rec.id, method: "In person", options: estimateOptions(rec).map(function (o) { return o.n; }), by: (billToCustomer(job) || {}).name || job.customer, paste: "", code: "", codeVerified: false, codeMsg: "" };
      state.sheet = "approveEst"; render(); return true;
    }
    if (name === "approveMethod") { if (state.approveDraft) state.approveDraft.method = arg; render(); return true; }
    if (name === "approveToggleOpt") {
      const d = state.approveDraft; if (!d) return true; const n = Number(arg);
      d.options = d.options.indexOf(n) === -1 ? d.options.concat([n]) : d.options.filter(function (x) { return x !== n; });
      render(); return true;
    }
    if (name === "readApprovalCode") { const d = state.approveDraft; const rec = job && d && currentEstimateRec(job, d.estId); if (rec) readApprovalPaste(rec, d); render(); return true; }
    if (name === "confirmApproveEst") {
      const d = state.approveDraft; const rec = job && d && currentEstimateRec(job, d.estId); if (!rec) return true;
      if (!d.options.length) { showToast("Pick at least one option"); return true; }
      if (!String(d.by || "").trim()) { showToast("Enter who approved it"); return true; }
      if (rec.approval) { showToast("Already approved"); return true; }
      if (!window.confirm("Record approval of " + rec.id + " for " + money(approvedTotal(rec, d.options)) + "? Nothing is sent to the customer.")) return true;
      const target = applyEstimateApproval(job, rec, d);
      state.approveDraft = null; state.sheet = null; state.openJobId = target.id;
      showToast(target.id === job.id ? "Approved · job #" + job.id + " is ready to schedule" : "Approved · new linked job #" + target.id);
      return true;
    }
    if (name === "undoApproval") {
      const rec = job && currentEstimateRec(job, arg); if (!rec) return true;
      if (!window.confirm("Undo the recorded approval of " + rec.id + "?")) return true;
      const err = undoEstimateApproval(job, rec);
      if (err) { showToast(err); return true; }
      render(); showToast("Approval undone"); return true;
    }
    if (name === "openLinkedJob") { state.sheet = null; state.openJobId = arg; render(); return true; }
    if (name === "copyApprovalLink") { const rec = job && currentEstimateRec(job, arg); if (rec) copyText(customerApprovalUrl(job, rec), "Approval link copied. Nothing was sent."); return true; }
    if (name === "shareApprovalLink") { const rec = job && currentEstimateRec(job, arg); if (rec) shareOrCopy(approvalLinkMessage(job, rec), "Message copied. Paste it into a text to the customer."); return true; }
    if (name === "editScope") {
      const rec = job && currentEstimateRec(job, arg); if (!rec) return true;
      const cur = latestScope(rec, false);
      state.scopeDraft = { estId: rec.id, text: cur ? cur.text : "" };
      state.sheet = "scopeEdit"; render(); return true;
    }
    if (name === "saveScope") {
      const d = state.scopeDraft; const rec = job && d && currentEstimateRec(job, d.estId); if (!rec) return true;
      const text = String(d.text || "").trim(); if (!text) { showToast("Scope is empty"); return true; }
      const v = rec.scopeVersions || [];
      const last = v[v.length - 1];
      if (last && last.text === text) { showToast("No changes"); return true; }
      rec.scopeVersions = v.concat([{ v: (last ? last.v : 0) + 1, text: text, status: "Draft", at: isoNow() }]);
      state.scopeDraft = null; state.viewEstimateId = rec.id; state.sheet = "viewEstimate";
      showToast("Saved as v" + rec.scopeVersions[rec.scopeVersions.length - 1].v + " Draft"); return true;
    }
    if (name === "finalizeScope") {
      const rec = job && currentEstimateRec(job, arg); if (!rec) return true;
      const cur = latestScope(rec, false); if (!cur) return true;
      cur.status = "Final"; cur.finalAt = isoNow();
      if (rec.approval && job.approvedEstimateId === rec.id) { job.scope = cur.text; job.scopeVersion = cur.v; }
      render(); showToast("v" + cur.v + " marked Final"); return true;
    }
    if (name === "refineScope") {
      const rec = job && currentEstimateRec(job, arg); if (!rec) return true;
      const text = (state.scopeDraft && state.scopeDraft.estId === rec.id && state.scopeDraft.text) || ((latestScope(rec, false) || {}).text) || "";
      const cur = latestScope(rec, false);
      const msg = "Please refine the scope for estimate " + rec.id + (cur ? " (currently v" + cur.v + " " + cur.status + ")" : "") + ".\n\n" + jobContextText(job) + "\n\nOptions:\n" + estimateOptions(rec).map(function (o) { return "Option " + o.n + ": " + o.label + " " + money(o.amount); }).join("\n") + "\n\nCurrent scope:\n" + text + "\n\nMy notes: ";
      shareOrCopy(msg, "Copied. Paste into your ReliaTech chat, add notes, and paste the reply back as a new version.");
      return true;
    }
    if (name === "printEstimate") {
      const rec = job && currentEstimateRec(job, arg); const sc = rec && latestScope(rec, true);
      if (!sc) { showToast("Mark a version Final first"); return true; }
      const w = window.open("", "_blank");
      if (!w) { showToast("Allow pop-ups to print"); return true; }
      w.document.open(); w.document.write(printEstimateHtml(job, rec, sc)); w.document.close();
      return true;
    }
    if (name === "askCopy") { if (job) copyText(String(state.askText || "").trim() + "\n\n" + jobContextText(job), "Copied. Paste into your ReliaTech chat."); return true; }
    if (name === "askShare") { if (job) shareOrCopy(String(state.askText || "").trim() + "\n\n" + jobContextText(job), "Copied. Paste into your ReliaTech chat."); return true; }
    if (name === "assetLocation") {
      if (!state.assetDraft) return true;
      if (arg === "Other") { state.assetDraft.locOther = true; if (EQUIPMENT_LOCATIONS.indexOf(state.assetDraft.location) !== -1) state.assetDraft.location = ""; }
      else { state.assetDraft.locOther = false; state.assetDraft.location = arg; }
      render();
      if (arg === "Other") { const el = document.getElementById("eq-location"); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }
      return true;
    }
    return false;
  }

  function handlePhase1(name, arg) {
    const job = getJob(state.openJobId);
    if (name === "addPart") { state.partDraft = { isNew: true, name: "", partNo: "", qty: 1, branchId: "", status: "needed" }; state.sheet = "part"; render(); return true; }
    if (name === "editPart") {
      const x = jobParts(job).find(function (p) { return p.id === arg; }); if (!x) return true;
      state.partDraft = Object.assign({ isNew: false }, JSON.parse(JSON.stringify(x))); state.sheet = "part"; render(); return true;
    }
    if (name === "partStatus") { if (state.partDraft) state.partDraft.status = arg; render(); return true; }
    if (name === "savePart") {
      const d = state.partDraft; if (!d || !job) return true;
      if (!String(d.name || "").trim()) { showToast("Enter the part name"); return true; }
      const rec = { id: d.id || ("pt" + Date.now()), name: String(d.name).trim(), partNo: String(d.partNo || "").trim(), qty: Number(d.qty) > 0 ? Number(d.qty) : 1, cost: d.cost != null ? d.cost : null, costUnverified: !!d.costUnverified, note: d.note || "", branchId: d.branchId || "", status: d.status || "needed", po: d.po || "", fromEstimate: !!d.fromEstimate };
      if (rec.status === "received" && !d.receivedAt) rec.receivedAt = isoNow(); else if (d.receivedAt) rec.receivedAt = d.receivedAt;
      const list = jobParts(job).slice();
      const i = list.findIndex(function (p) { return p.id === rec.id; });
      if (i === -1) list.push(rec); else list[i] = rec;
      job.parts = list;
      state.partDraft = null; state.sheet = null;
      showToast("Part saved"); return true;
    }
    if (name === "deletePart") {
      const d = state.partDraft; if (!d || !job) return true;
      job.parts = jobParts(job).filter(function (p) { return p.id !== d.id; });
      state.partDraft = null; state.sheet = null; showToast("Part removed"); return true;
    }
    if (name === "partsFromEstimate") {
      if (!job) return true;
      const lines = estimatePartLines(job);
      const list = jobParts(job).slice();
      let added = 0;
      lines.forEach(function (l, i) {
        const label = l.name;
        if (list.some(function (p) { return normalizeName(p.name) === normalizeName(label) || (l.partNo && p.partNo && normalizeName(p.partNo) === normalizeName(l.partNo)); })) return;
        list.push({ id: "pt" + Date.now() + "-" + i, name: label, partNo: l.partNo || "", qty: l.qty || 1, cost: l.cost != null && l.cost !== "" ? Number(l.cost) : null, costUnverified: !!l.costUnverified, note: l.note || "", branchId: "", status: "needed", po: "", fromEstimate: true });
        added++;
      });
      job.parts = list;
      showToast(added ? "Added " + added + " part" + (added > 1 ? "s" : "") + " from the estimate" : (lines.length ? "All estimate parts are already on the list" : "No part or equipment lines on this estimate. Add parts with + Add part."));
      return true;
    }
    if (name === "openPo") {
      if (!job) return true;
      const needed = jobParts(job).filter(function (p) { return p.status === "needed"; });
      const firstBranch = (needed.find(function (p) { return p.branchId; }) || {}).branchId || ((state.vendors || [])[0] || {}).id || "";
      state.poDraft = { po: nextPoNumber(job), branchId: firstBranch, delivery: false };
      state.sheet = "po"; render(); return true;
    }
    if (name === "poBranch") { if (state.poDraft) state.poDraft.branchId = arg; render(); return true; }
    if (name === "poDelivery") { if (state.poDraft) state.poDraft.delivery = arg === "1"; render(); return true; }
    if (name === "copyPo") { if (job && state.poDraft) copyText(poText(job, state.poDraft), "PO text copied"); return true; }
    if (name === "markPoOrdered") {
      const d = state.poDraft; if (!d || !job) return true;
      const ids = poParts(job, d).map(function (p) { return p.id; });
      job.parts = jobParts(job).map(function (p) { return ids.indexOf(p.id) === -1 ? p : Object.assign({}, p, { status: "ordered", po: d.po, branchId: p.branchId || d.branchId, orderedAt: isoNow() }); });
      job.poSeq = (Number(job.poSeq) || 0) + 1;
      const v = vendorById(d.branchId);
      job.timeline = [t("tpo" + Date.now(), "system", "Just now", "PO " + d.po + " ordered", ids.length + " part" + (ids.length > 1 ? "s" : "") + (v ? " from " + v.name : "") + (d.delivery ? " · delivery" : " · will-call"))].concat(job.timeline || []);
      state.poDraft = null; state.sheet = null; showToast("Marked ordered on " + d.po); return true;
    }
    if (name === "addVendor") { state.vendorDraft = { isNew: true, name: "", email: "", phone: "", account: "", buys: "" }; state.sheet = "vendor"; render(); return true; }
    if (name === "editVendor") { const v = vendorById(arg); if (!v) return true; state.vendorDraft = Object.assign({ isNew: false }, v); state.sheet = "vendor"; render(); return true; }
    if (name === "saveVendor") {
      const d = state.vendorDraft; if (!d) return true;
      if (!String(d.name || "").trim()) { showToast("Enter the branch name"); return true; }
      const rec = { id: d.id || ("vd" + Date.now()), name: String(d.name).trim(), email: String(d.email || "").trim(), phone: String(d.phone || "").trim(), account: String(d.account || "").trim(), buys: String(d.buys || "").trim() };
      const list = (state.vendors || []).slice();
      const i = list.findIndex(function (v) { return v.id === rec.id; });
      if (i === -1) list.push(rec); else list[i] = rec;
      state.vendors = list; state.vendorDraft = null; state.sheet = null; showToast("Branch saved"); return true;
    }
    if (name === "deleteVendor") {
      const d = state.vendorDraft; if (!d) return true;
      if (!window.confirm("Remove " + (d.name || "this branch") + "?")) return true;
      state.vendors = (state.vendors || []).filter(function (v) { return v.id !== d.id; });
      state.vendorDraft = null; state.sheet = null; showToast("Branch removed"); return true;
    }
    if (name === "exportData") { downloadBackup(); return true; }
    if (name === "mergeTech") {
      const p = String(arg).split("||"); const drop = p[0], keep = p[1];
      if (!window.confirm("Merge " + drop + " into " + keep + "? Clock-ins move to " + keep + ".")) return true;
      const keepRec = (state.techRecords || []).find(function (r) { return r.name === keep; });
      const dropRec = (state.techRecords || []).find(function (r) { return r.name === drop; });
      if (!keepRec || !dropRec || keep === DEFAULT_TECH && drop === DEFAULT_TECH) return true;
      if (drop === DEFAULT_TECH) { showToast("Steve stays as the admin. Keep Steve instead."); return true; }
      remapTechName(drop, keep);
      state.techRecords = state.techRecords.filter(function (r) { return r !== dropRec; });
      state.techs = techNamesFrom(state.techRecords);
      showToast("Merged " + drop + " into " + keep); return true;
    }
    if (name === "mergeCustomer") {
      const p = String(arg).split("||"); const keepId = p[0], dropId = p[1];
      const k = getCustomer(keepId), d = getCustomer(dropId); if (!k || !d) return true;
      if (!window.confirm("Merge " + d.name + " into " + k.name + "? Jobs, plans, and addresses move to " + k.name + ".")) return true;
      mergeCustomerInto(keepId, dropId);
      showToast("Merged into " + k.name); return true;
    }
    if (name === "dashList") { state.screen = "dashList"; state.dashListKey = arg; state.openJobId = null; state.openCustomerId = null; state.openAddressId = null; render(); return true; }
    if (name === "closeDashList") { state.screen = null; state.tab = "home"; render(); return true; }
    if (name === "dashOpenJob") {
      const parts = String(arg || "").split("|");
      const j = getJob(parts[0]);
      if (!j) { showToast("That job isn’t on this device"); return true; }
      state.screen = null; state.openCustomerId = null; state.openAddressId = null; state.openJobId = j.id;
      const sec = parts[1] || "";
      if (sec === "invoice" && (j.invoiceId || j.status === "invoiced" || j.status === "paid")) { state.sheet = "invoice"; }
      else if (sec === "parts") state._scrollTo = "job-parts";
      else if (sec === "estimate") state._scrollTo = "job-estimates";
      render(); return true;
    }
    if (name === "dashToggleProspects") { state._dashAllProspects = !state._dashAllProspects; render(); return true; }
    return false;
  }

  /* ——— Phase 1: Home dashboard ——— */
  const DAY_MS = 24 * 60 * 60 * 1000;
  function daysFromToday(d) { return d ? Math.floor((d.getTime() - startOfTodayLocal().getTime()) / DAY_MS) : null; }
  function jobPaidDate(job) {
    if (job.paidDate) { const d = ymdToLocalDate(job.paidDate) || parseLooseDate(job.paidDate); if (d) return d; }
    const ev = (job.timeline || []).find(function (x) { return x && /paid/i.test(x.title || "") && x.time; });
    return ev ? parseLooseDate(ev.time) : null;
  }
  function lastVisitDate(c) {
    let best = null;
    jobsForCustomer(c).forEach(function (j) {
      if (j.status === "superseded" || j.supersededBy) return;
      const d = jobScheduleDate(j);
      if (d && d.getTime() <= Date.now() && (!best || d > best)) best = d;
    });
    return best;
  }
  function hasActivePlan(cid) {
    return plansForCustomer(cid).some(function (p) { return p.status === "active" && !/^offer/.test(p.type || ""); });
  }
  function dashItem(title, sub, right, actName, arg, tone) {
    const color = tone === "red" ? "#B42318" : tone === "amber" ? "#9A6700" : "";
    return '<button class="list-card" ' + act(actName, arg) + ' style="' + (tone === "red" ? "border-left:4px solid #D92D20;" : tone === "amber" ? "border-left:4px solid #D49A12;" : "") + '"><div class="job-body">' +
      '<div class="row"><div class="job-name" style="font-size:15px">' + esc(title) + "</div>" + (right ? '<div class="meta" style="' + (color ? "color:" + color + ";font-weight:700" : "") + '">' + right + "</div>" : "") + "</div>" +
      (sub ? '<div class="job-prob"' + (color ? ' style="color:' + color + '"' : "") + ">" + sub + "</div>" : "") + "</div></button>";
  }
  function dashEmpty(msg) { return '<div class="muted" style="margin:0 2px 12px">' + esc(msg) + "</div>"; }
  function dashData() {
    const today = startOfTodayLocal();
    const weekEnd = new Date(today.getTime() + 7 * DAY_MS);
    const active = (state.jobs || []).filter(isActiveJob);
    // Upcoming work
    const upcoming = active.filter(function (j) {
      if (j.status === "estimate") return false;
      if (isInProgressWork(j)) return true;
      if (isUnscheduledNewCall(j)) return true;
      if (j.planJob) return false;
      const d = jobScheduleDate(j);
      return d && d.getTime() >= today.getTime() && d.getTime() < weekEnd.getTime();
    }).sort(function (a, b) {
      const da = jobScheduleDate(a), db = jobScheduleDate(b);
      return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
    });
    const todays = upcoming.filter(function (j) { const n = daysFromToday(jobScheduleDate(j)); return n === 0; });
    const weekVisits = (state.visits || []).filter(function (v) {
      if (visitStatus(v) !== "scheduled") return false;
      const d = parseStamp(v.scheduledStart);
      return d && d.getTime() >= today.getTime() && d.getTime() < weekEnd.getTime();
    });
    // Parts alerts
    const partAlerts = [];
    const onOrder = [];
    active.forEach(function (j) {
      const parts = jobParts(j); if (!parts.length) return;
      const n = daysFromToday(jobScheduleDate(j));
      const soon = j.status === "progress" || anyOpenEntry(j) || (n != null && n <= 3);
      const needed = parts.filter(function (p) { return p.status === "needed"; });
      const ordered = parts.filter(function (p) { return p.status === "ordered"; });
      if (needed.length) partAlerts.push({ j: j, text: needed.length + " part" + (needed.length > 1 ? "s" : "") + " not ordered", red: soon, n: n });
      if (ordered.length) {
        const late = n != null && n <= 1;
        if (late) partAlerts.push({ j: j, text: ordered.length + " on order, not received yet", red: true, n: n });
        ordered.forEach(function (p) { onOrder.push({ j: j, p: p }); });
      }
    });
    partAlerts.sort(function (a, b) { return (b.red ? 1 : 0) - (a.red ? 1 : 0) || ((a.n == null ? 999 : a.n) - (b.n == null ? 999 : b.n)); });
    // Money
    const estimates = active.filter(function (j) { return j.status === "estimate"; }).map(function (j) {
      const e = (j.estimates || []).filter(function (x) { return !x.superseded; }).slice(-1)[0];
      const sent = e && e.createdAt ? parseStamp(e.createdAt) : null;
      return { j: j, age: sent ? -daysFromToday(sent) : null };
    });
    const unpaid = (state.jobs || []).concat(state.moneyJobs || []).filter(isPayable);
    const unpaidTotal = unpaid.reduce(function (s, j) { return s + invoiceDue(j); }, 0);
    const estTotal = estimates.reduce(function (s, x) { return s + (Number(x.j.total) || 0); }, 0);
    // Plans
    const in30 = new Date(today.getTime() + 30 * DAY_MS);
    const renewals = (state.plans || []).filter(function (p) {
      if (p.status !== "active" || !p.renewalDate) return false;
      const d = ymdToLocalDate(p.renewalDate);
      return d && d.getTime() < in30.getTime() && d.getTime() >= today.getTime() - 60 * DAY_MS;
    });
    const dueVisits = attentionVisits();
    const noPlan = (state.customers || []).filter(function (c) { return !hasActivePlan(c.id); }).map(function (c) {
      return { c: c, last: lastVisitDate(c) };
    }).filter(function (x) { return !!x.last; }).sort(function (a, b) { return b.last - a.last; });
    // This month
    const now = tzParts(new Date());
    const monthStart = new Date(Number(now.year), Number(now.month) - 1, 1);
    const paidThisMonth = (state.jobs || []).concat(state.moneyJobs || []).filter(function (j) {
      if (j.status !== "paid") return false;
      const d = jobPaidDate(j);
      return d && d.getTime() >= monthStart.getTime();
    });
    const seen = {};
    const paidUnique = paidThisMonth.filter(function (j) { if (seen[j.id]) return false; seen[j.id] = true; return true; });
    const sales = paidUnique.reduce(function (s, j) { return s + (Number(j.total) || 0); }, 0);
    const estJobs = (state.jobs || []).filter(function (j) { return (j.estimateId || (j.estimates || []).length) && j.status !== "superseded" && !j.supersededBy; });
    const won = estJobs.filter(function (j) { return ["approved", "progress", "done", "invoiced", "paid"].indexOf(j.status) !== -1; });
    const hourJobs = (state.jobs || []).filter(function (j) { return loggedHours(j) > 0 && billedLaborHours(j) > 0; });
    const bidH = hourJobs.reduce(function (s, j) { return s + billedLaborHours(j); }, 0);
    const actH = hourJobs.reduce(function (s, j) { return s + loggedHours(j); }, 0);

    return { today: today, upcoming: upcoming, todays: todays, weekVisits: weekVisits, partAlerts: partAlerts, onOrder: onOrder, estimates: estimates, unpaid: unpaid, unpaidTotal: unpaidTotal, estTotal: estTotal, renewals: renewals, dueVisits: dueVisits, noPlan: noPlan, paidUnique: paidUnique, sales: sales, estJobs: estJobs, won: won, hourJobs: hourJobs, bidH: bidH, actH: actH };
  }
  function dashboardScreen() {
    const D = dashData();
    const today = D.today, upcoming = D.upcoming, todays = D.todays, weekVisits = D.weekVisits, partAlerts = D.partAlerts, onOrder = D.onOrder, estimates = D.estimates, unpaid = D.unpaid, unpaidTotal = D.unpaidTotal, estTotal = D.estTotal, renewals = D.renewals, dueVisits = D.dueVisits, noPlan = D.noPlan, paidUnique = D.paidUnique, sales = D.sales, estJobs = D.estJobs, won = D.won, hourJobs = D.hourJobs, bidH = D.bidH, actH = D.actH;
    const showAll = !!state._dashAllProspects;
    const L = dashListItems(D);
    function tile(key, label, val, meta, extra) {
      return '<button class="money-tile dash-tile" style="' + (extra || "") + '" ' + act("dashList", key) + '><div class="k-up">' + esc(label) + '</div><div class="money-val" style="font-size:22px">' + val + "</div>" + (meta ? '<div class="meta">' + meta + "</div>" : "") + "</button>";
    }
    function head(label, key, count) {
      return '<div class="section-row"><div class="section" style="margin:0">' + esc(label) + "</div>" +
        (count === 0 ? "" : '<button class="link-btn tap" style="margin:0" ' + act("dashList", key) + ">" + (count != null ? "See all " + count + " ›" : "Open ›") + "</button>") + "</div>";
    }
    function preview(key, n, emptyMsg) {
      const items = L[key].items;
      if (!items.length) return dashEmpty(emptyMsg || L[key].empty);
      return '<div class="stack" style="margin-bottom:12px">' + items.slice(0, n).join("") + "</div>" +
        (items.length > n ? '<button class="link-btn tap" style="margin:-4px 2px 12px" ' + act("dashList", key) + ">Show all " + items.length + " ›</button>" : "");
    }
    let h = "";
    h += head("Upcoming work", "week", L.week.items.length);
    h += '<div style="display:flex;gap:10px;margin-bottom:10px">' +
      tile("today", "Today", String(todays.length), "Tap for today’s jobs", "flex:1") +
      tile("week", "Active / this week", String(upcoming.length + weekVisits.length), "Tap for the list", "flex:1") + "</div>";
    h += preview("week", 5);
    h += head("Parts to order or chase", "partsAlerts", L.partsAlerts.items.length);
    h += preview("partsAlerts", 5);
    h += head("Parts and equipment on order", "onOrder", L.onOrder.items.length);
    h += preview("onOrder", 4);
    h += '<div class="section">Money</div>';
    h += '<div style="display:flex;gap:10px;margin-bottom:10px">' +
      tile("unpaid", "Unpaid", money(unpaidTotal), unpaid.length + " invoice" + (unpaid.length === 1 ? "" : "s"), "flex:1") +
      tile("estimates", "Open estimates", money(estTotal), estimates.length + " to follow up", "flex:1") + "</div>";
    h += head("Estimates to follow up", "estimates", L.estimates.items.length);
    h += preview("estimates", 4);
    h += head("Unpaid invoices", "unpaid", L.unpaid.items.length);
    h += preview("unpaid", 4);
    h += head("Plan renewals (next 30 days)", "renewals", L.renewals.items.length);
    h += preview("renewals", 4);
    h += dueVisits.length ? '<button class="list-card" style="margin-bottom:12px" ' + act("openPlans") + '><div class="job-body"><div class="row"><div class="job-name" style="font-size:15px">Plan visits to schedule</div><div class="meta" style="color:#9A6700;font-weight:700">' + dueVisits.length + '</div></div><div class="job-prob">Due or overdue · tap to see and schedule them</div></div></button>' : "";
    h += head("Past customers without a plan", "noPlan", noPlan.length);
    h += preview("noPlan", 5);
    h += '<div class="section">This month</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
      tile("paid", "Sales (paid)", money(sales), "Tap for paid jobs") +
      tile("paid", "Closed jobs", String(paidUnique.length), "Tap for the list") +
      tile("estJobs", "Estimate win rate", estJobs.length ? Math.round(won.length / estJobs.length * 100) + "%" : "—", estJobs.length ? won.length + " of " + estJobs.length + " (all time)" : "No estimates yet") +
      tile("hours", "Bid vs actual hrs", hourJobs.length ? formatHours(bidH) + " / " + formatHours(actH) : "—", hourJobs.length ? hourJobs.length + " job" + (hourJobs.length > 1 ? "s" : "") + " with clocked time" : "Starts once techs clock in") + "</div>";
    return topBar({ kicker: "ReliaTech Services", title: "Home", badge: SHOW_SAMPLE_BADGE, settings: true }) +
      '<div class="content"><div class="pad pad-fab">' + h + "</div></div>" +
      '<button class="fab" ' + act("openNewCall") + ' aria-label="New call">' + icon("plus", 28) + "</button>" +
      tabBar();
  }
  function jobItem(j, sub, right, section, tone) {
    return dashItem("#" + j.id + " · " + j.customer, sub, right, "dashOpenJob", j.id + "|" + (section || ""), tone);
  }
  function dashListItems(D) {
    const L = {};
    function whenOf(j) { const d = jobScheduleDate(j); return isInProgressWork(j) ? "In progress" : (d ? esc(formatPrettyDateTime(d.toISOString())) : "No date"); }
    function upcomingItem(j) {
      const d = jobScheduleDate(j);
      const miss = jobParts(j).some(function (p) { return p.status !== "received"; });
      const n = daysFromToday(d);
      return jobItem(j, esc(j.problem || "") + (miss ? " · parts not all in" : ""), whenOf(j), miss ? "parts" : "", miss && n != null && n <= 3 ? "red" : "");
    }
    function visitItem(v) {
      const c = getCustomer(v.customerId);
      return dashItem((c ? c.name : "Customer") + " · Plan visit", esc(v.label || ""), esc(formatPrettyDateTime(v.scheduledStart)), "openVisit", v.id, "");
    }
    L.today = { title: "Today’s jobs", empty: "Nothing scheduled today.", items: D.todays.map(upcomingItem) };
    L.week = { title: "Active and this week", empty: "Nothing scheduled in the next 7 days.", items: D.upcoming.map(upcomingItem).concat(D.weekVisits.map(visitItem)) };
    L.partsAlerts = { title: "Parts to order or chase", empty: "No parts waiting. Add parts on a job to track them here.", items: D.partAlerts.map(function (x) {
      return jobItem(x.j, esc(x.text), x.n == null ? "No date" : x.n <= 0 ? "Today" : "In " + x.n + " day" + (x.n > 1 ? "s" : ""), "parts", x.red ? "red" : "amber");
    }) };
    L.onOrder = { title: "Parts and equipment on order", empty: "Nothing on order.", items: D.onOrder.map(function (x) {
      const v = vendorById(x.p.branchId);
      return dashItem(x.p.name + (Number(x.p.qty) > 1 ? " × " + x.p.qty : ""), esc("#" + x.j.id + " · " + x.j.customer + (x.p.po ? " · PO " + x.p.po : "") + (v ? " · " + v.name : "")), "Ordered", "dashOpenJob", x.j.id + "|parts", "");
    }) };
    L.estimates = { title: "Open estimates", empty: "No open estimates.", items: D.estimates.map(function (x) {
      return jobItem(x.j, esc((x.j.estimateId || "Estimate") + " · " + (x.j.problem || "")), money(Number(x.j.total) || 0) + (x.age != null ? " · " + x.age + "d" : ""), "estimate", x.age != null && x.age >= 7 ? "amber" : "");
    }) };
    L.unpaid = { title: "Unpaid invoices", empty: "No unpaid invoices.", items: D.unpaid.map(function (j) {
      return jobItem(j, "Balance due · tap to open the invoice", money(invoiceDue(j)), "invoice", "amber");
    }) };
    L.renewals = { title: "Plan renewals (next 30 days)", empty: "No plan renewals due in the next 30 days.", items: D.renewals.map(function (p) {
      const c = getCustomer(p.customerId); const n = daysFromToday(ymdToLocalDate(p.renewalDate));
      return dashItem((c ? c.name : "Customer") + " · renewal", esc(p.name || "Plan") + " · " + esc(formatYmd(p.renewalDate)), n < 0 ? "Past due" : "In " + n + "d", "openCustomer", p.customerId, n < 0 ? "red" : "amber");
    }) };
    L.noPlan = { title: "Past customers without a plan", empty: "Every past customer has a plan.", items: D.noPlan.map(function (x) {
      return dashItem(x.c.name, esc((x.c.city || "") + (x.c.phone ? " · " + x.c.phone : "")), "Last visit " + esc(formatDate(x.last.toISOString())), "openCustomer", x.c.id, "");
    }) };
    L.paid = { title: "Paid this month", empty: "No paid jobs yet this month.", items: D.paidUnique.map(function (j) {
      const d = jobPaidDate(j);
      return jobItem(j, esc(j.problem || "") + (d ? " · paid " + esc(formatDate(d.toISOString())) : ""), money(Number(j.total) || 0), "invoice", "");
    }) };
    L.estJobs = { title: "Estimates (all time)", empty: "No estimates yet.", items: D.estJobs.map(function (j) {
      const st = STATUS[j.posted && j.status === "paid" ? "posted" : j.status] || STATUS.new;
      return jobItem(j, esc((j.estimateId || "") + " · " + (j.problem || "")), esc(st.label), "estimate", D.won.indexOf(j) !== -1 ? "" : "amber");
    }) };
    L.hours = { title: "Bid vs actual hours", empty: "No jobs with both bid hours and clocked time yet. This fills in once techs clock in on hourly jobs.", items: D.hourJobs.map(function (j) {
      return jobItem(j, "Bid " + formatHours(billedLaborHours(j)) + " · actual " + formatHours(loggedHours(j)), loggedHours(j) > billedLaborHours(j) ? "Over" : "Under", "", loggedHours(j) > billedLaborHours(j) ? "red" : "");
    }) };
    return L;
  }
  function dashListScreen() {
    const L = dashListItems(dashData());
    const x = L[state.dashListKey] || L.week;
    return topBar({ back: "closeDashList", title: x.title, badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      (x.items.length ? '<div class="stack">' + x.items.join("") + "</div>" : dashEmpty(x.empty)) +
      "</div></div>";
  }


  /* Phase 1 keyboard fix: while typing, patch the page in place instead of
     rebuilding it, so the focused field is never replaced. iPhone Safari resets
     the keyboard (back to letters) whenever a focused input is swapped out. */
  const NUMERIC_ID_RE = /^(cq-|pb-(cost|firstPrice|addOnPrice|laborHours)|pack-custom-amount|st-(defaultGp|minGp|refrigerantMinMarkup)|pt-(qty)|rd-val)/;
  const NOCAP_ID_RE = /^(np-(model|serial|filterSize|refrigerant)|nt-(amps|gas|pressures|shsc|static|temps|filterSize)|pb-sku|pt-(partNo)|eq-(model|serial)|vd-(email|account))/;
  function applyInputHints(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll("input, textarea").forEach(function (el) {
      const id = el.id || "";
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (type === "email" || type === "tel" || type === "search" || type === "url") {
        el.setAttribute("autocapitalize", "off"); el.setAttribute("autocorrect", "off"); el.setAttribute("spellcheck", "false");
      }
      if (NUMERIC_ID_RE.test(id) && !el.getAttribute("inputmode")) el.setAttribute("inputmode", "decimal");
      if (el.getAttribute("inputmode") === "decimal" || el.getAttribute("inputmode") === "numeric") {
        el.setAttribute("autocapitalize", "off"); el.setAttribute("autocorrect", "off"); el.setAttribute("spellcheck", "false"); el.setAttribute("autocomplete", "off");
      }
      if (NOCAP_ID_RE.test(id)) {
        el.setAttribute("autocapitalize", "characters"); el.setAttribute("autocorrect", "off"); el.setAttribute("spellcheck", "false");
      }
    });
  }
  function morphAttrs(a, b) {
    const keep = {};
    for (let i = 0; i < b.attributes.length; i++) {
      const at = b.attributes[i]; keep[at.name] = true;
      if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    }
    for (let i = a.attributes.length - 1; i >= 0; i--) {
      const n = a.attributes[i].name;
      if (!keep[n]) a.removeAttribute(n);
    }
  }
  function morphNode(a, b) {
    if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    morphAttrs(a, b);
    const tag = a.nodeName;
    const focused = a === document.activeElement;
    if (tag === "INPUT") {
      const type = (b.getAttribute("type") || "").toLowerCase();
      if (type === "checkbox" || type === "radio") a.checked = b.hasAttribute("checked");
      else if (type !== "file" && !focused && a.value !== (b.getAttribute("value") || "")) a.value = b.getAttribute("value") || "";
      return;
    }
    if (tag === "TEXTAREA") {
      if (!focused && a.value !== b.textContent) a.value = b.textContent;
      return;
    }
    morphChildren(a, b);
    if (tag === "SELECT" && !focused) {
      const opts = b.querySelectorAll("option");
      for (let i = 0; i < opts.length; i++) if (opts[i].hasAttribute("selected")) { a.selectedIndex = i; break; }
    }
  }
  function morphChildren(a, b) {
    const an = Array.prototype.slice.call(a.childNodes);
    const bn = Array.prototype.slice.call(b.childNodes);
    for (let i = 0; i < bn.length; i++) {
      const x = an[i], y = bn[i];
      if (!x) { a.appendChild(y.cloneNode(true)); continue; }
      const same = x.nodeType === y.nodeType && x.nodeName === y.nodeName &&
        (x.nodeType !== 1 || ((x.id || "") === (y.id || "") && (x.nodeName !== "INPUT" || (x.getAttribute("type") || "") === (y.getAttribute("type") || ""))));
      if (same) morphNode(x, y);
      else a.replaceChild(y.cloneNode(true), x);
    }
    for (let i = an.length - 1; i >= bn.length; i--) a.removeChild(an[i]);
  }
  function renderKeepFocus(id) {
    const el = document.getElementById(id);
    const root = document.getElementById("app");
    if (el && root && document.activeElement === el && typeof document.createElement("template").content !== "undefined") {
      try {
        const tpl = document.createElement("template");
        const toast = state.toast ? '<div class="toast">' + esc(state.toast) + "</div>" : "";
        tpl.innerHTML = mainHtml() + sheetHtml() + toast;
        applyInputHints(tpl.content);
        morphChildren(root, tpl.content);
        persist();
        ensureTimer();
        if (document.activeElement !== el) {
          const n = document.getElementById(id);
          if (n) n.focus();
        }
        return;
      } catch (e) { /* fall back to a full render */ }
    }
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
    const tabs = [["home", "Home", "home"], ["jobs", "Jobs", "jobs"], ["customers", "Customers", "customers"], ["pricebook", "Price book", "book"], ["money", "Money", "money"]];
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
        if (state.filter === "open") return j.status !== "paid" && j.status !== "superseded" && j.status !== "cancelled" && j.status !== "canceled" && !j.supersededBy;
        return j.status === state.filter;
      }
      if (mode === "unpaid") return unpaidBalanceJobs().some(function (u) { return u.id === j.id; });
      if (j.status === "estimate") return false;
      if (j.planJob && !isInProgressWork(j)) return false;
      return isBoardJob(j) || isUnscheduledNewCall(j);
    });
    list = mode === "unpaid" && !searching ? unpaidBalanceJobs() : sortJobsList(list);
    const due = boardPlanVisits();
    let dueHtml = "";
    if (!searching && mode === "board") {
      const prospects = planProspects();
      dueHtml = '<div class="section-row"><div class="section" style="margin:0">Plan visits – upcoming</div>' +
        '<button class="link-btn" style="margin:0" ' + act("openPlans") + ">See all plan visits</button></div>";
      if (due.length) dueHtml += '<div class="due-list">' + due.map(dueVisitCard).join("") + "</div>";
      else dueHtml += '<div class="muted" style="margin:-4px 0 14px">Nothing overdue or due in the next 14 days. Older and later visits are on See all plan visits and on each customer page.</div>';
      const openEst = state.jobs.filter(function (j) { return j.status === "estimate" && isActiveJob(j); });
      if (openEst.length) {
        dueHtml += '<div class="section-row"><div class="section" style="margin:0">Open estimates</div><div class="meta">Not jobs yet</div></div>' +
          '<div class="stack" style="margin-bottom:14px">' + openEst.map(jobCard).join("") + "</div>";
      }
      if (false && prospects.length) {
        dueHtml += '<div class="section-row"><div class="section" style="margin:0">Plan prospects</div></div>' +
          '<div class="due-list">' + prospects.map(function (pr) { return prospectCard(pr, { showCustomer: true, compact: true, clickable: true }); }).join("") + "</div>";
      }
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
      unfiledSection() +
      '<div class="jobs-toolbar"><div class="section" style="margin:0">' + heading + "</div>" + links + "</div>" +
      chips +
      '<div class="stack" style="margin-bottom:16px">' + (list.length ? list.map(jobCard).join("") : '<div class="muted">' + esc(empty) + "</div>") + "</div>" +
      dueHtml + "</div></div>" +
      '<button class="fab" ' + act("openNewCall") + ' aria-label="New call">' + icon("plus", 28) + "</button>" +
      tabBar();
  }
  function jobCard(job) {
    const st = STATUS[job.posted && job.status === "paid" ? "posted" : job.status] || STATUS.new, col = sc(job.posted && job.status === "paid" ? "posted" : (job.status || "new"));
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
    if (job && job.supersededBy) return pill("Replaced by " + job.supersededBy, col.text, col.bg);
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
      (function () {
        const prospects = planProspects();
        if (!prospects.length) return "";
        return '<div class="section">Plan prospects</div>' + prospects.map(function (pr) { return prospectCard(pr, { showCustomer: true, compact: false, clickable: true }); }).join("");
      })() +
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
      vendorsSection() +
      backupSection() +
      duplicatesSection() +
      '<div class="section">Availability</div>' +
      '<div class="muted" style="margin:-4px 0 12px">Used when you pick a time and when a customer booking link shows open slots. The public booking page also reads published slots.json, so after you change these hours run the update_slots script and publish that file.</div>' +
      '<label class="field"><div class="field-lab">Weekday evening start (PT)</div><input id="st-weekdayStart" type="time" value="' + esc(s.weekdayStart) + '" oninput="RT.setSetting(\'weekdayStart\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Weekday evening end (PT)</div><input id="st-weekdayEnd" type="time" value="' + esc(s.weekdayEnd) + '" oninput="RT.setSetting(\'weekdayEnd\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Saturday start (PT)</div><input id="st-saturdayStart" type="time" value="' + esc(s.saturdayStart) + '" oninput="RT.setSetting(\'saturdayStart\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Saturday end (PT)</div><input id="st-saturdayEnd" type="time" value="' + esc(s.saturdayEnd) + '" oninput="RT.setSetting(\'saturdayEnd\', this.value)"></label>' +
      '<div class="cal-note">' + esc(availabilitySummary()) + " Sunday is closed unless you turn it on in the published slots file.</div>" +
      '<div class="section">Price book</div>' +
      '<div class="muted" style="margin:-4px 0 12px">Steve’s November 24, 2026 rule. Default GP is 40% on costed parts, equipment, and materials, with a 35% floor. Refrigerant uses a minimum 125% markup (sell = cost × 2.25, about 55.6% GP). Changing the defaults updates items that still use the default and have not been approved.</div>' +
      '<label class="field"><div class="field-lab">Default GP %</div><input id="st-defaultGp" inputmode="decimal" value="' + esc(String(s.defaultGp != null ? s.defaultGp : 40)) + '" oninput="RT.setSetting(\'defaultGp\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Minimum GP % (floor)</div><input id="st-minGp" inputmode="decimal" value="' + esc(String(s.minGp != null ? s.minGp : 35)) + '" oninput="RT.setSetting(\'minGp\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Refrigerant minimum markup %</div><input id="st-refrigerantMinMarkup" inputmode="decimal" value="' + esc(String(s.refrigerantMinMarkup != null ? s.refrigerantMinMarkup : 125)) + '" oninput="RT.setSetting(\'refrigerantMinMarkup\', this.value)"></label>' +
      '<div class="note" style="margin-bottom:16px">A ' + esc(String(s.refrigerantMinMarkup != null ? s.refrigerantMinMarkup : 125)) + "% markup is " + esc(String(markupToGp(s.refrigerantMinMarkup != null ? s.refrigerantMinMarkup : 125))) + "% GP. Sell = cost × " + (1 + Number(s.refrigerantMinMarkup != null ? s.refrigerantMinMarkup : 125) / 100).toFixed(2).replace(/\.00$/, "") + ". Confirmed service rates are not marked up again.</div>" +
      '<div class="section">Calendar</div>' +
      '<div class="muted">Job appointments go on steveseguine51@gmail.com, titled like “#55720 Dan Correa — Cooling maintenance.” The customer is never invited. This app cannot write to Google Calendar by itself. After you confirm a time, ask the assistant to add or update the event.</div>' +
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
    const stKey = job.posted && job.status === "paid" ? "posted" : job.status;
    const st = STATUS[stKey] || STATUS.new, col = sc(stKey);
    return topBar({ back: "closeJob", title: "Job " + job.id, badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      jobPartiesHeader(job) +
      '<div class="h1">' + esc(job.problem) + "</div>" +
      (job.phone ? '<div class="teal">' + esc(job.phone) + "</div>" : "") +
      '<div style="margin-bottom:16px">' + pill(st.label, col.text, col.bg) + (job.schedule ? '<span class="muted" style="margin-left:8px;font-size:12px">' + esc(job.schedule) + "</span>" : "") + "</div>" +
      closeoutBannerHtml(job) +
      jobEquipmentSection(job) +
      timeSection(job) +
      partsSection(job) +
      approvedScopeHtml(job) +
      '<div class="panel" style="margin-bottom:16px">' + stepper(job.status) + "</div>" +
      '<div class="section">On this job</div><div class="quick">' +
      '<button class="quick-btn" ' + act("sheet", "photo") + ">" + icon("photo") + "<span>Photo</span></button>" +
      '<button class="quick-btn" ' + act("sheet", "voiceMemo") + ">" + icon("mic") + "<span>Voice memo</span></button>" +
      '<button class="quick-btn" ' + act("sheet", "note") + ">" + icon("note") + "<span>Note</span></button>" +
      '<button class="quick-btn" ' + act("sheet", "reading") + ">" + icon("reading") + "<span>Reading</span></button>" +
      "</div>" +
      readingsSection(job) +
      unitWorkSectionHtml(job) +
      '<div class="section">Timeline</div><div class="timeline">' + (job.timeline || []).map(timelineItemHtml).join("") + "</div>" +
      '<div id="job-estimates" style="scroll-margin-top:12px"></div>' +
      estimateHistoryHtml(job) +
      '<div class="actions">' +
      '<button class="btn" ' + act("openPriceBook") + ">Build estimate</button>" +
      (job.estimateId ? '<button class="btn ghost" ' + act("viewEstimate", job.estimateId) + ">" + (job.approvedEstimateId === job.estimateId ? "Estimate " + job.estimateId + " · approved" : "Approve / send · " + job.estimateId) + "</button>" : "") +
      closeoutActionsHtml(job) +
      (job.status === "invoiced" || job.status === "paid" || job.invoiceId ? '<button class="btn ghost" ' + act("sheet", "invoice") + ">View invoice</button>" : "") +
      (isPayable(job) ? '<button class="btn teal" ' + act("sheet", "pay") + ">Pay now</button>" : "") +
      (job.invoiceId || job.status === "invoiced" || job.status === "paid" || isPayable(job) ? '<button class="btn" ' + act("sheet", "send") + ">Send invoice</button>" : "") +
      (isPayable(job) || job.status === "invoiced" ? '<button class="btn accent" ' + act("sheet", "paid") + ">Mark paid</button>" : "") +
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
    const loc = serviceAddressOf(job);
    const assets = loc ? (loc.assets || []) : (c ? customerAssets(c) : []);
    let html = '<div class="section-row"><div class="section" style="margin:0">Equipment at this home</div>';
    if (loc && loc.id) html += '<button class="link-btn" style="margin:0" ' + act("openAddress", loc.id) + ">Service address</button>";
    else if (c) html += '<button class="link-btn" style="margin:0" ' + act("openCustomer", c.id) + ">Customer profile</button>";
    html += "</div>";
    if (!assets.length) {
      html += '<div class="muted" style="margin:8px 0 16px">No equipment on this service address yet.</div>';
      return html;
    }
    html += '<div class="stack" style="margin:8px 0 16px">' + assets.map(function (a) {
      return assetCard(a, c ? c.id : "", true);
    }).join("") + "</div>";
    return html;
  }
  function assetCard(a, customerId, compact) {
    return '<button class="eq-card" ' + act("openAsset", (customerId || state.openCustomerId || "") + "|" + a.id) + ">" +
      (assetThumbSrc(a) ? '<img class="eq-thumb" src="' + esc(assetThumbSrc(a)) + '" alt="Nameplate">' : '<div class="eq-thumb ph">' + icon("photo", 18) + "</div>") +
      '<div class="eq-body"><div class="eq-type">' + esc(equipmentTypeLabel(a)) + (a.sample ? ' · Example only' : "") + "</div>" +
      '<div class="h2">' + esc([a.make, a.model].filter(Boolean).join(" · ") || "Make and model not entered") + "</div>" +
      (assetSub(a) ? '<div class="muted" style="margin-top:2px">' + esc(assetSub(a)) + "</div>" : "") +
      (!compact && a.warranty ? '<div class="meta" style="margin-top:4px">Warranty · ' + esc(a.warranty) + "</div>" : "") +
      "</div>" + icon("chevron", 18) + "</button>";
  }

  function customersList() {
    const q = state.query.trim().toLowerCase();
    const list = state.customers.filter(function (c) {
      return !q || customerSearchHay(c).toLowerCase().indexOf(q) !== -1;
    });
    return topBar({ kicker: "ReliaTech Services", title: "Customers", badge: SHOW_SAMPLE_BADGE, settings: true }) +
      '<div class="content"><div class="pad">' +
      '<div class="search">' + icon("search", 16) + '<input id="search-q" type="search" placeholder="Search customers" value="' + esc(state.query) + '" oninput="RT.setQuery(this.value)"></div>' +
      '<div class="stack">' + list.map(function (c) {
        const preview = assetPreview(c);
        return '<button class="list-card" ' + act("openCustomer", c.id) + '><div class="job-body" style="display:flex;gap:12px;align-items:flex-start">' +
          '<div class="avatar">' + esc(initials(c.name)) + "</div><div style=\"min-width:0\"><div class=\"job-name\" style=\"margin-top:0\">" + esc(c.name) + "</div>" +
          '<div class="muted">' + esc((serviceAddresses(c).length > 1) ? (serviceAddresses(c).length + " service addresses") : (formatAddrLine(c.address, c.city) || "No service address")) + "</div>" +
          (c.phone ? '<div class="muted">' + esc(c.phone) + "</div>" : "") +
          (preview ? '<div class="meta" style="margin-top:4px">' + esc(preview) + "</div>" : "") +
          "</div></div><div class=\"chev\">" + icon("chevron", 18) + "</div></button>";
      }).join("") + "</div></div></div>" + tabBar();
  }
  function customerDetail(c) {
    const addrs = serviceAddresses(c);
    const multi = addrs.length > 1;
    const jobs = serviceJobsForCustomer(c);
    const billed = billedOnlyJobs(c);
    const assets = customerAssets(c);
    const mentions = customerMentions(c);
    const nextId = nextJobId(state.jobs);
    const same = c.billingSameAsService !== false;
    const billLine = same
      ? (multi ? "Bills to the service address on each job" : (formatAddrLine(c.address, c.city) || "Bills to the service address"))
      : (formatAddrLine(c.billingAddress, c.billingCity) || "Enter a billing address");
    const headerBits = (c.phone ? '<div class="teal">' + esc(c.phone) + "</div>" : "") +
      (c.email ? '<div class="muted" style="margin-top:4px">' + esc(c.email) + "</div>" : "") +
      (addrs.length === 1 ? '<div class="muted"' + (c.phone || c.email ? ' style="margin-top:6px"' : "") + '>' + esc(formatAddrLine(addrs[0].address, addrs[0].city) || "No service address yet") + "</div>" : "") +
      (addrs.length === 0 ? '<div class="muted"' + (c.phone || c.email ? ' style="margin-top:6px"' : "") + '>Billing contact · no service address</div>' : "");
    let html = topBar({ back: "closeCustomer", title: c.name, badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      (headerBits ? '<div class="panel" style="margin-bottom:14px">' + headerBits + "</div>" : "") +
      '<div class="section">Billing</div>' +
      '<button class="dash' + (same ? " sel" : "") + '" style="margin-bottom:10px" ' + act("toggleBillingSame", c.id) + ">" +
        (same ? "Billing same as service address" : "Billing address is different") +
      "</button>" +
      (same ? '<div class="muted" style="margin:-4px 0 14px">' + esc(billLine) + "</div>" :
        '<label class="field"><div class="field-lab">Billing address</div><input id="bill-address" value="' + esc(c.billingAddress || "") + '" oninput="RT.setBilling(\'billingAddress\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">City</div><input id="bill-city" value="' + esc(c.billingCity || "") + '" oninput="RT.setBilling(\'billingCity\', this.value)"></label>') +
      '<div class="section-row"><div class="section" style="margin:0">Service addresses</div></div>' +
      (addrs.length ? '<div class="stack" style="margin:10px 0 8px">' + addrs.map(function (a) { return addressCard(a, c); }).join("") + "</div>" :
        '<div class="muted" style="margin:10px 0">No service address yet. Add one for the house you work on.</div>') +
      '<button class="dash" style="margin:0 0 16px" ' + act("addAddress", c.id) + ">Add service address</button>" +
      '<button class="btn" style="margin-bottom:16px" ' + act("newJobFromCustomer", c.id) + ">New job · #" + nextId + "</button>" +
      prospectsForCustomer(c.id).map(function (pr) { return prospectCard(pr, { showCustomer: false, compact: false, clickable: false }); }).join("") +
      plansForCustomer(c.id).map(function (p) { return planCard(p, c); }).join("");
    if (!multi) {
      const only = addrs[0];
      html += '<div class="section-row"><div class="section" style="margin:0">Equipment</div></div>' +
        '<button class="dash" style="margin:10px 0 12px" ' + act("addEquipment", c.id + (only ? "|" + only.id : "")) + ">Add equipment</button>" +
        (assets.length ? '<div class="stack" style="margin-bottom:16px">' + assets.map(function (a) { return assetCard(a, c.id, false); }).join("") + "</div>" :
          '<div class="muted" style="margin-bottom:16px">No equipment recorded yet. Add the furnace, coil, and condenser from the nameplate when you are on site.</div>') ;
    } else {
      html += '<div class="muted" style="margin-bottom:16px">Equipment is kept on each service address.</div>';
    }
    html += hcpEstimatesHtml(c, null);
    html += '<div class="section">Jobs</div><div class="stack">' + (jobs.length ? jobs.map(function (j) {
        if (state.jobs.some(function (x) { return x.id === j.id; })) return jobCard(j);
        const col = sc(j.status);
        return '<div class="job-card" style="cursor:default"><div class="stripe" style="background:' + col.bar + '"></div><div class="job-body"><div class="row"><div class="meta">#' + j.id + "</div>" + pill(STATUS[j.status].label, col.text, col.bg) + "</div><div class=\"job-prob\" style=\"margin-top:6px\">" + esc(j.problem) + "</div><div class=\"row\"><div class=\"addr\">" + (j.invoiceId || "") + "</div><div class=\"amt\">" + money(j.total) + "</div></div></div></div>";
      }).join("") : '<div class="muted">No jobs for this customer yet.</div>') + "</div>";
    if (billed.length) {
      html += '<div class="section">Billed to this customer</div><div class="muted" style="margin:-4px 0 10px">These jobs are at another service address, with this customer as Bill to.</div><div class="stack">' +
        billed.map(function (j) { return state.jobs.some(function (x) { return x.id === j.id; }) ? jobCard(j) : ""; }).join("") + "</div>";
    }
    html += "</div></div>";
    return html;
  }
  function addressDetail(a, c) {
    if (!a || !c) return "";
    const jobs = jobsForAddress(a.id);
    const assets = a.assets || [];
    const mentions = a.mentions || [];
    const nextId = nextJobId(state.jobs);
    const plans = plansForAddress(a.id);
    const line = formatAddrLine(a.address, a.city) || "Address not entered";
    return topBar({ back: "closeAddress", title: a.label || "Service address", badge: SHOW_SAMPLE_BADGE }) +
      '<div class="content screen"><div class="pad">' +
      (a.example ? '<div class="warn-banner" style="margin-bottom:12px">Example only · removable. This is not a real job site.</div>' : "") +
      '<div class="panel" style="margin-bottom:14px"><div class="h2">' + esc(line) + "</div>" +
      (a.label ? '<div class="muted" style="margin-top:4px">' + esc(a.label) + "</div>" : "") +
      (a.onsiteName || a.onsitePhone ? '<div class="muted" style="margin-top:6px">On site: ' + esc([a.onsiteName, a.onsitePhone].filter(Boolean).join(" · ")) + "</div>" : "") +
      (a.accessNotes ? '<div class="muted" style="margin-top:6px">Access: ' + esc(a.accessNotes) + "</div>" : "") +
      '<div class="muted" style="margin-top:8px">Customer · ' + esc(c.name) + "</div></div>" +
      '<button class="btn" style="margin-bottom:10px" ' + act("newJobFromAddress", a.id) + ">New job · #" + nextId + "</button>" +
      '<button class="btn ghost" style="margin-bottom:10px" ' + act("editAddress", a.id) + ">Edit address and on-site contact</button>" +
      '<button class="link-btn" style="margin:0 0 16px" ' + act("moveAddress", a.id) + ">Move this address to another customer</button>" +
      plans.map(function (p) { return planCard(p, c); }).join("") +
      '<div class="section-row"><div class="section" style="margin:0">Equipment</div></div>' +
      '<button class="dash" style="margin:10px 0 12px" ' + act("addEquipment", c.id + "|" + a.id) + ">Add equipment</button>" +
      (assets.length ? '<div class="stack" style="margin-bottom:16px">' + assets.map(function (x) { return assetCard(x, c.id, false); }).join("") + "</div>" :
        '<div class="muted" style="margin-bottom:16px">No equipment recorded at this address yet.</div>') +
      hcpEstimatesHtml(c, a) +
      '<div class="section">Jobs</div><div class="stack">' + (jobs.length ? jobs.map(function (j) {
        if (state.jobs.some(function (x) { return x.id === j.id; })) return jobCard(j);
        const col = sc(j.status);
        return '<div class="job-card" style="cursor:default"><div class="stripe" style="background:' + col.bar + '"></div><div class="job-body"><div class="row"><div class="meta">#' + j.id + "</div>" + pill(STATUS[j.status].label, col.text, col.bg) + "</div><div class=\"job-prob\" style=\"margin-top:6px\">" + esc(j.problem) + "</div></div></div>";
      }).join("") : '<div class="muted">No jobs at this address yet.</div>') + "</div></div></div>";
  }

  function moneyScreen() {
    const all = state.jobs.concat(state.moneyJobs);
    const unpaid = all.filter(isPayable);
    const liveOutstanding = unpaid.reduce(function (s, j) { return s + invoiceDue(j); }, 0);
    const outstanding = liveOutstanding;
    let collected = (window.RT_DATA && typeof window.RT_DATA.collected === "number") ? window.RT_DATA.collected : all.filter(function (j) { return j.status === "paid"; }).reduce(function (s, j) { return s + j.total; }, 0);
    all.forEach(function (j) {
      const init = INITIAL_JOBS.find(function (x) { return x.id === j.id; }) || PAST_JOBS.find(function (x) { return x.id === j.id; });
      if (j.status === "paid" && init && init.status !== "paid") {
        collected += Number(init.dueAmount || init.total || 0);
      }
    });
    const openEst = (window.RT_DATA && typeof window.RT_DATA.openEstimates === "number") ? window.RT_DATA.openEstimates : all.filter(function (j) { return j.status === "estimate" || j.status === "approved"; }).reduce(function (s, j) { return s + j.total; }, 0);
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

  function pinPrimary(h) {
    const found = [];
    h = h.replace(/<(button|a)\b[^>]*\sdata-pin\b[\s\S]*?<\/\1>/g, function (m) { found.push(m.replace(" data-pin", "")); return ""; });
    if (!found.length) return h;
    const bar = '<div class="nc-nav pin-bar">' + found.join("") + "</div>";
    let at = 0;
    const hs = h.indexOf('<div class="sheet-head">');
    if (hs !== -1) { const e = h.indexOf("</button></div>", hs); if (e !== -1) at = e + 15; }
    if (h.substr(at, 18) === '<div class="steps"') { const e2 = h.indexOf("</div>", at); if (e2 !== -1) at = e2 + 6; }
    return h.slice(0, at) + bar + h.slice(at);
  }
  function backdrop(inner) {
    inner = pinPrimary(inner);
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
    const head0 = '<div class="sheet-head"><div class="sheet-title">' + (fromCust ? "New job" : "New call") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" + steps;
    function ncNav(info, sub, btn) {
      return '<div class="nc-nav"><div class="nc-nav-info">' + (info ? '<div class="nc-nav-name">' + info + "</div>" : "") + (sub ? '<div class="nc-nav-sub">' + sub + "</div>" : "") + "</div>" + btn + "</div>";
    }
    let head = head0;
    if (step === 1) {
      const lockedCust = fromCust ? getCustomer(nc.customerId) : null;
      const locked = lockedCust
        ? '<div class="panel" style="margin-bottom:12px;padding:12px"><div class="k-up">Customer</div><div class="h2">' + esc(lockedCust.name) + '</div>' +
          (serviceAddresses(lockedCust).length <= 1 ? '<div class="muted">' + esc(formatAddrLine(lockedCust.address, lockedCust.city) || "") + "</div>" : "") +
          (lockedCust.phone ? '<div class="teal" style="margin:4px 0 0">' + esc(lockedCust.phone) + "</div>" : "") + "</div>" +
          addressPickerHtml(lockedCust, nc.addressId, "pickAddress")
        : "";
      head = head0 + ncNav(nc.chips.length ? esc(nc.chips.join(", ")) : "", nc.chips.length ? "" : "Pick what’s going on", '<button class="btn" ' + act("ncNext") + ">" + (fromCust ? "Next · Confirm" : "Next · Customer") + "</button>");
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
        }).join(""));
    }
    if (step === 2) {
      const q = (nc.custQuery || "").trim().toLowerCase();
      const matches = state.customers.filter(function (c) {
        return !q || customerSearchHay(c).toLowerCase().indexOf(q) !== -1;
      });
      const none = q && !matches.length && !nc.isNew;
      let body;
      if (nc.isNew) {
        body = '<button class="link-btn" style="margin-bottom:10px" ' + act("ncBackList") + ">← Back to customer list</button>" +
          '<label class="field"><div class="field-lab">Name</div><input id="nc-newName" value="' + esc(nc.newName) + '" oninput="RT.setNew(\'newName\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Phone</div><input id="nc-newPhone" type="tel" value="' + esc(nc.newPhone) + '" oninput="RT.setNew(\'newPhone\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Address</div><input id="nc-newAddress" value="' + esc(nc.newAddress) + '" oninput="RT.setNew(\'newAddress\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">City</div><input id="nc-newCity" value="' + esc(nc.newCity) + '" oninput="RT.setNew(\'newCity\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Email (optional)</div><input id="nc-newEmail" type="email" value="' + esc(nc.newEmail) + '" oninput="RT.setNew(\'newEmail\', this.value)"></label>';
        const okNew = !!(nc.newName.trim() && nc.newPhone.trim() && nc.newAddress.trim());
        head = head0 + ncNav(nc.newName.trim() ? "New: " + esc(nc.newName.trim()) : "", okNew ? "" : "Enter name, phone and address", '<button class="btn"' + (okNew ? "" : " disabled") + " " + act("ncNext") + ">Next ›</button>");
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
          (nc.customerId ? addressPickerHtml(state.customers.find(function (x) { return x.id === nc.customerId; }), nc.addressId, "pickAddress") : "");
        const selC = nc.customerId ? state.customers.find(function (x) { return x.id === nc.customerId; }) : null;
        head = head0 + ncNav(selC ? "✓ " + esc(selC.name) : "", selC ? esc(formatAddrLine(selC.address, selC.city) || "") : "No customer picked yet", '<button class="btn"' + (selC ? "" : " disabled") + " " + act("ncNext") + ">Next ›</button>");
      }
      return backdrop(head + body);
    }
    const report = reportText(nc.chips, nc.detail, nc.urgency);
    let custName, custAddr, custPhone;
    if (nc.isNew) {
      custName = nc.newName; custAddr = formatAddrLine(nc.newAddress, nc.newCity); custPhone = nc.newPhone;
    } else {
      const c = state.customers.find(function (x) { return x.id === nc.customerId; });
      const loc = (nc.addressId && getAddressById(nc.addressId)) || (c ? primaryAddress(c) : null);
      custName = c ? c.name : "—";
      custAddr = loc ? addressLine(loc) : (c ? formatAddrLine(c.address, c.city) : "—");
      custPhone = (loc && loc.onsitePhone) || (c ? c.phone : "—") || "—";
    }
    let equipmentHtml = "";
    if (!nc.isNew && nc.customerId) {
      const cust = getCustomer(nc.customerId);
      const loc = (nc.addressId && getAddressById(nc.addressId)) || (cust ? primaryAddress(cust) : null);
      const assets = loc ? (loc.assets || []) : (cust ? customerAssets(cust) : []);
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
    head = head0 + ncNav(esc(custName), "Job #" + jobId, '<button class="btn accent" ' + act("createJob") + ">Create job</button>");
    return backdrop(head +
      '<div class="panel" style="margin-bottom:12px;box-shadow:none;background:var(--field)">' +
      '<div class="k-up">Next job</div><div class="h1" style="margin:4px 0">#' + jobId + "</div>" +
      '<div class="h2">' + esc(custName) + "</div><div class=\"muted\">" + esc(custAddr) + "</div><div class=\"teal\">" + esc(custPhone) + "</div>" +
      '<div style="margin-top:10px">' + esc(report) + "</div></div>" +
      equipmentHtml +
      '<div class="note" style="margin-top:0;margin-bottom:12px">This job is saved on this phone only. It is not uploaded to a shared server.</div>');
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
      '<input type="file" accept="image/*" aria-label="Nameplate photo" onchange="RT.setNameplatePhoto(this)"></div>' +
      (np.photo ? '<button class="link-btn" style="margin-bottom:12px" ' + act("clearNpPhoto") + ">Remove photo</button>" : "");
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Add a note</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="chips">' + types.map(function (t) {
        return '<button class="chip' + (typ === t[0] ? " on" : "") + '" ' + act("noteType", t[0]) + ">" + esc(t[1]) + "</button>";
      }).join("") + "</div>" +
      body + nameplate +
      '<button data-pin class="btn" ' + act("saveNote") + ">Save note</button>");
  }

  function photoSheet() {
    const d = state.photoDraft || emptyPhotoDraft();
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Add a photo</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (d.data
        ? '<img class="cap-thumb" alt="Preview" src="' + d.data + '">'
        : '<div class="photo-ph">' + icon("photo", 28) + "<span>Take a photo or choose one from the library</span></div>") +
      '<label class="btn ghost" style="display:block;text-align:center;margin:8px 0 12px">Take or choose a photo<input type="file" accept="image/*" aria-label="Job photo" style="position:absolute;opacity:0;width:0;height:0" onchange="RT.setPhotoFile(this)"></label>' +
      '<label class="field"><div class="field-lab">Caption (optional)</div><input id="photo-cap" value="' + esc(d.caption || "") + '" oninput="RT.setPhotoCaption(this.value)"></label>' +
      (d.data ? '<button data-pin class="btn" ' + act("savePhoto") + ">Save photo to this job</button>" : ""));
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
      '<div class="muted" style="margin-bottom:12px">Estimate ' + esc(job.estimateId || (job.id + "-E01")) + " for " + money(job.total) + " would go to " + esc((billToCustomer(job) && billToCustomer(job).name) || job.customer) + " for approval. This mockup doesn’t send anything.</div>" +
      '<button class="btn" ' + act("closeSheet") + ">Got it</button>");
  }
  function invoiceSheet(job) {
    const existing = job.status === "invoiced" || job.status === "paid" || !!job.invoiceId || isPayable(job);
    const mismatch = hoursMismatch(job);
    const showTos = showTimeOnInvoice(job);
    const completed = completedTimeEntries(job);
    const openLeft = anyOpenEntry(job);
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (existing ? "Invoice" : "Make invoice") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="doc"><div class="k-up">Invoice ' + esc(job.invoiceId || (job.id + "-01")) + "</div>" +
      docBlocksHtml(job, { showReferred: true }) +
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
      (job.paidMethod ? '<div class="muted" style="margin-top:12px">Marked paid' + (job.paidDate ? " on " + esc(job.paidDate) : "") + " · " + esc(job.paidMethod) + (job.status === "paid" ? "" : "") + ".</div>" : "") +
      (existing && isPayable(job) ? '<button class="btn teal" ' + act("sheet", "pay") + ">Pay now</button>" : "") +
      (existing ? '<button data-pin class="btn teal" ' + act("sheet", "send") + ">Send invoice</button>" : "") +
      (existing && (isPayable(job) || job.status === "invoiced") ? '<button class="btn accent" ' + act("sheet", "paid") + ">Mark paid</button>" : "") +
      (existing ? '<button class="btn' + (isPayable(job) ? " ghost" : "") + '" ' + act("closeSheet") + ">Done</button>" : '<button data-pin class="btn teal" ' + act("closeoutOpen") + ">Work complete · write invoice</button>"));
  }

  function paySheet(job) {
    const inv = invoiceNumber(job);
    const due = invoiceDue(job);
    const stripe = stripeLinkFor(job);
    const reusable = usesReusableStripe(job);
    const memo = zelleMemo(job);
    const phone = zellePhoneDisplay();
    const stripeNote = !stripe
      ? "A card payment link is not available for this invoice yet."
      : (reusable
        ? "On the Stripe page, enter invoice " + inv + " and the amount " + money(due) + ". Card and Apple Pay are offered when the device supports them."
        : "This opens a Stripe Payment Link for invoice " + inv + " in the amount of " + money(due) + ". Card and Apple Pay are offered when the device supports them.");
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Pay now</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="k-up">Invoice ' + esc(inv) + "</div>" +
      '<div class="pay-amt">' + money(due) + "</div>" +
      (job.id === "55707" ? '<div class="muted" style="margin-top:-6px;margin-bottom:12px">Remaining balance on this job. Prior invoices 97 and 100 are already marked paid in Housecall Pro.</div>' : "") +
      '<div class="pay-opt"><div class="h2">Card / Apple Pay</div><div class="muted">' + esc(stripeNote) + "</div>" +
        (stripe ? '<a class="btn teal" href="' + esc(stripe) + '" target="_blank" rel="noopener">Pay ' + money(due) + " with card</a>" : "") +
      "</div>" +
      '<div class="pay-opt"><div class="h2">Venmo</div><div class="muted">Opens Venmo to @' + esc(String(PAYMENT.venmoHandle || "Steve-Seguine").replace(/^@/, "")) + " with the amount and invoice note filled in.</div>" +
        '<a class="btn teal" href="' + esc(venmoLink(job)) + '" target="_blank" rel="noopener">Pay ' + money(due) + " with Venmo</a>" +
      "</div>" +
      '<div class="pay-opt"><div class="h2">Zelle</div><div class="muted">Zelle has no payment link. Open your bank app, send to this number, and use the memo below.</div>' +
        '<div class="pay-row"><div><div class="field-lab" style="margin:0">Send to</div><div class="val">' + esc(phone) + '</div></div><button class="btn ghost inline" ' + act("copyZelle") + ">Copy number</button></div>" +
        '<div class="pay-row"><div><div class="field-lab" style="margin:0">Amount</div><div class="val">' + money(due) + "</div></div></div>" +
        '<div class="pay-row"><div><div class="field-lab" style="margin:0">Memo</div><div class="val">' + esc(memo) + '</div></div><button class="btn ghost inline" ' + act("copyMemo") + ">Copy memo</button></div>" +
      "</div>" +
      '<button class="btn accent" ' + act("sheet", "paid") + ">Mark paid</button>");
  }

  function paidSheet(job) {
    const d = state.paidDraft || emptyPaidDraft();
    const due = invoiceDue(job) || job.total || 0;
    const inv = invoiceNumber(job);
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Mark paid</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">Record a payment you already received for invoice ' + esc(inv) + ". This marks it paid in this app. It does not charge a card or change Stripe, Venmo, or Zelle.</div>" +
      '<div class="h2" style="margin-bottom:12px">' + money(due) + "</div>" +
      '<div class="field-lab">Method</div><div class="chips" style="margin-bottom:12px">' +
      PAY_METHODS.map(function (m) {
        return '<button class="chip teal' + (d.method === m ? " on" : "") + '" ' + act("setPaidMethod", m) + ">" + esc(m) + "</button>";
      }).join("") + "</div>" +
      '<label class="field"><div class="field-lab">Date</div><input id="paid-date" type="date" value="' + esc(d.date || todayYmd()) + '" oninput="RT.setPaidDate(this.value)"></label>' +
      '<button data-pin class="btn accent" ' + act("markPaid") + ">Mark paid</button>");
  }

  function sendSheet(job) {
    const party = invoiceParty(job);
    const inv = invoiceNumber(job);
    const due = invoiceDue(job) || job.total || 0;
    const link = customerPayUrl(job);
    const msg = invoiceMessage(job);
    const sms = smsHref(job);
    const mail = mailtoHref(job);
    const hasPhone = !!smsNumber(party.phone);
    const hasEmail = !!(party.email && String(party.email).indexOf("@") !== -1);
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Send invoice</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:12px">Opens a prefilled text or email on this phone. Nothing is sent until you press Send.</div>' +
      '<div class="k-up">Invoice ' + esc(inv) + " · " + money(due) + "</div>" +
      '<div class="h2" style="margin:4px 0 10px">' + esc(party.name || "Customer") + "</div>" +
      '<div class="panel" style="margin-bottom:14px;white-space:pre-wrap;font-size:14px;line-height:20px">' + esc(msg) + "</div>" +
      (hasPhone
        ? '<a class="btn teal" href="' + esc(sms) + '">Send text to ' + esc(party.phone) + "</a>"
        : '<div class="muted" style="margin-bottom:10px">No cell number on this invoice. Add a phone on the customer, or copy the message.</div>') +
      '<a class="btn' + (hasEmail ? " teal" : " ghost") + '" href="' + esc(mail) + '">' + (hasEmail ? "Send email to " + esc(party.email) : "Send email") + "</a>" +
      '<button class="btn ghost" ' + act("copyPayLink") + ">Copy payment link</button>" +
      '<button class="btn ghost" ' + act("copyInvoiceMsg") + ">Copy message</button>" +
      '<div class="hint">Customer pay page: ' + esc(link) + "</div>");
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
      '<button data-pin class="btn" ' + act("saveReading") + ">Save reading set</button>");
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
    const q = (state.packQuery || "").trim().toLowerCase();
    const tab = state.packTab || "all";
    const cats = bookCategories();
    let items = bookItems().filter(function (p) {
      const hit = !q || [p.name, p.detail || "", p.sku || "", p.category || ""].join(" ").toLowerCase().indexOf(q) !== -1;
      const catOk = tab === "all" || p.category === tab;
      return hit && catOk;
    });
    const total = draftTotal(state.packDraft);
    function lineRow(l, i) {
      return '<div class="row" style="margin-bottom:8px"><div style="min-width:0"><div style="font-weight:650;font-size:13px">' + esc(l.label) + '</div><div class="meta">' + (l.fromBook ? "From price book" : "Custom line") + (l.flatRate || l.customQuote ? " · " + flatRoleLabel(l) : "") + (l.unit === "lb" ? " · per lb" : "") + "</div></div>" +
        '<div class="qty"><button ' + act("qty", i + "|-") + ">−</button><span style=\"min-width:16px;text-align:center;font-weight:700\">" + l.qty + "</span><button " + act("qty", i + "|+") + ">+</button></div>" +
        "<div style=\"font-weight:700;min-width:64px;text-align:right\">" + money(lineTotal(l)) + "</div></div>";
    }
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Price book</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="muted" style="margin-bottom:10px">' + PRICE_BOOK_NOTE + "</div>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px"><button class="btn teal" style="margin:0" ' + act("rbOpen") + ">Custom repair builder</button>" +
      (typeof rpOpenButton === "function" ? rpOpenButton() : "") + "</div>" +
      (state.packDraft.length ? '<div class="cart"><div class="k-up">This estimate</div>' + state.packDraft.map(lineRow).join("") + '<div class="row" style="font-weight:750;margin-top:6px"><div>Total</div><div>' + money(total) + "</div></div>" + estimateGpHtml(state.packDraft) + "</div>" : "") +
      '<div class="search">' + icon("search", 16) + '<input id="pack-q" type="search" placeholder="Search the price book" value="' + esc(state.packQuery) + '" oninput="RT.setPackQ(this.value)"></div>' +
      '<div class="chips"><button class="chip' + (tab === "all" ? " on" : "") + '" ' + act("packTab", "all") + ">All</button>" +
        cats.map(function (c) { return '<button class="chip' + (tab === c ? " on" : "") + '" ' + act("packTab", c) + ">" + esc(c) + "</button>"; }).join("") +
      "</div>" +
      items.map(function (p) {
        const sell = sellOf(p);
        const custom = isCustomQuoteItem(p);
        const flat = !custom && isFlatRateItem(p) ? flatRatePrices(p) : null;
        const needs = p.status === "needs_ok";
        const canAdd = custom || (flat ? (flat.first != null) : (sell != null));
        return '<div class="book-item">' + (canAdd
          ? '<button ' + act("addItem", p.id) + ">"
          : '<button type="button" disabled>') +
          '<div class="row"><div style="font-weight:750">' + esc(p.name) + '</div><div style="font-weight:750">' + (custom ? "Quote" : (flat ? money(flat.first) : (sell != null ? money(sell) : "—"))) + (flat || custom ? "" : (p.unit ? "<span class=\"meta\">/" + p.unit + "</span>" : "")) + "</div></div>" +
          (custom ? '<div class="muted" style="margin-top:2px">Custom quote · ' + (p.laborHours || "—") + " hr template · enter OEM cost</div>" : "") +
          (flat ? '<div class="muted" style="margin-top:2px">First ' + money(flat.first) + " · Add-on " + money(flat.addOn) + "</div>" : "") +
          (p.detail && !flat && !custom ? '<div class="muted" style="margin-top:2px">' + esc(p.detail) + "</div>" : "") +
          '<div class="muted" style="margin-top:2px">' + esc(p.category || "") + (flat && p.partCostMissing ? " · Part cost missing" : (!custom && p.cost != null && p.cost !== "" ? " · Cost " + money(Number(p.cost)) : "")) + (!flat && !custom && p.gp != null && p.gp !== "" ? " · GP " + p.gp + "%" : "") + "</div>" +
          (needs ? '<div style="margin-top:6px">' + pill("Needs Steve’s OK", "#8A4B08", "#F6E2B8") + "</div>" : "") +
          (!canAdd ? '<div class="muted" style="margin-top:4px">Set a sell price in the Price book tab first</div>' : "") +
          "</button></div>";
      }).join("") +
      '<div class="section">Custom line</div>' +
      '<label class="field"><div class="field-lab">Description</div><input id="pack-custom-name" value="' + esc(state.packCustomName || "") + '" oninput="RT.setPackCustom(\'name\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Amount</div><input id="pack-custom-amount" inputmode="decimal" value="' + esc(state.packCustomAmount || "") + '" oninput="RT.setPackCustom(\'amount\', this.value)"></label>' +
      '<button class="btn ghost" style="margin-bottom:10px" ' + act("addCustomLine") + ">Add custom line</button>" +
      (state.packDraft.length ? '<button class="btn accent" data-pin ' + act("scopeStep") + ">Next · Scope ›</button>" : ""));
  }


  function estimatePreviewSheet(job) {
    const lines = state.packDraft;
    const total = draftTotal(lines);
    const estId = job.estimateId || (job.id + "-E01");
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Estimate ' + esc(estId) + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div class="doc"><div class="k-up">ReliaTech Services</div>' +
      docBlocksHtml(job, { showReferred: true }) +
      lines.map(function (l, i) {
        const known = l.fromBook || lineInBook(l.label);
        return '<div class="row" style="margin-top:6px;align-items:flex-start"><div>' + esc(draftLabel(l)) +
          '<div class="meta">' + (known ? "From price book" : "Not in the price book") + "</div>" +
          (known ? "" : '<button class="link-btn" ' + act("saveLineToBook", "draft|" + i) + ">Save to price book</button>") +
          (l.flatRate || l.customQuote ? '<div class="meta">' + esc(flatRoleLabel(l)) + "</div>" : "") +
          "</div><div>" + money(lineTotal(l)) + "</div></div>";
      }).join("") +
      '<div class="row" style="margin-top:12px;font-weight:750"><div>Total</div><div>' + money(total) + "</div></div></div>" +
      lines.filter(function (l) { return l.builder; }).map(function (l) { return '<div class="meta" style="margin-top:8px;font-weight:700">' + esc(l.label) + "</div>" + builderInternalHtml(l.builder); }).join("") +
      estimateGpHtml(lines) +
      (state.scopeBuild && state.scopeBuild.text ? '<div class="doc"><div class="k-up">Scope · will save as a Draft version</div><div style="white-space:pre-wrap;font-size:13px;margin-top:6px">' + esc(state.scopeBuild.text) + '</div><button class="link-btn" ' + act("scopeStep") + ">‹ Edit scope</button></div>" : "") +
      '<div class="note">' + PRICE_BOOK_NOTE + " This preview stays on the phone and is not sent.</div>" +
      '<button class="btn" data-pin ' + act("saveEstimate") + ">Save estimate to job</button>");
  }

  function equipmentSheet() {
    const d = state.assetDraft || emptyAsset();
    const editing = !!state.assetEditingId;
    const locOther = !!d.locOther || !!(d.location && EQUIPMENT_LOCATIONS.indexOf(d.location) === -1);
    const fields = [
      ["make", "Make", "text", "Carrier, Rheem, Payne…"],
      ["model", "Model", "text", "From the nameplate"],
      ["serial", "Serial", "text", "From the nameplate"],
      ["installDate", "Install date", "date", ""],
      ["manufactureDate", "Manufacture date", "date", ""],
      ["capacity", "Tonnage or BTU", "text", "e.g. 3 ton or 80,000 BTU"],
      ["refrigerant", "Refrigerant", "text", "e.g. R-410A"],
      ["filterSize", "Filter size", "text", "e.g. 16x25x1"],
      ["warranty", "Warranty", "text", "Parts, labor, or remaining term"],
      ["hcpLabel", "Unit label", "text", "e.g. FAU upstairs, Master suite CU"],
      ["lastServiced", "Last serviced", "text", "e.g. 10/31/2026"]
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
      ((locOther || !d.location) ? '<label class="field"><div class="field-lab">' + (locOther ? "Location" : "Location (or type one)") + '</div><input id="eq-location" value="' + esc(locOther ? d.location : "") + '" placeholder="' + (locOther ? "Type the location" : "Attic, garage, side yard…") + '" oninput="RT.setAsset(\'location\', this.value)"></label>' : "") +
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
      '<button data-pin class="btn" style="margin-top:12px" ' + act(request ? "saveCorrectionRequest" : "saveTimeEdit") + ">" + (request ? "Submit request" : "Save changes") + "</button>");
  }

  function voiceSheet() {
    const v = state.voice || {};
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Voice command</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (v.listening ? '<div class="voice-orb" aria-hidden="true"></div><div class="h2" style="text-align:center;margin-bottom:8px">Listening…</div>' : "") +
      (v.listening ? '<button class="btn" style="margin-bottom:10px" ' + act("stopVoice") + ">Stop — use what I said</button>" : "") +
      '<div id="voice-status" class="muted" style="text-align:center;margin-bottom:10px">' +
        esc(v.listening ? "Try “clock me in for Lopez”, “clock me in on Elm”, “clock me out”, or “new job for Lisa Mezo, AC not cooling, Saturday morning.”" : (v.error || "Voice is ready when you are. You can also type the command.")) +
      "</div>" +
      '<div id="voice-text" class="voice-text">' + esc(v.text || "") + "</div>" +
      (v.fallback || !v.listening ? '<label class="field"><div class="field-lab">' + (v.fallback ? "Type the command" : "Or type it") + "</div>" +
        '<input id="voice-input" type="text" autocomplete="off" placeholder="clock me in for Lopez, or new job for Lisa Mezo, AC not cooling, Saturday morning" value="' + esc(v.text || "") + '" oninput="RT.setVoiceText(this.value)"></label>' +
        '<div id="voice-suggest" class="stack" style="margin-bottom:10px">' + voiceSuggestHtml(v.text || "") + "</div>" +
        '<button class="btn" ' + act("submitVoice") + ">Continue</button>" +
        (speechAvailable() && !v.listening ? '<button class="btn ghost" style="margin-top:8px" ' + act("openVoice") + ">Try again</button>" : "") : "")
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
        ? '<button class="btn accent" ' + act("voiceOfferNewJob") + ">Create a job" + (c.customerName ? " for " + esc(c.customerName) : "") + "</button>" +
          '<div class="note">' + esc(c.offerReason || "No matching job on the board. Create one, then confirm clock-in.") + "</div>"
        : '<button class="btn teal" ' + act("confirmVoice") + ">Confirm " + esc(actionLab.toLowerCase()) + "</button>") +
      '<button class="btn ghost" style="margin-top:8px" ' + act("closeSheet") + ">Cancel</button>"
    );
  }


  function addressSheet() {
    const d = state.addressDraft || emptyAddress();
    const editing = !!state.addressEditingId;
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (editing ? "Edit service address" : "Add service address") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<label class="field"><div class="field-lab">Street address</div><input id="ad-address" value="' + esc(d.address || "") + '" oninput="RT.setAddressField(\'address\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">City</div><input id="ad-city" value="' + esc(d.city || "") + '" oninput="RT.setAddressField(\'city\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Label (optional)</div><input id="ad-label" placeholder="e.g. Unit B or listing on Elm" value="' + esc(d.label || "") + '" oninput="RT.setAddressField(\'label\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">On-site contact name</div><input id="ad-onsiteName" placeholder="Tenant, homeowner, or seller" value="' + esc(d.onsiteName || "") + '" oninput="RT.setAddressField(\'onsiteName\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">On-site phone</div><input id="ad-onsitePhone" type="tel" value="' + esc(d.onsitePhone || "") + '" oninput="RT.setAddressField(\'onsitePhone\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Access, gate, or lockbox notes</div><textarea id="ad-accessNotes" rows="3" oninput="RT.setAddressField(\'accessNotes\', this.value)">' + esc(d.accessNotes || "") + "</textarea></label>" +
      '<button class="dash' + (d.example ? " sel" : "") + '" style="margin-bottom:14px" ' + act("toggleAddressExample") + ">" +
        (d.example ? "Marked as example only · removable" : "Mark as example data (optional)") +
      "</button>" +
      '<button data-pin class="btn teal" ' + act("saveAddress") + ">" + (editing ? "Save address" : "Add address") + "</button>"
    );
  }
  function moveAddressSheet() {
    const a = getAddressById(state.moveAddressId);
    const from = customerOfAddress(state.moveAddressId);
    const q = (state.moveQuery || "").trim().toLowerCase();
    const matches = state.customers.filter(function (c) {
      if (from && c.id === from.id) return false;
      return !q || customerSearchHay(c).toLowerCase().indexOf(q) !== -1;
    });
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Move service address</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (a && from ? '<div class="muted" style="margin-bottom:10px">Move ' + esc(addressLine(a) || "this address") + " from " + esc(from.name) + " to another customer. Equipment and job history stay with the house.</div>" : "") +
      '<div class="search">' + icon("search", 16) + '<input id="mv-q" type="search" placeholder="Search customers" value="' + esc(state.moveQuery || "") + '" oninput="RT.setMoveQuery(this.value)"></div>' +
      '<div class="stack">' + matches.map(function (c) {
        return '<button class="list-card" ' + act("confirmMoveAddress", c.id) + '><div class="job-body"><div class="job-name" style="margin-top:0">' + esc(c.name) + "</div><div class=\"muted\">" + esc(formatAddrLine(c.address, c.city) || "Billing contact") + "</div></div></button>";
      }).join("") + "</div>"
    );
  }
  function billToSheet(job) {
    const d = state.billToDraft || { query: "", isNew: false, newName: "", newPhone: "", newEmail: "", newAddress: "", newCity: "" };
    const current = billToCustomer(job);
    const q = (d.query || "").trim().toLowerCase();
    const matches = state.customers.filter(function (c) {
      return !q || customerSearchHay(c).toLowerCase().indexOf(q) !== -1;
    });
    const head = '<div class="sheet-head"><div class="sheet-title">Bill to</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (current ? '<div class="muted" style="margin-bottom:10px">Currently ' + esc(current.name) + ". Changing this after an estimate exists saves a revised estimate under the same job number, like E01 to E02.</div>" : "");
    if (d.isNew) {
      return backdrop(head +
        '<button class="link-btn" style="margin-bottom:10px" ' + act("billToBackList") + ">← Back to customer list</button>" +
        '<label class="field"><div class="field-lab">Name</div><input id="bt-newName" value="' + esc(d.newName || "") + '" oninput="RT.setBillToField(\'newName\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Phone</div><input id="bt-newPhone" type="tel" value="' + esc(d.newPhone || "") + '" oninput="RT.setBillToField(\'newPhone\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Email (optional)</div><input id="bt-newEmail" type="email" value="' + esc(d.newEmail || "") + '" oninput="RT.setBillToField(\'newEmail\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">Billing address</div><input id="bt-newAddress" value="' + esc(d.newAddress || "") + '" oninput="RT.setBillToField(\'newAddress\', this.value)"></label>' +
        '<label class="field"><div class="field-lab">City</div><input id="bt-newCity" value="' + esc(d.newCity || "") + '" oninput="RT.setBillToField(\'newCity\', this.value)"></label>' +
        '<button class="btn teal"' + ((d.newName || "").trim() ? "" : " disabled") + ' ' + act("addBillToContact") + ">Add billing contact and use</button>");
    }
    return backdrop(head +
      '<div class="search">' + icon("search", 16) + '<input id="bt-q" type="search" placeholder="Search name, address, or phone" value="' + esc(d.query || "") + '" oninput="RT.setBillToField(\'query\', this.value)"></div>' +
      '<button class="dash" style="margin-bottom:12px" ' + act("billToNew") + ">Add a new billing contact</button>" +
      '<div class="stack">' + matches.map(function (c) {
        const on = current && current.id === c.id;
        return '<button class="list-card' + (on ? " sel" : "") + '" ' + act("pickBillTo", c.id) + '><div class="job-body"><div class="job-name" style="margin-top:0">' + esc(c.name) + "</div><div class=\"muted\">" + esc(formatAddrLine(c.address, c.city) || formatAddrLine(c.billingAddress, c.billingCity) || "No address") + "</div></div></button>";
      }).join("") + "</div>");
  }


  function unfiledSection() {
    const caps = state.unfiledCaptures || [];
    if (!caps.length) return "";
    return '<div class="section-row"><div class="section" style="margin:0">Unfiled</div><div class="muted">' + caps.length + (caps.length === 1 ? " item" : " items") + " with no job</div></div>" +
      '<div class="stack" style="margin-bottom:16px">' + caps.map(function (cap) {
        return '<div class="list-card"><div class="job-body"><div class="job-name" style="margin-top:0">' + esc(cap.title || "Capture") + '</div><div class="muted">' + esc(cap.body || cap.time || "") + "</div>" +
          (cap.photo ? '<img class="cap-thumb" alt="" src="' + cap.photo + '">' : "") +
          (cap.audio ? '<audio controls preload="metadata" src="' + cap.audio + '"></audio>' : "") +
          "</div><button class=\"btn ghost\" style=\"margin-top:8px\" " + act("openAttachCapture", cap.id) + ">Attach to a job</button></div>";
      }).join("") + "</div>";
  }
  function timelineItemHtml(item) {
    const iconFor = { call: "phone", note: "note", photo: "photo", reading: "reading", system: "chat", voice: "mic" };
    return '<div class="t-item"><div class="t-ico">' + icon(iconFor[item.kind] || "note", 16) + '</div><div style="min-width:0"><div class="meta">' + esc(item.time || "") + '</div><div style="font-weight:700;font-size:14px;margin:2px 0">' + esc(item.title || "") + "</div>" +
      (item.body ? '<div class="muted">' + esc(item.body) + "</div>" : "") +
      (item.photo ? '<img class="cap-thumb" alt="" src="' + item.photo + '">' : "") +
      (item.audio ? '<audio class="memo-audio" controls preload="metadata" src="' + item.audio + '"></audio>' : "") +
      "</div></div>";
  }
  function priceBookScreen() {
    const q = (state.priceBookQuery || "").trim().toLowerCase();
    const cat = state.priceBookCategory || "all";
    const filter = state.priceBookFilter || "all";
    const cats = bookCategories();
    const items = bookItems().filter(function (it) {
      if (cat !== "all" && it.category !== cat) return false;
      if (filter === "needs_ok" && it.status !== "needs_ok") return false;
      if (filter === "confirmed" && it.status !== "confirmed") return false;
      if (!q) return true;
      return [it.name, it.sku, it.category, it.detail, it.scope, it.source, it.sourceFile].join(" ").toLowerCase().indexOf(q) !== -1;
    });
    const needs = bookItems().filter(function (it) { return it.status === "needs_ok"; }).length;
    return topBar({ kicker: "ReliaTech Services", title: "Price book", badge: SHOW_SAMPLE_BADGE, settings: true }) +
      '<div class="content"><div class="pad">' +
      '<div class="muted" style="margin-bottom:12px">Confirmed service rates are ready to use and are not marked up again. Costed items show a proposed sell at 40% GP (35% floor). Refrigerant uses a 125% markup (sell = cost × 2.25). Draft flat-rate repairs show a first-repair price and an add-on price. OEM-part repairs are Custom quote templates: labor hours and scope only, no fixed price, until the OEM cost is entered on an estimate. Items stay marked Needs Steve’s OK until you approve them.</div>' +
      '<div class="search">' + icon("search", 16) + '<input id="pb-q" type="search" placeholder="Search the price book" value="' + esc(state.priceBookQuery || "") + '" oninput="RT.setPriceBookQuery(this.value)"></div>' +
      '<div class="chips">' +
        '<button class="chip' + (filter === "all" && cat === "all" ? " on" : "") + '" ' + act("pbFilter", "all") + ">All</button>" +
        '<button class="chip' + (filter === "needs_ok" ? " on" : "") + '" ' + act("pbFilter", "needs_ok") + ">Needs Steve’s OK" + (needs ? " · " + needs : "") + "</button>" +
        cats.map(function (c) { return '<button class="chip' + (cat === c ? " on" : "") + '" ' + act("pbCategory", c) + ">" + esc(c) + "</button>"; }).join("") +
      "</div>" +
      '<div class="row" style="gap:8px;margin:4px 0 14px;flex-wrap:wrap">' +
        '<button class="btn" style="flex:1;margin:0" ' + act("openNewBookItem") + ">Add item</button>" +
      "</div>" +
      priceBookStack(items) + "</div></div>" +
      tabBar();
  }
  function priceBookStack(items) {
    if (!items.length) return '<div class="stack"><div class="muted">No items match.</div></div>';
    const cat = state.priceBookCategory || "all";
    const flats = items.filter(isFlatRateItem);
    const quotes = items.filter(isCustomQuoteItem);
    const rest = items.filter(function (it) { return !isFlatRateItem(it) && !isCustomQuoteItem(it); });
    const showSections = cat === "all" && (flats.length || quotes.length) && rest.length && !(state.priceBookQuery || "").trim();
    if (!showSections) return '<div class="stack">' + items.map(priceBookCard).join("") + "</div>";
    let html = "";
    if (flats.length) html += '<div class="k-up" style="margin:4px 0 8px">Flat-rate repairs</div><div class="stack">' + flats.map(priceBookCard).join("") + "</div>";
    if (quotes.length) html += '<div class="k-up" style="margin:18px 0 8px">Custom quote</div><div class="stack">' + quotes.map(priceBookCard).join("") + "</div>";
    if (rest.length) html += '<div class="k-up" style="margin:18px 0 8px">Rates, parts, and equipment</div><div class="stack">' + rest.map(priceBookCard).join("") + "</div>";
    return html;
  }
  function priceBookCard(it) {
    const sell = sellOf(it);
    const custom = isCustomQuoteItem(it);
    const flat = !custom && isFlatRateItem(it) ? flatRatePrices(it) : null;
    const needs = it.status === "needs_ok";
    return '<button class="list-card book-row" ' + act("openBookItem", it.id) + '><div class="job-body" style="width:100%">' +
      '<div class="row"><div class="job-name" style="margin-top:0">' + esc(it.name) + "</div><div style=\"font-weight:750\">" + (custom ? "Quote" : (flat ? money(flat.first) : (sell != null ? money(sell) : "—"))) + (flat || custom || !it.unit ? "" : '<span class="meta">/' + esc(it.unit) + "</span>") + "</div></div>" +
      (custom ? '<div class="muted">Custom quote · ' + (it.laborHours || "—") + " hr template · OEM cost at quote" + (it.needsRefrigerant ? " · refrigerant if needed" : "") + "</div>" :
      (flat ? '<div class="muted">First ' + money(flat.first) + " · Add-on " + money(flat.addOn) + (it.partCostMissing ? " · Part cost missing" : "") + (it.hoursSource === "estimate" ? " · Hours estimate" : "") + "</div>" :
      '<div class="muted">' + esc(it.category || "") + (it.sku ? " · " + esc(it.sku) : "") +
        (it.cost != null && it.cost !== "" ? " · Cost " + money(Number(it.cost)) : "") +
        (sell != null && Number(it.cost) > 0 && !it.sellLocked ? " · GP " + (Math.round((1 - Number(it.cost) / sell) * 1000) / 10) + "%" : (it.gp != null && it.gp !== "" ? " · GP " + it.gp + "%" : "")) +
        (isRefrigerantItem(it) && sell != null && Number(it.cost) > 0 ? " · " + markupFromSell(it.cost, sell) + "% markup" : "") +
      "</div>")) +
      (needs ? '<div style="margin-top:6px">' + pill("Needs Steve’s OK", "#8A4B08", "#F6E2B8") + "</div>" : "") +
      "</div></button>";
  }
  function customQuoteEditSheet(d, isNew, floorWarn) {
    const rates = flatRateConstants();
    const hours = Number(d.laborHours) || 0;
    const laborSell = hours * rates.labor;
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (isNew ? "Add custom quote" : "Custom quote") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (d.status === "needs_ok" ? '<div class="warn-banner">Needs Steve’s OK. This is a template only — no fixed price. Review the scope and labor hours, then tap Approve.</div>' : "") +
      (d.hoursSource === "estimate" ? '<div class="warn-banner">Labor hours are an estimate. No published task time was found for this repair.</div>' : "") +
      (floorWarn ? '<div class="warn-banner">' + esc(floorWarn) + "</div>" : "") +
      '<label class="field"><div class="field-lab">Name</div><input id="pb-name" value="' + esc(d.name || "") + '" oninput="RT.setPriceDraft(\'name\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Category</div><input id="pb-category" value="' + esc(d.category || "Custom quote") + '" oninput="RT.setPriceDraft(\'category\', this.value)"></label>' +
      '<div class="k-up" style="margin:8px 0 6px">Customer-facing scope</div>' +
      '<div class="scope-block">' + esc(d.scope || "") + "</div>" +
      '<label class="field"><div class="field-lab">Scope</div><textarea id="pb-scope" rows="10" oninput="RT.setPriceDraft(\'scope\', this.value)">' + esc(d.scope || "") + "</textarea></label>" +
      '<label class="field"><div class="field-lab">Labor hours (template)</div><input id="pb-laborHours" inputmode="decimal" value="' + esc(d.laborHours === 0 || d.laborHours ? String(d.laborHours) : "") + '" oninput="RT.setPriceDraft(\'laborHours\', this.value)"></label>' +
      '<div class="note steve-only" style="margin-top:10px"><div class="k-up">Steve only</div>' +
        "<div>No fixed price. On an estimate, enter the OEM part cost" + (d.needsRefrigerant ? " and refrigerant if it is used" : "") + ".</div>" +
        "<div>Labor " + hours + " hr × " + money(rates.labor) + " = " + money(laborSell) + "</div>" +
        "<div>First repair also adds diagnostic " + money(rates.diagnostic) + " and truck " + money(rates.truck) + ".</div>" +
        "<div>Part sell uses 40% GP (35% floor). Refrigerant, if entered, uses a 125% markup (cost × 2.25).</div>" +
        (d.hoursNote ? '<div class="muted" style="margin-top:6px">' + esc(d.hoursNote) + "</div>" : "") +
      "</div>" +
      (d.source ? '<div class="note">Source: ' + esc(d.source) + (d.sourceFile ? " (" + esc(d.sourceFile) + ")" : "") + "</div>" : "") +
      '<button class="btn teal" ' + act("saveBookItem") + ">" + (isNew ? "Add item" : "Save") + "</button>" +
      (d.status === "needs_ok" && !isNew ? '<button class="btn accent" style="margin-top:8px" ' + act("approveBookItem") + ">Approve</button>" : "")
    );
  }
  function customQuoteAddSheet() {
    const d = state.customQuoteDraft; if (!d) return "";
    const item = getBookItem(d.itemId);
    if (!item) return "";
    const already = (state.packDraft || []).some(function (l) { return l.flatRate || l.customQuote; });
    const p = customQuotePrices(item, d);
    const useFirst = !already;
    const price = useFirst ? p.first : p.addOn;
    const refOn = !!item.needsRefrigerant;
    const ready = Number(d.partCost) > 0;
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Custom quote</div><button class="icon-btn ghost" ' + act("closeCustomQuote") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      '<div style="font-weight:750;margin-bottom:6px">' + esc(item.name) + "</div>" +
      '<div class="muted" style="margin-bottom:10px">' + (item.laborHours || "—") + " hr labor template. Enter the OEM part cost to build the price.</div>" +
      (item.scope ? '<div class="scope-block" style="max-height:160px;overflow:auto">' + esc(item.scope) + "</div>" : "") +
      '<label class="field"><div class="field-lab">OEM part cost</div><input id="cq-partCost" inputmode="decimal" value="' + esc(d.partCost === 0 || d.partCost ? String(d.partCost) : "") + '" oninput="RT.setCustomQuoteField(\'partCost\', this.value)"></label>' +
      (p.hasPart ? '<div class="muted" style="margin:-6px 0 10px">Part sell ' + money(p.partSell) + " at 40% GP</div>" : "") +
      (refOn
        ? '<div class="k-up" style="margin:4px 0 6px">Refrigerant (if needed)</div>' +
          '<label class="field"><div class="field-lab">Pounds</div><input id="cq-refLbs" inputmode="decimal" value="' + esc(d.refLbs === 0 || d.refLbs ? String(d.refLbs) : "") + '" oninput="RT.setCustomQuoteField(\'refLbs\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Cost per lb</div><input id="cq-refCost" inputmode="decimal" value="' + esc(d.refCost === 0 || d.refCost ? String(d.refCost) : "") + '" oninput="RT.setCustomQuoteField(\'refCost\', this.value)"></label>' +
          (p.refSell ? '<div class="muted" style="margin:-6px 0 10px">Refrigerant sell ' + money(p.refSell) + " (125% markup)</div>" : '<div class="muted" style="margin:-6px 0 10px">Leave blank if recovered refrigerant is reused and no new charge is added.</div>')
        : "") +
      '<div class="note steve-only"><div class="k-up">Steve only</div>' +
        "<div>Labor " + p.hours + " hr × " + money(p.laborRate) + " = " + money(p.laborSell) + "</div>" +
        (useFirst ? "<div>Diagnostic " + money(p.diagnostic) + " + truck " + money(p.truck) + " (first repair on this estimate)</div>" : "<div>Add-on: no diagnostic or truck (already on the first repair)</div>") +
        (p.hasPart ? "<div>Part cost " + money(p.partCost) + " → sell " + money(p.partSell) + "</div>" : "<div>Enter the OEM part cost to finish the quote.</div>") +
        (p.refSell ? "<div>Refrigerant " + p.refLbs + " lb × " + money(p.refCost) + " cost → sell " + money(p.refSell) + "</div>" : "") +
        (ready ? '<div style="margin-top:6px;font-weight:700">' + (useFirst ? "First repair " : "Add-on ") + money(price) + "</div>" : "") +
      "</div>" +
      '<button data-pin class="btn accent" style="margin-top:12px" ' + act("confirmCustomQuote") + ">" + (ready ? "Add to estimate · " + money(price) : "Enter the OEM part cost") + "</button>"
    );
  }
  function flatRateEditSheet(d, isNew, floorWarn) {
    const p = flatRatePrices(d) || { first: d.firstPrice, addOn: d.addOnPrice, hours: d.laborHours, laborSell: 0, partSell: 0, partCost: d.partCost, diagnostic: 150, truck: 65, laborRate: 85 };
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (isNew ? "Add flat-rate repair" : "Flat-rate repair") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (d.status === "needs_ok" ? '<div class="warn-banner">Needs Steve’s OK. Draft first-repair and add-on prices are shown. Review them, then tap Approve.</div>' : "") +
      (d.partCostMissing ? '<div class="warn-banner">Part cost missing. The prices below are labor' + (isNew ? "" : ", diagnostic, and truck") + " only until a recorded cost is entered.</div>" : "") +
      (d.hoursSource === "estimate" ? '<div class="warn-banner">Labor hours are an estimate. No published task time was found for this repair.</div>' : "") +
      (floorWarn ? '<div class="warn-banner">' + esc(floorWarn) + "</div>" : "") +
      '<label class="field"><div class="field-lab">Name</div><input id="pb-name" value="' + esc(d.name || "") + '" oninput="RT.setPriceDraft(\'name\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Category</div><input id="pb-category" value="' + esc(d.category || "Flat-rate repairs") + '" oninput="RT.setPriceDraft(\'category\', this.value)"></label>' +
      '<div class="k-up" style="margin:8px 0 6px">Customer-facing scope</div>' +
      '<div class="scope-block">' + esc(d.scope || "") + "</div>" +
      '<label class="field"><div class="field-lab">Scope</div><textarea id="pb-scope" rows="10" oninput="RT.setPriceDraft(\'scope\', this.value)">' + esc(d.scope || "") + "</textarea></label>" +
      '<div class="row" style="margin:8px 0 2px"><div style="font-weight:750">First repair</div><div style="font-weight:750">' + money(p.first) + '</div></div>' +
      '<div class="row" style="margin:0 0 8px"><div style="font-weight:750">Add-on</div><div style="font-weight:750">' + money(p.addOn) + "</div></div>" +
      '<label class="field"><div class="field-lab">Labor hours</div><input id="pb-laborHours" inputmode="decimal" value="' + esc(d.laborHours === 0 || d.laborHours ? String(d.laborHours) : "") + '" oninput="RT.setPriceDraft(\'laborHours\', this.value)"></label>' +
      (d.noPart ? "" : '<label class="field"><div class="field-lab">Part cost' + (d.partCostMissing ? " (missing — flagged)" : "") + "</div><input id=\"pb-partCost\" inputmode=\"decimal\" value=\"" + esc(d.partCost === 0 || d.partCost ? String(d.partCost) : "") + '" oninput="RT.setPriceDraft(\'partCost\', this.value)"></label>') +
      '<label class="field"><div class="field-lab">First-repair price</div><input id="pb-firstPrice" inputmode="decimal" value="' + esc(p.first != null ? String(p.first) : "") + '" oninput="RT.setPriceDraft(\'firstPrice\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Add-on price</div><input id="pb-addOnPrice" inputmode="decimal" value="' + esc(p.addOn != null ? String(p.addOn) : "") + '" oninput="RT.setPriceDraft(\'addOnPrice\', this.value)"></label>' +
      flatBreakdownHtml(d) +
      (d.source ? '<div class="note">Source: ' + esc(d.source) + (d.sourceFile ? " (" + esc(d.sourceFile) + ")" : "") + "</div>" : "") +
      '<button class="btn teal" ' + act("saveBookItem") + ">" + (isNew ? "Add item" : "Save") + "</button>" +
      (d.status === "needs_ok" && !isNew ? '<button class="btn accent" style="margin-top:8px" ' + act("approveBookItem") + ">Approve</button>" : "")
    );
  }
  function priceBookEditSheet() {
    const d = state.priceDraft; if (!d) return "";
    const isNew = !!d._isNew;
    const sell = sellOf(d);
    const locked = !!d.sellLocked;
    const floorWarn = gpBelowFloor(Object.assign({}, d, { sell: sell }));
    const ref = isRefrigerantItem(d);
    if (isCustomQuoteItem(d)) return customQuoteEditSheet(d, isNew, floorWarn);
    if (isFlatRateItem(d)) return flatRateEditSheet(d, isNew, floorWarn);
    const sellLab = locked ? " (confirmed rate)" : (ref ? " · cost × " + (1 + bookSettings().refrigerantMinMarkup / 100).toFixed(2).replace(/\.00$/, "") + " (min " + bookSettings().refrigerantMinMarkup + "% markup / " + markupToGp(bookSettings().refrigerantMinMarkup) + "% GP)" : " · cost ÷ (1 − GP); default " + bookSettings().defaultGp + "%, floor " + bookSettings().minGp + "%");
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">' + (isNew ? "Add price book item" : "Edit item") + '</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (d.status === "needs_ok" ? '<div class="warn-banner">Needs Steve’s OK. Proposed sell is shown. Review it, then tap Approve.</div>' : "") +
      (floorWarn ? '<div class="warn-banner">' + esc(floorWarn) + "</div>" : "") +
      '<label class="field"><div class="field-lab">Name</div><input id="pb-name" value="' + esc(d.name || "") + '" oninput="RT.setPriceDraft(\'name\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Category</div><input id="pb-category" value="' + esc(d.category || "") + '" oninput="RT.setPriceDraft(\'category\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">SKU</div><input id="pb-sku" value="' + esc(d.sku || "") + '" oninput="RT.setPriceDraft(\'sku\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Unit</div><input id="pb-unit" value="' + esc(d.unit || "ea") + '" oninput="RT.setPriceDraft(\'unit\', this.value)"></label>' +
      (locked ? "" : '<label class="field"><div class="field-lab">Cost</div><input id="pb-cost" inputmode="decimal" value="' + esc(d.cost === 0 || d.cost ? String(d.cost) : "") + '" oninput="RT.setPriceDraft(\'cost\', this.value)"></label>') +
      (locked ? "" : '<label class="field"><div class="field-lab">GP %' + (ref ? " · equivalent of markup" : "") + "</div><input id=\"pb-gp\" inputmode=\"decimal\" placeholder=\"e.g. " + (ref ? markupToGp(bookSettings().refrigerantMinMarkup) : bookSettings().defaultGp) + '" value="' + esc(d.gp === 0 || d.gp ? String(d.gp) : (sell != null && Number(d.cost) > 0 ? String(gpFromSell(d.cost, sell) || "") : "")) + '" oninput="RT.setPriceDraft(\'gp\', this.value)"></label>') +
      (ref && !locked && sell != null && Number(d.cost) > 0 ? '<div class="muted" style="margin:-6px 0 10px">Markup on this item: ' + esc(String(markupFromSell(d.cost, sell))) + "%</div>" : "") +
      '<label class="field"><div class="field-lab">Sell price' + sellLab + "</div><input id=\"pb-sell\" inputmode=\"decimal\" " + (locked ? "readonly " : "") + 'value="' + esc(sell != null ? String(sell) : (d.sell === 0 || d.sell ? String(d.sell) : "")) + '" oninput="RT.setPriceDraft(\'sell\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Detail</div><textarea id="pb-detail" rows="3" oninput="RT.setPriceDraft(\'detail\', this.value)">' + esc(d.detail || "") + "</textarea></label>" +
      (d.source ? '<div class="note">Source: ' + esc(d.source) + (d.sourceFile ? " (" + esc(d.sourceFile) + ")" : "") + "</div>" : "") +
      '<button data-pin class="btn teal" ' + act("saveBookItem") + ">" + (isNew ? "Add item" : "Save") + "</button>" +
      (d.status === "needs_ok" && !isNew ? '<button class="btn accent" style="margin-top:8px" ' + act("approveBookItem") + ">Approve</button>" : "")
    );
  }
  function voiceMemoSheet() {
    const d = state.memoDraft || emptyMemoDraft();
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Voice memo</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (d.recording ? '<div class="memo-live">Recording… tap stop when you’re done.</div>' : "") +
      (d.error ? '<div class="warn-banner">' + esc(d.error) + "</div>" : "") +
      (d.data && !d.recording ? '<audio class="memo-audio" controls preload="metadata" src="' + d.data + '"></audio>' : "") +
      (d.recording
        ? '<button class="btn accent" ' + act("stopMemo") + ">Stop recording</button>"
        : '<button class="btn teal" ' + act("startMemo") + ">" + (d.data ? "Re-record" : "Start recording") + "</button>") +
      '<label class="field" style="margin-top:12px"><div class="field-lab">Caption (optional)</div><input id="memo-cap" value="' + esc(d.caption || "") + '" oninput="RT.setMemoCaption(this.value)"></label>' +
      '<div class="muted" style="margin-bottom:10px">Or choose an audio file if the mic isn’t available.</div>' +
      '<input type="file" accept="audio/*" aria-label="Voice memo file" onchange="RT.setMemoFile(this)">' +
      (d.data && !d.recording ? '<button class="btn" style="margin-top:12px" ' + act("saveMemo") + ">Save voice memo to this job</button>" : "")
    );
  }
  function voicePickSheet() {
    const p = state.voicePick; if (!p) return "";
    const actionLab = p.action === "clockOut" ? "Clock out" : "Clock in";
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Which job?</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (p.raw ? '<div class="muted" style="margin-bottom:10px">“' + esc(p.raw) + '” matches more than one active or upcoming job. Pick one to ' + esc(actionLab.toLowerCase()) + ".</div>" : "") +
      '<div class="stack">' + (p.matches || []).map(function (j) {
        const loc = serviceAddressOf(j);
        const line = formatAddrLine(loc && loc.address, loc && loc.city) || formatAddrLine(j.address, j.city) || "";
        return '<button class="list-card" ' + act("pickVoiceJob", j.id) + '><div class="job-body"><div class="job-name" style="margin-top:0">' + esc(j.customer) + " · #" + esc(j.id) + "</div>" +
          '<div class="muted">' + esc(line) + (j.problem ? " · " + esc(j.problem) : "") + "</div></div></button>";
      }).join("") + "</div>" +
      '<button class="btn ghost" style="margin-top:8px" ' + act("closeSheet") + ">Cancel</button>"
    );
  }
  const VOICE_PREFIX_RE = /^(?:(?:please\s+)?(?:new job|create (?:a )?(?:new )?job|start (?:a )?(?:new )?job|clock (?:me )?(?:in|out)|clock in|check in)(?:\s+(?:for|on|at))?\s+)/i;
  function voiceNamePart(text) {
    const t = String(text || "").trim();
    const m = t.match(VOICE_PREFIX_RE);
    const rest = m ? t.slice(m[0].length) : t;
    return { prefix: m ? m[0] : "", name: rest.split(",")[0].trim(), tail: rest.indexOf(",") !== -1 ? rest.slice(rest.indexOf(",")) : "" };
  }
  function voiceSuggestHtml(text) {
    const part = voiceNamePart(text);
    if (part.name.length < 2) return "";
    const list = voiceJobCustomerMatches(part.name).slice(0, 4);
    if (!list.length) return '<div class="muted">No customer matches “' + esc(part.name) + '” yet.</div>';
    return '<div class="field-lab">Matching customers · tap to use</div>' + list.map(function (c) {
      const a = primaryAddress(c);
      return '<button class="list-card" style="min-height:44px" ' + act("voiceUseCustomer", c.id) + '><div class="job-body"><div class="job-name" style="font-size:15px">' + esc(c.name) + '</div><div class="job-prob">' + esc((a ? addressLine(a) : formatAddrLine(c.address, c.city)) || c.phone || "") + "</div></div></button>";
    }).join("");
  }
  function updateVoiceSuggest(text) {
    const el = document.getElementById("voice-suggest");
    if (el) el.innerHTML = voiceSuggestHtml(text);
  }
  function voiceJobCustomerMatches(q) {
    const nq = normalizeName(q);
    if (!nq && String(q || "").replace(/\D/g, "").length < 4) return [];
    const ranked = rankedCustomers(q).map(function (x) { return x.c; });
    const extra = state.customers.filter(function (c) {
      return ranked.indexOf(c) === -1 && customerSearchHay(c).toLowerCase().indexOf(String(q).toLowerCase().trim()) !== -1;
    });
    return ranked.concat(extra).slice(0, 6);
  }
  function voiceJobCustomerPicker(d) {
    const list = voiceJobCustomerMatches(d.custQuery || "");
    return '<div class="note">Pick the customer from your list, or add a new one. The job is not created until a customer is chosen.</div>' +
      '<label class="field"><div class="field-lab">Find customer</div><input id="vj-cq" type="search" autocomplete="off" placeholder="Name, street, or phone" value="' + esc(d.custQuery || "") + '" oninput="RT.setVoiceJobField(\'custQuery\', this.value)"></label>' +
      '<div class="stack" style="margin-bottom:10px">' + (list.length ? list.map(function (c) {
        const a = primaryAddress(c);
        return '<button class="list-card" ' + act("voiceJobPickCust", c.id) + '><div class="job-body"><div class="job-name">' + esc(c.name) + '</div><div class="job-prob">' + esc((a ? addressLine(a) : formatAddrLine(c.address, c.city)) || c.phone || "") + "</div></div></button>";
      }).join("") : '<div class="muted">No customers match. Check the spelling or add a new customer.</div>') + "</div>" +
      '<button class="btn ghost" style="margin-bottom:12px" ' + act("voiceJobNewCust") + ">Not listed · New customer</button>";
  }
  function voiceNewJobSheet() {
    const d = state.voiceJobDraft; if (!d) return "";
    const cust = d.customerId ? getCustomer(d.customerId) : null;
    const addrs = cust ? serviceAddresses(cust) : [];
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">New job draft</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (d.raw ? '<div class="muted" style="margin-bottom:10px">“' + esc(d.raw) + '”</div>' : "") +
      '<div class="confirm-card">' +
        '<div class="confirm-row"><div class="field-lab">Job number</div><div class="h2">#' + esc(d.jobId) + "</div></div>" +
        (d.offerReason ? '<div class="muted" style="margin-bottom:8px">' + esc(d.offerReason) + "</div>" : "") +
      "</div>" +
      (d.isNewCustomer
        ? '<div class="note">New customer. Name, phone, and service address are required before the job is created.</div>' +
          '<label class="field"><div class="field-lab">Customer name</div><input id="vj-newName" autocomplete="off" value="' + esc(d.newName || "") + '" oninput="RT.setVoiceJobField(\'newName\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Phone</div><input id="vj-newPhone" type="tel" inputmode="tel" autocomplete="off" value="' + esc(d.newPhone || "") + '" oninput="RT.setVoiceJobField(\'newPhone\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">Service address</div><input id="vj-newAddress" autocomplete="off" value="' + esc(d.newAddress || "") + '" oninput="RT.setVoiceJobField(\'newAddress\', this.value)"></label>' +
          '<label class="field"><div class="field-lab">City</div><input id="vj-newCity" autocomplete="off" value="' + esc(d.newCity || "") + '" oninput="RT.setVoiceJobField(\'newCity\', this.value)"></label>' +
          (d.dupMatches && d.dupMatches.length ? '<div class="warn-banner" style="margin-bottom:8px">Did you mean an existing customer?</div><div class="stack" style="margin-bottom:8px">' + d.dupMatches.map(function (id) {
            const c = getCustomer(id); if (!c) return "";
            return '<button class="list-card" ' + act("voiceJobPickCust", c.id) + '><div class="job-body"><div class="job-name">Use ' + esc(c.name) + '</div><div class="job-prob">' + esc([formatAddrLine(c.address, c.city), c.phone].filter(Boolean).join(" · ")) + "</div></div></button>";
          }).join("") + '</div><button class="btn ghost" style="margin-bottom:12px" ' + act("voiceJobForceNew") + ">No, create a new customer</button>" : "") +
          '<button class="link-btn" style="margin:0 0 12px" ' + act("voiceJobPickExisting") + ">Pick an existing customer instead</button>"
        : (cust
          ? '<div class="confirm-row"><div class="field-lab">Customer</div><div class="h2">' + esc(cust.name) + "</div></div>" +
            '<button class="link-btn" style="margin:0 0 10px" ' + act("voiceJobChangeCust") + ">Change customer</button>" +
            (addrs.length > 1
              ? '<div class="field-lab">Service address</div><div class="stack" style="margin-bottom:12px">' + addrs.map(function (a) {
                  return '<button class="dash' + (d.addressId === a.id ? " sel" : "") + '" ' + act("voiceJobAddress", a.id) + ">" + esc(addressLine(a) || "Address") + "</button>";
                }).join("") + "</div>"
              : (addrs.length === 1 ? '<div class="muted" style="margin-bottom:12px">' + esc(addressLine(addrs[0])) + "</div>" : '<div class="muted" style="margin-bottom:12px">No service address on file yet.</div>'))
          : voiceJobCustomerPicker(d))
      ) +
      '<label class="field"><div class="field-lab">Problem</div><input id="vj-problem" value="' + esc(d.problem || "") + '" oninput="RT.setVoiceJobField(\'problem\', this.value)"></label>' +
      '<label class="field"><div class="field-lab">Requested time</div><input id="vj-whenLabel" value="' + esc(d.whenLabel || "") + '" oninput="RT.setVoiceJobField(\'whenLabel\', this.value)"></label>' +
      (d.whenIso ? '<div class="muted" style="margin-bottom:12px">Would schedule for ' + esc(formatWhen(d.whenIso)) + ".</div>" : "") +
      '<button class="btn teal" ' + act("confirmVoiceNewJob") + ">Confirm and create job #" + esc(d.jobId) + "</button>" +
      '<button class="btn ghost" style="margin-top:8px" ' + act("closeSheet") + ">Cancel</button>"
    );
  }
  function attachCaptureSheet() {
    const cap = (state.unfiledCaptures || []).find(function (c) { return c.id === state.attachCaptureId; });
    const q = (state.attachQuery || "").trim().toLowerCase();
    const jobs = state.jobs.filter(function (j) {
      if (j.status === "paid") return false;
      return !q || [j.id, j.customer, j.address, j.city, j.problem].join(" ").toLowerCase().indexOf(q) !== -1;
    });
    return backdrop(
      '<div class="sheet-head"><div class="sheet-title">Attach to a job</div><button class="icon-btn ghost" ' + act("closeSheet") + ' aria-label="Close">' + icon("close", 18) + "</button></div>" +
      (cap ? '<div class="muted" style="margin-bottom:10px">' + esc(cap.title || "Capture") + "</div>" : "") +
      '<div class="search">' + icon("search", 16) + '<input id="att-q" type="search" placeholder="Search jobs" value="' + esc(state.attachQuery || "") + '" oninput="RT.setAttachQuery(this.value)"></div>' +
      '<div class="stack">' + jobs.map(function (j) {
        return '<button class="list-card" ' + act("attachCaptureToJob", j.id) + '><div class="job-body"><div class="job-name" style="margin-top:0">' + esc(j.customer) + " · #" + j.id + '</div><div class="muted">' + esc(j.problem || "") + "</div></div></button>";
      }).join("") + "</div>"
    );
  }
  function formatWhen(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
    } catch (e) { return iso; }
  }
  function resizeDataUrl(data, cb) {
    const img = new Image();
    img.onload = function () {
      const max = 1280;
      let w = img.width, h = img.height;
      if (w > max || h > max) {
        const scale = Math.min(max / w, max / h);
        w = Math.round(w * scale); h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = function () { cb(data); };
    img.src = data;
  }

  function sheetHtml() {
    const s = state.sheet;
    if (!s) return "";
    if (s === "newCall") return newCallSheet();
    if (s === "equipment") return equipmentSheetV2();
    if (s === "rpBuilder") { const j = getJob(state.openJobId); return j ? rpSheet(j) : ""; }
    if (s === "siteSurvey") { const j = getJob(state.openJobId); return j ? siteSurveySheet(j) : ""; }
    if (s === "repairBuilder") { const j = getJob(state.openJobId); return j ? repairBuilderSheet(j) : ""; }
    if (s === "unitWork") { const j = getJob(state.openJobId); return j ? unitWorkSheet(j) : ""; }
    if (s === "address") return addressSheet();
    if (s === "moveAddress") return moveAddressSheet();
    if (s === "billTo") { const j = getJob(state.openJobId); return j ? billToSheet(j) : ""; }
    if (s === "viewEstimate") { const j = getJob(state.openJobId); return j ? viewEstimateSheet(j) : ""; }
    if (s === "approveEst") { const j = getJob(state.openJobId); return j ? approveEstSheet(j) : ""; }
    if (s === "estShare") { const j = getJob(state.openJobId); return j ? estShareSheet(j) : ""; }
    if (s === "scopeEdit") { const j = getJob(state.openJobId); return j ? scopeEditSheet(j) : ""; }
    if (s === "ask") { const j = getJob(state.openJobId); return j ? askSheetHandoff(j) : ""; }
    const job = getJob(state.openJobId);
    if (s === "note") return noteSheet();
    if (s === "part") return job ? partSheet() : "";
    if (s === "po") return job ? poSheet(job) : "";
    if (s === "vendor") return vendorSheet();
    if (s === "timeEdit") return job ? timeEditSheet(job) : "";
    if (s === "actingAs") return actingAsSheet();
    if (s === "voice") return voiceSheet();
    if (s === "voiceConfirm") return voiceConfirmSheet();
    if (s === "voicePick") return voicePickSheet();
    if (s === "voiceNewJob") return voiceNewJobSheet();
    if (s === "voiceMemo") return voiceMemoSheet();
    if (s === "priceBookEdit") return priceBookEditSheet();
    if (s === "attachCapture") return attachCaptureSheet();
    if (s === "photo") return photoSheet();
    if (s === "reading") return job ? readingSheet(job) : "";
    if (s === "ask") return job ? askSheet(job) : "";
    if (s === "approval") return job ? approvalSheet(job) : "";
    if (s === "invoice") return job ? (invList(job).length ? invoicesSheet(job) : invoiceSheet(job)) : "";
    if (s === "progress") return job ? progressSheet(job) : "";
    if (s === "closeout") return job ? closeoutSheet(job) : "";
    if (s === "reopen") return job ? reasonSheet(job, "reopen") : "";
    if (s === "callback") return job ? reasonSheet(job, "callback") : "";
    if (s === "pay") return job ? paySheet(job) : "";
    if (s === "send") return job ? sendSheet(job) : "";
    if (s === "paid") return job ? paidSheet(job) : "";
    if (s === "saved") return savedSheet();
    if (s === "customQuoteAdd") return customQuoteAddSheet();
    if (s === "priceBook") return job ? priceBookSheet(job) : "";
    if (s === "estScope") return job ? estScopeSheet(job) : "";
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
        '<button class="btn accent" data-pin ' + act("saveSchedule") + ">Save time on this visit</button>"
      );
    }
    return "";
  }

  function mainHtml() {
    if (state.proposal) { const ph = proposalScreen(); if (ph) return ph; }
    if (state.screen === "settings") return settingsScreen();
    if (state.screen === "dashList") return dashListScreen();
    if (state.screen === "plans") return plansScreen();
    if (state.screen === "timeCorrections") return timeCorrectionsScreen();
    if (state.openAddressId) {
      const a = getAddressById(state.openAddressId);
      const c = customerOfAddress(state.openAddressId) || getCustomer(state.openCustomerId);
      if (a && c) return addressDetail(a, c);
    }
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
    if (state.tab === "pricebook") return priceBookScreen();
    if (state.tab === "home") return dashboardScreen();
    return jobsList();
  }

  function renderScrollKeep(root) {
    const sh = root.querySelector(".sheet"), ct = root.querySelector(".content");
    return { sheet: sh ? sh.scrollTop : 0, content: ct ? ct.scrollTop : 0, win: window.scrollY || 0 };
  }
  function renderScrollRestore(root, k) {
    const sh = root.querySelector(".sheet"), ct = root.querySelector(".content");
    if (sh && k.sheet) sh.scrollTop = k.sheet;
    if (ct && k.content) ct.scrollTop = k.content;
    if (k.win && Math.abs((window.scrollY || 0) - k.win) > 1) window.scrollTo(0, k.win);
  }
  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    const toast = state.toast ? '<div class="toast">' + esc(state.toast) + "</div>" : "";
    const key = [state.tab, state.screen, state.openJobId, state.openCustomerId, state.openAddressId, state.sheet, state.viewEstimateId, state.dashListKey].join("|");
    const keep = renderScrollKeep(root);
    root.innerHTML = mainHtml() + sheetHtml() + photoViewHtml() + toast;
    if (key === state._viewKey) renderScrollRestore(root, keep);
    state._viewKey = key;
    applyInputHints(root);
    persist();
    ensureTimer();
  }

  function handle(name, arg) {
    if (handleProposal(name, arg)) return;
    if (handleScopeStep(name, arg)) return;
    if (handleCloseout(name, arg)) return;
    if (handleRepairBuilder(name, arg)) return;
    if (handleReplacementBuilder(name, arg)) return;
    if (handleEquipV2(name, arg)) return;
    if (handlePrePhase2(name, arg)) return;
    if (handlePhase1(name, arg)) return;
    if (name === "tab") { state.tab = arg; state.openJobId = null; state.openCustomerId = null; state.openAddressId = null; state.screen = null; state.query = ""; render(); return; }
    if (name === "filter") { state.filter = arg; render(); return; }
    if (name === "openJob") { state.openJobId = arg; state.openCustomerId = null; state.openAddressId = null; render(); return; }
    if (name === "closeJob") { state.openJobId = null; render(); return; }
    if (name === "openCustomer") { state.openCustomerId = arg; state.openAddressId = null; state.openJobId = null; render(); return; }
    if (name === "closeCustomer") { state.openCustomerId = null; state.openAddressId = null; render(); return; }
    if (name === "openAddress") {
      const a = getAddressById(arg);
      const c = customerOfAddress(arg);
      if (!a || !c) return;
      state.openCustomerId = c.id;
      state.openAddressId = a.id;
      state.openJobId = null;
      render(); return;
    }
    if (name === "closeAddress") { state.openAddressId = null; render(); return; }
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
      if (arg === "photo") state.photoDraft = emptyPhotoDraft();
      if (arg === "voiceMemo") state.memoDraft = emptyMemoDraft();
      if (arg === "paid") state.paidDraft = emptyPaidDraft();
      render(); return;
    }
    if (name === "setPaidMethod") {
      if (!state.paidDraft) state.paidDraft = emptyPaidDraft();
      state.paidDraft.method = arg || "Card/Stripe";
      render(); return;
    }
    if (name === "copyZelle") {
      copyText(zellePhoneDisplay(), "Zelle number copied");
      return;
    }
    if (name === "copyMemo") {
      const job = getJob(state.openJobId);
      if (!job) return;
      copyText(zelleMemo(job), "Memo copied");
      return;
    }
    if (name === "copyPayLink") {
      const job = getJob(state.openJobId);
      if (!job) return;
      copyText(customerPayUrl(job), "Payment link copied");
      return;
    }
    if (name === "copyInvoiceMsg") {
      const job = getJob(state.openJobId);
      if (!job) return;
      copyText(invoiceMessage(job), "Message copied");
      return;
    }
    if (name === "openNewCall") {
      state.sheet = "newCall"; state.newCallStep = 1;
      state.newCall = emptyNewCall();
      render(); return;
    }
    if (name === "newJobFromCustomer") {
      const c = getCustomer(arg);
      if (!c) return;
      const addrs = serviceAddresses(c);
      state.openCustomerId = c.id;
      state.sheet = "newCall";
      state.newCallStep = 1;
      state.newCall = emptyNewCall({ customerId: c.id, fromCustomer: true, custQuery: c.name, addressId: addrs.length === 1 ? addrs[0].id : "", billToCustomerId: c.id });
      render(); return;
    }
    if (name === "newJobFromAddress") {
      const a = getAddressById(arg);
      const c = customerOfAddress(arg);
      if (!a || !c) return;
      state.openCustomerId = c.id;
      state.openAddressId = a.id;
      state.sheet = "newCall";
      state.newCallStep = 1;
      state.newCall = emptyNewCall({ customerId: c.id, fromCustomer: true, custQuery: c.name, addressId: a.id, billToCustomerId: c.id });
      render(); return;
    }
    if (name === "pickAddress") { state.newCall.addressId = arg; render(); return; }
    if (name === "addEquipment") {
      const parts = String(arg || "").split("|");
      const cid = parts[0] || state.openCustomerId;
      const aid = parts[1] || state.openAddressId || "";
      const c = getCustomer(cid);
      if (!c) return;
      const loc = aid ? getAddressById(aid) : (serviceAddresses(c).length === 1 ? primaryAddress(c) : primaryAddress(c));
      state.openCustomerId = c.id;
      state.assetCustomerId = c.id;
      state.assetAddressId = loc ? loc.id : "";
      state.assetDraft = emptyAsset();
      state.assetEditingId = null;
      state.sheet = "equipment";
      render(); return;
    }
    if (name === "openAsset") {
      const parts = String(arg || "").split("|");
      const cid = parts[0];
      const aid = parts.slice(1).join("|");
      const home = findAssetHome(cid, aid);
      if (!home) return;
      state.assetCustomerId = home.customer.id;
      state.assetAddressId = home.address ? home.address.id : "";
      state.assetDraft = JSON.parse(JSON.stringify(home.asset));
      state.assetEditingId = home.asset.id;
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
      let loc = state.assetAddressId ? getAddressById(state.assetAddressId) : null;
      if (!loc) loc = primaryAddress(c);
      if (!loc) {
        ensureCustomerAddresses(c, state.customers);
        if (!serviceAddresses(c).length) {
          c.addresses.push(emptyAddress({ id: nextAddressId(c.id), address: c.address || "", city: c.city || "" }));
        }
        loc = primaryAddress(c);
      }
      if (!loc.assets) loc.assets = [];
      if (state.assetEditingId) {
        let found = false;
        serviceAddresses(c).forEach(function (a) {
          const i = (a.assets || []).findIndex(function (x) { return x.id === state.assetEditingId; });
          if (i >= 0) { a.assets[i] = draft; found = true; }
        });
        if (!found) loc.assets.push(draft);
      } else {
        loc.assets.push(draft);
      }
      state.sheet = null;
      showToast(draft.sample ? "Example equipment saved on this phone only" : "Equipment saved on this phone only");
      return;
    }
    if (name === "removeEquipment") {
      const c = getCustomer(state.assetCustomerId || state.openCustomerId);
      if (!c || !state.assetEditingId) return;
      serviceAddresses(c).forEach(function (a) {
        a.assets = (a.assets || []).filter(function (x) { return x.id !== state.assetEditingId; });
      });
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
      function lockAddress() {
        const nc = state.newCall;
        if (nc.isNew) return true;
        const c = getCustomer(nc.customerId);
        const addrs = serviceAddresses(c);
        if (addrs.length === 1) nc.addressId = addrs[0].id;
        if (addrs.length > 1 && !nc.addressId) { showToast("Pick a service address"); return false; }
        return true;
      }
      if (state.newCallStep === 1) {
        if (state.newCall.fromCustomer && !lockAddress()) { render(); return; }
        state.newCallStep = state.newCall.fromCustomer ? 3 : 2;
      } else if (state.newCallStep === 2) {
        if (!lockAddress()) { render(); return; }
        state.newCallStep = 3;
      }
      render(); return;
    }
    if (name === "ncNewCust") { state.newCall.isNew = true; state.newCall.customerId = ""; render(); return; }
    if (name === "ncBackList") { state.newCall.isNew = false; render(); return; }
    if (name === "ncAddQuery") { state.newCall.isNew = true; state.newCall.newName = state.newCall.custQuery.trim(); render(); return; }
    if (name === "pickCust") {
      state.newCall.customerId = arg;
      state.newCall.isNew = false;
      const c = getCustomer(arg);
      const addrs = serviceAddresses(c);
      state.newCall.addressId = addrs.length === 1 ? addrs[0].id : (addrs.some(function (a) { return a.id === state.newCall.addressId; }) ? state.newCall.addressId : "");
      state.newCall.billToCustomerId = arg;
      render(); return;
    }
    if (name === "createJob") {
      const nc = state.newCall;
      const id = nextJobId(state.jobs);
      let customerId = nc.customerId, customer, address, city, phone, addressId = nc.addressId || "", billToCustomerId = nc.billToCustomerId || "";
      if (nc.isNew) {
        customerId = nextCustomerId();
        customer = nc.newName.trim(); address = nc.newAddress.trim(); city = nc.newCity.trim() || "Long Beach"; phone = nc.newPhone.trim();
        const fresh = { id: customerId, name: customer, address: address, city: city, phone: phone, email: (nc.newEmail || "").trim(), billingSameAsService: true, billingAddress: "", billingCity: "", addresses: [], assets: [], mentions: [] };
        addressId = nextAddressId(customerId, [fresh].concat(state.customers));
        fresh.addresses = [emptyAddress({ id: addressId, address: address, city: city })];
        state.customers = [fresh].concat(state.customers);
        billToCustomerId = customerId;
      } else {
        const c = state.customers.find(function (x) { return x.id === customerId; });
        if (!c) return;
        ensureCustomerAddresses(c, state.customers);
        const loc = (addressId && getAddressById(addressId)) || primaryAddress(c);
        if (!loc) { showToast("Add a service address first"); return; }
        addressId = loc.id;
        customer = c.name; address = loc.address; city = loc.city; phone = loc.onsitePhone || c.phone;
        if (!billToCustomerId) billToCustomerId = c.id;
      }
      const problem = reportText(nc.chips, nc.detail, nc.urgency);
      const job = { id: id, customerId: customerId, customer: customer, address: address, city: city, phone: phone, problem: problem, status: "new", lineItems: [{ label: "Diagnostic", amount: 150 }], total: 150, readingSets: [], timeline: [t("t" + id, "call", "Just now", "Call", problem)], addressId: addressId, billToCustomerId: billToCustomerId, customerRef: nc.customerRef || "", referredBy: nc.referredBy || "", estimates: [] };
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
      const jobAddr = getJob(state.openJobId);
      if (saveNameplateToCustomer(c, d.nameplate, jobAddr && jobAddr.addressId)) extra = " Nameplate saved to the service address equipment profile.";
      state.noteDraft = emptyNoteDraft("visit");
      state.sheet = "saved";
      showToast(title + " saved on this phone only." + extra);
      return;
    }
    if (name === "savePhoto") {
      const d = state.photoDraft || emptyPhotoDraft();
      if (!d.data) { showToast("Take or choose a photo first"); return; }
      const item = { id: "p" + Date.now(), kind: "photo", time: "Just now", title: "Photo", body: d.caption || "Photo added to this job.", photo: d.data };
      const where = pushCapture(getJob(state.openJobId), item);
      state.photoDraft = emptyPhotoDraft();
      state.sheet = "saved";
      showToast(where === "job" ? "Photo saved on this job" : "Photo saved in Unfiled");
      return;
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
    if (name === "openPriceBook") { state.packTab = "all"; state.packQuery = ""; state.packTons = 3; state.packDraft = []; state.packCustomName = ""; state.packCustomAmount = ""; state.customQuoteDraft = null; state.sheet = "priceBook"; render(); return; }
    if (name === "packTab") { state.packTab = arg; render(); return; }
    if (name === "packTons") { state.packTons = Number(arg); render(); return; }
    if (name === "addItem") {
      const p = getBookItem(arg); if (!p) return;
      if (isCustomQuoteItem(p)) {
        state.customQuoteDraft = { itemId: p.id, partCost: "", refLbs: "", refCost: "", laborHours: p.laborHours };
        state.sheet = "customQuoteAdd";
        render(); return;
      }
      const flat = isFlatRateItem(p);
      const prices = flat ? flatRatePrices(p) : null;
      const sell = flat ? (prices ? prices.first : null) : sellOf(p);
      if (sell == null) { showToast("Set a sell price in the Price book first"); return; }
      const existing = state.packDraft.find(function (l) { return l.id === p.id; });
      if (existing) existing.qty += 1;
      else state.packDraft = state.packDraft.concat([{ id: p.id, label: p.name, amount: sell, qty: 1, unit: p.unit || "ea", fromBook: true, flatRate: flat, cost: flat ? ((prices && prices.partCost) || null) : ((p.cost != null && p.cost !== "" && !p.sellLocked) ? Number(p.cost) : null) }]);
      if (state.packDraft.some(function (l) { return isRepairLine(l); })) {
        state.packDraft = repriceFlatRateDraft(state.packDraft);
      }
      render(); return;
    }
    if (name === "closeCustomQuote") {
      state.customQuoteDraft = null;
      state.sheet = "priceBook";
      render(); return;
    }
    if (name === "confirmCustomQuote") {
      const d = state.customQuoteDraft; if (!d) return;
      const item = getBookItem(d.itemId); if (!item) return;
      if (!(Number(d.partCost) > 0)) { showToast("Enter the OEM part cost"); return; }
      const line = {
        id: item.id,
        label: item.name,
        amount: 0,
        qty: 1,
        unit: "ea",
        fromBook: true,
        customQuote: true,
        partCost: Number(d.partCost),
        refCost: Number(d.refCost) > 0 ? Number(d.refCost) : "",
        refLbs: Number(d.refLbs) > 0 ? Number(d.refLbs) : "",
        laborHours: item.laborHours
      };
      state.packDraft = repriceFlatRateDraft((state.packDraft || []).concat([line]));
      state.customQuoteDraft = null;
      state.sheet = "priceBook";
      showToast("Added custom quote");
      render(); return;
    }
    if (name === "addCustomLine") {
      const label = (state.packCustomName || "").trim();
      const amount = Number(state.packCustomAmount);
      if (!label || !isFinite(amount) || amount < 0) { showToast("Enter a description and amount"); return; }
      state.packDraft = state.packDraft.concat([{ id: "custom-" + Date.now(), label: label, amount: amount, qty: 1, unit: "", fromBook: false }]);
      state.packCustomName = "";
      state.packCustomAmount = "";
      render(); return;
    }
    if (name === "qty") {
      const parts = arg.split("|"); const i = Number(parts[0]); const dir = parts[1];
      const lines = state.packDraft.slice();
      if (!lines[i]) return;
      lines[i] = Object.assign({}, lines[i], { qty: lines[i].qty + (dir === "+" ? 1 : -1) });
      state.packDraft = repriceFlatRateDraft(lines.filter(function (l) { return l.qty > 0; }));
      render(); return;
    }
    if (name === "previewEst") { if (state.packDraft.length) { state.sheet = "estimatePreview"; render(); } return; }
    if (name === "saveEstimate") {
      const job = getJob(state.openJobId); if (!job) return;
      const lines = state.packDraft;
      job.lineItems = lines.map(function (l) { return { label: draftLabel(l) + ((l.flatRate || l.customQuote) && flatRoleLabel(l) ? " (" + flatRoleLabel(l) + ")" : ""), amount: lineTotal(l), id: l.id, cost: lineCostOf({ id: l.id, label: l.label, amount: l.amount, qty: 1, cost: l.cost }), fromBook: !!l.fromBook, flatRate: !!l.flatRate, customQuote: !!l.customQuote, flatRole: l.flatRole || null, parts: partsForLine(l), builder: l.builder || undefined }; });
      job.total = draftTotal(lines);
      if (!job.estimateId) job.estimateId = job.id + "-E01";
      if (!Array.isArray(job.estimates)) job.estimates = [];
      const rec = job.estimates.find(function (e) { return e.id === job.estimateId && !e.superseded; });
      const payload = { id: job.estimateId, lineItems: JSON.parse(JSON.stringify(job.lineItems)), total: job.total, billToCustomerId: job.billToCustomerId || job.customerId, createdAt: isoNow(), superseded: false };
      if (rec) Object.assign(rec, payload);
      else job.estimates.push(payload);
      const recS = job.estimates.find(function (e) { return e.id === job.estimateId && !e.superseded; });
      const sbT = state.scopeBuild && String(state.scopeBuild.text || "").trim();
      if (recS && sbT) { const sv = recS.scopeVersions || []; const lastS = sv[sv.length - 1]; if (!lastS || lastS.text !== sbT) recS.scopeVersions = sv.concat([{ v: (lastS ? lastS.v : 0) + 1, text: sbT, status: "Draft", at: isoNow(), fromBuild: true }]); }
      state.scopeBuild = null;
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
      if (!(Number(job.dueAmount) > 0)) job.dueAmount = Number(job.total) || 0;
      job.timeline = [{ id: "i" + Date.now(), kind: "system", time: "Just now", title: "Invoice sent", body: "Invoice " + job.invoiceId + " for " + money(job.total) + "." }].concat(job.timeline);
      state.sheet = null; showToast("Invoice " + job.invoiceId + " created"); return;
    }
    if (name === "markPaid") {
      const job = getJob(state.openJobId); if (!job) return;
      const d = state.paidDraft || emptyPaidDraft();
      const method = d.method || "Card/Stripe";
      const date = d.date || todayYmd();
      if (PAY_METHODS.indexOf(method) === -1) { showToast("Choose a payment method"); return; }
      if (!date) { showToast("Choose a payment date"); return; }
      const due = invoiceDue(job) || job.total || 0;
      job.invoiceId = job.invoiceId || (job.id + "-01");
      job.status = "paid";
      job.dueAmount = 0;
      job.paidMethod = method;
      job.paidDate = date;
      job.posted = { at: ptNow(), by: actingAs(), auto: true };
      job.timeline = [{ id: "pay" + Date.now(), kind: "system", time: "Just now", title: "Paid", body: "Invoice " + job.invoiceId + " marked paid, " + money(due) + ", " + method + " on " + date + ". Paid in full; job posted and locked." }].concat(job.timeline);
      state.sheet = null; showToast("Marked paid · " + method); return;
    }
    if (name === "pickTech") {
      state.currentTech = arg;
      if (state.sheet === "actingAs") state.sheet = null;
      render(); return;
    }
    if (name === "addTech") {
      const n = (state._newTech || "").trim().replace(/\s+/g, " ");
      if (!n) { showToast("Enter a tech name"); return; }
      const existing = (state.techRecords || []).find(function (r) { return techKey(r.name) === techKey(n); });
      if (existing) { state.currentTech = existing.name; state._newTech = ""; showToast(existing.name + " is already on the list"); return; }
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
    if (name === "stopVoice") { stopListening(); return; }
    if (name === "voiceUseCustomer") {
      const c = getCustomer(arg); if (!c) return;
      const part = voiceNamePart((state.voice && state.voice.text) || "");
      const prefix = part.prefix || "new job for ";
      state.voice.text = (prefix + c.name + (part.tail || "")).replace(/\s+/g, " ").trim();
      state.voice.pickedCustomerId = c.id;
      const inp = document.getElementById("voice-input");
      if (inp) inp.value = state.voice.text;
      updateVoiceSuggest(state.voice.text);
      if (!part.tail && /new job|create|start/i.test(prefix)) { if (inp) { inp.value = state.voice.text + ", "; state.voice.text = inp.value; inp.focus(); } }
      return;
    }
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
      const vAddrs = serviceAddresses(cust);
      state.newCall = emptyNewCall({ chips: [], detail: c.work || "", customerId: cust.id, fromCustomer: true, custQuery: cust.name, addressId: vAddrs.length === 1 ? vAddrs[0].id : "", billToCustomerId: cust.id });
      render(); return;
    }
    if (name === "toggleBillingSame") {
      const c = getCustomer(arg || state.openCustomerId);
      if (!c) return;
      c.billingSameAsService = c.billingSameAsService === false;
      if (c.billingSameAsService) { /* checked: hide separate billing address */ }
      else if (!c.billingAddress && primaryAddress(c)) {
        /* leave billing fields blank so Steve fills the owner or office address */
      }
      render(); return;
    }
    if (name === "addAddress") {
      const c = getCustomer(arg || state.openCustomerId);
      if (!c) return;
      state.addressCustomerId = c.id;
      state.addressEditingId = null;
      state.addressDraft = emptyAddress({ city: "Long Beach" });
      state.sheet = "address";
      render(); return;
    }
    if (name === "editAddress") {
      const a = getAddressById(arg);
      const c = customerOfAddress(arg);
      if (!a || !c) return;
      state.addressCustomerId = c.id;
      state.addressEditingId = a.id;
      state.addressDraft = JSON.parse(JSON.stringify(a));
      state.sheet = "address";
      render(); return;
    }
    if (name === "toggleAddressExample") {
      if (!state.addressDraft) state.addressDraft = emptyAddress();
      state.addressDraft.example = !state.addressDraft.example;
      render(); return;
    }
    if (name === "saveAddress") {
      const c = getCustomer(state.addressCustomerId || state.openCustomerId);
      if (!c) return;
      ensureCustomerAddresses(c, state.customers);
      const draft = JSON.parse(JSON.stringify(state.addressDraft || emptyAddress()));
      if (!(draft.address || "").trim() && !(draft.city || "").trim()) { showToast("Enter a street or city"); return; }
      if (!draft.id) draft.id = nextAddressId(c.id);
      if (!Array.isArray(draft.assets)) draft.assets = [];
      if (!Array.isArray(draft.mentions)) draft.mentions = [];
      if (state.addressEditingId) {
        const i = serviceAddresses(c).findIndex(function (x) { return x.id === state.addressEditingId; });
        if (i >= 0) {
          draft.assets = c.addresses[i].assets || [];
          draft.mentions = c.addresses[i].mentions || [];
          c.addresses[i] = draft;
        } else c.addresses.push(draft);
      } else {
        c.addresses.push(draft);
      }
      syncCustomerPrimary(c);
      state.sheet = null;
      state.openAddressId = draft.id;
      state.openCustomerId = c.id;
      showToast(draft.example ? "Example address saved on this phone only" : "Service address saved");
      return;
    }
    if (name === "moveAddress") {
      state.moveAddressId = arg;
      state.moveQuery = "";
      state.sheet = "moveAddress";
      render(); return;
    }
    if (name === "confirmMoveAddress") {
      const a = getAddressById(state.moveAddressId);
      const from = customerOfAddress(state.moveAddressId);
      const to = getCustomer(arg);
      if (!a || !from || !to || from.id === to.id) return;
      from.addresses = serviceAddresses(from).filter(function (x) { return x.id !== a.id; });
      syncCustomerPrimary(from);
      ensureCustomerAddresses(to, state.customers);
      to.addresses = serviceAddresses(to).concat([a]);
      syncCustomerPrimary(to);
      state.jobs.concat(state.moneyJobs || []).forEach(function (j) {
        if (j.addressId === a.id) {
          j.customerId = to.id;
          j.customer = to.name;
          j.address = a.address;
          j.city = a.city;
        }
      });
      (state.plans || []).forEach(function (p) {
        if (p.addressId === a.id) p.customerId = to.id;
      });
      (state.visits || []).forEach(function (v) {
        if (v.addressId === a.id) v.customerId = to.id;
      });
      state.openCustomerId = to.id;
      state.openAddressId = a.id;
      state.sheet = null;
      showToast("Address moved to " + to.name + ". Equipment and job history went with it.");
      return;
    }
    if (name === "openBillTo") {
      const job = getJob(state.openJobId);
      if (!job) return;
      state.billToDraft = { query: "", isNew: false, newName: "", newPhone: "", newEmail: "", newAddress: "", newCity: "Long Beach" };
      state.sheet = "billTo";
      render(); return;
    }
    if (name === "billToNew") {
      if (!state.billToDraft) state.billToDraft = { query: "", isNew: true, newName: "", newPhone: "", newEmail: "", newAddress: "", newCity: "Long Beach" };
      state.billToDraft.isNew = true;
      render(); return;
    }
    if (name === "billToBackList") {
      if (state.billToDraft) state.billToDraft.isNew = false;
      render(); return;
    }
    if (name === "pickBillTo") {
      const job = getJob(state.openJobId);
      const neu = getCustomer(arg);
      if (!job || !neu) return;
      const changed = applyBillToChange(job, neu.id);
      state.sheet = null;
      if (changed) showToast(job.estimateId && String(job.estimateId).indexOf("-E") !== -1 ? ("Bill to updated · estimate " + job.estimateId + " saved") : "Bill to updated");
      else showToast("Bill to is already " + neu.name);
      return;
    }
    if (name === "addBillToContact") {
      const d = state.billToDraft || {};
      const name = (d.newName || "").trim();
      if (!name) { showToast("Enter a name"); return; }
      const id = nextCustomerId();
      const contact = {
        id: id,
        name: name,
        phone: (d.newPhone || "").trim(),
        email: (d.newEmail || "").trim(),
        address: "",
        city: "",
        billingSameAsService: false,
        billingAddress: (d.newAddress || "").trim(),
        billingCity: (d.newCity || "").trim(),
        addresses: [],
        assets: [],
        mentions: []
      };
      state.customers = [contact].concat(state.customers);
      const job = getJob(state.openJobId);
      if (job) applyBillToChange(job, id);
      state.sheet = null;
      showToast("Billing contact added · " + name);
      return;
    }
    if (name === "viewEstimate") {
      state.viewEstimateId = arg;
      state.sheet = "viewEstimate";
      render(); return;
    }
    if (name === "captureNeedJob") { state._pendingCapture = arg; state.sheet = "pickJob"; render(); return; }
    if (name === "pbFilter") { state.priceBookFilter = arg; state.priceBookCategory = "all"; render(); return; }
    if (name === "pbCategory") { state.priceBookCategory = arg; state.priceBookFilter = "all"; render(); return; }
    if (name === "openNewBookItem") { state.priceDraft = Object.assign({}, emptyBookItem(), { _isNew: true }); state.sheet = "priceBookEdit"; render(); return; }
    if (name === "openBookItem") {
      const it = getBookItem(arg); if (!it) return;
      state.priceDraft = JSON.parse(JSON.stringify(it));
      state.sheet = "priceBookEdit";
      render(); return;
    }
    if (name === "saveBookItem") {
      const d = state.priceDraft; if (!d || !(d.name || "").trim()) { showToast("Name is required"); return; }
      const item = applyBookMath(Object.assign({}, d, { name: d.name.trim() }));
      delete item._isNew;
      if (!item.status) item.status = "needs_ok";
      if (d._isNew && item.status !== "confirmed") item.status = "needs_ok";
      const idx = bookItems().findIndex(function (x) { return x.id === item.id; });
      if (idx >= 0) state.priceBook[idx] = item;
      else state.priceBook = state.priceBook.concat([item]);
      state.priceDraft = null;
      state.sheet = null;
      showToast(d._isNew ? "Added · Needs Steve’s OK" : "Price book item saved");
      return;
    }
    if (name === "approveBookItem") {
      const d = state.priceDraft; if (!d) return;
      if (sellOf(d) == null) { showToast("Set a sell price or GP first"); return; }
      d.status = "confirmed";
      d.sell = sellOf(d);
      const item = applyBookMath(Object.assign({}, d));
      delete item._isNew;
      const warn = gpBelowFloor(item);
      const idx = bookItems().findIndex(function (x) { return x.id === item.id; });
      if (idx >= 0) state.priceBook[idx] = item;
      else state.priceBook = state.priceBook.concat([item]);
      state.priceDraft = null;
      state.sheet = null;
      showToast(warn ? ("Approved · " + warn) : "Approved");
      return;
    }
    if (name === "approveAllBookItems") {
      if (!isAdminTech(actingAs())) { showToast("Only Steve can approve the price book"); return; }
      let n = 0, below = 0;
      state.priceBook = bookItems().map(function (it) {
        if (it.status !== "needs_ok" || it.sellLocked) return it;
        const sell = sellOf(it);
        if (sell == null) return it;
        n += 1;
        const next = Object.assign({}, it, { status: "confirmed", sell: sell, gp: (Number(it.cost) > 0 ? gpFromSell(it.cost, sell) : it.gp) });
        if (gpBelowFloor(next)) below += 1;
        return next;
      });
      if (!n) { showToast("Nothing to approve"); return; }
      showToast(below ? ("Approved " + n + " item" + (n === 1 ? "" : "s") + " · " + below + " below the floor") : ("Approved " + n + " item" + (n === 1 ? "" : "s")));
      return;
    }
    if (name === "saveLineToBook") {
      const parts = String(arg || "").split("|");
      let label = "", amount = 0;
      if (parts[0] === "draft") {
        const line = state.packDraft[Number(parts[1])];
        if (!line) return;
        label = line.label; amount = line.amount;
      } else if (parts[0] === "saved") {
        const job = getJob(state.openJobId); if (!job) return;
        const rec = (job.estimates || []).find(function (e) { return e.id === parts[1]; }) || { lineItems: job.lineItems || [] };
        const line = (rec.lineItems || [])[Number(parts[2])];
        if (!line) return;
        label = line.label; amount = line.amount;
      }
      if (!label) return;
      if (lineInBook(label)) { showToast("That line is already in the price book"); return; }
      state.priceDraft = Object.assign({}, emptyBookItem(), { _isNew: true, name: label, sell: amount, status: "needs_ok", source: "Saved from an estimate in the ReliaTech app.", category: "Parts" });
      state.sheet = "priceBookEdit";
      render(); return;
    }
    if (name === "startMemo") { startMemoRecord(); return; }
    if (name === "stopMemo") { stopMemoRecord(false); return; }
    if (name === "saveMemo") {
      const d = state.memoDraft || emptyMemoDraft();
      if (!d.data) { showToast("Record or choose a memo first"); return; }
      const item = { id: "vm" + Date.now(), kind: "voice", time: "Just now", title: "Voice memo", body: d.caption || "Voice memo added to this job.", audio: d.data };
      const where = pushCapture(getJob(state.openJobId), item);
      state.memoDraft = emptyMemoDraft();
      state.sheet = "saved";
      showToast(where === "job" ? "Voice memo saved on this job" : "Voice memo saved in Unfiled");
      return;
    }
    if (name === "openAttachCapture") { state.attachCaptureId = arg; state.attachQuery = ""; state.sheet = "attachCapture"; render(); return; }
    if (name === "attachCaptureToJob") {
      const job = getJob(arg);
      const cap = (state.unfiledCaptures || []).find(function (c) { return c.id === state.attachCaptureId; });
      if (!job || !cap) return;
      job.timeline = [Object.assign({}, cap, { jobId: job.id })].concat(job.timeline || []);
      state.unfiledCaptures = state.unfiledCaptures.filter(function (c) { return c.id !== cap.id; });
      state.attachCaptureId = null;
      state.sheet = null;
      state.openJobId = job.id;
      showToast("Attached to job " + job.id);
      return;
    }
    if (name === "pickVoiceJob") {
      const job = getJob(arg); if (!job || !state.voicePick) return;
      const p = state.voicePick;
      state.voicePick = null;
      state.voiceConfirm = {
        action: p.action,
        raw: p.raw,
        tech: p.tech || state.currentTech || DEFAULT_TECH,
        customer: getCustomer(job.customerId) || { id: job.customerId, name: job.customer },
        customerId: job.customerId,
        customerName: job.customer,
        job: job,
        jobId: job.id,
        problem: job.problem,
        work: p.work || "",
        needsNewJob: false
      };
      state.sheet = "voiceConfirm";
      render(); return;
    }
    if (name === "voiceOfferNewJob") {
      const c = state.voiceConfirm || {};
      const customer = c.customerId ? getCustomer(c.customerId) : null;
      const addrs = customer ? serviceAddresses(customer) : [];
      const spoken = c.spoken || c.customerName || "";
      state.clockInAfterCreate = c.action === "clockIn";
      state._pendingVoiceRaw = c.raw || "";
      state.voiceConfirm = null;
      state.voiceJobDraft = {
        raw: c.raw || "",
        jobId: nextJobId(state.jobs),
        customerId: customer ? customer.id : "",
        customerName: customer ? customer.name : spoken,
        isNewCustomer: false,
        custQuery: customer ? "" : spoken,
        newName: customer ? "" : spoken,
        newPhone: "",
        newAddress: "",
        newCity: "Long Beach",
        addressId: addrs.length === 1 ? addrs[0].id : "",
        problem: c.work || "New call",
        whenLabel: "",
        whenIso: "",
        billToCustomerId: customer ? customer.id : "",
        offerReason: c.offerReason || "",
        clockAfter: c.action === "clockIn"
      };
      state.sheet = "voiceNewJob";
      render(); return;
    }
    if (name === "voiceJobPickCust") {
      const d = state.voiceJobDraft; const c = getCustomer(arg); if (!d || !c) return;
      ensureCustomerAddresses(c, state.customers);
      const addrs = serviceAddresses(c);
      Object.assign(d, { customerId: c.id, customerName: c.name, isNewCustomer: false, billToCustomerId: c.id, addressId: addrs.length === 1 ? addrs[0].id : "", dupMatches: [], dupOk: false });
      render(); return;
    }
    if (name === "voiceJobChangeCust") {
      const d = state.voiceJobDraft; if (!d) return;
      Object.assign(d, { custQuery: d.custQuery || d.customerName || "", customerId: "", isNewCustomer: false, addressId: "", billToCustomerId: "" });
      render(); return;
    }
    if (name === "voiceJobNewCust") {
      const d = state.voiceJobDraft; if (!d) return;
      Object.assign(d, { customerId: "", isNewCustomer: true, addressId: "", billToCustomerId: "", newName: d.newName || d.custQuery || "", dupMatches: [], dupOk: false });
      render(); return;
    }
    if (name === "voiceJobForceNew") {
      const d = state.voiceJobDraft; if (!d) return;
      d.dupOk = true; d.dupMatches = [];
      handle("confirmVoiceNewJob"); return;
    }
    if (name === "voiceJobPickExisting") {
      const d = state.voiceJobDraft; if (!d) return;
      Object.assign(d, { isNewCustomer: false, customerId: "", custQuery: d.custQuery || d.newName || "" });
      render(); return;
    }
    if (name === "voiceJobAddress") {
      if (!state.voiceJobDraft) return;
      state.voiceJobDraft.addressId = arg;
      render(); return;
    }
    if (name === "confirmVoiceNewJob") {
      const d = state.voiceJobDraft; if (!d) return;
      let customerId = d.customerId, customer, address = "", city = "", phone = "", addressId = d.addressId || "", billToCustomerId = d.billToCustomerId || "";
      if (!d.isNewCustomer && !d.customerId) { showToast("Pick a customer from the list, or tap New customer"); return; }
      if (d.isNewCustomer) {
        const name = (d.newName || "").trim();
        if (!name) { showToast("Enter the customer name"); return; }
        if (String(d.newPhone || "").replace(/\D/g, "").length < 10) { showToast("Enter a 10-digit phone number"); return; }
        if (!(d.newAddress || "").trim()) { showToast("Enter the service address"); return; }
        if (!d.dupOk) {
          const phoneDigits = String(d.newPhone || "").replace(/\D/g, "").slice(-10);
          const hits = state.customers.filter(function (c) {
            const cp = String(c.phone || "").replace(/\D/g, "").slice(-10);
            return (phoneDigits && cp && cp === phoneDigits) || scoreCustomer(name, c) >= 80;
          }).slice(0, 4).map(function (c) { return c.id; });
          if (hits.length) { d.dupMatches = hits; render(); showToast("Check: this may be an existing customer"); return; }
        }
        customerId = nextCustomerId();
        customer = name; address = (d.newAddress || "").trim(); city = (d.newCity || "").trim() || "Long Beach"; phone = (d.newPhone || "").trim();
        const fresh = { id: customerId, name: customer, address: address, city: city, phone: phone, email: "", billingSameAsService: true, billingAddress: "", billingCity: "", addresses: [], assets: [], mentions: [] };
        if (address) {
          addressId = nextAddressId(customerId, [fresh].concat(state.customers));
          fresh.addresses = [emptyAddress({ id: addressId, address: address, city: city })];
        }
        state.customers = [fresh].concat(state.customers);
        billToCustomerId = customerId;
      } else {
        const c = state.customers.find(function (x) { return x.id === customerId; });
        if (!c) { showToast("Pick a customer first"); return; }
        ensureCustomerAddresses(c, state.customers);
        const addrs = serviceAddresses(c);
        if (addrs.length > 1 && !addressId) { showToast("Pick a service address"); return; }
        const loc = (addressId && getAddressById(addressId)) || primaryAddress(c);
        if (loc) { addressId = loc.id; address = loc.address; city = loc.city; phone = loc.onsitePhone || c.phone; }
        else { address = c.address || ""; city = c.city || ""; phone = c.phone || ""; }
        customer = c.name;
        if (!billToCustomerId) billToCustomerId = c.id;
      }
      const id = nextJobId(state.jobs);
      const when = resolveRequestedTime(d.whenLabel || "");
      const problem = (d.problem || "").trim() || "New call";
      const job = {
        id: id,
        customerId: customerId,
        customer: customer,
        address: address,
        city: city,
        phone: phone,
        problem: problem,
        status: "new",
        lineItems: [{ label: "Diagnostic", amount: 150 }],
        total: 150,
        readingSets: [],
        timeline: [t("t" + id, "call", "Just now", "Call", problem)],
        addressId: addressId,
        billToCustomerId: billToCustomerId,
        customerRef: "",
        referredBy: "",
        estimates: [],
        schedule: (d.whenLabel || "").trim(),
        scheduledStart: when.iso || d.whenIso || ""
      };
      state.jobs = [job].concat(state.jobs);
      const clockAfter = !!(d.clockAfter || state.clockInAfterCreate);
      state.voiceJobDraft = null;
      state.openCustomerId = null;
      state.openJobId = id;
      state.tab = "jobs";
      if (clockAfter) {
        state.clockInAfterCreate = false;
        state.voiceConfirm = {
          action: "clockIn",
          raw: d.raw || "",
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
      state.sheet = null;
      showToast("Job " + id + " created");
      return;
    }

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
  let mediaRecorder = null;
  let memoChunks = [];
  let memoStream = null;
  function startMemoRecord() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      if (!state.memoDraft) state.memoDraft = emptyMemoDraft();
      state.memoDraft.error = "This browser can’t record audio. Choose an audio file instead.";
      state.sheet = "voiceMemo";
      render();
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      memoStream = stream;
      memoChunks = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
        : (MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : ""));
      mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function (e) { if (e.data && e.data.size) memoChunks.push(e.data); };
      mediaRecorder.onstop = function () {
        if (state._discardMemo) { state._discardMemo = false; return; }
        const blob = new Blob(memoChunks, { type: mediaRecorder && mediaRecorder.mimeType ? mediaRecorder.mimeType : "audio/webm" });
        const reader = new FileReader();
        reader.onload = function () {
          if (!state.memoDraft) state.memoDraft = emptyMemoDraft();
          state.memoDraft.data = String(reader.result || "");
          state.memoDraft.recording = false;
          render();
        };
        reader.readAsDataURL(blob);
        if (memoStream) memoStream.getTracks().forEach(function (t) { t.stop(); });
        memoStream = null;
      };
      mediaRecorder.start();
      if (!state.memoDraft) state.memoDraft = emptyMemoDraft();
      state.memoDraft.recording = true;
      state.memoDraft.error = "";
      state.sheet = "voiceMemo";
      render();
    }).catch(function () {
      if (!state.memoDraft) state.memoDraft = emptyMemoDraft();
      state.memoDraft.error = "Microphone permission was denied. Choose an audio file instead.";
      state.sheet = "voiceMemo";
      render();
    });
  }
  function stopMemoRecord(discard) {
    state._discardMemo = !!discard;
    if (state.memoDraft) state.memoDraft.recording = false;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      try { mediaRecorder.stop(); } catch (e) {}
    } else if (memoStream) {
      memoStream.getTracks().forEach(function (t) { t.stop(); });
      memoStream = null;
    }
    if (!discard) render();
  }
  function voiceContext() {
    return {
      job: state.openJobId ? getJob(state.openJobId) : null,
      customer: state.openCustomerId ? getCustomer(state.openCustomerId) : null
    };
  }
  function applyVoiceText(text) {
    voiceSession++;
    endVoiceSession();
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
    if (parsed.kind === "newJob") {
      parsed.draft.raw = parsed.raw;
      const picked = state.voice && state.voice.pickedCustomerId ? getCustomer(state.voice.pickedCustomerId) : null;
      if (picked && normalizeName(voiceNamePart(text).name) === normalizeName(picked.name)) {
        const addrs = serviceAddresses(picked);
        Object.assign(parsed.draft, { customerId: picked.id, customerName: picked.name, isNewCustomer: false, billToCustomerId: picked.id, addressId: addrs.length === 1 ? addrs[0].id : "" });
      }
      state.voiceJobDraft = parsed.draft;
      state.sheet = "voiceNewJob";
      render();
      return;
    }
    if (parsed.needsPick) {
      state.voicePick = parsed;
      state.sheet = "voicePick";
      render();
      return;
    }
    state.voiceConfirm = parsed;
    state.sheet = "voiceConfirm";
    render();
  }
  let voiceSession = 0;
  let voiceTimer = null;
  let voiceReleasedAt = 0;
  let voiceStartTimer = null;
  function endVoiceSession() {
    if (voiceTimer) { clearTimeout(voiceTimer); voiceTimer = null; }
    if (voiceStartTimer) { clearTimeout(voiceStartTimer); voiceStartTimer = null; }
    const r = recognition;
    recognition = null;
    if (r) {
      r.onresult = null; r.onerror = null; r.onend = null; r.onaudioend = null; r.onspeechend = null;
      try { r.stop(); } catch (e) {}
      try { r.abort(); } catch (e) {}
      voiceReleasedAt = Date.now();
    }
  }
  function releaseVoiceOnLeave() {
    if (!recognition && !voiceStartTimer) return;
    voiceSession++;
    endVoiceSession();
    if (state.voice && state.voice.listening) {
      state.voice.listening = false;
      state.voice.fallback = true;
      state.voice.error = "Mic stopped when the app went to the background. Tap Try again, or type it.";
      render();
    }
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) releaseVoiceOnLeave(); });
  window.addEventListener("pagehide", releaseVoiceOnLeave);
  function finishListening(sessionId, reason) {
    if (sessionId !== voiceSession) return;
    voiceSession++;
    endVoiceSession();
    const text = ((state.voice && state.voice.text) || "").trim();
    if (state.sheet !== "voice") { if (state.voice) state.voice.listening = false; return; }
    if (text && reason !== "error") { applyVoiceText(text); return; }
    state.voice = Object.assign({}, state.voice || {}, {
      listening: false,
      fallback: true,
      error: reason === "denied" ? "Microphone permission was denied. Type the command instead, or allow the mic for this site in Safari settings."
        : reason === "error" ? "Voice stopped. Tap Try again, or type the command."
        : "Didn’t catch that. Tap Try again and start talking, or type the command."
    });
    render();
  }
  function stopListening() {
    finishListening(voiceSession, "stop");
  }
  function startListening() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceSession++;
    endVoiceSession();
    if (typeof stopMemoRecord === "function" && state.memoDraft && state.memoDraft.recording) try { stopMemoRecord(true); } catch (e) {}
    if (!Ctor) {
      state.voice = { listening: false, text: state.voice && state.voice.text || "", fallback: true, error: "This browser doesn’t support voice. Type the command instead. On iPhone, use Safari." };
      state.sheet = "voice";
      render();
      return;
    }
    const sid = voiceSession;
    try {
      const rec = new Ctor();
      recognition = rec;
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      let finalText = "";
      rec.onresult = function (ev) {
        if (sid !== voiceSession) return;
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript + " ";
          else interim += ev.results[i][0].transcript;
        }
        state.voice.text = (finalText + interim).replace(/\s+/g, " ").trim();
        const el = document.getElementById("voice-text");
        if (el) el.textContent = state.voice.text;
        if (voiceTimer) clearTimeout(voiceTimer);
        voiceTimer = setTimeout(function () { finishListening(sid, "timeout"); }, interim ? 2500 : 1200);
        if (ev.results[ev.results.length - 1].isFinal) finishListening(sid, "final");
      };
      rec.onerror = function (ev) {
        if (sid !== voiceSession) return;
        const e = ev && ev.error;
        if (e === "no-speech" || e === "aborted") { finishListening(sid, "nospeech"); return; }
        finishListening(sid, (e === "not-allowed" || e === "service-not-allowed") ? "denied" : "error");
      };
      rec.onend = function () { finishListening(sid, "end"); };
      rec.onspeechend = function () {
        if (sid !== voiceSession) return;
        if (voiceTimer) clearTimeout(voiceTimer);
        voiceTimer = setTimeout(function () { finishListening(sid, "timeout"); }, 900);
      };
      state.voice = { listening: true, text: "", fallback: false, error: "" };
      state.sheet = "voice";
      render();
      /* iOS needs a moment to hand the mic back after the last session. */
      const wait = Math.max(0, 450 - (Date.now() - voiceReleasedAt));
      const go = function () {
        voiceStartTimer = null;
        if (sid !== voiceSession) return;
        try { rec.start(); } catch (e) { finishListening(sid, "error"); return; }
        voiceTimer = setTimeout(function () { finishListening(sid, "timeout"); }, 12000);
      };
      if (wait) voiceStartTimer = setTimeout(go, wait); else go();
    } catch (err) {
      voiceSession++;
      endVoiceSession();
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
    if (h === "price-book" || h === "pricebook") { state.tab = "pricebook"; state.openJobId = null; state.openCustomerId = null; state.openAddressId = null; state.screen = null; return; }
    if (h === "time-corrections") { state.screen = "timeCorrections"; state.openJobId = null; state.openCustomerId = null; return; }
    if (h.indexOf("job/") === 0) {
      const id = h.slice(4);
      if (getJob(id) || (state.moneyJobs || []).some(function (j) { return j.id === id; })) {
        state.openJobId = id; state.openCustomerId = null; state.screen = null;
      }
      return;
    }
    if (h.indexOf("customer/") === 0) {
      const rest = h.slice(9);
      const addrIdx = rest.indexOf("/address/");
      if (addrIdx !== -1) {
        const cid = rest.slice(0, addrIdx);
        const aid = rest.slice(addrIdx + 9);
        if (getCustomer(cid) && getAddressById(aid)) {
          state.openCustomerId = cid; state.openAddressId = aid; state.openJobId = null; state.screen = null;
        }
      } else if (getCustomer(rest)) {
        state.openCustomerId = rest; state.openAddressId = null; state.openJobId = null; state.screen = null;
      }
    }
  }
  function syncHash() {
    let want = "";
    if (state.screen === "settings") want = "settings";
    else if (state.screen === "plans") want = "plans";
    else if (state.screen === "timeCorrections") want = "time-corrections";
    else if (state.openAddressId && state.openCustomerId) want = "customer/" + state.openCustomerId + "/address/" + state.openAddressId;
    else if (state.openCustomerId) want = "customer/" + state.openCustomerId;
    else if (state.openJobId) want = "job/" + state.openJobId;
    else if (state.tab === "pricebook") want = "price-book";
    const next = want ? ("#" + want) : (location.pathname + (location.search || "") + (location.hash && !want ? "" : ""));
    const cur = want ? ("#" + (location.hash || "").replace(/^#/, "")) : (location.pathname + (location.search || ""));
    if (want) {
      if (location.hash !== "#" + want) try { history.replaceState(null, "", "#" + want); } catch (e) {}
    } else if (location.hash) {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    }
  }
  Object.assign(window.RT, RT_EQUIP);
  Object.assign(window.RT, RT_RB);
  const _handleV1 = handle;
  handle = function (n, a) { _handleV1(n, a); postHandleEquipV2(n); if (n === "saveNote") migrateLegacyPhotos().then(function (k) { if (k) render(); }).catch(function () {}); };
  const _render0 = render;
  render = function () {
    _render0();
    syncHash();
    if (state._scrollTo) {
      const id = state._scrollTo; state._scrollTo = null;
      const el = document.getElementById(id);
      if (el && el.scrollIntoView) setTimeout(function () { try { el.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (e) { el.scrollIntoView(); } }, 30);
    }
  };

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  }
  window.addEventListener("hashchange", function () { applyHash(); _render0(); });
  applyHash();
  render();
})();

/* Stale-page guard: GitHub Pages lets Safari cache index.html for 10 minutes, and a home-screen app can resume an old page.
   On open and when the app comes back to the foreground, compare the deployed token with this page's token and reload once if newer. */
(function () {
  function curToken() { const s = document.querySelector('script[src*="app.js?v="]'); const m = s && s.getAttribute("src").match(/v=([^&]+)/); return m ? m[1] : ""; }
  function check() {
    const cur = curToken(); if (!cur || !window.fetch || location.protocol.indexOf("http") !== 0) return;
    fetch("index.html?check=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (t) {
      const m = t && t.match(/app\.js\?v=([^"&]+)/); if (!m || m[1] === cur) return;
      const key = "rt-reloaded-for-" + m[1];
      if (window.__rtReloadPending) return; window.__rtReloadPending = true;
      try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch (e) {}
      (function go() {
        if (window.RT && typeof window.RT._sheetOpen === "function" && window.RT._sheetOpen()) { setTimeout(go, 3000); return; }
        location.reload();
      })();
    }).catch(function () {});
  }
  setTimeout(check, 1500);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") check(); });
})();
