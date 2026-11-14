const CACHE = 'govdick-v2';
const PHOTOS = 'govdick-photos';
const FILES = ['./', './index.html', './manifest.json', './icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== PHOTOS).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // Mountain Project photos: saved copy first, else network (and keep a copy on this device)
  if (/(^|\.)mountainproject\.com$/.test(u.hostname) && u.pathname.startsWith('/assets/photos/')) {
    e.respondWith(caches.open(PHOTOS).then(c => c.match(e.request, {ignoreVary:true}).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => Response.error()))));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request, {ignoreSearch:true}).then(r => r || caches.match('./index.html'))));
});
