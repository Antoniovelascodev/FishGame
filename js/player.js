/* Personaje (vista cenital, algo rechoncho, con brazos y piernas) y catálogo de ropa */
window.G = window.G || {};

/* ---- Catálogo de cosméticos: price = euros, gems = gemas (premium) ---- */
G.COSM = {
  shirt: [
    { id: 'sh0', name: 'Camiseta blanca', price: 0, color: '#f2f2f2', style: 'plain' },
    { id: 'sh1', name: 'Camiseta roja', price: 12, color: '#e0463a', style: 'plain' },
    { id: 'sh2', name: 'Camiseta azul', price: 12, color: '#2f7fd0', style: 'plain' },
    { id: 'sh3', name: 'Marinera a rayas', price: 30, color: '#f2f2f2', color2: '#27508f', style: 'stripes' },
    { id: 'sh4', name: 'Camisa hawaiana', price: 45, color: '#38b6a6', color2: '#ffd54a', style: 'hawaii' },
    { id: 'sh5', name: 'Polo amarillo', price: 35, color: '#f4c430', style: 'plain' },
    { id: 'sh6', name: 'Sudadera verde', price: 60, color: '#3f9a5c', style: 'plain' },
    { id: 'sh7', name: 'Camiseta de rayas rojas', price: 40, color: '#f2f2f2', color2: '#d8342c', style: 'stripes' },
    { id: 'sh8', name: 'Chaleco dorado', gems: 15, color: '#e8b830', color2: '#fff3b0', style: 'dots' },
  ],
  pants: [
    { id: 'pa0', name: 'Pantalón azul marino', price: 0, color: '#1c2b4a' },
    { id: 'pa1', name: 'Bañador rojo', price: 20, color: '#d8342c', short: true },
    { id: 'pa2', name: 'Bermudas caqui', price: 25, color: '#b59a63', short: true },
    { id: 'pa3', name: 'Vaqueros', price: 40, color: '#3a62a0' },
    { id: 'pa4', name: 'Pantalón negro', price: 30, color: '#22242a' },
    { id: 'pa5', name: 'Bañador de flores', price: 55, color: '#ef7ab0', short: true },
    { id: 'pa6', name: 'Pantalón dorado', gems: 20, color: '#d9a62a' },
  ],
  shoes: [
    { id: 'so0', name: 'Zapatillas marrones', price: 0, color: '#6b4226', type: 'shoe' },
    { id: 'so1', name: 'Zapatillas blancas', price: 15, color: '#f4f4f4', type: 'shoe' },
    { id: 'so2', name: 'Chanclas', price: 10, color: '#2d9cdb', type: 'flip' },
    { id: 'so3', name: 'Botas de pescador', price: 70, color: '#2f6b3b', type: 'boot' },
    { id: 'so4', name: 'Zapatillas rojas', price: 25, color: '#d8342c', type: 'shoe' },
    { id: 'so5', name: 'Botas doradas', gems: 12, color: '#d9a62a', type: 'boot' },
  ],
  hat: [
    { id: 'ha0', name: 'Sin gorra', price: 0, type: 'none' },
    { id: 'ha1', name: 'Gorra azul', price: 15, type: 'cap', color: '#2f6fa8' },
    { id: 'ha2', name: 'Gorra roja', price: 15, type: 'cap', color: '#d8342c' },
    { id: 'ha3', name: 'Sombrero de paja', price: 30, type: 'straw', color: '#e8cf8a', band: '#c0392b' },
    { id: 'ha4', name: 'Gorro de pescador', price: 40, type: 'bucket', color: '#6b8f5a' },
    { id: 'ha5', name: 'Bandana', price: 20, type: 'bandana', color: '#e0463a' },
    { id: 'ha6', name: 'Gorra de capitán', gems: 12, type: 'captain', color: '#f4f4f4' },
  ],
};
G.COSM_NAMES = { shirt: 'Camisetas', pants: 'Pantalones', shoes: 'Zapatos', hat: 'Gorros' };
G.SKINS = ['#f9c9a2', '#e8b088', '#c98d62', '#8d5a3b'];
G.HAIRS = ['#6a3d1a', '#2a1d14', '#c9a24a', '#151515', '#a8a8a8'];

G.PS = 0.62;          // escala del personaje en el mundo (para que case con la gente)
G.COOLER_F = 40;      // distancia de la nevera, en unidades del personaje

G.Char = (function () {
  const U = G.U;
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  };
  const pick = (list, id) => list.find(x => x.id === id) || list[0];
  function lookOf(look) {
    look = look || G.S.look;
    return { skin: G.SKINS[look.skin] || G.SKINS[0], hair: G.HAIRS[look.hair] || G.HAIRS[0], shirt: pick(G.COSM.shirt, look.shirt), pants: pick(G.COSM.pants, look.pants), shoes: pick(G.COSM.shoes, look.shoes), hat: pick(G.COSM.hat, look.hat) };
  }

  /* Piernas (se dibujan antes del cuerpo). ctx está en el centro del personaje */
  function legs(c, L, o) {
    c.save(); c.rotate(o.ang); c.lineCap = 'round';
    if (o.seated) {
      c.fillStyle = L.pants.color;
      for (const s of [-1, 1]) { c.beginPath(); c.ellipse(5, s * 7, 9, 4.6, s * 0.2, 0, 6.3); c.fill(); }
    } else {
      for (const s of [-1, 1]) {
        const sw = o.moving ? Math.sin(o.walk + (s > 0 ? 0 : Math.PI)) * 8.5 : 0, hy = s * 6, ex = 3 + sw;
        if (L.pants.short) {
          c.strokeStyle = L.skin; c.lineWidth = 6.2; c.beginPath(); c.moveTo(ex + 4, hy); c.lineTo(ex + 10, hy); c.stroke();
          c.strokeStyle = L.pants.color; c.lineWidth = 8.6; c.beginPath(); c.moveTo(-2, hy); c.lineTo(ex + 5, hy); c.stroke();
        } else {
          c.strokeStyle = L.pants.color; c.lineWidth = 8.4; c.beginPath(); c.moveTo(-2, hy); c.lineTo(ex + 9, hy); c.stroke();
        }
        const sh = L.shoes, fx = ex + 12.5;
        c.fillStyle = sh.color;
        if (sh.type === 'flip') { c.beginPath(); c.ellipse(fx, hy, 4.8, 2.9, 0, 0, 6.3); c.fill(); c.strokeStyle = shade(sh.color, -0.3); c.lineWidth = 1.2; c.beginPath(); c.moveTo(fx - 2, hy - 3); c.lineTo(fx + 1, hy); c.lineTo(fx - 2, hy + 3); c.stroke(); }
        else if (sh.type === 'boot') { c.beginPath(); c.ellipse(fx - 1, hy, 6, 4.2, 0, 0, 6.3); c.fill(); c.fillStyle = shade(sh.color, -0.25); c.beginPath(); c.ellipse(fx - 3.4, hy, 2.8, 3.7, 0, 0, 6.3); c.fill(); }
        else { c.beginPath(); c.ellipse(fx, hy, 5.2, 3.5, 0, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,0.28)'; c.beginPath(); c.ellipse(fx + 0.8, hy - 1, 2.7, 1.1, 0, 0, 6.3); c.fill(); }
      }
    }
    c.restore();
  }

  /* Un brazo: del hombro a la mano (coordenadas relativas al personaje, sin girar) */
  function arm(c, L, sx, sy, hx, hy, side) {
    const mx = (sx + hx) / 2, my = (sy + hy) / 2, ol = Math.hypot(sx, sy) || 1;
    const ex = mx + sx / ol * 4.5, ey = my + sy / ol * 4.5;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = L.skin; c.lineWidth = 5.4; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(ex, ey, hx, hy); c.stroke();
    // manga corta
    const k = 0.36, qx = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * ex + k * k * hx, qy = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * ey + k * k * hy;
    c.strokeStyle = L.shirt.color; c.lineWidth = 7; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo((sx + ex) / 2, (sy + ey) / 2, qx, qy); c.stroke();
    c.fillStyle = L.skin; c.beginPath(); c.arc(hx, hy, 3.3, 0, 6.3); c.fill();
  }

  /* Torso, brazos, cabeza y gorro. o.hands = {r:{x,y}, l:{x,y}} (relativo al centro) o null para balanceo al andar */
  function body(c, L, o) {
    const a = o.ang, ca = Math.cos(a), sa = Math.sin(a), ts = o.twist || 0;
    const rot = (lx, ly) => ({ x: lx * ca - ly * sa, y: lx * sa + ly * ca });
    // pantalón asomando bajo la camiseta
    c.save(); c.rotate(a + ts); c.fillStyle = L.pants.color; c.beginPath(); c.ellipse(-4, 0, 9, 12.5, 0, 0, 6.3); c.fill();
    // torso
    c.fillStyle = L.shirt.color; c.beginPath(); c.ellipse(0, 0, 10, 15, 0, 0, 6.3); c.fill();
    c.save(); c.beginPath(); c.ellipse(0, 0, 10, 15, 0, 0, 6.3); c.clip();
    const st = L.shirt.style, c2 = L.shirt.color2;
    if (st === 'stripes') { c.fillStyle = c2; for (let x = -10; x < 10; x += 5) c.fillRect(x, -16, 2.4, 32); }
    else if (st === 'hawaii') { c.fillStyle = c2; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-6 + (i % 3) * 6, -9 + Math.floor(i / 3) * 8 + (i % 2) * 2, 2.1, 0, 6.3); c.fill(); } }
    else if (st === 'dots') { c.fillStyle = c2; c.globalAlpha = 0.7; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-5 + (i % 2) * 8, -9 + Math.floor(i / 2) * 7, 1.6, 0, 6.3); c.fill(); } }
    c.fillStyle = 'rgba(0,0,0,0.1)'; c.globalAlpha = 1; c.beginPath(); c.ellipse(-4, 4, 7, 11, 0, 0, 6.3); c.fill();
    c.restore(); c.restore();
    // brazos
    const sh = o.walkArms ? null : null;
    for (const s of [-1, 1]) {
      const sp = rot(0, s * 12.5);
      let h;
      if (o.hands && (s > 0 ? o.hands.r : o.hands.l)) h = s > 0 ? o.hands.r : o.hands.l;
      else { const sw = o.moving ? Math.sin(o.walk + (s > 0 ? Math.PI : 0)) * 8 : 0; h = rot(3 + sw, s * 16.5); }
      arm(c, L, sp.x, sp.y, h.x, h.y, s);
    }
    // cabeza
    c.save(); c.rotate(a + ts * 1.4);
    c.fillStyle = L.skin;
    c.beginPath(); c.ellipse(0.5, -8.2, 2.1, 2.9, 0, 0, 6.3); c.ellipse(0.5, 8.2, 2.1, 2.9, 0, 0, 6.3); c.fill();
    c.beginPath(); c.arc(1.4, 0, 8.8, 0, 6.3); c.fill();
    const hat = L.hat;
    if (hat.type === 'none' || hat.type === 'bandana') {
      c.fillStyle = L.hair; c.beginPath(); c.arc(-1.4, 0, 7.9, 0, 6.3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.arc(-3, -2.5, 3.6, 0, 6.3); c.fill();
    }
    if (hat.type === 'cap') {
      c.fillStyle = hat.color; c.beginPath(); c.arc(-0.4, 0, 9.2, 0, 6.3); c.fill();
      c.fillStyle = shade(hat.color, -0.3); c.beginPath(); c.ellipse(8.8, 0, 4.8, 7.6, 0, 0, 6.3); c.fill();
      c.fillStyle = shade(hat.color, 0.3); c.beginPath(); c.arc(-0.4, 0, 1.8, 0, 6.3); c.fill();
    } else if (hat.type === 'straw') {
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(1.5, 1.5, 14.2, 14.2, 0, 0, 6.3); c.fill();
      c.fillStyle = hat.color; c.beginPath(); c.arc(0, 0, 14, 0, 6.3); c.fill();
      c.strokeStyle = shade(hat.color, -0.2); c.lineWidth = 1; for (let r = 5; r < 14; r += 3) { c.beginPath(); c.arc(0, 0, r, 0, 6.3); c.stroke(); }
      c.fillStyle = hat.band; c.beginPath(); c.arc(0, 0, 7.6, 0, 6.3); c.fill(); c.fillStyle = shade(hat.color, 0.1); c.beginPath(); c.arc(0, 0, 6, 0, 6.3); c.fill();
    } else if (hat.type === 'bucket') {
      c.fillStyle = shade(hat.color, -0.2); c.beginPath(); c.arc(0, 0, 11.6, 0, 6.3); c.fill();
      c.fillStyle = hat.color; c.beginPath(); c.arc(0, 0, 8, 0, 6.3); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 8, 0, 6.3); c.stroke();
    } else if (hat.type === 'bandana') {
      c.fillStyle = hat.color; c.beginPath(); c.arc(-0.6, 0, 8.6, Math.PI * 0.5, Math.PI * 1.5, true); c.arc(-0.6, 0, 8.6, -Math.PI * 0.5, Math.PI * 0.5, true); c.fill();
      c.beginPath(); c.moveTo(-8, 0); c.lineTo(-15, -4); c.lineTo(-14, 4); c.closePath(); c.fill();
      c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-3 + (i % 2) * 5, -4 + Math.floor(i / 2) * 7, 1.1, 0, 6.3); c.fill(); }
    } else if (hat.type === 'captain') {
      c.fillStyle = '#1b2a3a'; c.beginPath(); c.ellipse(8.8, 0, 4.6, 7.4, 0, 0, 6.3); c.fill();
      c.fillStyle = hat.color; c.beginPath(); c.arc(-0.4, 0, 9.6, 0, 6.3); c.fill();
      c.strokeStyle = '#d9a62a'; c.lineWidth = 2; c.beginPath(); c.arc(-0.4, 0, 8.4, 0, 6.3); c.stroke();
      c.fillStyle = '#d9a62a'; c.beginPath(); c.arc(-0.4, 0, 2.6, 0, 6.3); c.fill();
    }
    c.restore();
  }

  /* Miniatura del personaje (para las tiendas): mira hacia arriba */
  function preview(look, size) {
    const cv = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr; cv.height = size * dpr; cv.style.width = size + 'px'; cv.style.height = size + 'px';
    const c = cv.getContext('2d'); c.scale(dpr, dpr); c.translate(size / 2, size * 0.5);
    const k = size / 46; c.scale(k, k);
    const L = lookOf(look), o = { ang: -Math.PI / 2, walk: 0.6, moving: true };
    legs(c, L, o); body(c, L, o);
    return cv;
  }

  /* ====== Animaciones de acción: guardar en la nevera / soltar al mar ====== */
  const COOL_COL = ['#e6edf2', '#5aa0d8', '#3a7fd0', '#2f9c6a', '#d8903a', '#c24a4a', '#b88af0', '#ffd34a'];
  const DUR = { store: 2.0, release: 1.6 };
  const ease = (x) => x * x * (3 - 2 * x);
  const seg = (u, a, b) => U.clamp((u - a) / (b - a), 0, 1);

  function releaseTarget() {
    const P = G.P, W = G.World;
    if (G.S.onPaddle) { const a = P.ang + Math.PI / 2; return { x: P.x + Math.cos(a) * 70, y: P.y + Math.sin(a) * 70 }; }
    if (W.inPier(P.x, P.y, 10)) return { x: P.x + (P.x < 1625 ? -70 : 70), y: P.y };
    return { x: P.x + U.rand(-6, 6), y: Math.max(W.shoreY(P.x) - 34, P.y - 175) };
  }
  function coolerSpot() {
    const P = G.P, W = G.World;
    for (const a of [Math.PI / 2, 0, Math.PI]) {
      const x = P.x + Math.cos(a) * 34, y = P.y + Math.sin(a) * 34;
      if (G.S.onPaddle || W.canWalk(x, y, 0)) return a;
    }
    return Math.PI / 2;
  }
  /* Empieza una acción; done() se llama al terminar */
  function startAct(type, sp, cat, done) {
    const P = G.P;
    if (!sp || (G.Dive && G.Dive.active)) { if (done) done(); return; }
    const act = { type, t: 0, dur: DUR[type], sp, cat, done, f: {} };
    if (type === 'release') { act.target = releaseTarget(); P.ang = Math.atan2(act.target.y - P.y, act.target.x - P.x); }
    else { act.dir = coolerSpot(); P.ang = act.dir; act.cool = G.S.cooler; }
    P.act = act; P.moving = false;
  }
  function actUpdate(dt) {
    const P = G.P, a = P.act; if (!a) return;
    a.t += dt; const u = a.t / a.dur, A = G.Audio;
    if (a.type === 'store') {
      if (u > 0.04 && !a.f.s0) { a.f.s0 = 1; A.play('click'); }
      if (u > 0.14 && !a.f.s1) { a.f.s1 = 1; A.play('lid'); }
      if (u > 0.62 && !a.f.s2) { a.f.s2 = 1; A.play('plop'); }
      if (u > 0.8 && !a.f.s3) { a.f.s3 = 1; A.play('lid'); }
      if (u > 0.96 && !a.f.s4) { a.f.s4 = 1; if (G.UI && G.UI.bumpCooler) G.UI.bumpCooler(); }
    } else {
      if (u > 0.2 && !a.f.s0) { a.f.s0 = 1; A.play('whoosh'); }
      if (u > 0.8 && !a.f.s1) { a.f.s1 = 1; A.play('splash'); }
    }
    if (a.t >= a.dur) { P.act = null; if (a.done) a.done(); }
  }
  /* Posición de las manos y giro del tronco durante la acción (relativo al personaje) */
  function actPose(P, a) {
    const ang = P.ang, ca = Math.cos(ang), sa = Math.sin(ang), u = a.t / a.dur;
    const Rf = (f, s) => ({ x: f * ca - s * sa, y: f * sa + s * ca });
    if (a.type === 'store') {
      let r, l;
      if (u < 0.14) { r = Rf(26, 8); l = Rf(26, -8); }
      else if (u < 0.28) { r = Rf(28, 10); l = Rf(G.COOLER_F, -9); }
      else if (u < 0.64) { const v = ease(seg(u, 0.28, 0.6)); r = Rf(U.lerp(8, G.COOLER_F, v), U.lerp(15, 0, v)); l = Rf(G.COOLER_F, -9); }
      else if (u < 0.78) { r = Rf(U.lerp(G.COOLER_F, 24, seg(u, 0.64, 0.78)), 6); l = Rf(G.COOLER_F, -9); }
      else { r = Rf(G.COOLER_F, 8); l = Rf(G.COOLER_F, -8); }
      return { hands: { r, l }, twist: 0 };
    }
    // soltar: llevar el brazo atrás y lanzar
    let rx, ry, tw = 0;
    if (u < 0.28) { const v = ease(seg(u, 0, 0.28)); rx = U.lerp(10, -4, v); ry = U.lerp(14, 20, v); tw = -0.28 * v; }
    else if (u < 0.46) { const v = ease(seg(u, 0.28, 0.46)); rx = U.lerp(-4, 28, v); ry = U.lerp(20, 4, v); tw = U.lerp(-0.28, 0.3, v); }
    else { const v = ease(seg(u, 0.46, 0.7)); rx = U.lerp(28, 12, v); ry = U.lerp(4, 14, v); tw = U.lerp(0.3, 0, v); }
    return { hands: { r: Rf(rx, ry), l: Rf(8, -15) }, twist: tw };
  }
  function boxPath(c, w, h, r) { c.beginPath(); c.moveTo(-w + r, -h); c.arcTo(w, -h, w, h, r); c.arcTo(w, h, -w, h, r); c.arcTo(-w, h, -w, -h, r); c.arcTo(-w, -h, w, -h, r); c.closePath(); }

  /* Objetos de la acción en el mundo (nevera, pez, salpicadura). ctx en coordenadas de mundo */
  function drawAct(c, P, a) {
    const u = a.t / a.dur, ang = P.ang, ca = Math.cos(ang), sa = Math.sin(ang);
    const sp = a.sp, len = U.clamp(15 + (a.cat ? a.cat.cm : 25) * 0.42, 18, 44);
    if (a.type === 'store') {
      const dist = G.COOLER_F * G.PS, cx = P.x + Math.cos(a.dir) * dist, cy = P.y + Math.sin(a.dir) * dist;
      const pop = ease(seg(u, 0, 0.12)) * (1 - ease(seg(u, 0.93, 1)));
      const open = ease(seg(u, 0.12, 0.3)) - ease(seg(u, 0.78, 0.92));
      const PS = G.PS, K = 0.82;
      const col = COOL_COL[a.cool % COOL_COL.length];
      c.save(); c.translate(cx, cy); c.rotate(a.dir); c.scale(Math.max(0.01, pop * K), Math.max(0.01, pop * K));
      c.fillStyle = 'rgba(0,0,0,0.28)'; c.save(); c.translate(3, 4); boxPath(c, 13, 18, 5); c.fill(); c.restore();
      c.fillStyle = shade(col, -0.18); boxPath(c, 12, 17.5, 5); c.fill();
      if (open > 0.02) {
        c.fillStyle = '#1d3a55'; boxPath(c, 9.5, 15, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-5 + (i % 3) * 5, -10 + Math.floor(i / 3) * 8 + (i % 2) * 2, 1.7, 0, 6.3); c.fill(); }
      }
      // tapa: se encoge hacia la bisagra (borde lejano)
      const ll = 24 * (1 - open * 0.86), x1 = 12, x0 = x1 - ll;
      c.fillStyle = col; c.fillRect(x0, -17, x1 - x0, 34);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x0 + 1.5, -15, Math.max(0, x1 - x0 - 3), 4);
      c.strokeStyle = shade(col, -0.35); c.lineWidth = 1.2; c.strokeRect(x0, -17, x1 - x0, 34);
      if (open < 0.5) { c.fillStyle = shade(col, -0.3); c.fillRect(-7, -4, 4, 8); }
      c.restore();
      // pez en la mano / cayendo en la nevera
      if (u > 0.26 && u < 0.74) {
        let pos, s = 1, al = 1;
        if (u < 0.62) { const v = ease(seg(u, 0.28, 0.6)), f = U.lerp(8, G.COOLER_F, v), sd = U.lerp(15, 0, v); pos = { x: P.x + (f * ca - sd * sa) * PS, y: P.y + (f * sa + sd * ca) * PS }; s = 1 + Math.sin(v * Math.PI) * 0.25; }
        else { const v = seg(u, 0.62, 0.74); pos = { x: P.x + G.COOLER_F * ca * PS, y: P.y + G.COOLER_F * sa * PS }; s = 1 - v * 0.7; al = 1 - v * 0.6; }
        G.FishArt.draw(c, sp, pos.x, pos.y, len * s, ang + 0.6 + Math.sin(u * 20) * 0.1, { ph: u * 40, alpha: al });
      }
    } else {
      const tgt = a.target, hp = actPose(P, a).hands.r, hand = { x: P.x + hp.x * G.PS, y: P.y + hp.y * G.PS };
      if (u < 0.44) {
        G.FishArt.draw(c, sp, hand.x, hand.y, len, ang + 1.2 + Math.sin(u * 30) * 0.15, { ph: u * 50 });
      } else if (u < 0.8) {
        const v = seg(u, 0.44, 0.8), x = U.lerp(hand.x, tgt.x, ease(v) * 0.4 + v * 0.6), y = U.lerp(hand.y, tgt.y, v), h = Math.sin(v * Math.PI) * 46;
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(x + 2, y + 3, len * 0.4, len * 0.18, 0, 0, 6.3); c.fill();
        G.FishArt.draw(c, sp, x, y - h, len * (1 + Math.sin(v * Math.PI) * 0.3), ang + v * 9, { ph: u * 60 });
      } else {
        const v = seg(u, 0.8, 1);
        c.save(); c.lineWidth = 2.2;
        for (let i = 0; i < 3; i++) { const k = U.clamp(v * 1.4 - i * 0.2, 0, 1); if (k <= 0) continue; c.strokeStyle = 'rgba(255,255,255,' + 0.8 * (1 - k) + ')'; c.beginPath(); c.ellipse(tgt.x, tgt.y, 4 + k * 30, (4 + k * 30) * 0.7, 0, 0, 6.3); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,' + 0.9 * (1 - v) + ')';
        for (let i = 0; i < 9; i++) { const aa = i / 9 * 6.28, r = 6 + v * 26, hh = Math.sin(v * Math.PI) * 14; c.beginPath(); c.arc(tgt.x + Math.cos(aa) * r, tgt.y + Math.sin(aa) * r * 0.7 - hh, 2.4 * (1 - v) + 0.6, 0, 6.3); c.fill(); }
        c.restore();
        if (v < 0.35) G.FishArt.draw(c, sp, tgt.x, tgt.y, len * (1 - v * 2.2), ang + 3, { ph: u * 60, alpha: Math.max(0, 1 - v * 2.4) });
      }
    }
  }

  return { lookOf, legs, body, preview, arm, shade, startAct, actUpdate, actPose, drawAct };
})();
