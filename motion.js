/* Скролл-анимации и микро-взаимодействия.
   Без зависимостей: IntersectionObserver + один requestAnimationFrame-цикл. */
(function () {
  "use strict";

  /* ---- размер сколопендры на телефоне ----
     snake.js рисует в координатах CSS-пикселей, причём cssW = window.innerWidth
     задаёт одновременно и размер буфера, и границы блуждания (snake.js:37-40).
     Поэтому уменьшить только существо извне невозможно: любое масштабирование
     уменьшает и мир, и скелет одновременно. Сообщаем snake.js в SCALE раз больший
     «вьюпорт» и в SCALE раз меньший DPR — тогда буфер остаётся прежнего размера
     (память не растёт), мир растянут на весь экран, а скелет мельче в SCALE раз.
     SCALE = 1 — исходный размер; чем больше значение, тем мельче скелет.
     Побочный эффект: window.innerWidth/innerHeight/devicePixelRatio больше не
     льзя читать в этом файле — вместо них используем clientWidth/clientHeight
     из layout, которые подмене не подвержены. */
  (function () {
    var doc = document.documentElement;
    var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) return;
    var SCALE = 1.5;
    var realDpr = window.devicePixelRatio || 1;
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      get: function () { return realDpr / SCALE; }
    });
    // innerWidth перечитывается в каждом resize, поэтому геттер живой.
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      get: function () { return doc.clientWidth * SCALE; }
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      get: function () { return doc.clientHeight * SCALE; }
    });
  })();

  /* Реальные размеры вьюпорта: window.innerWidth на телефоне подменён шимом
     выше для snake.js, здесь нужен настоящий. */
  const viewportW = () => document.documentElement.clientWidth;
  const viewportH = () => document.documentElement.clientHeight;

  const MOTION = "(prefers-reduced-motion: reduce)";

  const IS_TOUCH = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  const REDUCED = window.matchMedia && window.matchMedia(MOTION).matches;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function init() {
  /* ---- прогресс скролла, параллакс орбов, уход hero ---- */
  const progressBar = document.getElementById("progress-bar");
  const orbs = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  const hero = document.getElementById("hero");
  const topbar = document.querySelector(".topbar");

  let ticking = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY || window.pageYOffset || 0;
    const doc = document.documentElement;
    const max = doc.scrollHeight - viewportH();

    if (progressBar) {
      progressBar.style.width = (max > 0 ? clamp((y / max) * 100, 0, 100) : 0) + "%";
    }

    orbs.forEach(function (orb) {
      const factor = parseFloat(orb.dataset.parallax) || 0;
      orb.style.setProperty("--py", y * factor + "px");
    });

    if (hero) {
      const p = clamp(y / Math.max(viewportH() * 0.7, 1), 0, 1);
      hero.style.transform = "translate3d(0," + -y * 0.16 + "px,0) scale(" + (1 - p * 0.045) + ")";
      hero.style.opacity = String(1 - p * 0.9);
      hero.style.filter = p > 0.02 ? "blur(" + (p * 7).toFixed(2) + "px)" : "";
    }

    if (topbar) {
      topbar.classList.toggle("visible", y > viewportH() * 0.55);
    }
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }

  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);

  /* ---- появление блоков: маска + blur + направление ---- */
  const glintTargets = document.querySelectorAll(".glass-card, .stack-strip");

  // Направление выезда: блок слева — выходит слева, справа — справа.
  function markDirection(el, offset) {
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    if (center < viewportW() * 0.42) el.style.setProperty("--rx", -offset + "px");
    else if (center > viewportW() * 0.58) el.style.setProperty("--rx", offset + "px");
  }

  // Ступенчатость внутри одной группы: карточки и строки появляются друг за другом.
  // Выполняется до выборки revealTargets, иначе динамические карточки не попадут под наблюдатель.
  ["#focus-grid", "#contacts-list", "#stack-chips"].forEach(function (sel) {
    const group = document.querySelector(sel);
    if (!group) return;
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.setAttribute("data-reveal", "");
      if (sel === "#focus-grid") child.setAttribute("data-tilt", "");
      markDirection(child, 34);
      child.style.setProperty("--rd", i * 70 + "ms");
    });
  });

  const revealTargets = document.querySelectorAll("[data-reveal]");
  revealTargets.forEach(function (el) { markDirection(el, 44); });

  // Маска нужна только на время раскрытия: в покое clip-path срезает внешние
  // тени и свечение карточек. Снимаем её, когда раскрытие завершилось.
  function releaseMask(el) {
    const delay = parseFloat(getComputedStyle(el).getPropertyValue("--rd")) || 0;
    setTimeout(function () {
      el.classList.add("is-mask-done");
      el.style.transitionDuration = "";
    }, 820 + delay);
  }

  if (REDUCED || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible", "is-mask-done");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
          releaseMask(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---- блик по стеклу: один раз при появлении ---- */
  if (!REDUCED && "IntersectionObserver" in window) {
    const glintObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-glinting");
          glintObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    glintTargets.forEach(function (el) { glintObserver.observe(el); });
  }

  /* ---- активный пункт навигации ---- */
  const sections = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".topbar-nav a"));
  const dots = Array.prototype.slice.call(document.querySelectorAll(".sidenav-item"));

  function markActive(id) {
    navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + id); });
    dots.forEach(function (d) { d.classList.toggle("active", d.dataset.target === id); });
  }

  if ("IntersectionObserver" in window && sections.length) {
    const spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) markActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* ---- 3D-tilt карточек за курсором ----
     Наклон задаём CSS-переменными, а не инлайном: transform уже занят
     reveal-анимацией, инлайн бы её перебил. */
  if (!REDUCED && !IS_TOUCH && "IntersectionObserver" in window) {
    const tiltTargets = document.querySelectorAll("[data-tilt]");

    function attachTilt(el) {
      let rect = null;

      el.addEventListener("pointermove", function (e) {
        rect = rect || el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--tilt-x", (-py * 7).toFixed(2) + "deg");
        el.style.setProperty("--tilt-y", (px * 8).toFixed(2) + "deg");
        // transitionDuration действует на все свойства сразу, поэтому его
        // трогаем только после снятия маски, иначе раскрытие станет резким.
        if (el.classList.contains("is-mask-done")) el.style.transitionDuration = "0.12s";
      });

      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
        el.style.transitionDuration = "";
        rect = null;
      });
    }

    const tiltObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          attachTilt(entry.target);
          tiltObserver.unobserve(entry.target);
        });
      },
      { threshold: 0 }
    );
    tiltTargets.forEach(function (el) { tiltObserver.observe(el); });
  }

  /* ---- магнитные кнопки ---- */
  if (!REDUCED && !IS_TOUCH) {
    const magnets = document.querySelectorAll("[data-magnetic]");

    magnets.forEach(function (el) {
      let rect = null;

      el.addEventListener("pointermove", function (e) {
        rect = rect || el.getBoundingClientRect();
        const px = e.clientX - (rect.left + rect.width / 2);
        const py = e.clientY - (rect.top + rect.height / 2);
        el.style.transition = "transform 0.12s ease-out";
        el.style.transform = "translate3d(" + (px * 0.18).toFixed(2) + "px," + (py * 0.3).toFixed(2) + "px,0)";
      });

      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform 0.55s cubic-bezier(0.16,1,0.3,1)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 580);
        rect = null;
      });
    });
  }

  onFrame();
  }

  // Контент рендерится асинхронно, поэтому анимации стартуют по событию от app.js.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.addEventListener("site:rendered", init, { once: true });
    });
  } else {
    window.addEventListener("site:rendered", init, { once: true });
  }
})();
