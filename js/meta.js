/* Metajuego: gemas, logros y calendario de recompensas diarias */
window.G = window.G || {};

G.Ach = (function () {
  const U = G.U, A = {};
  const S = () => G.S;
  const cnt = (k) => (S().cnt && S().cnt[k]) || 0;
  const rar = (r) => Object.entries(S().album).reduce((a, [id, rec]) => a + (G.SPECIES_BY_ID[id] && G.SPECIES_BY_ID[id].rar === r ? rec.n : 0), 0);
  const maxKg = () => Object.values(S().album).reduce((a, r) => Math.max(a, r.maxKg || 0), 0);
  const trashN = (id) => (S().trashLog && S().trashLog[id]) || 0;
  const catchable = () => G.SPECIES.filter(s => !(s.modes.length === 1 && s.modes[0] === 'barco')).length;
  const gearBought = () => (S().owned.rods.length - 1) + (S().owned.lines.length - 1) + (S().owned.hooks.length - 1);

  const L = [];
  const def = (id, icon, name, desc, gems, cur, max) => L.push({ id, icon, name, desc, gems, cur, max });

  // pesca
  def('first_fish', '🎣', 'Primer pez', 'Pesca tu primer pez.', 2, () => S().stats.fish, 1);
  for (const [n, g] of [[5, 1], [10, 2], [25, 3], [50, 6], [75, 10], [100, 15]]) def('sp' + n, '📖', n + ' especies', 'Consigue ' + n + ' especies distintas en el álbum.', g, () => G.speciesCount(), n);
  def('sp_all', '🏅', 'Álbum completo', 'Consigue todas las especies que se pueden pescar ahora.', 40, () => G.speciesCount(), 9999);
  def('dorada2', '🐟', 'Dorada de 2 kg', 'Pesca una dorada de 2 kg o más.', 2, () => ((S().album.dorada || {}).maxKg || 0) >= 2 ? 1 : 0, 1);
  for (const [n, g] of [[10, 1], [20, 1], [50, 2], [100, 3]]) def('com' + n, '🐠', n + ' peces comunes', 'Pesca ' + n + ' peces comunes.', g, () => rar('comun'), n);
  for (const [n, g] of [[5, 1], [15, 2], [30, 4]]) def('rar' + n, '💙', n + ' peces raros', 'Pesca ' + n + ' peces raros.', g, () => rar('raro'), n);
  def('epic1', '💜', 'Primer pez épico', 'Pesca un pez épico.', 3, () => rar('epico'), 1);
  def('epic5', '💜', '5 peces épicos', 'Pesca 5 peces épicos.', 6, () => rar('epico'), 5);
  def('leg1', '🌟', 'Un legendario', 'Pesca un pez legendario.', 5, () => rar('leyenda'), 1);
  def('leg3', '🌟', '3 legendarios', 'Pesca 3 peces legendarios.', 10, () => rar('leyenda'), 3);
  def('kg5', '⚖️', 'Pieza de 5 kg', 'Pesca un pez de 5 kg o más.', 2, () => maxKg(), 5);
  def('kg20', '⚖️', 'Pieza de 20 kg', 'Pesca un pez de 20 kg o más.', 4, () => maxKg(), 20);
  def('kg100', '⚖️', 'Monstruo de 100 kg', 'Pesca un pez de 100 kg o más.', 8, () => maxKg(), 100);
  def('night', '🌙', 'Pescador nocturno', 'Pesca un pez de noche.', 2, () => cnt('night'), 1);
  def('paddle', '🏄', 'Pesca en la tabla', 'Pesca un pez desde la tabla de paddle.', 3, () => cnt('paddle'), 1);
  def('storm', '⛈️', 'Con temporal', 'Pesca un pez con temporal.', 3, () => cnt('storm'), 1);
  def('pier', '🧱', 'Desde el espigón', 'Pesca un pez desde el espigón.', 2, () => cnt('pier'), 1);
  def('spear', '🔱', 'Cazador submarino', 'Pesca un pez con el arpón.', 2, () => cnt('spear'), 1);
  def('first_dive', '🤿', 'Primera inmersión', 'Sal a bucear con arpón por primera vez.', 5, () => S().stats.dives, 1);
  // mar limpio
  def('t_bolsa', '🛍️', 'Bolsa de plástico', 'Retira una bolsa de plástico del mar.', 1, () => trashN('bolsa'), 1);
  def('t_lata', '🥫', 'Lata de bebida', 'Retira una lata del mar.', 1, () => trashN('lata'), 1);
  def('t_botella', '🧴', 'Botella de plástico', 'Retira una botella del mar.', 1, () => trashN('botella'), 1);
  def('t_vaper', '💨', 'Vaper desechable', 'Retira un vaper del mar.', 1, () => trashN('vaper'), 1);
  def('t10', '♻️', 'Mar limpio', 'Retira 10 basuras del mar.', 2, () => S().stats.trash, 10);
  def('t50', '♻️', 'Guardián del mar', 'Retira 50 basuras del mar.', 5, () => S().stats.trash, 50);
  def('rel10', '🌊', 'Buen pescador', 'Devuelve 10 peces al mar.', 1, () => S().stats.released || 0, 10);
  def('relprot', '🛡️', 'Protector', 'Devuelve 5 especies protegidas al mar.', 3, () => cnt('protRel'), 5);
  // dinero y tiendas
  def('lonja1', '🚚', 'Primera venta', 'Vende pescado en la lonja.', 1, () => cnt('lonja'), 1);
  def('gear1', '🧰', 'Equipo nuevo', 'Compra una caña, un hilo o un anzuelo.', 1, () => gearBought(), 1);
  def('lamp', '🔦', 'Luz propia', 'Compra la lámpara de pesca.', 2, () => S().owned.extras.includes('lampara') ? 1 : 0, 1);
  def('paddle_buy', '🏄', 'A la tabla', 'Compra la tabla de paddle surf.', 3, () => S().owned.extras.includes('paddle') ? 1 : 0, 1);
  def('kit', '🥽', 'Kit de buceo', 'Consigue gafas, aletas, neopreno y un arpón.', 3, () => G.hasDiveKit() ? 1 : 0, 1);
  def('cool1', '🧊', 'Mejor nevera', 'Compra una nevera mejor.', 2, () => S().cooler, 1);
  def('cool3', '🧊', 'Nevera grande', 'Compra la nevera grande.', 4, () => S().cooler, 3);
  for (const [n, g] of [[500, 1], [2000, 2], [10000, 4], [50000, 8]]) def('earn' + n, '💶', 'Ganar ' + n + ' €', 'Gana ' + n + ' € vendiendo pescado en total.', g, () => S().stats.earned, n);
  // jornadas y personajes
  for (const [n, g] of [[3, 1], [7, 3], [30, 8]]) def('days' + n, '📆', n + ' jornadas', 'Termina ' + n + ' jornadas de pesca.', g, () => S().day - 1, n);
  for (const [n, g] of [[1, 2], [5, 4], [20, 10]]) def('sail' + n, '⚓', 'Amigo del marinero ×' + n, 'Cumple ' + n + ' encargo(s) del marinero.', g, () => cnt('sailor'), n);
  for (const [n, g] of [[1, 2], [50, 5], [200, 10]]) def('stall' + n, '🏪', 'Tu pescadería ×' + n, 'Vende ' + n + ' pescado(s) en tu pescadería.', g, () => cnt('stallSales'), n);
  def('bather', '🏊', '¡Cuidado, bañista!', 'Engancha a un bañista con el flotador.', 1, () => S().stats.bathers || 0, 1);
  def('fined', '🚔', 'Mala suerte', 'Que te multe la policía por una especie protegida.', 1, () => S().stats.fines || 0, 1);
  def('rescued', '🛟', 'Rescatado', 'Que te rescaten los socorristas.', 1, () => cnt('rescued'), 1);
  def('cal3', '📅', 'Constante', 'Reclama 3 recompensas diarias.', 1, () => (S().cal || {}).total || 0, 3);
  def('cal7', '📅', 'Semana completa', 'Consigue una racha de 7 días en el calendario.', 4, () => (S().cal || {}).best || 0, 7);
  def('cosm1', '👕', 'A la moda', 'Compra tu primera prenda.', 1, () => S().owned.cosm.length - 4, 1);
  def('cosm10', '🕶️', 'Fondo de armario', 'Consigue 10 prendas.', 3, () => S().owned.cosm.length - 4, 10);

  A.list = L;
  A.max = (a) => a.id === 'sp_all' ? catchable() : a.max;
  A.done = (a) => !!(S().ach && S().ach[a.id]);
  A.count = function (k, n) { const s = S(); s.cnt = s.cnt || {}; s.cnt[k] = (s.cnt[k] || 0) + (n == null ? 1 : n); };
  A.setMax = function (k, v) { const s = S(); s.cnt = s.cnt || {}; if (v > (s.cnt[k] || 0)) s.cnt[k] = v; };
  A.gems = function (n, why) { S().gems += n; G.Audio.play('gem'); if (why) G.UI.toast(why + ' · +' + n + ' 💎', 'good'); G.UI.refreshHud(); };
  A.check = function () {
    const s = S(); s.ach = s.ach || {};
    for (const a of L) {
      if (s.ach[a.id]) continue;
      let cur = 0; try { cur = a.cur(); } catch (e) { }
      if (cur >= A.max(a)) { s.ach[a.id] = s.day; s.gems += a.gems; G.Audio.play('gem'); G.UI.toast('🏆 ' + a.name + ' · +' + a.gems + ' 💎', 'good'); G.UI.refreshHud(); G.save(); }
    }
  };
  return A;
})();

/* ---- Calendario de recompensas diarias (usa la fecha real del dispositivo) ---- */
G.Cal = (function () {
  const C = {};
  const ymd = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => ymd(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };
  const cal = () => { const s = G.S; if (!s.cal) s.cal = { last: '', streak: 0, best: 0, total: 0 }; return s.cal; };
  const REW = [
    [{ t: 'money', n: 15 }], [{ t: 'bait', id: 'sardina', n: 4 }], [{ t: 'money', n: 30 }], [{ t: 'gems', n: 1 }],
    [{ t: 'bait', id: 'cangrejo', n: 3 }], [{ t: 'money', n: 60 }], [{ t: 'gems', n: 3 }, { t: 'money', n: 80 }],
  ];
  C.canClaim = () => cal().last !== today();
  /* Día del ciclo (0-6) que se reclamaría ahora y racha resultante */
  C.next = function () {
    const c = cal();
    const streak = c.last === today() ? c.streak : (c.last === yesterday() ? c.streak + 1 : 1);
    return { streak, idx: (streak - 1) % 7, cycle: Math.floor((streak - 1) / 7) };
  };
  const scale = (cycle) => 1 + 0.3 * Math.min(cycle, 5);
  C.reward = (idx, cycle) => REW[idx].map(r => r.t === 'money' ? { t: 'money', n: Math.round(r.n * scale(cycle)) } : r.t === 'bait' ? { t: 'bait', id: r.id, n: r.n + Math.min(cycle, 4) } : r);
  C.text = (list) => list.map(r => r.t === 'money' ? '💶 ' + G.U.money(r.n) : r.t === 'gems' ? '💎 ' + r.n : (G.BAITS.find(b => b.id === r.id).icon + ' ' + r.n + ' ' + G.BAITS.find(b => b.id === r.id).name.toLowerCase())).join(' + ');
  C.claim = function () {
    if (!C.canClaim()) return null;
    const c = cal(), n = C.next();
    c.streak = n.streak; c.best = Math.max(c.best, c.streak); c.last = today(); c.total++;
    const list = C.reward(n.idx, n.cycle);
    for (const r of list) {
      if (r.t === 'money') G.S.money = Math.round((G.S.money + r.n) * 100) / 100;
      else if (r.t === 'gems') G.S.gems += r.n;
      else { G.S.baits[r.id] = (G.S.baits[r.id] || 0) + r.n; if (!G.S.baits[G.S.eq.bait]) G.S.eq.bait = r.id; }
    }
    G.Audio.play('gem'); G.save(); G.UI.refreshHud(); G.Ach.check();
    return list;
  };
  C.days = REW;
  return C;
})();

/* ---- Paneles ---- */
(function () {
  const U = G.U, UI = G.UI;

  UI.panels.ach = {
    title: () => '🏆 Logros',
    body() {
      const S = G.S, L = G.Ach.list, done = L.filter(a => G.Ach.done(a));
      const todo = L.filter(a => !G.Ach.done(a)).map(a => ({ a, r: Math.min(1, (() => { try { return a.cur(); } catch (e) { return 0; } })() / G.Ach.max(a)) })).sort((x, y) => y.r - x.r);
      const row = (a, r, ok) => {
        const mx = G.Ach.max(a), cur = ok ? mx : Math.min(mx, Math.floor((() => { try { return a.cur(); } catch (e) { return 0; } })() * 10) / 10);
        return `<div class="item ${ok ? 'on' : ''}"><div style="font-size:28px;width:34px;text-align:center">${ok ? '✅' : a.icon}</div><div class="meta"><div class="nm">${a.name}</div><div class="ds">${a.desc}</div>${ok ? '' : `<div class="bar" style="margin-top:6px;height:7px"><i style="width:${Math.round(r * 100)}%"></i></div><div class="ds">${Math.min(mx, Math.floor(cur))} / ${mx}</div>`}</div><div style="text-align:center;font-weight:900;color:${ok ? '#6df0b6' : '#ffd36a'}">💎 ${a.gems}</div></div>`;
      };
      return `<div class="sum"><span>💎 Tus gemas: ${S.gems}</span><span>${done.length} / ${L.length}</span></div><div class="bar" style="margin-bottom:8px"><i style="width:${done.length / L.length * 100}%"></i></div>
        <div class="sec">Pendientes</div>${todo.map(x => row(x.a, x.r, false)).join('') || '<p class="ds" style="color:var(--mut)">¡Los has hecho todos!</p>'}
        <div class="sec">Completados</div>${done.map(a => row(a, 1, true)).join('') || '<p class="ds" style="color:var(--mut)">Aún ninguno. ¡A pescar!</p>'}`;
    },
  };

  UI.panels.cal = {
    title: () => '📅 Calendario diario',
    body() {
      const c = G.S.cal || {}, n = G.Cal.next(), can = G.Cal.canClaim();
      const cur = can ? n.idx : ((c.streak - 1) % 7);
      const cyc = can ? n.cycle : Math.floor((c.streak - 1) / 7);
      let h = `<div class="sum"><span>🔥 Racha: ${can ? (n.streak - 1) : c.streak || 0} día(s)</span><span>Mejor: ${c.best || 0}</span></div>
        <p class="ds" style="color:var(--mut);margin:0 2px 8px">Entra cada día para reclamar tu premio. Si te saltas un día, la racha vuelve al principio. Cada semana completa los premios mejoran.</p><div class="calgrid">`;
      for (let i = 0; i < 7; i++) {
        const rw = G.Cal.reward(i, cyc), claimed = can ? i < n.idx : i <= cur, today = can ? i === n.idx : i === cur;
        h += `<div class="calcell ${claimed ? 'got' : ''} ${can && today ? 'now' : ''}"><div class="d">Día ${i + 1}</div><div class="r">${G.Cal.text(rw).replace(/ \+ /g, '<br>')}</div><div class="s">${claimed ? '✅' : (can && today ? '🎁' : '🔒')}</div></div>`;
      }
      h += '</div>';
      h += can ? `<button class="btn primary" style="width:100%;margin-top:12px" data-act="cal_claim">🎁 Reclamar: ${G.Cal.text(G.Cal.reward(n.idx, n.cycle))}</button>` : `<p class="ds" style="text-align:center;color:var(--mut);margin-top:12px">Ya has reclamado el de hoy. ¡Vuelve mañana!</p>`;
      return h;
    },
    act(act) {
      if (act === 'cal_claim') { const list = G.Cal.claim(); if (list) { UI.toast('Recompensa: ' + G.Cal.text(list), 'good'); UI.render(); } return true; }
    },
  };
})();
