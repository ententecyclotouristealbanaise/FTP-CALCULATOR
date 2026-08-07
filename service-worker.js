// Service worker — stratégie orientée mise à jour :
//
// - Fichiers "coeur" de l'app (page HTML, manifest) : RÉSEAU D'ABORD.
//   On va toujours chercher la dernière version sur le réseau en premier ;
//   le cache ne sert que si le réseau est indisponible (mode hors-ligne).
// - Fichiers statiques (icônes) : cache d'abord, avec mise à jour silencieuse
//   en arrière-plan (ils changent rarement, pas besoin d'attendre le réseau).
//
// IMPORTANT : à chaque déploiement d'une nouvelle version de index.html,
// incrémente CACHE_NAME ci-dessous (v4 -> v5 -> ...). C'est ce qui force
// le navigateur à considérer qu'il y a une mise à jour du service worker.
const CACHE_NAME = 'ftp-calc-v5';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

const STATIC_ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon-180.png',
  './icons/favicon-32.png'
];

const ALL_ASSETS = CORE_ASSETS.concat(STATIC_ASSETS);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ALL_ASSETS))
  );
  // Active la nouvelle version tout de suite, sans attendre la fermeture
  // des anciens onglets ouverts.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  // Prend le contrôle des pages déjà ouvertes immédiatement (au lieu
  // d'attendre un rechargement manuel).
  self.clients.claim();
});

function isCoreRequest(request, url) {
  if (request.mode === 'navigate') return true;
  return CORE_ASSETS.some((asset) => url.pathname.endsWith(asset.replace('./', '')));
}

// Réseau d'abord : on tente le réseau, on met à jour le cache au passage,
// et on ne retombe sur le cache qu'en cas d'échec réseau (hors-ligne).
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      return response;
    })
    .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')));
}

// Cache d'abord : réponse rapide, avec revalidation silencieuse en tâche de fond.
function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // laisse passer les polices externes, etc.

  if (isCoreRequest(event.request, url)) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});
