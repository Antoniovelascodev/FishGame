/* Interior de las tiendas: entras por la puerta, caminas hasta el mostrador y compras ahí */
window.G = window.G || {};

G.Interior = (function () {
  const U = G.U;
  const RW = 360, RH = 300;
  const COUNTER = { x0: 96, x1: 264, y0: 104, y1: 140 };
  const TABLES = [{ x0: 20, x1: 76, y0: 160, y1: 232 }, { x0: 284, x1: 340, y0: 160, y1: 232 }];
  const DOOR = { x0: 146, x1: 214 };
  const ROOM = { x0: 16, x1: RW - 16, y0: 80, y1: RH - 6 };

  const KINDS = {
    bait:   { title: 'EL CEBO · BÁSICOS', wall: '#cfe3c8', floor: ['#c9a679', '#bf9b6d'], awn: '#2f9e5b', shelf: ['🪱', '🦀', '🐟', '🧊', '🔦'], tl: '🪱', tr: '🧊', hi: '¡Buenas! ¿Cebo fresco hoy?', go: () => G.UI.openShop('bait'), cl: { skin: 1, hair: 1, shirt: 'sh2', pants: 'pa1', shoes: 'so1', hat: 'ha0' } },
    rods:   { title: 'PESCA EL ANZUELO · CAÑAS', wall: '#cdd9ee', floor: ['#c9a679', '#bf9b6d'], awn: '#2d6fc4', shelf: ['🎣', '🧵', '🎣', '🧵', '🎣'], tl: '🎣', tr: '🎣', hi: '¿Qué pez buscas, quillo?', go: () => G.UI.openShop('rods'), cl: { skin: 0, hair: 4, shirt: 'sh3', pants: 'pa2', shoes: 'so0', hat: 'ha0' } },
    spear:  { title: 'ARPÓN Y BUCEO', wall: '#f3dcc4', floor: ['#b9a98f', '#ad9d83'], awn: '#e07a2b', shelf: ['🤿', '🥽', '🔱', '🦶', '🔱'], tl: '🤿', tr: '🥽', hi: 'Ojo con el arpón, que pincha.', go: () => G.UI.openShop('spear'), cl: { skin: 2, hair: 3, shirt: 'sh5', pants: 'pa3', shoes: 'so2', hat: 'ha0' } },
    paddle: { title: 'PADDLE SURF', wall: '#d2f0f0', floor: ['#d9c9a0', '#cfbf96'], awn: '#1fb5c4', shelf: ['🏄', '🌊', '🏄', '🧴', '🌊'], tl: '🏄', tr: '🌊', hi: 'Tablas nuevas, ¡a remar!', go: () => G.UI.openShop('paddle'), cl: { skin: 1, hair: 2, shirt: 'sh1', pants: 'pa0', shoes: 'so3', hat: 'ha0' } },
    fashion: { title: 'MODA MARINERA', wall: '#f4e1ec', floor: ['#d8b9c6', '#cfaebb'], awn: '#c2477e', shelf: ['👕', '👖', '👟', '🧢', '👕'], tl: '👕', tr: '👖', hi: '¡Estás guapísimo, cariño!', go: () => G.UI.open('fashion'), cl: { skin: 0, hair: 2, shirt: 'sh4', pants: 'pa4', shoes: 'so4', hat: 'ha0' } },
    lonja:  { title: 'LONJA · PROVEEDORES', wall: '#e1e9ea', floor: ['#aeb8ba', '#a3aeb0'], awn: '#2c8c6a', shelf: ['🐟', '🦐', '🧊', '🐙', '🦑'], tl: '🐟', tr: '🧊', hi: 'Pescao fresco, ¿qué traes?', go: () => G.UI.open('lonja'), cl: { skin: 3, hair: 1, shirt: 'sh0', pants: 'pa1', shoes: 'so1', hat: 'ha0' } },
    kayak:  { title: 'PUERTO · KAYAKS', wall: '#d6e4ee', floor: ['#9fb4c0', '#94a9b5'], awn: '#2a5d9e', shelf: ['🛶', '🚣', '⚓', '🛟', '📡'], tl: '🛶', tr: '🛟', hi: 'Muy pronto: kayaks y sonar de peces.', go: () => G.UI.toast('🛶 Los kayaks y el sonar llegarán con el puerto. ¡Muy pronto!', 'warn'), cl: { skin: 2, hair: 0, shirt: 'sh6', pants: 'pa5', shoes: 'so1', hat: 'ha0' } },
  };

  const I = { active: false, kind: null, p: { x: 180, y: 262, ang: -Math.PI / 2, walk: 0, moving: false }, t: 0 };

  function enter(kind) {
    if (!KINDS[kind]) return;
    I.active = true; I.kind = kind; I.t = 0;
    I.p.x = 180; I.p.y = 262; I.p.ang = -Math.PI / 2; I.p.moving = false;
    G.Input.castHeld = false;
    G.Audio.play('click');
  }
  function leave() {
    I.active = false; I.kind = null;
    G.UI.setCtx(null); G.ctxRun = null;
    G.Audio.play('click');
  }

  const hits = (x, y) => {
    if (x < ROOM.x0 || x > ROOM.x1 || y < ROOM.y0) return true;
    if (y > ROOM.y1 && !(x > DOOR.x0 && x < DOOR.x1)) return true;
    if (x > COUNTER.x0 - 6 && x < COUNTER.x1 + 6 && y > COUNTER.y0 - 8 && y < COUNTER.y1 + 4) return true;
    for (const t of TABLES) if (x > t.x0 - 6 && x < t.x1 + 6 && y > t.y0 - 6 && y < t.y1 + 6) return true;
    return false;
  };
  const nearCounter = () => I.p.y > COUNTER.y1 && I.p.y < COUNTER.y1 + 42 && I.p.x > COUNTER.x0 - 10 && I.p.x < COUNTER.x1 + 10;

  function update(dt) {
    const In = G.Input, p = I.p, K = KINDS[I.kind];
    I.t += dt;
    In.update();
    p.moving = false;
    if (In.mag > 0) {
      const sp = 120 * In.mag;
      const nx = p.x + In.x * sp * dt, ny = p.y + In.y * sp * dt;
      if (!hits(nx, p.y)) p.x = nx;
      if (!hits(p.x, ny)) p.y = ny;
      p.ang = Math.atan2(In.y, In.x); p.moving = true; p.walk += dt * 10 * In.mag;
    }
    if (p.y > RH - 4) { leave(); return; }
    if (nearCounter()) { G.ctxRun = K.go; G.UI.setCtx('🛒 Comprar en el mostrador'); }
    else if (p.y > RH - 40 && p.x > DOOR.x0 - 20 && p.x < DOOR.x1 + 20) { G.ctxRun = leave; G.UI.setCtx('🚪 Salir de la tienda'); }
    else { G.ctxRun = null; G.UI.setCtx(null); }
    G.UI.syncButtons();
  }

  function draw(ctx, vw, vh, dpr) {
    const K = KINDS[I.kind]; if (!K) return;
    const s = Math.min((vw * 0.97) / RW, (vh * 0.7) / RH), ox = (vw - RW * s) / 2, oy = Math.max(vh * 0.1, 40);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#17110c'; ctx.fillRect(0, 0, vw, vh);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, ox * dpr, oy * dpr);
    // suelo
    for (let y = 0; y < RH; y += 24) for (let x = 0; x < RW; x += 24) { ctx.fillStyle = K.floor[((x + y) / 24) % 2]; ctx.fillRect(x, y, 24, 24); }
    // pared del fondo y estanterías
    ctx.fillStyle = K.wall; ctx.fillRect(0, 0, RW, 72);
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, 68, RW, 8);
    ctx.fillStyle = K.awn; ctx.fillRect(0, 0, RW, 16);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? '#fff' : K.awn; ctx.fillRect(i * 20, 0, 20, 12); }
    ctx.fillStyle = '#fff'; ctx.font = '800 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(RW / 2 - 118, 18, 236, 16);
    ctx.fillStyle = '#fff'; ctx.fillText(K.title, RW / 2, 26.5);
    for (let i = 0; i < K.shelf.length; i++) {
      const x = 22 + i * 63;
      ctx.fillStyle = '#7a5230'; ctx.fillRect(x - 4, 56, 52, 5);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x - 4, 61, 52, 3);
      ctx.font = '26px serif'; ctx.fillStyle = '#000'; ctx.fillText(K.shelf[i], x + 22, 46);
    }
    // mesas de producto
    for (let i = 0; i < 2; i++) {
      const T = TABLES[i];
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(T.x0 + 3, T.y0 + 5, T.x1 - T.x0, T.y1 - T.y0);
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0);
      ctx.fillStyle = '#a06c40'; ctx.fillRect(T.x0 + 3, T.y0 + 3, T.x1 - T.x0 - 6, T.y1 - T.y0 - 6);
      ctx.font = '22px serif'; ctx.fillStyle = '#000';
      const e = i ? K.tr : K.tl;
      for (let k = 0; k < 3; k++) ctx.fillText(e, (T.x0 + T.x1) / 2, T.y0 + 14 + k * 22);
    }
    // dependiente tras el mostrador
    const bob = Math.sin(I.t * 2) * 0.8;
    ctx.save(); ctx.translate(180, 92 + bob); ctx.scale(G.PS * 1.25, G.PS * 1.25);
    const CL = G.Char.lookOf(K.cl), co = { ang: Math.PI / 2, walk: 0, moving: false };
    G.Char.legs(ctx, CL, co); G.Char.body(ctx, CL, { ...co, hands: null, twist: 0 });
    ctx.restore();
    // mostrador
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(COUNTER.x0 + 3, COUNTER.y0 + 5, COUNTER.x1 - COUNTER.x0, COUNTER.y1 - COUNTER.y0);
    ctx.fillStyle = '#6e4526'; ctx.fillRect(COUNTER.x0, COUNTER.y0, COUNTER.x1 - COUNTER.x0, COUNTER.y1 - COUNTER.y0);
    ctx.fillStyle = '#b57a46'; ctx.fillRect(COUNTER.x0, COUNTER.y0, COUNTER.x1 - COUNTER.x0, 14);
    ctx.fillStyle = '#2a2018'; ctx.fillRect(COUNTER.x0 + 70, COUNTER.y0 + 2, 26, 10);
    ctx.font = '12px serif'; ctx.fillStyle = '#000'; ctx.fillText('💶', COUNTER.x0 + 83, COUNTER.y0 + 8);
    // puerta
    ctx.fillStyle = '#3b2a1c'; ctx.fillRect(DOOR.x0 - 4, RH - 8, DOOR.x1 - DOOR.x0 + 8, 8);
    ctx.fillStyle = 'rgba(255,240,180,0.55)'; ctx.fillRect(DOOR.x0, RH - 6, DOOR.x1 - DOOR.x0, 6);
    ctx.font = '700 9px system-ui'; ctx.fillStyle = '#5a3b22'; ctx.fillText('SALIDA', 180, RH - 14);
    // jugador
    const p = I.p, L = G.Char.lookOf();
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(G.PS * 1.25, G.PS * 1.25);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(3, 6, 15, 12, 0, 0, 6.3); ctx.fill();
    G.Char.legs(ctx, L, { ang: p.ang, walk: p.walk, moving: p.moving, seated: false });
    G.Char.body(ctx, L, { ang: p.ang, walk: p.walk, moving: p.moving, hands: null, twist: 0 });
    ctx.restore();
    // saludo del dependiente
    if (nearCounter()) {
      const w = Math.min(RW - 20, K.hi.length * 5.6 + 18);
      ctx.fillStyle = '#fff'; ctx.fillRect(180 - w / 2, 60, w, 15);
      ctx.fillStyle = '#16384f'; ctx.font = '700 9px system-ui'; ctx.fillText(K.hi, 180, 68);
    }
  }

  return { get active() { return I.active; }, enter, leave, update, draw, KINDS };
})();
