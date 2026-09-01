// Service Worker para Flyvest - Centro de Comando
const CACHE_NAME = 'flyvest-cache-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './flyvest_centro_comando.html',
  './manifest.json',
  './favicon.svg',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/apple-touch-icon.png'
];

// Instalar Service Worker y almacenar recursos básicos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-almacenando en caché los recursos estáticos');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Error parcial al pre-cachear:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché obsoleta:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch: Stale-While-Revalidate con fallback offline
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Ignorar peticiones no HTTP/HTTPS (como chrome-extension://)
  if (!request.url.startsWith('http')) return;

  // Para peticiones de navegación (HTML): Network-First con Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('./index.html') || caches.match('./flyvest_centro_comando.html');
          });
        })
    );
    return;
  }

  // Para el resto de recursos: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red, el cachedResponse resolverá la petición
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Comunicación con la aplicación
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
