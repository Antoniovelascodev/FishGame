/* Entrada: joystick flotante táctil + teclado */
window.G = window.G || {};

G.Input = (function () {
  const I = { x: 0, y: 0, mag: 0, castHeld: false, castPressed: false, castReleased: false, keys: {} };
  const zone = document.getElementById('joyzone');
  const base = document.getElementById('joy');
  const knob = document.getElementById('joyknob');
  const R = 56;
  let pid = null, ox = 0, oy = 0;

  function setStick(dx, dy) {
    const m = Math.hypot(dx, dy), k = m > R ? R / m : 1;
    const sx = dx * k, sy = dy * k;
    knob.style.transform = `translate(${sx}px,${sy}px)`;
    const mag = Math.min(1, m / R);
    I.mag = mag < 0.12 ? 0 : mag;
    I.x = mag < 0.12 ? 0 : dx / (m || 1);
    I.y = mag < 0.12 ? 0 : dy / (m || 1);
  }
  zone.addEventListener('pointerdown', (e) => {
    if (pid !== null) return;
    pid = e.pointerId; zone.setPointerCapture(pid);
    ox = e.clientX; oy = e.clientY;
    base.style.left = ox + 'px'; base.style.top = oy + 'px';
    base.classList.add('on'); setStick(0, 0);
    e.preventDefault();
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid) return;
    setStick(e.clientX - ox, e.clientY - oy);
  });
  const end = (e) => {
    if (e.pointerId !== pid) return;
    pid = null; base.classList.remove('on'); I.x = I.y = I.mag = 0; knob.style.transform = '';
  };
  zone.addEventListener('pointerup', end);
  zone.addEventListener('pointercancel', end);

  // Teclado (para probar en PC)
  const keyMap = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' };
  window.addEventListener('keydown', (e) => {
    const k = keyMap[e.key];
    if (k) { I.keys[k] = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => { const k = keyMap[e.key]; if (k) I.keys[k] = false; });

  I.update = function () {
    if (pid === null) {
      const kx = (I.keys.r ? 1 : 0) - (I.keys.l ? 1 : 0), ky = (I.keys.d ? 1 : 0) - (I.keys.u ? 1 : 0);
      const m = Math.hypot(kx, ky);
      if (m > 0) { I.x = kx / m; I.y = ky / m; I.mag = 1; } else { I.x = I.y = I.mag = 0; }
    }
  };
  return I;
})();
