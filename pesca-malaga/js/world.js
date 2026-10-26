/* Mundo: geometría de la costa de Málaga, fondos marinos y dibujo del mapa */
window.G = window.G || {};

G.World = (function () {
  const U = G.U, PXM = G.PXM, WD = G.WORLD;
  const rng = U.rng(777);

  const PROM_Y0 = 1340, PROM_Y1 = 1480;
  const PIER = { x0: 1597, x1: 1653, y0: 760, y1: 1004 };
  const DIVE = { x: 1250, y: 1030 };
  const PADDLE_SPAWN = { x: 2050, y: 1040 };
  const PREP_SPAWN = { x: 700, y: 1420 };
  const PORT_FENCE_X = WD.portX - 30;

  const SPOTS = [
    { id: 'malagueta', name: 'Playa de La Malagueta', sub: 'Arena', x: 520, y: 1090, icon: '🏖️' },
    { id: 'penon', name: 'Rocas del Peñón', sub: 'Rocas', x: 1200, y: 1050, icon: '🪨' },
    { id: 'espigon', name: 'Espigón de Pedregalejo', sub: 'Espigón de piedra', x: 1625, y: 800, icon: '🧱' },
    { id: 'palo', name: 'Playa de El Palo', sub: 'Posidonia', x: 2200, y: 1080, icon: '🌿' },
    { id: 'puerto', name: 'Puerto de Málaga', sub: 'Bloqueado', x: 3200, y: 1080, icon: '⚓', locked: true },
  ];

  function rockyAmp(x) {
    const a = U.smooth(U.clamp((x - 900) / 120, 0, 1)) * (1 - U.smooth(U.clamp((x - 1500) / 120, 0, 1)));
    return a;
  }
  function shoreY(x) {
    const r = rockyAmp(x);
    return WD.shore + 10 * Math.sin(x / 190) + 6 * Math.sin(x / 61 + 1) + r * (12 * Math.sin(x / 23) + 9 * Math.sin(x / 9.7));
  }

  /* ---- Fondos marinos ---- */
  const blobs = [];
  function addBlob(x, depthM, r, type) {
    const y = shoreY(x) - depthM * PXM;
    const n = 11, pts = [];
    for (let i = 0; i < n; i++) pts.push(0.72 + rng() * 0.5);
    const blades = [];
    if (type === 'P') for (let i = 0; i < 18; i++) blades.push({ a: rng() * 6.28, d: rng() * 0.85, l: 8 + rng() * 10, ph: rng() * 6 });
    blobs.push({ x, y, r, type, pts, blades });
  }
  // Rocas del Peñón
  for (let i = 0; i < 40; i++) addBlob(930 + rng() * 650, 0 + rng() * 38, 22 + rng() * 48, 'R');
  for (let i = 0; i < 7; i++) addBlob(960 + rng() * 600, 60 + rng() * 120, 50 + rng() * 60, 'R');
  // Roca en la base del espigón y su punta
  addBlob(1625, 56, 46, 'R'); addBlob(1580, 40, 40, 'R'); addBlob(1670, 38, 36, 'R'); addBlob(1625, 20, 55, 'R');
  // Praderas de posidonia en El Palo
  for (let i = 0; i < 40; i++) addBlob(1720 + rng() * 950, 3 + rng() * 60, 40 + rng() * 70, 'P');
  for (let i = 0; i < 4; i++) addBlob(1800 + rng() * 700, 70 + rng() * 40, 60 + rng() * 40, 'P');
  // Algunos arrecifes sueltos en la zona de arena
  for (let i = 0; i < 8; i++) addBlob(100 + rng() * 800, 55 + rng() * 110, 30 + rng() * 40, 'R');
  for (let i = 0; i < 6; i++) addBlob(1720 + rng() * 900, 100 + rng() * 80, 40 + rng() * 40, 'R');
  for (let i = 0; i < 6; i++) addBlob(100 + rng() * 800, 8 + rng() * 40, 30 + rng() * 40, 'P');

  function depthAt(x, y) { return Math.max(0, (shoreY(x) - y) / PXM); }
  function habitatAt(x, y) {
    const depth = depthAt(x, y);
    let hab = 'A';
    for (const b of blobs) {
      const d = Math.hypot(x - b.x, y - b.y);
      if (d < b.r * 0.85) { hab = b.type; break; }
    }
    return { hab, depth };
  }
  function inPier(x, y, pad = 0) { return x > PIER.x0 - pad && x < PIER.x1 + pad && y > PIER.y0 - pad && y < PIER.y1 + pad; }
  function canWalk(x, y, swell) {
    if (x < 24 || x > PORT_FENCE_X - 24) return false;
    const tip = swell >= 3 ? 880 : PIER.y0;
    if (x > PIER.x0 + 8 && x < PIER.x1 - 8 && y > tip && y < PIER.y1) return true;
    if (y > PROM_Y1 - 16) return false;
    return y > shoreY(x) - 8 && !hitUmbrella(x, y);
  }
  function hitUmbrella(x, y) {
    for (const u of umbrellas) {
      if (Math.abs(u.x - x) > u.r + 14) continue;
      if (Math.hypot(u.x - x, u.y - y) < u.r * 0.85 + 8) return true;
    }
    return false;
  }
  /* Busca el punto libre más cercano (por si aparecemos dentro de una sombrilla) */
  function freeSpot(x, y) {
    if (canWalk(x, y, 0)) return { x, y };
    for (let r = 12; r < 260; r += 12) for (let a = 0; a < 6.28; a += 0.52) {
      const nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r;
      if (canWalk(nx, ny, 0)) return { x: nx, y: ny };
    }
    return { x, y };
  }
  function canPaddle(x, y) {
    if (x < 40 || x > PORT_FENCE_X - 30) return false;
    if (y < G.BUOY_Y + 16) return false;
    if (inPier(x, y, 14)) return false;
    return y < shoreY(x) - 14;
  }

  /* ---- Decoración estática ---- */
  const shoreRocks = [];
  for (let i = 0; i < 110; i++) {
    const x = 900 + rng() * 700;
    if (rockyAmp(x) < 0.15) continue;
    shoreRocks.push({ x, y: shoreY(x) + (rng() * 70 - 38), r: 10 + rng() * 26, a: rng() * 6, k: 0.6 + rng() * 0.4 });
  }
  const umbrellas = [];
  const towels = [];
  const umbCols = ['#e8503a', '#f2b632', '#2f9fd8', '#ffffff', '#e86a9a', '#3fbf86'];
  for (let i = 0; i < 70; i++) {
    const x = 120 + rng() * 3000;
    if (x > 880 && x < 1700) continue;
    const y = shoreY(x) + 70 + rng() * 190;
    umbrellas.push({ x, y, r: 16 + rng() * 6, c: U.pick(umbCols), c2: U.pick(umbCols) });
    towels.push({ x: x + 26 + rng() * 14, y: y + rng() * 20 - 8, a: rng() * 0.8 - 0.4, c: U.pick(umbCols) });
  }
  const palms = [];
  for (let x = 80; x < 3200; x += 210 + rng() * 60) palms.push({ x, y: PROM_Y0 + 4 + rng() * 16, s: 0.9 + rng() * 0.4, a: rng() * 6 });
  const lamps = [];
  for (let x = 160; x < 3200; x += 230) lamps.push({ x, y: PROM_Y0 + 44, r: 105 });
  lamps.push({ x: 1612, y: 790, r: 120 }, { x: 1638, y: 880, r: 100 }, { x: 1250, y: 1050, r: 80 });

  const roofCols = ['#c4573a', '#b24a30', '#cf6a43', '#a8452c'];
  const wallCols = ['#f1e3c4', '#e9c9a0', '#efd5c0', '#f6efe0', '#e6b98c', '#d9e4e6'];
  const buildings = [];
  (function () {
    const named = [
      { x: 380, w: 190, label: 'TU PESCADERÍA', kind: 'fishshop', wall: '#f2f2ee', awn: '#2d7fc4' },
      { x: 600, w: 200, label: 'PESCA EL ANZUELO', kind: 'tackle', wall: '#f0dcb4', awn: '#d9552e' },
      { x: 830, w: 190, label: 'LONJA · PROVEEDORES', kind: 'lonja', wall: '#e1e9ea', awn: '#2c8c6a' },
    ];
    for (const n of named) buildings.push({ ...n, y: PROM_Y1, h: 190 });
    let x = 10;
    while (x < 3300) {
      const w = 110 + rng() * 90;
      if (!named.some(n => x < n.x + n.w + 6 && x + w > n.x - 6)) {
        buildings.push({ x, y: PROM_Y1, w, h: 150 + rng() * 60, wall: U.pick(wallCols), roof: U.pick(roofCols), awn: rng() < 0.4 ? U.pick(umbCols) : null });
      }
      x += w + 6;
    }
  })();
  const gulls = [];
  for (let i = 0; i < 7; i++) gulls.push({ cx: 400 + rng() * 2600, cy: 500 + rng() * 800, rx: 120 + rng() * 260, ry: 50 + rng() * 120, sp: 0.15 + rng() * 0.2, ph: rng() * 6 });
  const swimmers = [];
  for (let i = 0; i < 16; i++) {
    const x = 160 + rng() * 2900;
    if (x > 880 && x < 1700) continue;
    swimmers.push({ x, d: 5 + rng() * 14, ph: rng() * 6, c: U.pick(['#f2c9a0', '#d9a074', '#f0b88a']), cap: U.pick(umbCols) });
  }
  for (const s of swimmers) { s.arr = 9.2 + rng() * 1.5; s.lv = 19.3 + rng() * 0.5; }
  const cars = [{ x: 200, s: 90, c: '#d0453a' }, { x: 1400, s: -70, c: '#3a6fd0' }, { x: 2300, s: 110, c: '#e8e8e8' }, { x: 3000, s: -100, c: '#f2b632' }];
  const boats = [];
  for (let i = 0; i < 9; i++) boats.push({ x: 3380 + (i % 3) * 230 + rng() * 40, y: 780 + Math.floor(i / 3) * 90 + rng() * 20, a: rng() * 0.4 - 0.2, c: U.pick(['#ffffff', '#f4efe2', '#e7f1f5']), s: 0.9 + rng() * 0.5 });

  /* ---- Gente de la playa y el paseo (llegan por la mañana y se van a las 20:00) ---- */
  const rngP = U.rng(4242);
  const SKIN = ['#f2c9a0', '#d9a074', '#f0b88a', '#c68863', '#8d5a3b'];
  const SHIRT = ['#e8503a', '#f2b632', '#2f9fd8', '#ffffff', '#e86a9a', '#3fbf86', '#7a5ad8', '#2b3a55', '#f08a3c'];
  const HAIR = ['#2a1d14', '#5a3a22', '#c9a24a', '#111', '#8a8a8a'];
  const people = [];
  for (let i = 0; i < 58; i++) {
    const beach = i % 5 < 2;
    let cx = 120 + rngP() * 3050;
    if (beach && cx > 850 && cx < 1750) cx = 250 + rngP() * 500;
    people.push({
      beach, cx, rx: beach ? 70 + rngP() * 200 : 90 + rngP() * 380, off: beach ? 22 + rngP() * 40 : PROM_Y0 + 34 + rngP() * 70,
      sp: 0.1 + rngP() * 0.13, ph: rngP() * 6.28, skin: SKIN[(rngP() * SKIN.length) | 0], shirt: SHIRT[(rngP() * SHIRT.length) | 0], hair: HAIR[(rngP() * HAIR.length) | 0],
      arr: 8.2 + rngP() * 1.6, lv: 19.5 + rngP() * 0.55,
    });
  }
  const EXIT_DUR = 0.55;
  function pPos(p, t) {
    const a = t * p.sp + p.ph;
    const x = p.cx + Math.sin(a) * p.rx, vx = Math.cos(a);
    const y = p.beach ? shoreY(x) + p.off + Math.sin(t * 0.5 + p.ph) * 5 : p.off + Math.sin(t * 0.7 + p.ph) * 6;
    return { x, y, hd: vx >= 0 ? 0 : Math.PI };
  }
  function personAlpha(p, hour) {
    if (hour < p.arr || hour >= p.lv + EXIT_DUR) return null;
    if (hour < p.lv) return Math.min(1, (hour - p.arr) / 0.25);
    return 1 - U.clamp(((hour - p.lv) / EXIT_DUR - 0.55) / 0.45, 0, 1);
  }
  function drawPerson(ctx, x, y, hd, t, p, al, sc) {
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(3, 5, 11, 9, 0, 0, 6.3); ctx.fill();
    ctx.rotate(hd);
    const sw = Math.sin(t * 5 + p.ph * 3) * 5;
    ctx.fillStyle = '#2d3a4a'; ctx.beginPath(); ctx.ellipse(sw, -5, 6, 3.4, 0, 0, 6.3); ctx.ellipse(-sw, 5, 6, 3.4, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = p.shirt; ctx.beginPath(); ctx.ellipse(0, 0, 7.5, 12, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = p.skin; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(9 + sw * 0.3, -4); ctx.moveTo(0, 9); ctx.lineTo(9 - sw * 0.3, 4); ctx.stroke();
    ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(0, 0, 6.6, 0, 6.3); ctx.fill();
    ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(-1, 0, 6.6, 1.7, 4.6); ctx.fill();
    ctx.restore();
  }
  function drawPeople(ctx, vis, env) {
    const hour = env.hour, t = env.t;
    for (const p of people) {
      const al = personAlpha(p, hour);
      if (al == null) continue;
      let { x, y, hd } = pPos(p, t);
      if (hour < p.arr + 0.25 || hour >= p.lv) {
        // llegando o marchándose por el paseo
        const u = hour >= p.lv ? U.smooth(U.clamp((hour - p.lv) / EXIT_DUR, 0, 1)) : 1 - U.smooth(U.clamp((hour - p.arr) / 0.25, 0, 1));
        const ex = p.cx, ey = PROM_Y1 - 8;
        hd = Math.atan2(ey - y, ex - x);
        x = U.lerp(x, ex, u); y = U.lerp(y, ey, u);
      }
      if (x < vis.x0 - 30 || x > vis.x1 + 30 || y < vis.y0 - 30 || y > vis.y1 + 30) continue;
      drawPerson(ctx, x, y, hd, t, p, al, 0.74);
    }
  }
  // bañistas tumbados en las toallas
  for (const tw of towels) {
    tw.lie = rngP() < 0.7; tw.skin = SKIN[(rngP() * SKIN.length) | 0]; tw.suit = SHIRT[(rngP() * SHIRT.length) | 0]; tw.arr = 9 + rngP() * 2; tw.lv = 19.2 + rngP() * 0.7;
  }

  /* ---- Bancos de peces: sombras en el agua que indican dónde hay pesca ---- */
  const schools = [];
  function pickSchoolSpecies(x, y) {
    const h = habitatAt(x, y), out = [];
    for (const sp of G.SPECIES) {
      if (!sp.modes.includes('orilla') || sp.time === 'noche') continue;
      if (h.depth < sp.dmin || h.depth > sp.dmax) continue;
      if (!(sp.hab.includes('O') || sp.hab.includes(h.hab))) continue;
      if (sp.rar === 'epico' || sp.rar === 'leyenda') continue;
      out.push({ sp, w: G.RARITY[sp.rar].weight });
    }
    const pk = U.weighted(out, o => o.w);
    return pk ? pk.sp : null;
  }
  function spawnSchool(s, t, first) {
    for (let tries = 0; tries < 12; tries++) {
      const x = 140 + Math.random() * 3000, depth = 5 + Math.pow(Math.random(), 1.5) * 85;
      const y = shoreY(x) - depth * PXM;
      if (inPier(x, y, 30) || y < G.BUOY_Y + 30) continue;
      const sp = pickSchoolSpecies(x, y);
      if (!sp) continue;
      s.x = x; s.y = y; s.depth = depth; s.sp = sp; s.r = 30 + Math.random() * 30; s.n = 3 + ((Math.random() * 5) | 0);
      s.life = 45 + Math.random() * 80; s.born = first ? t - Math.random() * s.life * 0.8 : t; s.dir = Math.random() < 0.5 ? 1 : -1; s.seed = Math.random() * 100;
      return;
    }
    s.sp = null; s.born = t; s.life = 5;
  }
  for (let i = 0; i < 18; i++) { const s = {}; spawnSchool(s, 0, true); schools.push(s); }
  function schoolAlpha(s, t) {
    const age = t - s.born;
    return U.clamp(Math.min(age / 4, (s.life - age) / 6), 0, 1);
  }
  function updateSchools(t, hold) {
    for (const s of schools) {
      if (t - s.born <= s.life) continue;
      if (hold && s.sp && Math.hypot(hold.x - s.x, hold.y - s.y) < s.r * 1.4) { s.born = t - s.life + 8; continue; }
      spawnSchool(s, t, false);
    }
  }
  function schoolAt(x, y, t) {
    for (const s of schools) if (s.sp && schoolAlpha(s, t) > 0.45 && Math.hypot(x - s.x, y - s.y) < s.r * 1.05) return s;
    return null;
  }
  function drawSchools(ctx, vis, env) {
    const t = env.t;
    for (const s of schools) {
      if (!s.sp || s.x + s.r < vis.x0 - 60 || s.x - s.r > vis.x1 + 60 || s.y + s.r < vis.y0 - 60 || s.y - s.r > vis.y1 + 60) continue;
      const al = schoolAlpha(s, t);
      if (al <= 0.01) continue;
      const base = al * U.clamp(1.05 - s.depth / 120, 0.4, 1) * 0.42;
      const len = U.clamp(18 + (s.sp.cm[0] + s.sp.cm[1]) * 0.3, 22, 64);
      for (let i = 0; i < s.n; i++) {
        const a = t * 0.32 * s.dir + i * 2.4 + s.seed, rr = s.r * (0.3 + 0.62 * ((i * 0.37 + s.seed) % 1));
        const x = s.x + Math.cos(a) * rr, y = s.y + Math.sin(a) * rr * 0.72;
        const ang = Math.atan2(Math.cos(a) * 0.72 * s.dir, -Math.sin(a) * s.dir);
        G.FishArt.draw(ctx, s.sp, x, y, len * (0.85 + ((i * 0.31) % 0.3)), ang, { shadow: true, ph: t * 6 + i * 1.7, alpha: base });
      }
    }
  }

  /* ---- Dibujo ---- */
  const BANDS = [
    ['#0b4a78', 200], ['#0e5b8c', 120], ['#12709f', 70], ['#1a87ae', 40], ['#2aa3b8', 20], ['#4cc0c4', 9], ['#86dcd2', 3],
  ];
  function stepsX(x0, x1, step) {
    const s = Math.floor(x0 / step) * step, out = [];
    for (let x = s; x <= x1 + step; x += step) out.push(x);
    return out;
  }
  function bandPath(ctx, xs, dM, bottom) {
    ctx.beginPath();
    ctx.moveTo(xs[0], bottom);
    for (const x of xs) ctx.lineTo(x, shoreY(x) - dM * PXM);
    ctx.lineTo(xs[xs.length - 1], bottom);
    ctx.closePath();
  }

  function drawBlob(ctx, b, t, alpha) {
    const n = b.pts.length;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i % n) / n * 6.2832;
      const wob = 1 + Math.sin(t * 0.8 + i * 1.7 + b.x) * 0.025;
      const r = b.r * b.pts[i % n] * wob;
      const px = b.x + Math.cos(a) * r, py = b.y + Math.sin(a) * r * 0.82;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath();
    if (b.type === 'R') {
      ctx.globalAlpha = alpha; ctx.fillStyle = '#2d4550'; ctx.fill();
      ctx.globalAlpha = alpha * 0.55; ctx.fillStyle = '#566f78';
      ctx.save(); ctx.translate(b.x - b.r * 0.12, b.y - b.r * 0.12); ctx.scale(0.72, 0.72); ctx.translate(-b.x, -b.y);
      ctx.fill(); ctx.restore();
    } else {
      ctx.globalAlpha = alpha; ctx.fillStyle = '#1d4d33'; ctx.fill();
      ctx.globalAlpha = alpha * 0.9; ctx.strokeStyle = '#2f7a47'; ctx.lineWidth = 1.6;
      for (const bl of b.blades) {
        const bx = b.x + Math.cos(bl.a) * b.r * bl.d * 0.85, by = b.y + Math.sin(bl.a) * b.r * bl.d * 0.7;
        const sw = Math.sin(t * 1.4 + bl.ph) * 4;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + sw * 0.5, by - bl.l * 0.5, bx + sw, by - bl.l); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawSea(ctx, vis, env) {
    const t = env.t, sw = env.swellF;
    const xs = stepsX(vis.x0 - 40, vis.x1 + 40, 24);
    const bottom = WD.shore + 80;
    ctx.fillStyle = '#093a60';
    ctx.fillRect(vis.x0, vis.y0, vis.x1 - vis.x0, Math.min(vis.y1, bottom) - vis.y0);
    for (const [col, d] of BANDS) {
      ctx.fillStyle = col;
      for (const j of [1.14, 1]) {
        ctx.globalAlpha = j === 1 ? 1 : 0.4;
        bandPath(ctx, xs, d * j * (d > 100 ? 0.92 : 1), bottom);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // fondos
    for (const b of blobs) {
      if (b.x + b.r < vis.x0 || b.x - b.r > vis.x1 || b.y + b.r < vis.y0 || b.y - b.r > vis.y1) continue;
      const depth = depthAt(b.x, b.y);
      drawBlob(ctx, b, t, U.clamp(0.88 - depth / 120, 0.2, 0.85));
      if (b.type === 'R' && depth < 10) {
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.18 + 0.2 * sw / 3) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * 1.05 + Math.sin(t * 1.3 + b.x) * 3, b.r * 0.9, 0, 0, 6.3); ctx.stroke();
      }
    }
    drawSchools(ctx, vis, env);
    // cáusticas
    const pat = G.TEX.patterns.caustic;
    if (pat) {
      ctx.save();
      bandPath(ctx, xs, 70, bottom); ctx.clip();
      pat.setTransform(new DOMMatrix().translate(t * 9, t * 5).scale(1.4));
      ctx.globalAlpha = 0.55; ctx.fillStyle = pat; ctx.fillRect(vis.x0, vis.y0, vis.x1 - vis.x0, bottom - vis.y0);
      if (!G.lowQ && env.night < 0.6) {
        pat.setTransform(new DOMMatrix().translate(-t * 6, t * 8).scale(0.9));
        ctx.globalAlpha = 0.4; ctx.fillRect(vis.x0, vis.y0, vis.x1 - vis.x0, bottom - vis.y0);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    // más allá de las boyas: aguas de navegación
    if (vis.y0 < G.BUOY_Y) {
      ctx.fillStyle = 'rgba(4,22,48,0.28)';
      ctx.fillRect(vis.x0, vis.y0, vis.x1 - vis.x0, G.BUOY_Y - vis.y0);
    }
    // olas
    drawWaves(ctx, vis, env, xs);
  }

  function drawWaves(ctx, vis, env, xs) {
    const t = env.t, sw = env.swellF;
    const rows = 5 + Math.round(sw * 2);
    const range = 200 + sw * 70;
    ctx.lineCap = 'round';
    for (let k = 0; k < rows; k++) {
      for (let seg = 0; seg < 4; seg++) {
        const ph = ((t * (0.07 + sw * 0.03) + k / rows + seg * 0.113) % 1);
        const off = ph * range;
        const al = Math.sin(ph * Math.PI) * (0.22 + 0.16 * sw);
        if (al < 0.02) continue;
        ctx.strokeStyle = 'rgba(255,255,255,' + al + ')';
        ctx.lineWidth = 1.5 + sw * 0.9 + ph * 2;
        ctx.beginPath();
        let started = false;
        for (const x of xs) {
          const v = Math.sin(x / 150 + seg * 2.1 + k * 1.3) + Math.sin(x / 47 + k);
          if (v < -0.2) { started = false; continue; }
          const y = shoreY(x) - 8 - (range - off) + Math.sin(x / 33 + t * 1.2 + k) * (2 + sw * 2);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }

  function drawFoam(ctx, vis, env, xs) {
    const t = env.t, sw = env.swellF;
    const swash = (x) => Math.sin(t * 1.05 + x / 110) * (4 + sw * 5) + Math.sin(t * 2.1 + x / 40) * (1 + sw);
    // arena mojada
    ctx.beginPath();
    for (const x of xs) ctx.lineTo(x, shoreY(x) + swash(x));
    for (let i = xs.length - 1; i >= 0; i--) ctx.lineTo(xs[i], shoreY(xs[i]) + 26 + Math.sin(xs[i] / 55 + t * 0.4) * 5);
    ctx.closePath();
    ctx.fillStyle = G.TEX.patterns.wet; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
    // espuma
    for (const [off, al, wd] of [[0, 0.85, 3.5], [-9, 0.45, 2], [-20 - sw * 4, 0.25, 2]]) {
      ctx.strokeStyle = 'rgba(255,255,255,' + al + ')'; ctx.lineWidth = wd + sw * 0.8;
      ctx.beginPath();
      xs.forEach((x, i) => {
        const y = shoreY(x) + swash(x) + off + Math.sin(x / 13 + t) * 1.4;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
    }
  }

  function rockShape(ctx, r, k, a) {
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const an = i / 9 * 6.2832 + a, rr = r * (0.75 + 0.25 * Math.sin(i * 2.3 + a * 5));
      const px = Math.cos(an) * rr, py = Math.sin(an) * rr * k;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }

  function drawBuilding(ctx, b) {
    const { x, y, w, h } = b;
    // fachada
    ctx.fillStyle = b.wall; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x, y, w, 6);
    // cubierta de teja (vista cenital)
    const rc = b.roof || '#b24a30';
    const ry = y + 58;
    ctx.fillStyle = rc; ctx.fillRect(x - 2, ry, w + 4, h - 58);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
    for (let ty = ry + 8; ty < y + h; ty += 8) { ctx.beginPath(); ctx.moveTo(x - 2, ty); ctx.lineTo(x + w + 2, ty); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x - 2, ry, w + 4, 5);
    // ventanas
    ctx.fillStyle = '#3d556b';
    const n = Math.max(2, Math.floor(w / 46));
    for (let i = 0; i < n; i++) {
      const wx = x + (i + 0.5) * w / n - 8;
      ctx.fillRect(wx, y + 12, 16, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(wx + 2, y + 14, 5, 20); ctx.fillStyle = '#3d556b';
    }
    // toldo
    if (b.awn) {
      const ax = x + 8, aw = w - 16;
      for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : b.awn; ctx.fillRect(ax + i * aw / 8, y - 14, aw / 8 + 0.5, 22); }
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(ax, y + 8, aw, 5);
    }
    if (b.label) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + w / 2 - 24, y - 7, 48, 7);
      ctx.fillStyle = b.awn; ctx.fillRect(x + w / 2 - 22, y - 6, 44, 5);
      ctx.fillStyle = '#16384f'; const lw = w - 20;
      ctx.fillRect(x + 10, y + 42, lw, 22);
      ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.label, x + w / 2, y + 53);
      ctx.font = '26px serif';
      ctx.fillText(b.kind === 'fishshop' ? '🐟' : b.kind === 'tackle' ? '🎣' : '⚓', x + w / 2, y + 108);
      const open = G.S.phase === 'prep';
      ctx.font = '700 10px system-ui'; ctx.fillStyle = open ? '#2fbf7a' : '#e0584a';
      ctx.fillText(open ? 'ABIERTO' : 'CERRADO', x + w / 2, y + 78);
      if (open) {
        const bob = Math.sin(G.env.t * 4) * 3;
        ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 9, y - 40 + bob); ctx.lineTo(x + w / 2 + 9, y - 40 + bob); ctx.lineTo(x + w / 2, y - 24 + bob); ctx.closePath(); ctx.fill();
      }
    }
  }

  function drawLand(ctx, vis, env) {
    const t = env.t;
    const xs = stepsX(vis.x0 - 40, vis.x1 + 40, 24);
    // arena seca
    ctx.beginPath();
    xs.forEach((x, i) => { const y = shoreY(x); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineTo(xs[xs.length - 1], PROM_Y0); ctx.lineTo(xs[0], PROM_Y0); ctx.closePath();
    ctx.fillStyle = G.TEX.patterns.sand; ctx.fill();
    // zona rocosa: arena más oscura y piedras
    drawFoam(ctx, vis, env, xs);
    // paseo marítimo
    ctx.fillStyle = G.TEX.patterns.paseo;
    ctx.fillRect(vis.x0, PROM_Y0, vis.x1 - vis.x0, PROM_Y1 - PROM_Y0);
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(vis.x0, PROM_Y0, vis.x1 - vis.x0, 4);
    ctx.fillStyle = '#e9dcc0'; ctx.fillRect(vis.x0, PROM_Y0 + 4, vis.x1 - vis.x0, 5);
    // edificios
    for (const b of buildings) if (b.x < vis.x1 && b.x + b.w > vis.x0) drawBuilding(ctx, b);
    // calle
    ctx.fillStyle = '#4a4d52'; ctx.fillRect(vis.x0, 1720, vis.x1 - vis.x0, 90);
    ctx.fillStyle = '#e8e2c8';
    for (let x = Math.floor(vis.x0 / 80) * 80; x < vis.x1; x += 80) ctx.fillRect(x, 1763, 40, 4);
    ctx.fillStyle = '#6f6b64'; ctx.fillRect(vis.x0, 1810, vis.x1 - vis.x0, 90);
    for (const c of cars) {
      const cx = ((c.x + c.s * t) % 3600 + 3600) % 3600 - 100;
      ctx.fillStyle = c.c; ctx.fillRect(cx, c.s > 0 ? 1738 : 1772, 46, 20);
      ctx.fillStyle = 'rgba(30,50,70,0.8)'; ctx.fillRect(cx + 14, (c.s > 0 ? 1738 : 1772) + 3, 18, 14);
    }
    // rocas de la orilla
    for (const r of shoreRocks) {
      if (r.x + r.r < vis.x0 || r.x - r.r > vis.x1) continue;
      ctx.save(); ctx.translate(r.x, r.y);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.save(); ctx.translate(5, 6); rockShape(ctx, r.r, r.k, r.a); ctx.fill(); ctx.restore();
      rockShape(ctx, r.r, r.k, r.a);
      ctx.fillStyle = G.TEX.patterns.stone; ctx.fill();
      ctx.strokeStyle = 'rgba(25,22,20,0.55)'; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.save(); ctx.translate(-r.r * 0.15, -r.r * 0.15); ctx.scale(0.55, 0.55); rockShape(ctx, r.r, r.k, r.a);
      ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill(); ctx.restore();
      ctx.restore();
    }
    // espigón
    const px = PIER.x0, pw = PIER.x1 - PIER.x0, ph = PIER.y1 - PIER.y0;
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(px + 8, PIER.y0 + 9, pw, ph);
    ctx.fillStyle = G.TEX.patterns.stone; ctx.fillRect(px, PIER.y0, pw, ph);
    ctx.fillStyle = 'rgba(210,205,195,0.55)'; ctx.fillRect(px + 8, PIER.y0 + 6, pw - 16, ph - 6);
    ctx.strokeStyle = 'rgba(60,55,50,0.35)'; ctx.lineWidth = 1;
    for (let y = PIER.y0 + 6; y < PIER.y1; y += 18) { ctx.beginPath(); ctx.moveTo(px + 8, y); ctx.lineTo(px + pw - 8, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(px + pw / 2, PIER.y0 - 2, pw / 2 + 4 + Math.sin(t * 1.4) * 2, 12, 0, 0, 6.3); ctx.stroke();
    // zona de buceo
    drawDiveSpot(ctx, t);
    // puerto
    drawPort(ctx, vis, env);
  }

  function drawDiveSpot(ctx, t) {
    // pasillo de boyas pequeñas
    for (const side of [-1, 1]) {
      for (let y = DIVE.y - 20; y > G.BUOY_Y; y -= 76) {
        const bx = DIVE.x + side * 38 + Math.sin(t + y) * 1.5, by = y + Math.sin(t * 1.3 + y) * 1.5;
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(bx + 2, by + 2, 5, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx - 1.5, by - 1.5, 1.8, 0, 6.3); ctx.fill();
      }
    }
    // bandera de buceo
    ctx.fillStyle = '#3a2f26'; ctx.fillRect(DIVE.x - 14, DIVE.y + 10, 3, 24);
    ctx.save(); ctx.translate(DIVE.x - 11, DIVE.y + 10);
    ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24 + Math.sin(t * 3) * 2, 3); ctx.lineTo(24, 14); ctx.lineTo(0, 15); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 1); ctx.lineTo(22, 14); ctx.lineTo(10, 15); ctx.lineTo(0, 15); ctx.lineTo(0, 6); ctx.fill();
    ctx.restore();
    ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#16384f';
    ctx.fillText('ZONA DE BUCEO', DIVE.x + 6, DIVE.y + 52);
  }

  function drawPort(ctx, vis, env) {
    const x0 = WD.portX;
    if (x0 > vis.x1) return;
    const t = env.t;
    // espaldón y muelle
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x0 - 40, 330, 58, 700);
    ctx.fillStyle = G.TEX.patterns.stone; ctx.fillRect(x0 - 44, 320, 54, 700);
    ctx.fillStyle = 'rgba(200,198,190,0.6)'; ctx.fillRect(x0 - 34, 326, 34, 690);
    // agua de puerto + barcos
    ctx.fillStyle = 'rgba(15,60,80,0.25)'; ctx.fillRect(x0 + 10, 330, 1000, 680);
    for (const b of boats) {
      ctx.save(); ctx.translate(b.x, b.y + Math.sin(t + b.x) * 2); ctx.rotate(b.a + Math.sin(t * 0.7 + b.x) * 0.03); ctx.scale(b.s, b.s);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(3, 4, 40, 15, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = b.c; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(-20, -16, 24, -13); ctx.lineTo(44, 0); ctx.lineTo(24, 13); ctx.quadraticCurveTo(-20, 16, -40, 0); ctx.fill();
      ctx.strokeStyle = '#8aa'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#c9d6dc'; ctx.fillRect(-12, -7, 20, 14);
      ctx.restore();
    }
    // explanada
    ctx.fillStyle = '#8d8f92'; ctx.fillRect(x0, 1004, 1000, PROM_Y1 - 1004);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let x = x0; x < x0 + 1000; x += 60) ctx.fillRect(x, 1004, 2, PROM_Y1 - 1004);
    // contenedores
    const cols = ['#c0392b', '#2471a3', '#1e8449', '#d68910', '#7d3c98'];
    for (let i = 0; i < 12; i++) { ctx.fillStyle = cols[i % 5]; ctx.fillRect(x0 + 40 + (i % 6) * 90, 1060 + Math.floor(i / 6) * 110, 76, 30); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x0 + 40 + (i % 6) * 90, 1085 + Math.floor(i / 6) * 110, 76, 5); }
    // oscurecer: bloqueado
    ctx.fillStyle = 'rgba(30,40,55,0.35)'; ctx.fillRect(x0 - 30, 0, 1300, PROM_Y1 + 400);
    // valla
    ctx.fillStyle = '#d9a21b';
    for (let y = 320; y < PROM_Y1; y += 40) { ctx.fillStyle = (y / 40) % 2 ? '#222' : '#e3b32d'; ctx.fillRect(PORT_FENCE_X - 4, y, 8, 40); }
    ctx.fillStyle = '#16384f'; ctx.fillRect(PORT_FENCE_X - 74, 1110, 148, 54);
    ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('PUERTO DE MÁLAGA', PORT_FENCE_X, 1131);
    ctx.fillStyle = '#ffd23a'; ctx.fillText('🔒 Próximamente', PORT_FENCE_X, 1152);
  }

  function drawBuoys(ctx, vis, env) {
    const t = env.t, y0 = G.BUOY_Y;
    if (vis.y0 > y0 + 60 || vis.y1 < y0 - 60) return;
    const x1 = PORT_FENCE_X - 20;
    // cuerda
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (let x = Math.max(0, Math.floor(vis.x0 / 20) * 20); x <= Math.min(x1, vis.x1 + 20); x += 20) {
      const y = y0 + Math.sin(t * 1.4 + x / 70) * (2 + env.swellF * 1.5);
      x === Math.max(0, Math.floor(vis.x0 / 20) * 20) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);
    // muro de límite
    const g = ctx.createLinearGradient(0, y0, 0, y0 + 26);
    g.addColorStop(0, 'rgba(255,120,60,0.30)'); g.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = g; ctx.fillRect(Math.max(0, vis.x0), y0, Math.min(x1, vis.x1) - Math.max(0, vis.x0), 26);
    // boyas
    for (let x = Math.max(0, Math.floor(vis.x0 / 90) * 90); x <= Math.min(x1, vis.x1 + 90); x += 90) {
      const by = y0 + Math.sin(t * 1.4 + x / 70) * (2 + env.swellF * 1.5) + Math.sin(t * 1.9 + x) * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x + 3, by + 4, 11, 9, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#ff8a1f'; ctx.beginPath(); ctx.arc(x, by, 10, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, by, 10, 0.2, 1.5); ctx.lineTo(x, by); ctx.fill();
      ctx.fillStyle = '#ff8a1f'; ctx.beginPath(); ctx.arc(x, by, 4.5, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x - 3.5, by - 3.5, 2.6, 0, 6.3); ctx.fill();
      if ((x / 90) % 6 === 0) {
        ctx.fillStyle = '#16384f'; ctx.fillRect(x - 22, by - 30, 44, 16);
        ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('200 m', x, by - 18);
      }
    }
    // muro del puerto
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(x1, y0); ctx.lineTo(x1, shoreY(x1)); ctx.stroke(); ctx.setLineDash([]);
  }

  function drawTall(ctx, vis, env) {
    const t = env.t;
    for (const u of towels) {
      if (u.x < vis.x0 - 40 || u.x > vis.x1 + 40 || u.y < vis.y0 - 40 || u.y > vis.y1 + 40) continue;
      ctx.save(); ctx.translate(u.x, u.y); ctx.rotate(u.a);
      ctx.fillStyle = u.c; ctx.fillRect(-9, -15, 18, 30);
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-9, -5, 18, 3); ctx.fillRect(-9, 4, 18, 3);
      ctx.restore();
    }
    // bañistas
    const hour = env.hour;
    for (const s of swimmers) {
      if (s.x < vis.x0 || s.x > vis.x1 || hour < s.arr || hour > s.lv + 0.3) continue;
      const x = s.x + Math.sin(t * 0.4 + s.ph) * 20, y = shoreY(s.x) - s.d * PXM + Math.sin(t * 1.3 + s.ph) * 3;
      if (y < vis.y0 - 30 || y > vis.y1 + 30) continue;
      ctx.save(); ctx.globalAlpha = U.clamp(Math.min((hour - s.arr) / 0.3, (s.lv + 0.3 - hour) / 0.3), 0, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(x, y + 1, 12, 8, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.3); ctx.fill();
      ctx.fillStyle = s.cap; ctx.beginPath(); ctx.arc(x, y - 0.5, 5, 3.3, 6.1); ctx.fill();
      ctx.strokeStyle = s.c; ctx.lineWidth = 2.5;
      const a = Math.sin(t * 3 + s.ph) * 5;
      ctx.beginPath(); ctx.moveTo(x - 5, y + a); ctx.lineTo(x - 11, y - a); ctx.moveTo(x + 5, y - a); ctx.lineTo(x + 11, y + a); ctx.stroke();
      ctx.restore();
    }
    for (const tw of towels) {
      if (!tw.lie || hour < tw.arr || hour > tw.lv + 0.3 || tw.x < vis.x0 - 40 || tw.x > vis.x1 + 40 || tw.y < vis.y0 - 40 || tw.y > vis.y1 + 40) continue;
      ctx.save(); ctx.translate(tw.x, tw.y); ctx.rotate(tw.a);
      ctx.globalAlpha = U.clamp(Math.min((hour - tw.arr) / 0.3, (tw.lv + 0.3 - hour) / 0.3), 0, 1);
      ctx.fillStyle = tw.skin; ctx.beginPath(); ctx.ellipse(0, 3, 4.4, 10.5, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = tw.suit; ctx.fillRect(-4.4, 1, 8.8, 6);
      ctx.fillStyle = tw.skin; ctx.beginPath(); ctx.arc(0, -9, 4.2, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#3a2a1e'; ctx.beginPath(); ctx.arc(0, -10, 4.2, 3.3, 6.1); ctx.fill();
      ctx.restore();
    }
    drawPeople(ctx, vis, env);
    for (const u of umbrellas) {
      if (u.x < vis.x0 - 40 || u.x > vis.x1 + 40 || u.y < vis.y0 - 40 || u.y > vis.y1 + 40) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(u.x + 9, u.y + 11, u.r, u.r * 0.9, 0, 0, 6.3); ctx.fill();
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? u.c : '#fff';
        ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.arc(u.x, u.y, u.r, i * 0.785, (i + 1) * 0.785); ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(u.x, u.y, 2, 0, 6.3); ctx.fill();
    }
    for (const p of palms) {
      if (p.x < vis.x0 - 90 || p.x > vis.x1 + 90) continue;
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s, p.s);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(10, 12, 44, 38, 0, 0, 6.3); ctx.fill();
      for (let i = 0; i < 10; i++) {
        const a = p.a + i / 10 * 6.2832 + Math.sin(t * 0.8 + i + p.x) * 0.04;
        ctx.save(); ctx.rotate(a);
        ctx.fillStyle = i % 2 ? '#2f8f43' : '#3da654';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(22, -9, 46, 0); ctx.quadraticCurveTo(22, 9, 0, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(0,50,10,0.35)'; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(44, 0); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#7a5230'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 6.3); ctx.fill();
      ctx.restore();
    }
    for (const l of lamps) {
      if (l.x < vis.x0 - 30 || l.x > vis.x1 + 30) continue;
      ctx.fillStyle = '#2b2f36'; ctx.beginPath(); ctx.arc(l.x, l.y, 4.5, 0, 6.3); ctx.fill();
      ctx.fillStyle = env.night > 0.3 ? '#ffe9a8' : '#b9b9b0'; ctx.beginPath(); ctx.arc(l.x, l.y, 2.6, 0, 6.3); ctx.fill();
    }
    for (const g of gulls) {
      const a = t * g.sp + g.ph, gx = g.cx + Math.cos(a) * g.rx, gy = g.cy + Math.sin(a) * g.ry;
      if (gx < vis.x0 - 40 || gx > vis.x1 + 40 || gy < vis.y0 - 40 || gy > vis.y1 + 40) continue;
      const hd = Math.atan2(Math.cos(a) * g.ry, -Math.sin(a) * g.rx);
      const flap = Math.sin(t * 7 + g.ph) * 0.5;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.translate(gx + 16, gy + 22); ctx.rotate(hd);
      ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, 6.3); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(hd);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(-3, -13 - flap * 6); ctx.lineTo(3, -2); ctx.moveTo(0, 1); ctx.lineTo(-3, 13 + flap * 6); ctx.lineTo(3, 2); ctx.fill();
      ctx.fillStyle = '#e8a33a'; ctx.fillRect(8, -1, 3, 2);
      ctx.restore();
    }
  }

  function fishingLights() { return lamps; }

  return {
    PIER, DIVE, PADDLE_SPAWN, PREP_SPAWN, SPOTS, freeSpot, updateSchools, schoolAt, PROM_Y1, PORT_FENCE_X, buildings,
    shoreY, depthAt, habitatAt, canWalk, canPaddle, inPier,
    drawSea, drawLand, drawBuoys, drawTall, fishingLights,
    lamps,
  };
})();
