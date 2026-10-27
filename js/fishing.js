/* Pesca con caña: lanzar, esperar, picada (sombra + porcentajes), combate y captura */
window.G = window.G || {};

G.Fish = (function () {
  const U = G.U, PXM = G.PXM;
  const F = {
    state: 'idle', // idle | charge | cast | wait | nibble | bite | fight | result
    aim: -Math.PI / 2, power: 0, chargeT: 0,
    target: { x: 0, y: 0 }, bob: { x: 0, y: 0, h: 0 }, castT: 0, waitT: 0, t: 0,
    cur: null, // pez que pica
    fight: null, rings: [], baitUsed: null, emptyTries: 0,
  };

  const isNight = () => G.env.night > 0.5;
  const modeNow = () => (G.S.onPaddle ? 'paddle' : 'orilla');

  /* ---- Selección de especie ---- */
  function litAt(x, y) {
    let lit = 0;
    if (isNight()) {
      if (G.S.owned.extras.includes('lampara')) lit = 0.85;
      for (const l of G.World.lamps) if (Math.hypot(l.x - x, l.y - y) < l.r * 0.9) lit = Math.max(lit, 0.6);
    }
    return lit;
  }
  function candidates(x, y) {
    const h = G.World.habitatAt(x, y), mode = modeNow(), hookTier = G.hook().tier;
    const bi = G.BAIT_INDEX[G.S.eq.bait] || 0, night = isNight(), sw = G.env.swell, lit = litAt(x, y);
    const out = [];
    for (const sp of G.SPECIES) {
      if (!sp.modes.includes(mode)) continue;
      if (h.depth < sp.dmin || h.depth > sp.dmax) continue;
      if (!(sp.hab.includes('O') || sp.hab.includes(h.hab))) continue;
      if (!hookFits(sp)) continue;
      if (G.RAR_ORDER.indexOf(sp.rar) > G.BAITS[bi].maxRar) continue;
      const bt = G.BAITS[bi];
      let bf = sp.bait[bi]; if (bt.tier === 3) bf = Math.max(bf, 0.8);
      let w = G.RARITY[sp.rar].weight * bf;
      if (bt.tier === 2 && G.RAR_ORDER.indexOf(sp.rar) >= 3) w *= 0.4;
      if (sp.time === 'noche') w *= night ? 1.7 : 0.12;
      else if (sp.time === 'dia') w *= night ? 0.12 : 1.4;
      if (sp.sw === 'high') w *= 0.6 + 0.5 * sw;
      else if (sp.sw === 'low') w *= 1.6 - 0.45 * sw;
      else if (sp.sw === 'mid') w *= 1 + 0.15 * (sw === 1 || sw === 2 ? 1 : 0);
      if (sp.light && lit) w *= 1 + 1.6 * lit;
      if (h.hab === 'R' && sp.hab.includes('R') && !sp.hab.includes('O')) w *= 1.3;
      if (w > 0) out.push({ sp, w });
    }
    return out;
  }
  function pickSpecies(x, y, school) {
    const c = candidates(x, y);
    if (school && school.sp && Math.random() < 0.65) { const hit = c.find(o => o.sp === school.sp); if (hit) return hit.sp; }
    const pick = U.weighted(c, o => o.w);
    return pick ? pick.sp : null;
  }

  /* ¿cabe este pez en el anzuelo? (el largo del pez debe caer en el rango del anzuelo) */
  function hookFits(sp) { return G.hookFitsSp(G.hook(), sp); }
  function makeSize(sp) {
    // el tamaño sale del rango que admite el anzuelo
    const r = G.hook().cm, span = Math.max(1, sp.cm[1] - sp.cm[0]);
    const s0 = U.clamp((r[0] - sp.cm[0]) / span, 0, 1), s1 = U.clamp((r[1] - sp.cm[0]) / span, 0, 1);
    let raw = Math.pow(Math.random(), 1.8);
    if (Math.random() < 0.03) raw = 0.9 + Math.random() * 0.1;
    return s0 + (s1 - s0) * raw;
  }
  function gearPoints(sp, sizeF) {
    const bait = G.BAITS.find(b => b.id === G.S.eq.bait), bi = G.BAIT_INDEX[bait.id];
    const parts = [
      ['Caña', G.rod().pts], ['Hilo', G.line().pts], ['Anzuelo', G.hook().pts],
      ['Cebo', bait.pts + (sp.bait[bi] >= 1.5 ? 3 : 0)],
    ];
    if (isNight() && G.S.owned.extras.includes('lampara')) parts.push(['Lámpara', 3]);
    if (G.env.swell > 0) parts.push(['Oleaje', -Math.round(G.env.swell * 1.5)]);
    if (G.S.onPaddle) parts.push(['Tabla', -2]);
    let gear = Math.max(1, parts.reduce((a, p) => a + p[1], 0));
    // los peces grandes son mucho más duros y, si pesan más de lo que aguantan caña e hilo, es casi imposible
    const kg = U.lerp(sp.kg[0], sp.kg[1], Math.pow(sizeF, 1.6)), cap = Math.min(G.rod().cap, G.line().cap);
    if (kg > cap) { const over = kg / cap, loss = Math.round(gear * (1 - 1 / (1 + (over - 1) * 2.5))); parts.push(['Pez demasiado grande', -loss]); gear = Math.max(1, gear - loss); }
    const diff = Math.round(sp.diff * (0.75 + 1.1 * Math.pow(sizeF, 1.3)));
    return { parts, gear, diff, pct: Math.round(gear / (gear + diff) * 100) };
  }

  /* ---- Geometría ---- */
  F.rodTip = function () {
    const a = F.state === 'idle' ? G.P.ang : F.aim;
    return { x: G.P.x + Math.cos(a) * 44.5 * G.PS, y: G.P.y + Math.sin(a) * 44.5 * G.PS - 1 };
  };
  F.busy = () => F.state !== 'idle';
  F.locked = () => ['charge', 'cast', 'bite', 'fight', 'steal', 'result'].includes(F.state);

  function reachDist(a) {
    // máxima distancia en metros según caña y límites (boyas, costa)
    let m = G.rod().reach;
    const dy = Math.sin(a);
    if (dy < -0.02) m = Math.min(m, (G.P.y - (G.BUOY_Y + 10)) / (-dy) / PXM);
    return Math.max(4, m);
  }
  function aimPoint(a, power) {
    const dm = U.lerp(4, reachDist(a), power);
    return { x: G.P.x + Math.cos(a) * dm * PXM, y: G.P.y + Math.sin(a) * dm * PXM, dm };
  }
  function validTarget(p) {
    return p.x > 30 && p.x < G.World.PORT_FENCE_X - 30 && p.y < G.World.shoreY(p.x) - 12 && p.y > G.BUOY_Y + 4 && !G.World.inPier(p.x, p.y, 6);
  }

  /* ---- Control ---- */
  F.press = function () {
    const st = F.state;
    if (G.P.act) return;
    if (st === 'idle') {
      if (G.UI.modalOpen()) return;
      if (G.S.phase !== 'day') { G.UI.toast('Primero empieza la jornada: ▶ Empezar día', 'warn'); return; }
      if (!G.S.baits[G.S.eq.bait] || G.S.baits[G.S.eq.bait] <= 0) {
        // buscar otro cebo
        const alt = G.BAITS.find(b => G.S.baits[b.id] > 0);
        if (!alt) { G.UI.toast('¡No te quedan cebos! Compra en la Tienda 🏪', 'warn'); return; }
        G.S.eq.bait = alt.id; G.UI.toast('Cambias a ' + alt.name.toLowerCase());
      }
      F.state = 'charge'; F.chargeT = 0; F.power = 0;
      const I = G.Input;
      F.aim = G.P.ang < -0.2 && G.P.ang > -2.94 ? G.P.ang : -Math.PI / 2;
    } else if (st === 'wait' || st === 'nibble') {
      F.retrieve(st === 'wait');
    } else if (st === 'bite') {
      F.strike();
    } else if (st === 'result') {
      /* se cierra desde la interfaz */
    }
  };
  F.release = function () {
    if (F.state === 'charge') {
      const p = aimPoint(F.aim, F.power);
      if (!validTarget(p)) { F.state = 'idle'; G.UI.toast('Apunta hacia el mar 🌊', 'warn'); G.UI.fishHud(null); return; }
      doCast(p);
    }
  };

  function doCast(p) {
    const sw = G.env.swellF;
    const dev = sw * 5;
    F.target = { x: p.x + U.rand(-dev, dev), y: p.y + U.rand(-dev, dev) * 0.6 };
    if (!validTarget(F.target)) F.target = { x: p.x, y: p.y };
    F.bob = { x: F.rodTip().x, y: F.rodTip().y, h: 0 };
    F.from = { x: F.bob.x, y: F.bob.y };
    F.castT = 0; F.state = 'cast';
    G.S.baits[G.S.eq.bait]--; F.baitUsed = G.S.eq.bait;
    G.S.stats.casts++;
    F.emptyTries = 0;
    F.school = G.World.schoolAt(F.target.x, F.target.y, G.env.t);
    F.barren = !F.school && Math.random() < 0.55;
    G.Audio.play('whoosh');
    G.UI.refreshHud();
  }

  F.retrieve = function (refund) {
    if (refund && F.baitUsed) { G.S.baits[F.baitUsed]++; G.UI.toast('Recoges el sedal'); }
    else if (F.state === 'nibble') G.UI.toast('Recogiste demasiado pronto', 'warn');
    F.state = 'idle'; F.cur = null; F.rings.length = 0;
    G.UI.fishHud(null); G.UI.refreshHud();
  };

  F.strike = function () {
    if (F.state !== 'bite') return;
    G.Audio.play('strike');
    F.state = 'fight';
    const P = F.cur.info.pct / 100;
    F.fight = {
      prog: 15 + 25 * P, tens: 15, mode: 'calm', modeT: U.rand(0.8, 1.4), P, t: 0,
      pos: { x: F.target.x, y: F.target.y }, wob: 0, flash: 0,
    };
    F.fight.start = { x: F.target.x, y: F.target.y };
    // 1 de cada 15 peces: una gaviota intenta quedárselo
    F.fight.gull = Math.random() < 1 / 15 ? { st: 'wait', at: U.rand(2.5, 5), t: 0 } : null;
    G.UI.fishHud({ phase: 'fight' });
  };

  /* ---- Actualización ---- */
  F.update = function (dt) {
    F.t += dt;
    for (const r of F.rings) r.t += dt;
    F.rings = F.rings.filter(r => r.t < r.life);
    const st = F.state;
    if ((st === 'wait' || st === 'nibble' || st === 'bite') && G.World.swimmerAt(F.target.x, F.target.y, G.env.t, G.env.hour)) { hookSwimmer(); return; }
    if (st === 'charge') {
      F.chargeT += dt;
      F.power = 0.5 - 0.5 * Math.cos(F.chargeT * Math.PI * 2 / 1.7);
      const I = G.Input;
      if (I.mag > 0.25) {
        let a = Math.atan2(I.y, I.x);
        if (a > 0) a = I.x >= 0 ? -0.12 : -Math.PI + 0.12;
        F.aim = U.clamp(a, -Math.PI + 0.12, -0.12);
      }
      G.P.ang = F.aim;
      const p = aimPoint(F.aim, F.power), h = G.World.habitatAt(p.x, p.y);
      G.UI.fishHud({ phase: 'charge', power: F.power, dm: Math.round(p.dm), hab: G.HAB_NAMES[h.hab], depth: Math.round(h.depth), ok: validTarget(p) });
    } else if (st === 'cast') {
      F.castT += dt / 0.6;
      const u = Math.min(1, F.castT);
      F.bob.x = U.lerp(F.from.x, F.target.x, u); F.bob.y = U.lerp(F.from.y, F.target.y, u);
      F.bob.h = Math.sin(u * Math.PI) * (30 + Math.hypot(F.target.x - F.from.x, F.target.y - F.from.y) * 0.18);
      if (u >= 1) {
        F.bob.h = 0; F.state = 'wait';
        F.rings.push({ x: F.target.x, y: F.target.y, t: 0, life: 1.8, big: true });
        G.Audio.play('splash');
        const bt = G.BAITS.find(b => b.id === F.baitUsed) || G.BAITS[0];
        F.waitT = U.rand(5, 11) * (1.05 - G.env.swell * 0.05) * bt.wait;
        if (isNight() && G.S.owned.extras.includes('lampara')) F.waitT *= 0.8;
        if (F.school) F.waitT *= 0.55;
        if (F.barren) F.waitT = U.rand(6, 9);
        G.UI.fishHud({ phase: 'wait' });
      }
    } else if (st === 'wait') {
      F.waitT -= dt;
      if (Math.random() < dt * 0.9) F.rings.push({ x: F.target.x + U.rand(-4, 4), y: F.target.y + U.rand(-3, 3), t: 0, life: 1.4 });
      if (F.waitT <= 0) {
        if (F.barren) { G.UI.toast('No se mueve nada… aquí no hay peces. Busca sombras en el agua 👀', 'warn'); F.retrieve(true); return; }
        if (Math.random() < 0.06 + 0.035 * G.env.swell) { hookTrash(); return; }
        const sp = pickSpecies(F.target.x, F.target.y, F.school);
        if (!sp) {
          F.emptyTries++;
          if (F.emptyTries >= 3) { G.UI.toast('Aquí no pica nada con este cebo y anzuelo. Prueba otro anzuelo, cebo o lugar.', 'warn'); F.retrieve(true); return; }
          F.waitT = U.rand(5, 9); return;
        }
        const sizeF = makeSize(sp);
        F.cur = { sp, sizeF, info: gearPoints(sp, sizeF), cm: Math.round(U.lerp(sp.cm[0], sp.cm[1], sizeF)), kg: Math.round(U.lerp(sp.kg[0], sp.kg[1], Math.pow(sizeF, 1.6)) * 100) / 100 };
        F.state = 'nibble'; F.nibT = U.rand(0.9, 1.7); F.nibTick = 0;
        G.UI.fishHud({ phase: 'nibble' });
      }
    } else if (st === 'nibble') {
      F.nibT -= dt; F.nibTick -= dt;
      if (F.nibTick <= 0) { F.nibTick = 0.28; G.Audio.play('nibble'); F.rings.push({ x: F.target.x, y: F.target.y, t: 0, life: 0.9 }); }
      if (F.nibT <= 0) {
        F.state = 'bite'; F.biteT = 0;
        F.biteWin = U.clamp(2.0 - F.cur.info.diff * 0.008, 1.2, 2.0);
        const a = Math.random() * 6.28;
        F.shadowFrom = { x: F.target.x + Math.cos(a) * 90, y: F.target.y + Math.sin(a) * 90 };
        G.Audio.play('bite');
        if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { }
        const known = !!G.S.album[F.cur.sp.id];
        G.UI.fishHud({
          phase: 'bite', known, name: known ? F.cur.sp.name : '???', info: F.cur.info, cm: F.cur.cm, kg: F.cur.kg,
          rar: known ? F.cur.sp.rar : null,
        });
      }
    } else if (st === 'bite') {
      F.biteT += dt;
      if (Math.random() < dt * 5) F.rings.push({ x: F.target.x, y: F.target.y, t: 0, life: 0.8 });
      G.UI.fishHud({ phase: 'bite', timeLeft: 1 - F.biteT / F.biteWin, known: !!G.S.album[F.cur.sp.id], name: G.S.album[F.cur.sp.id] ? F.cur.sp.name : '???', info: F.cur.info, cm: F.cur.cm, kg: F.cur.kg, rar: G.S.album[F.cur.sp.id] ? F.cur.sp.rar : null });
      if (F.biteT >= F.biteWin) {
        G.UI.toast('Se ha comido el cebo y se ha ido 😕', 'warn');
        F.state = 'idle'; F.cur = null; G.UI.fishHud(null); G.UI.refreshHud();
      }
    } else if (st === 'fight') {
      updateFight(dt);
    } else if (st === 'steal') {
      updateSteal(dt);
    }
  };

  function updateFight(dt) {
    const f = F.fight, I = G.Input, ln = G.line();
    f.t += dt;
    // la gaviota: mientras ataca, recoger cuesta más, el pez tira más y sube la tensión
    let gd = 0; const g = f.gull;
    if (g) {
      if (g.st === 'wait' && f.t >= g.at) {
        g.st = 'dive'; g.t = 0; const a0 = U.rand(-2.7, -0.4);
        g.sx = f.pos.x + Math.cos(a0) * 280; g.sy = f.pos.y + Math.sin(a0) * 280;
        G.UI.toast('🕊️ ¡Una gaviota va a por tu pez! Recoge rápido', 'warn'); G.Audio.play('gull');
      } else if (g.st === 'dive') {
        g.t += dt; gd = 1;
        if (f.prog >= 85) { g.st = 'flee'; g.t = 0; g.px = g.x != null ? g.x : f.pos.x; g.py = g.y != null ? g.y : f.pos.y; G.UI.toast('¡La gaviota se asusta y se va!', 'good'); }
        else if (g.t >= 3.4) { startSteal(); return; }
      } else if (g.st === 'flee') { g.t += dt; if (g.t > 1.6) f.gull = null; }
    }
    const reeling = I.castHeld;
    f.modeT -= dt;
    if (f.modeT <= 0) {
      if (f.mode === 'calm') { f.mode = 'pull'; f.modeT = U.rand(0.7, 1.3); f.flash = 1; G.Audio.play('strike'); if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) { } }
      else { f.mode = 'calm'; f.modeT = U.rand(1.2, 2.4); }
    }
    const tired = 1 - Math.min(0.5, f.t / 45);
    const pullBack = (6 + 16 * (1 - f.P)) * tired;
    const reelRate = (10 + 16 * f.P) * (1 - 0.35 * gd);
    if (reeling) {
      f.prog += reelRate * dt * (f.mode === 'pull' ? 0.35 : 1);
      f.tens += ((f.mode === 'pull' ? 70 : 34) * ln.tension + 14 * gd) * dt;
      if (f.mode === 'pull') f.prog -= pullBack * 0.4 * dt;
      f.reelTick = (f.reelTick || 0) - dt; if (f.reelTick <= 0) { f.reelTick = 0.09; G.Audio.play('reel'); }
    } else {
      f.tens -= 38 * dt;
      f.prog -= (f.mode === 'pull' ? pullBack : 2 + 7 * gd) * dt;
    }
    f.tens = Math.max(0, f.tens);
    f.flash = Math.max(0, f.flash - dt * 2);
    // posición del pez
    const dx = G.P.x - f.start.x, dy = G.P.y - f.start.y, k = 1 - U.clamp(f.prog, 0, 100) / 100;
    const px = -dy, py = dx, pl = Math.hypot(px, py) || 1;
    const lat = Math.sin(f.t * (f.mode === 'pull' ? 6 : 2.2)) * (14 + 22 * k);
    f.pos = { x: f.start.x + dx * (1 - k) * 0.96 + px / pl * lat * k, y: f.start.y + dy * (1 - k) * 0.96 + py / pl * lat * k };
    // en la orilla no atraviesa la arena: llega hasta la espuma
    if (!G.S.onPaddle && !G.World.inPier(G.P.x, G.P.y, 8)) f.pos.y = Math.min(f.pos.y, G.World.shoreY(f.pos.x) - 6);
    F.target = { x: f.pos.x, y: f.pos.y };
    if (Math.random() < dt * 8) F.rings.push({ x: f.pos.x, y: f.pos.y, t: 0, life: 0.7 });
    G.UI.fishHud({ phase: 'fight', prog: f.prog, tens: f.tens, pull: f.mode === 'pull', gull: !!(f.gull && f.gull.st === 'dive'), info: F.cur.info, name: G.S.album[F.cur.sp.id] ? F.cur.sp.name : '???' });
    if (f.tens >= 100) { endFight(false, 'snap'); }
    else if (f.prog >= 100) { endFight(true); }
    else if (f.prog <= 0) { endFight(false, 'escape'); }
  }

  /* El flotador toca a un bañista: se engancha, corta el hilo y se acaba la pesca */
  const SWIM_LINES = ['¡Eh, cabrón, que me has enganchao!', '¡Quita el hilo, animal, que estoy nadando!', '¡Cabrón, que me has pescao a mí! ¡Suelta!', '¡Oye, tú! ¡Que me has clavado el anzuelo en el bañador!'];
  function hookSwimmer() {
    F.state = 'result'; F.rings.length = 0; F.cur = null; G.UI.fishHud(null);
    G.Audio.play('snap'); if (navigator.vibrate) try { navigator.vibrate([60, 40, 60]); } catch (e) { }
    G.S.stats.bathers = (G.S.stats.bathers || 0) + 1;
    G.UI.showMsg('🏊 ¡Has enganchado a un bañista!',
      '<div style="background:#fff;color:#1b2a3a;border-radius:16px;padding:10px 14px;font-weight:800;margin:8px 0;line-height:1.3">🗯️ «' + U.pick(SWIM_LINES) + '»</div>Cortas el hilo para soltarlo: pierdes el cebo y dejas de pescar. Lanza lejos de los bañistas.',
      () => { F.state = 'idle'; F.cur = null; });
  }

  /* A veces lo que pica es basura: lata, botella, vaper o bolsa */
  function hookTrash() {
    const it = U.pick(G.TRASH);
    G.S.stats.trash = (G.S.stats.trash || 0) + 1; G.S.trashLog[it.id] = (G.S.trashLog[it.id] || 0) + 1; G.Ach.check();
    F.state = 'result'; F.rings.length = 0; G.UI.fishHud(null);
    G.Audio.play('lose'); G.save(); G.UI.refreshHud();
    G.UI.showTrash(it, () => { F.state = 'idle'; F.cur = null; });
  }

  /* La gaviota agarra el pez y se lo lleva volando */
  function startSteal() {
    const f = F.fight, g = f.gull;
    F.state = 'steal'; F.steal = { t: 0, sx: g.x != null ? g.x : f.pos.x + 40, sy: g.y != null ? g.y : f.pos.y - 40, fx: f.pos.x, fy: f.pos.y, sp: F.cur.sp, cm: F.cur.cm };
    F.rings.length = 0; G.UI.fishHud(null); G.Audio.play('gull'); G.Audio.play('snap');
  }
  function updateSteal(dt) {
    const s = F.steal; s.t += dt;
    if (s.t >= 2.1) {
      F.state = 'result';
      G.UI.showMsg('🕊️ ¡Una gaviota se ha llevado tu pez!', 'Estaba a punto de ser tuyo. La próxima vez recoge más rápido cuando la veas bajar.', () => { F.state = 'idle'; F.cur = null; });
    }
  }
  function gullSprite(c, x, y, ang, alt, t, carry) {
    c.fillStyle = 'rgba(0,0,0,0.16)'; c.beginPath(); c.ellipse(x + alt * 0.35, y + alt * 0.5 + 2, 10, 3.2, ang, 0, 6.3); c.fill();
    c.save(); c.translate(x, y - alt); c.rotate(ang);
    const flap = Math.sin(t * 14) * 0.55;
    if (carry) G.FishArt.draw(c, carry.sp, 2, 8, U.clamp(15 + carry.cm * 0.4, 18, 38), 0.35, { ph: t * 34 });
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, 0, 9.5, 3.6, 0, 0, 6.3); c.fill();
    c.beginPath(); c.moveTo(0, -1); c.lineTo(-3, -15 - flap * 7); c.lineTo(4, -2); c.moveTo(0, 1); c.lineTo(-3, 15 + flap * 7); c.lineTo(4, 2); c.fill();
    c.fillStyle = '#8f9aa3'; c.beginPath(); c.arc(7, 0, 3, 0, 6.3); c.fill();
    c.fillStyle = '#e8a33a'; c.fillRect(9.5, -1, 3.6, 2.2);
    c.restore();
  }
  function gullDraw(c) {
    const t = G.env.t, f = F.fight;
    if (F.state === 'fight' && f && f.gull && (f.gull.st === 'dive' || f.gull.st === 'flee')) {
      const g = f.gull;
      if (g.st === 'dive') {
        const p = U.smooth(Math.min(1, g.t / 3.4)), tx = f.pos.x + Math.sin(t * 5) * 6, ty = f.pos.y + Math.cos(t * 4) * 5;
        g.x = U.lerp(g.sx, tx, p); g.y = U.lerp(g.sy, ty, p);
        gullSprite(c, g.x, g.y, Math.atan2(ty - g.sy, tx - g.sx), U.lerp(90, 10, p) + Math.sin(t * 9) * 2, t, null);
      } else {
        const p = U.smooth(Math.min(1, g.t / 1.6)), x = U.lerp(g.px, g.sx, p), y = U.lerp(g.py, g.sy, p);
        gullSprite(c, x, y, Math.atan2(g.sy - g.py, g.sx - g.px), U.lerp(14, 110, p), t, null);
      }
    } else if (F.state === 'steal' && F.steal) {
      const s = F.steal, u = s.t;
      if (u < 0.7) { const p = U.smooth(u / 0.7); gullSprite(c, U.lerp(s.sx, s.fx, p), U.lerp(s.sy, s.fy, p), Math.atan2(s.fy - s.sy, s.fx - s.sx), U.lerp(10, 5, p), t, null); G.FishArt.draw(c, s.sp, s.fx, s.fy, U.clamp(15 + s.cm * 0.4, 18, 38), 0.4 + Math.sin(t * 20) * 0.3, { ph: t * 30 }); }
      else { const p = U.smooth(Math.min(1, (u - 0.7) / 1.4)); gullSprite(c, U.lerp(s.fx, s.fx + 260, p), U.lerp(s.fy, s.fy - 200, p), -0.6, U.lerp(5, 120, p), t, { sp: s.sp, cm: s.cm }); }
    }
  }

  function endFight(win, why) {
    const c = F.cur;
    F.state = 'result';
    G.UI.fishHud(null);
    F.rings.length = 0;
    if (win) {
      const sp = c.sp, s = c.sizeF;
      const cm = Math.round(U.lerp(sp.cm[0], sp.cm[1], s));
      const kg = Math.round(U.lerp(sp.kg[0], sp.kg[1], Math.pow(s, 1.6)) * 1000) / 1000;
      const value = Math.round(kg * sp.eurKg * U.rand(0.92, 1.08) * 100) / 100;
      const catchObj = { id: U.uid(), sp: sp.id, cm, kg, value, day: G.S.day };
      F.landed(catchObj);
    } else {
      G.Audio.play(why === 'snap' ? 'snap' : 'lose');
      G.UI.showMsg(why === 'snap' ? '💥 ¡Se ha roto el hilo!' : '🐟 ¡Se ha escapado!', why === 'snap' ? 'La tensión fue demasiada. Suelta el sedal cuando el pez tire y mejora tu hilo.' : 'El pez ha ganado esta vez. Recoge solo cuando no tire.', () => { F.state = 'idle'; F.cur = null; });
    }
  }

  /* Captura común a caña, buceo, etc. */
  F.landed = function (catchObj, source) {
    const sp = G.SPECIES_BY_ID[catchObj.sp];
    const rec = G.S.album[sp.id];
    const isNew = !rec;
    const isRecord = rec && (catchObj.kg > rec.maxKg);
    catchObj.fresh = 100;
    if (Math.random() < 0.125) { catchObj.fresh = Math.round(U.rand(50, 70)); catchObj.hurt = U.pick(['Mordido por otro pez', 'Herido en la lucha', 'Con la piel dañada', 'Mordisqueado por cangrejos']); }
    if (isNew) G.S.album[sp.id] = { n: 1, maxCm: catchObj.cm, maxKg: catchObj.kg, day: G.S.day };
    else { rec.n++; rec.maxCm = Math.max(rec.maxCm, catchObj.cm); rec.maxKg = Math.max(rec.maxKg, catchObj.kg); }
    G.S.stats.fish++;
    G.Audio.play(sp.rar === 'comun' || sp.rar === 'poco' ? 'win' : 'rare');
    let bonus = 0;
    const n = G.speciesCount();
    if (isNew && G.MILESTONES[n] && !G.S.milestones.includes(n)) { bonus = G.MILESTONES[n]; G.S.milestones.push(n); G.S.money += bonus; }
    // logros y gemas
    { const A = G.Ach; if (G.env.night > 0.5) A.count('night'); if (G.S.onPaddle) A.count('paddle'); if (G.env.swell >= 3) A.count('storm'); if (G.World.inPier(G.P.x, G.P.y, 6)) A.count('pier'); if (source === 'dive') A.count('spear');
      if (isNew) A.gems(1, '⭐ Nueva especie: ' + sp.name); A.check(); }
    G.save();
    G.UI.refreshHud();
    const fin = () => { if (!source) { F.state = 'idle'; F.cur = null; } };
    const full = G.S.bag.length >= G.coolerCap();
    G.UI.showCatch(catchObj, { isNew, isRecord, bonus, n, full }, (keep, rect) => {
      // 1) devolverla al mar
      if (!keep) {
        G.S.stats.released = (G.S.stats.released || 0) + 1; if (sp.prot) G.Ach.count('protRel'); G.Ach.check();
        G.Char.startAct('release', sp, catchObj, null); G.UI.toast('Devuelves ' + sp.name.toLowerCase() + ' al mar 🌊', sp.prot ? 'good' : '');
        G.save(); return fin();
      }
      // 2) especie protegida: la policía puede verte al instante
      if (sp.prot) {
        if (Math.random() < G.PROT_CHANCE) {
          const fine = Math.round(catchObj.value * G.PROT_FINE * 100) / 100, paid = Math.min(fine, G.S.money);
          G.S.money = Math.round((G.S.money - paid) * 100) / 100; G.S.stats.fines = (G.S.stats.fines || 0) + 1; G.Audio.play('snap'); G.save(); G.UI.refreshHud();
          return G.UI.showMsg('🚔 ¡Sanción de la policía!', 'Una patrulla te ha visto con ' + sp.name.toLowerCase() + ', una especie protegida. Te lo confiscan y te multan con ' + G.U.money(paid) + ' (' + G.PROT_FINE + ' veces su valor)' + (paid < fine ? ', todo lo que llevabas encima' : '') + '.', fin);
        }
        G.UI.toast('Nadie te ha visto… esta vez 😅', 'warn');
      }
      // 3) guardarla en la nevera (o elegir qué soltar si está llena)
      G.S.dayLog.fish++;
      if (full) return G.UI.showSwap(catchObj, fin, rect);
      G.S.bag.push(catchObj); G.save();
      if (G.Dive && G.Dive.active) G.UI.bumpCooler(); else G.Char.startAct('store', sp, catchObj, null);
      fin();
    });
  };

  /* ---- Dibujo ---- */
  F.drawUnder = function (ctx) {
    const t = G.env.t;
    // anillos
    for (const r of F.rings) {
      const u = r.t / r.life;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - u)) + ')'; ctx.lineWidth = r.big ? 2.5 : 1.6;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, 4 + u * (r.big ? 34 : 20), (4 + u * (r.big ? 34 : 20)) * 0.8, 0, 0, 6.3); ctx.stroke();
    }
    const st = F.state;
    if ((st === 'bite' || st === 'nibble' || st === 'fight') && F.cur) {
      const sp = F.cur.sp, cm = U.lerp(sp.cm[0], sp.cm[1], F.cur.sizeF);
      const len = U.clamp(26 + cm * 0.85, 30, 190);
      let x, y, ang, ph = t * 9;
      if (st === 'fight') {
        const f = F.fight;
        x = f.pos.x; y = f.pos.y;
        ang = Math.atan2(G.P.y - y, G.P.x - x) + Math.PI + Math.sin(f.t * 5) * 0.5;
        ph = t * (f.mode === 'pull' ? 22 : 11);
      } else if (st === 'bite') {
        const u = U.smooth(U.clamp(F.biteT / 0.9, 0, 1));
        const orbit = (1 - u) * 1 + 0.15;
        x = U.lerp(F.shadowFrom.x, F.target.x, u) + Math.cos(t * 3) * 10 * orbit;
        y = U.lerp(F.shadowFrom.y, F.target.y, u) + Math.sin(t * 3) * 8 * orbit;
        ang = Math.atan2(F.target.y - F.shadowFrom.y, F.target.x - F.shadowFrom.x) + (u > 0.95 ? Math.sin(t * 8) * 0.6 : 0);
      } else { // nibble: sombra rondando
        const a = t * 2.2;
        x = F.target.x + Math.cos(a) * 46; y = F.target.y + Math.sin(a) * 36; ang = a + Math.PI / 2;
      }
      G.FishArt.draw(ctx, sp, x, y, len, ang, { shadow: true, ph, alpha: st === 'nibble' ? 0.45 : 0.8 });
    }
  };

  F.draw = function (ctx) {
    const st = F.state;
    const tip = F.rodTip();
    // preview al apuntar
    if (st === 'charge') {
      const p = aimPoint(F.aim, F.power), ok = validTarget(p);
      const rp = aimPoint(F.aim, 1);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([5, 7]); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(rp.x, rp.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = ok ? 'rgba(255,255,255,0.9)' : 'rgba(255,90,70,0.95)'; ctx.lineWidth = 3;
      const rr = 14 + Math.sin(G.env.t * 6) * 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.3); ctx.stroke();
      ctx.fillStyle = ok ? 'rgba(255,255,255,0.9)' : 'rgba(255,90,70,0.95)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, 6.3); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr + 9, 0, 6.3); ctx.stroke();
      return;
    }
    if (st === 'idle' || st === 'result') return;
    // sedal
    const b = F.bob;
    let bx = st === 'cast' ? b.x : F.target.x, by = st === 'cast' ? b.y - b.h : F.target.y;
    if (st === 'wait' || st === 'nibble') by += Math.sin(G.env.t * 2 + 1) * 1.2;
    if (st === 'nibble') by += Math.sin(G.env.t * 30) * 1.5;
    if (st === 'bite') by += Math.sin(G.env.t * 22) * 2.5;
    const taut = st === 'fight' ? U.clamp(F.fight.tens / 100, 0, 1) : 0;
    const sag = st === 'fight' ? 6 * (1 - taut) : 16 + (st === 'cast' ? 0 : 6);
    const mx = (tip.x + bx) / 2, my = (tip.y + by) / 2 + sag;
    const lineCol = st === 'fight' ? `rgba(255,${255 - taut * 170 | 0},${255 - taut * 200 | 0},0.95)` : 'rgba(255,255,255,0.8)';
    ctx.strokeStyle = lineCol; ctx.lineWidth = st === 'fight' ? 1.8 + taut * 1.2 : 1.3;
    ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.quadraticCurveTo(mx, my, bx, by); ctx.stroke();
    // flotador
    if (st === 'fight') return;
    if (st === 'cast') { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(b.x + 4, b.y + 6, 5, 3, 0, 0, 6.3); ctx.fill(); }
    const s = 1 + (st === 'cast' ? b.h / 120 : 0);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx, by, 5.5 * s, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(bx, by, 5.5 * s, Math.PI, 6.3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1; ctx.stroke();
    if (st === 'bite') {
      ctx.strokeStyle = 'rgba(255,230,80,0.9)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(bx, by, 14 + Math.sin(G.env.t * 14) * 3, 0, 6.3); ctx.stroke();
    }
  };

  const baseDraw = F.draw; F.draw = function (ctx) { baseDraw(ctx); gullDraw(ctx); };
  F.pickSpecies = pickSpecies; F.candidates = candidates; F.gearPoints = gearPoints; F.validTarget = validTarget;
  return F;
})();
