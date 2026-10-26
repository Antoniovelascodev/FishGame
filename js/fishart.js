/* Dibujo procedural de peces: versión sombra (bajo el agua) y versión a color (tarjetas, álbum) */
window.G = window.G || {};

G.FishArt = (function () {
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }

  /* Dibuja el pez de longitud `len` (px) centrado en (x,y), mirando a +x girado `ang`.
     opts: shadow (bool), ph (fase de nado), alpha */
  function draw(ctx, sp, x, y, len, ang, opts) {
    opts = opts || {};
    const shadow = !!opts.shadow, ph = opts.ph || 0;
    const c = sp.color, shape = sp.shape;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang); ctx.scale(len, len);
    if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
    const lw = 1 / len;
    const fill = (col) => { ctx.fillStyle = shadow ? 'rgba(2,14,32,0.62)' : col; };
    const tail = Math.sin(ph) * 0.07;

    const fusiform = (h, tailLen, dorsal) => {
      // cuerpo
      fill(c);
      ctx.beginPath();
      ctx.moveTo(0.5, 0);
      ctx.bezierCurveTo(0.3, -h * 1.2, -0.15, -h * 1.1, -0.34, -h * 0.25 + tail * 0.3);
      ctx.lineTo(-0.34, h * 0.25 + tail * 0.3);
      ctx.bezierCurveTo(-0.15, h * 1.1, 0.3, h * 1.2, 0.5, 0);
      ctx.fill();
      // cola
      ctx.beginPath();
      ctx.moveTo(-0.32, tail * 0.3);
      ctx.lineTo(-0.5, -tailLen + tail); ctx.lineTo(-0.44, tail * 1.4); ctx.lineTo(-0.5, tailLen + tail); ctx.closePath();
      ctx.fill();
      if (shadow) { ctx.beginPath(); ctx.moveTo(0.05, -h); ctx.lineTo(-0.1, -h - dorsal); ctx.lineTo(-0.2, -h * 0.9); ctx.fill(); return; }
      // vientre claro
      ctx.fillStyle = shade(c, 0.55);
      ctx.beginPath(); ctx.moveTo(0.47, 0.01); ctx.bezierCurveTo(0.3, h * 1.1, -0.15, h * 1.0, -0.33, h * 0.2); ctx.lineTo(-0.33, 0.01 + tail * 0.2); ctx.closePath(); ctx.fill();
      // lomo oscuro
      ctx.fillStyle = shade(c, -0.35);
      ctx.beginPath(); ctx.moveTo(0.4, -h * 0.5); ctx.bezierCurveTo(0.2, -h * 1.15, -0.15, -h * 1.05, -0.33, -h * 0.25); ctx.lineTo(-0.33, -h * 0.05); ctx.bezierCurveTo(-0.1, -h * 0.3, 0.2, -h * 0.35, 0.4, -h * 0.5); ctx.fill();
      // aleta dorsal
      ctx.fillStyle = shade(c, -0.25);
      ctx.beginPath(); ctx.moveTo(0.12, -h * 1.05); ctx.lineTo(-0.06, -h - dorsal); ctx.lineTo(-0.22, -h * 0.85); ctx.closePath(); ctx.fill();
      // ojo
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.36, -h * 0.25, h * 0.2, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.365, -h * 0.25, h * 0.11, 0, 6.3); ctx.fill();
      // branquia
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(0.27, 0, h * 0.7, 1.9, 4.3); ctx.stroke();
    };

    // dibujos de piel (rayas, manchas...) según sp.pat
    const pattern = (h) => {
      if (shadow || !sp.pat) return;
      ctx.save(); ctx.lineCap = 'round';
      if (sp.pat === 'stripes') {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.032;
        for (let i = 0; i < 5; i++) { const x = 0.24 - i * 0.12; ctx.beginPath(); ctx.moveTo(x, -h * 0.95); ctx.lineTo(x - 0.03, h * 0.85); ctx.stroke(); }
      } else if (sp.pat === 'hlines') {
        ctx.strokeStyle = 'rgba(0,0,0,0.26)'; ctx.lineWidth = 0.016;
        for (let j = -1; j <= 2; j++) { const y = j * h * 0.32; ctx.beginPath(); ctx.moveTo(0.36, y * 0.9); ctx.lineTo(-0.3, y * 0.8); ctx.stroke(); }
      } else if (sp.pat === 'spots') {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for (let i = 0; i < 11; i++) { ctx.beginPath(); ctx.arc(0.3 - (i % 6) * 0.1 + ((i * 7) % 3) * 0.015, -h * 0.5 + Math.floor(i / 6) * h * 0.55 + ((i * 5) % 3) * 0.01, 0.017 + (i % 3) * 0.006, 0, 6.3); ctx.fill(); }
      } else if (sp.pat === 'spot') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(0.2, -h * 0.15, 0.036, 0, 6.3); ctx.fill();
      } else if (sp.pat === 'band') {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.arc(-0.29, 0, 0.05, 0, 6.3); ctx.fill();
      }
      ctx.restore();
    };

    switch (shape) {
      case 'ray': {
        const wob = Math.sin(ph) * 0.05;
        fill(c);
        ctx.beginPath(); ctx.moveTo(0.42, 0);
        ctx.bezierCurveTo(0.2, -0.2, 0.0, -0.46 - wob, -0.2, -0.3 - wob);
        ctx.quadraticCurveTo(-0.14, -0.1, -0.2, 0);
        ctx.quadraticCurveTo(-0.14, 0.1, -0.2, 0.3 + wob);
        ctx.bezierCurveTo(0.0, 0.46 + wob, 0.2, 0.2, 0.42, 0); ctx.fill();
        ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : shade(c, -0.2); ctx.lineWidth = 0.028; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-0.2, 0); ctx.quadraticCurveTo(-0.4, tail * 2, -0.62, tail * 4); ctx.stroke();
        if (!shadow) {
          ctx.fillStyle = shade(c, 0.25); ctx.beginPath(); ctx.ellipse(0.02, 0, 0.18, 0.12, 0, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.3, -0.06, 0.016, 0, 6.3); ctx.arc(0.3, 0.06, 0.016, 0, 6.3); ctx.fill();
          pattern(0.2);
        }
        break;
      }
      case 'tuna': fusiform(0.12, 0.13, 0.06); pattern(0.12); break;
      case 'shark': fusiform(0.1, 0.16, 0.12); pattern(0.1); break;
      case 'sword': {
        fusiform(0.1, 0.14, 0.1);
        fill('#3a526b'); ctx.beginPath(); ctx.moveTo(0.5, -0.012); ctx.lineTo(0.78, 0); ctx.lineTo(0.5, 0.012); ctx.fill();
        break;
      }
      case 'long': {
        const segs = 18;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : c;
        ctx.lineWidth = 0.1;
        ctx.beginPath();
        for (let i = 0; i <= segs; i++) {
          const u = i / segs, px = 0.5 - u, py = Math.sin(u * 7 - ph) * 0.07 * (0.3 + u);
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
        if (!shadow) {
          ctx.strokeStyle = shade(c, 0.4); ctx.lineWidth = 0.035;
          ctx.beginPath();
          for (let i = 0; i <= segs; i++) { const u = i / segs, px = 0.5 - u, py = Math.sin(u * 7 - ph) * 0.07 * (0.3 + u) + 0.02; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.46, -0.02, 0.014, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.463, -0.02, 0.008, 0, 6.3); ctx.fill();
        }
        break;
      }
      case 'flat': {
        fill(c);
        ctx.beginPath();
        ctx.moveTo(0.46, 0);
        ctx.bezierCurveTo(0.3, -0.28, -0.1, -0.3, -0.3, -0.05);
        ctx.lineTo(-0.5 + tail, 0.0 + tail);
        ctx.lineTo(-0.3, 0.05);
        ctx.bezierCurveTo(-0.1, 0.3, 0.3, 0.28, 0.46, 0);
        ctx.fill();
        if (!shadow) {
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(-0.2 + (i % 5) * 0.12, -0.08 + Math.floor(i / 5) * 0.14, 0.018, 0, 6.3); ctx.fill(); }
          ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.34, -0.06, 0.018, 0, 6.3); ctx.arc(0.34, 0.06, 0.018, 0, 6.3); ctx.fill();
        }
        break;
      }
      case 'round': {
        fill(c);
        ctx.beginPath(); ctx.ellipse(0, 0, 0.4, 0.36, 0, 0, 6.3); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-0.3, -0.2); ctx.lineTo(-0.5, tail * 3); ctx.lineTo(-0.3, 0.2); ctx.fill();
        if (!shadow) {
          ctx.fillStyle = shade(c, 0.4); ctx.beginPath(); ctx.ellipse(0.05, 0.1, 0.3, 0.2, 0, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.27, -0.1, 0.05, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.285, -0.1, 0.027, 0, 6.3); ctx.fill();
        }
        break;
      }
      case 'octo': {
        ctx.lineCap = 'round';
        ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : shade(c, -0.1);
        ctx.lineWidth = 0.055;
        for (let i = 0; i < 8; i++) {
          const o = (i - 3.5) * 0.07;
          ctx.beginPath(); ctx.moveTo(0.05, o);
          ctx.bezierCurveTo(0.25, o * 2 + Math.sin(ph + i) * 0.08, 0.35, o * 3 - Math.sin(ph * 1.3 + i) * 0.1, 0.5, o * 3.4 + Math.sin(ph + i * 2) * 0.1);
          ctx.stroke();
        }
        fill(c);
        ctx.beginPath(); ctx.ellipse(-0.12, 0, 0.3, 0.2, 0, 0, 6.3); ctx.fill();
        if (!shadow) {
          ctx.fillStyle = shade(c, -0.3);
          for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-0.2 + (i % 3) * 0.1, -0.08 + Math.floor(i / 3) * 0.08, 0.018, 0, 6.3); ctx.fill(); }
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0.1, -0.1, 0.045, 0, 6.3); ctx.arc(0.1, 0.1, 0.045, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.112, -0.1, 0.025, 0, 6.3); ctx.arc(0.112, 0.1, 0.025, 0, 6.3); ctx.fill();
        }
        break;
      }
      case 'crab': {
        ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : shade(c, -0.2); ctx.lineWidth = 0.035; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
          const w = Math.sin(ph * 2 + i) * 0.03;
          ctx.beginPath(); ctx.moveTo(-0.08 + i * 0.1, s * 0.12); ctx.lineTo(-0.12 + i * 0.1 + w, s * 0.3); ctx.lineTo(-0.2 + i * 0.1, s * 0.44); ctx.stroke();
        }
        fill(c); ctx.beginPath(); ctx.ellipse(0, 0, 0.26, 0.2, 0, 0, 6.3); ctx.fill();
        for (const s of [-1, 1]) {
          ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : shade(c, -0.1); ctx.lineWidth = 0.05;
          ctx.beginPath(); ctx.moveTo(0.2, s * 0.12); ctx.lineTo(0.38, s * 0.2); ctx.stroke();
          fill(shade(c, -0.1)); ctx.beginPath(); ctx.ellipse(0.43, s * 0.2, 0.09, 0.06, 0, 0, 6.3); ctx.fill();
        }
        if (!shadow) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.2, -0.06, 0.02, 0, 6.3); ctx.arc(0.2, 0.06, 0.02, 0, 6.3); ctx.fill(); }
        break;
      }
      case 'shrimp': {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : c; ctx.lineWidth = 0.12;
        ctx.beginPath();
        for (let i = 0; i <= 12; i++) { const u = i / 12, px = 0.35 - u * 0.7, py = -Math.sin(u * 3.1) * 0.16 + Math.sin(ph) * 0.02 * u; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
        ctx.lineWidth = 0.025; ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : shade(c, 0.3);
        ctx.beginPath(); ctx.moveTo(0.38, -0.05); ctx.quadraticCurveTo(0.6, -0.25, 0.75, -0.15); ctx.moveTo(0.38, -0.03); ctx.quadraticCurveTo(0.6, 0.05, 0.75, 0.0); ctx.stroke();
        if (!shadow) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.36, -0.07, 0.018, 0, 6.3); ctx.fill(); }
        break;
      }
      case 'lobster': {
        ctx.lineCap = 'round';
        ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : shade(c, -0.15); ctx.lineWidth = 0.025;
        for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0.1 - i * 0.07, s * 0.06); ctx.lineTo(0.1 - i * 0.07 + Math.sin(ph + i) * 0.03, s * 0.2); ctx.stroke(); }
        fill(c);
        ctx.beginPath(); ctx.ellipse(0.1, 0, 0.17, 0.09, 0, 0, 6.3); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -0.07); ctx.lineTo(-0.38, -0.05 + tail); ctx.lineTo(-0.38, 0.05 + tail); ctx.lineTo(0, 0.07); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-0.38, tail); ctx.lineTo(-0.5, -0.09 + tail); ctx.lineTo(-0.5, 0.09 + tail); ctx.fill();
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(0.38, s * 0.12, 0.09, 0.05, s * 0.4, 0, 6.3); ctx.fill(); }
        if (!shadow) {
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = lw;
          for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-0.05 - i * 0.07, -0.06); ctx.lineTo(-0.05 - i * 0.07, 0.06); ctx.stroke(); }
          ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0.25, -0.04, 0.012, 0, 6.3); ctx.arc(0.25, 0.04, 0.012, 0, 6.3); ctx.fill();
        }
        break;
      }
      case 'urchin': {
        ctx.strokeStyle = shadow ? 'rgba(2,14,32,0.62)' : shade(c, -0.2); ctx.lineWidth = 0.025; ctx.lineCap = 'round';
        for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.15, Math.sin(a) * 0.15); ctx.lineTo(Math.cos(a) * 0.42, Math.sin(a) * 0.42); ctx.stroke(); }
        fill(c); ctx.beginPath(); ctx.arc(0, 0, 0.2, 0, 6.3); ctx.fill();
        break;
      }
      default: { // 'fish'
        fusiform(0.16, 0.16, 0.1); pattern(0.16);
        if (!shadow && /dorada|sargo|mojarra|pagel|pargo/.test(sp.id)) {
          ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 0.018;
          for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0.12 - i * 0.1, -0.12); ctx.lineTo(0.12 - i * 0.1, 0.1); ctx.stroke(); }
        }
        if (!shadow && sp.id === 'dorada') { ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.ellipse(0.33, -0.12, 0.05, 0.02, 0.5, 0, 6.3); ctx.fill(); }
      }
    }
    ctx.restore();
  }

  /* Icono del pez en un canvas pequeño (para listas y álbum) */
  const cache = {};
  function icon(sp, size, silhouette) {
    const key = sp.id + '|' + size + '|' + (silhouette ? 1 : 0);
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr; c.height = size * 0.66 * dpr;
    c.style.width = size + 'px'; c.style.height = size * 0.66 + 'px';
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    const k = sp.shape === 'sword' ? 0.62 : sp.shape === 'ray' ? 0.8 : sp.shape === 'shrimp' || sp.shape === 'lobster' ? 0.76 : 0.84;
    draw(x, sp, size / 2, size * 0.33, size * k, 0, { shadow: false, ph: 0.6 });
    if (silhouette) { x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(20,40,60,0.9)'; x.fillRect(0, 0, size, size); }
    cache[key] = c;
    return c;
  }
  /* Dibujo de basura (lata, botella, vaper, bolsa) en un canvas */
  function trash(id, size) {
    const c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr; c.height = size * 0.66 * dpr; c.style.width = size + 'px'; c.style.height = size * 0.66 + 'px';
    const x = c.getContext('2d'); x.scale(dpr, dpr); x.translate(size / 2, size * 0.33); const s = size / 100;
    x.scale(s, s); x.lineJoin = 'round'; x.lineCap = 'round';
    if (id === 'lata') {
      x.rotate(-0.5);
      x.fillStyle = '#c9ced2'; x.beginPath(); x.rect(-26, -14, 52, 28); x.fill();
      x.fillStyle = '#d6372d'; x.fillRect(-18, -14, 36, 28);
      x.fillStyle = '#fff'; x.fillRect(-18, -3, 36, 5);
      x.fillStyle = '#b4b9bd'; x.beginPath(); x.ellipse(26, 0, 4, 14, 0, 0, 6.3); x.fill();
      x.fillStyle = '#e8ebee'; x.beginPath(); x.ellipse(-26, 0, 4, 14, 0, 0, 6.3); x.fill();
      x.fillStyle = 'rgba(60,40,20,0.35)'; x.beginPath(); x.ellipse(0, 6, 22, 5, 0, 0, 6.3); x.fill();
    } else if (id === 'botella') {
      x.rotate(0.35);
      x.fillStyle = 'rgba(150,215,235,0.8)'; x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(-34, -11); x.lineTo(14, -11); x.quadraticCurveTo(26, -11, 30, -4); x.lineTo(34, -3); x.lineTo(34, 3); x.lineTo(30, 4); x.quadraticCurveTo(26, 11, 14, 11); x.lineTo(-34, 11); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#2a6fc0'; x.fillRect(34, -4, 7, 8);
      x.fillStyle = '#3aa86a'; x.fillRect(-20, -11, 22, 22);
      x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(-18, -9, 18, 3);
      x.fillStyle = 'rgba(90,60,30,0.35)'; x.fillRect(-34, 6, 14, 4);
    } else if (id === 'vaper') {
      x.rotate(-0.3);
      x.fillStyle = '#2b2e44'; x.beginPath(); x.rect(-24, -12, 48, 24); x.fill();
      x.fillStyle = '#d63fa3'; x.fillRect(-24, -12, 14, 24);
      x.fillStyle = '#3c3f58'; x.fillRect(24, -6, 12, 12);
      x.fillStyle = '#8fe6ff'; x.fillRect(-4, -4, 18, 8);
      x.fillStyle = '#ff5a50'; x.beginPath(); x.arc(18, -7, 2.4, 0, 6.3); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(-22, -10, 44, 4);
    } else { // bolsa
      x.fillStyle = 'rgba(240,244,248,0.92)'; x.strokeStyle = 'rgba(180,190,200,0.9)'; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(-18, -22); x.quadraticCurveTo(-34, -4, -26, 16); x.quadraticCurveTo(-8, 24, 8, 18); x.quadraticCurveTo(30, 12, 28, -6); x.quadraticCurveTo(24, -22, 14, -20); x.quadraticCurveTo(10, -10, 4, -10); x.quadraticCurveTo(-4, -10, -6, -22); x.closePath(); x.fill(); x.stroke();
      x.strokeStyle = 'rgba(200,210,220,0.9)'; x.beginPath(); x.moveTo(-12, -2); x.quadraticCurveTo(0, 4, 14, 0); x.moveTo(-14, 8); x.quadraticCurveTo(0, 14, 16, 10); x.stroke();
      x.fillStyle = 'rgba(0,0,0,0.12)'; x.beginPath(); x.ellipse(-4, 8, 14, 6, 0, 0, 6.3); x.fill();
    }
    return c;
  }
  function iconURL(sp, size, silhouette) { const c = icon(sp, size, silhouette); return c.toDataURL(); }

  return { draw, icon, iconURL, trash };
})();
