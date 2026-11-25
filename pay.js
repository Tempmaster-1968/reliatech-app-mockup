/* Customer invoice payment page. Loads only the invoice for this unguessable link — never the main app dataset. */
(function () {
  const VENMO = "Steve-Seguine";
  const ZELLE = "562-487-8750";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function money(n) {
    return Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
  }
  function venmoUrl(handle, amount, memo) {
    const h = String(handle || VENMO).replace(/^@/, "");
    const amt = Number(amount || 0).toFixed(2);
    return "https://venmo.com/" + encodeURIComponent(h) + "?txn=pay&amount=" + amt + "&note=" + encodeURIComponent(memo || "");
  }
  function show(html) {
    const root = document.getElementById("app");
    if (root) root.innerHTML = html;
  }
  function error(msg) {
    document.title = "Invoice not found — ReliaTech Services";
    const icon = asset("icon-180.png");
    show(
      '<div class="pay-brand"><img src="' + icon + '" alt=""><div><div class="kicker">ReliaTech Services</div><div class="title">Invoice</div></div></div>' +
      '<div class="pay-err"><div class="h1">Invoice not found</div><div class="muted">' + esc(msg) + "</div></div>"
    );
  }
  function copyText(text, btn) {
    const value = String(text || "");
    function ok() {
      if (btn) { const prev = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = prev; }, 1600); }
    }
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(ok).catch(fallback);
    } else fallback();
  }
  function validCode(c) {
    return /^[A-Za-z0-9]{10,32}$/.test(c || "");
  }
  /* Asset paths: this page may live at /pay/CODE/ or at /pay.html */
  function asset(name) {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.indexOf("pay") !== -1 && parts[parts.length - 1] !== "pay.html") return "../../" + name;
    return name;
  }
  function payCodeFromLocation() {
    const params = new URLSearchParams(location.search);
    const c = (params.get("c") || "").trim();
    if (validCode(c)) return c;
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts.lastIndexOf("pay");
    if (i !== -1 && parts[i + 1]) {
      const code = parts[i + 1].replace(/\.html$/i, "");
      if (validCode(code)) return code;
    }
    return "";
  }
  function dataUrl(code) {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.indexOf("pay") !== -1 && parts[parts.length - 1] !== "pay.html") return "data.json";
    return "pay/" + encodeURIComponent(code) + "/data.json";
  }
  function decodePayload(d) {
    try {
      const pad = d.length % 4 === 0 ? "" : "===".slice(0, 4 - (d.length % 4));
      const b64 = d.replace(/-/g, "+").replace(/_/g, "/") + pad;
      const json = decodeURIComponent(escape(atob(b64)));
      const p = JSON.parse(json);
      if (!p || typeof p !== "object") return null;
      return {
        invoiceId: String(p.invoiceId || ""),
        customerName: String(p.customerName || ""),
        lineItems: Array.isArray(p.lineItems) ? p.lineItems.map(function (l) {
          return { label: String((l && (l.label || l.name)) || "Item"), amount: Number(l && l.amount) || 0 };
        }) : [],
        amount: Number(p.amount) || 0,
        stripeUrl: String(p.stripeUrl || ""),
        venmoHandle: String(p.venmoHandle || VENMO),
        zellePhone: String(p.zellePhone || ZELLE),
        memo: String(p.memo || ("ReliaTech Invoice " + (p.invoiceId || ""))),
        note: p.note ? String(p.note) : ""
      };
    } catch (e) {
      return null;
    }
  }
  function render(inv) {
    if (!inv || !inv.invoiceId) { error("This payment link is missing invoice details."); return; }
    const handle = (inv.venmoHandle || VENMO).replace(/^@/, "");
    const zelle = inv.zellePhone || ZELLE;
    const memo = inv.memo || ("ReliaTech Invoice " + inv.invoiceId);
    const amount = Number(inv.amount) || 0;
    const lines = (inv.lineItems && inv.lineItems.length)
      ? inv.lineItems
      : [{ label: "Balance due", amount: amount }];
    const icon = asset("icon-180.png");
    document.title = "Invoice " + inv.invoiceId + " — ReliaTech Services";
    show(
      '<div class="pay-brand"><img src="' + icon + '" alt="ReliaTech"><div><div class="kicker">ReliaTech Services</div><div class="title">Invoice</div></div></div>' +
      '<div class="content"><div class="pad">' +
        '<div class="k-up">Invoice ' + esc(inv.invoiceId) + "</div>" +
        '<div class="h1" style="margin:4px 0 2px">' + esc(inv.customerName || "") + "</div>" +
        (inv.note ? '<div class="muted" style="margin-bottom:10px">' + esc(inv.note) + "</div>" : "") +
        '<div class="panel" style="margin:14px 0 18px">' +
          lines.map(function (l) {
            return '<div class="row" style="margin-top:6px"><div>' + esc(l.label) + "</div><div>" + money(l.amount) + "</div></div>";
          }).join("") +
          '<div class="row" style="margin-top:10px;font-weight:750"><div>Amount due</div><div>' + money(amount) + "</div></div>" +
        "</div>" +
        '<div class="pay-opt"><div class="h2">Card / Apple Pay</div><div class="muted">Pay with a card or Apple Pay on Stripe. You will see invoice ' + esc(inv.invoiceId) + " for " + money(amount) + ".</div>" +
          (inv.stripeUrl
            ? '<a class="btn teal" href="' + esc(inv.stripeUrl) + '" target="_blank" rel="noopener">Pay ' + money(amount) + " with card</a>"
            : '<div class="muted">A card payment link is not available for this invoice.</div>') +
        "</div>" +
        '<div class="pay-opt"><div class="h2">Venmo</div><div class="muted">Opens Venmo to @' + esc(handle) + " with the amount and invoice memo filled in.</div>" +
          '<a class="btn teal" href="' + esc(venmoUrl(handle, amount, memo)) + '" target="_blank" rel="noopener">Pay ' + money(amount) + " with Venmo</a>" +
        "</div>" +
        '<div class="pay-opt"><div class="h2">Zelle</div><div class="muted">Zelle has no payment link. Open your bank app, send to this number, and use the memo below.</div>' +
          '<div class="pay-row"><div><div class="field-lab" style="margin:0">Send to</div><div class="val">' + esc(zelle) + '</div></div><button class="btn ghost inline" type="button" data-copy="' + esc(zelle) + '">Copy number</button></div>' +
          '<div class="pay-row"><div><div class="field-lab" style="margin:0">Amount</div><div class="val">' + money(amount) + "</div></div></div>" +
          '<div class="pay-row"><div><div class="field-lab" style="margin:0">Memo</div><div class="val">' + esc(memo) + '</div></div><button class="btn ghost inline" type="button" data-copy="' + esc(memo) + '">Copy memo</button></div>' +
        "</div>" +
        '<div class="pay-foot">ReliaTech Services · Long Beach HVAC</div>' +
      "</div></div>"
    );
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    e.preventDefault();
    copyText(btn.getAttribute("data-copy") || "", btn);
  });

  const params = new URLSearchParams(location.search);
  /* Old guessable ?inv=invoice-number links are no longer supported. */
  if (params.get("inv") && !params.get("c")) {
    error("This payment link is no longer valid. Please ask ReliaTech Services for a new one.");
    return;
  }
  const packed = (params.get("d") || "").trim();
  const code = payCodeFromLocation();
  if (code) {
    const cParam = (params.get("c") || "").trim();
    if (cParam && validCode(cParam) && /pay\.html$/i.test(location.pathname)) {
      const dest = location.pathname.replace(/pay\.html$/i, "pay/" + encodeURIComponent(cParam) + "/");
      location.replace(dest);
      return;
    }
    fetch(dataUrl(code), { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(render)
      .catch(function () {
        error("This invoice link is not valid, or the invoice is no longer available.");
      });
    return;
  }
  if (packed) {
    const p = decodePayload(packed);
    if (p) render(p);
    else error("This invoice link could not be read.");
    return;
  }
  error("Open the payment link from your invoice message to see this invoice.");
})();
