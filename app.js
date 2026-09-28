(function () {
  "use strict";

  const FALLBACK_AVATAR = (nick) => `https://github.com/${encodeURIComponent(nick)}.png`;

  const FOCUS_ICONS = {
    flow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="12" r="2.4"/><circle cx="5" cy="18" r="2.4"/><path d="M7.4 6h4.2a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3M7.4 18h4.2a3 3 0 0 0 3-3v0a3 3 0 0 1 3-3"/></svg>',
    graph: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M6.5 10v2.5a3 3 0 0 0 3 3H14M10 6.5h4.5a3 3 0 0 1 3 3V14"/></svg>',
    code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 4 12l5 6M15 6l5 6-5 6"/></svg>',
    server: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></svg>'
  };

  const CONTACT_ICONS = {
    "Telegram": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 11.944a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    "Почта": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67zM22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z"/></svg>',
    "GitHub": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z"/></svg>',
    /* Яндекс Музыка: пара сдвоенных нот. Это читаемая музыкальная иконка,
       но НЕ официальный логотип Яндекс Музыки — официальный ассет подтянуть
       не удалось, поэтому при необходимости замените path на брендовый. */
    "ЯМузыка": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3.07a.75.75 0 0 0-.79-.71C11.9 1.85 6.2 2.4 2.4 5.54A.75.75 0 0 0 2 6.5v12.2a.75.75 0 0 0 1.22.58c1.93-1.7 4.24-2.7 6.53-3.1v5.1a2.25 2.25 0 1 0 1.5 0V9.9a12.7 12.7 0 0 1 4.8-.15v4.33a2.25 2.25 0 1 0 1.5 0V3.07Zm-1.5 5.27a14.6 14.6 0 0 0-3.5.2.75.75 0 0 0-.3 1.47 13.1 13.1 0 0 1 3.8-.2V8.34Zm-1.5 5.2a.75.75 0 0 0 0-1.5 12.3 12.3 0 0 0-4.2.6.75.75 0 1 0 .4 1.46 10.8 10.8 0 0 1 3.8-.56Z"/></svg>',
    "Хабр": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.2 16.6 4.6 12l4.6-4.6L7.8 6l-6 6 6 6 1.4-1.4Zm5.6 0 4.6-4.6-4.6-4.6L16.2 6l6 6-6 6-1.4-1.4Z"/></svg>',
    "LeetCode": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>'
  };

  function h(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined && content !== null) node.textContent = content;
    return node;
  }

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = String(str ?? "");
    return div.innerHTML;
  }

  function findSocial(data, label) {
    const wanted = String(label).toLowerCase();
    return (data.socials || []).find((s) => (s.label || "").toLowerCase() === wanted) || {};
  }

  function avatar(img, profile) {
    const nick = profile.nickname;
    const primary = profile.avatar && profile.avatar.trim() ? profile.avatar.trim() : FALLBACK_AVATAR(nick);
    img.src = primary;
    if (primary !== FALLBACK_AVATAR(nick)) {
      img.onerror = () => {
        img.onerror = null;
        img.src = FALLBACK_AVATAR(nick);
      };
    }
  }

  function renderProfile(data) {
    const p = data.profile || {};
    document.title = `${p.name || p.nickname} — ${p.title || "AI-инженер"}`;

    document.querySelector("#hero-title").textContent = p.title || "";
    document.querySelector("#hero-name-inline").textContent = p.nickname || p.name || "";
    document.querySelector("#hero-status").textContent = p.status || "";
    document.querySelector("#hero-location").textContent = p.location ? `📍 ${p.location}` : "";
    document.querySelector("#hero-desc").textContent = data.tagline || p.description || "";

    document.querySelector("#topbar-nick").textContent = "@" + (p.nickname || "");
    avatar(document.querySelector("#avatar-main"), p);

    const tg = findSocial(data, "Telegram");
    const gh = findSocial(data, "GitHub");
    document.querySelector("#cta-telegram").href = tg.url || "https://t.me/Litsummer";
    document.querySelector("#cta-github").href = gh.url || "https://github.com/axstiz";
  }

  function renderStackChips(chips) {
    const root = document.querySelector("#stack-chips");
    root.innerHTML = "";
    (chips || []).forEach((item) => root.appendChild(h("span", "chip", item)));
  }

  function renderFocus(items) {
    const root = document.querySelector("#focus-grid");
    root.innerHTML = "";
    (items || []).forEach((item) => {
      const card = document.createElement("article");
      card.className = "focus-card";

      const icon = document.createElement("div");
      icon.className = "focus-icon";
      icon.innerHTML = FOCUS_ICONS[item.icon] || FOCUS_ICONS.code;
      card.appendChild(icon);

      card.appendChild(h("h3", "focus-title", item.title));
      card.appendChild(h("p", "focus-text", item.text));
      root.appendChild(card);
    });
  }

  /* Вне кода: альбом e-mirror и сборник Q_polar. Порядок задаётся здесь,
     чтобы разметка не зависела от порядка ключей в data.json. */
  function renderOffcode(data) {
    const root = document.querySelector("#offcode-grid");
    root.innerHTML = "";
    [data.album, data.poetry].forEach(function (item) {
      if (!item) return;
      const card = document.createElement("article");
      card.className = "offcode-card";
      card.setAttribute("data-reveal", "");

      if (item.image) {
        const cover = document.createElement("div");
        cover.className = "offcode-cover";
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.imageAlt || "";
        img.loading = "lazy";
        img.decoding = "async";
        cover.appendChild(img);
        card.appendChild(cover);
      }

      const body = h("div", "offcode-body");
      if (item.kicker) body.appendChild(h("div", "offcode-kicker", item.kicker));
      body.appendChild(h("h3", "offcode-title", item.title || ""));
      if (item.text) body.appendChild(h("p", "offcode-text", item.text));

      if (item.url) {
        const btn = document.createElement("a");
        btn.className = "btn btn-primary";
        btn.href = item.url;
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
        btn.setAttribute("data-magnetic", "");
        btn.appendChild(h("span", null, item.linkLabel || "Открыть"));
        btn.insertAdjacentHTML("beforeend",
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>');
        body.appendChild(btn);
      }

      card.appendChild(body);
      root.appendChild(card);
    });
  }

  function renderContacts(contacts) {
    const root = document.querySelector("#contacts-list");
    root.innerHTML = "";
    (contacts || []).forEach((c) => {
      const a = document.createElement("a");
      a.className = "contact-row";
      a.href = c.url || "#";
      if (/^https?:/i.test(c.url || "")) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }

      const iconBox = document.createElement("span");
      iconBox.className = "contact-icon";
      iconBox.innerHTML = CONTACT_ICONS[c.label] || "";
      if (!iconBox.innerHTML) iconBox.textContent = "✦";
      a.appendChild(iconBox);

      const meta = document.createElement("span");
      meta.className = "contact-meta";
      meta.appendChild(h("span", "contact-label", c.label));
      meta.appendChild(h("span", "contact-value", c.value));
      a.appendChild(meta);

      root.appendChild(a);
    });
  }

  function renderNav(nav) {
    const navRoot = document.querySelector("#topbar-nav");
    const sideRoot = document.querySelector("#sidenav");
    navRoot.innerHTML = "";
    sideRoot.innerHTML = "";

    (nav || []).forEach((item) => {
      const a = document.createElement("a");
      a.href = "#" + item.id;
      a.textContent = item.label;
      a.setAttribute("data-reveal", "");
      a.style.setProperty("--ry", "0px");
      a.style.setProperty("--rd", "0ms");
      navRoot.appendChild(a);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "sidenav-item";
      dot.dataset.target = item.id;
      dot.dataset.label = item.label;
      dot.setAttribute("aria-label", item.label);
      dot.addEventListener("click", () => {
        const target = document.getElementById(item.id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      sideRoot.appendChild(dot);
    });
  }

  // Бегущая полоса слева. В каждой колонке смешаны все слова: берётся тот же
  // список, но со сдвигом на номер колонки, поэтому полосы не совпадают, а
  // каждая содержит весь набор. Трек получает две одинаковые копии —
  // анимация сдвигает его на -50%, то есть ровно на копию, и цикл замкнут
  // без шва независимо от разной высоты слов.
  function renderTicker(cfg) {
    const root = document.querySelector("#ticker");
    root.innerHTML = "";
    const words = (cfg && cfg.words) || [];
    if (!words.length || !Array.isArray(cfg.columns) || !cfg.columns.length) return;

    const repeats = Math.max(2, cfg.repeats || 8);

    cfg.columns.forEach((col, ci) => {
      const colEl = document.createElement("div");
      colEl.className = "ticker-col " + (col.dir === "down" ? "down" : "up");
      colEl.style.setProperty("--dur", (col.speed || 24) + "s");

      const track = document.createElement("div");
      track.className = "ticker-track";

      // Сдвиг на номер колонки меняет и порядок слов, и их цвет: полосы
      // отличаются друг от друга, но в каждой есть весь набор.
      const pattern = words.map((_, i) => {
        const k = (i + ci) % words.length;
        return { text: words[k], cls: "w" + k };
      });

      for (let copy = 0; copy < 2; copy++) {
        for (let cycle = 0; cycle < repeats; cycle++) {
          pattern.forEach((item) => {
            const span = document.createElement("span");
            span.className = item.cls;
            span.textContent = item.text;
            track.appendChild(span);
          });
        }
      }

      colEl.appendChild(track);
      root.appendChild(colEl);
    });
  }

  async function init() {
    try {
      const res = await fetch("data.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      renderNav(data.nav);
      renderProfile(data);
      renderStackChips(data.stackChips);
      renderFocus(data.focus);
      renderOffcode(data);
      renderContacts(data.contacts);
      renderTicker(data.ticker);

      document.querySelector("#footer-text").textContent =
        `© ${(data.profile && data.profile.nickname) || "axstiz"} · сделано на GitHub Pages`;
    } catch (err) {
      document.querySelector("#hero-desc").textContent = `Не удалось загрузить data.json: ${err.message}`;
      document.querySelector("#hero-desc").style.color = "#f87171";
    } finally {
      window.dispatchEvent(new CustomEvent("site:rendered"));
    }
  }

  init();
})();
