// Service worker: cache หน้าเว็บและไลบรารีไว้ใช้แบบออฟไลน์ (แผนที่ยังต้องใช้เน็ต)
const CACHE = 'flightplanner-v1';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // ไม่ cache การค้นหาและ tile แผนที่
  if (url.includes('nominatim') || url.includes('photon') || url.includes('longdo') ||
      url.includes('locationiq') || url.includes('places.googleapis') || url.includes('/tile/') ||
      url.includes('tile.openstreetmap')) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
