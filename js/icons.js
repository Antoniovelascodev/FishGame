/* Iconos dibujados a mano (nada de emojis del sistema): cada objeto con su forma y sus colores */
window.G = window.G || {};

G.Icons = (function () {
  const D = {};
  const o = (c, col, w) => { c.strokeStyle = col || 'rgba(20,25,35,.55)'; c.lineWidth = w || 1.2; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); };
  const f = (c, col) => { c.fillStyle = col; c.fill(); };
  const ell = (c, x, y, rx, ry, col, rot) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, 6.3); f(c, col); o(c); };
  const rect = (c, x, y, w, h, col, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r || 2); else c.rect(x, y, w, h); f(c, col); o(c); };

  D.worm = (c) => {
    c.lineCap = 'round';
    for (const [w, col] of [[7, '#7a3f35'], [5.2, '#d98a86']]) {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(-11, 5); c.bezierCurveTo(-6, -9, 0, 12, 5, -2); c.bezierCurveTo(8, -9, 11, -4, 11, -9); c.stroke();
    }
    c.strokeStyle = 'rgba(122,63,53,.7)'; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const x = -8 + i * 4.6; c.beginPath(); c.moveTo(x - 1.5, 4 - Math.sin(i) * 4); c.lineTo(x + 1.5, 7 - Math.sin(i) * 4); c.stroke(); }
    ell(c, 11, -9, 2.4, 2, '#e8a09b');
  };
  D.fish = (c, col2) => {
    c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(-5, -10, 8, -4); c.lineTo(15, -9); c.lineTo(13, 0); c.lineTo(15, 9); c.lineTo(8, 4); c.quadraticCurveTo(-5, 10, -13, 0); f(c, col2 || '#aebfcb'); o(c);
    c.beginPath(); c.moveTo(-12, 1); c.quadraticCurveTo(-4, 8, 8, 3); c.lineTo(-10, 4); f(c, 'rgba(255,255,255,.55)');
    c.fillStyle = '#2b3a4a'; c.beginPath(); c.arc(-8, -2, 1.6, 0, 6.3); c.fill();
    c.strokeStyle = 'rgba(60,80,100,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-3, -7); c.lineTo(-1, 7); c.stroke();
  };
  D.sardine = (c) => { c.save(); c.scale(1, 0.8); D.fish(c, '#b9c9d4'); c.restore(); c.fillStyle = 'rgba(70,110,150,.6)'; c.beginPath(); c.ellipse(0, -5, 8, 2, 0.1, 0, 6.3); c.fill(); };
  D.crab = (c) => {
    c.strokeStyle = '#a83a28'; c.lineWidth = 1.8; c.lineCap = 'round';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(s * 5, 2 + i * 2.4); c.lineTo(s * 12, 4 + i * 3.4); c.stroke(); }
    c.strokeStyle = '#c4492f'; c.lineWidth = 2.4; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -2); c.lineTo(s * 10, -9); c.stroke(); }
    ell(c, -10.5, -11, 3.6, 3, '#d9573a'); ell(c, 10.5, -11, 3.6, 3, '#d9573a');
    ell(c, 0, 1, 8.5, 6.4, '#e0603f');
    ell(c, -2.5, -5.6, 1.4, 1.4, '#fff'); ell(c, 2.5, -5.6, 1.4, 1.4, '#fff');
    c.fillStyle = '#111'; c.fillRect(-2.9, -6, 1, 1); c.fillRect(2.1, -6, 1, 1);
  };
  D.cooler = (c) => {
    rect(c, -13, -5, 26, 17, '#2f7fd0', 3);
    rect(c, -14, -10, 28, 7, '#f3f6f8', 3);
    c.beginPath(); c.moveTo(-6, -10); c.lineTo(-6, -14); c.lineTo(6, -14); c.lineTo(6, -10); o(c, '#35424f', 2);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-11, -3, 4, 13);
    ell(c, 0, 5, 3.6, 3.6, '#f3f6f8');
  };
  D.lamp = (c) => {
    const g = c.createRadialGradient(0, -2, 1, 0, -2, 15); g.addColorStop(0, 'rgba(255,230,120,.8)'); g.addColorStop(1, 'rgba(255,230,120,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, -2, 15, 0, 6.3); c.fill();
    rect(c, -6, 4, 12, 8, '#4a4f58', 2); rect(c, -7, -8, 14, 13, '#ffe27a', 3); c.strokeStyle = 'rgba(120,90,10,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 5); c.stroke();
    c.beginPath(); c.arc(0, -11, 4, Math.PI, 0); o(c, '#35424f', 2);
  };
  D.rod = (c) => {
    c.lineCap = 'round';
    c.strokeStyle = '#4b3220'; c.lineWidth = 3; c.beginPath(); c.moveTo(-11, 12); c.quadraticCurveTo(0, -2, 12, -13); c.stroke();
    c.strokeStyle = '#8c5a34'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-11, 12); c.quadraticCurveTo(0, -2, 12, -13); c.stroke();
    ell(c, -3, 6, 4.4, 4.4, '#c9ccd2'); ell(c, -3, 6, 1.7, 1.7, '#5a6370');
    c.strokeStyle = 'rgba(30,40,50,.7)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(12, -13); c.quadraticCurveTo(15, 0, 11, 10); c.stroke();
    c.strokeStyle = '#d33'; c.lineWidth = 2; c.beginPath(); c.arc(11, 11, 2.4, 0, 6.3); c.stroke();
  };
  D.spool = (c) => {
    rect(c, -10, -12, 20, 4, '#5a6370', 1.5); rect(c, -10, 8, 20, 4, '#5a6370', 1.5); rect(c, -7, -9, 14, 18, '#e9d27a', 2);
    c.strokeStyle = 'rgba(160,120,20,.5)'; c.lineWidth = 1; for (let y = -7; y < 8; y += 3) { c.beginPath(); c.moveTo(-7, y); c.lineTo(7, y); c.stroke(); }
  };
  D.hook = (c) => {
    c.lineCap = 'round'; c.strokeStyle = '#c9ccd2'; c.lineWidth = 3; c.beginPath(); c.moveTo(3, -13); c.lineTo(3, 5); c.arc(-3, 5, 6, 0, Math.PI * 0.95); c.lineTo(-10, 0); c.stroke();
    c.strokeStyle = '#7b8392'; c.lineWidth = 1; c.beginPath(); c.moveTo(4, -13); c.lineTo(4, 5); c.stroke();
    ell(c, 3, -14, 2.4, 2.4, 'rgba(0,0,0,0)');
  };
  D.mask = (c) => {
    c.strokeStyle = '#2b3a55'; c.lineWidth = 3; c.beginPath(); c.moveTo(-13, -3); c.quadraticCurveTo(-15, -12, 0, -12); c.quadraticCurveTo(15, -12, 13, -3); c.stroke();
    rect(c, -12, -8, 24, 15, '#1f2d44', 6);
    rect(c, -9.5, -6, 19, 11, '#8fd8f0', 4);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(-7, -4); c.lineTo(-2, -4); c.lineTo(-6, 2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-3, 7); c.lineTo(0, 11); c.lineTo(3, 7); f(c, '#1f2d44');
  };
  D.fin = (c) => {
    c.beginPath(); c.moveTo(-5, -13); c.quadraticCurveTo(-7, 0, -13, 12); c.quadraticCurveTo(0, 15, 13, 12); c.quadraticCurveTo(7, 0, 5, -13); c.closePath(); f(c, '#f0a030'); o(c);
    c.strokeStyle = 'rgba(120,60,0,.4)'; c.lineWidth = 1; for (const x of [-6, 0, 6]) { c.beginPath(); c.moveTo(x * 0.4, -8); c.lineTo(x * 1.5, 11); c.stroke(); }
    rect(c, -6, -14, 12, 6, '#2b3a4a', 2);
  };
  D.wetsuit = (c) => {
    c.beginPath(); c.moveTo(-6, -13); c.lineTo(-13, -8); c.lineTo(-13, 0); c.lineTo(-9, 0); c.lineTo(-9, 13); c.lineTo(-1, 13); c.lineTo(0, 4); c.lineTo(1, 13); c.lineTo(9, 13); c.lineTo(9, 0); c.lineTo(13, 0); c.lineTo(13, -8); c.lineTo(6, -13); c.quadraticCurveTo(0, -8, -6, -13); c.closePath(); f(c, '#2a3550'); o(c);
    c.strokeStyle = '#38b6ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, -3); c.lineTo(9, -3); c.stroke();
  };
  D.spear = (c) => {
    c.lineCap = 'round'; c.strokeStyle = '#8c929a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-11, 12); c.lineTo(9, -8); c.stroke();
    c.strokeStyle = '#d9dde3'; c.lineWidth = 1; c.beginPath(); c.moveTo(-10, 11); c.lineTo(8, -7); c.stroke();
    c.beginPath(); c.moveTo(9, -8); c.lineTo(12, -14); c.lineTo(14, -9); c.closePath(); f(c, '#e8ecf0'); o(c);
    c.beginPath(); c.moveTo(9, -8); c.lineTo(14, -9); c.lineTo(15, -4); c.closePath(); f(c, '#c4cad2'); o(c);
    rect(c, -13, 9, 7, 5, '#e0582a', 2);
  };
  D.board = (c) => {
    c.save(); c.rotate(-0.5);
    c.beginPath(); c.moveTo(0, -15); c.quadraticCurveTo(8, -6, 7, 8); c.quadraticCurveTo(5, 14, 0, 14); c.quadraticCurveTo(-5, 14, -7, 8); c.quadraticCurveTo(-8, -6, 0, -15); f(c, '#f4f1e6'); o(c);
    c.strokeStyle = '#2bb5c9'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -11); c.lineTo(0, 11); c.stroke();
    c.restore();
    c.strokeStyle = '#6b4a2b'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(9, -12); c.lineTo(13, 11); c.stroke();
    c.beginPath(); c.ellipse(13, 12, 3, 4.5, 0.2, 0, 6.3); f(c, '#e0582a');
  };
  D.shirt = (c) => {
    c.beginPath(); c.moveTo(-5, -12); c.lineTo(-14, -6); c.lineTo(-10, 0); c.lineTo(-7, -2); c.lineTo(-7, 12); c.lineTo(7, 12); c.lineTo(7, -2); c.lineTo(10, 0); c.lineTo(14, -6); c.lineTo(5, -12); c.quadraticCurveTo(0, -7, -5, -12); c.closePath(); f(c, '#2f9fd8'); o(c);
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-7, 2); c.lineTo(7, 2); c.moveTo(-7, 7); c.lineTo(7, 7); c.stroke();
  };
  D.pants = (c) => {
    c.beginPath(); c.moveTo(-9, -13); c.lineTo(9, -13); c.lineTo(11, 13); c.lineTo(2, 13); c.lineTo(0, -2); c.lineTo(-2, 13); c.lineTo(-11, 13); c.closePath(); f(c, '#3a5c9e'); o(c);
    c.fillStyle = '#e0a63a'; c.fillRect(-9, -13, 18, 3); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, -2); c.lineTo(-8, 12); c.moveTo(6, -2); c.lineTo(8, 12); c.stroke();
  };
  D.shoe = (c) => {
    c.beginPath(); c.moveTo(-13, 3); c.lineTo(-13, -8); c.lineTo(-4, -8); c.quadraticCurveTo(0, 2, 13, 3); c.quadraticCurveTo(15, 10, 8, 10); c.lineTo(-12, 10); c.closePath(); f(c, '#e8503a'); o(c);
    c.fillStyle = '#f4f1e6'; c.fillRect(-13, 7, 26, 4); c.strokeStyle = '#fff'; c.lineWidth = 1.4; for (const x of [-7, -4, -1]) { c.beginPath(); c.moveTo(x, -5 + (x + 7) * 0.5); c.lineTo(x + 3, -3 + (x + 7) * 0.5); c.stroke(); }
  };
  D.cap = (c) => {
    c.beginPath(); c.moveTo(-12, 5); c.quadraticCurveTo(-12, -11, 2, -11); c.quadraticCurveTo(12, -10, 12, 5); c.closePath(); f(c, '#e8503a'); o(c);
    c.beginPath(); c.moveTo(0, 5); c.quadraticCurveTo(14, 3, 17, 9); c.quadraticCurveTo(8, 11, 0, 8); c.closePath(); f(c, '#b53a28'); o(c);
    ell(c, 0, -11, 2, 2, '#f4f1e6');
  };
  D.kayak = (c) => {
    c.beginPath(); c.moveTo(-15, 2); c.quadraticCurveTo(0, -10, 15, 2); c.quadraticCurveTo(0, 12, -15, 2); c.closePath(); f(c, '#f0a030'); o(c);
    ell(c, 0, 1, 4, 3, '#2b3a55');
    c.strokeStyle = '#6b4a2b'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, -9); c.lineTo(9, 11); c.stroke();
    ell(c, -9, -9, 3.5, 1.8, '#e0582a', 0.9); ell(c, 9, 11, 3.5, 1.8, '#e0582a', 0.9);
  };
  D.anchor = (c) => {
    c.lineCap = 'round'; c.strokeStyle = '#3a4a5c'; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 11); c.moveTo(-5, -4); c.lineTo(5, -4); c.moveTo(-11, 3); c.quadraticCurveTo(-9, 12, 0, 12); c.quadraticCurveTo(9, 12, 11, 3); c.stroke();
    c.beginPath(); c.arc(0, -11, 2.8, 0, 6.3); c.stroke();
  };
  D.buoy = (c) => {
    c.beginPath(); c.arc(0, 0, 12, 0, 6.3); f(c, '#e8503a'); o(c);
    c.save(); c.beginPath(); c.arc(0, 0, 12, 0, 6.3); c.clip(); c.fillStyle = '#fff'; for (let a = 0; a < 4; a++) { c.save(); c.rotate(a * Math.PI / 2 + 0.4); c.fillRect(-14, -3, 28, 6); c.restore(); } c.restore();
    c.beginPath(); c.arc(0, 0, 12, 0, 6.3); o(c); ell(c, 0, 0, 5, 5, '#cfeaf5');
  };
  D.sonar = (c) => {
    c.beginPath(); c.arc(0, 0, 12, 0, 6.3); f(c, '#0f2a3a'); o(c, '#3a4a5c', 2);
    c.strokeStyle = '#4dd6a0'; c.lineWidth = 1.2; for (const r of [4, 8]) { c.beginPath(); c.arc(0, 0, r, 0, 6.3); c.stroke(); }
    c.beginPath(); c.moveTo(0, 0); c.lineTo(8, -7); c.stroke(); ell(c, 5, 3, 1.8, 1.8, '#ffd23a'); ell(c, -4, -5, 1.4, 1.4, '#ffd23a');
  };
  D.lock = (c) => {
    c.strokeStyle = '#d7dde3'; c.lineWidth = 3.2; c.beginPath(); c.arc(0, -3, 6, Math.PI, 0); c.stroke();
    rect(c, -9, -3, 18, 14, '#ffd23a', 3); ell(c, 0, 4, 2.2, 2.2, '#5a4210'); c.fillStyle = '#5a4210'; c.fillRect(-0.9, 4, 1.8, 5);
  };
  D.penguin = (c) => {
    ell(c, 0, 2, 9, 12, '#1d2733'); ell(c, 0, 4, 5.6, 8.6, '#f4f6f8');
    ell(c, -9, 2, 2.6, 7, '#1d2733', 0.2); ell(c, 9, 2, 2.6, 7, '#1d2733', -0.2);
    ell(c, -2.8, -6, 1.6, 1.6, '#fff'); ell(c, 2.8, -6, 1.6, 1.6, '#fff'); c.fillStyle = '#111'; c.fillRect(-3.3, -6.4, 1, 1); c.fillRect(2.3, -6.4, 1, 1);
    c.beginPath(); c.moveTo(-2.5, -3); c.lineTo(2.5, -3); c.lineTo(0, 0); c.closePath(); f(c, '#f0a030');
    ell(c, -4, 13, 3.6, 1.8, '#f0a030'); ell(c, 4, 13, 3.6, 1.8, '#f0a030');
  };
  D.whale = (c) => {
    c.beginPath(); c.moveTo(-14, 2); c.quadraticCurveTo(-8, -12, 6, -8); c.quadraticCurveTo(14, -5, 14, 3); c.quadraticCurveTo(0, 12, -14, 2); f(c, '#3a7bc0'); o(c);
    c.beginPath(); c.moveTo(-12, 4); c.quadraticCurveTo(0, 10, 12, 4); c.quadraticCurveTo(0, 12, -12, 4); f(c, '#e9f2f8');
    c.beginPath(); c.moveTo(14, -2); c.lineTo(18, -9); c.lineTo(16, 0); c.lineTo(19, 5); c.lineTo(14, 3); f(c, '#3a7bc0'); o(c);
    ell(c, -7, -1, 1.2, 1.2, '#102030');
    c.strokeStyle = '#9fd8f0'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-3, -9); c.lineTo(-3, -13); c.moveTo(-3, -13); c.lineTo(-6, -15); c.moveTo(-3, -13); c.lineTo(0, -15); c.stroke();
  };
  D.shell = (c) => {
    c.beginPath(); c.moveTo(0, 11); c.quadraticCurveTo(-16, 4, -12, -6); c.quadraticCurveTo(0, -14, 12, -6); c.quadraticCurveTo(16, 4, 0, 11); f(c, '#f2c2a4'); o(c);
    c.strokeStyle = 'rgba(160,80,50,.6)'; c.lineWidth = 1.2; for (const a of [-0.6, -0.3, 0, 0.3, 0.6]) { c.beginPath(); c.moveTo(0, 10); c.lineTo(a * 22, -9); c.stroke(); }
  };
  D.lotion = (c) => {
    rect(c, -6, -6, 12, 18, '#f2b632', 3); rect(c, -4, -11, 8, 6, '#e8503a', 1.5); ell(c, 0, 3, 3.6, 3.6, '#fff');
    c.strokeStyle = '#e8503a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-2, 3); c.lineTo(2, 3); c.moveTo(0, 1); c.lineTo(0, 5); c.stroke();
  };
  D.wave = (c) => {
    c.strokeStyle = '#2bb5c9'; c.lineWidth = 3; c.lineCap = 'round';
    for (const y of [-6, 1, 8]) { c.beginPath(); c.moveTo(-13, y); c.quadraticCurveTo(-8, y - 6, -3, y); c.quadraticCurveTo(2, y + 6, 7, y); c.quadraticCurveTo(10, y - 3, 13, y); c.stroke(); }
  };
  D.trident = (c) => {
    c.strokeStyle = '#d4a52a'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 13); c.lineTo(0, -8); c.moveTo(-7, -11); c.lineTo(-7, -4); c.quadraticCurveTo(-7, 0, 0, 0); c.quadraticCurveTo(7, 0, 7, -4); c.lineTo(7, -11); c.stroke();
    for (const x of [-7, 0, 7]) { c.beginPath(); c.moveTo(x - 2, -9); c.lineTo(x, -14); c.lineTo(x + 2, -9); c.closePath(); f(c, '#f0cf5a'); }
  };
  D.mug = (c) => {
    rect(c, -8, -6, 16, 16, '#f4f1e6', 3); c.strokeStyle = '#8a8478'; c.lineWidth = 2; c.beginPath(); c.arc(9, 2, 4, -1.2, 1.2); c.stroke();
    c.fillStyle = '#e6a52a'; c.fillRect(-6.5, -4, 13, 11); c.fillStyle = '#fff'; c.fillRect(-6.5, -6, 13, 3);
  };

  function draw(c, name, x, y, size, a) {
    const fn = D[name]; if (!fn) return;
    c.save(); c.translate(x, y); const s = (size || 28) / 30; c.scale(s, s);
    if (a != null) c.globalAlpha = a;
    // sombra suave
    fn(c); c.restore();
  }
  const cache = {};
  function url(name, px) {
    const key = name + '@' + (px || 40);
    if (cache[key]) return cache[key];
    const cv = document.createElement('canvas'), dpr = 2, s = px || 40;
    cv.width = cv.height = s * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    draw(c, name, s / 2, s / 2, s * 0.92);
    return (cache[key] = cv.toDataURL());
  }
  const html = (name, px) => `<img src="${url(name, px || 40)}" width="${px || 40}" height="${px || 40}" alt="" style="display:block;flex:none">`;
  return { draw, url, html, has: (n) => !!D[n] };
})();
