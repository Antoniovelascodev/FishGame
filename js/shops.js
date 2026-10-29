/* Tienda de ropa (personalización) y el marinero con su encargo diario */
window.G = window.G || {};

(function () {
  const U = G.U, UI = G.UI;

  /* ================= Moda Marinera ================= */
  const TABS = [['shirt', 'Camisetas'], ['pants', 'Pantalones'], ['shoes', 'Zapatos'], ['hat', 'Gorros'], ['body', 'Aspecto']];
  UI.panels.fashion = {
    title: () => '👕 Moda Marinera',
    tabs: () => TABS,
    body(ms) {
      const S = G.S, tab = ms.tab;
      let h = `<div style="display:flex;justify-content:center;margin:0 0 8px"><div style="background:rgba(255,255,255,.08);border-radius:18px;padding:6px 10px"><span data-prev='{}' data-size="130"></span></div></div>`;
      if (tab === 'body') {
        h += `<div class="sec">Color de piel</div><div style="display:flex;gap:10px;margin:4px 2px 10px">${G.SKINS.map((c, i) => `<button data-act="cosm_skin" data-v="${i}" style="width:44px;height:44px;border-radius:50%;border:3px solid ${S.look.skin === i ? '#ffd36a' : 'transparent'};background:${c}"></button>`).join('')}</div>`;
        h += `<div class="sec">Color de pelo</div><div style="display:flex;gap:10px;margin:4px 2px">${G.HAIRS.map((c, i) => `<button data-act="cosm_hair" data-v="${i}" style="width:44px;height:44px;border-radius:50%;border:3px solid ${S.look.hair === i ? '#ffd36a' : 'transparent'};background:${c}"></button>`).join('')}</div>`;
        return h;
      }
      h += `<p class="ds" style="color:var(--mut);margin:0 2px 6px">Las prendas con 💎 se compran con gemas (consíguelas con logros y el calendario).</p>`;
      for (const it of G.COSM[tab]) {
        const owned = S.owned.cosm.includes(it.id), on = S.look[tab] === it.id;
        const prev = JSON.stringify({ [tab]: it.id }).replace(/'/g, '');
        let btn;
        if (on) btn = `<button class="btn sm ghost" disabled>Puesto</button>`;
        else if (owned) btn = `<button class="btn sm" data-act="cosm_equip" data-c="${tab}" data-v="${it.id}">Ponerme</button>`;
        else if (it.gems) btn = `<button class="btn sm" style="background:linear-gradient(160deg,#8a5cf0,#5a35c0)" data-act="cosm_buy" data-c="${tab}" data-v="${it.id}" ${S.gems >= it.gems ? '' : 'disabled'}>💎 ${it.gems}</button>`;
        else btn = `<button class="btn sm" data-act="cosm_buy" data-c="${tab}" data-v="${it.id}" ${S.money >= it.price ? '' : 'disabled'}>${U.money(it.price)}</button>`;
        h += `<div class="item ${on ? 'on' : ''}"><span data-prev='${prev}' data-size="58"></span><div class="meta"><div class="nm">${it.name}</div><div class="ds">${owned ? (on ? 'Lo llevas puesto' : 'Ya es tuyo') : (it.gems ? 'Premium' : 'A la venta')}</div></div>${btn}</div>`;
      }
      return h;
    },
    after(root) {
      root.querySelectorAll('[data-prev]').forEach(el => {
        let o = {}; try { o = JSON.parse(el.dataset.prev); } catch (e) { }
        el.replaceWith(G.Char.preview(Object.assign({}, G.S.look, o), +el.dataset.size || 56));
      });
    },
    act(act, d) {
      const S = G.S;
      if (act === 'cosm_skin') { S.look.skin = +d.v; UI.render(); return true; }
      if (act === 'cosm_hair') { S.look.hair = +d.v; UI.render(); return true; }
      if (act === 'cosm_equip') { S.look[d.c] = d.v; G.Audio.play('click'); G.save(); UI.render(); return true; }
      if (act === 'cosm_buy') {
        const it = G.COSM[d.c].find(x => x.id === d.v);
        if (it.gems) { if (S.gems < it.gems) return true; S.gems -= it.gems; }
        else { if (S.money < it.price) return true; S.money -= it.price; }
        S.owned.cosm.push(it.id); S.look[d.c] = it.id;
        G.Audio.play('buy'); UI.toast('Comprado: ' + it.name, 'good'); G.Ach.check(); G.save(); UI.render(); UI.refreshHud();
        return true;
      }
    },
  };

  /* ================= El marinero ================= */
  const S0 = () => G.S;
  const POS = { x: G.World.LONJA_X + 226, y: 1432 };
  const Sailor = {};
  const RI = ['comun', 'poco', 'raro', 'epico', 'leyenda'];

  function newQuest() {
    const pool = G.SPECIES.filter(s => !(s.modes.length === 1 && s.modes[0] === 'barco'));
    const sp = Math.random() < 0.15 ? U.pick(pool) : U.weighted(pool, s => G.RARITY[s.rar].weight);
    const sz = U.rand(0.08, 0.8);
    const cm = Math.max(sp.cm[0], Math.round(U.lerp(sp.cm[0], sp.cm[1], sz)));
    const kg = Math.max(sp.kg[0], Math.round(U.lerp(sp.kg[0], sp.kg[1], Math.pow(sz, 1.6)) * 0.97 * 1000) / 1000);
    const value = kg * sp.eurKg, lucky = Math.random() < 0.12;
    const asGems = Math.random() < 0.18;
    let amt, type;
    if (asGems) { type = 'gems'; amt = 1 + RI.indexOf(sp.rar) + (lucky ? 2 : 0) + (Math.random() < 0.4 ? 1 : 0); }
    else { type = 'money'; amt = Math.round((8 + value * U.rand(1.5, 3.2)) * (lucky ? U.rand(4, 7) : 1) * 2) / 2; }
    return { day: G.S.day, sp: sp.id, cm, kg, type, amt, lucky, done: false };
  }
  Sailor.quest = function () {
    const s = G.S;
    if (!s.sailor || s.sailor.day !== s.day) { s.sailor = newQuest(); Sailor.anim = null; }
    return s.sailor;
  };
  Sailor.anim = null;
  Sailor.visible = () => G.S.phase === 'prep' && (!Sailor.quest().done || !!Sailor.anim);
  Sailor.near = (P) => Sailor.visible() && !Sailor.anim && !Sailor.quest().done && Math.hypot(P.x - POS.x, P.y - POS.y) < 80;
  const rewardText = (q) => q.type === 'gems' ? '💎 ' + q.amt + ' gemas' : '💶 ' + U.money(q.amt);
  Sailor.matches = function (q) {
    const out = [];
    for (const f of G.S.bag) {
      if (f.sp !== q.sp) continue;
      const why = f.cm < q.cm ? 'Es demasiado pequeño' : f.kg < q.kg ? 'Pesa poco' : G.freshOf(f) < 35 ? 'Está pasado' : null;
      out.push({ f, why });
    }
    return out;
  };

  UI.panels.sailor = {
    title: () => '⚓ El marinero',
    body() {
      const q = Sailor.quest(), sp = G.SPECIES_BY_ID[q.sp], ms = Sailor.matches(q);
      let h = `<div class="card" style="margin-bottom:10px"><div style="display:flex;gap:12px;align-items:center"><div style="font-size:44px">👨‍✈️</div><div style="line-height:1.4">${q.lucky ? '¡Grumete! Hoy pago de lujo: ' : '¡Ey, grumete! '}Necesito <b>${sp.name.toLowerCase()}</b> de al menos <b>${q.cm} cm</b> y <b>${U.kg(q.kg)}</b>. Te daré <b style="color:#ffd36a">${rewardText(q)}</b>${q.lucky ? ' (¡y es un pastón!)' : ''}.</div></div></div>`;
      h += `<div style="display:flex;justify-content:center;margin:4px 0 8px">${UI.fishPh(sp.id, 150, !G.S.album[sp.id])}</div>`;
      h += `<div class="ds" style="text-align:center;color:var(--mut);margin-bottom:8px">Un encargo al día: se entrega y listo hasta mañana.</div>`;
      if (!ms.length) h += `<p class="ds" style="text-align:center;color:var(--mut)">No llevas ${sp.name.toLowerCase()} en la nevera. Sal a buscarlo y vuelve cuando termines el día.</p>`;
      for (const m of ms) {
        const f = m.f;
        h += `<div class="item">${UI.fishPh(sp.id, 52, false)}<div class="meta"><div class="nm">${sp.name}</div><div class="ds">${f.cm} cm · ${U.kg(f.kg)} · ${G.freshLabel(f)[0]} ${Math.round(G.freshOf(f))}%</div>${m.why ? `<div class="ds" style="color:#ff8a6b;font-weight:700">${m.why}</div>` : ''}</div><button class="btn sm" data-act="sail_give" data-v="${f.id}" ${m.why ? 'disabled' : ''}>Entregar</button></div>`;
      }
      return h;
    },
    act(act, d) {
      if (act !== 'sail_give') return;
      const q = Sailor.quest(), i = G.S.bag.findIndex(f => f.id === d.v);
      if (i < 0 || q.done) return true;
      const f = G.S.bag[i];
      if (f.cm < q.cm || f.kg < q.kg || G.freshOf(f) < 35) return true;
      G.S.bag.splice(i, 1); q.done = true;
      if (q.type === 'gems') { G.S.gems += q.amt; G.Audio.play('gem'); }
      else { G.S.money = Math.round((G.S.money + q.amt) * 100) / 100; G.S.stats.earned += q.amt; G.Audio.play('coin'); }
      G.Ach.count('sailor'); G.Ach.check(); G.save(); G.UI.refreshHud();
      Sailor.anim = { t: 0, sp: G.SPECIES_BY_ID[q.sp], from: { x: G.P.x, y: G.P.y }, text: q.type === 'gems' ? '+' + q.amt + ' 💎' : '+' + U.money(q.amt), type: q.type, lucky: q.lucky };
      UI.close();
      return true;
    },
  };

  /* Animación y dibujo del marinero en el paseo */
  Sailor.update = function (dt) {
    const a = Sailor.anim; if (!a) return;
    a.t += dt;
    if (a.t > 5.6) Sailor.anim = null;
  };
  const LOOK = { skin: 2, hair: 4, shirt: 'sh3', pants: 'pa0', shoes: 'so3', hat: 'ha6' };
  Sailor.draw = function (c, E) {
    if (!Sailor.visible()) return;
    const q = Sailor.quest(), a = Sailor.anim, P = G.P;
    let x = POS.x, y = POS.y, al = 1, ang = Math.PI / 2, walk = 0, moving = false, hop = 0;
    if (!a) {
      const d = Math.hypot(P.x - x, P.y - y); if (d < 200) ang = Math.atan2(P.y - y, P.x - x);
      else ang = Math.PI / 2 + Math.sin(E.t * 0.5) * 0.15;
    } else {
      ang = a.t < 1.2 ? Math.atan2(P.y - y, P.x - x) : 0;
      if (a.t > 1.7) { const w = a.t - 1.7; x += w * 38; moving = true; walk = w * 9; al = 1 - U.clamp((w - 2.2) / 1.6, 0, 1); ang = 0; }
      else if (a.t > 0.7 && a.t < 1.5) hop = Math.abs(Math.sin((a.t - 0.7) * Math.PI * 3)) * 6;
    }
    const L = G.Char.lookOf(LOOK);
    // sombra y cuerpo
    c.save(); c.globalAlpha = al; c.translate(x, y - hop); c.scale(G.PS, G.PS);
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(3, 6 + hop, 15, 12, 0, 0, 6.3); c.fill();
    G.Char.legs(c, L, { ang, walk, moving });
    G.Char.body(c, L, { ang, walk, moving, hands: a && a.t > 0.7 && a.t < 1.6 ? { r: { x: 0, y: -22 }, l: { x: 0, y: 22 } } : null });
    c.restore();
    // cartel con exclamación si hay encargo
    if (!q.done) {
      const bob = Math.sin(E.t * 4) * 3;
      c.save(); c.translate(x, y - 34 + bob);
      c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(0, 0, 11, 0, 6.3); c.fill(); c.strokeStyle = '#7a5a00'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#4a3600'; c.font = '900 15px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', 0, 1);
      c.restore();
    }
    // pez que vuela hacia él y premio flotante
    if (a) {
      if (a.t < 0.7) {
        const v = a.t / 0.7, fx = U.lerp(a.from.x, POS.x, v), fy = U.lerp(a.from.y, POS.y, v) - Math.sin(v * Math.PI) * 44;
        G.FishArt.draw(c, a.sp, fx, fy, 30, Math.atan2(POS.y - a.from.y, POS.x - a.from.x) + v * 8, { ph: a.t * 40 });
      } else if (a.t < 3.2) {
        const w = a.t - 0.7;
        c.save(); c.globalAlpha = U.clamp(1 - (w - 1.8) / 0.7, 0, 1); c.font = '900 ' + (a.lucky ? 20 : 16) + 'px system-ui'; c.textAlign = 'center';
        c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.fillStyle = a.type === 'gems' ? '#d8b4ff' : '#7dffb0';
        c.strokeText(a.text, POS.x, POS.y - 44 - w * 16); c.fillText(a.text, POS.x, POS.y - 44 - w * 16); c.restore();
      }
    }
  };
  Sailor.POS = POS;
  G.Sailor = Sailor;
})();
