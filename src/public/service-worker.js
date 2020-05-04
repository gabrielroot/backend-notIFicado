const SERVER_URL = 'https://notificado.herokuapp.com'   //PRODUÇÃO
// const SERVER_URL = 'http://localhost:3000'                //DEV
var CACHE_NAME = 'v0.1::';
const toCache = [
  '/',
  '/sobre',
  '/ajuda',
  '/js/index.js',
  '/js/main.js',
  '/js/_layout.js',
  '/css/_layout.css',
  '/css/index.css',
  '/css/sobre.css',
  '/css/ajuda.css',
  '/images/no-image.jpg',
  '/images/logo.png',
  '/images/sos.png',
]; 

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(toCache)
      })
      .then(self.skipWaiting())
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.match(event.request)
          })
      })
  )
})

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key)
            return caches.delete(key)
          }
        }))
      })
      .then(() => self.clients.claim())
  )
})

//notification url  redirect event click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
      clients.matchAll({
          type: "window"
      })
      .then(function (clientList) {
          if (clients.openWindow) {
              return clients.openWindow(SERVER_URL);
          }
      })
  );
});
