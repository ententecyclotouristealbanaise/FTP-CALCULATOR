// Service worker : met l'app en cache pour qu'elle fonctionne hors-ligne (en déplacement, sans réseau)
// ⚠️ IMPORTANT : change ce numéro de version à CHAQUE déploiement (v3, v4, v5...)
// Sinon le navigateur pense que rien n'a changé et continue de servir l'ancien cache.
const CACHE_NAME = 'ftp-calc-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon-180.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie "réseau d'abord, cache en secours" :
// - si le réseau répond, on affiche TOUJOURS la version la plus récente
// - si pas de réseau (hors-ligne), on retombe sur le cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
