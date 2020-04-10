const banners = document.querySelectorAll('.banner')

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

// console.log(banners[0].setAttribute('style','display:block'))
setInterval(alterImgBanner, 5000)

document.addEventListener('DOMContentLoaded', init, false);
function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Service worker registered -->', reg);
      }, (err) => {
        console.error('Service worker not registered -->', err);
      });
  }
}