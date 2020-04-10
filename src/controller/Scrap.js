const puppeteer = require('puppeteer');
const db = require('../data/db')
async function checkSaveNew(){  //Checa se a PRIMEIRA NOTÍCIA DO SITE É NOVA
  const browser = await puppeteer.launch()//{headless: false})
  const page = await browser.newPage();
  const url = 'https://www.ifnmg.edu.br/mais-noticias-januaria/560-januaria-noticias-2020'
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


    } catch(err){
      console.log(err)
    }   
      
finally{
    console.log('PRIMEIRA NOTÍCIA DO SITE', url_web)
    console.log('ÚLTIMO REGISTRO DO BD', query_response.rows[0].url)

    if(query_response.rows[0].url != url_web)
      { 
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
      
        await page.close()
        await browser.close()

        const select_query = {
          name: 'Get the 10 last news',
          text: 'SELECT url FROM notificado LIMIT 10 OFFSET 0',  //Selecione as últimas 10 notícias do bd
        }
      
        const select_response = await db.query(select_query)
        
        news = news.filter( n => !select_response.rows.some(d => d.url === n.url))                  //fico apenas com as notícias que não tenho no bd   //PASSO ESTA VARIÁVEL PARA O FRONT? (NOTIFICAÇÃO)
        
        console.log('NOVIDADES DO SITE',news)
      
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
        }}
    else
      return console.log('NOVIDADES NO SITE: ', null)
}}

async function scrapBanner(){
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage();
  const url = 'http://www.ifnmg.edu.br/januaria'       
  await page.goto(url, {waitUntil: 'domcontentloaded',timeout: 0});

  let query = {
    text: "DELETE FROM banner"    //  COMO EU DESCONHEÇO A POLÍTICA DE ADIÇÃO DE NOVOS BANNERS, RESUMI TODO O ESFORÇO EM APENAS DELETAR E INSERIR NOVAMENTE
  }
  
  await db.query(query)
  
  var result
  try{
    result = await page.evaluate(()=>{
        let items = []
        let url_target = []
        let url_image  = [] 
        a = document.querySelectorAll(".banneritem > a")
        
  
        a.forEach((url)=>{url_target.push("http://www.ifnmg.edu.br"+url.getAttribute("href"))})
        a.forEach((img)=>{url_image.push(img.firstElementChild.getAttribute("src"))})

        for(let i=0; i<url_image.length; i++){
            items.push({
              url_image: url_image[i],
              url_target: url_target[i]
            })
        }
      return items
    })    

  }finally{
    await page.close()
    await browser.close()

    for(let i=0; i < result.length; i++){
      query = {
        text: 'INSERT INTO banner (url_image, url_target) VALUES ($1,$2)',
        values: Object.values(result[i])
      } 

      await db.query(query,(err,res)=>{
        if(err)
          console.log(err)
      })
    }
  }
  return console.log('BANNERS ENCONTRADOS:', result)
}

// clickLimit()

module.exports = setInterval(checkSaveNew, 60*60000)   //Executa a função de 60 em 60 minutos
module.exports = setInterval(scrapBanner, 24*60*60000)   //Executa a função a cada 24h
// checkSaveNew()
// module.exports = setInterval(checkNew, 30000)   //Executa a função de 30 em 30 segundos  [TESTE DE STRESS]