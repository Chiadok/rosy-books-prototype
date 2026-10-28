/* Rosy Books clickable prototype. Static, no network calls, no storage of personal data.
   All names, amounts and businesses are fictional EXAMPLE data. */
"use strict";
(function () {
  const D = window.RB_DATA;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const fmtN = (n) => Math.abs(Math.round(n)).toLocaleString("en-US");
  const money = (n) => (n < 0 ? "(" : "") + "$" + fmtN(n) + (n < 0 ? ")" : "");
  const money2 = (n) => (n < 0 ? "−" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + "$" + fmtN(n);
  const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function w3(n) { let s = ""; const h = Math.floor(n / 100), r = n % 100; if (h) s += ONES[h] + " hundred"; if (r) { if (s) s += " "; s += r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? "-" + ONES[r % 10] : ""); } return s; }
  function words(v) {
    if (!isFinite(v) || v <= 0 || v >= 1000000) return "Enter an amount between $0.01 and $999,999.99";
    const d = Math.floor(v + 1e-9), c = Math.round((v - d) * 100), th = Math.floor(d / 1000), r = d % 1000;
    let s = ""; if (th) s += w3(th) + " thousand"; if (r) { if (s) s += " "; s += w3(r); } if (!s) s = "zero";
    return s.charAt(0).toUpperCase() + s.slice(1) + " and " + ("0" + c).slice(-2) + "/100 dollars";
  }
  const parseAmt = (s) => { const v = parseFloat(String(s || "").replace(/[$,\s]/g, "")); return isFinite(v) ? Math.round(v * 100) / 100 : NaN; };
  const nowLabel = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  // ---------------- state (in memory only; resets on reload) ----------------
  const S = {
    lvl: 1, helper: true, terms: false, theme: "light", panel: true,
    reg: "bank", entries: D.REG.map((r) => Object.assign({}, r)), card: D.CARD.slice(), feed: D.FEED.map((f) => Object.assign({ done: false }, f)),
    nextCheck: 1049, chk: { payee: "Brightline Print Co.", amt: "420.00", memo: "Bill BP-2291" }, add: { d: "Oct 28", no: "", p: "", c: "Office supplies", out: "", inn: "" }, addErr: "",
    receipts: D.RECEIPTS.map((r) => Object.assign({}, r)), rsel: 0, sampleIx: 0, rtotal: "$4?.18",
    tasks: [], waiting: [], history: [],
    perm: { cat: "ask", read: "ask", match: "ask", inv: "ask", ask: "ask" },
    learns: false, habits: D.HABITS.map((h) => Object.assign({}, h)), editHabit: null,
    inst: "check", hw: "16", dl: 0, dlPaused: false,
    rep: "pl", cmp: "year", dif: "amt", base: "off", fmt: "service", drill: 4,
    recon: "bank", mis: false, biz: "service", ent: "sole",
    mx: { feeds: 1, read: 0, cat: 0, ask: 1, inv: 1, bak: 0, upd: 0, acct: 1 },
    logF: "all", log: D.LOG.map((l) => Object.assign({}, l)), sentToday: 0,
    ai: { app: "Claude", connector: false, readOnly: true, drafts: false, scope: "totals", red: { names: true, memos: true, detail: false }, q: "How did this quarter compare to last quarter?", stage: "ask", answer: "" },
    hand: "send", handAccepted: false, inclReceipts: true,
    bills: D.BILLS.map((b) => Object.assign({ sel: false, paid: false }, b)),
    invoices: D.INVOICES.map((i) => Object.assign({}, i)),
    onb: 0, quiz: null, bk: { running: false, pct: 0, last: "this morning at 8:02 AM" },
  };
  S.bills[0].sel = true; S.bills[1].sel = true;

  // ---------------- tiny UI kit ----------------
  const GL = {
    l1: '<rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>',
    l2: '<rect x="1.5" y="5.5" width="7.5" height="5" rx="2.5"/><rect x="7" y="5.5" width="7.5" height="5" rx="2.5"/>',
    l3: '<path d="M4.5 12.5h7a3 3 0 0 0 .4-6 4 4 0 0 0-7.6 1A2.5 2.5 0 0 0 4.5 12.5z"/>',
    lo: '<rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M6.5 1.5v2M9.5 1.5v2M6.5 12.5v2M9.5 12.5v2M1.5 6.5h2M1.5 9.5h2M12.5 6.5h2M12.5 9.5h2"/>',
  };
  const glyph = (k, s) => `<svg width="${s || 16}" height="${s || 16}" viewBox="0 0 16 16" aria-hidden="true" focusable="false" style="flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">${GL[k]}</svg>`;
  const meter = (n) => `<span class="meter" aria-hidden="true">${[1, 2, 3].map((i) => `<span class="${i <= n ? "on" : ""}" style="height:${4 + i * 3}px"></span>`).join("")}</span>`;
  const badge = (n) => `<span class="badge l${n}" role="img" aria-label="Trust level ${n}, ${D.LV[n].name}">${glyph("l" + n, 14)}${meter(n)}Level ${n} · ${D.LV[n].name}</span>`;
  const chip = (k, t) => `<span class="chip ${k}">${glyph(k, 14)}<span>${t}</span></span>`;
  const TAGSYM = { ok: "●", warn: "▲", bad: "■", info: "◆", plain: "○" };
  const tag = (t, tone) => `<span class="tag ${tone || "plain"}"><span aria-hidden="true">${TAGSYM[tone || "plain"]}</span>${t}</span>`;
  const btn = (label, kind, act, arg, x) => `<button type="button" class="btn ${kind || "secondary"}${x && x.sm ? " sm" : ""}" ${act ? `data-act="${act}"` : ""} ${arg != null ? `data-arg="${esc(arg)}"` : ""} ${x && x.dis ? "disabled" : ""} ${x && x.label ? `aria-label="${esc(x.label)}"` : ""}>${label}</button>`;
  const link = (label, r, kind) => `<a class="btn ${kind || "secondary"}" href="#/${r}">${label}</a>`;
  const seg = (name, opts, val, label) => `<div class="seg" role="group" aria-label="${esc(label)}">${opts.map((o) => `<button type="button" aria-pressed="${String(o[0]) === String(val)}" data-act="set" data-arg="${name}=${o[0]}">${o[1]}</button>`).join("")}</div>`;
  const sw = (on, label, act, arg, lockText) => `<button type="button" role="switch" class="switch" aria-checked="${!!on}" ${act ? `data-act="${act}"` : ""} ${arg != null ? `data-arg="${esc(arg)}"` : ""} ${lockText ? "disabled" : ""}><span class="track"><span class="knob"></span></span><span>${label}</span><span class="state">${lockText || (on ? "On" : "Off")}</span></button>`;
  const lab = (plain, acct) => S.terms ? `${plain} <span class="faint" style="font-size:.8em;font-weight:400">· ${acct}</span>` : plain;
  const bar = (pct, id) => `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" ${id ? `id="${id}"` : ""} aria-label="Progress"><div style="width:${pct}%"></div></div>`;
  const table = (cols, rows, align, o) => {
    o = o || {};
    const al = (i) => (align && align[i] === "r" ? ' class="r"' : "");
    return `<div class="tbl-wrap" ${o.label ? `role="region" tabindex="0" aria-label="${esc(o.label)}"` : ""}><table><thead><tr>${cols.map((c, i) => `<th scope="col"${al(i)}>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r, ri) => `<tr class="${(o.cls && o.cls[ri]) || ""}">${r.map((c, i) => `<td${al(i)}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  };
  const card = (inner, cls, style) => `<div class="card ${cls || ""}" ${style ? `style="${style}"` : ""}>${inner}</div>`;
  const lockedCard = (need, what, cta) => `<div class="locked col">${chip("l" + need, "Needs Level " + need)}<h2 style="font-size:18px">${what}</h2><p class="muted small">You're at Level ${S.lvl} · ${D.LV[S.lvl].name}. ${need === 2 ? "Turning on bank connections changes nothing else; AI stays off." : "Cloud AI is used only for what you pick, after a preview, and every send is logged."}</p><div class="row">${btn(cta || `Turn on Level ${need} for this`, "secondary", "setLvl", need)}${link("Open Privacy and sharing", "privacy", "quiet")}</div></div>`;

  // ---------------- toast, dialog ----------------
  function toast(msg, undo) {
    const reg = $("#toast-region");
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span style="flex:1 1 200px">${msg}</span>`;
    if (undo) {
      const b = document.createElement("button"); b.className = "btn sm"; b.type = "button"; b.textContent = "Undo";
      b.onclick = () => { undo(); el.remove(); toast("Undone."); render(); };
      el.appendChild(b);
    }
    const x = document.createElement("button"); x.className = "btn sm"; x.type = "button"; x.textContent = "Close"; x.setAttribute("aria-label", "Close message"); x.onclick = () => el.remove();
    el.appendChild(x);
    reg.appendChild(el);
    while (reg.children.length > 2) reg.firstElementChild.remove();
    setTimeout(() => el.remove(), undo ? 9000 : 5000);
  }
  function dialog(o) {
    const dlg = $("#dlg");
    dlg.innerHTML = `<div class="dbody"><h2 id="dlg-title">${o.title}</h2>${o.body || ""}<div class="row">${o.ok ? `<button type="button" class="btn ${o.okKind || "primary"}" id="dlg-ok">${o.ok}</button>` : ""}<button type="button" class="btn secondary" id="dlg-cancel">${o.cancel || "Cancel"}</button></div></div>`;
    const prev = document.activeElement;
    const close = () => { dlg.close(); if (prev && prev.isConnected) prev.focus(); };
    $("#dlg-cancel", dlg).onclick = close;
    if (o.ok) $("#dlg-ok", dlg).onclick = () => { dlg.close(); o.onOk && o.onOk(); render(); };
    dlg.showModal();
    ($("#dlg-ok", dlg) || $("#dlg-cancel", dlg)).focus();
  }
  const ALWAYS = `<div>${chip("l1", "You approve this one")}</div><p class="small muted">Rosy Books always asks before money moves or anything leaves this computer. The helper can suggest it, but it can never do it on its own, whatever its settings.</p>`;
  function approveMoney(title, details, okLabel, onOk) { dialog({ title, body: `${details}${ALWAYS}`, ok: okLabel, onOk }); }
  function addHistory(text, undo) { const h = { id: "u" + Date.now() + Math.floor(Math.random() * 1e6), text, when: "Today " + nowLabel(), undone: false, undo }; S.history.unshift(h); return h; }
  function undoItem(h) { if (!h || h.undone) return; h.undo && h.undo(); h.undone = true; }

  // ---------------- helper task engine (simulated, on-device) ----------------
  let tick = null;
  function startTask(t) { t.id = "t" + Date.now(); t.done = 0; t.paused = false; t.later = false; S.tasks.push(t); ensureTick(); }
  function ensureTick() {
    if (tick) return;
    tick = setInterval(() => {
      const t = S.tasks.find((x) => !x.paused && !x.later);
      if (!t) { clearInterval(tick); tick = null; return; }
      t.done = Math.min(t.total, t.done + t.speed);
      if (t.done >= t.total) { S.tasks = S.tasks.filter((x) => x !== t); t.finish && t.finish(); render(); }
      else updateProgress(t);
    }, 500);
  }
  function taskLeft(t) { return Math.max(1, Math.ceil(((t.total - t.done) / t.speed) * 0.5)); }
  function taskStatus(t) { return `${t.unit ? `${Math.floor(t.done)} of ${t.total} ${t.unit}` : Math.round((t.done / t.total) * 100) + "%"} · about ${taskLeft(t)} seconds left${t.paused ? " · paused" : ""}`; }
  function updateProgress(t) {
    document.querySelectorAll(`[data-task="${t.id}"]`).forEach((el) => {
      const pct = (t.done / t.total) * 100;
      const b = el.querySelector(".bar"); if (b) { b.setAttribute("aria-valuenow", Math.round(pct)); b.firstElementChild.style.width = pct + "%"; }
      const s = el.querySelector(".tstat"); if (s) s.textContent = taskStatus(t);
    });
  }
  const taskBox = (t) => `<div class="card tint-lo" data-task="${t.id}">
      <div class="row" style="gap:8px">${chip("lo", t.later ? "Saved for later" : t.paused ? "Paused" : "Working on this computer")}</div>
      <h3>${esc(t.label)}</h3>${bar((t.done / t.total) * 100)}
      <p class="small muted tstat">${taskStatus(t)}</p>
      <p class="xs muted">On-device AI is slower than a cloud service${S.hw === "8" ? ", especially with 8 GB of memory" : ""}. That's the trade for nothing leaving this computer. You can keep working.</p>
      <div class="row">${t.later ? btn("Do it now", "secondary", "taskNow", t.id, { sm: 1 }) : t.paused ? btn("Resume", "secondary", "taskResume", t.id, { sm: 1 }) : btn("Pause", "secondary", "taskPause", t.id, { sm: 1 })}${t.later ? "" : btn("Do it later", "secondary", "taskLater", t.id, { sm: 1 })}${btn("Stop", "quiet", "taskStop", t.id, { sm: 1 })}</div>
    </div>`;
  function sortTask() {
    if (!S.helper) { toast("Turn on the on-device helper first."); return; }
    if (S.tasks.some((t) => t.kind === "cat")) { toast("The helper is already sorting."); return; }
    startTask({
      label: "Sorting last week's 14 entries", total: 14, unit: "entries", speed: S.hw === "8" ? 0.45 : 0.8, kind: "cat",
      finish: () => {
        const items = [
          { who: "Metro Office Supply", amt: 64.2, cat: "Office supplies", why: "You chose this 8 times before" },
          { who: "Sky Rail", amt: 212.4, cat: "Travel", why: "You chose this 5 times before" },
          { who: "Cloudnest Hosting", amt: 180, cat: "Software", why: S.learns ? "Habit: Cloudnest Hosting → Software" : "Same payee, same amount each month" },
        ];
        const unsure = { who: "Transfer to J.K. (example)", amt: 300, cat: "Not sure", why: "Could be Contractors or Money I took out. You decide." };
        applyByPerm("cat", "Sorted 12 entries into 5 categories", items, unsure);
      },
    });
    toast("The helper started sorting on this computer. You can keep working.");
  }
  function applyByPerm(k, summary, items, unsure) {
    const p = S.perm[k];
    if (p === "undo") {
      const h = addHistory(summary + " (done automatically)", () => {});
      toast(summary + ". " + (unsure ? "1 needs you. " : "") + "Undo stays in History for 7 days.", () => undoItem(h));
      if (unsure) S.waiting.push({ id: "w" + Date.now(), kind: k, summary: "1 entry the helper wasn't sure about", items: [unsure], mode: "ask" });
    } else {
      S.waiting.push({ id: "w" + Date.now(), kind: k, summary: p === "suggest" ? "Suggestions for 14 entries" : "Ready to sort 12 entries. 1 needs you.", items: unsure ? items.concat([unsure]) : items, mode: p });
      toast(p === "suggest" ? "The helper has suggestions ready. Nothing was changed." : "The helper finished. It's waiting for your OK.");
    }
    S.panel = true;
  }

  // ---------------- routing ----------------
  const NAV = [
    ["Start", [["site", "Website & download"], ["start", "Set up (trust picker)"]]],
    ["Books", [["home", "Home"], ["checkbook", "Checkbook"], ["receipts", "Receipts"], ["invoices", "Money owed to me"], ["bills", "Bills to pay"], ["reconcile", "Reconcile"], ["reports", "Reports"], ["categories", "Categories"]]],
    ["Help & privacy", [["helper", "On-device helper"], ["ai", "Cloud AI (your own)"], ["privacy", "Privacy & sharing"], ["accountant", "Accountant hand-off"], ["backup", "Backups"]]],
  ];
  const TITLES = { site: "Website", start: "Setup", home: "Home", checkbook: "Checkbook", receipts: "Receipts", invoices: "Money owed to me", bills: "Bills to pay", reconcile: "Reconcile", reports: "Reports", categories: "Categories", helper: "On-device helper", ai: "Cloud AI", privacy: "Privacy & sharing", accountant: "Accountant hand-off", backup: "Backups" };
  const route = () => { const r = (location.hash || "#/site").replace(/^#\/?/, "").split("?")[0]; return TITLES[r] ? r : "site"; };

  function controls() {
    return `<span class="pc-label">Try it:</span>
      <div class="pc-group">${seg("lvl", [[1, "1 Private"], [2, "2 Connected"], [3, "3 Cloud AI"]], S.lvl, "Trust level")}</div>
      <div class="pc-group">${sw(S.helper, "On-device helper", "toggleHelper")}</div>
      <div class="pc-group">${sw(S.terms, "Accountant terms", "toggle", "terms")}</div>
      <div class="pc-group">${seg("theme", [["light", "Light"], ["dark", "Dark"]], S.theme, "Appearance")}</div>
      <span class="xs muted">Changes reset when you reload.</span>`;
  }
  function titlebar(r) {
    const sent = S.sentToday > 0;
    return `<div class="titlebar"><div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="wt">Rosy Books — ${TITLES[r]} <span class="faint">· Maple Street Studio (example)</span></div>
      <a href="#/privacy" class="badge l${S.lvl}" style="text-decoration:none" aria-label="Trust level ${S.lvl}, ${D.LV[S.lvl].name}. Open privacy and sharing">${glyph("l" + S.lvl, 14)}${meter(S.lvl)}Level ${S.lvl} · ${D.LV[S.lvl].name}</a>
      ${S.helper ? `<button type="button" class="chip lo" style="cursor:pointer;font-family:inherit" data-act="togglePanel" aria-expanded="${S.panel}">${glyph("lo", 14)}${S.tasks.length ? "Helper working" : "Helper on"} · ${S.panel ? "hide" : "show"} panel</button>` : `<a class="chip l1" href="#/helper">Helper off · add it</a>`}
      <a href="#/privacy" class="outlight ${sent ? "sent" : ""}"><span class="dot" aria-hidden="true"></span>${sent ? `${S.sentToday} item${S.sentToday > 1 ? "s" : ""} left today · see log` : "Nothing has left this computer today"}</a></div>`;
  }
  function sidebar(r) {
    return `<nav class="side" aria-label="Main"><div class="biz">Maple Street Studio<small>Example business</small></div>${NAV.map((g) => `<div class="navgroup">${g[0]}</div>${g[1].map((n) => `<a href="#/${n[0]}" ${n[0] === r ? 'aria-current="page"' : ""}>${n[1]}</a>`).join("")}`).join("")}</nav>`;
  }
  const histRow = (h) => `<div class="listrow"><div style="flex:1 1 160px"><div class="small" ${h.undone ? 'style="text-decoration:line-through"' : ""}>${esc(h.text)}</div><div class="xs faint">${h.when} · can undo for 7 days</div></div>${h.undone ? tag("Undone", "plain") : btn("Undo", "secondary", "undoHist", h.id, { sm: 1, label: "Undo: " + h.text })}</div>`;
  function waitingCard(w) {
    const n = w.items.filter((i) => i.cat !== "Not sure").length;
    return `<div class="card"><h4>${esc(w.summary)}</h4>
      ${w.items.map((it, i) => `<div class="listrow" style="padding:6px 0"><div style="flex:1 1 150px"><div class="small"><strong>${esc(it.who)}</strong> · ${money2(it.amt)}</div><div class="xs faint">${esc(it.why)}</div></div>${it.cat === "Not sure" ? tag("Not sure", "warn") : chip("lo", "Likely: " + esc(it.cat))}${w.mode === "suggest" && it.cat !== "Not sure" ? btn("Use this", "secondary", "useSugg", w.id + "|" + i, { sm: 1, label: "Use " + it.cat + " for " + it.who }) : ""}</div>`).join("")}
      ${w.mode === "suggest" ? `<p class="xs faint">Permission is "Suggest only", so the helper won't change anything. Use the ones you like.</p>${btn("Dismiss", "quiet", "dismissWait", w.id, { sm: 1 })}` : `<div class="row">${n ? btn("Approve " + n, "primary", "approveWait", w.id, { sm: 1 }) : ""}${btn("Not now", "quiet", "dismissWait", w.id, { sm: 1 })}</div><p class="xs faint">You can undo for 7 days after approving.</p>`}</div>`;
  }
  function helperPanel() {
    return `<aside class="panel" aria-label="On-device helper panel">
      <div class="row" style="gap:8px"><span style="color:var(--lo)">${glyph("lo", 20)}</span><h2>Helper</h2><span class="spacer"></span>${btn("Hide", "quiet", "togglePanel", null, { sm: 1, label: "Hide helper panel" })}</div>
      <p class="xs muted">Runs only on this computer, works offline, never goes online. Default: <strong>Ask before acting</strong>.</p>
      ${S.tasks.length ? S.tasks.map(taskBox).join("") : `<div class="card"><p class="small muted">Not working on anything right now.</p>${btn("Try: sort last week's 14 entries", "secondary", "sortTask", null, { sm: 1 })}</div>`}
      ${S.waiting.length ? `<h3>Waiting for your OK</h3>${S.waiting.map(waitingCard).join("")}` : ""}
      <h3>Recent, with undo</h3>
      ${S.history.length ? `<div class="boxlist">${S.history.slice(0, 4).map(histRow).join("")}</div>` : `<p class="small muted">Nothing yet. Changes the helper or you make show here with Undo for 7 days.</p>`}
      ${link("Helper settings and habits", "helper", "quiet")}</aside>`;
  }
  function appShell(r, body) {
    const showPanel = S.helper && S.panel;
    return `<div class="window">${titlebar(r)}<div class="shell ${showPanel ? "with-panel" : ""}">${sidebar(r)}<main id="main" class="content" tabindex="-1">${body}</main>${showPanel ? helperPanel() : ""}</div></div>`;
  }

  // ================= SCREENS =================
  const head = (h, sub, right) => `<div class="row" style="align-items:flex-start"><div class="col" style="gap:4px;flex:1 1 300px"><h1>${h}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>${right || ""}</div>`;

  // ---- marketing / download ----
  function siteUI() {
    return `<div class="site"><nav class="site-nav" aria-label="Website"><a class="brand" href="#/site">Rosy Books</a><span class="spacer"></span><a href="#features">Features</a><a href="#privacy-levels">Privacy</a><a href="#download">Download</a>${link("Open the app prototype", "start", "secondary")}</nav>
    <main id="main" tabindex="-1">
      <section class="hero"><span class="tag info">Example website · prototype</span>
        <h1 class="display">Bookkeeping that stays on your computer.</h1>
        <p class="muted" style="max-width:640px;font-size:18px">Rosy Books keeps your books in a file you own, works offline, and lets you choose how much connects to the internet. Plain words, a checkbook you already understand, and reports your accountant will recognise.</p>
        <div id="download" class="grid" style="justify-content:center;width:100%;max-width:760px">
          <div class="card dl">${btn("Download for Mac", "primary", "fakeDl", "Mac")}<p class="xs muted">macOS 13 or newer · Apple silicon or Intel</p></div>
          <div class="card dl">${btn("Download for Windows", "primary", "fakeDl", "Windows")}<p class="xs muted">Windows 10 or 11 · 64-bit</p></div>
        </div>
        <p class="small"><strong>Prototype: nothing downloads.</strong> These buttons only show what would happen.</p>
      </section>
      <section id="features" class="col" style="gap:16px"><h2>Choose how private you want to be</h2>
        <div class="grid" id="privacy-levels">${[1, 2, 3].map((n) => card(`${badge(n)}<h3>${D.LV[n].line}</h3><p class="small muted"><strong>What leaves your computer:</strong> ${D.LV[n].leaves}.</p>`, "tint-l" + n)).join("")}</div>
        <p class="small muted">You can change your level any time, and per feature. Money never moves without your OK.</p>
        ${card(`${chip("lo", "Optional add-on at any level")}<h3>The on-device helper</h3><p class="small muted">A small AI that runs only on your computer. It sorts entries, reads receipts and answers questions offline. It's slower than cloud AI and tells you while it works, with pause and "do it later". It runs on computers with 8 GB of memory using a smaller model; 16 GB or more is faster.</p><p class="small muted">By default it <strong>asks before acting</strong>, and every change can be undone for 7 days.</p>`, "tint-lo")}
        <div class="grid">
          ${card(`<h3>Offline installer</h3><p class="small muted">Need to set up a computer without internet? Get the full offline installer, which includes the helper's model, and copy it over on a USB stick.</p>${btn("Get the offline installer", "secondary", "fakeDl", "Offline installer (Mac + Windows)")}`)}
          ${card(`<h3>Works with your accountant</h3><p class="small muted">Send a package with reports, a trial balance and the books file, encrypted, in one click. They can send back adjustments for you to approve.</p>`)}
          ${card(`<h3>Your own AI, if you want</h3><p class="small muted">At Level 3, connect the AI app you already use through a connector that runs on your computer. Read-only by default; you pick what it sees, see a preview, and every send is logged.</p>`)}
        </div>
      </section>
      <footer class="foot">Rosy Books is a design prototype with example data. There is no product to download, nothing to buy, and no sign-in. ${link("Open the app prototype", "start", "quiet")}</footer>
    </main></div>`;
  }

  // ---- onboarding: trust picker ----
  const QUIZ = [
    ["Do you want transactions to come in from your bank automatically?", "Yes", 2, "No, I'll type or import them", 1],
    ["Would you like to ask the AI app you already use about your books?", "Yes, if I choose what it sees", 3, "No", 1],
    ["Is keeping everything off the internet the most important thing?", "Yes", 1, "Not the most important", 2],
  ];
  function startUI() {
    const steps = ["How private?", "Helper add-on", "Your business", "Ready"];
    let body = "";
    if (S.onb === 0) {
      body = `<div class="col"><h1 class="display" style="font-size:32px">How private do you want your books?</h1><p class="muted">Pick one. You can change this any time, and per feature, in Privacy and sharing.</p>
        <div class="row" role="radiogroup" aria-label="Trust level" style="align-items:stretch">${[1, 2, 3].map((n) => `<button type="button" role="radio" class="pick l${n}" aria-checked="${S.lvl === n}" data-act="setLvl" data-arg="${n}"><div class="col" style="gap:8px"><span class="lc">${badge(n)}</span><h3>${D.LV[n].line}</h3><p class="small muted">${n === 1 ? "Type or import entries. No accounts to connect. Works forever offline." : n === 2 ? "Bank transactions arrive by themselves. Your books never leave this computer." : "Everything in Level 2, plus your own AI app can help with what you pick, after a preview."}</p><p class="leaves">Leaves this computer: ${D.LV[n].leaves}</p></div></button>`).join("")}</div>
        <div class="row">${btn("Not sure? Answer 3 questions", "quiet", "quizStart")}</div>
        ${S.quiz ? quizUI() : ""}</div>`;
    } else if (S.onb === 1) {
      body = `<div class="col"><h1 class="display" style="font-size:32px">Add the on-device helper?</h1><p class="muted">It works with any level, including Level 1. It never goes online.</p>
        <button type="button" role="switch" class="addon" aria-checked="${S.helper}" data-act="toggleHelper"><span style="color:var(--lo)">${glyph("lo", 28)}</span><span class="col" style="gap:4px;flex:1 1 260px;text-align:left"><strong>On-device helper ${S.helper ? "· added" : "· not added"}</strong><span class="small muted">Sorts entries, reads receipts, answers questions. Slower than cloud AI, works offline, shows progress with pause and "do it later". Default: asks before acting, 7-day undo.</span></span><span class="tag ${S.helper ? "ok" : "plain"}">${S.helper ? "On" : "Off"}</span></button>
        <fieldset><legend>How much memory does this computer have? (example check)</legend>${seg("hw", [["16", "16 GB or more"], ["8", "8 GB"], ["4", "4 GB"]], S.hw, "Memory")}</fieldset>
        <p class="small muted">${S.hw === "16" ? "Great: the standard model fits and runs at a comfortable speed." : S.hw === "8" ? "Works: Rosy Books uses a smaller model. It is slower and a little less accurate, and it will say so." : "Too little memory for the helper. Your books still work fully without it."}</p></div>`;
    } else if (S.onb === 2) {
      body = `<div class="col"><h1 class="display" style="font-size:32px">Tell us about your business</h1><p class="muted">This sets up your categories (chart of accounts). You can rename or add any of them later.</p>
        <fieldset><legend>What do you mostly sell?</legend>${seg("biz", [["service", "Services (my time)"], ["product", "Products (things)"]], S.biz, "Business type")}</fieldset>
        <fieldset><legend>How is the business set up?</legend>${seg("ent", [["sole", "Just me (sole proprietor)"], ["partner", "Partnership"], ["scorp", "S corporation"], ["ccorp", "C corporation"]], S.ent, "Entity type")}</fieldset>
        ${coaPreview(true)}</div>`;
    } else {
      body = `<div class="col"><h1 class="display" style="font-size:32px">You're set up</h1>
        <div class="grid">${card(`${badge(S.lvl)}<p class="small muted">Leaves this computer: ${D.LV[S.lvl].leaves}.</p>`, "tint-l" + S.lvl)}${card(S.helper ? `${chip("lo", "Helper added")}<p class="small muted">Asks before acting · 7-day undo · ${S.hw === "8" ? "smaller model for 8 GB" : "standard model"}.</p>` : `${chip("l1", "No helper")}<p class="small muted">You can add it later from the helper page.</p>`)}${card(`<strong>${S.biz === "service" ? "Services" : "Products"} · ${{ sole: "Sole proprietor", partner: "Partnership", scorp: "S corporation", ccorp: "C corporation" }[S.ent]}</strong><p class="small muted">Categories ready.</p>`)}</div>
        <p class="small muted">This prototype is filled with example data for a pretend design studio, Maple Street Studio.</p><div class="row">${link("Go to Home", "home", "primary")}</div></div>`;
    }
    return `<div class="onb"><div class="row"><span class="brand">Rosy Books</span><span class="spacer"></span><ol class="row" style="list-style:none;margin:0;padding:0" aria-label="Setup steps">${steps.map((s, i) => `<li class="row" style="gap:6px" ${i === S.onb ? 'aria-current="step"' : ""}><span class="stepnum" style="${i === S.onb ? "background:var(--rose);color:var(--onRose)" : ""}">${i + 1}</span><span class="small ${i === S.onb ? "" : "faint"}">${s}</span></li>`).join("")}</ol></div>
      <main id="main" tabindex="-1" class="col" style="gap:18px">${body}</main>
      <div class="row">${S.onb > 0 ? btn("Back", "secondary", "onb", S.onb - 1) : link("Back to website", "site", "secondary")}<span class="spacer"></span>${S.onb < 3 ? btn("Continue", "primary", "onb", S.onb + 1) : ""}</div></div>`;
  }
  function quizUI() {
    const q = S.quiz;
    if (q.i >= QUIZ.length) {
      const rec = q.a.includes(3) ? 3 : q.a.includes(2) && !q.a.includes(1) ? 2 : q.a[0] === 2 || q.a[1] === 3 ? Math.max(...q.a.slice(0, 2)) : 1;
      return card(`<h3>We suggest Level ${rec} · ${D.LV[rec].name}</h3><p class="small muted">${D.LV[rec].line}. You can change it later.</p><div class="row">${btn("Use Level " + rec, "primary", "setLvl", rec)}${btn("Start over", "quiet", "quizStart")}</div>`);
    }
    const it = QUIZ[q.i];
    return card(`<p class="xs faint">Question ${q.i + 1} of 3</p><h3>${it[0]}</h3><div class="row">${btn(it[1], "secondary", "quizAns", it[2])}${btn(it[3], "secondary", "quizAns", it[4])}</div>`);
  }
  function coaPreview(compact) {
    const groups = D.COA[S.biz].slice();
    groups.splice(2, 0, { g: S.ent === "sole" || S.ent === "partner" ? "Owner's money" : "Owners' stake", t: "Equity", a: D.EQUITY[S.ent] });
    return `<div class="grid">${groups.map((g) => card(`<h3>${lab(g.g, g.t)}</h3><ul style="margin:0;padding-left:18px" class="small">${g.a.map((a) => `<li><span class="mono faint">${a[0]}</span> ${S.terms ? esc(a[2]) : esc(a[1])}${!compact && !S.terms ? ` <span class="xs faint">(${esc(a[2])})</span>` : ""}</li>`).join("")}</ul>`)).join("")}</div>`;
  }

  // ---- home ----
  function chartSVG() {
    const W = 640, H = 220, pad = 34, max = 16000, n = D.MONTHS.length, bw = (W - pad * 2) / n;
    const y = (v) => H - 26 - (v / max) * (H - 50);
    let g = "";
    [0, 5000, 10000, 15000].forEach((v) => { g += `<line x1="${pad}" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pad - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="var(--ink3)">${v / 1000}k</text>`; });
    D.MONTHS.forEach((m, i) => {
      const x = pad + i * bw + 6;
      g += `<rect x="${x}" y="${y(D.CIN[i])}" width="${bw / 2 - 6}" height="${y(0) - y(D.CIN[i])}" rx="3" fill="var(--sage)"/><rect x="${x + bw / 2 - 4}" y="${y(D.COUT[i])}" width="${bw / 2 - 6}" height="${y(0) - y(D.COUT[i])}" rx="3" fill="var(--rose)"/><text x="${x + bw / 2 - 5}" y="${H - 8}" font-size="11" text-anchor="middle" fill="var(--ink3)">${m}</text>`;
    });
    const rows = D.MONTHS.map((m, i) => `<tr><th scope="row">${m}</th><td>${money(D.CIN[i])}</td><td>${money(D.COUT[i])}</td></tr>`).join("");
    return `<figure style="margin:0"><svg class="svgchart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-labelledby="chart-t"><title id="chart-t">Money in and money out by month, January to October 2026 (example). October is month to date.</title>${g}</svg>
      <figcaption class="row xs muted" style="gap:14px"><span><span aria-hidden="true" style="display:inline-block;width:10px;height:10px;background:var(--sage);border-radius:2px"></span> Money in</span><span><span aria-hidden="true" style="display:inline-block;width:10px;height:10px;background:var(--rose);border-radius:2px"></span> Money out</span><span>October is month to date</span></figcaption>
      <details><summary class="xs">Show these numbers as a table</summary><div class="tbl-wrap"><table><thead><tr><th scope="col">Month</th><th scope="col">Money in</th><th scope="col">Money out</th></tr></thead><tbody>${rows}</tbody></table></div></details></figure>`;
  }
  function levelStrip() {
    const n = S.lvl;
    const text = n === 1 ? "Everything is on this computer. Nothing has gone online." : n === 2 ? "Your bank sent 3 new transactions this morning. Your books stayed here." : "Cloud AI helps only with what you pick. " + (S.sentToday ? S.sentToday + " item(s) left today." : "Nothing has left today.");
    return `<div class="strip l${n}">${badge(n)}<span class="small" style="flex:1 1 220px">${text}</span>${S.helper ? chip("lo", "Helper on, offline") : ""}${link("Change", "privacy", "quiet")}</div>`;
  }
  function homeUI() {
    const owed = sum(D.AR.map((r) => sum(r.b))), bills = sum(S.bills.filter((b) => !b.paid).map((b) => b.amt));
    const next = [
      [`${S.bills.filter((b) => !b.paid && b.soon).length ? "Cloudnest Hosting bill due Oct 30" : "No bills due this week"}`, "bills", "Pay bills"],
      ["3 invoices are more than 30 days late", "invoices", "See who owes you"],
      ["September bank statement is ready to reconcile", "reconcile", "Reconcile"],
      ["1 faded receipt needs a total", "receipts", "Fix receipt"],
    ];
    if (S.lvl >= 2) next.unshift([`${S.feed.filter((f) => !f.done).length} new bank transactions to review`, "checkbook", "Review"]);
    return `${head("How am I doing?", "Maple Street Studio · example data · October 28, 2026")}
      ${levelStrip()}
      <div class="grid">
        ${card(`<p class="small muted">${lab("Money in the bank", "Cash")}</p><p class="money">${money(18240)}</p><p class="xs faint">Checking and savings, as of today</p>`)}
        ${card(`<p class="small muted">${lab("Profit so far this year", "Net income YTD")}</p><p class="money" style="color:var(--sage)">${money(76565)}</p><p class="xs faint">Up 11% from this time last year</p>`)}
        ${card(`<p class="small muted">${lab("Money owed to me", "Accounts receivable")}</p><p class="money">${money(owed)}</p><p class="xs faint">${tag("3 late", "warn")}</p>`)}
        ${card(`<p class="small muted">${lab("Bills I owe", "Accounts payable")}</p><p class="money">${money(bills)}</p><p class="xs faint">${S.bills.some((b) => b.soon && !b.paid) ? tag("1 due in 2 days", "warn") : tag("Nothing due soon", "ok")}</p>`)}
      </div>
      ${card(`<h2>Money in and out this year</h2>${chartSVG()}`)}
      <div class="grid">
        ${card(`<h2>Next up</h2><div class="boxlist">${next.map((x) => `<div class="listrow"><span style="flex:1 1 180px" class="small">${x[0]}</span>${link(x[2], x[1], "secondary")}</div>`).join("")}</div>`, "", "flex:2 1 360px")}
        ${card(`<h2>Ask about your books</h2>${S.helper ? `<p class="small muted">The helper answers on this computer.</p><div class="col" style="gap:6px">${["What did I spend on software this year?", "Who owes me the most?"].map((q, i) => btn(q, "secondary", "homeAsk", i, { sm: 1 })).join("")}</div>${S.homeAns ? `<div class="card tint-lo"><p class="small">${S.homeAns}</p><p class="xs faint">Answered on this computer · nothing left</p></div>` : ""}` : `<p class="small muted">Add the on-device helper to ask questions offline.</p>${link("Add helper", "helper", "secondary")}`}`)}
      </div>`;
  }

  // ---- checkbook ----
  function regRows() {
    let bal = 9640;
    return S.entries.map((r) => { bal += (r.dep || 0) - (r.pay || 0); return Object.assign({ bal }, r); });
  }
  function checkbookUI() {
    const rows = regRows();
    const feed = S.lvl >= 2 ? (S.feed.some((f) => !f.done) ? `<div class="card tint-l2"><div class="row">${chip("l2", "From your bank · Level 2")}<h2 style="font-size:18px">New from Business checking</h2></div>${S.feed.map((f, i) => f.done ? "" : `<div class="listrow"><div style="flex:1 1 200px"><div class="small"><strong>${esc(f.p)}</strong> · ${f.d} · ${money2(f.amt)}</div><div class="xs faint mono">${esc(f.raw)}</div><div class="xs faint">${S.helper ? "Helper: " + esc(f.why) : "Rule: " + esc(f.why)}</div></div>${chip("lo", "Likely: " + esc(f.c))}${btn("Add to checkbook", "secondary", "feedAdd", i, { sm: 1 })}${btn("Skip", "quiet", "feedSkip", i, { sm: 1 })}</div>`).join("")}</div>` : `<div class="strip l2">${chip("l2", "Level 2")}<span class="small">All bank transactions reviewed.</span></div>`) : `<div class="strip l1">${badge(1)}<span class="small" style="flex:1 1 200px">At Level 1 you type entries or import a bank file. Nothing connects to your bank.</span>${btn("Import a bank file (example)", "secondary", "importFile")}</div>`;
    const reg = S.reg === "bank" ? `<div class="form" role="group" aria-labelledby="add-h"><h2 id="add-h" style="flex:1 1 100%;font-size:17px">Add an entry</h2>
        <label class="f" style="flex:0 1 100px">Date<input class="in" id="f-d" data-bind="add.d" value="${esc(S.add.d)}"></label>
        <label class="f" style="flex:0 1 90px">Check no.<input class="in" id="f-no" data-bind="add.no" value="${esc(S.add.no)}" inputmode="numeric"></label>
        <label class="f" style="flex:2 1 160px">Paid to or received from<input class="in" id="f-p" data-bind="add.p" value="${esc(S.add.p)}" ${S.addErr && !S.add.p ? 'aria-invalid="true" aria-describedby="add-err"' : ""}></label>
        <label class="f">Category<select class="in" id="f-c" data-bind="add.c">${["Office supplies", "Software", "Travel", "Contractors", "Advertising", "Rent", "Design services", "Transfer", "Money I took out"].map((c) => `<option ${c === S.add.c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
        <label class="f" style="flex:1 1 100px">Payment<input class="in" id="f-out" data-bind="add.out" value="${esc(S.add.out)}" inputmode="decimal" placeholder="0.00"></label>
        <label class="f" style="flex:1 1 100px">Deposit<input class="in" id="f-in" data-bind="add.inn" value="${esc(S.add.inn)}" inputmode="decimal" placeholder="0.00"></label>
        ${btn("Add", "primary", "addEntry")}
        ${S.addErr ? `<p id="add-err" class="small" style="flex:1 1 100%;color:var(--clay)" role="alert">${S.addErr}</p>` : ""}</div>
      ${table(["Date", "No.", "Paid to / from", "Category", "Memo", "Payment", "Deposit", "Cleared", "Balance"], rows.map((r) => [r.d, r.no || "", esc(r.p), esc(r.c), esc(r.m || ""), r.pay ? money2(r.pay) : "", r.dep ? money2(r.dep) : "", r.cl ? tag("Cleared", "ok") : tag("Not yet", "plain"), money2(r.bal)]), [0, 0, 0, 0, 0, "r", "r", 0, "r"], { label: "Checking register" })}`
      : table(["Date", "Merchant", "Category", "Charge", "Payment"], S.card.map((r) => [r.d, esc(r.p), esc(r.c), r.ch ? money2(r.ch) : "", r.py ? money2(r.py) : ""]), [0, 0, 0, "r", "r"], { label: "Credit card register" });
    const amt = parseAmt(S.chk.amt);
    return `${head("Checkbook", "Looks and works like a paper check register. Example data.", `<div class="row">${seg("reg", [["bank", "Business checking ··4410"], ["card", "Business card ··8812"]], S.reg, "Account")}</div>`)}
      ${feed}${reg}
      <section class="col" aria-labelledby="wc-h"><h2 id="wc-h">Write a check</h2>
        <div class="grid" style="align-items:flex-start">
          <div class="col" style="flex:1 1 260px"><label class="f">Pay to<input class="in" id="c-p" data-bind="chk.payee" value="${esc(S.chk.payee)}"></label><label class="f">Amount<input class="in" id="c-a" data-bind="chk.amt" value="${esc(S.chk.amt)}" inputmode="decimal"></label><label class="f">Memo<input class="in" id="c-m" data-bind="chk.memo" value="${esc(S.chk.memo)}"></label>
            <div class="row">${btn("Record and print check " + S.nextCheck, "primary", "writeCheck")}</div><p class="xs faint">Nothing prints in this prototype. You'll be asked to approve first.</p></div>
          <div class="check" style="flex:2 1 360px" aria-label="Check preview" role="img"><div class="row"><strong>Maple Street Studio</strong><span class="spacer"></span><span class="mono">No. ${S.nextCheck}</span></div><div class="row xs faint"><span>Example only · not a real check</span><span class="spacer"></span><span>Date: Oct 28, 2026</span></div>
            <div class="row"><span class="small">Pay to the order of</span><span class="line" style="flex:1 1 160px" id="pv-p">${esc(S.chk.payee) || "&nbsp;"}</span><span class="amtbox" id="pv-a">${isFinite(amt) ? money2(amt) : "$—"}</span></div>
            <div class="line small" id="pv-w">${esc(words(amt))}</div><div class="row"><span class="small">Memo</span><span class="line small" style="flex:1 1 140px" id="pv-m">${esc(S.chk.memo) || "&nbsp;"}</span><span class="line small faint" style="flex:1 1 140px">Signature</span></div></div>
        </div></section>`;
  }

  // ---- receipts ----
  function receiptsUI() {
    const r = S.receipts[S.rsel] || S.receipts[0];
    const reading = S.tasks.find((t) => t.kind === "read");
    let detail = "";
    if (r.s === "reading") detail = reading ? taskBox(reading) : `<p class="small muted">Waiting to read…</p>`;
    else if (r.s === "check") {
      detail = `<div class="card tint-amber"><div class="row">${tag("Needs a look", "warn")}<h3>The total is faded</h3></div><p class="small muted">The helper read the store and date but isn't sure about one digit of the total. Type what you see.</p>
        <div class="row" style="align-items:flex-end"><label class="f" style="flex:0 1 180px">Total<input class="in" id="r-tot" data-bind="rtotal" value="${esc(S.rtotal)}" inputmode="decimal"></label>${btn("Save total", "primary", "fixTotal")}</div>
        ${S.lvl >= 3 ? `<div class="card tint-l3">${chip("l3", "Level 3 option")}<p class="small">Or ask your cloud AI to read just this receipt. You'll see exactly what is sent first, with card digits blurred.</p>${btn("Preview what would be sent", "secondary", "aiReceipt")}</div>` : `<p class="xs faint">At Level 3 you could also ask your own cloud AI to read hard receipts, one at a time, after a preview.</p>`}</div>`;
    } else detail = `<div class="card">${tag("Read on this computer", "ok")}<dl class="small" style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:0"><dt class="faint">Store</dt><dd style="margin:0">${esc(r.v)}</dd><dt class="faint">Date</dt><dd style="margin:0">${esc(r.d)}</dd><dt class="faint">Total</dt><dd style="margin:0">${esc(r.t)}</dd><dt class="faint">Category</dt><dd style="margin:0">${esc(r.c)}</dd></dl><p class="xs faint">Matched to the ${esc(r.v)} entry in your checkbook.</p></div>`;
    return `${head("Receipts", "Receipts are read on this computer. Nothing is uploaded.")}
      <div class="card tint-l1"><h2 style="font-size:18px">Add a receipt</h2><p class="small muted">In the real app you'd drag in a photo or PDF. This prototype only uses made-up sample receipts, so none of your files are opened.</p><div class="row">${btn("Add a sample receipt" + (S.sampleIx < D.SAMPLE_RECEIPTS.length ? ` (${D.SAMPLE_RECEIPTS[S.sampleIx].f})` : ""), "primary", "addReceipt", null, { dis: S.sampleIx >= D.SAMPLE_RECEIPTS.length })}${S.helper ? chip("lo", "Helper reads it offline") : chip("l1", "Basic text reading, no helper")}</div></div>
      <div class="grid" style="align-items:flex-start"><div class="boxlist" style="flex:1 1 260px" role="list" aria-label="Receipts">${S.receipts.map((x, i) => `<div class="listrow" role="listitem"><button type="button" class="linkish" data-act="rsel" data-arg="${i}" aria-current="${i === S.rsel}" style="flex:1 1 150px">${esc(x.f)}</button>${x.s === "done" ? tag("Done", "ok") : x.s === "check" ? tag("Needs a look", "warn") : tag("Reading", "info")}</div>`).join("")}</div>
        <div class="col" style="flex:2 1 320px"><h2 style="font-size:18px">${esc(r.f)}</h2>${detail}</div></div>`;
  }

  // ---- invoices / AR ----
  const BCOL = ["var(--sage)", "var(--l2)", "var(--amber)", "var(--clay)", "var(--l3)"];
  function agingBlock(rows, nameKey, label) {
    const tot = [0, 1, 2, 3, 4].map((i) => sum(rows.map((r) => r.b[i]))), all = sum(tot);
    return `<div class="agebar" role="img" aria-label="${esc(label)}: ${D.BUCKETS.map((b, i) => b + " " + money(tot[i])).join(", ")}">${tot.map((t, i) => t ? `<div style="flex:${t};background:${BCOL[i]}"></div>` : "").join("")}</div>
      ${table([S.terms ? (nameKey === "c" ? "Customer" : "Vendor") : nameKey === "c" ? "Who owes me" : "Who I owe", S.terms ? "Current" : D.BUCKETS[0], S.terms ? "1–30" : D.BUCKETS[1], S.terms ? "31–60" : D.BUCKETS[2], S.terms ? "61–90" : D.BUCKETS[3], S.terms ? "Over 90" : D.BUCKETS[4], "Total"],
        rows.map((r) => [esc(r[nameKey]), ...r.b.map((v) => v ? money(v) : "—"), money(sum(r.b))]).concat([["Total", ...tot.map(money), money(all)]]), [0, "r", "r", "r", "r", "r", "r"], { label, cls: rows.map(() => "").concat(["total"]) })}`;
  }
  function reconBlock(k) {
    const R = D.RECON[k], v = R.v, beg = v[2] - v[0] + v[1];
    return `<div class="recon-tiles">${card(`<p class="xs faint">Start of month</p><p class="money" style="font-size:20px">${money(beg)}</p>`)}<span class="op" aria-hidden="true">+</span>${card(`<p class="xs faint">${R.a}</p><p class="money" style="font-size:20px">${money(v[0])}</p>`)}<span class="op" aria-hidden="true">−</span>${card(`<p class="xs faint">${R.b}</p><p class="money" style="font-size:20px">${money(v[1])}</p>`)}<span class="op" aria-hidden="true">=</span>${card(`<p class="xs faint">End of month</p><p class="money" style="font-size:20px">${money(v[2])}</p>`)}</div><p class="xs faint">${S.terms ? "Beginning balance + additions − " + (k === "ar" ? "collections" : "payments") + " = ending balance" : "What you started with, plus what was added, minus what was paid, equals what's left."}</p>`;
  }
  function invoicesUI() {
    return `${head(lab("Money owed to me", "Accounts receivable"), "Invoices and who's late. Example customers.", btn("New invoice", "primary", "newInvoice"))}
      ${card(`<h2 style="font-size:18px">How late are people paying?</h2>${agingBlock(D.AR, "c", "Money owed by age")}`)}
      <section class="col"><h2 style="font-size:18px">Invoices</h2>
      ${table(["No.", "Customer", "Amount", "Due", "Status", ""], S.invoices.map((i) => [i.n, esc(i.c), money(i.amt), i.due, tag(i.st, i.st === "Late" ? "bad" : i.st === "Paid" ? "ok" : i.st === "Draft" ? "plain" : "info"), i.st === "Draft" ? btn("Send", "secondary", "sendInv", i.n, { sm: 1, label: "Send invoice " + i.n }) : i.st === "Late" ? btn("Send reminder", "secondary", "remind", i.n, { sm: 1, label: "Send reminder for invoice " + i.n }) : i.st === "Sent" ? btn("Mark paid", "quiet", "markPaid", i.n, { sm: 1, label: "Mark invoice " + i.n + " paid" }) : ""]), [0, 0, "r", 0, 0, 0], { label: "Invoices" })}
      <p class="xs faint">${S.lvl >= 2 ? "At Level 2, invoices can be emailed from Rosy Books." : "At Level 1, sending creates a PDF for your own email app."} Either way, you approve every send.</p></section>
      ${card(`<h2 style="font-size:18px">${lab("Does it add up?", "A/R reconciliation")} · September</h2>${reconBlock("ar")}`)}`;
  }

  // ---- bills / AP ----
  function billsUI() {
    const open = S.bills.filter((b) => !b.paid), selTot = sum(open.filter((b) => b.sel).map((b) => b.amt));
    const v = S.vendor != null ? S.bills[S.vendor] : null;
    return `${head(lab("Bills to pay", "Accounts payable"), "Pick bills and pay them. Money never moves without your OK.")}
      <fieldset class="boxlist"><legend class="sr">Unpaid bills</legend>${open.length ? open.map((b) => { const i = S.bills.indexOf(b); return `<div class="listrow"><label class="row" style="flex:1 1 220px;gap:10px;cursor:pointer"><input type="checkbox" data-act="billSel" data-arg="${i}" ${b.sel ? "checked" : ""} style="width:22px;height:22px"><span><strong>${esc(b.v)}</strong> <span class="xs faint">· ${b.n}</span><br><span class="xs faint">Due ${b.due}</span></span></label>${b.soon ? tag("Due soon", "warn") : ""}<span class="mono">${money2(b.amt)}</span>${btn("Details", "quiet", "vendor", i, { sm: 1, label: "Details for " + b.v })}</div>`; }).join("") : `<div class="listrow"><span class="small">All bills paid.</span></div>`}</fieldset>
      <div class="row"><span class="small">Selected: <strong>${money2(selTot)}</strong></span>${btn("Pay selected bills", "primary", "payBills", null, { dis: !selTot })}<span class="xs faint">From Business checking ··4410 · ${S.lvl >= 2 ? "by bank transfer or check" : "by printed check"}</span></div>
      ${S.bills.some((b) => b.paid) ? `<p class="small muted">Paid: ${S.bills.filter((b) => b.paid).map((b) => esc(b.v)).join(", ")}</p>` : ""}
      ${v ? card(`<div class="row"><h2 style="font-size:18px">${esc(v.v)}</h2><span class="spacer"></span>${btn("Close", "quiet", "vendor", "", { sm: 1 })}</div>${table(["Date", "What", "Amount"], [["Sep 30", "Bill " + esc(v.n), money2(v.amt)], ["Aug 30", "Bill (paid)", money2(v.amt)], ["Aug 31", "Payment, check", money2(-v.amt)]], [0, 0, "r"])}<p class="xs faint">Example vendor history.</p>`) : ""}
      ${card(`<h2 style="font-size:18px">Who I owe, by age</h2>${agingBlock(D.AP_AGING.filter((a) => S.bills.find((b) => b.v === a.v && !b.paid)), "v", "Bills owed by age")}`)}
      ${card(`<h2 style="font-size:18px">${lab("Does it add up?", "A/P reconciliation")} · September</h2>${reconBlock("ap")}`)}`;
  }

  // ---- reconcile ----
  function reconcileUI() {
    const k = S.recon, R = D.RECON[k], diff = S.mis ? 40 : 0;
    return `${head("Reconcile", "Check your books against the bank statement and your customer and vendor lists.", seg("recon", [["bank", "Bank"], ["ar", "Money owed to me"], ["ap", "Bills I owe"]], S.recon, "What to reconcile"))}
      ${card(`<h2 style="font-size:18px">${R.t}</h2>${reconBlock(k)}<div class="row"><span class="small">${R.c}: <strong>${money(R.v[2] + diff)}</strong></span>${diff ? tag("Off by " + money(diff), "bad") : tag("Matches", "ok")}</div>
        ${sw(S.mis, "Show an example mismatch", "toggle", "mis")}
        ${diff ? `<div class="card ${S.helper ? "tint-lo" : ""}">${S.helper ? chip("lo", "Helper found a likely cause, on this computer") : ""}<p class="small">${S.helper ? "A $40.00 card payment on Sep 14 was entered twice (Sky Rail). Remove the copy?" : "Look for an entry entered twice or a missing bank fee. Amounts that are exactly double or half are a common clue."}</p>${S.helper ? `<div class="row">${btn("Remove the copy", "primary", "fixMis")}${btn("Not now", "quiet", "toggle", "mis")}</div><p class="xs faint">Asks before acting · you can undo for 7 days.</p>` : ""}</div>` : `<div class="row">${btn("Finish reconciling", "primary", "finishRecon")}</div>`}`)}`;
  }

  // ---- reports ----
  const TB = [
    ["1000", "Business checking", "Checking", 14240, 0], ["1010", "Savings", "Savings", 4000, 0], ["1200", "Money owed to me", "Accounts receivable", 11600, 0],
    ["1500", "Equipment", "Fixed assets", 28785, 0], ["1510", "Equipment wear", "Accumulated depreciation", 0, 3500],
    ["2000", "Bills I owe", "Accounts payable", 0, 1320], ["2100", "Business credit card", "Credit card payable", 0, 1020],
    ["3000", "Money I put in", "Owner's capital", 0, 12220], ["3100", "Money I took out", "Owner's draws", 36000, 0],
    ["4000", "Services I sell", "Service revenue", 0, 125000], ["4100", "Expenses billed back", "Reimbursed expenses", 0, 2700],
    ["6000", "Rent", "Rent expense", 15000, 0], ["6100", "Software", "Software and subscriptions", 4380, 0], ["6200", "Travel", "Travel expense", 2150, 0],
    ["6300", "Accountant and legal", "Professional fees", 1800, 0], ["6400", "Insurance", "Insurance expense", 2280, 0], ["6500", "Contractors", "Contract labor", 21450, 0],
    ["6600", "Advertising", "Advertising and marketing", 3150, 0], ["6700", "Office supplies", "Office supplies", 925, 0],
  ];
  function plUI() {
    const lines = S.fmt === "service" ? D.SVC : D.PRD;
    const ix = S.cmp === "year" ? [0, 1] : [2, 3];
    const cn = S.cmp === "year" ? ["2025", "2024"] : ["Jan–Sep 2026", "Jan–Sep 2025"];
    const tot = (g) => ix.map((i) => sum(lines.filter((l) => l.g === g).map((l) => l.v[i])));
    const inc = tot("inc"), cogs = tot("cogs"), exp = tot("exp");
    const gp = [inc[0] - cogs[0], inc[1] - cogs[1]], ni = [gp[0] - exp[0], gp[1] - exp[1]];
    const dcell = (a, b) => S.dif === "amt" ? signed(a - b) : b ? ((a - b) / Math.abs(b) * 100 >= 0 ? "+" : "−") + Math.abs((a - b) / Math.abs(b) * 100).toFixed(1) + "%" : "—";
    const pct = (a) => (inc[0] ? ((a / inc[0]) * 100).toFixed(1) + "%" : "—");
    const rows = [], cls = [];
    const push = (r, c) => { rows.push(r); cls.push(c || ""); };
    const line = (l) => { const i = lines.indexOf(l); push([`<span class="indent"><button type="button" class="linkish" data-act="drill" data-arg="${i}">${S.terms ? esc(l.a) : esc(l.p)}</button></span>`, money(l.v[ix[0]]), money(l.v[ix[1]]), dcell(l.v[ix[0]], l.v[ix[1]])].concat(S.base === "on" ? [pct(l.v[ix[0]])] : []), S.drill === i ? "hi" : ""); };
    const tline = (label, v) => push([label, money(v[0]), money(v[1]), dcell(v[0], v[1])].concat(S.base === "on" ? [pct(v[0])] : []), "total");
    const hline = (label) => push([label, "", "", ""].concat(S.base === "on" ? [""] : []), "head");
    hline(lab("Money in", "Income")); lines.filter((l) => l.g === "inc").forEach(line); tline(lab("Total money in", "Total income"), inc);
    if (S.fmt === "product") { hline(lab("Cost of what I sold", "Cost of goods sold")); lines.filter((l) => l.g === "cogs").forEach(line); tline(lab("Total cost of what I sold", "Total COGS"), cogs); tline(lab("Left after cost of sales", "Gross profit"), gp); }
    hline(lab("Money out", "Expenses")); lines.filter((l) => l.g === "exp").forEach(line); tline(lab("Total money out", "Total expenses"), exp); tline(lab("Profit", "Net income"), ni);
    const sel = lines[S.drill] || lines[0];
    const payees = D.PAYEES[sel.p] || ["Example payee A", "Example payee B", "Example payee C", "Example payee D"];
    const T = sel.v[ix[0]], parts = [0.31, 0.27, 0.22];
    const det = payees.slice(0, 3).map((p, i) => [["Mar 4", "Jun 11", "Aug 19"][i], esc(p), money2(Math.round(T * parts[i] * 100) / 100)]);
    det.push(["Various", "Other entries (example)", money2(Math.round((T - sum(det.map((d, i) => Math.round(T * parts[i] * 100) / 100))) * 100) / 100)]);
    return `<div class="row">${seg("cmp", [["year", "2 years: 2025 vs 2024"], ["ytd", "Year to date vs last year"]], S.cmp, "Compare")}${seg("dif", [["amt", "Difference in $"], ["pct", "Difference in %"]], S.dif, "Difference")}${seg("base", [["off", "Hide % of income"], ["on", "Show % of income"]], S.base, "Percent of income")}${seg("fmt", [["service", "Service business"], ["product", "Product business"]], S.fmt, "Format")}</div>
      <p class="small muted">Maple Street ${S.fmt === "service" ? "Studio (design services)" : "Pottery (example product business)"} · ${cn[0]} compared with ${cn[1]} · select a line to see its entries</p>
      ${table([lab("Line", "Account"), cn[0], cn[1], S.dif === "amt" ? "Difference" : "Change %"].concat(S.base === "on" ? ["% of income"] : []), rows, [0, "r", "r", "r", "r"], { label: "Profit and loss", cls })}
      ${card(`<h2 style="font-size:18px">Account detail: ${S.terms ? esc(sel.a) : esc(sel.p)} · ${cn[0]}</h2>${table(["Date", "Paid to / from", "Amount"], det.concat([["", "Total", money2(T)]]), [0, 0, "r"], { cls: det.map(() => "").concat(["total"]) })}<p class="xs faint">Example entries. In the app these open the checkbook entry.</p>`)}`;
  }
  function bsUI() {
    const g = (codes) => TB.filter((t) => codes.includes(t[0]));
    const ni = sum(TB.filter((t) => t[0] >= "4000").map((t) => t[4] - t[3]));
    const assets = g(["1000", "1010", "1200", "1500", "1510"]), liab = g(["2000", "2100"]);
    const aT = sum(assets.map((t) => t[3] - t[4])), lT = sum(liab.map((t) => t[4] - t[3]));
    const eqRows = [["Money I put in", "Owner's capital", 12220], ["Money I took out", "Owner's draws", -36000], ["Profit so far this year", "Net income", ni]];
    const eT = sum(eqRows.map((e) => e[2]));
    const rows = [], cls = [];
    const p = (a, b, c) => { rows.push(a); cls.push(b || ""); };
    p([lab("What I own", "Assets"), ""], "head"); assets.forEach((t) => p([`<span class="indent">${S.terms ? t[2] : t[1]}</span>`, money(t[3] - t[4])]));
    p([lab("Total I own", "Total assets"), money(aT)], "total");
    p([lab("What I owe", "Liabilities"), ""], "head"); liab.forEach((t) => p([`<span class="indent">${S.terms ? t[2] : t[1]}</span>`, money(t[4] - t[3])]));
    p([lab("Total I owe", "Total liabilities"), money(lT)], "total");
    p([lab("What's mine", "Owner's equity"), ""], "head"); eqRows.forEach((e) => p([`<span class="indent">${S.terms ? e[1] : e[0]}</span>`, money(e[2])]));
    p([lab("Total that's mine", "Total equity"), money(eT)], "total");
    p([lab("What I owe + what's mine", "Total liabilities and equity"), money(lT + eT)], "total");
    return `<p class="small muted">As of October 28, 2026 · example data</p>${table(["", "Amount"], rows, [0, "r"], { label: "Balance sheet", cls })}<p class="small">${aT === lT + eT ? tag("Balanced", "ok") : tag("Out of balance", "bad")} <span class="muted">What you own equals what you owe plus what's yours.</span></p>`;
  }
  function tbUI() {
    const d = sum(TB.map((t) => t[3])), c = sum(TB.map((t) => t[4]));
    return `<p class="small muted">As of October 28, 2026 · every account's balance. Left and right must match.</p>${table(["No.", lab("Account", "Account"), S.terms ? "Debit" : "Left (debit)", S.terms ? "Credit" : "Right (credit)"], TB.map((t) => [`<span class="mono">${t[0]}</span>`, S.terms ? t[2] : t[1], t[3] ? money(t[3]) : "", t[4] ? money(t[4]) : ""]).concat([["", "Total", money(d), money(c)]]), [0, 0, "r", "r"], { label: "Trial balance", cls: TB.map(() => "").concat(["total"]) })}<p class="small">${d === c ? tag("Balanced at " + money(d), "ok") : tag("Off by " + money(d - c), "bad")}</p>`;
  }
  function reportsUI() {
    return `${head("Reports", "Standard reports your accountant will recognise. Turn on Accountant terms to see their names.", seg("rep", [["pl", "Profit and loss"], ["bs", "Balance sheet"], ["tb", "Trial balance"]], S.rep, "Report"))}
      ${S.rep === "pl" ? plUI() : S.rep === "bs" ? bsUI() : tbUI()}
      <div class="row">${btn("Save as PDF (example)", "secondary", "fakeExport", "PDF")}${btn("Save as spreadsheet (example)", "secondary", "fakeExport", "spreadsheet")}</div>`;
  }

  // ---- categories ----
  function categoriesUI() {
    return `${head(lab("Categories", "Chart of accounts"), "Set up from your business type and how the business is organised. Rename, add or hide any.")}
      <div class="row"><fieldset><legend class="small">What you sell</legend>${seg("biz", [["service", "Services"], ["product", "Products"]], S.biz, "Business type")}</fieldset><fieldset><legend class="small">How it's set up</legend>${seg("ent", [["sole", "Sole proprietor"], ["partner", "Partnership"], ["scorp", "S corp"], ["ccorp", "C corp"]], S.ent, "Entity type")}</fieldset></div>
      ${coaPreview(false)}<div class="row">${btn("Add a category", "secondary", "addCat")}</div>`;
  }

  // ---- helper page ----
  const PERMS = [["suggest", "Suggest only"], ["ask", "Ask before acting"], ["undo", "Do it, I can undo"]];
  const BANNED = /\b(pay|paid|payment|check|cheque|send|sent|email|share|transfer|wire|invoice.*send|remind)\b/i;
  function helperUI() {
    const install = `<section class="card" aria-labelledby="ins-h"><h2 id="ins-h" style="font-size:18px">${S.helper ? "Installed on this computer" : "Add the on-device helper"}</h2>
      <ol class="steps" style="margin:0;padding:0;list-style:none">
        <li class="row"><span class="stepnum">1</span><span class="col" style="gap:6px;flex:1 1 240px"><strong>Check this computer</strong>${seg("hw", [["16", "16 GB or more"], ["8", "8 GB"], ["4", "4 GB"]], S.hw, "Memory (example)")}<span class="small muted">${S.hw === "16" ? "Standard model (about 4 GB download)." : S.hw === "8" ? "Smaller model (about 2 GB). Slower and a bit less accurate; it says so while working." : "Not enough memory. Everything else in Rosy Books still works."}</span></span></li>
        <li class="row"><span class="stepnum">2</span><span class="col" style="gap:6px;flex:1 1 240px"><strong>Get the model</strong><span class="small muted">Download once, or copy it from the offline installer on a USB stick. After that it never needs the internet.</span>${S.dl > 0 && S.dl < 100 ? `${bar(S.dl, "dlbar")}<span class="xs faint">${S.dl}% · prototype only, nothing is downloading</span><div class="row">${btn(S.dlPaused ? "Resume" : "Pause", "secondary", "dlPause", null, { sm: 1 })}</div>` : S.dl >= 100 ? tag("Model ready", "ok") : `<div class="row">${btn("Download model", "secondary", "dlStart", null, { dis: S.hw === "4" })}${btn("Use offline installer / USB", "secondary", "dlUsb", null, { dis: S.hw === "4" })}</div>`}</span></li>
        <li class="row"><span class="stepnum">3</span><span class="col" style="gap:6px;flex:1 1 240px"><strong>Check it's genuine</strong><span class="small muted">${S.dl >= 100 || S.helper ? "Signature checked by Rosy Books." : "Rosy Books checks the model's signature before using it."}</span></span></li>
        <li class="row"><span class="stepnum">4</span><span class="col" style="gap:6px;flex:1 1 240px"><strong>${S.helper ? "Ready" : "Turn it on"}</strong>${sw(S.helper, "On-device helper", "toggleHelper", null, S.hw === "4" && !S.helper ? "Needs 8 GB" : null)}</span></li>
      </ol></section>`;
    if (!S.helper) return `${head("On-device helper", "An optional add-on that works at any trust level. It runs only on this computer.")}${install}`;
    const perms = `<section class="card" aria-labelledby="perm-h"><h2 id="perm-h" style="font-size:18px">What the helper may do</h2><p class="small muted">Default for everything is <strong>Ask before acting</strong>. Anything it does can be undone for 7 days.</p>
      ${D.HELPER_TASKS.map((t) => `<div class="listrow" style="padding:10px 0"><span style="flex:1 1 200px" class="small" id="pl-${t.k}"><strong>${t.name}</strong></span>${t.lock ? chip("l1", t.lock) : `<div class="row" role="radiogroup" aria-labelledby="pl-${t.k}" style="flex:2 1 320px;gap:6px">${PERMS.map((p) => `<button type="button" role="radio" class="opt" aria-checked="${S.perm[t.k] === p[0]}" data-act="perm" data-arg="${t.k}=${p[0]}">${p[1]}</button>`).join("")}</div>`}</div>`).join("")}</section>`;
    const habits = `<section class="card" aria-labelledby="hab-h"><h2 id="hab-h" style="font-size:18px">Learns as it goes (optional)</h2>
      ${sw(S.learns, "Let the helper remember my choices as habits", "toggle", "learns")}
      <p class="small muted">Off by default. Habits are kept on this computer, listed here, and you can edit or delete any of them. Habits are never used for paying, sending or sharing anything.</p>
      ${S.learns ? `<div class="boxlist">${S.habits.map((h) => `<div class="listrow">${S.editHabit === h.id ? `<label class="f" style="flex:1 1 220px">Edit habit<input class="in" id="hab-edit" data-bind="habitDraft" value="${esc(S.habitDraft || h.text)}"></label>${btn("Save", "primary", "habSave", h.id, { sm: 1 })}${btn("Cancel", "quiet", "habCancel", null, { sm: 1 })}` : `<span style="flex:1 1 200px"><span class="small" ${h.on ? "" : 'style="text-decoration:line-through"'}>${esc(h.text)}</span><br><span class="xs faint">${esc(h.src)}</span></span>${sw(h.on, "Use", "habToggle", h.id)}${btn("Edit", "secondary", "habEdit", h.id, { sm: 1, label: "Edit habit: " + h.text })}${btn("Delete", "danger", "habDel", h.id, { sm: 1, label: "Delete habit: " + h.text })}`}</div>`).join("") || `<div class="listrow small muted">No habits yet.</div>`}</div>
      <div class="row" style="align-items:flex-end"><label class="f" style="flex:1 1 240px">Add a habit<input class="in" id="hab-new" data-bind="habitNew" value="${esc(S.habitNew || "")}" placeholder="e.g. Fontcraft Library → Software"></label>${btn("Add", "secondary", "habAdd")}</div>${S.habErr ? `<p class="small" role="alert" style="color:var(--clay)">${S.habErr}</p>` : ""}` : ""}</section>`;
    const hist = `<section class="card" aria-labelledby="hist-h"><h2 id="hist-h" style="font-size:18px">History (undo for 7 days)</h2>${S.history.length ? `<div class="boxlist">${S.history.map(histRow).join("")}</div>` : `<p class="small muted">Nothing yet. Try sorting entries.</p>`}${btn("Try: sort last week's 14 entries", "secondary", "sortTask")}</section>`;
    return `${head("On-device helper", "Works offline, at any trust level. Slower than cloud AI, and honest about it.", chip("lo", S.hw === "8" ? "Smaller model · 8 GB" : "Standard model"))}${perms}${habits}${hist}${install}`;
  }

  // ---- cloud AI ----
  function aiPayload() {
    const a = S.ai, cust = a.red.names ? "[customer]" : "Northside Bakery";
    if (a.scope === "totals") return `Question: ${a.q}\nPeriod: Jul–Sep 2026 vs Apr–Jun 2026\nMoney in: $41,600 vs $40,700\nMoney out: $16,450 vs $16,200\nTop 3 spending categories: Contractors $6,600; Rent $4,800; Advertising $1,150`;
    if (a.scope === "entries") return `Question: ${a.q}\n12 entries, Jul–Sep 2026:\nJul 3  ${cust}  +$2,400.00${a.red.memos ? "" : "  memo: Invoice 1019"}\nJul 9  ${a.red.names ? "[vendor]" : "Cloudnest Hosting"}  −$180.00${a.red.memos ? "" : "  memo: Monthly plan"}\n… 10 more lines in the same form`;
    return `Question: ${a.q}\n1 document: P&L Jul–Sep 2026 (PDF)${a.red.detail ? "\nAccount numbers removed" : "\nIncludes account numbers"}${a.red.names ? "\nCustomer names hidden" : ""}`;
  }
  function aiUI() {
    if (S.lvl < 3) return `${head("Cloud AI (your own)", "Use the AI app you already pay for, through a connector that runs on this computer.")}${lockedCard(3, "Cloud AI is a Level 3 feature")}`;
    const a = S.ai;
    const honest = `<div class="card tint-l3">${chip("l3", "Plain truth")}<p class="small"><strong>A cloud AI has to read what you send it to answer.</strong> It isn't private the way your computer is, and there's no such thing as "fully encrypted AI". So Rosy Books sends as little as possible: totals by default, a preview before every send, names hidden if you like, and a log of everything that left.</p></div>`;
    const conn = `<section class="card" aria-labelledby="conn-h"><h2 id="conn-h" style="font-size:18px">Connect your AI app</h2>
      <ol class="steps" style="margin:0;padding:0;list-style:none">
        <li class="row"><span class="stepnum">1</span><span class="col" style="gap:6px;flex:1 1 240px"><strong>Pick the app you use</strong>${seg("aiapp", D.PROVIDERS.map((p) => [p, p + " (example)"]), a.app, "AI app")}</span></li>
        <li class="row"><span class="stepnum">2</span><span class="col" style="gap:6px;flex:1 1 240px"><strong>Start the Rosy Books connector on this computer</strong><span class="small muted">It's a small local connector (MCP) that your AI app talks to. Your books never go to a Rosy Books server.</span>${sw(a.connector, "Local connector running", "aiConn")}</span></li>
        <li class="row"><span class="stepnum">3</span><span class="col" style="gap:6px;flex:1 1 240px"><strong>What it may do</strong>${sw(a.readOnly, "Read-only (recommended)", "aiRO")}${!a.readOnly ? `<span class="small muted">It may suggest draft entries, which wait for your approval. It can never pay, send or share anything.</span>` : `<span class="small muted">It can only read what you approve, each time.</span>`}</span></li>
      </ol></section>`;
    let flow = "";
    if (!a.connector) flow = `<p class="small muted">Start the connector to try asking a question.</p>`;
    else if (a.stage === "ask") flow = `<div class="row" style="align-items:flex-end"><label class="f" style="flex:1 1 300px">Ask ${esc(a.app)} about your books<input class="in" id="ai-q" data-bind="ai.q" value="${esc(a.q)}"></label>${btn("Ask", "primary", "aiAsk")}</div>`;
    else if (a.stage === "local") flow = `<div class="card tint-lo">${chip("lo", "Answered on this computer first")}<p class="small">Money in was $41,600 this quarter, up $900 (2%) from last quarter. Money out rose $250.</p><p class="xs faint">Nothing left this computer.</p></div><div class="row">${btn("Also ask " + esc(a.app) + " for more", "secondary", "aiPreview")}${btn("That's enough", "quiet", "aiReset")}</div>`;
    else if (a.stage === "preview") flow = `<div class="col"><h3>Preview: exactly what ${esc(a.app)} would see</h3>
        <fieldset><legend class="small">What to share</legend>${seg("aiscope", [["totals", "Totals only (default)"], ["entries", "Some entries"], ["docs", "A document"]], a.scope, "What to share")}</fieldset>
        <fieldset class="row"><legend class="small">Hide before sending</legend>${sw(a.red.names, "Customer and vendor names", "aiRed", "names")}${sw(a.red.memos, "Memos", "aiRed", "memos")}${sw(a.red.detail, "Account numbers", "aiRed", "detail")}</fieldset>
        <pre class="payload" aria-label="Text that would be sent">${esc(aiPayload())}</pre>
        <div class="row">${btn("Send this once", "primary", "aiSend")}${btn("Cancel", "quiet", "aiReset")}</div><p class="xs faint">Prototype: nothing is actually sent. Each send is added to "What left this device".</p></div>`;
    else flow = `<div class="card tint-l3">${chip("l3", "Answer from " + esc(a.app) + " (example)")}<p class="small">This quarter you earned a little more and spent about the same, so profit rose about 3%. Contractors are your biggest cost; that's normal for a studio your size.</p><p class="xs faint">Logged in What left this device.</p></div>${btn("Ask another", "secondary", "aiReset")}`;
    return `${head("Cloud AI (your own)", "Level 3 · item by item, with a preview and a log.", link("See what left this device", "privacy", "quiet"))}${honest}${conn}${card(`<h2 style="font-size:18px">Try it</h2>${flow}`)}`;
  }

  // ---- privacy ----
  function privacyUI() {
    const lg = S.log.filter((l) => S.logF === "all" || l.k === S.logF);
    return `${head("Privacy & sharing", "Your overall level, and per-feature choices. Changes take effect right away.")}
      <div class="row" role="radiogroup" aria-label="Trust level" style="align-items:stretch">${[1, 2, 3].map((n) => `<button type="button" role="radio" class="pick l${n}" aria-checked="${S.lvl === n}" data-act="setLvl" data-arg="${n}" style="padding:14px"><span class="lc">${badge(n)}</span><span class="small muted" style="display:block;margin-top:6px">${D.LV[n].leaves}</span></button>`).join("")}</div>
      <section class="card" aria-labelledby="mx-h"><h2 id="mx-h" style="font-size:18px">Feature by feature</h2><p class="small muted">Options above your level are greyed out. Raise your level, or keep a feature more private than your level.</p>
        ${D.FEAT.map((f) => `<div class="listrow" style="padding:10px 0"><span class="small" style="flex:1 1 180px" id="fx-${f.k}"><strong>${f.name}</strong></span><div class="row" role="radiogroup" aria-labelledby="fx-${f.k}" style="flex:2 1 320px;gap:6px">${f.opts.map((o, i) => { const ok = o.need <= S.lvl; const eff = f.opts[S.mx[f.k]].need <= S.lvl ? S.mx[f.k] : 0; const on = ok && eff === i; return `<button type="button" role="radio" class="opt" aria-checked="${on}" ${ok ? `data-act="mx" data-arg="${f.k}=${i}"` : "disabled"}>${o.l}${ok ? "" : ` <span class="xs">(Level ${o.need})</span>`}</button>`; }).join("")}</div></div>`).join("")}
        <div class="listrow" style="padding:10px 0"><span class="small" style="flex:1 1 180px"><strong>On-device helper</strong><br><span class="xs faint">Any level · never online</span></span>${sw(S.helper, "Helper", "toggleHelper")}</div>
        <div class="listrow" style="padding:10px 0"><span class="small" style="flex:1 1 180px"><strong>Paying, sending, sharing</strong></span>${chip("l1", "Always asks you · can't be changed")}</div></section>
      <section class="card" aria-labelledby="log-h"><h2 id="log-h" style="font-size:18px">What left this device</h2>${seg("logF", [["all", "Everything"], ["ai", "Cloud AI"], ["bank", "Bank"], ["app", "App and other"]], S.logF, "Filter log")}
        ${lg.length ? table(["When", "To", "What", "Why"], lg.map((l) => [l.t, esc(l.who), esc(l.what), esc(l.why)]), 0, { label: "What left this device" }) : `<p class="small muted">Nothing in this view.</p>`}<p class="xs faint">Example entries. The log is kept on this computer and can be exported for your records.</p></section>`;
  }

  // ---- accountant ----
  function accountantUI() {
    const viaFolder = S.mx.acct === 1 && S.lvl >= 2;
    let body = "";
    if (S.hand === "send") body = card(`<h2 style="font-size:18px">Send your year to your accountant</h2><p class="small muted">To: Rivera &amp; Co. CPAs (example accountant)</p>
      <ul class="small" style="margin:0;padding-left:18px"><li>Profit and loss, balance sheet, trial balance (2026)</li><li>General ledger and account detail</li><li>A/R and A/P aging, reconciliations</li><li>Your books file, read-only copy</li></ul>
      ${sw(S.inclReceipts, "Include receipts (43 files)", "toggle", "inclReceipts")}
      <p class="small muted">${viaFolder ? "Sent to a shared folder you both use (Level 2)." : "Saved as one encrypted file you give them. The password is shown once for you to tell them separately."}</p>
      <div class="row">${btn("Create package", "primary", "handSend")}</div>`);
    else if (S.hand === "back") body = card(`<h2 style="font-size:18px">Changes from your accountant</h2><p class="small muted">Rivera &amp; Co. sent 2 adjustments (example). Nothing changes until you approve.</p>
      ${table(["Change", "Why", "Amount"], [["Equipment wear for 2026", "Yearly depreciation", money2(3500)], ["Move Sky Rail Sep 14 to Travel", "Was in Office supplies", money2(386.2)]], [0, 0, "r"])}
      <div class="row">${S.handAccepted ? tag("Approved · undo in History for 7 days", "ok") : btn("Approve both", "primary", "handAccept")}</div>`);
    else body = card(`<h2 style="font-size:18px">What your accountant sees</h2><p class="small muted">The same reports with accountant terms turned on, plus account numbers. They can't change your books; they send changes back for you to approve.</p>${link("Open reports with accountant terms", "reports", "secondary")}`);
    return `${head("Accountant hand-off", "Send a clean package, get changes back, approve them.", seg("hand", [["send", "Send to accountant"], ["back", "Changes from accountant"], ["view", "Accountant's view"]], S.hand, "Hand-off step"))}${body}`;
  }

  // ---- backup ----
  function backupUI() {
    const bk = S.bk;
    return `${head("Backups", "Your books are one file on this computer. Keep copies.")}
      ${card(`<div class="row"><h2 style="font-size:18px">Back up now</h2><span class="spacer"></span><span class="small muted">Last backup ${bk.last}</span></div>${bk.running ? `${bar(bk.pct, "bkbar")}<p class="small muted">Saving an encrypted copy… (prototype)</p>` : `<div class="row">${btn("Back up to this computer", "primary", "backup", "computer")}${btn("Back up to a USB drive", "secondary", "backup", "USB drive")}${S.lvl >= 2 && S.mx.bak === 1 ? btn("Back up to my cloud folder", "secondary", "backup", "cloud folder") : ""}</div>`}<p class="xs faint">${S.lvl >= 2 ? "At Level 2 you can also keep encrypted copies in your own cloud folder (choose it in Privacy & sharing)." : "At Level 1 backups stay on this computer or a drive you plug in."}</p>`)}
      ${card(`<h2 style="font-size:18px">Restore</h2>${table(["Backup", "Where", ""], [["Today 8:02 AM", "This computer", btn("Restore", "secondary", "restore", "Today 8:02 AM", { sm: 1 })], ["Oct 21, 6:00 PM", "USB drive “STUDIO”", btn("Restore", "secondary", "restore", "Oct 21, 6:00 PM", { sm: 1 })], ["Oct 1, 9:15 AM", "This computer", btn("Restore", "secondary", "restore", "Oct 1, 9:15 AM", { sm: 1 })]], 0, { label: "Backups" })}<p class="xs faint">Restoring first saves a copy of your books as they are now, so you can go back.</p>`)}`;
  }

  // ================= actions =================
  const SCREENS = { site: siteUI, start: startUI, home: homeUI, checkbook: checkbookUI, receipts: receiptsUI, invoices: invoicesUI, bills: billsUI, reconcile: reconcileUI, reports: reportsUI, categories: categoriesUI, helper: helperUI, ai: aiUI, privacy: privacyUI, accountant: accountantUI, backup: backupUI };
  function logOut(who, what, why, k, need) { S.log.unshift({ t: "Today, " + nowLabel(), k, need, who, what, why }); S.sentToday++; }
  const setPath = (path, v) => { const p = path.split("."); let o = S; while (p.length > 1) o = o[p.shift()]; o[p[0]] = v; };
  let dlTimer = null;

  const A = {
    set(arg) {
      const [k, v] = arg.split("=");
      const map = { aiapp: () => (S.ai.app = v), aiscope: () => (S.ai.scope = v) };
      if (map[k]) map[k]();
      else if (k === "lvl") A.setLvl(v);
      else S[k] = /^\d+$/.test(v) && (k === "lvl") ? +v : v;
      if (k === "theme") document.documentElement.setAttribute("data-theme", v);
    },
    setLvl(v) {
      const n = +v, old = S.lvl; if (n === old) return;
      S.lvl = n;
      if (S.quiz) S.quiz = null;
      if (n < 3) { S.ai.connector = false; S.ai.stage = "ask"; }
      toast(`Now at Level ${n} · ${D.LV[n].name}. ${D.LV[n].leaves}.`, route() === "start" ? null : () => { S.lvl = old; });
    },
    toggle(k) { S[k] = !S[k]; },
    toggleHelper() {
      if (!S.helper && S.hw === "4") { toast("This computer needs at least 8 GB of memory for the helper."); return; }
      S.helper = !S.helper;
      if (!S.helper) { S.tasks = []; S.waiting = []; }
      toast(S.helper ? "On-device helper is on. It works offline and asks before acting." : "Helper turned off. Your books work the same without it.");
    },
    togglePanel() { S.panel = !S.panel; },
    onb(v) { S.onb = +v; S.quiz = null; },
    quizStart() { S.quiz = { i: 0, a: [] }; },
    quizAns(v) { S.quiz.a.push(+v); S.quiz.i++; },
    fakeDl(what) { dialog({ title: "Prototype: nothing downloads", body: `<p>In the real product, this would download Rosy Books for ${esc(what)}.</p><p class="small muted">This is a design prototype with example data. There is no installer and no file. Nothing has been downloaded to your device.</p>`, cancel: "OK" }); },
    fakeExport(what) { toast(`Prototype: no ${esc(what)} file is created.`); },
    homeAsk(i) { S.homeAns = +i === 0 ? "You spent $4,020 on software from January to September, up $410 from last year. Cloudnest Hosting is the biggest part." : "Summit Law Group owes the most: $3,050, of which $800 is over 90 days late."; },
    sortTask,
    taskPause(id) { const t = S.tasks.find((x) => x.id === id); if (t) t.paused = true; },
    taskResume(id) { const t = S.tasks.find((x) => x.id === id); if (t) { t.paused = false; ensureTick(); } },
    taskLater(id) { const t = S.tasks.find((x) => x.id === id); if (t) { t.later = true; toast("Saved for later. The helper will pick it up when you say so."); } },
    taskNow(id) { const t = S.tasks.find((x) => x.id === id); if (t) { t.later = false; t.paused = false; ensureTick(); } },
    taskStop(id) { const t = S.tasks.find((x) => x.id === id); S.tasks = S.tasks.filter((x) => x.id !== id); if (t && t.kind === "read") { const r = S.receipts.find((x) => x.s === "reading"); if (r) r.s = "check"; } toast("Stopped. Nothing was changed."); },
    approveWait(id) {
      const w = S.waiting.find((x) => x.id === id); if (!w) return;
      S.waiting = S.waiting.filter((x) => x !== w);
      const n = w.items.filter((i) => i.cat !== "Not sure").length;
      const h = addHistory(`Sorted ${n} entries (approved by you)`, () => {});
      toast(`Done. ${n} entries sorted.`, () => undoItem(h));
    },
    dismissWait(id) { S.waiting = S.waiting.filter((x) => x.id !== id); },
    useSugg(arg) { const [id, i] = arg.split("|"); const w = S.waiting.find((x) => x.id === id); if (!w) return; const it = w.items.splice(+i, 1)[0]; const h = addHistory(`${it.who} → ${it.cat}`, () => {}); toast(`${esc(it.who)} set to ${esc(it.cat)}.`, () => undoItem(h)); if (!w.items.some((x) => x.cat !== "Not sure")) S.waiting = S.waiting.filter((x) => x !== w); },
    undoHist(id) { const h = S.history.find((x) => x.id === id); undoItem(h); toast("Undone."); },
    // checkbook
    addEntry() {
      const a = S.add, out = parseAmt(a.out), inn = parseAmt(a.inn);
      if (!a.p.trim()) { S.addErr = "Add who you paid or who paid you."; return; }
      if (!(out > 0) && !(inn > 0)) { S.addErr = "Enter a payment or a deposit amount."; return; }
      if (out > 0 && inn > 0) { S.addErr = "Use either payment or deposit, not both."; return; }
      S.addErr = "";
      const e = { d: a.d || "Oct 28", no: a.no, p: a.p.trim(), c: a.c, m: "", pay: out > 0 ? out : 0, dep: inn > 0 ? inn : 0, cl: false };
      S.entries.push(e); S.add = { d: "Oct 28", no: "", p: "", c: a.c, out: "", inn: "" };
      const h = addHistory(`Added ${e.p} ${money2(e.pay || e.dep)}`, () => { S.entries = S.entries.filter((x) => x !== e); });
      toast(`Added ${esc(e.p)}.`, () => undoItem(h));
    },
    importFile() { toast("Prototype: no file picker opens. In the app you'd pick a bank file (CSV, OFX or QFX) from your computer."); },
    feedAdd(i) { const f = S.feed[+i]; f.done = true; const e = { d: f.d, no: "", p: f.p, c: f.c, m: "From bank", pay: f.amt < 0 ? -f.amt : 0, dep: f.amt > 0 ? f.amt : 0, cl: true }; S.entries.push(e); const h = addHistory(`Added ${f.p} from bank`, () => { S.entries = S.entries.filter((x) => x !== e); f.done = false; }); toast(`Added ${esc(f.p)} as ${esc(f.c)}.`, () => undoItem(h)); },
    feedSkip(i) { S.feed[+i].done = true; },
    writeCheck() {
      const amt = parseAmt(S.chk.amt);
      if (!S.chk.payee.trim() || !(amt > 0) || amt >= 1000000) { toast("Add who to pay and an amount first."); return; }
      const no = S.nextCheck, payee = S.chk.payee.trim();
      approveMoney(`Record and print check ${no}?`, `<p><strong>${esc(payee)}</strong> · ${money2(amt)}<br><span class="small muted">${esc(words(amt))}</span></p><p class="small muted">From Business checking ··4410. Prototype: nothing prints.</p>`, "Approve and print", () => {
        const e = { d: "Oct 28", no: String(no), p: payee, c: "Office supplies", m: S.chk.memo, pay: amt, dep: 0, cl: false };
        S.entries.push(e); S.nextCheck++;
        const h = addHistory(`Check ${no} to ${payee} ${money2(amt)}`, () => { S.entries = S.entries.filter((x) => x !== e); });
        toast(`Check ${no} recorded. (Prototype: nothing printed.)`, () => undoItem(h));
      });
    },
    // receipts
    rsel(i) { S.rsel = +i; },
    addReceipt() {
      const s = D.SAMPLE_RECEIPTS[S.sampleIx]; if (!s) return; S.sampleIx++;
      const r = Object.assign({ s: "reading" }, s); S.receipts.unshift(r); S.rsel = 0;
      if (S.helper) {
        startTask({ label: "Reading " + s.f, total: 100, unit: "", speed: S.hw === "8" ? 7 : 14, kind: "read", finish: () => { r.s = "done"; const h = addHistory(`Read receipt ${s.f}: ${s.v} ${s.t}`, () => { r.s = "check"; }); toast(`Read ${esc(s.f)} on this computer: ${esc(s.v)}, ${esc(s.t)}.`, () => undoItem(h)); } });
      } else { r.s = "done"; toast("Read with basic text reading. Add the helper for better results on messy receipts."); }
    },
    fixTotal() { const v = parseAmt(S.rtotal); if (!(v > 0)) { toast("Type the total, like 42.18"); return; } const r = S.receipts.find((x) => x.s === "check"); if (r) { r.t = money2(v); r.s = "done"; toast("Saved. Thanks!"); } },
    aiReceipt() {
      dialog({ title: `Send 1 receipt to ${esc(S.ai.app)}?`, body: `<pre class="payload">1 image: gas-station-faded.jpg\nCard digits blurred · nothing else attached\nAsk: "What is the total on this receipt?"</pre><p class="small muted">${esc(S.ai.app)} has to read the image to answer. This will be logged. Prototype: nothing is sent.</p>`, ok: "Send once", onOk: () => { const r = S.receipts.find((x) => x.s === "check"); if (r) { r.t = "$42.18"; r.s = "done"; } logOut(S.ai.app + " (example)", "1 receipt image with card digits blurred.", "You asked it to read a faded total", "ai", 3); toast("Total read: $42.18. Logged in What left this device."); } });
    },
    // invoices
    newInvoice() { toast("Prototype: invoice 1035 drafted for an example customer. Drafts are never sent without you."); S.invoices.unshift({ n: "1035", c: "Lakeview Dental", amt: 1500, due: "Nov 30", st: "Draft" }); },
    sendInv(n) { const inv = S.invoices.find((i) => i.n === n); approveMoney(`Send invoice ${n}?`, `<p><strong>${esc(inv.c)}</strong> · ${money2(inv.amt)} · due ${inv.due}</p><p class="small muted">${S.lvl >= 2 ? "Emailed from Rosy Books." : "Saved as a PDF and opened in your mail app."} Prototype: nothing is sent.</p>`, "Approve and send", () => { inv.st = "Sent"; logOut(S.lvl >= 2 ? "Email to customer (example)" : "Your mail app (PDF)", `Invoice ${n} for ${money2(inv.amt)}.`, "You approved sending", "app", 1); toast(`Invoice ${n} sent (prototype).`); }); },
    remind(n) { const inv = S.invoices.find((i) => i.n === n); approveMoney(`Send a reminder for invoice ${n}?`, `<p class="small">"Hi ${esc(inv.c)}, a friendly reminder that invoice ${n} for ${money2(inv.amt)} was due ${inv.due}."</p>`, "Approve and send", () => { logOut("Email to customer (example)", `Reminder for invoice ${n}.`, "You approved sending", "app", 1); toast("Reminder sent (prototype)."); }); },
    markPaid(n) { const inv = S.invoices.find((i) => i.n === n); const old = inv.st; inv.st = "Paid"; const h = addHistory(`Invoice ${n} marked paid`, () => { inv.st = old; }); toast(`Invoice ${n} marked paid.`, () => undoItem(h)); },
    // bills
    billSel(i) { S.bills[+i].sel = !S.bills[+i].sel; },
    vendor(i) { S.vendor = i === "" ? null : +i; },
    payBills() {
      const sel = S.bills.filter((b) => b.sel && !b.paid); if (!sel.length) return; const t = sum(sel.map((b) => b.amt));
      approveMoney(`Pay ${sel.length} bill${sel.length > 1 ? "s" : ""}, ${money2(t)}?`, `<ul class="small" style="margin:0;padding-left:18px">${sel.map((b) => `<li>${esc(b.v)} · ${money2(b.amt)}</li>`).join("")}</ul><p class="small muted">From Business checking ··4410. Prototype: no money moves.</p>`, "Approve and pay", () => {
        sel.forEach((b) => { b.paid = true; b.sel = false; });
        const h = addHistory(`Paid ${sel.length} bill(s), ${money2(t)}`, () => sel.forEach((b) => (b.paid = false)));
        toast(`Paid ${money2(t)} (prototype).`, () => undoItem(h));
      });
    },
    fixMis() { S.mis = false; const h = addHistory("Removed duplicate Sky Rail $40.00 (Sep 14)", () => { S.mis = true; }); toast("Removed the copy. Reconciled.", () => undoItem(h)); },
    finishRecon() { toast("Reconciled. Saved a report you can print."); },
    drill(i) { S.drill = +i; },
    addCat() { toast("Prototype: a new category would be added here, with a plain name and the accountant's name side by side."); },
    // helper page
    perm(arg) { const [k, v] = arg.split("="); S.perm[k] = v; },
    dlStart() { S.dl = 1; S.dlPaused = false; runDl(); },
    dlPause() { S.dlPaused = !S.dlPaused; if (!S.dlPaused) runDl(); },
    dlUsb() { S.dl = 100; toast("Model copied from the offline installer (prototype)."); },
    habToggle(id) { const h = S.habits.find((x) => x.id === id); h.on = !h.on; },
    habEdit(id) { S.editHabit = id; S.habitDraft = S.habits.find((x) => x.id === id).text; },
    habCancel() { S.editHabit = null; S.habErr = ""; },
    habSave(id) { const v = (S.habitDraft || "").trim(); if (!v) return; if (BANNED.test(v)) { S.habErr = "Habits can't pay, send or share anything. Those always ask you."; return; } S.habits.find((x) => x.id === id).text = v; S.editHabit = null; S.habErr = ""; },
    habDel(id) { const i = S.habits.findIndex((x) => x.id === id); const h = S.habits.splice(i, 1)[0]; toast("Habit deleted.", () => S.habits.splice(i, 0, h)); },
    habAdd() { const v = (S.habitNew || "").trim(); if (!v) return; if (BANNED.test(v)) { S.habErr = "Habits can't pay, send or share anything. Those always ask you."; return; } S.habits.push({ id: "h" + Date.now(), text: v, src: "Added by you", on: true }); S.habitNew = ""; S.habErr = ""; },
    // AI
    aiConn() { S.ai.connector = !S.ai.connector; S.ai.stage = "ask"; toast(S.ai.connector ? `Connector running on this computer. ${esc(S.ai.app)} can ask; you approve each share.` : "Connector stopped."); },
    aiRO() { S.ai.readOnly = !S.ai.readOnly; },
    aiRed(k) { S.ai.red[k] = !S.ai.red[k]; },
    aiAsk() { S.ai.stage = S.helper ? "local" : "preview"; },
    aiPreview() { S.ai.stage = "preview"; },
    aiReset() { S.ai.stage = "ask"; },
    aiSend() {
      dialog({ title: `Send this to ${esc(S.ai.app)} once?`, body: `<pre class="payload">${esc(aiPayload())}</pre><p class="small muted">${esc(S.ai.app)} will read this to answer. It will be logged. Prototype: nothing is sent.</p>`, ok: "Send once", onOk: () => { S.ai.stage = "answer"; logOut(S.ai.app + " (example)", S.ai.scope === "totals" ? "Quarter totals and top 3 categories." + (S.ai.red.names ? " Names hidden." : "") : S.ai.scope === "entries" ? "12 entries for Jul–Sep 2026." + (S.ai.red.names ? " Names hidden." : "") : "1 P&L document.", "You asked: " + S.ai.q, "ai", 3); } });
    },
    mx(arg) { const [k, v] = arg.split("="); S.mx[k] = +v; toast("Saved. Takes effect now."); },
    // accountant
    handSend() { approveMoney("Create and share the accountant package?", `<p class="small">Reports, ledger, aging, reconciliations, books file${S.inclReceipts ? ", 43 receipts" : ""}.</p><p class="small muted">${S.mx.acct === 1 && S.lvl >= 2 ? "Goes to your shared folder." : "Saved as an encrypted file for you to hand over."} Prototype: no file is created.</p>`, "Approve", () => { logOut("Rivera & Co. CPAs (example)", "Year-end package" + (S.inclReceipts ? " with receipts" : "") + ".", "You approved the hand-off", "app", 1); toast("Package ready (prototype)."); }); },
    handAccept() { S.handAccepted = true; const h = addHistory("Approved 2 changes from Rivera & Co.", () => { S.handAccepted = false; }); toast("Approved.", () => undoItem(h)); },
    backup(where) { if (S.bk.running) return; S.bk.running = true; S.bk.pct = 0; const iv = setInterval(() => { S.bk.pct += 20; const b = $("#bkbar"); if (b) { b.setAttribute("aria-valuenow", S.bk.pct); b.firstElementChild.style.width = S.bk.pct + "%"; } if (S.bk.pct >= 100) { clearInterval(iv); S.bk.running = false; S.bk.last = "today at " + nowLabel() + " (" + where + ")"; toast("Backed up to " + esc(where) + " (prototype)."); render(); } }, 400); },
    restore(which) { dialog({ title: "Restore " + esc(which) + "?", body: `<p class="small">Your books will go back to how they were then. A copy of today's books is saved first, so you can undo this.</p><p class="small muted">Prototype: nothing changes.</p>`, ok: "Restore", onOk: () => toast("Restored (prototype). Today's copy is saved.") }); },
  };
  function runDl() { clearInterval(dlTimer); dlTimer = setInterval(() => { if (S.dlPaused || S.dl >= 100) { clearInterval(dlTimer); return; } S.dl = Math.min(100, S.dl + (S.hw === "8" ? 6 : 9)); if (S.dl >= 100) { render(); return; } const b = $("#dlbar"); if (b && route() === "helper") { render(); } }, 400); }

  // ================= render & events =================
  let lastRoute = null;
  function render() {
    const r = route();
    const ae = document.activeElement;
    const key = ae && ae !== document.body ? (ae.id ? "#" + ae.id : ae.dataset && ae.dataset.act ? `[data-act="${ae.dataset.act}"]${ae.dataset.arg != null ? `[data-arg="${CSS.escape(ae.dataset.arg)}"]` : ""}` : null) : null;
    const inControls = ae && $("#controls").contains(ae);
    const sel = ae && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null;
    $("#controls").innerHTML = controls();
    const body = SCREENS[r]();
    $("#root").innerHTML = r === "site" || r === "start" ? body : appShell(r, body);
    document.title = `${TITLES[r]} · Rosy Books prototype (example data)`;
    if (r !== lastRoute) { if (lastRoute !== null) { const m = $("#main"); if (m) m.focus({ preventScroll: true }); window.scrollTo(0, 0); } lastRoute = r; return; }
    if (key) { const el = (inControls ? $("#controls") : document).querySelector(key) || document.querySelector(key); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } }
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]"); if (!t || t.disabled) return;
    const f = A[t.dataset.act]; if (!f) return;
    if (t.type === "checkbox") { f(t.dataset.arg); render(); return; }
    e.preventDefault(); f(t.dataset.arg); render();
  });
  document.addEventListener("input", (e) => {
    const t = e.target; if (!t.dataset || !t.dataset.bind) return;
    setPath(t.dataset.bind, t.value);
    if (t.dataset.bind.startsWith("chk.")) { const a = parseAmt(S.chk.amt); const s = (id, v) => { const el = $(id); if (el) el.textContent = v; }; s("#pv-p", S.chk.payee || " "); s("#pv-a", isFinite(a) ? money2(a) : "$—"); s("#pv-w", words(a)); s("#pv-m", S.chk.memo || " "); }
  });
  document.addEventListener("change", (e) => { const t = e.target; if (t.tagName === "SELECT" && t.dataset.bind) setPath(t.dataset.bind, t.value); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches && e.target.matches("input.in")) {
      const id = e.target.id;
      const m = { "f-d": "addEntry", "f-no": "addEntry", "f-p": "addEntry", "f-out": "addEntry", "f-in": "addEntry", "r-tot": "fixTotal", "ai-q": "aiAsk", "hab-new": "habAdd" };
      if (m[id]) { e.preventDefault(); A[m[id]](); render(); }
      if (id === "hab-edit") { e.preventDefault(); A.habSave(S.editHabit); render(); }
    }
  });
  window.addEventListener("hashchange", render);
  render();
})();
