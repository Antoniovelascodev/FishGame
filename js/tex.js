/* Texturas procedurales (sin assets externos: todo se genera por código) */
window.G = window.G || {};
G.TEX = {};

(function () {
  const rng = G.U.rng(1234);
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // ---- Arena seca
  (function () {
    const c = mk(256, 256), x = c.getContext('2d');
    x.fillStyle = '#ecd9a6'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      const v = rng();
      x.fillStyle = v < 0.5 ? 'rgba(190,160,100,0.18)' : v < 0.8 ? 'rgba(255,245,215,0.22)' : 'rgba(150,120,70,0.14)';
      const s = 1 + rng() * 1.8;
      x.fillRect(rng() * 256, rng() * 256, s, s);
    }
    // ondulaciones suaves del viento
    x.strokeStyle = 'rgba(190,160,105,0.16)'; x.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      const y0 = rng() * 256;
      for (let px = 0; px <= 256; px += 8) x.lineTo(px, y0 + Math.sin(px / 24 + i) * 4);
      x.stroke();
    }
    G.TEX.sand = c;
  })();

  // ---- Arena mojada
  (function () {
    const c = mk(128, 128), x = c.getContext('2d');
    x.fillStyle = '#bda878'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 700; i++) {
      x.fillStyle = rng() < 0.5 ? 'rgba(80,65,40,0.18)' : 'rgba(230,215,170,0.14)';
      x.fillRect(rng() * 128, rng() * 128, 1.5, 1.5);
    }
    G.TEX.wet = c;
  })();

  // ---- Cáusticas del agua (luz ondulante)
  (function () {
    const c = mk(256, 256), x = c.getContext('2d');
    x.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 34; i++) {
      const px = rng() * 256, py = rng() * 256, r = 14 + rng() * 26;
      for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) {
        const g = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r);
        g.addColorStop(0, 'rgba(255,255,255,0.20)');
        g.addColorStop(0.6, 'rgba(255,255,255,0.05)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g;
        x.beginPath(); x.arc(px + ox, py + oy, r, 0, 6.3); x.fill();
      }
    }
    G.TEX.caustic = c;
  })();

  // ---- Paseo marítimo (baldosas con ondas, como el de Málaga)
  (function () {
    const c = mk(128, 128), x = c.getContext('2d');
    x.fillStyle = '#d8cdb6'; x.fillRect(0, 0, 128, 128);
    for (let row = 0; row < 8; row++) {
      x.beginPath();
      for (let px = 0; px <= 128; px += 4) x.lineTo(px, row * 16 + 8 + Math.sin(px / 10 + row * 0.8) * 4);
      x.strokeStyle = row % 2 ? '#a89a7c' : '#efe7d4'; x.lineWidth = 7; x.stroke();
    }
    x.strokeStyle = 'rgba(70,60,40,0.18)'; x.lineWidth = 1;
    x.strokeRect(0.5, 0.5, 127, 127);
    G.TEX.paseo = c;
  })();

  // ---- Piedra del espigón / rocas
  (function () {
    const c = mk(128, 128), x = c.getContext('2d');
    x.fillStyle = '#7d7a76'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 26; i++) {
      const px = rng() * 128, py = rng() * 128, r = 10 + rng() * 22;
      const l = 95 + rng() * 55;
      x.fillStyle = `rgb(${l},${l - 4},${l - 10})`;
      x.beginPath(); x.ellipse(px, py, r, r * (0.6 + rng() * 0.4), rng() * 3, 0, 6.3); x.fill();
      x.strokeStyle = 'rgba(30,28,26,0.35)'; x.lineWidth = 1.5; x.stroke();
    }
    for (let i = 0; i < 400; i++) { x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(rng() * 128, rng() * 128, 1.5, 1.5); }
    G.TEX.stone = c;
  })();

  // ---- Madera (pasarelas, barcas)
  (function () {
    const c = mk(64, 64), x = c.getContext('2d');
    x.fillStyle = '#9b7040'; x.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 4; i++) {
      x.fillStyle = i % 2 ? '#a77a47' : '#8f6638'; x.fillRect(0, i * 16, 64, 15);
      x.strokeStyle = 'rgba(60,35,15,0.35)'; x.strokeRect(0, i * 16, 64, 15);
    }
    G.TEX.wood = c;
  })();

  G.TEX.patterns = {};
  G.TEX.init = function (ctx) {
    for (const k of ['sand', 'wet', 'caustic', 'paseo', 'stone', 'wood']) G.TEX.patterns[k] = ctx.createPattern(G.TEX[k], 'repeat');
  };
})();
