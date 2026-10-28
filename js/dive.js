/* Pesca submarina por decisiones (texto): arpón, aletas, neopreno y gafas. Hasta 200 m de la orilla. */
window.G = window.G || {};

G.Dive = (function () {
  const U = G.U;
  const $ = (id) => document.getElementById(id);
  const D = { active: false };
  let st = null;

  const SCENE = {
    R: ['una gran roca cubierta de algas, con grietas oscuras a su alrededor', 'un arrecife de piedra con cuevas y salientes', 'un bloque rocoso con erizos y esponjas'],
    P: ['una pradera de posidonia que ondula con la corriente', 'un manto de hierba marina alta, lleno de sombras', 'praderas de posidonia con claros de arena'],
    A: ['un fondo de arena fina con rizado de oleaje', 'una llanura de arena, con alguna concha suelta', 'arena clara con huellas de rayas'],
    O: ['agua azul y profunda, sin fondo a la vista', 'un azul infinito, con partículas flotando en la luz', 'aguas abiertas donde el sol dibuja rayos'],
  };
  const SHAPE_DESC = {
    fish: 'un pez de reflejos plateados', tuna: 'un pez fusiforme y veloz', long: 'una forma alargada y ondulante', flat: 'una silueta plana pegada al fondo',
    round: 'una forma redonda y torpe', octo: 'algo blando que cambia de color', crab: 'un crustáceo de patas rápidas', shrimp: 'un crustáceo de largas antenas',
    lobster: 'un crustáceo con antenas gigantes', urchin: 'una bola de púas', shark: 'una silueta de aleta dorsal alta', sword: 'una silueta con una espada en la cara',
  };

  const waterDepth = (dist) => U.clamp(1.5 + dist * 0.25, 1.5, 30);
  const bottomReachable = () => true; // el fondo siempre se puede alcanzar; lejos de la orilla cuesta el doble de aire
  const depthM = () => st.lvl === 0 ? 0 : st.lvl === 1 ? Math.min(6, Math.round(waterDepth(st.dist) * 0.45)) : Math.round(waterDepth(st.dist));
  const depthName = () => st.lvl === 0 ? 'Superficie' : st.lvl === 1 ? `Media agua · ${depthM()} m` : `Fondo · ${depthM()} m`;
  const spearIdx = () => G.SPEARS.findIndex(s => s.id === G.S.eq.spear);
  const isNight = () => G.env.night > 0.5;

  function habHere() {
    const x = G.World.DIVE.x + st.lat, y = G.WORLD.shore - st.dist * G.PXM + 4;
    return G.World.habitatAt(x, y).hab;
  }
  function log(text, cls) { st.log.push({ text, cls: cls || '' }); if (st.log.length > 7) st.log.shift(); }
  function tick(air, hours) { st.air -= air * (st.dist > 100 ? 2 : 1); G.addTime(hours == null ? 0.03 : hours); }

  /* --- Especies posibles aquí --- */
  function candidates() {
    const hab = habHere(), si = spearIdx(), night = isNight();
    const out = [];
    for (const sp of G.SPECIES) {
      if (!sp.modes.includes('sub')) continue;
      if (st.dist < sp.dmin || st.dist > sp.dmax) continue;
      if (!(sp.hab.includes('O') || sp.hab.includes(hab))) continue;
      if (Math.min(3, Math.max(0, sp.hook - 1)) > si) continue;
      const deepOnly = sp.dmin >= 120; // lo grande y valioso vive en el fondo, muy mar adentro
      if (deepOnly && st.lvl < 2) continue;
      const pelagic = sp.hab.includes('O') && sp.dmin >= 60 && !deepOnly;
      if (pelagic && st.lvl === 2) continue;
      if (!pelagic && st.lvl === 0 && st.dist > 20) continue;
      let w = G.RARITY[sp.rar].weight;
      if (sp.time === 'noche') w *= night ? 1.7 : 0.15; else if (sp.time === 'dia') w *= night ? 0.15 : 1.4;
      if (st.lvl === 2 && !pelagic) w *= 1.4;
      out.push({ sp, w });
    }
    return out;
  }
  function makeEnc(visible) {
    const pick = U.weighted(candidates(), o => o.w);
    if (!pick) return null;
    let s = Math.pow(Math.random(), 1.8); if (Math.random() < 0.04) s = 0.92;
    const sp = pick.sp;
    return { sp, sizeF: s, d: visible ? U.rand(5, 11) : U.rand(2.5, 4.5), diff: Math.round(sp.diff * (0.85 + 0.3 * s)), seen: visible };
  }
  function encName(e) { return G.S.album[e.sp.id] ? e.sp.name.toLowerCase() : SHAPE_DESC[e.sp.shape]; }
  function sizeWord(e) { return e.sizeF > 0.75 ? 'enorme' : e.sizeF > 0.4 ? 'de buen tamaño' : e.sizeF > 0.15 ? 'mediano' : 'pequeño'; }
  function hitPct(e) {
    const sp = G.spear(); if (!sp) return 0;
    const base = (sp.pts + 10) / (sp.pts + 10 + e.diff);
    const rf = e.d <= sp.range ? 1 + (sp.range - e.d) * 0.03 : Math.max(0.08, 1 - (e.d - sp.range) * 0.3);
    return Math.round(U.clamp(base * rf * 100, 2, 95));
  }

  /* --- Acciones --- */
  const A = {
    explore() {
      tick(4);
      if (Math.random() < 0.06) {
        const it = U.pick(G.TRASH);
        G.S.stats.trash = (G.S.stats.trash || 0) + 1; G.S.trashLog[it.id] = (G.S.trashLog[it.id] || 0) + 1; G.Ach.check();
        log(`Entre las algas asoma algo que no debería estar aquí: ${it.name.toLowerCase()}. La recoges y la guardas en el bolsillo del neopreno. ♻️ (${G.S.stats.trash} retiradas)`, 'good');
        return;
      }
      const hab = habHere();
      st.scene = { kind: hab, text: U.pick(SCENE[st.lvl === 0 && st.dist > 40 ? 'O' : hab]) };
      const pelagicView = st.lvl < 2 && st.dist > 60;
      if (Math.random() < 0.72) {
        const e = makeEnc(pelagicView || hab === 'O');
        if (e) { if (e.seen) { st.enc = e; log(`Miras a tu alrededor: ${st.scene.text}. A ${e.d.toFixed(0)} m se mueve ${encName(e)} ${sizeWord(e)}.`); return; } st.scene.hidden = e; }
      }
      log(`Ves ${st.scene.text}.` + (st.scene.hidden ? ' Algo se mueve entre las sombras…' : ' Nada se mueve por aquí.'));
    },
    inspect() {
      tick(6);
      const h = st.scene.hidden;
      st.scene = null;
      if (!h) { log('Te acercas y no encuentras nada. Solo algas y piedras.'); return; }
      if (Math.random() < 0.15 + h.diff / 400) { log('Al acercarte, algo huye a toda velocidad y se pierde de vista.', 'bad'); return; }
      st.enc = h; h.seen = true;
      const nm = encName(h);
      log(h.sp.shape === 'octo' ? `Entre las piedras asoma un tentáculo… ¡es ${nm}! Está a ${h.d.toFixed(0)} m.` : h.sp.shape === 'long' ? `Una cabeza con dientes asoma de una grieta: ${nm} ${sizeWord(h)}, a ${h.d.toFixed(0)} m.` : `Tras la roca aparece ${nm} ${sizeWord(h)}, a solo ${h.d.toFixed(0)} m.`, 'good');
    },
    approach() {
      const e = st.enc; tick(6);
      const spook = 0.08 + e.diff / 260 + (e.d < 3.5 ? 0.12 : 0) - (st.lvl === 2 ? 0.04 : 0);
      if (Math.random() < spook) { log(`Te acercas demasiado rápido y ${encName(e)} se asusta y huye.`, 'bad'); st.enc = null; return; }
      e.d = Math.max(1, e.d - U.rand(2, 3.2));
      log(`Te deslizas con calma. Ahora está a ${e.d.toFixed(1)} m.`);
    },
    wait() {
      const e = st.enc; tick(4, 0.02);
      const r = Math.random();
      if (r < 0.2) { log(`${U.pick(['Se aburre', 'Se asusta con una burbuja', 'Se esconde'])} y se pierde de vista.`, 'bad'); st.enc = null; }
      else if (r < 0.65) { e.d = Math.max(1, e.d - U.rand(1, 2)); log(`Aguantas la respiración. Se acerca a ${e.d.toFixed(1)} m.`, 'good'); }
      else log('Esperas inmóvil. Sigue ahí, dudando.');
    },
    leave() { log('Lo dejas pasar.'); st.enc = null; tick(2); },
    shoot() {
      const e = st.enc, p = hitPct(e); tick(5, 0.02); G.Audio.play('shoot');
      st.enc = null; st.scene = null;
      if (Math.random() * 100 < p) {
        const sp = e.sp, s = e.sizeF;
        const cm = Math.round(U.lerp(sp.cm[0], sp.cm[1], s));
        const kg = Math.round(U.lerp(sp.kg[0], sp.kg[1], Math.pow(s, 1.6)) * 1000) / 1000;
        const value = Math.round(kg * sp.eurKg * G.FISH_PRICE_MULT * U.rand(0.92, 1.08) * 100) / 100;
        log(`¡Disparo certero! Cobras ${sp.name.toLowerCase()} de ${cm} cm.`, 'good');
        st.count++;
        G.Fish.landed({ id: U.uid(), sp: sp.id, cm, kg, value, day: G.S.day }, 'dive');
      } else {
        log(Math.random() < 0.5 ? 'La flecha pasa rozando… ¡fallo! El pez desaparece.' : 'Disparas, pero se mueve justo a tiempo.', 'bad');
      }
    },
    swimOut() { if (st.dist >= 200) return; moveDist(15); },
    swimIn() { if (st.dist <= 15) { return A.exit(); } moveDist(-15); },
    down() {
      if (st.lvl === 0) { st.lvl = 1; tick(10); log(`Haces una buena respiración y te sumerges hasta ${depthName().toLowerCase()}.`); }
      else if (st.lvl === 1 && bottomReachable()) { st.lvl = 2; tick(10 + Math.round(waterDepth(st.dist) * 0.5)); log(`Bajas hasta el fondo, a ${depthM()} m. Todo se vuelve más silencioso.` + (st.dist >= 120 ? ' Aquí abajo, tan lejos de la orilla, se esconden las piezas grandes.' : '')); }
      st.scene = null; st.enc = null;
    },
    up() { st.lvl = Math.max(0, st.lvl - (st.lvl === 2 ? 1 : 1)); tick(6); log(st.lvl === 0 ? 'Sales a la superficie.' : 'Asciendes un poco.'); st.scene = null; st.enc = null; },
    breathe() { st.air = 100; G.addTime(0.05); log('Respiras hondo varias veces. Te recuperas por completo.', 'good'); },
    exit() {
      D.end();
    },
  };
  function moveDist(dm) {
    tick(st.lvl === 0 ? 8 : 12, 0.03);
    st.dist = U.clamp(st.dist + dm, 0, 200);
    st.lat = U.clamp(st.lat + U.rand(-30, 30), -330, 330);
    st.scene = null; st.enc = null;
    if (st.dist >= 200) log('Llegas a las boyas, a 200 m. No puedes ir más lejos.');
    else log(dm > 0 ? `Aleteas mar adentro. Estás a ${st.dist} m de la orilla.` : `Vuelves hacia la orilla. Estás a ${st.dist} m.`);
  }

  function afterAction() {
    if (st.air <= 0) { rescue(); return; }
    if (st.air < 25 && st.lvl > 0) log('⚠️ Te queda poco aire. Sube a respirar.', 'bad');
    render();
  }
  /* Sin aire en el mar: te sacan los socorristas, termina el día y pagas el rescate */
  function rescue() {
    D.active = false; st = null;
    $('dive').classList.add('hidden'); $('dive').innerHTML = '';
    G.save();
    G.endDay(true, true);
  }
  function copyIcon(src) {
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.style.width = src.style.width; c.style.height = src.style.height;
    c.getContext('2d').drawImage(src, 0, 0); return c;
  }
  function act(name) { G.Audio.play('click'); A[name](); if (st) afterAction(); }

  /* --- Interfaz --- */
  function render() {
    const el = $('dive');
    const e = st.enc, sp = G.spear();
    const airCol = st.air > 50 ? '#6df0b6' : st.air > 25 ? '#ffe27a' : '#ff6a50';
    let ch = '';
    const b = (name, label, cls) => `<button class="btn ${cls || ''}" data-d="${name}">${label}</button>`;
    if (e) {
      const p = hitPct(e);
      ch += b('shoot', `🎯 Disparar · ${p}%`, 'danger full');
      ch += b('approach', '🤿 Acercarte') + b('wait', '⏳ Esperar al acecho');
      ch += b('leave', '↩️ Dejarlo pasar', 'alt full');
    } else {
      if (st.scene && st.scene.hidden !== undefined) ch += b('inspect', `🔍 Inspeccionar ${st.scene.kind === 'R' ? 'la roca' : st.scene.kind === 'P' ? 'la pradera' : 'la zona'}`, 'danger full');
      ch += b('explore', '👀 Mirar alrededor');
      ch += b('swimOut', `➡️ Mar adentro (+15 m)`, st.dist >= 200 ? 'alt' : '');
      if (st.lvl < 2 && (st.lvl === 0 || bottomReachable())) ch += b('down', st.lvl === 0 ? '⬇️ Bucear' : '⬇️ Al fondo', 'alt');
      else if (st.lvl === 1 && !bottomReachable()) ch += `<button class="btn alt" disabled>Fondo muy profundo</button>`;
      if (st.lvl > 0) ch += b('up', '⬆️ Subir', 'alt');
      if (st.lvl === 0) ch += b('breathe', '💨 Respirar', 'alt');
      ch += b('swimIn', st.dist <= 15 ? '🏖️ Salir del agua' : '⬅️ Hacia la orilla (−15 m)', 'alt');
    }
    const logHtml = st.log.map((l, i) => `<p class="${l.cls} ${i < st.log.length - 1 ? 'old' : ''}">${l.text}</p>`).join('');
    el.innerHTML = `
      <div class="dtop">
        <div class="card"><div class="lbl"><span>📏 Distancia</span><span>${st.dist} / 200 m</span></div><div class="bar"><i style="width:${st.dist / 2}%"></i></div>
          <div class="lbl" style="margin:8px 0 0"><span>🌊 ${depthName()}</span><span>🐟 ${st.count}</span></div>${st.dist > 100 ? '<div class="lbl" style="margin:6px 0 0;color:#ffb27a"><span>⚠️ Lejos: gastas el doble de aire</span></div>' : ''}</div>
        <div class="card"><div class="lbl"><span>🫁 Aire</span><span>${Math.max(0, Math.round(st.air))}%</span></div><div class="bar"><i style="width:${Math.max(0, st.air)}%;background:${airCol}"></i></div>
          <div class="lbl" style="margin:8px 0 0"><span>🔱 ${sp ? sp.name : '—'}</span><span>${U.clock(G.env.hour)}</span></div></div>
      </div>
      ${e ? `<div class="dfishrow" style="display:flex;align-items:center;gap:12px;margin-top:8px;background:rgba(255,255,255,.09);border-radius:14px;padding:6px 12px"><span id="dfimg"></span><div style="min-width:0"><div style="font-weight:900;font-size:16px">${G.S.album[e.sp.id] ? e.sp.name : '¿Qué será?'}</div><div style="font-size:12.5px;color:var(--mut)">${sizeWord(e)} · a ${e.d.toFixed(1)} m</div></div></div>` : ''}
      <div class="dlog" id="dlog">${logHtml}</div>
      <div class="choices">${ch}</div>`;
    const fi = $('dfimg'); if (fi && e) fi.appendChild(copyIcon(G.FishArt.icon(e.sp, 120, !G.S.album[e.sp.id])));
    const lg = $('dlog'); lg.scrollTop = lg.scrollHeight;
  }

  $('dive').addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-d]'); if (!t || !st) return;
    act(t.dataset.d);
  });

  D.begin = function () {
    if (!G.hasDiveKit()) { G.UI.toast('Te falta: ' + G.missingDive().join(', ') + ' (Tienda → Buceo)', 'warn'); return; }
    if (isNight() && !G.S.owned.extras.includes('lampara')) { G.UI.toast('Está muy oscuro para bucear. Necesitas la lámpara de pesca 🔦', 'warn'); return; }
    if (G.S.onPaddle) return;
    if (!G.spear()) G.S.eq.spear = G.S.owned.spears[0];
    st = { dist: 0, lat: 0, lvl: 0, air: 100, enc: null, scene: null, count: 0, log: [] };
    D.active = true;
    G.S.stats.dives++;
    log('Te pones las gafas, las aletas y entras en el agua. El Mediterráneo está tranquilo. ¿Qué haces?');
    $('dive').classList.remove('hidden'); render();
    G.Fish.state = 'idle';
  };
  D.end = function () {
    const n = st ? st.count : 0;
    D.active = false; st = null;
    $('dive').classList.add('hidden'); $('dive').innerHTML = '';
    G.UI.toast(n ? `Sales del agua con ${n} captura${n > 1 ? 's' : ''} 🤿` : 'Sales del agua sin capturas', n ? 'good' : '');
    G.save(); G.UI.refreshHud();
  };
  return D;
})();
