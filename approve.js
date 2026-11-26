/* Customer estimate approval page. Static: nothing is saved or sent by this page.
   The customer texts or emails Steve an approval code, which he records in the app. */
(function () {
  "use strict";
  const root = document.getElementById("app");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { const v = Number(n) || 0; return (v < 0 ? "-$" : "$") + Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 5; i++) { out += chars[h % chars.length]; h = Math.floor(h / chars.length); }
    return out;
  }
  function code(est, nums, name) {
    const opts = nums.slice().sort(function (a, b) { return a - b; }).join("-");
    return est + "." + opts + "." + hash(est + "|" + opts + "|" + String(name || "").toLowerCase().replace(/[^a-z]/g, ""));
  }
  function decode(d) {
    try {
      const pad = d.length % 4 === 0 ? "" : "===".slice(0, 4 - (d.length % 4));
      return JSON.parse(decodeURIComponent(escape(atob(d.replace(/-/g, "+").replace(/_/g, "/") + pad))));
    } catch (e) { return null; }
  }
  const m = location.hash.match(/d=([A-Za-z0-9_-]+)/);
  const p = m ? decode(m[1]) : null;
  if (!p || !p.e || !Array.isArray(p.o)) {
    root.innerHTML = '<div class="pay-err"><div class="h2">This approval link is incomplete.</div><div class="muted" style="margin-top:8px">Please ask ReliaTech Services to send it again.</div></div>';
    return;
  }
  const st = { picked: p.o.map(function (o) { return o[0]; }), name: "", agree: false, done: null };
  function total() {
    let t = 0;
    p.o.forEach(function (o) { if (st.picked.indexOf(o[0]) !== -1) t += Number(o[2]) || 0; });
    const all = st.picked.length === p.o.length && p.o.length > 1;
    (p.d || []).forEach(function (d) { if (!/if (both|all)/i.test(d[0]) || all) t += Number(d[1]) || 0; });
    return st.picked.length ? t : 0;
  }
  function message() {
    const names = p.o.filter(function (o) { return st.picked.indexOf(o[0]) !== -1; }).map(function (o) { return "Option " + o[0] + " " + o[1]; });
    return "I approve ReliaTech estimate " + p.e + ": " + names.join(" + ") + ", total " + money(total()) + ".\nName: " + st.name.trim() + "\nApproval code: " + st.done;
  }
  function render() {
    const phone = String(p.t || "").replace(/[^\d+]/g, "");
    let h = '<div class="pay-brand"><img src="icon-180.png" alt=""><div><div class="kicker">ReliaTech Services</div><div class="title">Estimate ' + esc(p.e) + "</div></div></div>";
    h += '<div class="content" style="padding:16px 16px 40px">';
    h += '<div class="muted" style="margin-bottom:12px">Prepared for ' + esc(p.c) + (p.a ? "<br>" + esc(p.a) : "") + (p.x ? "<br>Valid through " + esc(p.x) : "") + "</div>";
    if (st.done) {
      const msg = message();
      h += '<div class="panel" style="border-left:4px solid #2F8F4E;margin-bottom:14px"><div class="h2" style="margin:0 0 6px">One more step: send it to Steve</div><div class="muted">This page can’t send anything by itself. Tap Text or Email below, then press Send in your messages app. Steve records your approval when he gets it.</div>' +
        '<div class="doc" style="white-space:pre-wrap;font-size:13px;margin-top:10px">' + esc(msg) + "</div></div>" +
        (phone ? '<a class="btn teal" style="display:flex;text-decoration:none;margin-bottom:8px" href="sms:' + esc(phone) + "&body=" + encodeURIComponent(msg) + '">Text it to Steve</a>' : "") +
        (p.m ? '<a class="btn ghost" style="display:flex;text-decoration:none;margin-bottom:8px" href="mailto:' + esc(p.m) + "?subject=" + encodeURIComponent("Approval " + p.e) + "&body=" + encodeURIComponent(msg) + '">Email it to Steve</a>' : "") +
        '<button class="btn ghost" data-a="back">Change my selection</button>';
    } else {
      h += '<div class="section">Choose what to approve</div><div class="stack" style="margin-bottom:12px">' + p.o.map(function (o) {
        const on = st.picked.indexOf(o[0]) !== -1;
        return '<button class="dash' + (on ? " sel" : "") + '" data-a="opt" data-n="' + o[0] + '" style="font-size:14px">' + (on ? "☑ " : "☐ ") + "Option " + o[0] + " · " + esc(o[1]) + " · " + money(o[2]) + "</button>";
      }).join("") + "</div>";
      (p.d || []).forEach(function (d) { h += '<div class="row" style="font-size:13px;margin-bottom:6px"><div>' + esc(d[0]) + "</div><div>" + money(d[1]) + "</div></div>"; });
      h += '<div class="row" style="font-weight:750;margin:10px 0 14px"><div>Total</div><div>' + money(total()) + "</div></div>";
      if (p.p) h += '<a class="btn ghost" style="display:flex;text-decoration:none;margin-bottom:12px" href="' + esc(p.p) + '" target="_blank" rel="noopener">Open the full estimate (PDF)</a>';
      if (p.s) h += '<details style="margin-bottom:14px"><summary class="section" style="cursor:pointer">Scope of work</summary><div class="doc" style="white-space:pre-wrap;font-size:13px;line-height:19px">' + esc(p.s) + "</div></details>";
      h += '<label class="field"><div class="field-lab">Your full name (typed signature)</div><input id="nm" autocomplete="name" value="' + esc(st.name) + '"></label>';
      h += '<button class="dash' + (st.agree ? " sel" : "") + '" data-a="agree" style="margin-bottom:12px;font-size:13px">' + (st.agree ? "☑ " : "☐ ") + "I approve the selected work at the total shown.</button>";
      h += '<button class="btn teal" data-a="approve">Approve</button>';
    }
    h += '<div class="pay-foot">Questions? Call or text Steve at ' + esc(p.t || "") + ".<br>Nothing is charged on this page.</div></div>";
    root.innerHTML = h;
    const nm = document.getElementById("nm");
    if (nm) nm.addEventListener("input", function () { st.name = nm.value; });
  }
  root.addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-a]"); if (!b) return;
    const a = b.getAttribute("data-a");
    if (a === "opt") { const n = Number(b.getAttribute("data-n")); st.picked = st.picked.indexOf(n) === -1 ? st.picked.concat([n]) : st.picked.filter(function (x) { return x !== n; }); render(); }
    else if (a === "agree") { st.agree = !st.agree; render(); }
    else if (a === "back") { st.done = null; render(); }
    else if (a === "approve") {
      if (!st.picked.length) { alert("Please choose at least one option."); return; }
      if (st.name.trim().length < 3) { alert("Please type your full name."); return; }
      if (!st.agree) { alert("Please check the approval box."); return; }
      st.done = code(p.e, st.picked, st.name); render(); window.scrollTo(0, 0);
    }
  });
  render();
})();
