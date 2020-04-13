const PUBLIC_VAPID_KEY = 'BL_q3o5kmbp7Mtz_vkBxqnYQKLZZgXdWamJbi7EK8lEAjwRcTAAfe5YsdGn1ezhpT11pJ97XvYJr9RIrLu4XPAs'

function requestPermission() {
    return new Promise(function(resolve, reject) {
      const permissionResult = Notification.requestPermission(function(result) {
        // Handling deprecated version with callback.
        resolve(result);
      });
  
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
    .then(function(permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error('Permission not granted.');
      }
    });
  }
  requestPermission()//ok
/***
 * register serviceworker
 * register push notification
 * register push notification
 */
function subscribeUserToPush() {
    return navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      var subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      };
  
      return registration.pushManager.subscribe(subscribeOptions)
    })
    .then(async function(pushSubscription) {
      console.log('Inscrição recebida.');
      let bod = JSON.stringify(pushSubscription)
      await fetch('/subscribe', {
          method: 'POST',
          body: bod,
          headers: {
              'content-type': 'application/json'
          }
      })
      return pushSubscription;
    });
  }
subscribeUserToPush()

/**
 * When using your VAPID key in your web app, you'll need to convert the URL safe base64 string 
 * to a Uint8Array to pass into the subscribe call.
 * @param {*} base64String 
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}