const banners = document.querySelectorAll('.banner')
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;


let cont = 0
banners[banners.length-1].setAttribute('style','display:block')
function alterImgBanner(){
    if(cont>=1)
        banners[cont-1].setAttribute('style','display:none') //funcao que retorna um indice sequencial ou aleatorio
    else    
        banners[banners.length-1].setAttribute('style','display:none')
    banners[cont].setAttribute('style','display:block') //funcao que retorna um indice sequencial ou aleatorio
    if(cont == banners.length-1)
        cont = -1
    cont++
}
setInterval(alterImgBanner, 5000)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => {
          console.log('Service worker registered! 😎', reg);
        })
        .catch(err => {
          console.log('😥 Service worker registration failed: ', err);
        });
    });
  }

Notification.requestPermission(function(status) {
    console.log('Notification permission status:', status);
});

async function send(){
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        aplicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    })

    await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers:{
            'content-type': 'application/json'
        }
    })
}



function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }


// function displayNotification() {
//     if (Notification.permission == 'granted') {
//       navigator.serviceWorker.getRegistration().then(function(reg) {
//         reg.showNotification('Hello world!');
//       });
//     }
//   }

//   displayNotification()