/* Mundo: geometría de la costa de Málaga, fondos marinos y dibujo del mapa */
window.G = window.G || {};

G.World = (function () {
  const U = G.U, PXM = G.PXM, WD = G.WORLD;
  const rng = U.rng(777);

  const PROM_Y0 = 1340, PROM_Y1 = 1480;
  const FENCE_L = WD.fenceL, PORT_FENCE_X = WD.fenceR;

  /* ---- La Costa del Sol, de izquierda (Benalmádena) a derecha (Cabopino) ---- */
  const ZONES = [
    { id: 'puerto_ben', x0: 0, x1: 560, name: 'Puerto de Benalmádena', prom: 'port', beach: 'port' },
    { id: 'ben_pto', x0: 560, x1: 1100, name: 'Benalmádena · AnimalLife', prom: 'paseo', beach: 'sand' },
    { id: 'ben_playa', x0: 1100, x1: 1500, name: 'Playa de Benalmádena', prom: 'paseo', beach: 'sand' },
    { id: 'ben_rocas', x0: 1500, x1: 2080, name: 'Rocas y buceo de Benalmádena', prom: 'paseo', beach: 'rock' },
    { id: 'espigon', x0: 2080, x1: 2300, name: 'Espigón en T', prom: 'paseo', beach: 'sand' },
    { id: 'puerto_fue', x0: 2300, x1: 2800, name: 'Puerto de Fuengirola', prom: 'portmid', beach: 'port' },
    { id: 'fuengirola', x0: 2800, x1: 4100, name: 'Fuengirola · Paseo y tiendas', prom: 'paseo', beach: 'sand' },
    { id: 'castillo', x0: 4100, x1: 4500, name: 'Playa del Castillo Sohail', prom: 'paseo', beach: 'sand' },
    { id: 'faro', x0: 4500, x1: 5000, name: 'Faro de Calaburras', prom: 'none', beach: 'rock' },
    { id: 'rocas1', x0: 5000, x1: 5600, name: 'Calas con rocas', prom: 'none', beach: 'rock' },
    { id: 'nudista', x0: 5600, x1: 6100, name: 'Playa naturista', prom: 'none', beach: 'nude' },
    { id: 'sendero', x0: 6100, x1: 6600, name: 'Sendero de madera', prom: 'wood', beach: 'sand' },
    { id: 'cala', x0: 6600, x1: 8300, name: 'Cala de Mijas', prom: 'wood', beach: 'sand' },
    { id: 'bombo', x0: 8300, x1: 8600, name: 'El Bombo', prom: 'wood', beach: 'sand' },
    { id: 'rocas2', x0: 8600, x1: 9300, name: 'Posidonia y chiringuitos', prom: 'none', beach: 'rock', posi: true },
    { id: 'piedra', x0: 9300, x1: 9900, name: 'Playa de piedra', prom: 'none', beach: 'stone' },
    { id: 'puerto_cab', x0: 9900, x1: 10400, name: 'Puerto de Cabopino', prom: 'port', beach: 'port' },
  ];
  function zoneAt(x) { for (const z of ZONES) if (x >= z.x0 && x < z.x1) return z; return ZONES[ZONES.length - 1]; }
  const MID_PORT = ZONES.find(z => z.prom === 'portmid');
  const PORT_ZONES = ZONES.filter(z => z.beach === 'port');
  function sampler(pred) {
    const segs = ZONES.filter(pred), tot = segs.reduce((a, z) => a + z.x1 - z.x0, 0);
    return (r) => { let v = r() * tot; for (const z of segs) { const l = z.x1 - z.x0; if (v < l) return z.x0 + v; v -= l; } return segs[0].x0 + 10; };
  }

  /* Espigón de piedra en forma de T, muy cerca del puerto de Fuengirola */
  const PIERS = [{ x0: 2162, x1: 2218, y0: 800, y1: 1004 }, { x0: 2084, x1: 2296, y0: 760, y1: 814 }];
  const PIER = { x0: 2084, x1: 2296, y0: 760, y1: 1004 };
  const DIVES = [{ x: 1720, y: 1030 }, { x: 1880, y: 1030 }, { x: 2000, y: 1030 }];
  const DIVE = { x: DIVES[0].x, y: DIVES[0].y };
  const PADDLE_SPAWN = { x: 0, y: 1040 };
  const PREP_SPAWN = { x: 0, y: 1420 };
  const LANDMARKS = [];   // obstáculos redondos: faro, torreón...

  const rockSegs = ZONES.filter(z => z.beach === 'rock').map(z => [z.x0, z.x1]);
  function rockyAmp(x) {
    let a = 0;
    for (const s of rockSegs) a = Math.max(a, U.smooth(U.clamp((x - s[0]) / 90, 0, 1)) * (1 - U.smooth(U.clamp((x - (s[1] - 90)) / 90, 0, 1))));
    return a;
  }
  const bump = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
  function shoreY(x) {
    const r = rockyAmp(x);
    return WD.shore + 10 * Math.sin(x / 190) + 6 * Math.sin(x / 61 + 1) + r * (12 * Math.sin(x / 23) + 9 * Math.sin(x / 9.7))
      - 150 * bump(x, 4780, 150) + 60 * bump(x, 5850, 190) - 45 * bump(x, 8470, 110);
  }
  const SPOTS = [
    { id: 'ben', name: 'Benalmádena · Puerto', sub: 'Arena', x: 760, y: 0, icon: '⚓' },
    { id: 'benplaya', name: 'Playa de Benalmádena', sub: 'Arena', x: 1300, y: 0, icon: '🏖️' },
    { id: 'benrocas', name: 'Rocas y buceo', sub: 'Rocas', x: 1790, y: 0, icon: '🪨' },
    { id: 'espigon', name: 'Espigón en T', sub: 'Espigón de piedra', x: 2190, y: 790, icon: '🧱' },
    { id: 'fuengirola', name: 'Playa de Fuengirola', sub: 'Arena', x: 3300, y: 0, icon: '🏖️' },
    { id: 'castillo', name: 'Castillo Sohail', sub: 'Arena', x: 4300, y: 0, icon: '🏰' },
    { id: 'faro', name: 'Faro de Calaburras', sub: 'Rocas', x: 4780, y: 0, icon: '🗼' },
    { id: 'rocas1', name: 'Calas con rocas', sub: 'Rocas', x: 5300, y: 0, icon: '🪨' },
    { id: 'nudista', name: 'Playa naturista', sub: 'Arena', x: 5850, y: 0, icon: '☀️' },
    { id: 'sendero', name: 'Sendero de madera', sub: 'Arena', x: 6350, y: 0, icon: '🪵' },
    { id: 'cala', name: 'Cala de Mijas', sub: 'Arena', x: 7000, y: 0, icon: '🏖️' },
    { id: 'torreon', name: 'Torreón de la Cala', sub: 'Arena', x: 7600, y: 0, icon: '🏯' },
    { id: 'bombo', name: 'El Bombo', sub: 'Arena', x: 8450, y: 0, icon: '🥁' },
    { id: 'posidonia', name: 'Posidonia y chiringuitos', sub: 'Posidonia', x: 8950, y: 0, icon: '🌿' },
    { id: 'piedra', name: 'Playa de piedra', sub: 'Piedra', x: 9600, y: 0, icon: '⚫' },
    { id: 'cabopino', name: 'Puerto de Cabopino', sub: 'Bloqueado', x: 9850, y: 0, icon: '⚓', locked: true },
  ];
  for (const s of SPOTS) if (!s.y) s.y = shoreY(s.x) + 70;
  function nearestSpot(x) { let b = null, bd = 1e9; for (const s of SPOTS) { if (s.locked) continue; const d = Math.abs(s.x - x); if (d < bd) { bd = d; b = s; } } return b; }

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
  // Rocas de las zonas rocosas
  for (const z of ZONES) {
    if (z.beach !== 'rock') continue;
    const len = z.x1 - z.x0;
    for (let i = 0; i < len / 17; i++) addBlob(z.x0 + 30 + rng() * (len - 60), rng() * 38, 22 + rng() * 48, 'R');
    for (let i = 0; i < len / 90; i++) addBlob(z.x0 + rng() * len, 60 + rng() * 120, 50 + rng() * 60, 'R');
  }
  // Fondo de roca en la base del espigón en T y su cabeza
  addBlob(2190, 56, 46, 'R'); addBlob(2120, 40, 40, 'R'); addBlob(2270, 38, 36, 'R'); addBlob(2190, 20, 55, 'R');
  // Posidonia: solo en las calas de los chiringuitos, que es donde es realista
  for (const z of ZONES) {
    if (!z.posi) continue;
    const len = z.x1 - z.x0;
    for (let i = 0; i < 30; i++) addBlob(z.x0 + rng() * len, 3 + rng() * 60, 40 + rng() * 70, 'P');
    for (let i = 0; i < 4; i++) addBlob(z.x0 + rng() * len, 70 + rng() * 40, 60 + rng() * 40, 'P');
  }
  // Algunos arrecifes sueltos en zonas de arena y piedra
  const arrX = sampler(z => z.beach === 'sand' || z.beach === 'stone' || z.beach === 'nude');
  for (let i = 0; i < 40; i++) addBlob(arrX(rng), 55 + rng() * 110, 30 + rng() * 40, 'R');
  for (let i = 0; i < 24; i++) addBlob(arrX(rng), 8 + rng() * 40, 30 + rng() * 40, 'R');

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
  function inPier(x, y, pad = 0) { for (const p of PIERS) if (x > p.x0 - pad && x < p.x1 + pad && y > p.y0 - pad && y < p.y1 + pad) return true; return false; }
  function canWalk(x, y, swell) {
    if (x < FENCE_L + 24 || x > PORT_FENCE_X - 24) return false;
    if (MID_PORT && x > MID_PORT.x0 - 10 && x < MID_PORT.x1 + 10 && y < PROM_Y0 - 10) return false;
    const tip = swell >= 3 ? 880 : 740;
    for (const p of PIERS) if (x > p.x0 + 8 && x < p.x1 - 8 && y > Math.max(tip, p.y0) && y < p.y1) return true;
    if (y > PROM_Y1 - 16) return false;
    for (const l of LANDMARKS) if (Math.hypot(x - l.x, y - l.y) < l.r) return false;
    return y > shoreY(x) - 8 && !hitUmbrella(x, y) && !hitTowel(x, y);
  }
  /* Toallas: rectángulo girado (18 x 30) algo ensanchado para el personaje */
  function hitTowel(x, y) {
    for (const u of towels) {
      if (Math.abs(u.x - x) > 24 || Math.abs(u.y - y) > 24) continue;
      const dx = x - u.x, dy = y - u.y, ca = Math.cos(-u.a), sa = Math.sin(-u.a);
      const lx = dx * ca - dy * sa, ly = dx * sa + dy * ca;
      if (Math.abs(lx) < 9 + 6 && Math.abs(ly) < 15 + 6) return u;
    }
    return null;
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
    if (x < FENCE_L + 20 || x > PORT_FENCE_X - 30) return false;
    if (MID_PORT && x > MID_PORT.x0 - 20 && x < MID_PORT.x1 + 20) return false;
    if (y < G.BUOY_Y + 16) return false;
    if (inPier(x, y, 14)) return false;
    return y < shoreY(x) - 14;
  }

  /* ---- Decoración estática ---- */
  const shoreRocks = [];
  for (const z of ZONES) {
    if (z.beach !== 'rock') continue;
    for (let i = 0; i < (z.x1 - z.x0) / 6.5; i++) {
      const x = z.x0 + rng() * (z.x1 - z.x0);
      if (rockyAmp(x) < 0.15) continue;
      shoreRocks.push({ x, y: shoreY(x) + (rng() * 70 - 38), r: 10 + rng() * 26, a: rng() * 6, k: 0.6 + rng() * 0.4 });
    }
  }
  const umbrellas = [];
  const towels = [];
  const umbCols = ['#e8503a', '#f2b632', '#2f9fd8', '#ffffff', '#e86a9a', '#3fbf86'];
  const DENS = { sand: 1 / 46, rock: 1 / 280, nude: 1 / 110, stone: 1 / 170 };
  for (const z of ZONES) {
    const dens = DENS[z.beach]; if (!dens) continue;
    const n = Math.round((z.x1 - z.x0) * dens);
    for (let i = 0; i < n; i++) {
      const x = z.x0 + 24 + rng() * (z.x1 - z.x0 - 48);
      const y = shoreY(x) + (z.prom === 'paseo' ? 70 + rng() * 190 : 40 + rng() * 80);
      umbrellas.push({ x, y, r: 16 + rng() * 6, c: U.pick(umbCols), c2: U.pick(umbCols) });
      towels.push({ x: x + 26 + rng() * 14, y: y + rng() * 20 - 8, a: rng() * 0.8 - 0.4, c: U.pick(umbCols), nude: z.beach === 'nude' });
    }
  }
  const palms = [];
  const lamps = [];
  for (const z of ZONES) {
    if (z.prom === 'paseo') {
      for (let x = z.x0 + 60; x < z.x1 - 30; x += 210 + rng() * 60) palms.push({ x, y: PROM_Y0 + 4 + rng() * 16, s: 0.9 + rng() * 0.4, a: rng() * 6 });
      for (let x = z.x0 + 80; x < z.x1 - 30; x += 230) lamps.push({ x, y: PROM_Y0 + 44, r: 105 });
    } else if (z.prom === 'wood') {
      for (let x = z.x0 + 100; x < z.x1 - 30; x += 330) { lamps.push({ x, y: PROM_Y0 + 62, r: 90 }); }
      for (let x = z.x0 + 150; x < z.x1 - 30; x += 520 + rng() * 120) palms.push({ x, y: PROM_Y0 + 20 + rng() * 20, s: 0.75 + rng() * 0.3, a: rng() * 6 });
    }
  }
  lamps.push({ x: 2150, y: 790, r: 120 }, { x: 2190, y: 880, r: 100 }, { x: 1750, y: 1050, r: 80 });

  const roofCols = ['#c4573a', '#b24a30', '#cf6a43', '#a8452c'];
  const wallCols = ['#f1e3c4', '#e9c9a0', '#efd5c0', '#f6efe0', '#e6b98c', '#d9e4e6'];
  const buildings = [];
  (function () {
    const named = [
      { x: 600, w: 290, h: 215, label: 'ANIMALLIFE · ACUARIO', kind: 'animal', wall: '#d7eef7', awn: '#1d8fc9' },
      { x: 920, w: 170, label: 'PUERTO · KAYAKS', kind: 'kayak', wall: '#dde9f2', awn: '#2a5d9e' },
      { x: 1640, w: 170, label: 'ARPÓN Y BUCEO', kind: 'spear', wall: '#f7e6d3', awn: '#e07a2b' },
      { x: 2860, w: 170, label: 'EL CEBO · BÁSICOS', kind: 'bait', wall: '#e7f1df', awn: '#2f9e5b' },
      { x: 3038, w: 170, label: 'PESCA EL ANZUELO', kind: 'rods', wall: '#e4ecf7', awn: '#2d6fc4' },
      { x: 3216, w: 170, label: 'PADDLE SURF', kind: 'paddle', wall: '#def3f3', awn: '#1fb5c4' },
      { x: 3420, w: 190, label: 'LONJA · PROVEEDORES', kind: 'lonja', wall: '#e1e9ea', awn: '#2c8c6a' },
      { x: 3640, w: 190, label: 'MODA MARINERA', kind: 'fashion', wall: '#f4e1ec', awn: '#c2477e' },
      { x: 3850, w: 210, h: 150, label: 'TU PESCADERÍA', kind: 'stall', wall: '#eef3f6', awn: '#2d7fc4' },
      { x: 4130, w: 340, h: 215, label: 'CASTILLO SOHAIL', kind: 'castle', wall: '#d9c8a0', awn: null },
      { x: 6700, w: 160, h: 120, label: 'CHIRINGUITO · CEBOS', kind: 'bait', wall: '#f4e7c8', awn: '#e8743b' },
      { x: 7950, w: 160, h: 120, label: 'CHIRINGUITO DEL SOL', kind: 'bait', wall: '#e9f1d8', awn: '#f2b632' },
      { x: 8820, w: 160, h: 120, label: 'CHIRINGUITO EL BOMBO', kind: 'bait', wall: '#f4e1d0', awn: '#c2477e' },
      { x: 9540, w: 170, h: 130, label: 'AVÍOS DE CABOPINO', kind: 'rods', wall: '#e4ecf7', awn: '#2d6fc4' },
    ];
    for (const n of named) buildings.push({ y: PROM_Y1, ...n, h: n.h || 190 });
    let x = 10;
    while (x < WD.w) {
      const w = 110 + rng() * 90, z = zoneAt(x + w / 2);
      if (z.prom === 'paseo' && !named.some(n => x < n.x + n.w + 6 && x + w > n.x - 6)) {
        buildings.push({ x, y: PROM_Y1, w, h: 150 + rng() * 60, wall: U.pick(wallCols), roof: U.pick(roofCols), awn: rng() < 0.4 ? U.pick(umbCols) : null });
      }
      x += w + 6;
    }
  })();
  const FARO = { x: 4780, y: shoreY(4780) + 34 }, TORREON = { x: 7500, y: 0 }, BOMBO = { x: 8450, y: 0 };
  TORREON.y = shoreY(7500) + 110; BOMBO.y = shoreY(8450) + 70;
  LANDMARKS.push({ x: FARO.x, y: FARO.y, r: 28 }, { x: TORREON.x, y: TORREON.y, r: 36 }, { x: BOMBO.x, y: BOMBO.y, r: 30 });
  lamps.push({ x: FARO.x, y: FARO.y, r: 260 });
  const B_OF = (k) => buildings.find(b => b.kind === k);
  PREP_SPAWN.x = B_OF('bait').x + 85;
  PADDLE_SPAWN.x = B_OF('paddle').x + 95;
  const LONJA_X = B_OF('lonja').x, STALL_X = B_OF('stall').x;
  const gulls = [];
  for (let i = 0; i < 14; i++) gulls.push({ cx: 600 + rng() * (WD.w - 1200), cy: 500 + rng() * 800, rx: 120 + rng() * 260, ry: 50 + rng() * 120, sp: 0.15 + rng() * 0.2, ph: rng() * 6 });
  const swimmers = [];
  const swimX = sampler(z => z.beach === 'sand' || z.beach === 'nude');
  for (let i = 0; i < 56; i++) swimmers.push({ x: swimX(rng), d: 5 + rng() * 14, ph: rng() * 6, c: U.pick(['#f2c9a0', '#d9a074', '#f0b88a']), cap: U.pick(umbCols) });
  for (const s of swimmers) { s.arr = 9.2 + rng() * 1.5; s.lv = 19.3 + rng() * 0.5; }
  /* ¿hay un bañista justo en este punto del agua? (para cuando el flotador lo toca) */
  function swimmerAt(px, py, t, hour) {
    for (const s of swimmers) {
      if (hour < s.arr || hour > s.lv || Math.abs(px - s.x) > 40) continue;
      const x = s.x + Math.sin(t * 0.4 + s.ph) * 20, y = shoreY(s.x) - s.d * PXM + Math.sin(t * 1.3 + s.ph) * 3;
      if (Math.hypot(px - x, py - y) < 17) return { x, y };
    }
    return null;
  }
  const cars = [];
  for (let i = 0; i < 12; i++) cars.push({ x: rng() * WD.w, s: (rng() < 0.5 ? -1 : 1) * (70 + rng() * 50), c: U.pick(['#d0453a', '#3a6fd0', '#e8e8e8', '#f2b632', '#2f9e5b', '#2b3a55']) });
  for (const z of PORT_ZONES) { z.boats = []; const n = z === MID_PORT ? 14 : 10; for (let i = 0; i < n; i++) z.boats.push({ x: z.x0 + 50 + (i % 5) * ((z.x1 - z.x0 - 100) / 5) + rng() * 30, y: 560 + Math.floor(i / 5) * 130 + rng() * 40, a: rng() * 0.4 - 0.2, c: U.pick(['#ffffff', '#f4efe2', '#e7f1f5']), s: 0.9 + rng() * 0.5 }); }

  /* ---- Gente de la playa y el paseo (llegan por la mañana y se van a las 20:00) ---- */
  const rngP = U.rng(4242);
  const SKIN = ['#f2c9a0', '#d9a074', '#f0b88a', '#c68863', '#8d5a3b'];
  const SHIRT = ['#e8503a', '#f2b632', '#2f9fd8', '#ffffff', '#e86a9a', '#3fbf86', '#7a5ad8', '#2b3a55', '#f08a3c'];
  const HAIR = ['#2a1d14', '#5a3a22', '#c9a24a', '#111', '#8a8a8a'];
  const people = [];
  const beachX = sampler(z => z.beach === 'sand' || z.beach === 'nude' || z.beach === 'stone'), promX = sampler(z => z.prom === 'paseo' || z.prom === 'wood');
  for (let i = 0; i < 120; i++) {
    const beach = i % 5 < 2;
    const cx = beach ? beachX(rngP) : promX(rngP);
    people.push({ nude: beach && zoneAt(cx).beach === 'nude',
      beach, cx, rx: beach ? 70 + rngP() * 200 : 90 + rngP() * 380, off: beach ? 22 + rngP() * 40 : PROM_Y0 + 34 + rngP() * 70,
      sp: 0.1 + rngP() * 0.13, ph: rngP() * 6.28, skin: SKIN[(rngP() * SKIN.length) | 0], shirt: SHIRT[(rngP() * SHIRT.length) | 0], hair: HAIR[(rngP() * HAIR.length) | 0],
      arr: 8.2 + rngP() * 1.6, lv: 19.5 + rngP() * 0.55,
    });
  }
  for (const p of people) if (p.nude) p.shirt = p.skin;
  const EXIT_DUR = 0.55;
  function pPos(p, t) {
    const a = t * p.sp + p.ph;
    const x = U.clamp(p.cx + Math.sin(a) * p.rx, FENCE_L + 40, PORT_FENCE_X - 40), vx = Math.cos(a);
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
  /* Posición actual de una persona (null si no está en la playa); incluye el empujón de un choque */
  function personPos(p, hour, t) {
    const al = personAlpha(p, hour);
    if (al == null) return null;
    let { x, y, hd } = pPos(p, t);
    if (hour < p.arr + 0.25 || hour >= p.lv) {
      // llegando o marchándose por el paseo
      const u = hour >= p.lv ? U.smooth(U.clamp((hour - p.lv) / EXIT_DUR, 0, 1)) : 1 - U.smooth(U.clamp((hour - p.arr) / 0.25, 0, 1));
      const ex = p.cx, ey = PROM_Y1 - 8;
      hd = Math.atan2(ey - y, ex - x);
      x = U.lerp(x, ex, u); y = U.lerp(y, ey, u);
    }
    if (p.st != null) { const k = Math.max(0, 1 - (t - p.st) / 0.9); if (k > 0) { x += p.sx * k; y += p.sy * k; } }
    return { x, y, hd, al, p };
  }
  function peopleNow(hour, t) {
    const out = [];
    for (const p of people) { const r = personPos(p, hour, t); if (r) out.push(r); }
    return out;
  }
  /* Bañistas tumbados que están en su toalla ahora */
  function sunbathersNow(hour) { return towels.filter(tw => tw.lie && hour >= tw.arr && hour <= tw.lv + 0.3); }
  function drawPeople(ctx, vis, env) {
    const hour = env.hour, t = env.t;
    for (const p of people) {
      const r = personPos(p, hour, t);
      if (!r) continue;
      if (r.x < vis.x0 - 30 || r.x > vis.x1 + 30 || r.y < vis.y0 - 30 || r.y > vis.y1 + 30) continue;
      drawPerson(ctx, r.x, r.y, r.hd, t, p, r.al, 0.74);
    }
  }
  // bañistas tumbados en las toallas
  for (const tw of towels) {
    tw.lie = rngP() < 0.7; tw.skin = SKIN[(rngP() * SKIN.length) | 0]; tw.suit = SHIRT[(rngP() * SHIRT.length) | 0]; tw.arr = 9 + rngP() * 2; tw.lv = 19.2 + rngP() * 0.7;
  }

  /* ---- Cangrejos de la orilla: pocos, huyen del jugador ---- */
  const crabs = [];
  const crabX = sampler(z => z.beach === 'sand' || z.beach === 'rock' || z.beach === 'stone');
  for (let i = 0; i < 9; i++) crabs.push({ x: crabX(rngP), off: 16 + rngP() * 58, rg: 22 + rngP() * 60, sp: 0.2 + rngP() * 0.35, ph: rngP() * 6.28, fx: 0, lt: 0, flee: 0, sc: 0.9 + rngP() * 0.4 });
  function drawCrabs(ctx, vis, env) {
    const t = env.t, P = G.P;
    for (const c of crabs) {
      const dt = Math.min(0.1, Math.max(0, t - c.lt)); c.lt = t;
      const x = c.x + Math.sin(t * c.sp + c.ph) * c.rg + c.fx;
      const y = shoreY(x) + c.off + Math.sin(t * 2 + c.ph) * 1.2;
      if (x < vis.x0 - 20 || x > vis.x1 + 20 || y < vis.y0 - 20 || y > vis.y1 + 20) continue;
      const dxp = x - P.x, dyp = y - P.y, d = Math.hypot(dxp, dyp);
      if (d < 62 && !G.S.onPaddle) { c.fx = U.clamp(c.fx + (dxp >= 0 ? 1 : -1) * 170 * dt * (1.3 - d / 62), -170, 170); c.flee = 0.5; }
      else { c.flee = Math.max(0, c.flee - dt); c.fx *= 1 - Math.min(1, dt * 0.25); }
      const moving = c.flee > 0 || Math.abs(Math.cos(t * c.sp + c.ph)) > 0.6, leg = Math.sin(t * 15 + c.ph) * (moving ? 1.7 : 0.3);
      ctx.save(); ctx.translate(x, y); ctx.scale(c.sc, c.sc);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(1, 2.6, 5.4, 2.3, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#a83a28'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(s * 3, -1 + i * 1.6); ctx.lineTo(s * (6 + (i % 2 ? leg : -leg)), -2 + i * 2.2); ctx.stroke(); }
      ctx.strokeStyle = '#c4492f'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-3.5, -2); ctx.lineTo(-5.6, -4.3); ctx.moveTo(3.5, -2); ctx.lineTo(5.6, -4.3); ctx.stroke();
      ctx.fillStyle = '#d9573a'; ctx.beginPath(); ctx.arc(-5.8, -5, 2.1, 0, 6.3); ctx.arc(5.8, -5, 2.1, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#e0603f'; ctx.beginPath(); ctx.ellipse(0, 0, 4.8, 3.4, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-1.6, -3.1, 0.7, 0, 6.3); ctx.arc(1.6, -3.1, 0.7, 0, 6.3); ctx.fill();
      ctx.restore();
    }
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
      // el banco entero queda lejos de la arena: su borde más cercano a la orilla está a >= 8 m
      const rad = 18 + Math.random() * 14, minD = (rad * 0.75 + 58) / PXM;
      const x = FENCE_L + 60 + Math.random() * (PORT_FENCE_X - FENCE_L - 120), depth = minD + Math.pow(Math.random(), 1.5) * (90 - minD);
      const y = shoreY(x) - depth * PXM;
      if (inPier(x, y, 30) || y < G.BUOY_Y + 30 || zoneAt(x).beach === 'port') continue;
      const sp = pickSchoolSpecies(x, y);
      if (!sp) continue;
      s.x = x; s.y = y; s.depth = depth; s.sp = sp; s.r = rad; s.n = 1 + (Math.random() < 0.35 ? 1 : 0);
      s.life = 70 + Math.random() * 110; s.born = first ? t - Math.random() * s.life * 0.8 : t; s.dir = Math.random() < 0.5 ? 1 : -1; s.seed = Math.random() * 100;
      return;
    }
    s.sp = null; s.born = t; s.life = 5;
  }
  for (let i = 0; i < 22; i++) { const s = {}; spawnSchool(s, 0, true); schools.push(s); }
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
      // solo se distinguen de cerca y muy tenues: hay que buscar las zonas
      const dd = Math.hypot(G.P.x - s.x, G.P.y - s.y), prox = U.clamp((420 - dd) / 260, 0, 1);
      const base = al * U.clamp(1.05 - s.depth / 120, 0.4, 1) * 0.17 * prox;
      if (base < 0.01) continue;
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

  const ICON_OF = { bait: 'worm', rods: 'rod', spear: 'mask', paddle: 'board', kayak: 'kayak', fashion: 'shirt', stall: 'fish', lonja: 'anchor', animal: 'whale' };

  function drawCastleBody(ctx, b) {
    const { x, y, w, h } = b;
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + 8, y + 10, w, h);
    ctx.fillStyle = '#cdb98a'; ctx.fillRect(x, y + 56, w, h - 56);
    ctx.fillStyle = '#b7a272'; for (let cx = x; cx < x + w - 8; cx += 18) ctx.fillRect(cx, y + 48, 10, 10);
    ctx.fillStyle = 'rgba(80,60,30,0.22)'; ctx.fillRect(x, y + 56, w, 6);
    for (let cy = y + 76; cy < y + h; cy += 20) { ctx.strokeStyle = 'rgba(80,60,30,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + w, cy); ctx.stroke(); }
    // torres redondas
    for (const tx of [x + 30, x + w - 30]) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(tx + 6, y + 70, 34, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#c1ac7a'; ctx.beginPath(); ctx.arc(tx, y + 64, 34, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#a99468'; for (let a = 0; a < 12; a++) { ctx.save(); ctx.translate(tx, y + 64); ctx.rotate(a / 12 * 6.2832); ctx.fillRect(28, -4, 8, 8); ctx.restore(); }
      ctx.fillStyle = '#d9c9a0'; ctx.beginPath(); ctx.arc(tx, y + 64, 24, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#7a3a2a'; ctx.beginPath(); ctx.arc(tx, y + 64, 10, 0, 6.3); ctx.fill();
    }
    // torre del homenaje
    const kx = x + w / 2 - 46;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(kx + 8, y + 14, 92, 84);
    ctx.fillStyle = '#d6c496'; ctx.fillRect(kx, y + 6, 92, 84);
    ctx.fillStyle = '#b7a272'; for (let cx = kx; cx < kx + 90; cx += 14) { ctx.fillRect(cx, y, 8, 8); }
    ctx.fillStyle = '#b5543a'; ctx.fillRect(kx + 14, y + 20, 64, 52);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let ty = y + 26; ty < y + 72; ty += 7) ctx.fillRect(kx + 14, ty, 64, 1.5);
    // bandera
    ctx.fillStyle = '#3a2f26'; ctx.fillRect(kx + 44, y - 18, 2, 24);
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(kx + 46, y - 18); ctx.lineTo(kx + 62 + Math.sin(G.env.t * 3) * 2, y - 14); ctx.lineTo(kx + 46, y - 8); ctx.fill();
    // puerta
    ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 16, y + h); ctx.lineTo(x + w / 2 - 16, y + h - 34); ctx.arc(x + w / 2, y + h - 34, 16, Math.PI, 0); ctx.lineTo(x + w / 2 + 16, y + h); ctx.fill();
  }
  function decorAnimal(ctx, b) {
    const { x, y, w, h } = b, t = G.env.t;
    const mx = x + 12, my = y + 76, mw = w - 24, mh = h - 92;
    const g = ctx.createLinearGradient(0, my, 0, my + mh); g.addColorStop(0, '#46b6e6'); g.addColorStop(1, '#14639a');
    ctx.fillStyle = g; ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#f4f1e6'; ctx.lineWidth = 3; ctx.strokeRect(mx, my, mw, mh);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 9; i++) { const bx = mx + 14 + i * (mw - 28) / 8 + Math.sin(t + i) * 3, by = my + mh - ((t * 14 + i * 23) % mh); ctx.beginPath(); ctx.arc(bx, by, 2 + (i % 3), 0, 6.3); ctx.fill(); }
    G.Icons.draw(ctx, 'whale', mx + 52, my + 34, 58);
    G.Icons.draw(ctx, 'fish', mx + mw * 0.52, my + 22, 30); G.Icons.draw(ctx, 'sardine', mx + mw * 0.6, my + 54, 26); G.Icons.draw(ctx, 'fish', mx + mw * 0.45, my + 62, 22);
    G.Icons.draw(ctx, 'penguin', mx + mw - 78, my + mh - 24, 34); G.Icons.draw(ctx, 'penguin', mx + mw - 48, my + mh - 20, 30); G.Icons.draw(ctx, 'penguin', mx + mw - 20, my + mh - 24, 34);
    G.Icons.draw(ctx, 'crab', mx + 30, my + mh - 14, 22); G.Icons.draw(ctx, 'shell', mx + 70, my + mh - 12, 20);
  }

  function drawBuilding(ctx, b) {
    const { x, y, w, h } = b;
    if (b.kind === 'castle') drawCastleBody(ctx, b); else {
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
    }
    if (b.kind === 'animal') decorAnimal(ctx, b);
    if (b.label) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + w / 2 - 24, y - 7, 48, 7);
      ctx.fillStyle = b.awn; ctx.fillRect(x + w / 2 - 22, y - 6, 44, 5);
      ctx.fillStyle = '#16384f'; const lw = w - 20;
      ctx.fillRect(x + 10, y + 42, lw, 22);
      ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.label, x + w / 2, y + 53);
      if (b.kind !== 'castle') G.Icons.draw(ctx, ICON_OF[b.kind] || 'anchor', x + w / 2, y + 112, 38);
      ctx.font = '700 11px system-ui, sans-serif';
      drawStand(ctx, b, x, y, w);
      if (b.kind === 'castle') return;
      const open = G.shopOpen(b.kind);
      ctx.font = '700 10px system-ui'; ctx.fillStyle = open ? '#2fbf7a' : '#e0584a';
      ctx.fillText(open ? 'ABIERTO' : 'CERRADO', x + w / 2, y + 78);
      if (open) {
        const bob = Math.sin(G.env.t * 4) * 3;
        ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 9, y - 40 + bob); ctx.lineTo(x + w / 2 + 9, y - 40 + bob); ctx.lineTo(x + w / 2, y - 24 + bob); ctx.closePath(); ctx.fill();
      }
    }
  }

  /* Puesto delante de cada tienda para reconocerla de lejos */
  function drawStand(ctx, b, x, y, w) {
    const L = x + w * 0.2, R = x + w * 0.8, yy = y - 34;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const crate = (cx) => { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(cx - 16, yy + 18, 34, 5); ctx.fillStyle = '#8f6035'; ctx.fillRect(cx - 16, yy + 6, 32, 15); ctx.fillStyle = '#b98450'; ctx.fillRect(cx - 16, yy + 6, 32, 4); };
    const ic = (n, cx, dy, sz) => G.Icons.draw(ctx, n, cx, yy + dy, sz || 18);
    if (b.kind === 'bait') { crate(L); crate(R); ic('worm', L - 6, 4, 20); ic('crab', L + 9, 3, 20); ic('sardine', R - 6, 4, 22); ic('cooler', R + 9, 3, 20); }
    else if (b.kind === 'rods') {
      for (const cx of [L, R]) { ctx.fillStyle = '#6b4a2b'; ctx.fillRect(cx - 14, yy + 17, 28, 4); ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { ctx.strokeStyle = ['#5a3b22', '#2d6fc4', '#c9a24a', '#2a2a2a'][i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 12 + i * 8, yy + 18); ctx.lineTo(cx - 9 + i * 8, yy - 10); ctx.stroke(); } }
      ic('spool', L + 24, 8, 16); ic('hook', R - 24, 8, 16);
    } else if (b.kind === 'spear') {
      for (const cx of [L, R]) { ctx.fillStyle = '#4a4a50'; ctx.fillRect(cx - 14, yy + 17, 28, 4); for (let i = 0; i < 4; i++) { ctx.strokeStyle = '#8c929a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 12 + i * 8, yy + 18); ctx.lineTo(cx - 11 + i * 8, yy - 12); ctx.stroke(); ctx.fillStyle = '#d9dde3'; ctx.fillRect(cx - 13 + i * 8, yy - 15, 3, 5); } }
      ic('mask', L + 24, 8, 18); ic('fin', R - 24, 8, 18);
    } else if (b.kind === 'paddle') {
      for (const cx of [L, R]) for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#f7f4ea', '#2bb5c9', '#f0a040'][(i + (cx === R ? 1 : 0)) % 3]; ctx.beginPath(); ctx.ellipse(cx - 12 + i * 12, yy + 4, 5, 20, 0.12 * (i - 1), 0, 6.3); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.stroke(); }
    } else if (b.kind === 'kayak') {
      ic('kayak', L, 6, 30); ic('anchor', R, 6, 24);
    } else if (b.kind === 'animal') {
      ic('penguin', L, 4, 30); ic('whale', R, 4, 34);
    } else if (b.kind === 'fashion') {
      ic('shirt', L, 6, 24); ic('cap', R, 6, 22);
    }
    ctx.restore();
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
    // suelo de cada zona: paseo, sendero de madera, monte bajo o puerto
    for (const z of ZONES) {
      const a = Math.max(z.x0, vis.x0 - 12), b = Math.min(z.x1, vis.x1 + 12); if (b <= a) continue;
      if (z.prom === 'paseo' || z.prom === 'portmid') {
        { ctx.fillStyle = G.TEX.patterns.paseo; ctx.fillRect(a, PROM_Y0, b - a, PROM_Y1 - PROM_Y0); }
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(a, PROM_Y0, b - a, 4);
        ctx.fillStyle = '#e9dcc0'; ctx.fillRect(a, PROM_Y0 + 4, b - a, 5);
        ctx.fillStyle = '#a79f91'; ctx.fillRect(a, PROM_Y1, b - a, 1720 - PROM_Y1);
        ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(a, PROM_Y1, b - a, 6);
        ctx.fillStyle = '#c9c2b4'; ctx.fillRect(a, 1708, b - a, 12);
      } else if (z.prom === 'wood') {
        ctx.fillStyle = '#d3c298'; ctx.fillRect(a, PROM_Y0 - 20, b - a, PROM_Y1 - PROM_Y0 + 20);
        ctx.fillStyle = '#6f8650'; ctx.fillRect(a, PROM_Y1 - 24, b - a, 1720 - PROM_Y1 + 24);
        for (let x = Math.floor(a / 34) * 34; x < b; x += 34) { ctx.fillStyle = (x / 34) % 3 ? '#5f7843' : '#7d9a58'; ctx.beginPath(); ctx.arc(x + ((x * 7) % 19), PROM_Y1 + 10 + ((x * 13) % 170), 7 + (x % 5), 0, 6.3); ctx.fill(); }
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(a, PROM_Y0 + 44, b - a, 70);
        ctx.fillStyle = '#9a6b3e'; ctx.fillRect(a, PROM_Y0 + 36, b - a, 70);
        for (let px = Math.floor(a / 16) * 16; px < b; px += 16) { ctx.fillStyle = (px / 16) % 2 ? '#a8774a' : '#8f6238'; ctx.fillRect(px, PROM_Y0 + 38, 14, 66); }
        ctx.fillStyle = '#5a3b22'; ctx.fillRect(a, PROM_Y0 + 34, b - a, 4); ctx.fillRect(a, PROM_Y0 + 104, b - a, 4);
        for (let px = Math.floor(a / 60) * 60; px < b; px += 60) { ctx.fillStyle = '#4a3019'; ctx.fillRect(px, PROM_Y0 + 30, 5, 8); ctx.fillRect(px, PROM_Y0 + 104, 5, 8); }
      } else if (z.prom === 'none') {
        ctx.fillStyle = '#c4ad7c'; ctx.fillRect(a, PROM_Y0 - 20, b - a, PROM_Y1 - PROM_Y0 + 20);
        ctx.beginPath();
        for (let x = a; x <= b + 24; x += 24) { const y = shoreY(x) + 150 + Math.sin(x / 37) * 16 + Math.sin(x / 11) * 5; x === a ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.lineTo(b + 24, 1720); ctx.lineTo(a, 1720); ctx.closePath(); ctx.fillStyle = '#7d9158'; ctx.fill();
        for (let x = Math.floor(a / 30) * 30; x < b; x += 30) { const y = shoreY(x) + 170 + ((x * 11) % 260); ctx.fillStyle = (x / 30) % 3 ? '#667c47' : '#93a86a'; ctx.beginPath(); ctx.arc(x + ((x * 5) % 17), y, 6 + (x % 7), 0, 6.3); ctx.fill(); }
        ctx.fillStyle = '#b79f6c'; ctx.fillRect(a, PROM_Y0 + 40, b - a, 46);
        ctx.fillStyle = 'rgba(70,50,20,0.25)'; for (let x = Math.floor(a / 22) * 22; x < b; x += 22) ctx.fillRect(x, PROM_Y0 + 44 + ((x * 3) % 36), 8, 2);
      } else if (z.beach === 'port') {
        ctx.fillStyle = '#8d8f92'; ctx.fillRect(a, 1004, b - a, 1720 - 1004);
      }
      if (z.beach === 'stone') {
        ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = G.TEX.patterns.stone;
        ctx.beginPath(); for (let x = a; x <= b + 24; x += 24) { const y = shoreY(x); x === a ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        for (let x = b + 24; x >= a; x -= 24) ctx.lineTo(x, shoreY(x) + 130 + Math.sin(x / 30) * 10); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    // edificios
    for (const b of buildings) if (b.x < vis.x1 && b.x + b.w > vis.x0) drawBuilding(ctx, b);
    // calle
    ctx.fillStyle = '#4a4d52'; ctx.fillRect(vis.x0, 1720, vis.x1 - vis.x0, 90);
    ctx.fillStyle = '#e8e2c8';
    for (let x = Math.floor(vis.x0 / 80) * 80; x < vis.x1; x += 80) ctx.fillRect(x, 1763, 40, 4);
    ctx.fillStyle = '#6f6b64'; ctx.fillRect(vis.x0, 1810, vis.x1 - vis.x0, 90);
    for (const c of cars) {
      if (c.x > 1e9) continue;
      const cx = ((c.x + c.s * t) % WD.w + WD.w) % WD.w - 100;
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
    // espigón de piedra en forma de T
    for (const p of PIERS) {
      const px = p.x0, pw = p.x1 - p.x0, ph = p.y1 - p.y0;
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(px + 8, p.y0 + 9, pw, ph);
      ctx.fillStyle = G.TEX.patterns.stone; ctx.fillRect(px, p.y0, pw, ph);
      ctx.fillStyle = 'rgba(210,205,195,0.55)'; ctx.fillRect(px + 8, p.y0 + 6, pw - 16, ph - 6);
    }
    for (const p of PIERS) {
      ctx.strokeStyle = 'rgba(60,55,50,0.35)'; ctx.lineWidth = 1;
      if (p.y1 - p.y0 > 100) for (let y = p.y0 + 20; y < p.y1; y += 18) { ctx.beginPath(); ctx.moveTo(p.x0 + 8, y); ctx.lineTo(p.x1 - 8, y); ctx.stroke(); }
      else for (let x = p.x0 + 14; x < p.x1; x += 18) { ctx.beginPath(); ctx.moveTo(x, p.y0 + 6); ctx.lineTo(x, p.y1 - 4); ctx.stroke(); }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse((PIERS[1].x0 + PIERS[1].x1) / 2, PIERS[1].y0 - 2, (PIERS[1].x1 - PIERS[1].x0) / 2 + 4 + Math.sin(t * 1.4) * 2, 12, 0, 0, 6.3); ctx.stroke();
    // zonas de buceo
    drawDiveSpot(ctx, t);
    // puertos y monumentos
    drawPort(ctx, vis, env);
  }

  function drawDiveSpot(ctx, t) {
    for (const D of DIVES) {
      if (Math.abs(D.x - G.P.x) > 900) continue;
      for (const side of [-1, 1]) {
        for (let y = D.y - 20; y > G.BUOY_Y; y -= 76) {
          const bx = D.x + side * 38 + Math.sin(t + y) * 1.5, by = y + Math.sin(t * 1.3 + y) * 1.5;
          ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(bx + 2, by + 2, 5, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx - 1.5, by - 1.5, 1.8, 0, 6.3); ctx.fill();
        }
      }
      ctx.fillStyle = '#3a2f26'; ctx.fillRect(D.x - 14, D.y + 10, 3, 24);
      ctx.save(); ctx.translate(D.x - 11, D.y + 10);
      ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24 + Math.sin(t * 3) * 2, 3); ctx.lineTo(24, 14); ctx.lineTo(0, 15); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 1); ctx.lineTo(22, 14); ctx.lineTo(10, 15); ctx.lineTo(0, 15); ctx.lineTo(0, 6); ctx.fill();
      ctx.restore();
      ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#16384f';
      ctx.fillText('ZONA DE BUCEO', D.x + 6, D.y + 52);
    }
  }

  function drawPortZone(ctx, vis, env, z) {
    if (z.x1 < vis.x0 || z.x0 > vis.x1) return;
    const t = env.t, w = z.x1 - z.x0, locked = z !== MID_PORT;
    // dársena: agua tranquila, rompeolas exterior y diques
    ctx.fillStyle = 'rgba(15,60,80,0.32)'; ctx.fillRect(z.x0, 330, w, 674);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(z.x0, 330, w, 40);
    ctx.fillStyle = G.TEX.patterns.stone; ctx.fillRect(z.x0, 320, w, 40);
    ctx.fillStyle = 'rgba(200,198,190,0.6)'; ctx.fillRect(z.x0, 326, w, 28);
    for (const wx of locked ? [z.x0 === 0 ? z.x1 - 30 : z.x0] : [z.x0, z.x1 - 30]) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(wx + 4, 330, 30, 680);
      ctx.fillStyle = G.TEX.patterns.stone; ctx.fillRect(wx, 320, 30, 684);
      ctx.fillStyle = 'rgba(200,198,190,0.6)'; ctx.fillRect(wx + 6, 326, 18, 672);
    }
    // pantalanes de madera y barcos
    for (let px = z.x0 + 60; px < z.x1 - 60; px += 90) { ctx.fillStyle = '#8a6a42'; ctx.fillRect(px, 600, 10, 400); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(px + 10, 600, 3, 400); }
    for (const b of z.boats) {
      if (b.x < vis.x0 - 60 || b.x > vis.x1 + 60) continue;
      ctx.save(); ctx.translate(b.x, b.y + Math.sin(t + b.x) * 2); ctx.rotate(b.a + Math.sin(t * 0.7 + b.x) * 0.03); ctx.scale(b.s, b.s);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(3, 4, 40, 15, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = b.c; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(-20, -16, 24, -13); ctx.lineTo(44, 0); ctx.lineTo(24, 13); ctx.quadraticCurveTo(-20, 16, -40, 0); ctx.fill();
      ctx.strokeStyle = '#8aa'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#c9d6dc'; ctx.fillRect(-12, -7, 20, 14);
      ctx.restore();
    }
    // explanada del puerto
    ctx.fillStyle = '#8d8f92'; ctx.fillRect(z.x0, 1004, w, (locked ? PROM_Y1 + 400 : PROM_Y0) - 1004);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let x = z.x0; x < z.x1; x += 60) ctx.fillRect(x, 1004, 2, (locked ? PROM_Y1 : PROM_Y0) - 1004);
    const cols = ['#c0392b', '#2471a3', '#1e8449', '#d68910', '#7d3c98'];
    for (let i = 0; i < 10; i++) { const cx = z.x0 + 30 + (i % 5) * 92, cy = 1070 + Math.floor(i / 5) * 110; if (cx + 76 > z.x1 - 30) continue; ctx.fillStyle = cols[i % 5]; ctx.fillRect(cx, cy, 76, 30); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(cx, cy + 25, 76, 5); }
    if (locked) {
      ctx.fillStyle = 'rgba(30,40,55,0.4)'; ctx.fillRect(z.x0, 0, w, PROM_Y1 + 400);
      const fx = z.x0 === 0 ? z.x1 : z.x0;
      for (let y = 320; y < PROM_Y1; y += 40) { ctx.fillStyle = (y / 40) % 2 ? '#222' : '#e3b32d'; ctx.fillRect(fx - 4, y, 8, 40); }
      ctx.fillStyle = '#16384f'; ctx.fillRect(fx - 80, 1110, 160, 58);
      ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(z.name.toUpperCase(), fx, 1130);
      ctx.fillStyle = '#ffd23a'; ctx.fillText('Próximamente', fx + 8, 1153); G.Icons.draw(ctx, 'lock', fx - 46, 1148, 18);
    } else {
      for (const fx of [z.x0, z.x1 - 4]) for (let y = 1004; y < PROM_Y0 - 6; y += 30) { ctx.fillStyle = (y / 30) % 2 ? '#222' : '#e3b32d'; ctx.fillRect(fx, y, 5, 30); }
      ctx.fillStyle = '#16384f'; ctx.fillRect(z.x0 + w / 2 - 110, 1170, 220, 26);
      ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('PUERTO DEPORTIVO · ' + z.name.replace('Puerto de ', '').toUpperCase(), z.x0 + w / 2, 1187);
      for (let px = z.x0 + 40; px < z.x1 - 40; px += 70) { ctx.fillStyle = '#2b2f36'; ctx.beginPath(); ctx.arc(px, 1010, 4, 0, 6.3); ctx.fill(); }
    }
  }

  function drawLandmarks(ctx, vis, env) {
    const t = env.t, night = env.night;
    // Faro de Calaburras
    if (vis.x1 > 4600 && vis.x0 < 5000) {
      const fx = FARO.x, fy = FARO.y;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(fx + 12, fy + 14, 26, 22, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#f1ede3'; ctx.beginPath(); ctx.arc(fx, fy, 22, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(fx, fy, 15, 0, 6.3); ctx.stroke();
      ctx.fillStyle = '#6a7380'; ctx.beginPath(); ctx.arc(fx, fy, 9, 0, 6.3); ctx.fill();
      const lg = ctx.createRadialGradient(fx, fy, 1, fx, fy, night > 0.3 ? 70 : 12); lg.addColorStop(0, 'rgba(255,240,150,1)'); lg.addColorStop(1, 'rgba(255,240,150,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(fx, fy, night > 0.3 ? 70 : 12, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(fx, fy, 4.5, 0, 6.3); ctx.fill();
      if (night > 0.3) { ctx.save(); ctx.translate(fx, fy); ctx.rotate(t * 0.8); ctx.fillStyle = 'rgba(255,240,170,0.16)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(420, -40); ctx.lineTo(420, 40); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#f5f1e6'; ctx.fillRect(fx + 34, fy + 6, 46, 30); ctx.fillStyle = '#b5543a'; ctx.fillRect(fx + 32, fy + 2, 50, 12);
      ctx.fillStyle = '#16384f'; ctx.fillRect(fx - 56, fy + 38, 112, 18); ctx.fillStyle = '#fff'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('FARO DE CALABURRAS', fx, fy + 50);
    }
    // Torreón de Cala de Mijas
    if (vis.x1 > 7400 && vis.x0 < 7600) {
      const tx = TORREON.x, ty = TORREON.y;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(tx + 10, ty + 14, 36, 30, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#b6a27a'; ctx.beginPath(); ctx.arc(tx, ty, 32, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#9a8660'; for (let a = 0; a < 14; a++) { ctx.save(); ctx.translate(tx, ty); ctx.rotate(a / 14 * 6.2832); ctx.fillRect(25, -4, 8, 8); ctx.restore(); }
      ctx.fillStyle = '#cdb98a'; ctx.beginPath(); ctx.arc(tx, ty, 21, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#7a5a36'; ctx.beginPath(); ctx.arc(tx, ty, 9, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#16384f'; ctx.fillRect(tx - 36, ty + 40, 72, 17); ctx.fillStyle = '#fff'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('EL TORREÓN', tx, ty + 52);
    }
    // El Bombo
    if (vis.x1 > 8350 && vis.x0 < 8550) {
      const bx = BOMBO.x, by = BOMBO.y;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(bx + 8, by + 12, 30, 26, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(bx, by, 27, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.arc(bx, by, 20, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#8f2a20'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; ctx.moveTo(bx + Math.cos(a) * 22, by + Math.sin(a) * 22); ctx.lineTo(bx + Math.cos(a + 0.26) * 27, by + Math.sin(a + 0.26) * 27); } ctx.stroke();
      ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 12, by - 6); ctx.lineTo(bx + 14, by + 8); ctx.moveTo(bx + 12, by - 8); ctx.lineTo(bx - 10, by + 8); ctx.stroke();
      ctx.fillStyle = '#16384f'; ctx.fillRect(bx - 34, by + 34, 68, 17); ctx.fillStyle = '#fff'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('EL BOMBO', bx, by + 46);
    }
    // cartel de la playa naturista
    if (vis.x1 > 5560 && vis.x0 < 5780) {
      const sx = 5650, sy = PROM_Y0 + 8;
      ctx.fillStyle = '#4a3019'; ctx.fillRect(sx - 40, sy + 28, 5, 26); ctx.fillRect(sx + 35, sy + 28, 5, 26);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx - 56, sy - 2, 120, 58);
      ctx.fillStyle = '#7a5230'; ctx.fillRect(sx - 60, sy - 6, 120, 58);
      ctx.fillStyle = '#f4ead0'; ctx.fillRect(sx - 55, sy - 1, 110, 48);
      ctx.fillStyle = '#16384f'; ctx.font = '800 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('PLAYA NATURISTA', sx, sy + 12);
      ctx.fillStyle = '#7a3a2a'; ctx.font = '600 8.5px system-ui'; ctx.fillText('Aquí se toma el sol', sx, sy + 24); ctx.fillText('como Dios lo trajo al mundo', sx, sy + 34);
      ctx.fillStyle = '#c0392b'; ctx.font = '700 8px system-ui'; ctx.fillText('Se ruega respeto', sx, sy + 44);
    }
  }

  function drawPort(ctx, vis, env) {
    for (const z of PORT_ZONES) drawPortZone(ctx, vis, env, z);
    drawLandmarks(ctx, vis, env);
  }

  function drawBuoys(ctx, vis, env) {
    const t = env.t, y0 = G.BUOY_Y;
    if (vis.y0 > y0 + 60 || vis.y1 < y0 - 60) return;
    const x1 = PORT_FENCE_X - 20;
    // cuerda
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (let x = Math.max(FENCE_L + 20, Math.floor(vis.x0 / 20) * 20); x <= Math.min(x1, vis.x1 + 20); x += 20) {
      const y = y0 + Math.sin(t * 1.4 + x / 70) * (2 + env.swellF * 1.5);
      x === Math.max(FENCE_L + 20, Math.floor(vis.x0 / 20) * 20) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);
    // muro de límite
    const g = ctx.createLinearGradient(0, y0, 0, y0 + 26);
    g.addColorStop(0, 'rgba(255,120,60,0.30)'); g.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = g; ctx.fillRect(Math.max(FENCE_L + 20, vis.x0), y0, Math.min(x1, vis.x1) - Math.max(FENCE_L + 20, vis.x0), 26);
    // boyas
    for (let x = Math.max(FENCE_L + 20, Math.floor(vis.x0 / 90) * 90); x <= Math.min(x1, vis.x1 + 90); x += 90) {
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
      if (!tw.nude) { ctx.fillStyle = tw.suit; ctx.fillRect(-4.4, 1, 8.8, 6); }
      ctx.fillStyle = tw.skin; ctx.beginPath(); ctx.arc(0, -9, 4.2, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#3a2a1e'; ctx.beginPath(); ctx.arc(0, -10, 4.2, 3.3, 6.1); ctx.fill();
      ctx.restore();
    }
    drawPeople(ctx, vis, env);
    drawCrabs(ctx, vis, env);
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
    PIER, PIERS, DIVE, DIVES, PADDLE_SPAWN, PREP_SPAWN, SPOTS, ZONES, zoneAt, nearestSpot, FENCE_L, LONJA_X, STALL_X, LANDMARKS, freeSpot, updateSchools, schoolAt, swimmerAt, hitTowel, peopleNow, sunbathersNow, drawPerson, PROM_Y1, PORT_FENCE_X, buildings,
    shoreY, depthAt, habitatAt, canWalk, canPaddle, inPier,
    drawSea, drawLand, drawBuoys, drawTall, fishingLights,
    lamps, zoneAt: zoneAt,
  };
})();
