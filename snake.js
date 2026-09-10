/* Cursor skeleton snake — trail effect behind the glass layers.
   В покое закручивается спиралью вокруг курсора и медленно вращается.
   Настройки — константы CONFIG вверху. */
(function () {
  "use strict";

  const CONFIG = {
    color: "#ffffff",
    vertebrae: 72,
    spacing: 10,
    vertebraSize: 8,
    legLength: 22,
    wiggle: 5.5,
    wiggleFreq: 0.19,
    headEase: 0.09,
    idleMs: 900,
    coilRadius: 55,
    coilSpeed: 0.0006,
    coilMorph: 0.09,
    coilTight: 3
  };

  const IS_TOUCH = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;border:0;display:block;";
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext("2d");

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const MAX_PTS = CONFIG.vertebrae * CONFIG.spacing * 3;
  let cssW = 0;
  let cssH = 0;

  function resize() {
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(cssW * DPR));
    canvas.height = Math.max(1, Math.floor(cssH * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const pts = [];
  let target = null;
  let head = null;
  let lastMove = performance.now();
  let rafId = null;
  let coil = false;
  let coilStart = 0;
  let coilCenter = { x: 0, y: 0 };
  let wanderX = 0;
  let wanderY = 0;
  let wanderAngle = 0;
  let wanderSpeed = 2.4;

  function initWander() {
    const m = Math.min(cssW, cssH) * 0.5;
    wanderX = cssW / 2 + (Math.random() - 0.5) * m;
    wanderY = cssH / 2 + (Math.random() - 0.5) * m;
    wanderAngle = Math.random() * Math.PI * 2;
    head = { x: wanderX, y: wanderY };
    target = { x: wanderX, y: wanderY };
  }

  function wander(now) {
    wanderAngle += (Math.random() - 0.5) * 0.23;
    wanderAngle += Math.sin(now * 0.0006) * 0.02;
    wanderSpeed += (Math.random() - 0.5) * 0.08;
    if (wanderSpeed < 0.6) wanderSpeed = 0.6;
    if (wanderSpeed > 1.6) wanderSpeed = 1.6;

    const margin = 80;
    if (wanderX < margin) wanderAngle = nudge(wanderAngle, 0);
    else if (wanderX > cssW - margin) wanderAngle = nudge(wanderAngle, Math.PI);
    if (wanderY < margin) wanderAngle = nudge(wanderAngle, Math.PI / 2);
    else if (wanderY > cssH - margin) wanderAngle = nudge(wanderAngle, -Math.PI / 2);

    wanderX += Math.cos(wanderAngle) * wanderSpeed * (IS_TOUCH ? 1.6 : 1);
    wanderY += Math.sin(wanderAngle) * wanderSpeed * (IS_TOUCH ? 1.6 : 1);

    wanderX = Math.max(2, Math.min(cssW - 2, wanderX));
    wanderY = Math.max(2, Math.min(cssH - 2, wanderY));
  }

  function nudge(angle, desired) {
    let diff = desired - angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return angle + diff * 0.08;
  }

  if (!IS_TOUCH) {
    window.addEventListener("pointermove", function (e) {
      lastMove = performance.now();
      target = { x: e.clientX, y: e.clientY };
      if (!head) head = { x: target.x, y: target.y };
      coil = false;
      if (!rafId) rafId = requestAnimationFrame(loop);
    });
  }

  if (IS_TOUCH) {
    initWander();
    rafId = requestAnimationFrame(loop);
  }

  // Догоняющая голова — мягкая реакция на курсор.
  function blendHead() {
    const k = CONFIG.headEase;
    head.x += (target.x - head.x) * k;
    head.y += (target.y - head.y) * k;
    const p = pts.length ? pts[0] : null;
    if (!p || Math.hypot(head.x - p.x, head.y - p.y) > 1) {
      pts.unshift({ x: head.x, y: head.y });
      if (pts.length > MAX_PTS) pts.length = MAX_PTS;
    }
  }

  // Разбивает точки следа на равноудалённые позвонки.
  function sample() {
    const path = [];
    if (!pts.length) return path;
    let ax = pts[0].x;
    let ay = pts[0].y;
    path.push({ x: ax, y: ay });
    let need = CONFIG.spacing;
    for (let i = 1; i < pts.length && path.length < CONFIG.vertebrae; i++) {
      const bx = pts[i].x;
      const by = pts[i].y;
      let dx = bx - ax;
      let dy = by - ay;
      let d = Math.hypot(dx, dy);
      while (d >= need && path.length < CONFIG.vertebrae) {
        const t = need / d;
        ax += dx * t;
        ay += dy * t;
        path.push({ x: ax, y: ay });
        dx = bx - ax;
        dy = by - ay;
        d = Math.hypot(dx, dy);
        need = CONFIG.spacing;
      }
      if (d > 0) { ax = bx; ay = by; need -= d; }
    }
    return path;
  }

  function fillDot(x, y, r, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.2832);
    ctx.fill();
  }

  function line(x1, y1, x2, y2, w, alpha) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Сворачивает точки в спираль вокруг курсора (голова — в центре).
  function coilTargets(now) {
    const cnt = pts.length;
    if (cnt < 2) return;
    const R = CONFIG.coilRadius;
    const bodyLen = CONFIG.vertebrae * CONFIG.spacing;
    const arc = (bodyLen / R) * 1.35;
    const ang0 = (now - coilStart) * CONFIG.coilSpeed;
    const k = CONFIG.coilMorph;
    const cx = coilCenter.x;
    const cy = coilCenter.y;
    for (let i = 0; i < cnt; i++) {
      const s = i / (cnt - 1);
      const rad = R * Math.min(1, s * CONFIG.coilTight);
      const ang = ang0 - s * arc;
      const tx = cx + Math.cos(ang) * rad;
      const ty = cy + Math.sin(ang) * rad;
      const p = pts[i];
      p.x += (tx - p.x) * k;
      p.y += (ty - p.y) * k;
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, cssW, cssH);
    const path = sample();
    const n = path.length;
    if (n < 1) return;
    if (n < 2) {
      fillDot(path[0].x, path[0].y, 3, 0.9);
      return;
    }

    const LW = 1.6;

    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const fade = Math.pow(1 - t, 1.2);
      if (fade < 0.03) continue;

      const a = path[Math.max(0, i - 1)];
      const b = path[Math.min(n - 1, i + 1)];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const fwdX = Math.cos(ang);
      const fwdY = Math.sin(ang);
      const nx = Math.cos(ang + Math.PI / 2);
      const ny = Math.sin(ang + Math.PI / 2);

      const wob = Math.sin(now * 0.0032 + i * CONFIG.wiggleFreq) *
        (CONFIG.wiggle * Math.max(0.1, 1 - t * 0.55));
      const cx = path[i].x + nx * wob;
      const cy = path[i].y + ny * wob;

      const tailF = Math.max(0.25, 1 - t * 0.6);
      const r = CONFIG.vertebraSize * tailF;
      const legL = CONFIG.legLength * tailF;

      // ноги сколопендры: по 2 пары на сегмент, откинуты к хвосту, с коленным изломом
      for (let side = -1; side <= 1; side += 2) {
        const ox = nx * side;
        const oy = ny * side;
        for (let k = 0; k < 2; k++) {
          const back = k === 0 ? 0.5 : 2.8;
          const hipX = cx + ox * r * 0.85 + fwdX * back;
          const hipY = cy + oy * r * 0.85 + fwdY * back;
          const l1 = legL * (k === 0 ? 1 : 0.8);
          const kx = hipX + ox * l1 - fwdX * l1 * 0.35;
          const ky = hipY + oy * l1 - fwdY * l1 * 0.35;
          const l2 = l1 * 0.6;
          const tx = kx + ox * l2 * 0.35 - fwdX * l2 * 0.85;
          const ty = ky + oy * l2 * 0.35 - fwdY * l2 * 0.85;
          line(hipX, hipY, kx, ky, LW * 0.8, fade * 0.7);
          line(kx, ky, tx, ty, LW * 0.65, fade * 0.6);
        }
      }

      // позвонок — костное кольцо с суставом
      ctx.globalAlpha = fade * 0.85;
      ctx.strokeStyle = CONFIG.color;
      ctx.lineWidth = LW * 1.1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 6.2832);
      ctx.stroke();
      fillDot(cx, cy, r * 0.4, fade * 0.9);
    }

    // голова: череп с усиками
    const h = path[0];
    const ha = Math.atan2(path[1].y - h.y, path[1].x - h.x);
    const hr = CONFIG.vertebraSize * 1.55;
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = LW * 1.25;
    ctx.beginPath();
    ctx.arc(h.x, h.y, hr, 0, 6.2832);
    ctx.stroke();
    fillDot(h.x, h.y, hr * 0.55, 1);
    for (let s = -1; s <= 1; s += 2) {
      const e1x = h.x + Math.cos(ha + s * 0.7) * (hr + 5);
      const e1y = h.y + Math.sin(ha + s * 0.7) * (hr + 5);
      const e2x = e1x + Math.cos(ha + s * 1.05) * (hr + 6);
      const e2y = e1y + Math.sin(ha + s * 1.05) * (hr + 6);
      line(h.x, h.y, e1x, e1y, LW * 0.55, 0.75);
      line(e1x, e1y, e2x, e2y, LW * 0.5, 0.6);
    }
  }

  function loop() {
    const now = performance.now();
    rafId = null;

    if (IS_TOUCH) {
      wander(now);
      target = { x: wanderX, y: wanderY };
      blendHead();
      draw(now);
      rafId = requestAnimationFrame(loop);
    } else if (target) {
      if (coil) {
        coilTargets(now);
        draw(now);
      } else if (now - lastMove > CONFIG.idleMs) {
        coil = true;
        coilStart = now;
        coilCenter = { x: head.x, y: head.y };
        coilTargets(now);
        draw(now);
      } else {
        blendHead();
        draw(now);
      }
      rafId = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, cssW, cssH);
    }
  }
})();