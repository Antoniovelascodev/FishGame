/* Sonido procedural con Web Audio (sin archivos externos). iOS exige un gesto del usuario para arrancar. */
window.G = window.G || {};

G.Audio = (function () {
  let ctx = null, master = null, ambient = null, noiseBuf = null, started = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = G.S.muted ? 0 : 0.8; master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = b * 3.5; } // ruido marrón
    return ctx;
  }

  function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!started) { started = true; startAmbient(); }
  }

  function startAmbient() {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
    const g = ctx.createGain(); g.gain.value = 0.14;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11;
    const lg = ctx.createGain(); lg.gain.value = 0.08;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(); lfo.start();
    ambient = { g, f };
  }
  function setSwell(s) { if (ambient) { ambient.g.gain.setTargetAtTime(0.10 + s * 0.05, ctx.currentTime, 1); ambient.f.frequency.setTargetAtTime(420 + s * 160, ctx.currentTime, 1); } }

  function noiseBurst(dur, freq, vol, type) {
    if (!ctx) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  function tone(freq, dur, vol, type, slide, when) {
    if (!ctx) return;
    const o = ctx.createOscillator(); o.type = type || 'sine';
    const g = ctx.createGain(); const t = ctx.currentTime + (when || 0);
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }

  const sfx = {
    whoosh() { noiseBurst(0.35, 1400, 0.5); },
    splash() { noiseBurst(0.5, 900, 0.9); noiseBurst(0.25, 2400, 0.35, 'highpass'); },
    nibble() { tone(520, 0.06, 0.15, 'triangle'); },
    bite() { tone(880, 0.12, 0.35, 'triangle'); tone(1320, 0.2, 0.3, 'triangle', 0, 0.1); },
    strike() { noiseBurst(0.18, 2000, 0.5); },
    reel() { tone(180 + Math.random() * 40, 0.04, 0.12, 'square'); },
    snap() { noiseBurst(0.15, 4000, 0.7, 'highpass'); tone(300, 0.3, 0.2, 'sawtooth', 80); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 0.28, 'triangle', 0, i * 0.09)); },
    rare() { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, 0.35, 0.3, 'triangle', 0, i * 0.1)); },
    lose() { tone(330, 0.35, 0.25, 'triangle', 160); },
    coin() { tone(988, 0.08, 0.25, 'square'); tone(1319, 0.2, 0.25, 'square', 0, 0.07); },
    click() { tone(660, 0.05, 0.12, 'triangle'); },
    buy() { tone(784, 0.1, 0.22, 'triangle'); tone(1175, 0.15, 0.22, 'triangle', 0, 0.08); },
    gull() { tone(1500, 0.18, 0.2, 'triangle', 900); tone(1700, 0.2, 0.18, 'triangle', 1000, 0.2); tone(1400, 0.26, 0.16, 'triangle', 800, 0.45); },
    lid() { noiseBurst(0.12, 700, 0.5); tone(150, 0.12, 0.25, 'square', 90); },
    plop() { tone(420, 0.16, 0.3, 'sine', 160); noiseBurst(0.12, 1500, 0.25); },
    bump() { tone(110, 0.12, 0.35, 'triangle', 70); noiseBurst(0.08, 500, 0.3); },
    gem() { [880, 1175, 1568].forEach((f, i) => tone(f, 0.3, 0.26, 'sine', 0, i * 0.08)); },
    pop() { tone(500, 0.08, 0.2, 'triangle', 800); },
    engine() { tone(90, 0.45, 0.1, 'sawtooth', 70); },
    shoot() { noiseBurst(0.2, 800, 0.7); tone(200, 0.15, 0.2, 'sawtooth', 60); },
  };

  function play(name) { if (G.S.muted) return; if (!ctx) return; try { sfx[name] && sfx[name](); } catch (e) { } }
  function setMuted(m) { G.S.muted = m; if (master) master.gain.value = m ? 0 : 0.8; G.save(); }

  // iOS: silenciar y reanudar cuando la página se oculta
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (started) ctx.resume();
  });
  ['pointerdown', 'touchend', 'keydown'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));

  return { play, setMuted, setSwell, unlock };
})();
