const SERVER_URL = 'https://notificado.herokuapp.com'   //PRODUÇÃO
// const SERVER_URL = 'http://localhost:3000'                //DEV
var version = 'v0.0::';
const precacheResources = [
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

self.addEventListener("install", function(event) {
  console.log('WORKER: install event in progress.');
  event.waitUntil(
    caches
      .open(version + 'fundamentals')
      .then(function(cache) {
        return cache.addAll(precacheResources);
      })
      .then(function() {
        console.log('WORKER: install completed');
      })
  );
  self.skipWaiting()
});

self.addEventListener("fetch", function(event) {
  console.log('WORKER: fetch event in progress.');

  if (event.request.method !== 'GET') {
    console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
    return;
  }
  event.respondWith(
    caches
      .match(event.request)
      .then(function(cached) {
        var networked = fetch(event.request)
          .then(fetchedFromNetwork, unableToResolve)
          .catch(unableToResolve);
        console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
        return cached || networked;

        function fetchedFromNetwork(response) {
          var cacheCopy = response.clone();

          console.log('WORKER: fetch response from network.', event.request.url);

          caches
            .open(version + 'pages')
            .then(function add(cache) {
              cache.put(event.request, cacheCopy);
            })
            .then(function() {
              console.log('WORKER: fetch response stored in cache.', event.request.url);
            });

          // Return the response so that the promise is settled in fulfillment.
          return response;
        }
        function unableToResolve () {

          console.log('WORKER: fetch request failed in both cache and network.');

          return new Response('<h1>Você está sem internet!</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        }
      })
  );
});

self.addEventListener("activate", function(event) {
  /* Just like with the install event, event.waitUntil blocks activate on a promise.
     Activation will fail unless the promise is fulfilled.
  */
  console.log('WORKER: activate event in progress.');

  event.waitUntil(
    caches
      /* This method returns a promise which will resolve to an array of available
         cache keys.
      */
      .keys()
      .then(function (keys) {
        // We return a promise that settles when all outdated caches are deleted.
        return Promise.all(
          keys
            .filter(function (key) {
              // Filter by keys that don't start with the latest version prefix.
              return !key.startsWith(version);
            })
            .map(function (key) {
              /* Return a promise that's fulfilled
                 when each outdated cache is deleted.
              */
              return caches.delete(key);
            })
        );
      })
      .then(function() {
        console.log('WORKER: activate completed.');
      })
  );
});

self.addEventListener('push', function (event) {
      console.log('Servidor enviou uma notificação.')
      let _data = event.data ? JSON.parse(event.data.text()) : {};
      // notificationUrl = _data.url;
      event.waitUntil(
          self.registration.showNotification(_data.title, {
              body: _data.message,
              icon: _data.icon,
              tag: _data.tag
          })
      );
  });

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