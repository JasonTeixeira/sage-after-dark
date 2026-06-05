/* Sage After Dark — interactive terminal prototype */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- cipher (mirrors src/lib/cipher.ts) ---------- */
  const LIVE_PLAINTEXT = "the answer was always postgres";
  const MONTHLY_SHIFTS = [7, 11, 13, 17, 5, 9, 19, 23, 3, 21, 15, 25];
  const currentShift = (d = new Date()) => MONTHLY_SHIFTS[d.getUTCMonth()] ?? 5;
  const enc = (t, s) => [...t].map(c => {
    const k = c.charCodeAt(0);
    if (k >= 65 && k <= 90) return String.fromCharCode(((k - 65 + s) % 26) + 65);
    if (k >= 97 && k <= 122) return String.fromCharCode(((k - 97 + s) % 26) + 97);
    return c;
  }).join("");
  const dec = (t, s) => enc(t, (26 - (s % 26)) % 26);
  const norm = s => s.toLowerCase().trim().replace(/\s+/g, " ");
  const SHIFT = currentShift();
  const CIPHERTEXT = enc(LIVE_PLAINTEXT, SHIFT);

  /* ---------- content ---------- */
  const P = { build:"--build", signal:"--signal", mind:"--mind", world:"--world", taste:"--taste", learning:"--learning", teach:"--teach" };
  const col = p => `var(${P[p]})`;
  const essays = [
    { slug:"taste-is-the-last-moat", title:"Taste is the last moat", pillar:"taste", mins:9,
      dek:"When every engineer can ship a feature in an afternoon, the only thing left to compete on is what you choose not to build.",
      body:["Tooling collapsed the cost of making things. That sounds like good news, and mostly it is. But it quietly moved the bottleneck.",
            "When anyone can build anything, the scarce skill is no longer building. It's judgment — knowing which of the ten thousand possible things is the one worth shipping.",
            "Taste is that judgment, made legible. It's the deploy gate you run before the deploy gate."] },
    { slug:"latency-is-a-worldview", title:"Latency is a worldview", pillar:"build", mins:14,
      dek:"Network engineering as a metaphor for how good thinkers structure their lives. Async, batched, queued, cached — and the one bad path that ruins all of them.",
      body:["Every system that moves information has the same four moves available to it: do it now, do it later, do it in a group, or remember you already did it.",
            "Engineers spend careers learning when to reach for each. Then they go home and answer every Slack message synchronously, the instant it arrives, like a server with no queue."] },
    { slug:"the-cost-of-being-available", title:"The cost of being available", pillar:"mind", mins:11,
      dek:"I once calculated that I had been on call — in some informal sense — for roughly 4,200 of the previous 4,380 days. The number was wrong only in that it was too low.",
      body:["Availability feels like generosity. It is mostly a failure to set a queue.",
            "The always-on engineer is not more committed. They've just confused latency for care."] },
    { slug:"the-half-life-of-a-skill", title:"The half-life of a skill", pillar:"learning", mins:8,
      dek:"Three things have a half-life: uranium-238, the enthusiasm of a new hire, and your knowledge of CSS.",
      body:["Most of what you know expires. The fix isn't to learn faster. It's to learn the part that doesn't.",
            "Find the half of your knowledge with the longest half-life, and over-invest there."] },
    { slug:"field-note-may", title:"Field note: May", pillar:"signal", mins:6,
      dek:"Smaller weeks, longer essays, and the meeting I should have skipped.",
      body:["A month of subtraction. The good kind."] },
    { slug:"why-we-roll-back", title:"Why we refuse to ship anything that can't be rolled back in 30 seconds", pillar:"mind", mins:10,
      dek:"The seatbelt rule that changed how my team thinks about risk, debt, and the difference between courage and stupidity.",
      body:["Courage is shipping something you can undo. Everything else is just gambling with someone else's uptime."] },
    { slug:"the-five-line-spec", title:"The five-line spec", pillar:"build", mins:5,
      dek:"Most features deserve a sticky note, not a doc.",
      body:["If you can't say what it does in five lines, you don't understand it yet — and neither will the person who builds it."] },
    { slug:"when-to-quit-a-tool", title:"When to quit a tool", pillar:"world", mins:7,
      dek:"Three signals it's time to leave, even if you spent a month learning it.",
      body:["Sunk cost wears a lab coat and calls itself diligence."] },
    { slug:"the-system-i-actually-use", title:"The system I actually use", pillar:"teach", mins:13,
      dek:"The full inventory: every tool, template, and ritual I run my work through — the version that survives a Tuesday.",
      body:["Not the conference-talk version. The one with the duct tape."] },
  ];
  const vaultDeepCuts = [
    { t:"00 · why this exists", d:"The unlisted preface. What the public essays don't say about why any of this gets written down." },
    { t:"director's cut · taste is the last moat", d:"The 1,400 words I cut, the three drafts that were wrong, and the footnote that became the thesis." },
    { t:"the raw notes · 2025", d:"Unedited. The margin scrawl behind the annual letter, timestamps intact." },
  ];

  /* ---------- dom ---------- */
  const splash = $("#splash"), bootlog = $("#bootlog"), bar = $("#bootbar span"), logo = $("#logo");
  const win = $("#win"), screen = $("#screen"), transcript = $("#transcript");
  const form = $("#promptform"), input = $("#cmd"), live = $("#live");
  let history = [], hpos = -1, unlocked = false, gateEl = null;

  /* ---------- helpers ---------- */
  const scroll = () => { screen.scrollTop = screen.scrollHeight; };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  function add(node) { transcript.appendChild(node); scroll(); return node; }
  function echo(cmd) { add(el("div", "echo", `<span class="pr">~ $</span> ${escapeHtml(cmd)}`)); }
  const escapeHtml = s => s.replace(/[&<>]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]));

  function typeInto(node, text, speed = 14) {
    return new Promise(res => {
      if (reduce) { node.textContent = text; scroll(); return res(); }
      let i = 0;
      const tick = () => { node.textContent = text.slice(0, ++i); scroll(); if (i < text.length) setTimeout(tick, speed); else res(); };
      tick();
    });
  }
  async function ai(html, { type = false } = {}) {
    const wrap = add(el("div", "out ai"));
    if (type) { await typeInto(wrap, stripTags(html)); wrap.innerHTML = html; }
    else wrap.innerHTML = html;
    return wrap;
  }
  const stripTags = h => h.replace(/<[^>]+>/g, "");

  /* ---------- boot ---------- */
  const bootLines = [
    `<span class="dim">$</span> establishing channel <span class="cy">sage@afterdark</span>`,
    `<span class="dim">$</span> handshake ok · <span class="cy">256-bit</span> · latency 11ms`,
    `<span class="dim">$</span> mounting corpus … <span class="cy">23 essays</span> indexed`,
    `<span class="dim">$</span> vault status … <span class="em">sealed</span>`,
    `<span class="dim">$</span> waking the operator …`,
  ];
  async function boot() {
    if (reduce) { bar.style.width = "100%"; logo.classList.add("show"); return finishBoot(0); }
    for (let i = 0; i < bootLines.length; i++) {
      const line = el("div"); bootlog.appendChild(line);
      await typeInto(line, stripTags(bootLines[i]), 9);
      line.innerHTML = bootLines[i];
      bar.style.width = `${Math.round(((i + 1) / bootLines.length) * 100)}%`;
      await wait(120);
    }
    await wait(260); logo.classList.add("show"); await wait(900);
    finishBoot(550);
  }
  function finishBoot(delay) {
    setTimeout(() => {
      splash.classList.add("gone");
      setTimeout(() => { splash.remove(); win.hidden = false; greet(); input.focus(); }, reduce ? 0 : 700);
    }, delay);
  }
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  function greet() {
    add(el("div", "boot-greet",
      `<div class="mark">Sage // After Dark</div>
       <p class="lede">The after-hours notebook of a one-person studio.<br><span class="dim">Software, taste, and the slow internet — written down as it happens.</span></p>
       <p class="sys">// session <span style="color:var(--mute)">0x7F3A</span> · channel <span class="sec">secure</span> · 23 essays indexed · vault <span class="em">sealed</span></p>
       <p class="greet">I'm listening. Type <code>help</code> to begin — or just start typing. <b>Some things here are hidden.</b></p>`));
  }

  /* ---------- commands ---------- */
  async function run(raw) {
    const cmd = raw.trim(); if (!cmd) return;
    echo(cmd); history.unshift(cmd); hpos = -1;
    const [name, ...rest] = cmd.split(/\s+/); const arg = rest.join(" ");
    switch (name.toLowerCase()) {
      case "help": case "?": return cmdHelp();
      case "ls": return cmdLs(arg);
      case "open": case "read": return cmdOpen(arg);
      case "search": return cmdSearch(arg);
      case "pillars": return cmdPillars();
      case "about": case "whoami": return cmdAbout();
      case "clear": transcript.innerHTML = ""; return;
      case "decode": case "vault": case "cd": return cmdDecode(name.toLowerCase(), arg);
      case "sudo": return ai(`<span class="ai">nice try. there's no root here — only the work, and what's hidden behind it. try <code>decode</code>.</span>`, { type:true });
      default:
        return ai(`<span class="ai">unknown command <b>${escapeHtml(name)}</b>. type <code>help</code>. <span style="color:var(--faint)">…though not everything announces itself.</span></span>`, { type:true });
    }
  }

  async function cmdHelp() {
    const w = add(el("div", "out"));
    w.innerHTML = `<div class="grp-lbl">what you can do</div>
      <dl class="help">
        <dt>ls</dt><dd>list the essays</dd>
        <dt>open <small>&lt;name&gt;</small></dt><dd>read one, clean and full</dd>
        <dt>search <small>&lt;term&gt;</small></dt><dd>find a thread through the work</dd>
        <dt>pillars</dt><dd>the seven veins of the work</dd>
        <dt>about</dt><dd>who's writing, and why</dd>
        <dt>clear</dt><dd>wipe the screen</dd>
      </dl>
      <p class="more" style="margin-top:12px">some commands aren't on this list. the curious find them.</p>`;
    scroll();
  }

  function cmdLs(arg) {
    const list = arg ? essays.filter(e => e.pillar === arg) : essays;
    const ul = el("ul", "ls");
    list.forEach(e => {
      const li = el("li");
      li.innerHTML = `<span class="pd" style="background:${col(e.pillar)};box-shadow:0 0 9px -1px ${col(e.pillar)}"></span>
        <span class="pl">${e.pillar}</span><span class="ti">${e.title}</span><span class="rt">${e.mins} min</span>`;
      li.onclick = () => openEssay(e.slug);
      ul.appendChild(li);
    });
    const out = add(el("div", "out"));
    out.appendChild(ul);
    if (!arg) out.appendChild(el("p", "more", `showing ${list.length} of 23. <code>pillars</code> to filter · click any line to read.`));
    scroll();
  }

  async function cmdSearch(term) {
    if (!term) return ai(`<span class="ai">search for what? try <code>search rollback</code>.</span>`);
    const hits = essays.filter(e => (e.title + " " + e.dek).toLowerCase().includes(term.toLowerCase()));
    await ai(`<span class="ai">${hits.length} thread${hits.length===1?"":"s"} matching <b>${escapeHtml(term)}</b>:</span>`, { type:true });
    cmdLs(); // reuse listing styling
    // replace last ls with hits
    const ul = transcript.querySelector(".out:last-child .ls");
    if (ul) { ul.innerHTML = ""; hits.forEach(e => { const li=el("li"); li.innerHTML=`<span class="pd" style="background:${col(e.pillar)}"></span><span class="pl">${e.pillar}</span><span class="ti">${e.title}</span><span class="rt">${e.mins} min</span>`; li.onclick=()=>openEssay(e.slug); ul.appendChild(li); });
      const more = transcript.querySelector(".out:last-child .more"); if (more) more.remove(); }
    scroll();
  }

  function cmdPillars() {
    const out = add(el("div", "out"));
    out.innerHTML = `<div class="grp-lbl">the seven veins</div>`;
    const row = el("div", "pillrow");
    Object.keys(P).forEach(p => {
      const t = el("span", "pilltag", p);
      t.style.color = col(p); t.style.borderColor = col(p);
      t.onclick = () => { echo(`ls ${p}`); cmdLs(p); };
      row.appendChild(t);
    });
    out.appendChild(row);
    scroll();
  }

  async function cmdAbout() {
    await ai(`<span class="ai">I'm the front door to <b>Sage After Dark</b> — Jason Teixeira's notebook on software, taste, and the slow internet. One person, writing the work down as it happens. No tracking theater, no popups, no paywall. Just the work — and a little something hidden for people who like to look. <span style="color:var(--faint)">(hint: <code>decode</code>)</span></span>`, { type:true });
  }

  /* ---------- reader overlay ---------- */
  function openEssay(slug) {
    const e = essays.find(x => x.slug === slug); if (!e) return;
    const r = $("#reader"); r.hidden = false;
    r.innerHTML = `<div class="reader-card">
      <div class="crumb"><span class="cy">~ $</span> open ${e.slug}</div>
      <div class="ptag" style="color:${col(e.pillar)}">▸ ${e.pillar}</div>
      <h1>${e.title}</h1>
      <p class="dek">${e.dek}</p>
      <div class="body">${e.body.map(p=>`<p>${p}</p>`).join("")}<p style="color:var(--faint)">— preview · the full essay renders here in the build —</p></div>
      <button class="back">← back to the prompt</button>
    </div>`;
    r.querySelector(".back").onclick = () => { r.hidden = true; input.focus(); };
    r.onclick = ev => { if (ev.target === r) { r.hidden = true; input.focus(); } };
  }

  /* ---------- decode gate ---------- */
  async function cmdDecode(name) {
    if (unlocked) { openVault(); return; }
    await ai(`<span class="ai">so you went looking. good. <b>a monthly cipher seals the vault.</b> rotate the key until it reads true, then type what it says.</span>`, { type:true });
    const g = el("div", "gate");
    g.innerHTML = `
      <div class="glbl">◈ cipher gate · sealed</div>
      <div class="cipher">${CIPHERTEXT}</div>
      <div class="decoded" id="dec">${CIPHERTEXT}</div>
      <div class="ring">
        <label>key</label>
        <input type="range" id="ring" min="0" max="25" value="0" />
        <span class="keyval" id="kv">0</span>
      </div>
      <div class="ans">
        <span class="pr">~ $</span>
        <input id="ans" type="text" placeholder="type the decoded phrase…" spellcheck="false" />
        <button id="unlock">unlock</button>
      </div>
      <div class="hints">
        <button class="hintbtn" id="hb">need a hint? ▾</button>
        <div id="hintbox"></div>
      </div>`;
    add(g); gateEl = g;
    const ring = $("#ring", g), kv = $("#kv", g), decd = $("#dec", g), ans = $("#ans", g);
    ring.oninput = () => {
      const k = +ring.value; kv.textContent = k;
      const out = dec(CIPHERTEXT, k); decd.textContent = out;
      if (norm(out) === LIVE_PLAINTEXT) decd.style.color = "var(--world)";
      else decd.style.color = "var(--cyan)";
    };
    const hints = [
      "It's a Caesar cipher — every letter rotated by a fixed key. Drag the ring.",
      "The key changes monthly. This month it's a single odd digit.",
      `The key is ${SHIFT}. Now read it, and type it.`,
    ];
    let hi = 0; const hb = $("#hb", g), box = $("#hintbox", g);
    hb.onclick = () => { if (hi < hints.length) { box.appendChild(el("div","hintline",`› ${hints[hi++]}`)); } if (hi>=hints.length) hb.style.display="none"; };
    const tryUnlock = () => {
      const solved = norm(ans.value) === LIVE_PLAINTEXT || norm(decd.textContent) === LIVE_PLAINTEXT;
      if (solved) return solve(g);
      g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake");
      box.appendChild(el("div","hintline",`<span style="color:var(--ember)">› not quite. rotate the key until the line turns green — type that, or just hit unlock.</span>`));
    };
    $("#unlock", g).onclick = tryUnlock;
    ans.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); tryUnlock(); } });
    ans.focus(); scroll();
  }

  async function solve(g) {
    unlocked = true;
    g.querySelector(".glbl").innerHTML = `◈ cipher gate · <span style="color:var(--world)">broken</span>`;
    await ai(`<span class="ai" style="color:var(--world)">› access granted. decrypting after-dark layer…</span>`, { type:true });
    // status updates
    $("#livedot").classList.add("sealed"); $("#chan").textContent = "vault open";
    const lc = document.querySelector(".chip.locked"); if (lc){ lc.classList.remove("locked"); lc.classList.add("unlocked"); lc.innerHTML = "◈ vault <span class='k'>open</span>"; lc.dataset.cmd="vault"; }
    const hh = $("#hiddenhint"); if (hh){ hh.classList.add("found"); hh.innerHTML = `<i>◆</i> vault unlocked`; }
    await wait(500); openVault(true);
  }

  /* ---------- vault ---------- */
  function openVault(reveal = false) {
    const v = $("#vault"); v.hidden = false;
    v.innerHTML = `<div class="vault-card">
      <span class="chip-decoded"><i></i> decoded</span>
      <h1 id="vh">${reveal ? CIPHERTEXT : "AFTER DARK"}</h1>
      <p class="sub">The deep cuts. Director's-cut annotations, raw notes, and the things said only at this hour.</p>
      <div class="vault-list">
        ${vaultDeepCuts.map(c=>`<div class="vault-item"><div class="vt">${c.t}</div><div class="vd">${c.d}</div></div>`).join("")}
      </div>
      <button class="back">← back to the surface</button>
    </div>`;
    v.querySelector(".back").onclick = () => { v.hidden = true; input.focus(); };
    v.onclick = ev => { if (ev.target === v) { v.hidden = true; input.focus(); } };
    if (reveal && !reduce) scramble($("#vh", v), "AFTER DARK");
  }
  function scramble(node, target) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ░▒▓#$%&/";
    let frame = 0; const total = 26;
    const id = setInterval(() => {
      node.textContent = target.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (i < (frame / total) * target.length) return ch;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      if (++frame > total) { clearInterval(id); node.textContent = target; }
    }, 40);
  }

  /* ---------- input wiring ---------- */
  form.addEventListener("submit", e => { e.preventDefault(); const v = input.value; input.value = ""; run(v); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { e.preventDefault(); if (hpos < history.length - 1) input.value = history[++hpos] || ""; }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (hpos > 0) input.value = history[--hpos] || ""; else { hpos = -1; input.value = ""; } }
    else if (e.key === "Escape") { transcript.innerHTML = ""; }
    else if (e.key === "Tab") {
      e.preventDefault();
      const cmds = ["help","ls","open","search","pillars","about","clear","decode"];
      const m = cmds.find(c => c.startsWith(input.value.trim().toLowerCase()));
      if (m) input.value = m + (m === "open" || m === "search" ? " " : "");
    }
  });
  screen.addEventListener("click", e => { if (!e.target.closest("a,button,input,.ls li,.pilltag")) input.focus(); });
  document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { const cmd = c.dataset.cmd; input.value = ""; run(cmd); input.focus(); }));
  $("#hiddenhint").addEventListener("click", () => run("decode"));
  $("#skip").addEventListener("click", () => finishBoot(0));
  document.addEventListener("keydown", e => { if (!splash.isConnected) return; if (e.key === "Enter" || e.key === "Escape") finishBoot(0); });

  /* clock */
  function tick(){ const d=new Date(); const p=n=>String(n).padStart(2,"0"); $("#clock").textContent=`${p(d.getHours())}:${p(d.getMinutes())} · 2026.06.05`; }
  tick(); setInterval(tick, 30000);

  boot();
})();
