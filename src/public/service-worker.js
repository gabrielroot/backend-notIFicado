const SERVER_URL = process.env.APP_API_URL
const cacheName = 'cache-v1';
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





self.addEventListener('install', event => { //ESSE  EVENTO SÓ ACONTECE UMA VEZ!
  event.waitUntil(
    caches.open(cacheName)
    .then(cache => {
      console.log('Service worker install event!');
        return cache.addAll(precacheResources);
      })
  )
});






self.addEventListener("activate", function (pedido) {
  caches.open("pwa-notes-appfiles-" + cacheName).then(cache => {
    cache.match(pedido)
  })
})


self.addEventListener("fetch", function  (event) {

  let pedido = event.request
  let promisse = caches.match(pedido).then(respotaCache => {

      let resposta = respotaCache ? respotaCache : fetch(pedido)
      return resposta
  })

  event.respondWith(promisse)
})

    // let notificationUrl = '';
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