/* Service worker: juego jugable sin conexión una vez cargado */
const CACHE = 'pescaitogame-v36';
const FILES = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
  'js/data.js', 'js/species2.js', 'js/util.js', 'js/state.js', 'js/tex.js', 'js/fishart.js', 'js/player.js', 'js/world.js', 'js/audio.js', 'js/input.js', 'js/fishing.js', 'js/ui.js', 'js/meta.js', 'js/shops.js', 'js/stall.js', 'js/interior.js', 'js/icons.js', 'js/social.js', 'js/dive.js', 'js/main.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
