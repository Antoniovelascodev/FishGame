/* Tu pescadería: 30 puestos, precios a tu gusto, clientes que llegan en coche y mejoras */
window.G = window.G || {};

G.Stall = (function () {
  const U = G.U;
  const ST = {};
  const B = { x: G.World.STALL_X, y: 1480, w: 210, h: 150 };       // el edificio (ver world.js)
  const COUNTER = { x: B.x + 105, y: 1643 };                  // mostrador en la cara sur, junto al parking
  const BAY_Y = 1680, BAY_X0 = B.x + 22, BAY_DX = 36, LANE_Y = 1750;
  const MAXSLOTS = 30, MAXBAYS = 6;
  const AC_LOSS = [2.0, 1.4, 0.9, 0.5, 0.25];          // % de frescura que pierde el pescado por hora
  const UPG = {
    ac: { name: 'Aire acondicionado', icon: '❄️', costs: [120, 350, 900, 2200], desc: l => `El pescado pierde ${AC_LOSS[l]}% de frescura por hora` + (l < 4 ? ` → ${AC_LOSS[l + 1]}%` : ' (máximo)') },
    sign: { name: 'Carteles y luces', icon: '🪧', costs: [90, 260, 700, 1800], desc: l => `Más clientes: ×${(1 + 0.35 * l).toFixed(2)}` + (l < 4 ? ` → ×${(1 + 0.35 * (l + 1)).toFixed(2)}` : ' (máximo)') },
    side: { name: 'Acera y aparcamiento', icon: '🅿️', costs: [150, 500, 1400], desc: l => `${3 + l} plazas de parking, clientes ×${(1 + 0.25 * l).toFixed(2)}` + (l < 3 ? ` → ${4 + l} plazas` : ' (máximo)') },
  };
  ST.UPG = UPG; ST.MAXSLOTS = MAXSLOTS;
  ST.visits = [];
  ST.pops = [];
  let vid = 1;

  const st = () => { const s = G.S; if (!s.stall) s.stall = { slots: [], up: { ac: 0, sign: 0, side: 0 }, sold: 0 }; return s.stall; };
  const gt = () => G.S.gt || 0;
  const traffic = () => { const u = st().up; return 1 + 0.35 * u.sign + 0.25 * u.side; };
  const bays = () => 3 + st().up.side;
  const lossPerHour = () => AC_LOSS[st().up.ac];
  ST.traffic = traffic; ST.bays = bays; ST.loss = lossPerHour;

  /* Probabilidad de que un pez a ratio r = precio / precio base se acabe vendiendo */
  ST.pBuy = (r) => r <= 1 ? 1 : Math.pow(U.clamp(1 - (r - 1) / 0.8, 0, 1), 1.4);
  ST.base = (f) => G.fishValue(f);

  function schedule(l) {
    const base = Math.max(0.01, ST.base(l.f)), r = l.price / base, tr = traffic();
    if (r <= 1) l.due = gt() + Math.min(2, U.rand(0.25, 1.9) * (0.5 + 0.5 * r) / Math.sqrt(tr));
    else { const p = ST.pBuy(r); l.due = Math.random() < p ? gt() + U.rand(0.6, 3.5) / Math.sqrt(tr) / Math.max(0.35, p) : 1e9; }
  }
  ST.demand = function (l) {
    const r = l.price / Math.max(0.01, ST.base(l.f));
    if (r <= 1) return { txt: '✅ Se vende en menos de 2 h', col: '#6df0b6' };
    const p = ST.pBuy(r);
    if (p <= 0.01) return { txt: '🚫 Demasiado caro: nadie lo comprará', col: '#ff8a6b' };
    return { txt: '⚠️ Caro (+' + Math.round((r - 1) * 100) + '%): ' + Math.round(p * 100) + '% de venderse', col: p > 0.5 ? '#ffe27a' : '#ffb27a' };
  };

  ST.list = (f, price) => {
    const s = st();
    if (s.slots.length >= MAXSLOTS) return false;
    const l = { id: U.uid(), f, price: Math.round(price * 100) / 100, t0: gt(), due: 0, res: 0 };
    schedule(l); s.slots.push(l); return true;
  };
  ST.setPrice = (l, price) => { l.price = Math.max(0.1, Math.round(price * 100) / 100); schedule(l); };
  ST.remove = (id) => { const s = st(); const i = s.slots.findIndex(l => l.id === id); if (i < 0) return null; if (s.slots[i].res) return null; const l = s.slots[i]; s.slots.splice(i, 1); return l; };
  ST.reset = () => { for (const l of st().slots) l.res = 0; ST.visits.length = 0; };

  /* Avance del tiempo de juego  */
  ST.tick = function (hrs) {
    const s = st(); if (!s.slots.length) return;
    const loss = lossPerHour() * hrs;
    for (let i = s.slots.length - 1; i >= 0; i--) {
      const l = s.slots[i];
      l.f.fresh = Math.max(0, G.freshOf(l.f) - loss);
      if (!l.res && (gt() - l.t0 >= 48 || l.f.fresh <= 0)) {
        s.slots.splice(i, 1);
        G.UI.toast('🗑️ Se ha estropeado ' + G.SPECIES_BY_ID[l.f.sp].name.toLowerCase() + ' en tu pescadería: lo tiras', 'warn');
      }
    }
    // clientes que ya tocan comprar
    const ready = s.slots.filter(l => !l.res && l.due <= gt());
    while (ready.length && ST.visits.length < bays() && s.slots.length) {
      const group = ready.splice(0, 1 + Math.floor(Math.random() * 3));
      startVisit(group);
    }
  };

  const CAR_COLS = ['#d0453a', '#3a6fd0', '#e8e8e8', '#f2b632', '#2f9f6a', '#7a4fd0', '#222831'];
  function startVisit(group) {
    const used = new Set(ST.visits.map(v => v.bay));
    let bay = -1; for (let i = 0; i < bays(); i++) if (!used.has(i)) { bay = i; break; }
    if (bay < 0) return;
    const id = vid++;
    for (const l of group) l.res = id;
    const W = G.World;
    ST.visits.push({
      id, bay, listings: group, t: 0, sold: false,
      car: U.pick(CAR_COLS), bx: BAY_X0 + bay * BAY_DX, x0: BAY_X0 + bay * BAY_DX - 260 - Math.random() * 120,
      p: { ph: Math.random() * 6, skin: U.pick(['#f2c9a0', '#d9a074', '#c68863', '#8d5a3b']), shirt: U.pick(['#e8503a', '#f2b632', '#2f9fd8', '#3fbf86', '#7a5ad8', '#f08a3c', '#ffffff']), hair: U.pick(['#2a1d14', '#5a3a22', '#c9a24a', '#111']) },
    });
    G.Audio.play('engine');
  }

  /* Tiempos de cada fase de la visita (segundos reales) */
  const T = { arrive: 2.6, park: 0.5, walkIn: 1.3, buy: 1.1, walkBack: 1.3, leave: 2.5 };
  const T1 = T.arrive, T2 = T1 + T.park, T3 = T2 + T.walkIn, T4 = T3 + T.buy, T5 = T4 + T.walkBack, T6 = T5 + T.leave;

  ST.update = function (dt) {
    for (const p of ST.pops) p.t += dt;
    ST.pops = ST.pops.filter(p => p.t < 2.6);
    for (let i = ST.visits.length - 1; i >= 0; i--) {
      const v = ST.visits[i]; v.t += dt;
      if (v.t >= T3 && !v.sold) { v.sold = true; complete(v); }
      if (v.t >= T6) { for (const l of v.listings) if (l.res === v.id) l.res = 0; ST.visits.splice(i, 1); }
    }
  };

  function complete(v) {
    const s = st(); let total = 0, n = 0, names = [];
    for (const l of v.listings) {
      const i = s.slots.findIndex(x => x.id === l.id);
      if (i < 0) continue;
      s.slots.splice(i, 1);
      total += l.price; n++; names.push(G.SPECIES_BY_ID[l.f.sp].name.toLowerCase());
      s.sold = (s.sold || 0) + 1; G.Ach.count('stallSales');
    }
    if (!n) { ST.pops.push({ x: COUNTER.x, y: COUNTER.y - 8, t: 0, text: '😕', col: '#fff' }); return; }
    total = Math.round(total * 100) / 100;
    G.S.money = Math.round((G.S.money + total) * 100) / 100; G.S.stats.earned += total;
    ST.pops.push({ x: v.bx > B.x ? COUNTER.x + (Math.random() * 40 - 20) : COUNTER.x, y: COUNTER.y - 6, t: 0, text: '+' + U.money(total), col: '#7dffb0' });
    G.Audio.play('coin'); G.Ach.check(); G.UI.refreshHud(); G.save();
  }

  /* ---- Dibujo ---- */
  function carPos(v) {
    const t = v.t;
    if (t < T1) { // llega por el carril y gira hacia la plaza
      const u = U.smooth(t / T1), L1 = v.bx - v.x0, L2 = LANE_Y - BAY_Y, d = u * (L1 + L2);
      if (d < L1 - 26) return { x: v.x0 + d, y: LANE_Y, a: 0 };
      if (d < L1) { const k = (d - (L1 - 26)) / 26; return { x: v.x0 + d, y: LANE_Y - k * 8, a: -k * 1.3 }; }
      return { x: v.bx, y: LANE_Y - 8 - (d - L1) * ((L2 - 8) / L2), a: -Math.PI / 2 };
    }
    if (t < T5) return { x: v.bx, y: BAY_Y, a: -Math.PI / 2 };
    // sale marcha atrás y se va hacia el este
    const u = U.smooth((t - T5) / T.leave), L2 = LANE_Y - BAY_Y, L3 = 420, d = u * (L2 + L3);
    if (d < L2) return { x: v.bx, y: BAY_Y + d, a: -Math.PI / 2 };
    const k = Math.min(1, (d - L2) / 30);
    return { x: v.bx + (d - L2), y: LANE_Y, a: -Math.PI / 2 * (1 - k) };
  }
  function custPos(v) {
    const t = v.t, door = { x: v.bx + 15, y: BAY_Y - 6 }, cx = COUNTER.x + (v.bay - 2) * 14, cy = COUNTER.y + 14;
    if (t < T1 + T.park * 0.4) return null;
    if (t < T2) return { x: door.x, y: door.y, hd: -Math.PI / 2, moving: false };
    if (t < T3) { const u = (t - T2) / T.walkIn; return { x: U.lerp(door.x, cx, u), y: U.lerp(door.y, cy, u), hd: Math.atan2(cy - door.y, cx - door.x), moving: true }; }
    if (t < T4) return { x: cx, y: cy, hd: -Math.PI / 2, moving: false };
    if (t < T5) { const u = (t - T4) / T.walkBack; return { x: U.lerp(cx, door.x, u), y: U.lerp(cy, door.y, u), hd: Math.atan2(door.y - cy, door.x - cx), moving: true }; }
    return null;
  }
  function drawCar(c, x, y, a, col) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(3, 5, 24, 11, 0, 0, 6.3); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(-22, -9); c.lineTo(16, -9); c.quadraticCurveTo(24, -9, 24, 0); c.quadraticCurveTo(24, 9, 16, 9); c.lineTo(-22, 9); c.quadraticCurveTo(-25, 9, -25, 5); c.lineTo(-25, -5); c.quadraticCurveTo(-25, -9, -22, -9); c.fill();
    c.fillStyle = 'rgba(30,50,70,0.85)'; c.fillRect(-2, -7, 14, 14); c.fillRect(-18, -6.5, 9, 13);
    c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(-9, -8, 8, 3);
    c.fillStyle = '#ffe9a8'; c.fillRect(22, -7, 2.5, 3.5); c.fillRect(22, 3.5, 2.5, 3.5);
    c.restore();
  }

  ST.draw = function (c, vis, E) {
    if (vis.y1 < 1590 || vis.x1 < B.x - 60 || vis.x0 > B.x + B.w + 340) return;
    const s = st(), u = s.up, t = E.t;
    // suelo del aparcamiento
    const nb = Math.max(bays(), 3);
    c.fillStyle = u.side >= 2 ? '#b7b0a2' : '#a79f91'; c.fillRect(BAY_X0 - 10, 1636, nb * BAY_DX + 16, 78);
    if (u.side >= 1) { c.fillStyle = '#cfc8ba'; c.fillRect(BAY_X0 - 10, 1634, nb * BAY_DX + 16, 4); }
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2;
    for (let i = 0; i <= nb; i++) { const x = BAY_X0 - 17 + i * BAY_DX + 18; c.beginPath(); c.moveTo(x, BAY_Y - 24); c.lineTo(x, BAY_Y + 26); c.stroke(); }
    // mostrador sur con toldo
    const cx0 = B.x + 14, cw = B.w - 28;
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(cx0 + 4, 1632, cw, 22);
    for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#2d7fc4'; c.fillRect(cx0 + i * cw / 10, 1626, cw / 10 + 0.5, 12); }
    c.fillStyle = '#e8edf0'; c.fillRect(cx0, 1638, cw, 14);
    c.fillStyle = '#8fb8d0'; c.fillRect(cx0 + 4, 1641, cw - 8, 9);
    // pescado a la venta sobre hielo
    const show = s.slots.slice(0, 11);
    show.forEach((l, i) => { G.FishArt.draw(c, G.SPECIES_BY_ID[l.f.sp], cx0 + 14 + i * (cw - 28) / 10, 1645.5, 15, 0.1 * ((i % 3) - 1), { ph: 0 }); });
    // cartel con luces
    if (u.sign > 0) {
      c.fillStyle = '#16384f'; c.fillRect(B.x + B.w / 2 - 54, 1606, 108, 15);
      c.fillStyle = '#fff'; c.font = '800 9px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PESCADO FRESCO', B.x + B.w / 2, 1613.5);
      for (let i = 0; i < u.sign; i++) { const on = Math.sin(t * 5 + i) > -0.3; c.fillStyle = on ? '#ffd23a' : '#7a6a2a'; c.beginPath(); c.arc(B.x + B.w / 2 - 54 + 14 + i * 26, 1604, 2.4, 0, 6.3); c.fill(); }
    }
    // coches y clientes
    for (const v of ST.visits) {
      const p = carPos(v); drawCar(c, p.x, p.y, p.a, v.car);
      const cp = custPos(v);
      if (cp) G.World.drawPerson(c, cp.x, cp.y, cp.hd, t, v.p, 1, 0.74);
    }
    // ventas en pequeño
    for (const p of ST.pops) {
      const a = U.clamp(1 - (p.t - 1.6) / 1, 0, 1);
      c.save(); c.globalAlpha = a; c.font = '900 14px system-ui'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,0.6)'; c.fillStyle = p.col;
      c.strokeText(p.text, p.x, p.y - p.t * 16); c.fillText(p.text, p.x, p.y - p.t * 16); c.restore();
    }
  };

  /* ---- Panel de la pescadería ---- */
  const UI = G.UI;
  const ratioOf = (l) => l.price / Math.max(0.01, ST.base(l.f));
  const hoursLeft = (l) => Math.max(0, 48 - (gt() - l.t0));
  const rowTop = (f) => { const sp = G.SPECIES_BY_ID[f.sp], fl = G.freshLabel(f); return `${UI.fishPh(sp.id, 52, false)}<div class="meta"><div class="nm">${sp.name}${f.hurt ? ' 🩹' : ''}</div><div class="ds">${f.cm} cm · ${U.kg(f.kg)} · <span style="color:${fl[1]};font-weight:800">${fl[0]} ${Math.round(G.freshOf(f))}%</span></div>`; };
  const PRESETS = [90, 95, 100, 110, 120, 140];
  const pctControls = (mode, id, pct, extra, off) => `<div style="width:100%;margin-top:4px"><input type="range" class="rng" min="50" max="200" step="5" value="${pct}" id="sl_${id}" data-pct="${id}" data-mode="${mode}" ${off ? 'disabled' : ''}>
    <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">${PRESETS.map(p => `<button class="btn sm ghost" data-act="stall_pc" data-mode="${mode}" data-v="${id}" data-p="${p}">${p}%</button>`).join('')}<span style="margin-left:auto;display:flex;gap:5px">${extra}</span></div></div>`;
  /* Cambia el precio sin recargar la pantalla: solo actualiza los textos de esa fila */
  function applyPct(mode, id, pct) {
    pct = U.clamp(Math.round(pct / 5) * 5, 50, 200);
    const ms = UI.getMs(); let price, d;
    if (mode === 'slot') { const l = st().slots.find(x => x.id === id); if (!l || l.res) return; ST.setPrice(l, ST.base(l.f) * pct / 100); price = l.price; d = ST.demand(l); }
    else { const f = G.S.bag.find(x => x.id === id); if (!f || !ms) return; ms.pr[id] = pct / 100; price = Math.round(ST.base(f) * pct) / 100; d = ST.demand({ f, price }); }
    const $ = (k) => document.getElementById(k + '_' + id);
    if ($('pp')) $('pp').textContent = U.money(price); if ($('pc')) $('pc').textContent = pct + '%';
    if ($('pd')) { $('pd').textContent = d.txt; $('pd').style.color = d.col; }
    const sl = document.getElementById('sl_' + id); if (sl) sl.value = pct;
  }
  document.getElementById('modal').addEventListener('input', (e) => { const el = e.target; if (el.dataset && el.dataset.pct) applyPct(el.dataset.mode, el.dataset.pct, +el.value); });

  UI.panels.stall = {
    title: () => '🏪 Tu pescadería',
    tabs: () => [['slots', 'En venta'], ['add', 'Poner pescado'], ['up', 'Mejoras']],
    init(ms) { ms.pr = {}; },
    body(ms) {
      const s = st(), S = G.S;
      let h = `<div class="sum"><span>🐟 ${s.slots.length} / ${MAXSLOTS} puestos</span><span>Vendidos: ${s.sold || 0}</span></div>`;
      if (ms.tab === 'slots') {
        if (!s.slots.length) return h + `<p style="color:var(--mut);text-align:center;margin-top:24px;line-height:1.5">No tienes nada a la venta.<br>Pasa a «Poner pescado» y elige tu precio.<br>El pescado se vende mientras pescas y te pagan al momento.</p>`;
        h += `<p class="ds" style="color:var(--mut);margin:0 2px 6px">Si lo pones a su precio justo se vende en menos de 2 horas de juego. Cuanto más caro, menos probable. El pescado dura 2 días en tu pescadería.</p>`;
        for (const l of s.slots) {
          const d = ST.demand(l), r = ratioOf(l);
          h += `<div class="item" style="flex-wrap:wrap">${rowTop(l.f)}<div id="pd_${l.id}" class="ds" style="color:${d.col};font-weight:800">${l.res ? '🛒 Un cliente lo está comprando…' : d.txt}</div><div class="ds">Precio justo ahora: ${U.money(ST.base(l.f))} · quedan ${Math.round(hoursLeft(l))} h</div></div>
            <div style="text-align:right"><div id="pp_${l.id}" style="font-weight:900;font-size:17px">${U.money(l.price)}</div><div id="pc_${l.id}" class="ds">${Math.round(r * 100)}%</div></div>
            ${pctControls('slot', l.id, Math.round(r * 20) * 5, `<button class="btn sm warn" data-act="stall_take" data-v="${l.id}" ${l.res ? 'disabled' : ''}>Retirar</button>`, l.res)}</div>`;
        }
        return h;
      }
      if (ms.tab === 'add') {
        const free = MAXSLOTS - s.slots.length;
        h += `<p class="ds" style="color:var(--mut);margin:0 2px 6px">Elige el precio de cada pez (100% = precio justo). Por encima se vende peor. La lonja paga ${Math.round(G.SUPPLIER_MULT * 100)}% al instante, sin riesgo.</p>`;
        if (!S.bag.length) return h + `<p style="color:var(--mut);text-align:center;margin-top:24px">Tu nevera está vacía. ¡A pescar! 🎣</p>`;
        for (const f of S.bag) {
          const r = ms.pr[f.id] == null ? 1.1 : ms.pr[f.id], price = Math.round(ST.base(f) * r * 100) / 100;
          const tmp = { f, price }, d = ST.demand(tmp);
          h += `<div class="item" style="flex-wrap:wrap">${rowTop(f)}<div id="pd_${f.id}" class="ds" style="color:${d.col};font-weight:800">${d.txt}</div><div class="ds">Lonja ahora: ${U.money(ST.base(f) * G.SUPPLIER_MULT)}</div></div>
            <div style="text-align:right"><div id="pp_${f.id}" style="font-weight:900;font-size:17px">${U.money(price)}</div><div id="pc_${f.id}" class="ds">${Math.round(r * 100)}%</div></div>
            ${pctControls('add', f.id, Math.round(r * 20) * 5, `<button class="btn sm" data-act="stall_put" data-v="${f.id}" ${free > 0 ? '' : 'disabled'}>Poner</button>`, false)}</div>`;
        }
        h += `<button class="btn" style="width:100%;margin-top:6px" data-act="stall_all" ${free > 0 ? '' : 'disabled'}>Poner todo al precio justo (100%)</button>`;
        return h;
      }
      // mejoras
      h += `<p class="ds" style="color:var(--mut);margin:0 2px 6px">Mejora tu pescadería para que el pescado aguante más, lleguen más clientes y haya más sitio donde aparcar.</p>`;
      for (const k of ['ac', 'sign', 'side']) {
        const U2 = UPG[k], lvl = s.up[k], max = U2.costs.length, cost = U2.costs[lvl];
        h += `<div class="item"><div style="font-size:30px">${U2.icon}</div><div class="meta"><div class="nm">${U2.name} · nivel ${lvl}/${max}</div><div class="ds">${U2.desc(lvl)}</div></div>${lvl >= max ? '<button class="btn sm ghost" disabled>Máx.</button>' : `<button class="btn sm" data-act="stall_up" data-v="${k}" ${S.money >= cost ? '' : 'disabled'}>${U.money(cost)}</button>`}</div>`;
      }
      h += `<div class="item"><div style="font-size:30px">📈</div><div class="meta"><div class="nm">Afluencia actual: ×${traffic().toFixed(2)}</div><div class="ds">Plazas de parking: ${bays()} · pérdida de frescura: ${lossPerHour()}%/h</div></div></div>`;
      return h;
    },
    act(act, d, ms) {
      const s = st(), S = G.S;
      if (act === 'stall_pc') { applyPct(d.mode, d.v, +d.p); return true; }
      if (act === 'stall_put') {
        const i = S.bag.findIndex(x => x.id === d.v); if (i < 0) return true;
        const f = S.bag[i], r = ms.pr[f.id] == null ? 1.1 : ms.pr[f.id];
        if (ST.list(f, ST.base(f) * r)) { S.bag.splice(i, 1); G.Audio.play('click'); G.save(); UI.refreshHud(); UI.render(); }
        return true;
      }
      if (act === 'stall_all') {
        for (let i = S.bag.length - 1; i >= 0 && s.slots.length < MAXSLOTS; i--) { const f = S.bag[i]; if (ST.list(f, ST.base(f))) S.bag.splice(i, 1); }
        G.Audio.play('click'); G.save(); UI.refreshHud(); UI.render(); return true;
      }
      if (act === 'stall_take') {
        const l = ST.remove(d.v);
        if (l) { if (S.bag.length < G.coolerCap()) S.bag.push(l.f); else G.UI.toast('Tu nevera está llena: no puedes retirarlo', 'warn'), s.slots.push(l); G.save(); UI.refreshHud(); UI.render(); }
        return true;
      }
      if (act === 'stall_up') {
        const k = d.v, lvl = s.up[k], cost = UPG[k].costs[lvl];
        if (cost == null || S.money < cost) return true;
        S.money -= cost; s.up[k]++; G.Audio.play('buy'); UI.toast('Mejora: ' + UPG[k].name + ' nivel ' + s.up[k], 'good'); G.save(); UI.render(); UI.refreshHud();
        return true;
      }
    },
  };

  return ST;
})();
