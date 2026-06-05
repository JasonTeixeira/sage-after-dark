/* Sage After Dark — cold-open: fake front → bypass → The Operator */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  /* ---- persistent memory ---- */
  const store = {
    get n(){ return +(localStorage.getItem("sad:intrusions") || 0); },
    set n(v){ localStorage.setItem("sad:intrusions", v); },
    get handle(){ return localStorage.getItem("sad:handle") || ""; },
    set handle(v){ localStorage.setItem("sad:handle", v); },
  };
  const rankOf = n => n >= 7 ? "ghost" : n >= 3 ? "operator" : "script kiddie";

  /* ---- elements ---- */
  const wall = $("#wall"), leave = $("#leave"), bypass = $("#bypass"),
        hint = $(".hintline", bypass), bform = $("#bform"), binput = $("#binput");
  const stage = $("#stage"), transcript = $("#transcript"), form = $("#promptform"),
        input = $("#cmd"), ps1 = $("#ps1");

  /* ---- decoy behaviour ---- */
  let trapHits = 0;
  leave.addEventListener("click", () => {
    leave.classList.remove("trap"); void leave.offsetWidth; leave.classList.add("trap");
    const orig = leave.textContent;
    leave.textContent = trapHits === 0 ? "the door is locked." : "it's always locked.";
    setTimeout(() => (leave.textContent = orig), 1100);
    if (++trapHits >= 1) hint.classList.add("tell");   // nudge them toward the seam
  });
  // a quiet tell after a while, for the patient
  setTimeout(() => hint.classList.add("tell"), 6000);

  // reveal the bypass input
  hint.tabIndex = 0;
  const openBypass = () => { hint.style.display = "none"; bform.hidden = false; binput.focus(); };
  hint.addEventListener("click", openBypass);
  hint.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBypass(); } });

  const TRIGGERS = ["bypass","sudo","sudo su","su","enter","unlock","knock","root","override","let me in","open","access"];
  let wrong = 0;
  bform.addEventListener("submit", e => {
    e.preventDefault();
    const v = binput.value.trim().toLowerCase();
    if (TRIGGERS.includes(v)) return breakIn();
    binput.value = ""; binput.placeholder = "denied.";
    binput.animate?.([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(0)"}],{duration:260});
    if (++wrong >= 2) binput.placeholder = "try: bypass";
    setTimeout(() => { if (binput.placeholder === "denied.") binput.placeholder = ""; }, 900);
  });

  /* ---- the break-in ---- */
  async function breakIn() {
    bform.hidden = true;
    if (!reduce) wall.classList.add("glitch");
    await wait(420);
    wall.classList.add("peel");
    stage.setAttribute("aria-hidden", "false");
    $("#screen").focus?.();
    await wait(700);
    wall.style.display = "none";
    operator();
  }

  /* ---- helpers ---- */
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const scroll = () => { const s = $("#screen"); s.scrollTop = s.scrollHeight; };
  const add = n => { transcript.appendChild(n); scroll(); return n; };
  function typeInto(node, text, speed = 16) {
    return new Promise(res => {
      if (reduce) { node.textContent = text; scroll(); return res(); }
      let i = 0; const tick = () => { node.textContent = text.slice(0, ++i); scroll(); i < text.length ? setTimeout(tick, speed) : res(); }; tick();
    });
  }
  async function op(lines, cls = "op") {
    const node = add(el("div", cls));
    for (let i = 0; i < lines.length; i++) {
      const ln = el("div"); node.appendChild(ln);
      const raw = lines[i];
      await typeInto(ln, raw.replace(/<[^>]+>/g, ""), 15);
      ln.innerHTML = raw;                 // render any markup after the typewriter
      await wait(260);
    }
    return node;
  }

  /* ---- The Operator ---- */
  async function operator() {
    store.n = store.n + 1;
    const n = store.n, handle = store.handle;
    await wait(300);
    if (!handle) {
      await op([
        "▓ connection established.",
        "well. look who found the seam.",
        "most people read the 403 and leave. you pushed on it. i like that.",
        "before i let you wander — what do they call you?",
      ]);
      // ask for a handle
      const ask = add(el("div", "ask", `<span class="pr">handle ▸</span>`));
      const hi = el("input"); hi.type = "text"; hi.spellcheck = false; hi.maxLength = 24; ask.appendChild(hi); hi.focus();
      hi.addEventListener("keydown", async e => {
        if (e.key !== "Enter") return;
        const v = hi.value.trim() || "anon";
        store.handle = v; ask.remove();
        add(el("div", "echo", `<span class="pr">handle ▸</span> ${v}`));
        await op([
          `noted, ${v}. the system will remember you now — it remembers everyone who gets in.`,
          "you're on the inside. type <b>help</b>. don't touch anything that hums.",
          "— ▓ the operator",
        ].map(s => s)); // already html-ish
        enterPrompt(v);
      });
    } else {
      await op([
        `▓ ${handle}. back again — that's intrusion #${n}.`,
        "the front door changed since you last came. you still found the way in. of course you did.",
        `rank: ${rankOf(n)}. ${n >= 7 ? "you practically live here now." : "keep coming."}`,
        "go on. type <b>help</b>.",
        "— ▓ the operator",
      ]);
      enterPrompt(handle);
    }
  }

  /* ---- minimal terminal once inside ---- */
  const essays = [
    ["Taste is the last moat", "taste", "9m"],
    ["Latency is a worldview", "build", "14m"],
    ["The cost of being available", "mind", "11m"],
    ["The half-life of a skill", "learning", "8m"],
    ["Why we roll back in 30 seconds", "mind", "10m"],
  ];
  let history = [], hpos = -1, handleName = "anon";
  function enterPrompt(handle) {
    handleName = handle;
    ps1.textContent = `${handle} $`;
    $("#who").textContent = handle; $(".live i").classList.add("in");
    input.disabled = false; input.focus();
  }
  function echo(c){ add(el("div","echo",`<span class="pr">${handleName} $</span> ${c.replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]))}`)); }

  form.addEventListener("submit", e => { e.preventDefault(); const v = input.value.trim(); input.value = ""; if (v) cmd(v); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp"){ e.preventDefault(); if (hpos < history.length-1) input.value = history[++hpos]||""; }
    else if (e.key === "ArrowDown"){ e.preventDefault(); if (hpos>0) input.value = history[--hpos]||""; else { hpos=-1; input.value=""; } }
  });

  async function cmd(raw){
    echo(raw); history.unshift(raw); hpos = -1;
    const [name, ...rest] = raw.split(/\s+/);
    switch(name.toLowerCase()){
      case "help": return add(el("div","out",
        `<dl class="help"><dt>ls</dt><dd>list the essays</dd><dt>who</dt><dd>who am i talking to?</dd>
         <dt>profile</dt><dd>your record on this system</dd><dt>clear</dt><dd>wipe the screen</dd>
         <dt>exit</dt><dd>re-seal the door behind you</dd></dl>`));
      case "ls": { const ul = el("ul","ls"); essays.forEach(([t,p,r])=>{ const li=el("li"); li.innerHTML=`<span style="color:var(--mute)">▸</span> ${t} <span class="rt">${p} · ${r}</span>`; ul.appendChild(li); }); return add(el("div","out")).appendChild(ul), scroll(); }
      case "who": case "whoami": return op([
        "i'm the thing that stayed behind when the lights went out.",
        "i keep the backend. i decide who reads what. mostly i watch.",
        "you got in, so — for now — we're friends.",
        "— ▓ the operator",
      ]);
      case "profile": return add(el("div","out",
        `<b>handle</b> ${handleName} &nbsp; <b>intrusions</b> ${store.n} &nbsp; <b>rank</b> <span style="color:var(--world)">${rankOf(store.n)}</span><br>
         <span style="color:var(--faint)">the system remembers. clear it with <code>forget</code>.</span>`));
      case "forget": localStorage.removeItem("sad:handle"); localStorage.removeItem("sad:intrusions"); return op(["done. you're a stranger again. the door will feel new next time."], "op warn");
      case "clear": transcript.innerHTML = ""; return;
      case "exit": return reseal();
      default: return op([`there's no <b>${name}</b> here. type <b>help</b>. or don't — i'm patient.`], "op");
    }
  }

  async function reseal(){
    await op(["sealing up. mind the 403 on your way out.", "— ▓ the operator"]);
    await wait(600);
    location.reload();
  }
})();
