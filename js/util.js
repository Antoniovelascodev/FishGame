/* Utilidades */
window.G = window.G || {};
G.U = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  rand: (a, b) => a + Math.random() * (b - a),
  randi: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  dist: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by),
  smooth: (t) => t * t * (3 - 2 * t),
  chance: (p) => Math.random() < p,
  // RNG con semilla para el mapa
  rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  money(v) {
    if (v >= 1000) return (Math.round(v)).toLocaleString('es-ES') + ' €';
    return (Math.round(v * 10) / 10).toFixed(v % 1 === 0 || v >= 100 ? 0 : 1).replace('.', ',') + ' €';
  },
  kg(v) { return v < 1 ? Math.round(v * 1000) + ' g' : (Math.round(v * 10) / 10).toString().replace('.', ',') + ' kg'; },
  clock(h) {
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  },
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  weighted(items, weightOf) {
    let total = 0;
    for (const it of items) total += weightOf(it);
    if (total <= 0) return null;
    let r = Math.random() * total;
    for (const it of items) { r -= weightOf(it); if (r <= 0) return it; }
    return items[items.length - 1];
  },
};
