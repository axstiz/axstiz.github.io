(function () {
  "use strict";

  const FALLBACK_AVATAR = (nick) => `https://github.com/${encodeURIComponent(nick)}.png`;

  function h(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined && content !== null) {
      node.textContent = content;
    }
    return node;
  }

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = String(str ?? "");
    return div.innerHTML;
  }

  function avatar(img, avatar, nick) {
    const primary = avatar && avatar.trim() ? avatar.trim() : FALLBACK_AVATAR(nick);
    img.src = primary;
    if (primary !== FALLBACK_AVATAR(nick)) {
      img.onerror = () => {
        img.onerror = null;
        img.src = FALLBACK_AVATAR(nick);
      };
    }
  }

  function chips(items) {
    const wrap = document.createElement("div");
    wrap.className = "chips";
    (items || []).forEach((item) => {
      const chip = h("span", "chip", item);
      wrap.appendChild(chip);
    });
    return wrap;
  }

  function renderProfile(p, title) {
    document.title = title || `${p.nickname}`;
    document.querySelector("#hero-name").textContent = p.name || p.nickname;
    document.querySelector("#hero-nick").textContent = `@${p.nickname}`;
    document.querySelector("#hero-title").textContent = p.title || "";

    const meta = document.querySelector("#hero-meta");
    meta.innerHTML = "";
    if (p.status) {
      const st = h("span", "status-dot", p.status);
      meta.appendChild(st);
    }
    if (p.location) {
      meta.appendChild(h("span", "hero-location", `📍 ${p.location}`));
    }

    document.querySelector("#hero-desc").textContent = p.description || "";

    const main = document.querySelector("#avatar-main");
    const side = document.querySelector("#avatar-side");
    avatar(main, p.avatar, p.nickname);
    avatar(side, p.avatar, p.nickname);

    document.querySelector("#panel-name").textContent = p.name || p.nickname;
    document.querySelector("#panel-nick").textContent = `@${p.nickname}`;
  }

  function renderStack(stack) {
    const root = document.querySelector("#stack-list");
    root.innerHTML = "";
    (stack || []).forEach((group) => {
      const g = document.createElement("div");
      g.className = "stack-group";
      g.appendChild(h("div", "stack-cat", group.category));
      g.appendChild(chips(group.items));
      root.appendChild(g);
    });
  }

  function renderSkills(skills) {
    const root = document.querySelector("#skills-list");
    root.innerHTML = "";
    root.appendChild(chips(skills));
  }

  function renderProjects(projects) {
    const root = document.querySelector("#projects-list");
    root.innerHTML = "";
    (projects || []).forEach((p) => {
      const card = document.createElement("article");
      card.className = "project";

      const head = document.createElement("div");
      head.className = "project-head";
      head.appendChild(h("h3", "project-title", p.title));
      if (p.badge) head.appendChild(h("span", "project-badge", p.badge));
      card.appendChild(head);

      if (p.description) card.appendChild(h("p", "project-desc", p.description));

      if (p.highlights && p.highlights.length) {
        const ul = document.createElement("ul");
        ul.className = "project-highlights";
        p.highlights.forEach((item) => ul.appendChild(h("li", null, item)));
        card.appendChild(ul);
      }

      const foot = document.createElement("div");
      foot.className = "project-foot";
      foot.appendChild(chips(p.tech));

      if (p.links && p.links.length) {
        const links = document.createElement("div");
        links.className = "project-links";
        p.links.forEach((l) => {
          const a = document.createElement("a");
          a.href = l.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = l.label;
          links.appendChild(a);
        });
        foot.appendChild(links);
      }
      card.appendChild(foot);

      root.appendChild(card);
    });
  }

  function renderEducation(education) {
    const root = document.querySelector("#education-list");
    root.innerHTML = "";
    (education || []).forEach((e) => {
      const item = document.createElement("div");
      item.className = "edu-item";

      const info = document.createElement("div");
      info.appendChild(h("div", "edu-institution", e.institution));
      info.appendChild(h("div", "edu-degree", e.degree));

      item.appendChild(info);
      item.appendChild(h("span", "edu-period", e.period));
      root.appendChild(item);
    });
  }

  function renderSocials(socials) {
    const root = document.querySelector("#socials-list");
    root.innerHTML = "";
    (socials || []).forEach((s) => {
      const a = document.createElement("a");
      a.className = "social-link";
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const iconBox = document.createElement("span");
      iconBox.className = "social-icon";
      if (s.icon && s.icon.trim()) {
        iconBox.innerHTML = s.icon;
      } else {
        iconBox.classList.add("icon-void");
        iconBox.textContent = (s.label || "?").trim().charAt(0).toUpperCase();
      }

      const meta = document.createElement("span");
      meta.className = "social-meta";
      meta.appendChild(h("span", "social-label", s.label));
      meta.appendChild(h("span", "social-handle", s.handle || ""));

      a.appendChild(iconBox);
      a.appendChild(meta);
      root.appendChild(a);
    });
  }

  function renderContacts(contacts) {
    const root = document.querySelector("#contacts-list");
    root.innerHTML = "";
    (contacts || []).forEach((c) => {
      const row = document.createElement("div");
      row.className = "contact-row";
      const gear = document.createElement("span");
      gear.className = "contact-ico";
      gear.textContent = "✦";
      const val = document.createElement("span");
      val.className = "contact-val";
      val.textContent = c.value;
      if (c.url) {
        const a = document.createElement("a");
        a.className = "contact-val";
        a.href = c.url;
        a.textContent = c.value;
        if (/^https?:/i.test(c.url)) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        row.appendChild(gear);
        row.appendChild(a);
      } else {
        row.appendChild(gear);
        row.appendChild(val);
      }
      root.appendChild(row);
    });
  }

  async function init() {
    try {
      const res = await fetch("data.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderProfile(data.profile || {}, data.profile && data.profile.nickname);
      renderStack(data.stack);
      renderSkills(data.skills);
      renderProjects(data.projects);
      renderEducation(data.education);
      renderSocials(data.socials);
      renderContacts(data.contacts);
      document.querySelector("#panel-foot").textContent =
        (data.footer || "© axstiz") + " · сделано на GitHub Pages";
    } catch (err) {
      document.querySelector("#about").innerHTML =
        `<p style="color:#f87171">Не удалось загрузить data.json: ${esc(err.message)}</p>`;
    }
  }

  init();
})();