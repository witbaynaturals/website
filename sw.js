const CACHE_NAME = 'witbaynaturals-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/privacy-policy.html',
  '/terms-of-service.html',
  '/disclaimer.html'
];

const CACHE_STRATEGY = {
  images: [
    '/images/about.jpg',
    '/images/video-thumb.jpg',
    '/images/before-kitchen.jpg',
    '/images/after-kitchen.jpg',
    '/images/before-sticky.jpg',
    '/images/after-clean.jpg',
    '/images/map-demo.jpg'
  ]
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.origin === location.origin && CACHE_STRATEGY.images.some(img => url.pathname.endsWith(img))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const fetched = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  if (url.origin === location.origin && url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const fetched = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => cached || fetch(request).then(response => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).catch(() => caches.match('/index.html')))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});
