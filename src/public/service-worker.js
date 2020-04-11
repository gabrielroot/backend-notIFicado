const cacheName = 'cache-v1';
const precacheResources = [
  '/',
  '/sobre',
  '/offline',
  '/js/status.js',
  '/css/index.css',
  '/css/sobre.css',
  '/images/no-image.jpg',
  '/images/logo.png',
];

self.addEventListener('push', e=>{
  const data = e.data.json()
  self.registration.showNotification(data.title,{
    body: 'corpo do push',
    icon: '/images/logo.png',
  })
})

self.addEventListener('install', event => {
  console.log('Service worker install event!');
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(precacheResources);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service worker activate event!');
});

self.addEventListener('fetch', event => {
  console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
    );
});