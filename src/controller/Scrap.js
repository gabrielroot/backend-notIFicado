const puppeteer = require('puppeteer');
const db = require('../data/db')
const webPush = require('web-push')
const q = require('q');

async function checkSaveNew(){  //Checa se a PRIMEIRA NOTÍCIA DO SITE É NOVA, ARMAZENA NO BD E NOTIFICA O FRONT
  const browser = await puppeteer.launch({ ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox', '--disable-setuid-sandbox'] })//{headless: false})
  const page = await browser.newPage();
  const url = 'https://www.ifnmg.edu.br/mais-noticias-januaria/560-januaria-noticias-2020'
  await page.goto(url, {waitUntil: 'domcontentloaded',timeout: 0});

  const query = {
    name: 'Get last news',
    text: 'SELECT url FROM notificado ORDER BY (date, hour) DESC LIMIT 1 OFFSET 0 ', //pega a noticia mais recente do bd
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

    if(query_response == undefined)
      console.log('\nUMA QUERY NO DB RETORNOU UNDEFINED. PROVÁVEL QUE SEJA ERRO DE CONEXÃO! OLHE O ARQUIVO /SRC/DATA/DB.JS\n')

    console.log('REGISTRO MAIS RECENTE DO BD', query_response.rows[0].url)

    let query_scrap = {
      text: 'INSERT INTO last_scrap (last_update) VALUES (default);',
    } 

    await db.query(query_scrap,(err,result)=>{
      if(result)
        console.log('ULTIMA ATUALIZACAO SALVA NO BD')
      else 
        console.log('ERRO AO SALVAR ULTIMA ATUALIZACAO NO BD')
    })

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
          text: 'SELECT url FROM notificado ORDER BY (date, hour) DESC LIMIT 10 OFFSET 0 ',  //Selecione as 10 notícias mais recentes  do bd
        }
      
        const select_response = await db.query(select_query)
        
        news = news.filter( nw => !select_response.rows.some(bd => bd.url === nw.url)) //fico apenas com as notícias que não tenho no bd   


////////////
        var query_sub = {
          text: 'SELECT subscription from pushnotification'
        }

        news.forEach(async (noticia)=>{     //(NOTIFICAÇÃO)
         
          const payload = {
              "title": "Notificado",
              "message": noticia.title,
              "url": process.env.APP_API_URL,
              "ttl": 60 * 60 * 24 * 3, //3 Dias - TTL — define por quanto tempo uma mensagem deve ser enfileirada antes de ser removida e não entregue.
              "icon": process.env.APP_API_URL + "/images/icon.png",
          }




          await db.query(query_sub,(err,sub)=>{
            if(sub){
                result = sub.rows
                let parallelSubscriptionCalls = result.map((sub) => {
                    return new Promise((resolve, reject) => {
                        const pushSubscription = {
                            endpoint: sub.subscription.endpoint,
                            keys: {
                                p256dh: sub.subscription.keys.p256dh,
                                auth: sub.subscription.keys.auth
                            }
                        };

                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: process.env.APP_API_URL,
                                privateKey: process.env.PRIVATE_VAPID_KEY,
                                publicKey: process.env.PUBLIC_VAPID_KEY
                            },
                            TTL: payload.ttl,
                            headers: {}
                        };
                        webPush.sendNotification(
                            pushSubscription,
                            pushPayload,
                            pushOptions
                        ).then((value) => {
                            resolve({
                                status: true,
                                endpoint: sub.subscription.endpoint,
                                data: value
                            });
                            console.log('NOTIFICACAO [OK]')
                        }).catch(async (err) => {
                          if (err.statusCode === 404 || err.statusCode === 410){
                              const query = {
                                text: "DELETE FROM pushnotification where subscription->>'endpoint' = $1",
                                values:[sub.subscription.endpoint]
                              }
                              await db.query(query,(err_db,sucess)=>{
                                  if(sucess)
                                    console.log('Erro ao notificar subscription. Erro ',err.statusCode,' [REMOVIDA DO BD]')
                                  else
                                    console.log('Erro ao notificar subscription. Erro ',err.statusCode,' [FALHA AO REMOVER DO BD]: ', err_db)
                              })
                          }
                          else
                            console.log('STATUSCODE DESCONHECIDO AO NOTIFICAR', err.statusCode);
                        });
                    });
              });
              // q.allSettled(parallelSubscriptionCalls).then((pushResults) => {
              //     console.info(pushResults);
              // })
          }
          else
            return('Erro ao tentar resgatar as subscriptions para notificar. ',err)
      })
        })


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
        }
    }
    else
      return console.log('NOVIDADES NO SITE: ', null)
}}

async function scrapBanner(){
  const browser = await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox', '--disable-setuid-sandbox'] })//{headless: false})
  const page = await browser.newPage();
  const url = 'https://www.ifnmg.edu.br/januaria'       
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
        
  
        a.forEach((url)=>{url_target.push("https://www.ifnmg.edu.br"+url.getAttribute("href"))})
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
  return console.log('BANNERS ENCONTRADOS [', result.length,']')
}


module.exports = setInterval(checkSaveNew, 60*60000)   //Executa a função de 60 em 60 minutos
module.exports = setInterval(scrapBanner, 24*60*60000)   //Executa a função a cada 24h

checkSaveNew()
scrapBanner()

// module.exports = setInterval(checkSaveNew, 30000)   //Executa esta função de 30 em 30 segundos  [TESTE DE STRESS]
