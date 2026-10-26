/* Interfaz: HUD, inventario, tienda, álbum, mapa, tarjetas de captura */
window.G = window.G || {};

G.UI = (function () {
  const U = G.U;
  const $ = (id) => document.getElementById(id);
  const UI = {};
  let ms = null; // estado del modal

  /* ---------- Avisos ---------- */
  UI.toast = function (msg, kind) {
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || ''); el.textContent = msg;
    $('toasts').appendChild(el);
    while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
    setTimeout(() => el.remove(), 2800);
  };
  UI.modalOpen = () => !!ms || !$('dive').classList.contains('hidden') || !$('title').classList.contains('hidden');

  /* ---------- HUD ---------- */
  UI.refreshHud = function () {
    const S = G.S, e = G.env;
    $('hMoney').textContent = '💶 ' + U.money(S.money);
    const h = e.hour, ic = h >= 6 && h < 8.5 ? '🌅' : h >= 8.5 && h < 19 ? '☀️' : h >= 19 && h < 21 ? '🌇' : '🌙';
    if (S.phase === 'prep') $('hClock').textContent = '🏪 Preparando · Día ' + S.day;
    else { const left = Math.max(0, S.dayHours - S.elapsed); $('hClock').textContent = ic + ' ' + U.clock(h) + ' · quedan ' + (left >= 1 ? Math.floor(left) + ' h' : Math.ceil(left * 60) + ' min'); }
    $('hSwell').textContent = '🌊 ' + G.SWELL_NAMES[S.swell];
    const b = G.BAITS.find(x => x.id === S.eq.bait);
    $('hBait').textContent = b.icon + ' ' + (S.baits[b.id] || 0);
    $('hCool').textContent = '🧊 ' + S.bag.length + '/' + G.coolerCap();
  };
  UI.setSpot = (t) => { const el = $('hSpot'); if (el.textContent !== t) el.textContent = t; };

  const castBtn = $('btnCast');
  let lastBtn = '';
  UI.syncButtons = function () {
    const st = G.Fish.state;
    let key = st, ic = '🎣', lb = 'LANZAR', cls = 'act big';
    if (st === 'charge') { ic = '💪'; lb = '¡SUELTA!'; }
    else if (st === 'cast') { ic = '🎣'; lb = '...'; }
    else if (st === 'wait' || st === 'nibble') { ic = '↩️'; lb = 'RECOGER'; }
    else if (st === 'bite') { ic = '⚡'; lb = '¡CLAVAR!'; cls += ' bite'; }
    else if (st === 'fight') { ic = '🌀'; lb = 'RECOGE'; cls += ' reel'; }
    else if (st === 'result') { ic = '✔️'; lb = '...'; }
    if (key === lastBtn) return;
    lastBtn = key;
    castBtn.className = cls;
    castBtn.innerHTML = `<span class="ic">${ic}</span><span class="lb">${lb}</span>`;
  };
  const dayBtn = $('btnShop');
  let lastDay = '';
  UI.syncDayButton = function () {
    const k = G.S.phase;
    if (k === lastDay) return; lastDay = k;
    dayBtn.innerHTML = k === 'prep' ? '<span class="ic">▶️</span><span class="lb">Empezar día</span>' : '<span class="ic">🏁</span><span class="lb">Terminar día</span>';
  };
  UI.setCtx = function (label) {
    const b = $('btnCtx');
    if (!label) { b.classList.add('hidden'); b.dataset.k = ''; return; }
    if (b.dataset.k !== label) { b.textContent = label; b.dataset.k = label; }
    b.classList.remove('hidden');
  };

  /* ---------- HUD de pesca ---------- */
  let fhPhase = null;
  UI.fishHud = function (d) {
    const box = $('fishhud');
    if (!d) { box.classList.add('hidden'); fhPhase = null; return; }
    box.classList.remove('hidden');
    if (d.phase !== fhPhase) {
      fhPhase = d.phase;
      if (d.phase === 'charge') box.innerHTML = `<div class="card"><div class="lbl"><span>Potencia del lanzamiento</span><span id="fhd"></span></div><div class="bar pw"><i id="fhp"></i></div><div class="lbl" style="margin:6px 0 0"><span id="fhh"></span><span id="fhok"></span></div></div>`;
      else if (d.phase === 'wait') box.innerHTML = `<div class="card" style="text-align:center">🎣 Esperando picada…<div class="lbl" style="justify-content:center;margin:4px 0 0">Muévete para recoger el sedal</div></div>`;
      else if (d.phase === 'nibble') box.innerHTML = `<div class="card" style="text-align:center">👀 ¡Algo se acerca al cebo!</div>`;
      else if (d.phase === 'bite') box.innerHTML = `<div class="card warnflash"><div style="display:flex;justify-content:space-between;align-items:center"><div><div id="fbn" style="font-weight:900;font-size:18px"></div><div class="lbl" style="margin:2px 0 0">Prob. de captura</div></div><div class="pct" id="fbp"></div></div><div class="bar time" style="margin-top:8px"><i id="fbt"></i></div><div class="chips" id="fbc"></div></div>`;
      else if (d.phase === 'fight') box.innerHTML = `<div class="card"><div class="lbl"><span id="ffn"></span><span id="ffs"></span></div><div class="bar"><i id="ffp"></i></div><div class="lbl" style="margin:8px 0 4px"><span>Tensión del hilo</span><span id="fft"></span></div><div class="bar tens"><i id="fftb"></i></div></div>`;
    }
    const g = (id) => $(id);
    if (d.phase === 'charge') {
      g('fhp').style.width = (d.power * 100) + '%';
      g('fhd').textContent = d.dm + ' m';
      g('fhh').textContent = d.ok ? `Fondo: ${d.hab} · ${d.depth} m` : 'Apunta hacia el mar';
      g('fhok').textContent = '';
    } else if (d.phase === 'bite') {
      const i = d.info;
      g('fbn').textContent = d.name; g('fbn').style.color = d.rar ? G.RARITY[d.rar].color : '#fff';
      g('fbp').textContent = i.pct + '%'; g('fbp').style.color = i.pct >= 55 ? '#6df0b6' : i.pct >= 30 ? '#ffe27a' : '#ff8a6b';
      g('fbt').style.width = Math.max(0, d.timeLeft == null ? 100 : d.timeLeft * 100) + '%';
      const c = g('fbc');
      if (!c.dataset.s || c.dataset.s !== String(i.gear + ':' + i.diff)) {
        c.dataset.s = i.gear + ':' + i.diff;
        c.innerHTML = i.parts.map(p => `<span class="chip ${p[1] < 0 ? 'neg' : 'pos'}">${p[0]} ${p[1] > 0 ? '+' : ''}${p[1]}</span>`).join('') + `<span class="chip">Equipo ${i.gear}</span><span class="chip neg">Pez ${i.diff}</span>`;
      }
    } else if (d.phase === 'fight' && d.info) {
      g('ffn').textContent = d.name + ' · ' + d.info.pct + '%';
      g('ffs').textContent = d.pull ? '⚠️ ¡TIRA! Suelta' : '✅ Recoge';
      g('ffs').style.color = d.pull ? '#ff8a6b' : '#6df0b6';
      g('ffp').style.width = U.clamp(d.prog, 0, 100) + '%';
      g('fft').textContent = Math.round(d.tens) + '%';
      g('fftb').style.width = U.clamp(d.tens, 0, 100) + '%';
    }
  };

  /* ---------- Modales ---------- */
  const modal = $('modal');
  function open(type, tab) { ms = { type, tab: tab || null, detail: null }; G.Audio.play('click'); render(); modal.classList.remove('hidden'); }
  function close() { ms = null; modal.classList.add('hidden'); modal.innerHTML = ''; UI.refreshHud(); G.save(); }
  UI.open = function (type, tab) {
    if (G.Fish.locked() && type !== 'menu') { UI.toast('Estás pescando: termina primero 🎣', 'warn'); return; }
    if (G.Dive && G.Dive.active) return;
    open(type, tab);
  };
  UI.close = close;

  const TABS = {
    inv: [['capturas', '🐟 Capturas'], ['equipo', '🎣 Equipo'], ['cebos', '🪱 Cebos'], ['album', '📖 Álbum']],
    shop: [['canas', 'Cañas'], ['hilos', 'Hilos'], ['anzuelos', 'Anzuelos'], ['cebos', 'Cebos'], ['neveras', '🧊 Neveras'], ['buceo', 'Buceo'], ['extras', 'Extras']],
  };
  const TITLES = { inv: 'Inventario', shop: 'Pesca El Anzuelo', sellshop: 'Tu pescadería', lonja: 'Lonja · Proveedores', plan: 'Preparar la jornada', map: 'Mapa de Málaga', menu: 'Ajustes' };

  function render() {
    if (!ms) return;
    if (ms.type === 'catch' || ms.type === 'msg') return;
    const tabs = TABS[ms.type];
    if (tabs && !ms.tab) ms.tab = tabs[0][0];
    let body = '';
    if (ms.type === 'inv') body = invBody();
    else if (ms.type === 'shop') body = shopBody();
    else if (ms.type === 'sellshop') body = sellBody('shop');
    else if (ms.type === 'lonja') body = sellBody('lonja');
    else if (ms.type === 'plan') body = planBody();
    else if (ms.type === 'map') body = mapBody();
    else if (ms.type === 'menu') body = menuBody();
    modal.className = '';
    const prev = modal.querySelector('.body');
    const sc = prev ? prev.scrollTop : 0;
    modal.innerHTML = `<div class="sheet"><header><h2>${TITLES[ms.type]}</h2><div style="display:flex;gap:8px;align-items:center"><span class="pill small">💶 ${U.money(G.S.money)}</span><button class="x" data-act="close">✕</button></div></header>
      ${tabs ? `<div class="tabs">${tabs.map(t => `<button class="tab ${ms.tab === t[0] ? 'on' : ''}" data-act="tab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>` : ''}
      <div class="body">${body}</div></div>`;
    // iconos de pez (canvas)
    modal.querySelectorAll('[data-fish]').forEach(ph => {
      const sp = G.SPECIES_BY_ID[ph.dataset.fish];
      ph.replaceWith(cloneIcon(sp, +ph.dataset.size || 56, ph.dataset.sil === '1'));
    });
    const nb = modal.querySelector('.body'); if (nb) nb.scrollTop = sc;
  }
  function cloneIcon(sp, size, sil) {
    const src = G.FishArt.icon(sp, size, sil), c = document.createElement('canvas');
    c.width = src.width; c.height = src.height; c.style.width = src.style.width; c.style.height = src.style.height;
    c.getContext('2d').drawImage(src, 0, 0);
    return c;
  }
  const fishPh = (id, size, sil) => `<span data-fish="${id}" data-size="${size}" data-sil="${sil ? 1 : 0}"></span>`;
  const rarChip = (r) => `<span class="rar" style="color:${G.RARITY[r].color}">${G.RARITY[r].name}</span>`;

  /* ----- Inventario ----- */
  function invBody() {
    const S = G.S;
    if (ms.tab === 'capturas') {
      const cl = G.cooler();
      const head = `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>🧊 ${cl.name}</span><span>−${cl.loss}% de frescura por hora</span></div>${S.stats.trash ? `<div class="ds" style="color:var(--mut);margin-top:4px">♻️ Basuras retiradas del mar: ${S.stats.trash}</div>` : ''}</div>`;
      if (!S.bag.length) return head + `<p style="color:var(--mut);text-align:center;margin-top:30px">Tu nevera está vacía.<br>¡Lanza la caña y pesca algo! 🎣</p>`;
      let tot = 0; S.bag.forEach(f => tot += G.fishValue(f));
      const rows = S.bag.slice().sort((a, b) => G.fishValue(b) - G.fishValue(a)).map(f => {
        const sp = G.SPECIES_BY_ID[f.sp], fl = G.freshLabel(f);
        return `<div class="item">${fishPh(sp.id, 62)}<div class="meta"><div class="nm">${sp.name} ${rarChip(sp.rar)}</div><div class="ds">${f.cm} cm · ${U.kg(f.kg)}</div><div class="ds" style="color:${fl[1]};font-weight:800">${fl[0]} ${Math.round(G.freshOf(f))}%${f.hurt ? ' · 🩹 ' + f.hurt.toLowerCase() : ''}</div></div><div style="text-align:right;font-weight:800">${U.money(G.fishValue(f))}<div class="ds">ahora (base ${U.money(f.value)})</div><button class="btn sm ghost" style="margin-top:4px" data-act="release" data-v="${f.id}">Soltar</button></div></div>`;
      }).join('');
      return head + `<div class="sum"><span>${S.bag.length}/${G.coolerCap()} peces</span><span>Valor actual ${U.money(tot)}</span></div>${rows}<p class="ds" style="text-align:center;color:var(--mut)">Al terminar el día véndelos en las tiendas del paseo. Cuanto más tiempo pasan, menos valen.</p>`;
    }
    if (ms.tab === 'equipo') {
      const pts = G.gearPoints();
      let h = `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>Puntos de equipo</span><span>Alcance ${G.rod().reach} m</span></div><div class="pct">${pts} <span style="font-size:14px;color:var(--mut)">pts + cebo</span></div></div>`;
      const sect = (title, list, owned, key, stats) => {
        h += `<div class="sec">${title}</div>`;
        list.filter(x => owned.includes(x.id)).forEach(x => {
          const on = S.eq[key] === x.id;
          h += `<div class="item ${on ? 'on' : ''}"><div class="meta"><div class="nm">${x.name}</div><div class="ds">${stats(x)}</div></div><button class="btn sm ${on ? 'ghost' : ''}" data-act="equip" data-k="${key}" data-v="${x.id}" ${on ? 'disabled' : ''}>${on ? 'Equipada' : 'Equipar'}</button></div>`;
        });
      };
      sect('Cañas', G.RODS, S.owned.rods, 'rod', x => `Alcance ${x.reach} m · +${x.pts} pts · aguanta ${x.cap} kg`);
      sect('Hilos', G.LINES, S.owned.lines, 'line', x => `+${x.pts} pts · aguanta ${Math.round(100 / x.tension)}% · hasta ${x.cap} kg`);
      sect('Anzuelos', G.HOOKS, S.owned.hooks, 'hook', x => `+${x.pts} pts · nivel ${x.tier}`);
      if (S.owned.spears.length) sect('Arpones', G.SPEARS, S.owned.spears, 'spear', x => `+${x.pts} pts · alcance ${x.range} m`);
      const extra = [];
      G.DIVE_GEAR.forEach(g => S.owned.gear.includes(g.id) && extra.push(g.icon + ' ' + g.name));
      G.EXTRAS.forEach(g => S.owned.extras.includes(g.id) && extra.push(g.icon + ' ' + g.name));
      h += `<div class="sec">Otros objetos</div><div class="item"><div class="meta ds" style="font-size:14px;color:#fff">${extra.length ? extra.join('<br>') : 'Nada todavía. Mira la pestaña Buceo y Extras de la tienda.'}</div></div>`;
      return h;
    }
    if (ms.tab === 'cebos') {
      return G.BAITS.map(b => `<div class="item ${S.eq.bait === b.id ? 'on' : ''}"><div style="font-size:34px">${b.icon}</div><div class="meta"><div class="nm">${b.name} × ${S.baits[b.id] || 0}</div><div class="ds">${b.desc}</div></div><button class="btn sm ${S.eq.bait === b.id ? 'ghost' : ''}" data-act="bait" data-v="${b.id}" ${S.eq.bait === b.id ? 'disabled' : ''}>${S.eq.bait === b.id ? 'En uso' : 'Usar'}</button></div>`).join('');
    }
    if (ms.tab === 'album') return albumBody();
    return '';
  }

  const MODE_LBL = { orilla: '🏖️ Orilla', paddle: '🏄 Paddle / kayak', sub: '🤿 Submarina', barco: '🚤 Barco (próximamente)' };
  const MODE_ICO = { orilla: '🏖️', paddle: '🏄', sub: '🤿', barco: '🚤' };
  function albumBody() {
    if (ms.detail) {
      const sp = G.SPECIES_BY_ID[ms.detail], rec = G.S.album[sp.id];
      const habs = sp.hab.includes('O') ? 'Cualquier fondo' : sp.hab.split('').map(h => G.HAB_NAMES[h]).join(', ');
      const when = sp.time === 'noche' ? '🌙 De noche' : sp.time === 'dia' ? '☀️ De día' : '🌓 Día y noche';
      const modes = sp.modes.map(m => MODE_LBL[m]).join(' · ');
      const bi = sp.bait.indexOf(Math.max(...sp.bait));
      return `<button class="btn sm ghost" data-act="back">← Volver</button>
        <div style="text-align:center;margin:10px 0">${fishPh(sp.id, 220)}<div style="font-size:24px;font-weight:900">${sp.name}</div><div class="ds" style="font-style:italic;color:var(--mut)">${sp.sci}</div>${rarChip(sp.rar)}</div>
        <div class="item"><div class="meta"><div class="ds">Dato curioso</div><div class="nm" style="font-weight:600;font-size:14px;line-height:1.4">${sp.desc || ''}</div></div></div>
        <div class="item"><div class="meta"><div class="ds">Hábitat</div><div class="nm">${habs}</div></div></div>
        <div class="item"><div class="meta"><div class="ds">Profundidad / distancia</div><div class="nm">${sp.dmin}–${sp.dmax} m desde la orilla</div></div></div>
        <div class="item"><div class="meta"><div class="ds">Cuándo</div><div class="nm">${when}</div></div></div>
        <div class="item"><div class="meta"><div class="ds">Dónde se pesca</div><div class="nm">${modes}</div></div></div>
        <div class="item"><div class="meta"><div class="ds">Cebo favorito</div><div class="nm">${G.BAITS[bi].icon} ${G.BAITS[bi].name}</div></div></div>
        <div class="item"><div class="meta"><div class="ds">Dificultad · Anzuelo mínimo</div><div class="nm">${sp.diff} · nivel ${sp.hook}</div></div></div>
        <div class="item"><div class="meta"><div class="ds">Tus capturas</div><div class="nm">${rec.n} · récord ${rec.maxCm} cm / ${U.kg(rec.maxKg)}</div></div></div>`;
    }
    const order = ['comun', 'poco', 'raro', 'epico', 'leyenda'], fl = ms.filter || 'all';
    let h = `<div class="sum"><span>Colección</span><span>${G.speciesCount()} / ${G.SPECIES.length}</span></div><div class="bar" style="margin-bottom:6px"><i style="width:${G.speciesCount() / G.SPECIES.length * 100}%"></i></div>`;
    const ms2 = Object.keys(G.MILESTONES).map(Number).find(n => !G.S.milestones.includes(n));
    if (ms2) h += `<p class="ds" style="color:var(--mut);margin:4px 0">Próximo premio: ${ms2} especies → ${U.money(G.MILESTONES[ms2])}</p>`;
    h += '<div class="tabs" style="padding:0;margin:4px 0 2px">' + [['all', 'Todas'], ['orilla', '🏖️ Orilla'], ['paddle', '🏄 Paddle'], ['sub', '🤿 Submarina'], ['barco', '🚤 Barco']].map(c => `<button class="tab ${fl === c[0] ? 'on' : ''}" data-act="albfilter" data-v="${c[0]}">${c[1]}</button>`).join('') + '</div>';
    if (fl === 'barco') h += '<p class="ds" style="color:var(--mut);margin:4px 0">Estas especies solo se pescan desde barco, que llegará próximamente.</p>';
    for (const r of order) {
      const list = G.SPECIES.filter(s => s.rar === r && (fl === 'all' || s.modes.includes(fl)));
      if (!list.length) continue;
      h += `<div class="sec" style="color:${G.RARITY[r].color}">${G.RARITY[r].name} · ${list.filter(s => G.S.album[s.id]).length}/${list.length}</div><div class="grid">`;
      for (const s of list) {
        const got = G.S.album[s.id];
        const hint = s.modes.includes('orilla') ? '' : s.modes.map(m => MODE_ICO[m]).join('');
        h += `<div class="cell ${got ? '' : 'unk'}" ${got ? `data-act="detail" data-v="${s.id}"` : ''}>${fishPh(s.id, 78, !got)}<span>${got ? s.name : '???'} ${hint}</span></div>`;
      }
      h += '</div>';
    }
    return h;
  }

  /* ----- Tienda ----- */
  function priceBtn(price, owned, afford, act, data) {
    if (owned) return `<button class="btn sm ghost" disabled>Tuyo</button>`;
    return `<button class="btn sm" data-act="${act}" ${data} ${afford ? '' : 'disabled'}>${U.money(price)}</button>`;
  }
  function shopBody() {
    const S = G.S, can = (p) => S.money >= p;
    const t = ms.tab;
    const list = (arr, ownedArr, kind, stat, eqKey) => arr.map((x, i) => {
      const owned = ownedArr.includes(x.id), cur = eqKey && S.eq[eqKey] === x.id;
      return `<div class="item ${cur ? 'on' : ''}"><div class="meta"><div class="nm">${x.name}</div><div class="ds">${stat(x)}</div></div>${priceBtn(x.price, owned, can(x.price), 'buy', `data-k="${kind}" data-v="${x.id}"`)}</div>`;
    }).join('');
    if (t === 'canas') return `<p class="ds" style="color:var(--mut)">Más alcance = llegas a fondos y peces más lejanos (hasta las boyas, a 200 m).</p>` + list(G.RODS, S.owned.rods, 'rods', x => `Alcance ${x.reach} m · +${x.pts} pts · aguanta ${x.cap} kg`, 'rod');
    if (t === 'hilos') return `<p class="ds" style="color:var(--mut)">Un hilo mejor suma puntos y aguanta mejor los tirones.</p>` + list(G.LINES, S.owned.lines, 'lines', x => `+${x.pts} pts · aguanta ${Math.round(100 / x.tension)}% · hasta ${x.cap} kg`, 'line');
    if (t === 'anzuelos') return `<p class="ds" style="color:var(--mut)">Los peces grandes necesitan anzuelos de mayor nivel.</p>` + list(G.HOOKS, S.owned.hooks, 'hooks', x => `+${x.pts} pts · nivel ${x.tier}`, 'hook');
    if (t === 'cebos') return `<p class="ds" style="color:var(--mut)">El cebo se estropea al terminar el día: compra solo lo que vayas a usar. Mejor cebo = pica antes y atrae mejores peces.</p>` + G.BAITS.map(b => `<div class="item"><div style="font-size:34px">${b.icon}</div><div class="meta"><div class="nm">${b.name} <span class="ds">(tienes ${S.baits[b.id] || 0})</span></div><div class="ds">${b.desc} +${b.pts} pts</div></div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn sm" data-act="buybait" data-v="${b.id}" data-n="5" ${can(b.price * 5) ? '' : 'disabled'}>5 · ${U.money(b.price * 5)}</button><button class="btn sm" data-act="buybait" data-v="${b.id}" data-n="20" ${can(b.pack20) ? '' : 'disabled'}>20 · ${U.money(b.pack20)}</button></div></div>`).join('');
    if (t === 'neveras') return `<p class="ds" style="color:var(--mut)">Aquí guardas lo que pescas hasta venderlo. Las mejores neveras caben más peces y los mantienen frescos más tiempo.</p>` + G.COOLERS.map((c, i) => {
      const owned = i <= S.cooler;
      return `<div class="item ${i === S.cooler ? 'on' : ''}"><div style="font-size:30px">🧊</div><div class="meta"><div class="nm">${c.name}</div><div class="ds">Caben ${c.cap} peces · pierden ${c.loss}% de frescura por hora</div></div>${priceBtn(c.price, owned, can(c.price), 'buycooler', `data-v="${i}"`)}</div>`;
    }).join('');
    if (t === 'buceo') {
      let h = `<p class="ds" style="color:var(--mut)">Para la pesca submarina necesitas gafas, aletas, neopreno y un arpón. Sal por la zona de buceo de las rocas.</p><div class="sec">Equipo básico</div>`;
      h += G.DIVE_GEAR.map(g => `<div class="item"><div style="font-size:30px">${g.icon}</div><div class="meta"><div class="nm">${g.name}</div></div>${priceBtn(g.price, S.owned.gear.includes(g.id), can(g.price), 'buy', `data-k="gear" data-v="${g.id}"`)}</div>`).join('');
      h += `<div class="sec">Arpones</div>` + list(G.SPEARS, S.owned.spears, 'spears', x => `+${x.pts} pts · alcance ${x.range} m`, 'spear');
      return h;
    }
    if (t === 'extras') return G.EXTRAS.map(g => `<div class="item"><div style="font-size:34px">${g.icon}</div><div class="meta"><div class="nm">${g.name}</div><div class="ds">${g.desc}</div></div>${priceBtn(g.price, S.owned.extras.includes(g.id), can(g.price), 'buy', `data-k="extras" data-v="${g.id}"`)}</div>`).join('');
    return '';
  }

  function sellBody(dest) {
    const S = G.S, lvl = G.SHOP_LEVELS[S.shopLevel], next = G.SHOP_LEVELS[S.shopLevel + 1];
    const mult = G.sellMult(dest), mk = S.market.pct;
    let h = '';
    if (dest === 'shop') {
      const col = mk > 0 ? '#6df0b6' : mk < 0 ? '#ff8a6b' : '#fff';
      const msg = mk > 0 ? `Hoy se paga el pescado un ${mk}% más caro de lo normal: ¡buen día para vender aquí!` : mk < 0 ? `Hoy está un ${-mk}% más barato de lo normal. Si no te compensa, la lonja paga siempre lo mismo.` : 'Hoy el pescado está a su precio normal.';
      h += `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>📊 Mercado de hoy</span><b style="color:${col};font-size:18px">${mk > 0 ? '+' : ''}${mk}%</b></div><div class="ds" style="color:var(--mut);margin-top:4px">${msg}</div><div class="ds" style="color:var(--mut);margin-top:4px">Un pescado que normalmente te pagan a ${U.money(3 * lvl.mult)} hoy te lo pagan a ${U.money(3 * mult)} (ayer: ${S.market.prev > 0 ? '+' : ''}${S.market.prev}%).</div></div>`;
      h += `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>🐟 ${lvl.name}</span><span>Base ${Math.round(lvl.mult * 100)}%</span></div></div>`;
      if (next) h += `<div class="item"><div class="meta"><div class="nm">Mejorar: ${next.name}</div><div class="ds">Tu pescadería pagará el ${Math.round(next.mult * 100)}% del valor</div></div><button class="btn sm" data-act="upshop" ${S.money >= next.cost ? '' : 'disabled'}>${U.money(next.cost)}</button></div>`;
      else h += `<div class="item"><div class="meta"><div class="nm">¡Pescadería gourmet al máximo! ⭐</div><div class="ds">Paga más que cualquier proveedor.</div></div></div>`;
    } else {
      h += `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>🚚 Proveedores</span><span>Pagan el ${Math.round(G.SUPPLIER_MULT * 100)}% · precio fijo</span></div></div>`;
    }
    if (!S.bag.length) return h + `<p style="color:var(--mut);text-align:center;margin-top:20px">No tienes peces para vender.</p>`;
    let tot = 0; S.bag.forEach(f => tot += G.fishValue(f));
    h += `<div class="sec">Vender todo (${S.bag.length} peces)</div><button class="btn" style="width:100%;margin-bottom:6px" data-act="sellall" data-v="${dest}">💶 Vender todo por ${U.money(tot * mult)}</button><div class="sec">Uno a uno</div>`;
    h += S.bag.slice().sort((a, b) => G.fishValue(b) - G.fishValue(a)).map(f => {
      const sp = G.SPECIES_BY_ID[f.sp], fl = G.freshLabel(f);
      return `<div class="item">${fishPh(sp.id, 52)}<div class="meta"><div class="nm">${sp.name}</div><div class="ds">${f.cm} cm · ${U.kg(f.kg)}</div><div class="ds" style="color:${fl[1]};font-weight:800">${fl[0]} ${Math.round(G.freshOf(f))}%${f.hurt ? ' · 🩹 ' + f.hurt.toLowerCase() : ''}</div></div><button class="btn sm" data-act="sell" data-v="${f.id}" data-d="${dest}">${U.money(G.fishValue(f) * mult)}</button></div>`;
    }).join('');
    return h;
  }

  /* ----- Preparar la jornada ----- */
  function planSummary() {
    const p = G.S.plan, end = (p.start + p.dur) % 24;
    let night = false;
    for (let i = 0; i < p.dur; i++) { const hh = (p.start + i) % 24; if (hh >= 21 || hh < 5.5) night = true; }
    return { text: `De ${U.clock(p.start)} a ${U.clock(end)} (${p.dur} h)`, night };
  }
  function planBody() {
    const S = G.S, p = S.plan, sm = planSummary();
    const nb = G.BAITS.reduce((a, b) => a + (S.baits[b.id] || 0), 0);
    return `<div class="card" style="margin-bottom:8px">
        <div class="lbl"><span>Hora de inicio</span><b id="pStartV">${U.clock(p.start)}</b></div>
        <input type="range" class="rng" min="0" max="23" step="1" value="${p.start}" data-slider="start">
        <div class="lbl" style="margin-top:12px"><span>Duración de la jornada</span><b id="pDurV">${p.dur} h</b></div>
        <input type="range" class="rng" min="1" max="24" step="1" value="${p.dur}" data-slider="dur">
        <div class="pct" style="font-size:18px;margin-top:10px" id="pSum">${sm.text}</div>
        <div class="ds" id="pNight" style="color:var(--mut)">${sm.night ? '🌙 Incluye noche: sin la lámpara de pesca verás muy poco.' : '☀️ Jornada de día.'}</div>
      </div>
      <div class="item"><div style="font-size:30px">🪱</div><div class="meta"><div class="nm">Cebos: ${nb}</div><div class="ds">${nb ? 'Se estropean al acabar el día.' : 'No llevas cebo. Compra en Pesca El Anzuelo.'}</div></div></div>
      <div class="item"><div style="font-size:30px">🧊</div><div class="meta"><div class="nm">${G.cooler().name}: ${S.bag.length}/${G.coolerCap()}</div><div class="ds">${S.bag.length ? 'Aún llevas pescado sin vender: se seguirá estropeando.' : 'Vacía y lista.'}</div></div></div>
      <button class="btn primary" style="width:100%;margin-top:6px" data-act="startday">▶ Empezar jornada</button>
      <p class="ds" style="color:var(--mut);text-align:center">Los peces solo se pueden vender al terminar la jornada.</p>`;
  }
  modal.addEventListener('input', (e) => {
    const k = e.target.dataset && e.target.dataset.slider;
    if (!k || !ms || ms.type !== 'plan') return;
    G.S.plan[k] = +e.target.value;
    const sm = planSummary();
    $('pStartV').textContent = U.clock(G.S.plan.start); $('pDurV').textContent = G.S.plan.dur + ' h';
    $('pSum').textContent = sm.text; $('pNight').textContent = sm.night ? '🌙 Incluye noche: sin la lámpara de pesca verás muy poco.' : '☀️ Jornada de día.';
  });

  /* ----- Mapa ----- */
  function mapBody() {
    if (G.S.phase === 'prep') return `<p style="color:var(--mut);text-align:center;margin-top:30px">Empieza la jornada para ir a pescar 🎣</p>`;
    return `<p class="ds" style="color:var(--mut)">Viaja rápido a un punto de pesca de la costa de Málaga.</p>` + G.World.SPOTS.map(s =>
      `<div class="item"><div style="font-size:30px">${s.icon}</div><div class="meta"><div class="nm">${s.name}</div><div class="ds">${s.sub}${s.locked ? ' · 🔒 se desbloquea más adelante' : ''}</div></div><button class="btn sm" data-act="travel" data-v="${s.id}" ${s.locked ? 'disabled' : ''}>Ir</button></div>`).join('') +
      `<div class="item"><div style="font-size:30px">🤿</div><div class="meta"><div class="nm">Zona de buceo</div><div class="ds">Rocas del Peñón · pesca submarina</div></div><button class="btn sm" data-act="travel" data-v="dive">Ir</button></div>`;
  }

  /* ----- Ajustes ----- */
  function menuBody() {
    return `<div class="item"><div class="meta"><div class="nm">Sonido</div></div><button class="btn sm" data-act="mute">${G.S.muted ? '🔇 Activar' : '🔊 Silenciar'}</button></div>
      <div class="sec">Cómo se juega</div>
      <div class="item"><div class="meta ds" style="font-size:13.5px;color:#fff;line-height:1.5">
      🕹️ Arrastra a la izquierda para moverte.<br>🎣 Mantén <b>LANZAR</b> y suéltalo: cuanto más tarde, más lejos. Mueve el joystick para apuntar.<br>
      👀 Cuando veas la sombra y el <b>%</b>, pulsa <b>¡CLAVAR!</b>.<br>🌀 Mantén <b>RECOGE</b> mientras el pez no tire. Si tira, suelta.<br>
      💶 Vende en la tienda y mejora el equipo para pescar todas las especies.<br>🤿 Zona de buceo: arpón, aletas, neopreno y gafas.<br>🏄 Con la tabla de paddle llegas hasta las boyas (200 m).</div></div>
      <div class="sec">Datos</div>
      <div class="item"><div class="meta"><div class="nm">Empezar de nuevo</div><div class="ds">Borra tu partida guardada</div></div><button class="btn sm warn" data-act="reset">Borrar</button></div>
      <p class="ds" style="color:var(--mut);text-align:center;margin-top:14px">Pesca Málaga · todo el arte y sonido generados por código.</p>`;
  }

  /* ----- Acciones ----- */
  function sellFish(f, dest) {
    const v = Math.round(G.fishValue(f) * G.sellMult(dest) * 100) / 100;
    G.S.money += v; G.S.stats.earned += v;
    return v;
  }
  function handle(act, d) {
    const S = G.S;
    if (act === 'close') return close();
    if (act === 'tab') { ms.tab = d.v; ms.detail = null; G.Audio.play('click'); return render(); }
    if (act === 'equip') { S.eq[d.k] = d.v; G.Audio.play('click'); return render(); }
    if (act === 'bait') { S.eq.bait = d.v; G.Audio.play('click'); return render(); }
    if (act === 'albfilter') { ms.filter = d.v; return render(); }
    if (act === 'detail') { ms.detail = d.v; return render(); }
    if (act === 'back') { ms.detail = null; return render(); }
    if (act === 'buy') {
      const pools = { rods: G.RODS, lines: G.LINES, hooks: G.HOOKS, spears: G.SPEARS, gear: G.DIVE_GEAR, extras: G.EXTRAS };
      const it = pools[d.k].find(x => x.id === d.v);
      if (S.money < it.price) return UI.toast('No tienes suficiente dinero', 'warn');
      S.money -= it.price; S.owned[d.k].push(it.id);
      const eqKey = { rods: 'rod', lines: 'line', hooks: 'hook', spears: 'spear' }[d.k];
      if (eqKey) S.eq[eqKey] = it.id;
      G.Audio.play('buy'); UI.toast('Comprado: ' + it.name, 'good'); G.save(); return render();
    }
    if (act === 'buybait') {
      const b = G.BAITS.find(x => x.id === d.v), n = +d.n, cost = n === 20 ? b.pack20 : b.price * n;
      if (S.money < cost) return UI.toast('No tienes suficiente dinero', 'warn');
      S.money -= cost; S.baits[b.id] = (S.baits[b.id] || 0) + n; if (!S.baits[S.eq.bait]) S.eq.bait = b.id;
      G.Audio.play('buy'); G.save(); return render();
    }
    if (act === 'buycooler') {
      const c = G.COOLERS[+d.v];
      if (S.money < c.price) return UI.toast('No tienes suficiente dinero', 'warn');
      S.money -= c.price; S.cooler = +d.v; G.Audio.play('buy'); UI.toast('Comprada: ' + c.name, 'good'); G.save(); return render();
    }
    if (act === 'release') {
      const i = S.bag.findIndex(f => f.id === d.v); if (i < 0) return;
      S.bag.splice(i, 1); G.Audio.play('click'); return render();
    }
    if (act === 'startday') { close(); G.startDay(); return; }
    if (act === 'swapout') {
      const c = ms.c, done = ms.done;
      if (d.v === 'NEW') UI.toast('Devuelves ' + G.SPECIES_BY_ID[c.sp].name.toLowerCase() + ' al mar 🌊');
      else { const i = S.bag.findIndex(f => f.id === d.v); if (i >= 0) { UI.toast('Sueltas ' + G.SPECIES_BY_ID[S.bag[i].sp].name.toLowerCase() + ' 🌊'); S.bag.splice(i, 1); S.bag.push(c); } }
      ms = null; modal.innerHTML = ''; modal.className = 'hidden'; UI.refreshHud(); G.save(); done && done(); return;
    }
    if (act === 'sell') {
      const i = S.bag.findIndex(f => f.id === d.v); if (i < 0) return;
      const v = sellFish(S.bag[i], d.d); S.bag.splice(i, 1);
      G.Audio.play('coin'); UI.toast('+' + U.money(v), 'good'); G.save(); return render();
    }
    if (act === 'sellall') {
      let tot = 0; S.bag.forEach(f => tot += sellFish(f, d.v)); const n = S.bag.length; S.bag = [];
      G.Audio.play('coin'); UI.toast(`Vendes ${n} peces por ${U.money(tot)}`, 'good'); G.save(); return render();
    }
    if (act === 'upshop') {
      const nx = G.SHOP_LEVELS[S.shopLevel + 1];
      if (!nx || S.money < nx.cost) return;
      S.money -= nx.cost; S.shopLevel++; G.Audio.play('buy'); UI.toast('¡Tu pescadería mejora: ' + nx.name + '!', 'good'); G.save(); return render();
    }
    if (act === 'travel') { close(); G.travel(d.v); return; }
    if (act === 'mute') { G.Audio.setMuted(!S.muted); return render(); }
    if (act === 'reset') {
      if (ms.confirmReset) { G.resetGame(); location.reload(); return; }
      ms.confirmReset = true; UI.toast('Pulsa otra vez para confirmar el borrado', 'warn'); return;
    }
  }
  modal.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (t) { handle(t.dataset.act, t.dataset); return; }
    if (e.target === modal && ms && ms.type !== 'catch' && ms.type !== 'msg' && ms.type !== 'swap') close();
  });

  /* ----- Tarjetas de captura y mensajes ----- */
  UI.showCatch = function (c, flags, onClose) {
    const sp = G.SPECIES_BY_ID[c.sp], col = G.RARITY[sp.rar].color;
    ms = { type: 'catch' };
    modal.className = 'catch';
    modal.innerHTML = `<div class="catchcard" style="box-shadow:0 0 40px ${col}55"><div class="shine"></div>
      <div style="position:relative"><div class="ds" style="color:${col};font-weight:900;letter-spacing:1px;text-transform:uppercase">${G.RARITY[sp.rar].name}</div>
      <div id="cfish" style="margin:6px 0"></div>
      <h3>${sp.name}</h3><div class="sci">${sp.sci}</div><div style="margin:6px 2px 2px;font-size:12.5px;line-height:1.35;color:var(--mut)">${sp.desc || ''}</div>
      <div class="stats"><div><b>${c.cm} cm</b><span>TAMAÑO</span></div><div><b>${U.kg(c.kg)}</b><span>PESO</span></div><div><b>${U.money(G.fishValue(c))}</b><span>VALOR</span></div></div>
      <div>${flags.isNew ? '<span class="badge new">⭐ ¡NUEVA ESPECIE!</span>' : ''}${flags.isRecord ? '<span class="badge rec">🏆 ¡Récord!</span>' : ''}${c.hurt ? `<span class="badge rec" style="background:#b0413a">🩹 ${c.hurt} · ${Math.round(c.fresh)}% fresco</span>` : ''}${flags.bonus ? `<span class="badge new">🎁 Premio +${U.money(flags.bonus)}</span>` : ''}</div>
      ${flags.isNew ? `<div class="ds" style="color:var(--mut);margin-top:6px">${flags.n}/${G.SPECIES.length} especies</div>` : ''}
      <button class="btn primary" style="margin-top:14px" id="cok">¡Genial!</button></div></div>`;
    modal.classList.remove('hidden');
    const big = cloneIcon(sp, 240, false); $('cfish').appendChild(big);
    $('cok').onclick = () => { ms = null; modal.innerHTML = ''; modal.className = 'hidden'; onClose && onClose(); UI.refreshHud(); };
  };
  UI.showTrash = function (it, onClose) {
    ms = { type: 'catch' };
    modal.className = 'catch';
    modal.innerHTML = `<div class="catchcard"><div style="position:relative"><div class="ds" style="color:#9fb0a8;font-weight:900;letter-spacing:1px;text-transform:uppercase">Basura</div>
      <div id="cfish" style="margin:6px 0"></div><h3>${it.name}</h3>
      <div style="margin:6px 2px;font-size:12.5px;line-height:1.35;color:var(--mut)">${it.desc}</div>
      <span class="badge new" style="background:#2e7d5b">♻️ La tiras al contenedor · ${G.S.stats.trash} basuras retiradas</span>
      <button class="btn primary" style="margin-top:14px" id="cok">Vale</button></div></div>`;
    modal.classList.remove('hidden');
    $('cfish').appendChild(G.FishArt.trash(it.id, 230));
    $('cok').onclick = () => { ms = null; modal.innerHTML = ''; modal.className = 'hidden'; onClose && onClose(); UI.refreshHud(); };
  };
  UI.showMsg = function (title, text, onClose) {
    ms = { type: 'msg' };
    modal.className = 'catch';
    modal.innerHTML = `<div class="catchcard"><div style="position:relative"><h3>${title}</h3><p style="color:var(--mut);line-height:1.4">${text}</p><button class="btn primary" style="margin-top:8px" id="cok">Vale</button></div></div>`;
    modal.classList.remove('hidden');
    $('cok').onclick = () => { ms = null; modal.innerHTML = ''; modal.className = 'hidden'; onClose && onClose(); };
  };

  UI.showSwap = function (c, done) {
    ms = { type: 'swap', c, done };
    const S = G.S, row = (f, id, label) => {
      const sp = G.SPECIES_BY_ID[f.sp], fl = G.freshLabel(f);
      return `<div class="item">${fishPh(sp.id, 52)}<div class="meta"><div class="nm">${sp.name} ${rarChip(sp.rar)}</div><div class="ds">${f.cm} cm · ${U.kg(f.kg)} · ${U.money(G.fishValue(f))}</div><div class="ds" style="color:${fl[1]};font-weight:800">${fl[0]} ${Math.round(G.freshOf(f))}%${f.hurt ? ' · 🩹 ' + f.hurt.toLowerCase() : ''}</div></div><button class="btn sm warn" data-act="swapout" data-v="${id}">${label}</button></div>`;
    };
    modal.className = '';
    modal.innerHTML = `<div class="sheet"><header><h2>🧊 Nevera llena</h2></header><div class="body"><p class="ds" style="color:var(--mut)">Tu ${G.cooler().name.toLowerCase()} está llena (${S.bag.length}/${G.coolerCap()}). Elige qué pez devuelves al mar.</p>
      <div class="sec">Recién pescado</div>${row(c, 'NEW', 'Soltar este')}<div class="sec">En la nevera</div>${S.bag.slice().sort((a, b) => G.fishValue(a) - G.fishValue(b)).map(f => row(f, f.id, 'Soltar')).join('')}</div></div>`;
    modal.querySelectorAll('[data-fish]').forEach(ph => { const sp = G.SPECIES_BY_ID[ph.dataset.fish]; ph.replaceWith(cloneIcon(sp, +ph.dataset.size || 56, false)); });
    modal.classList.remove('hidden');
  };
  UI.confirm = function (title, text, okLabel, onOk) {
    ms = { type: 'msg' };
    modal.className = 'catch';
    modal.innerHTML = `<div class="catchcard"><div style="position:relative"><h3>${title}</h3><p style="color:var(--mut);line-height:1.4">${text}</p><div style="display:flex;gap:8px;justify-content:center;margin-top:8px"><button class="btn ghost" id="cno">Cancelar</button><button class="btn primary" style="font-size:16px;padding:12px 22px" id="cok">${okLabel}</button></div></div></div>`;
    modal.classList.remove('hidden');
    const done = () => { ms = null; modal.innerHTML = ''; modal.className = 'hidden'; };
    $('cno').onclick = done;
    $('cok').onclick = () => { done(); onOk && onOk(); };
  };

  /* Botones */
  $('btnInv').addEventListener('click', () => UI.open('inv'));
  $('btnShop').addEventListener('click', () => G.dayButton());
  $('btnMap').addEventListener('click', () => UI.open('map'));
  $('btnMenu').addEventListener('click', () => UI.open('menu'));

  return UI;
})();
