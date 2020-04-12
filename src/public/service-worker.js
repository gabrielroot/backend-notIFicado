importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');


const cacheName = 'cache-v1';
const precacheResources = [
  '/',
  '/sobre',
  '/offline',
  '/js/banner.js',
  '/js/scripts.js',
  '/css/index.css',
  '/css/sobre.css',
  '/images/no-image.jpg',
  '/images/logo.png',
]; 

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
  if(!fetch('/subscribe'))
    event.respondWith(caches.match(event.request)
      .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request);
        })
    )
  else
    return fetch(event.request);
});



self.addEventListener('push', function(event) {
  var promise = self.registration.showNotification('Push notification!');

  event.waitUntil(promise);
});