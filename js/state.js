/* Estado de la partida y guardado local */
window.G = window.G || {};

(function () {
  const KEY = 'pesca-malaga-v1';
  const def = () => ({
    v: 2, money: 25, day: 1, time: 12, swell: 1,
    phase: 'prep', gt: 0, sailor: null, stall: { slots: [], up: { ac: 0, sign: 0, side: 0 }, sold: 0 }, gems: 0, cnt: {}, ach: {}, cal: { last: '', streak: 0, best: 0, total: 0 }, trashLog: {}, look: { skin: 1, hair: 0, shirt: 'sh0', pants: 'pa0', shoes: 'so0', hat: 'ha0' }, market: { pct: 0, prev: 0 }, plan: { start: 7, dur: 12 }, elapsed: 0, dayHours: 12, cooler: 0, dayLog: { fish: 0 },
    owned: { rods: ['r0'], lines: ['l0'], hooks: ['h0'], spears: [], gear: [], extras: [], cosm: ['sh0', 'pa0', 'so0', 'ha0'] },
    eq: { rod: 'r0', line: 'l0', hook: 'h0', spear: null, bait: 'gusano_ini' },
    baits: { gusano_ini: 25, gusano: 0, sardina: 0, cangrejo: 0 },
    bag: [], album: {}, shopLevel: 0, milestones: [],
    stats: { casts: 0, fish: 0, earned: 0, dives: 0, trash: 0 },
    pos: { x: 2945, y: 1420 }, onPaddle: false, board: null, worldV: 2,
    tutorial: 0, muted: false,
  });

  G.newState = def;
  G.S = def();

  G.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const d = JSON.parse(raw), b = def();
      G.S = Object.assign(b, d);
      G.S.owned = Object.assign(b.owned, d.owned || {});
      G.S.eq = Object.assign(b.eq, d.eq || {});
      G.S.baits = Object.assign(b.baits, d.baits || {});
      G.S.stats = Object.assign(b.stats, d.stats || {});
      G.S.plan = Object.assign(b.plan, d.plan || {});
      G.S.look = Object.assign(b.look, d.look || {});
      G.S.cal = Object.assign(b.cal, d.cal || {});
      if ((d.worldV || 0) < 2) { G.S.pos = b.pos; G.S.board = null; G.S.onPaddle = false; G.S.worldV = 2; }
      G.S.stall = Object.assign(b.stall, d.stall || {}); G.S.stall.up = Object.assign({ ac: 0, sign: 0, side: 0 }, G.S.stall.up || {});
      G.S.market = Object.assign(b.market, d.market || {});
      G.S.dayLog = Object.assign(b.dayLog, d.dayLog || {});
      return true;
    } catch (e) { return false; }
  };
  G.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(G.S)); } catch (e) { /* modo privado */ }
  };
  G.resetGame = function () {
    try { localStorage.removeItem(KEY); } catch (e) { }
    G.S = def();
  };

  /* Accesos rápidos al equipo equipado */
  G.rod = () => G.RODS.find(r => r.id === G.S.eq.rod) || G.RODS[0];
  G.line = () => G.LINES.find(r => r.id === G.S.eq.line) || G.LINES[0];
  G.hook = () => G.HOOKS.find(r => r.id === G.S.eq.hook) || G.HOOKS[0];
  G.spear = () => G.SPEARS.find(r => r.id === G.S.eq.spear) || null;
  G.hasDiveKit = () => G.DIVE_GEAR.every(g => G.S.owned.gear.includes(g.id)) && G.S.owned.spears.length > 0;
  G.missingDive = () => {
    const m = G.DIVE_GEAR.filter(g => !G.S.owned.gear.includes(g.id)).map(g => g.name);
    if (!G.S.owned.spears.length) m.push('Arpón');
    return m;
  };
  G.gearPoints = () => G.rod().pts + G.line().pts + G.hook().pts;
  G.speciesCount = () => Object.keys(G.S.album).length;

  /* ¿Está abierta una tienda? Entre jornadas todas; en jornada solo la de pesca de 9:00 a 18:00 */
  G.shopOpen = (kind) => G.S.phase === 'prep' || (['bait', 'rods', 'spear', 'paddle', 'kayak', 'animal'].includes(kind) && G.env.hour >= 9 && G.env.hour < 18);

  /* Neveras y frescura */
  G.cooler = () => G.COOLERS[G.S.cooler] || G.COOLERS[0];
  G.coolerCap = () => G.cooler().cap;
  G.freshOf = (f) => (f.fresh == null ? 100 : f.fresh);
  G.freshMult = (f) => Math.max(0.2, G.freshOf(f) / 100);
  G.fishValue = (f) => Math.round(f.value * G.freshMult(f) * 100) / 100;
  G.freshLabel = (f) => { const x = G.freshOf(f); return x >= 85 ? ['Fresquísimo', '#6df0b6'] : x >= 60 ? ['Fresco', '#b6f06d'] : x >= 35 ? ['Pasado', '#ffe27a'] : ['Malo', '#ff8a6b']; };
  G.spoilBag = function (hrs) {
    const loss = hrs * G.cooler().loss;
    for (const f of G.S.bag) f.fresh = Math.max(0, G.freshOf(f) - loss);
  };

  /* Venta */
  G.sellMult = (dest) => dest === 'lonja' ? G.SUPPLIER_MULT : G.SHOP_LEVELS[G.S.shopLevel].mult * (1 + G.S.market.pct / 100);
})();
