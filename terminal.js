(function () {
  "use strict";

  const screen = document.getElementById("screen");
  const output = document.getElementById("output");
  const inputLine = document.getElementById("inputLine");
  const input = document.getElementById("cmdInput");
  const fakeCursor = document.getElementById("fakeCursor");
  const hint = document.getElementById("hint");
  const quicknav = document.getElementById("quicknav");

  const history = [];
  let histIdx = -1;
  let booted = false;

  
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function print(html, cls) {
    const div = el("div", "line" + (cls ? " " + cls : ""), html);
    output.appendChild(div);
    scrollDown();
    return div;
  }
  function printBlock(node) {
    node.classList.add("block");
    output.appendChild(node);
    scrollDown();
  }
  function blank() { print("&nbsp;"); }
  function scrollDown() { output.scrollTop = output.scrollHeight; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function chip(cmd) {
    return `<span class="cmd-chip" data-cmd="${esc(cmd)}">${esc(cmd)}</span>`;
  }
  function link(href, label) {
    return `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label || href)}</a>`;
  }

  
  function typeLine(text, cls, speed) {
    return new Promise((resolve) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const div = print("", cls);
      if (reduce) { div.innerHTML = text; resolve(); return; }
      let i = 0;
      speed = speed || 9;
      (function step() {
        div.textContent = text.slice(0, i);
        i++;
        scrollDown();
        if (i <= text.length) setTimeout(step, speed + Math.random() * speed);
        else { div.innerHTML = text; resolve(); }
      })();
    });
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  
  const SCRAMBLE = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!<>-_/[]=+*#%&";
  function scramble(node) {
    if (reduced()) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    const items = [];
    let tn;
    while ((tn = walker.nextNode())) {
      if (tn.nodeValue.trim()) items.push({ tn, final: tn.nodeValue });
    }
    if (!items.length) return;
    const maxLen = items.reduce((m, it) => Math.max(m, it.final.length), 0);
    const step = Math.max(1.5, Math.ceil(maxLen / 22));
    let frame = 0, lastT = 0;
    function tick(t) {
      if (t - lastT < 26) { requestAnimationFrame(tick); return; }
      lastT = t;
      for (const it of items) {
        const final = it.final;
        let out = "";
        for (let i = 0; i < final.length; i++) {
          if (i < frame || final[i] === " ") out += final[i];
          else out += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
        }
        it.tn.nodeValue = out;
      }
      frame += step;
      if (frame < maxLen) requestAnimationFrame(tick);
      else for (const it of items) it.tn.nodeValue = it.final;
    }
    requestAnimationFrame(tick);
  }
  function revealNewNodes(startIndex) {
    const kids = Array.prototype.slice.call(output.children, startIndex);
    kids.forEach((node, i) => {
      if (!reduced()) {
        node.classList.add("reveal");
        node.style.animationDelay = Math.min(i * 0.03, 0.4) + "s";
      }
      scramble(node);
    });
  }

  
  function applyTheme(name) {
    if (!name || name === "green") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", name);
    try { localStorage.setItem("cv-theme", name || "green"); } catch (_) {}
  }
  try {
    const saved = localStorage.getItem("cv-theme");
    if (saved && saved !== "green") document.documentElement.setAttribute("data-theme", saved);
  } catch (_) {}

  
  function applyFx(on) {
    document.documentElement.classList.toggle("no-fx", !on);
    try { localStorage.setItem("cv-fx", on ? "on" : "off"); } catch (_) {}
  }
  try { if (localStorage.getItem("cv-fx") === "off") document.documentElement.classList.add("no-fx"); } catch (_) {}

  
  const FONT = {
    "0": [" ██████╗ ", "██╔═████╗", "██║██╔██║", "████╔╝██║", "╚██████╔╝", " ╚═════╝ "],
    "x": ["██╗  ██╗", "╚██╗██╔╝", " ╚███╔╝ ", " ██╔██╗ ", "██╔╝ ██╗", "╚═╝  ╚═╝"],
    "B": ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██████╔╝", "╚═════╝ "],
    "@": [" ██████╗ ", "██╔═══██╗", "██║██╗██║", "██║██║██║", "██║╚████║", "╚═╝ ╚═══╝"],
    "n": ["███╗   ██╗", "████╗  ██║", "██╔██╗ ██║", "██║╚██╗██║", "██║ ╚████║", "╚═╝  ╚═══╝"],
    "e": ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
  };
  function makeBanner(text) {
    const rows = ["", "", "", "", "", ""];
    for (const ch of text) {
      const g = FONT[ch] || ["        ", "        ", "        ", "        ", "        ", "        "];
      for (let i = 0; i < 6; i++) rows[i] += g[i] + "  ";
    }
    return rows.join("\n");
  }
  const BANNER = makeBanner("0xB@ne");

  
  const commands = {
    help() {
      const rows = [
        ["about", "who I am"],
        ["experience", "work history  (alias: exp)"],
        ["skills", "technical skills"],
        ["projects", "things I've built"],
        ["education", "academic background  (alias: edu)"],
        ["languages", "spoken languages"],
        ["contact", "how to reach me"],
        ["resume", "everything, top to bottom  (alias: cv)"],
        ["neofetch", "summary at a glance"],
        ["theme", "switch colors: green / amber / coral"],
        ["fx", "toggle CRT / matrix effects (readability)"],
        ["download", "save / print this CV as PDF"],
        ["clear", "clear the screen"],
        ["help", "show this list"],
      ];
      const t = el("div", "kvtable");
      rows.forEach(([c, d]) => {
        t.appendChild(el("div", "k", chip(c)));
        t.appendChild(el("div", "v", esc(d)));
      });
      print('<span class="dim">Available commands — click or type one:</span>');
      printBlock(t);
      print('<span class="dim">You can also <span class="accent">cat</span> any section, e.g. <span class="accent">cat skills</span>.</span>');
      print('<span class="dim">Tip: use <span class="accent">Tab</span> to autocomplete and <span class="accent">↑ / ↓</span> for history.</span>');
    },

    about() {
      print(`<span class="accent bold">${esc(CV.name)}</span> — <span class="dim">${esc(CV.title)} @ ${esc(CV.company)}</span>`);
      blank();
      CV.about.forEach((l) => print(esc(l) || "&nbsp;"));
    },

    experience() {
      CV.experience.forEach((job, i) => {
        const b = el("div");
        b.appendChild(el("div", "role-head", `${esc(job.role)} · ${esc(job.company)}`));
        const meta = [job.period, job.location].filter(Boolean).join("  ·  ");
        b.appendChild(el("div", "role-meta", esc(meta)));
        (job.bullets || []).forEach((bl) => b.appendChild(el("div", "bullet", esc(bl))));
        if (job.stack && job.stack.length) {
          const tags = el("div");
          tags.style.marginTop = "4px";
          job.stack.forEach((s) => tags.appendChild(el("span", "tag", esc(s))));
          b.appendChild(tags);
        }
        printBlock(b);
      });
    },

    skills() {
      Object.entries(CV.skills).forEach(([cat, list]) => {
        const b = el("div");
        b.appendChild(el("span", "skill-cat", esc(cat) + ": "));
        const wrap = el("span");
        list.forEach((s) => wrap.appendChild(el("span", "tag", esc(s))));
        b.appendChild(wrap);
        printBlock(b);
      });
    },

    projects() {
      if (!CV.projects.length) return print('<span class="dim">No projects listed yet.</span>');
      CV.projects.forEach((p) => {
        const b = el("div");
        const title = p.link
          ? `<span class="accent bold">${esc(p.name)}</span> — ${link(p.link, p.link)}`
          : `<span class="accent bold">${esc(p.name)}</span>`;
        b.appendChild(el("div", null, title));
        b.appendChild(el("div", "bullet", esc(p.desc)));
        if (p.stack && p.stack.length) {
          const tags = el("div");
          tags.style.marginTop = "4px";
          p.stack.forEach((s) => tags.appendChild(el("span", "tag", esc(s))));
          b.appendChild(tags);
        }
        printBlock(b);
      });
    },

    education() {
      (CV.education || []).forEach((e) => {
        const b = el("div");
        b.appendChild(el("div", "role-head", esc(e.degree)));
        b.appendChild(el("div", "role-meta", [e.school, e.period].filter(Boolean).join("  ·  ")));
        if (e.notes) b.appendChild(el("div", "bullet", esc(e.notes)));
        printBlock(b);
      });
      if (CV.certifications && CV.certifications.length) {
        print('<span class="skill-cat">Certifications</span>');
        CV.certifications.forEach((c) => {
          const meta = [c.issuer, c.year].filter(Boolean).join(" · ");
          print(`<span class="bullet"><span class="bold">${esc(c.name)}</span>${meta ? ` — <span class="dim">${esc(meta)}</span>` : ""}</span>`);
        });
      }
      if (CV.courses && CV.courses.length) {
        blank();
        print('<span class="skill-cat">Training & Courses</span>');
        CV.courses.forEach((c) => print(`<span class="bullet">${esc(c)}</span>`));
      }
    },

    languages() {
      if (!CV.languages || !CV.languages.length) return print('<span class="dim">No languages listed.</span>');
      const t = el("div", "kvtable");
      CV.languages.forEach((l) => {
        t.appendChild(el("div", "k", esc(l.name)));
        t.appendChild(el("div", "v", esc(l.level)));
      });
      printBlock(t);
    },

    contact() {
      const c = CV.contact;
      const t = el("div", "kvtable");
      const add = (k, v) => {
        t.appendChild(el("div", "k", esc(k)));
        t.appendChild(el("div", "v", v));
      };
      if (c.discord) add("discord", `<span class="copyable" data-copy="${esc(c.discord)}" title="click to copy">${esc(c.discord)}</span>`);
      if (c.discordServer) add("discord server", link(c.discordServer, c.discordServer.replace(/^https?:\/\//, "")));
      if (c.linkedin) add("linkedin", link(c.linkedin, c.linkedin.replace(/^https?:\/\//, "")));
      if (c.github) add("github", link(c.github, c.github.replace(/^https?:\/\//, "")));
      if (c.website) add("website", link(c.website, c.website.replace(/^https?:\/\//, "")));
      printBlock(t);
    },

    async resume() {
      const order = ["about", "experience", "skills", "projects", "education", "languages", "contact"];
      for (const c of order) {
        print(`<span class="dim">── ${c} ${"─".repeat(Math.max(0, 60 - c.length))}</span>`);
        blank();
        await commands[c]();
        blank();
      }
    },

    neofetch() {
      const c = CV.contact;
      const info = [
        ["", `<span class="green bold">${esc(CV.name)}</span>`],
        ["", '<span class="dim">' + "-".repeat(Math.max(8, CV.name.length)) + "</span>"],
        ["Title", esc(CV.title)],
        ["Company", esc(CV.company)],
        ["Location", esc(CV.location)],
        ["Discord", `<span class="copyable" data-copy="${esc(c.discord)}" title="click to copy">${esc(c.discord)}</span>`],
        ["LinkedIn", link(c.linkedin, "@" + CV.handle)],
        ["Shell", "zsh — terminal-cv v1.0"],
        ["Uptime", "always shipping"],
      ];
      const logo = [
        '<span class="accent">    ____  </span>',
        '<span class="accent">   / __ \\ </span>',
        '<span class="accent">  / / / / </span>',
        '<span class="accent"> / /_/ /  </span>',
        '<span class="accent"> \\____/   </span>',
        '<span class="accent">          </span>',
        '<span class="accent">          </span>',
        '<span class="accent">          </span>',
        '<span class="accent">          </span>',
      ];
      const b = el("div");
      info.forEach((row, i) => {
        const line = document.createElement("div");
        const label = row[0] ? `<span class="cyan bold">${esc(row[0])}</span>: ` : "";
        line.innerHTML = (logo[i] || "          ") + "  " + label + row[1];
        b.appendChild(line);
      });
      printBlock(b);
    },

    whoami() { print(esc(CV.handle)); },
    echo(args) { print(esc(args.join(" "))); },
    date() { print(new Date().toString()); },
    ls() {
      print(
        ["about", "experience", "skills", "projects", "education", "languages", "contact"]
          .map((f) => (f.endsWith(".pdf") ? `<span class="red">${f}</span>` : `<span class="blue">${f}</span>`))
          .join("    ")
      );
    },
    pwd() { print("/home/0xbane/cv"); },
    clear() { output.innerHTML = ""; renderHome(); },

    theme(args) {
      const themes = ["green", "amber", "coral"];
      const cur = document.documentElement.getAttribute("data-theme") || "green";
      let next;
      if (args[0]) {
        next = args[0].toLowerCase();
        if (!themes.includes(next))
          return print(`<span class="red">unknown theme: ${esc(next)}</span> — try: <span class="accent">${themes.join("</span>, <span class=\"accent\">")}</span>`);
      } else {
        next = themes[(themes.indexOf(cur) + 1) % themes.length];
      }
      applyTheme(next);
      print(`theme → <span class="accent">${next}</span> <span class="dim">· options: ${themes.join(" · ")}</span>`);
    },

    fx(args) {
      const cur = !document.documentElement.classList.contains("no-fx");
      let on = !cur;
      if (args[0]) on = !/^(off|0|false|no)$/i.test(args[0]);
      applyFx(on);
      print(`effects <span class="accent">${on ? "on" : "off"}</span> <span class="dim">· CRT scanlines, matrix rain & glow</span>`);
    },

    async download() {
      output.innerHTML = "";
      const head = el("div");
      head.innerHTML =
        `<div class="bold">${esc(CV.name)}</div>` +
        `<div class="dim">${esc(CV.title)} · AI Security` +
        (CV.location ? ` · ${esc(CV.location)}` : "") + `</div>`;
      printBlock(head);
      await commands.resume();
      print('<span class="dim">— opening print dialog · choose “Save as PDF” —</span>');
      setTimeout(() => { try { window.print(); } catch (_) {} }, 300);
    },

    async cat(args) {
      const t = (args[0] || "").toLowerCase().replace(/\.(txt|md|json|pdf)$/, "");
      const sections = ["about", "experience", "exp", "skills", "projects",
        "education", "edu", "languages", "contact", "resume", "cv"];
      if (!t) return print('<span class="dim">usage: cat &lt;section&gt;  —  e.g. <span class="accent">cat skills</span></span>');
      if (sections.includes(t) && commands[t]) { await commands[t](); }
      else print(`<span class="red">cat: ${esc(t)}: No such file or directory</span>`);
    },

    sudo() {
      print('<span class="red">0xbane is not in the sudoers file. This incident will be reported.</span> 😏');
    },
    exit() { print('<span class="dim">There is no escape. Try <span class="accent">help</span>. 🙂</span>'); },
    rm(args) {
      if (args.join(" ").includes("-rf"))
        return print('<span class="yellow">Nice try. Everything here is bolted down.</span>');
      print('<span class="dim">rm: nothing to remove.</span>');
    },

    hack() { print('<span class="green">ACCESS GRANTED</span> … just kidding. That\'s not how any of this works. 🎬'); },
    nmap() { print('<span class="dim">Starting Nmap … scanning <span class="accent">0xB@ne</span> …</span> <span class="green">1337/tcp open  leet</span> — you found the only port. 🛰️'); },
    sqlmap() { print('<span class="dim">payload:</span> <span class="yellow">\' OR 1=1;--</span> <span class="dim">… no database here, just static files and good vibes.</span> 💉'); },
    hydra() { print('<span class="dim">brute-forcing login … 14,000,000 attempts …</span> <span class="red">there is no login.</span> 🐉'); },
    hashcat() { print('<span class="dim">cracking hash …</span> <span class="green">password: hunter2</span> 🐱 <span class="dim">(it always is)</span>'); },
    msfconsole() { print('<span class="red">=[ metasploit ]=</span> <span class="dim">loading 2,300 exploits … target acquired:</span> <span class="accent">your curiosity</span>. 🎯'); },
    exploit() { print('<span class="dim">searching for 0-days …</span> <span class="green">the only exploit here is how long you\'ll keep typing commands.</span> 🕳️'); },
    nc() { print('<span class="dim">listening on 0.0.0.0:4444 …</span> <span class="yellow">no shell for you.</span> nice try though. 🐚'); },
    ping() { print('<span class="dim">PING 0xB@ne: 64 bytes … time=0.001ms</span> — <span class="green">I\'m right here.</span> 📡'); },
    vim() { print('<span class="dim">entering vim …</span> <span class="red">you will never leave.</span> (try <span class="accent">:q!</span> … or just refresh 😈)'); },
    decrypt() { print('<span class="dim">decrypting …</span> <span class="green">███████████ 100%</span> — turns out the secret was friendship all along. 🔓'); },
    nuke() { print('<span class="red">⚠ launch sequence aborted.</span> <span class="dim">we don\'t do that here.</span> ☢️'); },
    hacktheplanet() { print('<span class="green">HACK THE PLANET! 🌍</span> <span class="dim">Zero Cool would be proud.</span>'); },

    matrix() { print('<span class="green">Wake up, Neo…</span> 🐇 the rain is already falling — look behind the window. <span class="dim">red pill or blue pill? try</span> <span class="accent">redpill</span> <span class="dim">/</span> <span class="accent">bluepill</span>'); },
    redpill() { print('<span class="red">●</span> you stay in Wonderland, and I show you how deep the rabbit-hole goes. 🕳️'); },
    bluepill() { print('<span class="blue">●</span> the story ends. you wake up and believe whatever you want to believe. 💊'); },
    spoon() { print('<span class="dim">Do not try to bend the spoon — that\'s impossible. Only realize the truth:</span> <span class="accent">there is no spoon.</span> 🥄'); },

    mrrobot() { print('<span class="red">Hello, friend.</span> 👋 are you seeing this because I want you to? <span class="dim">control is an illusion.</span>'); },
    fsociety() { print('<span class="green">我们是 fsociety.</span> <span class="dim">our democracy has been hacked. evil corp is next.</span> 🎭'); },
  };

  commands.exp = commands.experience;
  commands.edu = commands.education;
  commands.cv = commands.resume;
  commands.pdf = commands.download;
  commands.print = commands.download;
  commands.metasploit = commands.msfconsole;
  commands.msf = commands.msfconsole;
  commands.netcat = commands.nc;
  commands.john = commands.hashcat;
  commands.hashcat = commands.hashcat;
  commands[":q"] = commands.vim;
  commands[":wq"] = commands.vim;
  commands.neo = commands.matrix;
  commands.morpheus = commands.matrix;
  commands.whiterabbit = commands.matrix;
  commands.elliot = commands.mrrobot;
  commands.hellofriend = commands.mrrobot;
  commands.info = commands.about;
  commands["?"] = commands.help;

  const PUBLIC_CMDS = ["help", "about", "experience", "skills", "projects", "education",
    "languages", "contact", "resume", "neofetch", "theme", "fx", "download", "cat", "ls", "clear", "whoami"];
  const SECTIONS = ["about", "experience", "skills", "projects", "education",
    "languages", "contact", "resume"];

  
  function syncCursor() {
    const mirror = document.createElement("span");
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre";
    mirror.style.font = getComputedStyle(input).font;
    mirror.textContent = input.value;
    document.body.appendChild(mirror);
    const w = mirror.getBoundingClientRect().width;
    document.body.removeChild(mirror);
    fakeCursor.style.left = Math.min(w, input.getBoundingClientRect().width - 4) + "px";
  }

  async function run(raw) {
    const cmdline = raw.trim();
    print(
      `<span class="prompt"><span class="user">root@0xB@ne</span><span class="colon">:</span>` +
      `<span class="path">~</span><span class="dollar">#</span></span> <span class="echo-cmd">${esc(cmdline)}</span>`
    );
    if (!cmdline) return;
    history.push(cmdline);
    histIdx = history.length;

    const parts = cmdline.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    const start = output.children.length;
    if (commands[name]) {
      try { await commands[name](args); }
      catch (e) { print('<span class="red">error: ' + esc(e.message) + "</span>"); }
    } else {
      print(`<span class="red">command not found: ${esc(name)}</span> — type ${chip("help")}`);
    }
    if (name !== "clear") revealNewNodes(start);
  }

  function setInputEnabled(on) {
    inputLine.hidden = !on;
    if (on) { input.focus(); syncCursor(); }
  }

  input.addEventListener("input", syncCursor);

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const v = input.value;
      input.value = "";
      setInputEnabled(false);
      await run(v);
      setInputEnabled(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; syncCursor(); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ""; }
      syncCursor();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const val = input.value.toLowerCase();
      const arg = val.match(/^\s*cat\s+(\S*)$/);
      if (arg) {
        const m = SECTIONS.filter((s) => s.startsWith(arg[1]));
        if (m.length === 1) { input.value = "cat " + m[0]; syncCursor(); }
        else if (m.length > 1) { print('<span class="dim">' + m.join("   ") + "</span>"); }
        return;
      }
      const cur = val.trim();
      if (!cur) return;
      const matches = PUBLIC_CMDS.filter((c) => c.startsWith(cur));
      if (matches.length === 1) { input.value = matches[0]; syncCursor(); }
      else if (matches.length > 1) { print('<span class="dim">' + matches.join("   ") + "</span>"); }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      commands.clear();
    }
  });

  screen.addEventListener("click", (e) => {
    const cp = e.target.closest(".copyable");
    if (cp) {
      const txt = cp.getAttribute("data-copy") || cp.textContent;
      try { navigator.clipboard && navigator.clipboard.writeText(txt); } catch (_) {}
      const old = cp.innerHTML;
      cp.classList.add("copied");
      cp.innerHTML = '<span class="green">copied ✓</span>';
      setTimeout(() => { cp.innerHTML = old; cp.classList.remove("copied"); }, 1100);
      return;
    }
    const c = e.target.closest(".cmd-chip");
    if (c) {
      const cmd = c.getAttribute("data-cmd");
      if (booted) { input.value = ""; setInputEnabled(false); run(cmd).then(() => setInputEnabled(true)); }
      return;
    }
    if (!window.getSelection().toString()) input.focus();
  });

  
  async function boot() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ok = '<span class="dim">[</span><span class="accent"> ok </span><span class="dim">]</span>';
    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    const bootLines = [
      '<span class="dim">[ ' + ts + ' ] init 0xB@ne secure shell ...</span>',
      ok + ' establishing encrypted channel <span class="dim">· tls1.3 / aes-256-gcm</span>',
      ok + ' authenticating <span class="dim">· key 0x' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0") + 'a3f1</span>',
      ok + ' decrypting profile <span class="dim">· ███████████████ 100%</span>',
      ok + ' integrity check <span class="green">· no anomalies</span>',
      '<span class="accent">▸ access granted.</span>',
    ];
    for (const l of bootLines) { print(l); await wait(reduce ? 0 : 150); }
    blank();

    renderHome();

    booted = true;
    setInputEnabled(true);
    if (hint) hint.style.opacity = "1";
  }

  let bannerEl = null;
  function fitBanner() {
    if (!bannerEl) return;
    bannerEl.style.fontSize = "";
    const avail = bannerEl.clientWidth;
    const needed = bannerEl.scrollWidth;
    if (avail > 0 && needed > avail) {
      const cs = parseFloat(getComputedStyle(bannerEl).fontSize) || 12;
      bannerEl.style.fontSize = (cs * (avail / needed) * 0.99).toFixed(2) + "px";
    }
  }
  window.addEventListener("resize", () => requestAnimationFrame(fitBanner));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(fitBanner));
  }

  function renderHome() {
    const ban = el("pre", "banner");
    ban.style.margin = "0";
    ban.textContent = BANNER;
    printBlock(ban);
    bannerEl = ban;
    requestAnimationFrame(fitBanner);

    print(`<span class="bold">${esc(CV.name)}</span> · <span class="accent">${esc(CV.title)}</span> · <span class="accent">AI Security</span>`);
    print(`<span class="dim">${esc(CV.tagline)}</span>`);
    blank();
    if (CV.contact && CV.contact.website) {
      print(`<span class="dim">▸ open-source security tooling →</span> ${link(CV.contact.website, CV.contact.website.replace(/^https?:\/\//, "").replace(/\/$/, ""))}`);
    }
    print(`Type ${chip("help")} to get started, or try ${chip("about")} · ${chip("experience")} · ${chip("neofetch")}.`);
    blank();
  }

  if (quicknav) {
    quicknav.addEventListener("click", (e) => {
      const btn = e.target.closest(".navchip");
      if (!btn || !booted) return;
      const cmd = btn.getAttribute("data-cmd");
      input.value = ""; setInputEnabled(false);
      run(cmd).then(() => setInputEnabled(true));
    });
  }

  window.addEventListener("load", () => { syncCursor(); boot(); });
})();
