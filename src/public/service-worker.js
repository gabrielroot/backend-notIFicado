const cacheName = 'cache-v1';
const precacheResources = [
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

self.addEventListener('fetch',function(event){
  event.respondWith(caches.match(event.request).then(function(response){
      return response || fetch(event.request);
  }));
});

    let notificationUrl = '';
self.addEventListener('push', function (event) {
      console.log('Servidor enviou uma notificação.')
      let _data = event.data ? JSON.parse(event.data.text()) : {};
      notificationUrl = _data.url;
      event.waitUntil(
          self.registration.showNotification(_data.title, {
              body: _data.message,
              icon: _data.icon,
              tag: _data.tag
          })
      );
  });

  self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({
            type: "window"
        })
        .then(function (clientList) {
            if (clients.openWindow) {
                return clients.openWindow(notificationUrl);
            }
        })
    );
});