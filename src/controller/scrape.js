const puppeteer = require('puppeteer');
const db = require('../data/db')



async function checkNew(){  //Checa se a PRIMEIRA NOTÍCIA DO SITE É NOVA
  const browser = await puppeteer.launch()//{headless: false})
  const page = await browser.newPage();
  const url = 'https://www.ifnmg.edu.br/mais-noticias-januaria/560-januaria-noticias-2020'        //pensar no wait for para que o browser nao espere o load completo da pagina
  await page.goto(url, {waitUntil: 'domcontentloaded',timeout: 0});

  const query = {
    name: 'Get last news',
    text: 'SELECT url FROM notificado WHERE id = (select max(id) from notificado)', //pega a ultima noticia do bd
  }

  var query_response
  var url_web
  try{
      url_web = await page.evaluate(function(){

          const a = document.querySelector('h2.tileHeadline > a')
          const url = 'https://www.ifnmg.edu.br'+a.getAttribute('href')   //pego a primeira noticia da página

          
          return url
      })

      query_response = await db.query(query)
      // console.log(qres)
      await page.close()
      await browser.close()

    } catch(err){
      console.log(err)
    }   
      
finally{
    console.log('PEIMEIRA NOTÍCIA DO SITE', url_web)
    console.log('ÚLTIMO REGISTRO DO BD', query_response.rows[0].url)

    if(query_response.rows[0].url != url_web)
      return true
    else
      return false
}}


async function saveNews() {
  
  
  const browser = await puppeteer.launch()//{headless: false});
  var page = await browser.newPage();
  let url = 'https://www.ifnmg.edu.br/mais-noticias-januaria/560-januaria-noticias-2020'
  await page.goto(url, {waitUntil: 'domcontentloaded'});

  let news = await page.evaluate(function(){
    
    var setDate = function (str){
      let date = '20' + str.slice(7,10) + '/'
      date += str.slice(4,7)
      date += str.slice(1,3)
  
      return date
    }
  
    var setHour = function (str){
      let hour = str.slice(1,3) + ':'
      hour += str.slice(4,6) + ':00'

      return hour
    }
    
    var titles = []
    var url = []
    var image_url = []
    var descriptions = []
    var dates = []
    var hours = []

    const as = document.querySelectorAll('h2.tileHeadline > a')
    
    as.forEach( (a) =>{
              titles.push(a.innerHTML)
              let img_el =  a.parentNode.parentNode.firstElementChild.querySelector('img')
              console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk | '+ img_el)
              if(img_el){
                let img =  img_el.getAttribute('src')
                if(img.slice(0,1) == '/')                            // Se no começo da url da imagem tiver um '/', então adicione o domínio do site
                  img = 'https://www.ifnmg.edu.br' + img
                image_url.push({url: img, exist: true})
              }else 
                image_url.push({url: "", exist: false})
              
              url.push('https://www.ifnmg.edu.br'+a.getAttribute('href'))
    })

    document.querySelectorAll('span.description > p')
            .forEach( p => descriptions.push(p.innerHTML))
    
    const dts = document.querySelectorAll('i.icon-calendar')
            dts.forEach( (data) => dates.push(setDate(data.parentElement.innerText)))

    const hrs = document.querySelectorAll('i.icon-calendar')
            hrs.forEach( (hour) => hours.push(setHour(hour.parentNode.nextElementSibling.innerText)))
    
    let result = []
    for (let i = 0; i < titles.length; i++) {
      if(image_url[i].exist)
        result.push({
                      title: titles[i],
                      url: url[i],
                      image_url: image_url[i].url,
                      description: descriptions[i],
                      date: dates[i],
                      hour: hours[i]
        })
        else
          result.push({
            title: titles[i],
            url: url[i],
            description: descriptions[i],
            date: dates[i],
            hour: hours[i]
      })
    }

    return result
  })
  
  const select_query = {
    name: 'Get the 10 last news',
    text: 'SELECT url FROM notificado LIMIT 10 OFFSET 0',  //Selecione as últimas 10 notícias do bd
  }

  const select_response = await db.query(select_query)
  
  news = news.filter( n => !select_response.rows.some(d => d.url === n.url))                  //fico apenas com as notícias que não tenho no bd   //PASSO ESTA VARIÁVEL PARA O FRONT? (NOTIFICAÇÃO)
  
  console.log('NOVIDADES DO SITE',news)
  console.log('10 ÚLTIMOS DO BD',select_response.rows)

  let query = {}  
  for (let i = news.length -1; i >= 0; i--) {
    if(news[i].image_url)
      query = {
        text: 'INSERT INTO notificado (title, url, image_url, description, date, hour) VALUES ($1,$2,$3,$4,$5,$6)',
        values: Object.values(news[i])
      }
    else
      query = {
        text: 'INSERT INTO notificado (title, url, description, date, hour) VALUES ($1,$2,$3,$4,$5)',
        values: Object.values(news[i])
      } 

      await db.query(query)
  }
  await page.close()
  await browser.close();
}

async function clickLimit(){
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage();
  const url = 'https://www.ifnmg.edu.br/mais-noticias-januaria/560-januaria-noticias-2020' 
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 0});

  await page.focus('#limit')
  await page.keyboard.type('Todos')

  await page.close()
  await browser.close()
}


function callCheckNew() {
  checkNew()                            //Espero a função ser totalmente executada, e só assim, trabalho com o seu retorno
    .then(res => {
      console.log('Resultado: ', res)
      if(res)                           //Se a página possui conteúdo novo, então chame a função que o pega e armazena
        saveNews()
    });
}

// clickLimit()

setInterval(callCheckNew, 30*60000)   //Executa a função de 30 em 30 minutos


// setInterval(saveNews, 30000)   //Executa a função de 30 em 30 minutos  [TESTE DE STRESS]
