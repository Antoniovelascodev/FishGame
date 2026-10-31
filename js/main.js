/* Bucle principal, jugador, cámara, ciclo día/noche y arranque */
window.G = window.G || {};

(function () {
  const U = G.U, W = G.World, PXM = G.PXM;
  const $ = (id) => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const dark = document.createElement('canvas'), dctx = dark.getContext('2d');

  G.env = { t: 0, hour: 9, night: 0, warm: 0, swell: 1, swellF: 1 };
  G.P = { x: 520, y: 1100, ang: -Math.PI / 2, walk: 0, moving: false, wakeT: 0 };
  const cam = { x: 520, y: 1000 };
  let vw = 0, vh = 0, dpr = 1, zoom = 1, baseZoom = 1, uz = 1;
  try { uz = U.clamp(parseFloat(localStorage.getItem('pesca-zoom')) || 1, 0.85, 2.2); } catch (e) {}
  function setUz(v) { uz = U.clamp(v, 0.85, 2.2); zoom = baseZoom * uz; try { localStorage.setItem('pesca-zoom', uz.toFixed(2)); } catch (e) {} }
  G.zoomBy = (m) => setUz(uz * m);
  let running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, G.dprCap || 2);
    vw = window.innerWidth; vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    dark.width = canvas.width; dark.height = canvas.height;
    baseZoom = U.clamp(Math.min(vw / 560, vh / 640), 0.55, 1.35); zoom = baseZoom * uz;
  }
  document.getElementById('btnZoomIn').addEventListener('click', () => G.zoomBy(1.2));
  document.getElementById('btnZoomOut').addEventListener('click', () => G.zoomBy(1 / 1.2));
  window.addEventListener('wheel', (e) => { if (!e.target.closest || !e.target.closest('#modal')) G.zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1); }, { passive: true });
  let pinch = 0;
  const pd = (e) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  window.addEventListener('touchstart', (e) => { if (e.touches.length === 2) pinch = pd(e); }, { passive: true });
  window.addEventListener('touchmove', (e) => { if (e.touches.length === 2 && pinch) { const d = pd(e); G.zoomBy(d / pinch); pinch = d; } }, { passive: true });
  window.addEventListener('touchend', (e) => { if (e.touches.length < 2) pinch = 0; }, { passive: true });
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();

  /* ---------- Tiempo ---------- */
  function updateNight() {
    const h = G.env.hour;
    const dusk = U.clamp((h - 19.5) / 2, 0, 1), dawn = 1 - U.clamp((h - 5.5) / 2, 0, 1);
    G.env.night = h >= 12 ? U.smooth(dusk) : U.smooth(dawn);
    // luz cálida al amanecer y atardecer
    const wk = (c, w) => Math.max(0, 1 - Math.abs(h - c) / w);
    G.env.warm = Math.max(wk(19.2, 1.8), wk(7.2, 1.3));
  }
  G.addTime = function (hrs) {
    if (G.S.phase !== 'day') return;
    G.env.hour = (G.env.hour + hrs) % 24;
    G.S.elapsed += hrs;
    G.spoilBag(hrs);
    G.S.time = G.env.hour; updateNight();
    G.S.gt = (G.S.gt || 0) + hrs;
    G.Stall.tick(hrs);
  };

  /* Empieza la jornada con la hora y duración elegidas */
  G.startDay = function () {
    const S = G.S;
    if (S.phase !== 'prep') return;
    S.phase = 'day'; S.dayHours = S.plan.dur; S.elapsed = 0; S.dayLog = { fish: 0 };
    dayWarned = false;
    G.env.hour = S.time = S.plan.start; updateNight();
    if (!S.baits[S.eq.bait]) { const alt = G.BAITS.find(b => S.baits[b.id] > 0); if (alt) S.eq.bait = alt.id; }
    G.Fish.state = 'idle'; G.UI.fishHud(null);
    G.travel(W.nearestSpot(G.P.x).id);
    G.Audio.setSwell(S.swell);
    G.UI.toast('☀️ Día ' + S.day + ' · ' + G.SWELL_NAMES[S.swell] + ' · ¡A pescar!', 'good');
    G.UI.refreshHud(); G.save();
  };

  /* Termina la jornada: vuelves al paseo, el cebo se estropea y ya puedes vender */
  function endDay(early, rescue) {
    const S = G.S, P = G.P;
    if (S.phase !== 'day') return;
    if (G.Fish.state !== 'idle') { G.Fish.state = 'idle'; G.Fish.cur = null; G.Fish.rings.length = 0; G.UI.fishHud(null); }
    if (S.onPaddle) { S.board = { x: P.x, y: W.shoreY(P.x) + 36 }; S.onPaddle = false; }
    let lost = 0; for (const b of G.BAITS) { if (b.starter) continue; lost += S.baits[b.id] || 0; S.baits[b.id] = 0; }
    let fee = 0;
    let lostFish = 0;
    if (rescue) { G.Ach.count('rescued'); fee = Math.round(S.money * 50) / 100; S.money = Math.round((S.money - fee) * 100) / 100; lostFish = S.bag.length; S.bag = []; }
    S.phase = 'prep'; S.day++;
    S.swell = U.clamp(S.swell + U.pick([-1, 0, 0, 1, 1]), 0, 3);
    G.Audio.setSwell(S.swell);
    G.env.hour = S.time = 12; updateNight();
    P.x = W.PREP_SPAWN.x; P.y = W.PREP_SPAWN.y; P.ang = -Math.PI / 2; cam.x = P.x; cam.y = P.y;
    let tot = 0; S.bag.forEach(f => tot += G.fishValue(f));
    G.save(); G.UI.refreshHud();
    G.UI.showMsg(rescue ? '🚨 ¡Rescate en el mar!' : early ? '🏁 Jornada terminada' : '🌅 Fin de la jornada',
      `${rescue ? `Te quedaste sin aire y los socorristas tuvieron que sacarte del agua. Pagas el rescate: −${U.money(fee)} (el 50% de tu dinero)${lostFish ? ` y pierdes los ${lostFish} peces de la nevera` : ''}. La jornada termina aquí.<br>` : ''}Has pescado ${S.dayLog.fish} peces. En la nevera llevas ${S.bag.length} (valor actual ${U.money(tot)}).<br>${lost ? `🪱 ${lost} cebos sobrantes se han echado a perder.<br>` : ''}Vende en el mercadillo (te la juegas a los dados) o en la lonja (precio fijo), compra material y prepara el siguiente día.`);
  }
  G.endDay = endDay;
  G.dayButton = function () {
    if (G.UI.modalOpen()) return;
    if (G.S.phase === 'prep') { G.UI.open('plan'); return; }
    if (G.Fish.locked()) { G.UI.toast('Estás pescando: termina primero 🎣', 'warn'); return; }
    G.UI.confirm('¿Terminar la jornada?', 'Volverás al paseo para vender lo pescado. Los cebos que te sobren se estropearán.', 'Terminar', () => endDay(true));
  };
  let dayWarned = false;

  /* ---------- Contexto: buceo, paddle ---------- */
  function ctxAction() {
    if (G.Fish.busy()) return null;
    const S = G.S, p = G.P;
    // el marinero del puerto
    if (S.phase === 'prep' && G.Sailor.near(p)) return { label: '⚓ Hablar con el marinero', run: () => G.UI.open('sailor') };
    // tiendas físicas del paseo
    const sh = W.buildings.find(b => b.label && p.x > b.x - 6 && p.x < b.x + b.w + 6 && p.y > W.PROM_Y1 - 120);
    if (sh) {
      if (sh.kind === 'castle') return { label: '🏰 Castillo Sohail', run: () => G.UI.toast('🏰 Castillo de Sohail (s. X): fortaleza mora sobre el cerro de Fuengirola. ¡Qué vistas!', 'good') };
      const gear = ['bait', 'rods', 'spear', 'paddle', 'kayak', 'animal'].includes(sh.kind);
      if (!G.shopOpen(sh.kind)) return { label: '🔒 Cerrado', run: () => G.UI.toast(gear ? 'Esta tienda abre de 9:00 a 18:00' : 'Las tiendas abren cuando termina la jornada', 'warn') };
      if (sh.kind === 'stall') return { label: '🏪 Entrar: Tu pescadería', run: () => G.UI.open('stall') };
      if (G.Fish.locked()) return null;
      return { label: '🚪 Entrar: ' + sh.label.split(' · ')[0], run: () => G.Interior.enter(sh.kind) };
    }
    if (!S.onPaddle && !(G.Dive && G.Dive.active)) {
      const giveBait = (id, n) => { S.baits[id] = (S.baits[id] || 0) + n; if (!S.baits[S.eq.bait]) S.eq.bait = id; G.Audio.play('buy'); G.UI.refreshHud(); G.save(); };
      const cr = W.crabNear(p);
      if (cr) return { label: '🦀 Atrapar cangrejo', run: () => { if (W.grabCrab(cr)) { giveBait('cangrejo', 1); G.UI.toast('🦀 ¡Cangrejo atrapado! +1 cebo de cangrejo', 'good'); } else G.UI.toast('Se te escapó entre las piedras…', 'warn'); } };
      const ws = W.wormNear(p);
      if (ws) return { label: '🪨 Mover piedras', run: () => { const n = W.digWorms(ws); if (n) { giveBait('gusano', n); G.UI.toast(`🪱 ¡Has encontrado ${n} gusano${n > 1 ? 's' : ''}!`, 'good'); } else G.UI.toast('Solo había arena y una lapa…', 'warn'); } };
    }
    if (S.phase !== 'day') return null;
    if (S.onPaddle) {
      return W.shoreY(p.x) - p.y < 90 ? { label: '🚶 Bajar de la tabla', run: disembark } : null;
    }
    const dv = W.DIVES.find(d => U.dist(p.x, p.y, d.x, d.y) < 80);
    if (dv) return { label: '🤿 Bucear', run: () => { W.DIVE.x = dv.x; W.DIVE.y = dv.y; G.Dive.begin(); } };
    const b = S.board || W.PADDLE_SPAWN;
    if (S.owned.extras.includes('paddle') && U.dist(p.x, p.y, b.x, b.y) < 80) return { label: '🏄 Subir a la tabla', run: boardUp };
    return null;
  }
  function boardUp() {
    const b = G.S.board || W.PADDLE_SPAWN;
    G.S.onPaddle = true;
    G.P.x = b.x; G.P.y = Math.min(W.shoreY(b.x) - 40, b.y - 40); G.P.ang = -Math.PI / 2;
    G.UI.toast('🏄 En la tabla: llegas hasta las boyas (200 m)', 'good');
  }
  function disembark() {
    const p = G.P;
    G.S.onPaddle = false;
    G.S.board = { x: p.x, y: W.shoreY(p.x) + 36 };
    p.y = W.shoreY(p.x) + 14;
  }
  G.travel = function (id) {
    if (G.Fish.busy()) { G.Fish.state = 'idle'; G.UI.fishHud(null); }
    G.S.onPaddle = false;
    if (id === 'dive') { G.P.x = W.DIVE.x; G.P.y = W.DIVE.y - 10; }
    else { const s = W.SPOTS.find(x => x.id === id); G.P.x = s.x; G.P.y = s.y; }
    const fs = W.freeSpot(G.P.x, G.P.y); G.P.x = fs.x; G.P.y = fs.y;
    G.P.ang = -Math.PI / 2;
    cam.x = G.P.x; cam.y = G.P.y;
  };

  /* ---------- Actualización ---------- */
  let tutorialMark = 0, achT = 0;
  function update(dt) {
    const E = G.env, S = G.S, P = G.P, I = G.Input;
    E.t += dt;
    E.swellF += (S.swell - E.swellF) * Math.min(1, dt * 0.4);
    E.swell = S.swell;
    if (G.Dive.active || G.UI.modalOpen()) { if (G.Dive.active) return; /* congelado */ }
    const paused = G.UI.modalOpen();
    if (paused) return;
    if (G.Interior.active) { G.Interior.update(dt); return; }

    // reloj: 1 hora de juego = 15 s (solo durante la jornada)
    if (S.phase === 'day') {
      G.addTime(dt / 15);
      const left = S.dayHours - S.elapsed;
      if (!dayWarned && left <= 1 && left > 0) { dayWarned = true; G.UI.toast('⏳ Queda 1 hora de jornada'); }
      if (left <= 0 && !G.Fish.locked() && !G.Dive.active) {
        if (G.Fish.state !== 'idle') G.Fish.retrieve(true);
        G.UI.choose('⏰ Se acabó el tiempo', 'Has pescado ' + S.dayLog.fish + ' peces. ¿Quieres terminar la jornada para vender o seguir pescando sin perder el ritmo?', [
          ['🎣 Seguir jornada (+12 h)', () => { S.dayHours += 12; dayWarned = false; G.UI.toast('Sigues pescando 12 horas más', 'good'); }],
          ['🏁 Terminar y vender', () => endDay(false)],
        ]);
        return;
      }
    }
    W.updateSchools(E.t, G.Fish.state !== 'idle' ? G.Fish.target : null);
    G.UI.syncDayButton();

    I.update();
    if (P.act) G.Char.actUpdate(dt);
    const st = G.Fish.state;
    const locked = G.Fish.locked();
    if ((st === 'wait' || st === 'nibble') && I.mag > 0.6) G.Fish.retrieve(st === 'wait');
    P.moving = false;
    if (P.stun > 0) P.stun -= dt;
    if (!P.act && !(P.stun > 0) && !locked && G.Fish.state !== 'wait' && G.Fish.state !== 'nibble' && I.mag > 0) {
      const sp = (S.onPaddle ? 150 : 175) * I.mag;
      const nx = P.x + I.x * sp * dt, ny = P.y + I.y * sp * dt;
      const ok = (x, y) => S.onPaddle ? W.canPaddle(x, y) : W.canWalk(x, y, S.swell);
      const okx = ok(nx, P.y), oky = ok(P.x, ny);
      if (okx) P.x = nx;
      if (oky) P.y = ny;
      if (!okx || !oky) G.Social.blocked(!okx ? nx : P.x, !oky ? ny : P.y);
      P.ang = Math.atan2(I.y, I.x); P.moving = true; P.walk += dt * 10 * I.mag;
    } else if ((st === 'wait' || st === 'nibble')) {
      // mirando al corcho
      P.ang = Math.atan2(G.Fish.target.y - P.y, G.Fish.target.x - P.x);
    }
    // que la tabla no quede varada en tierra al cambiar de sitio
    G.Fish.update(dt);

    G.Social.update(dt);
    G.Sailor.update(dt);
    G.Stall.update(dt);

    // contexto
    const c = ctxAction();
    G.ctxRun = c ? c.run : null;
    G.UI.setCtx(c ? c.label : null);

    // lugar actual
    const zn = W.zoneAt(P.x);
    let spot = zn.name;
    if (S.onPaddle) spot = `🏄 En la tabla · ${Math.round(W.depthAt(P.x, P.y))} m de la orilla`;
    else if (W.inPier(P.x, P.y, 4)) spot = 'Espigón en T';
    else if (P.y > 1330 && S.phase === 'prep' && zn.prom === 'paseo') spot = zn.name + ' · Tiendas';
    G.UI.setSpot(spot);
    G.UI.syncButtons();

    // tutorial
    if (S.phase === 'day' && S.tutorial === 0 && W.shoreY(P.x) - P.y < 60 && P.y < W.shoreY(P.x) + 100) { S.tutorial = 1; G.UI.toast('Mantén 🎣 LANZAR y suelta para lanzar al mar. Mueve el joystick para apuntar.'); }
    if (S.tutorial === 1 && G.Fish.state === 'bite') { S.tutorial = 2; G.UI.toast('¡Pica! Pulsa ⚡ ¡CLAVAR! rápido', 'good'); }
    if (S.tutorial === 2 && G.Fish.state === 'fight') { S.tutorial = 3; G.UI.toast('Mantén 🌀 RECOGE. Si el pez tira (⚠️), ¡suelta!', 'good'); }

    // refresco ligero del HUD
    tutorialMark += dt; achT += dt;
    if (tutorialMark > 0.5) { tutorialMark = 0; G.UI.refreshHud(); }
    if (achT > 2) { achT = 0; G.Ach.check(); }
  }

  /* ---------- Dibujo ---------- */
  function drawPlayer(c) {
    const S = G.S, P = G.P, F = G.Fish, t = G.env.t;
    const L = G.Char.lookOf(), act = P.act;
    c.save(); c.translate(P.x + (P.kx || 0), P.y + (P.ky || 0));
    if (S.onPaddle) {
      c.save(); c.rotate(P.ang);
      const bob = Math.sin(t * 2) * 0.6;
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(4, 6, 46, 15, 0, 0, 6.3); c.fill();
      c.fillStyle = '#f7f4ea'; c.beginPath(); c.moveTo(48, 0); c.quadraticCurveTo(30, -17, -34, -14 + bob); c.quadraticCurveTo(-48, 0, -34, 14 - bob); c.quadraticCurveTo(30, 17, 48, 0); c.fill();
      c.strokeStyle = '#2bb5c9'; c.lineWidth = 4; c.beginPath(); c.moveTo(42, 0); c.lineTo(-38, 0); c.stroke();
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-10, -9, 22, 18);
      c.restore();
    }
    c.scale(G.PS, G.PS);
    if (!S.onPaddle) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(3, 6, 15, 12, 0, 0, 6.3); c.fill(); }
    G.Char.legs(c, L, { ang: P.ang, walk: P.walk, moving: P.moving && !act, seated: S.onPaddle });
    // caña
    const using = F.state !== 'idle' && F.state !== 'result';
    const dtR = Math.min(0.1, Math.max(0, t - (P.rodT || t))); P.rodT = t;
    if (using) P.rodHold = 1.4; else P.rodHold = Math.max(0, (P.rodHold || 0) - dtR);
    const want = (using || P.rodHold > 0) ? 1 : 0;
    P.rodK = P.rodK == null ? want : P.rodK + Math.sign(want - P.rodK) * Math.min(Math.abs(want - P.rodK), dtR * 4.5);
    const rk = P.rodK;
    // sin pescar la caña va colgada a la espalda; al lanzar se saca con una animación
    const aim0 = using ? F.aim : P.ang;
    const back = P.ang + Math.PI - 0.75;
    let da = aim0 - back; da = Math.atan2(Math.sin(da), Math.cos(da));
    const e = rk * rk * (3 - 2 * rk), aim = back + da * e;
    const dx = Math.cos(aim), dy = Math.sin(aim), RL = 30 + 14.5 * e;
    let hands = null, twist = 0;
    if (act) {
      const pose = G.Char.actPose(P, act); hands = pose.hands; twist = pose.twist;
    } else {
      const bend = F.state === 'fight' ? U.clamp(F.fight.tens / 100, 0, 1) * 10 : 0;
      c.lineCap = 'round';
      c.strokeStyle = '#5a3b22'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(dx * 2.7, dy * 2.7);
      c.quadraticCurveTo(dx * RL * 0.6 - dy * bend * 0.5, dy * RL * 0.6 + dx * bend * 0.5, dx * RL - dy * bend * 1.3, dy * RL + dx * bend * 1.3); c.stroke();
      c.strokeStyle = '#d9c9a8'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(dx * 16, dy * 16); c.lineTo(dx * 19, dy * 19); c.stroke();
      c.fillStyle = '#3a2a1c'; c.beginPath(); c.arc(dx * 8, dy * 8, 2.8, 0, 6.3); c.fill();
      const fishing = F.state !== 'idle' && F.state !== 'result';
      if (rk > 0.45) hands = { r: { x: dx * 13.5 - dy * 2, y: dy * 13.5 + dx * 2 }, l: fishing ? { x: dx * 26 + dy * 2, y: dy * 26 - dx * 2 } : null };
    }
    G.Char.body(c, L, { ang: P.ang, walk: P.walk, moving: P.moving && !act, hands, twist });
    c.restore();
    // estela en la tabla
    if (S.onPaddle && P.moving) {
      P.wakeT += 0.016;
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(P.x - Math.cos(P.ang) * 40, P.y - Math.sin(P.ang) * 40); c.lineTo(P.x - Math.cos(P.ang + s * 0.3) * 90, P.y - Math.sin(P.ang + s * 0.3) * 90); c.stroke(); }
    }
  }

  function drawBoardOnSand(c) {
    const S = G.S;
    if (S.onPaddle || !S.owned.extras.includes('paddle')) return;
    const b = S.board || W.PADDLE_SPAWN;
    c.save(); c.translate(b.x, b.y); c.rotate(-Math.PI / 2 + 0.2);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(4, 5, 46, 15, 0, 0, 6.3); c.fill();
    c.fillStyle = '#f7f4ea'; c.beginPath(); c.moveTo(48, 0); c.quadraticCurveTo(30, -17, -34, -14); c.quadraticCurveTo(-48, 0, -34, 14); c.quadraticCurveTo(30, 17, 48, 0); c.fill();
    c.strokeStyle = '#2bb5c9'; c.lineWidth = 4; c.beginPath(); c.moveTo(42, 0); c.lineTo(-38, 0); c.stroke();
    c.restore();
  }

  function drawNight(c) {
    const E = G.env;
    if (E.night < 0.02 && E.warm < 0.02) return;
    const S = G.S, P = G.P;
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (E.warm > 0.02) { c.fillStyle = `rgba(255,130,50,${0.20 * E.warm})`; c.fillRect(0, 0, canvas.width, canvas.height); }
    if (E.night < 0.02) return;
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.globalCompositeOperation = 'source-over';
    dctx.clearRect(0, 0, dark.width, dark.height);
    dctx.fillStyle = `rgba(2,5,18,${0.95 * E.night})`;
    dctx.fillRect(0, 0, dark.width, dark.height);
    dctx.globalCompositeOperation = 'destination-out';
    const sx = (x) => ((x - cam.x) * zoom + vw / 2) * dpr, sy = (y) => ((y - cam.y) * zoom + vh / 2) * dpr;
    const light = (x, y, r, a) => {
      const X = sx(x), Y = sy(y), R = r * zoom * dpr;
      if (X < -R || X > dark.width + R || Y < -R || Y > dark.height + R) return;
      const g = dctx.createRadialGradient(X, Y, 0, X, Y, R);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.55, `rgba(0,0,0,${a * 0.55})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      dctx.fillStyle = g; dctx.beginPath(); dctx.arc(X, Y, R, 0, 6.3); dctx.fill();
    };
    for (const l of W.lamps) light(l.x, l.y, l.r, 0.5);
    const lamp = S.owned.extras.includes('lampara');
    light(P.x, P.y, lamp ? 200 : 34, lamp ? 0.97 : 0.28);
    const F = G.Fish;
    if (lamp && (F.state === 'wait' || F.state === 'nibble' || F.state === 'bite' || F.state === 'fight')) light(F.target.x, F.target.y, 110, 0.9);
    // ventanas de edificios
    for (const b of W.buildings) if (b.label) light(b.x + b.w / 2, b.y + 20, 70, 0.32);
    c.drawImage(dark, 0, 0);
    // brillo cálido de farolas
    c.globalCompositeOperation = 'lighter';
    for (const l of W.lamps) {
      const X = sx(l.x), Y = sy(l.y), R = l.r * zoom * dpr * 0.8;
      if (X < -R || X > canvas.width + R || Y < -R || Y > canvas.height + R) continue;
      const g = c.createRadialGradient(X, Y, 0, X, Y, R);
      g.addColorStop(0, `rgba(255,200,110,${0.2 * E.night})`); g.addColorStop(1, 'rgba(255,200,110,0)');
      c.fillStyle = g; c.beginPath(); c.arc(X, Y, R, 0, 6.3); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
  }

  function render(dt) {
    if (G.Dive.active) return;
    if (G.Interior.active) { G.Interior.draw(ctx, vw, vh, dpr); return; }
    const P = G.P, F = G.Fish, E = G.env;
    // cámara
    let tx = P.x, ty = P.y;
    if (F.state === 'charge' || F.state === 'wait' || F.state === 'nibble' || F.state === 'bite' || F.state === 'fight' || F.state === 'cast') {
      const T = F.state === 'charge' ? { x: P.x + Math.cos(F.aim) * G.rod().reach * PXM * 0.5 * (0.4 + F.power * 0.6), y: P.y + Math.sin(F.aim) * G.rod().reach * PXM * 0.5 * (0.4 + F.power * 0.6) } : F.target;
      tx = (P.x + T.x) / 2; ty = (P.y + T.y) / 2;
    }
    ty -= (vh / zoom) * 0.07;
    const k = Math.min(1, dt * 3.2);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
    cam.x = U.clamp(cam.x, vw / 2 / zoom, G.WORLD.w - vw / 2 / zoom);
    cam.y = U.clamp(cam.y, vh / 2 / zoom, G.WORLD.h - vh / 2 / zoom);
    const vis = { x0: cam.x - vw / 2 / zoom - 20, x1: cam.x + vw / 2 / zoom + 20, y0: cam.y - vh / 2 / zoom - 20, y1: cam.y + vh / 2 / zoom + 20 };

    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, (vw / 2 - cam.x * zoom) * dpr, (vh / 2 - cam.y * zoom) * dpr);
    W.drawSea(ctx, vis, E);
    F.drawUnder(ctx);
    W.drawLand(ctx, vis, E);
    W.drawBuoys(ctx, vis, E);
    drawBoardOnSand(ctx);
    G.Stall.draw(ctx, vis, E);
    G.Sailor.draw(ctx, E);
    drawPlayer(ctx);
    if (P.act) G.Char.drawAct(ctx, P, P.act);
    F.draw(ctx);
    W.drawTall(ctx, vis, E);
    G.Social.draw(ctx, E);
    drawNight(ctx);
  }

  /* ---------- Bucle ---------- */
  let last = 0, saveT = 0, slowEma = 0.016, slowTicks = 0;
  function frame(ts) {
    if (!running) return;
    const raw = (ts - last) / 1000 || 0.016;
    const dt = Math.min(0.05, raw); last = ts;
    // calidad adaptable: si el móvil va justo, baja resolución y efectos
    if (raw < 0.25) { slowEma = slowEma * 0.95 + raw * 0.05; if (slowEma > 0.034 && ++slowTicks > 90) { slowTicks = 0; if (!G.lowQ) G.lowQ = true; else if ((G.dprCap || 2) > 1) { G.dprCap = 1; resize(); } slowEma = 0.02; } }

    update(dt);
    render(dt);
    saveT += dt; if (saveT > 8) { saveT = 0; G.save(); }
    requestAnimationFrame(frame);
  }

  G._step = (dt) => { update(dt); render(dt); }; // para pruebas automáticas

  /* ---------- Botones ---------- */
  const btn = $('btnCast');
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault(); btn.setPointerCapture(e.pointerId);
    G.Audio.unlock();
    G.Input.castHeld = true;
    if (G.Dive.active || G.Interior.active || (G.UI.modalOpen() && G.Fish.state !== 'result')) return;
    G.Fish.press();
  });
  const up = (e) => {
    if (!G.Input.castHeld) return;
    G.Input.castHeld = false;
    G.Fish.release();
  };
  btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
  $('btnCtx').addEventListener('click', () => { if (G.ctxRun) G.ctxRun(); });
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter') { const b = document.querySelector('[data-act="redeem"]'); if (b) b.click(); } return; }
    if (e.repeat) return;
    if (e.code === 'Space') { e.preventDefault(); G.Input.castHeld = true; if (!G.UI.modalOpen() && !G.Interior.active) G.Fish.press(); }
    else if (e.key === 'i' || e.key === 'I') G.UI.open('inv');
    else if (e.key === 't' || e.key === 'T') G.dayButton();
    else if (e.key === 'e' || e.key === 'E') { if (G.ctxRun) G.ctxRun(); }
    else if (e.key === 'Escape') G.UI.close();
  });
  document.addEventListener('keyup', (e) => { if (e.code === 'Space') { G.Input.castHeld = false; G.Fish.release(); } });
  // evitar zoom/scroll accidental en iOS
  ['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
  document.addEventListener('touchmove', (e) => { if (!e.target.closest('.body, .dlog')) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.hidden) G.save(); });
  window.addEventListener('pagehide', () => G.save());

  /* ---------- Arranque ---------- */
  function start() {
    G.TEX.init(ctx);
    const had = G.load();
    if (G.S.phase === 'prep') { G.S.time = 12; if (G.S.pos.y < 1330) G.S.pos = { x: W.PREP_SPAWN.x, y: W.PREP_SPAWN.y }; }
    G.env.hour = G.S.time; G.env.swell = G.env.swellF = G.S.swell; updateNight();
    G.P.x = G.S.pos.x; G.P.y = G.S.pos.y;
    if (G.S.onPaddle && !W.canPaddle(G.P.x, G.P.y)) G.S.onPaddle = false;
    if (!G.S.onPaddle) { const fs = W.freeSpot(G.P.x, G.P.y); G.P.x = fs.x; G.P.y = fs.y; }
    cam.x = G.P.x; cam.y = G.P.y;
    G.Stall.reset(); G.UI.refreshHud(); G.UI.syncDayButton();
    $('btnNew').classList.toggle('hidden', !had);
    $('btnPlay').textContent = had ? 'Continuar' : 'Jugar';
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    if (ios && !standalone) $('installTip').innerHTML = '📱 En iPhone: pulsa <b>Compartir</b> → <b>Añadir a pantalla de inicio</b> para jugar a pantalla completa.';
    // guardar posición
    setInterval(() => { G.S.pos = { x: Math.round(G.P.x), y: Math.round(G.P.y) }; G.S.time = G.env.hour; }, 2000);
    running = true; last = performance.now(); requestAnimationFrame(frame);
  }
  $('btnPlay').addEventListener('click', () => {
    G.Audio.unlock(); G.Audio.setSwell(G.S.swell);
    $('title').classList.add('hidden');
    if (G.Cal.canClaim()) setTimeout(() => { if (!G.UI.modalOpen()) G.UI.open('cal'); }, 700);
    if (G.S.phase === 'prep' && G.S.tutorial === 0) G.UI.toast('🏪 Tienes 25 gusanos de aprendiz; en El Cebo hay más y pulsa ▶ Empezar día');
  });
  $('btnNew').addEventListener('click', () => { if (confirm('¿Borrar la partida y empezar de nuevo?')) { G.resetGame(); location.reload(); } });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }
  start();
})();
