/* This worker lives at the site root, including /remont-3d/ on Pages. */
const CACHE = 'remont-pokupki:v1:e55f7411fc1a69388d5e2f412f68d9ac01c94d915f0f259e79dbbea42151fb1d';
const PAGES = ['pokupki/', 'plan/', 'elektrika/', 'materialy/', 'materialy/материалы-по-комнатам.xlsx'].map(path => new URL(path, self.location.href).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PAGES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('message', event => {
  if (event.data === 'CACHE_STATUS') {
    event.waitUntil(caches.open(CACHE).then(cache => Promise.all(PAGES.map(page => cache.match(page)))).then(responses => {
      event.ports[0].postMessage({ready: responses.every(Boolean), revision: 'e55f7411fc1a69388d5e2f412f68d9ac01c94d915f0f259e79dbbea42151fb1d'});
    }));
  }
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const page = PAGES.map(path => new URL(path)).find(page => url.origin === page.origin &&
    (url.pathname === page.pathname || url.pathname === page.pathname + 'index.html'));
  if (event.request.method === 'GET' && page) {
    event.respondWith(fetch(event.request).catch(async () => {
      const cached = await (await caches.open(CACHE)).match(page.href);
      return cached || Response.error();
    }));
  }
});
