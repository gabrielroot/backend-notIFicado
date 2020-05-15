const db = require('../data/db')
const webPush = require('web-push')

module.exports = {
    async subscribe(req, res){
        var body_sub = req.body;
        webPush.setVapidDetails('mailto:gabrielfer.s88@gmail.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);

        const query = {
            text: "SELECT * FROM pushnotification where subscription->>'endpoint' = $1",
            values:[body_sub.endpoint]
        }
        db.query(query,(err,result)=>{
            if(!result.rowCount){
                const query = {
                    text: 'INSERT INTO pushnotification(subscription) values ($1)',
                    values:[body_sub]
                }
                db.query(query, (err,res)=>{
                    if(res){
                            console.log('INSCRIÇÃO SALVA NO BD')////////
                            const payload = {
                                title: 'Seja bem-vindo(a)!\n',
                                message: 'Acesse o menu, clique em "Informações adicionais" e veja algumas dicas para uma experiência ainda melhor',
                                url: process.env.APP_API_URL,
                                "ttl": 300, //5Min - TTL — define por quanto tempo uma mensagem deve ser enfileirada antes de ser removida e não entregue.
                                "icon": process.env.APP_API_URL + "/images/icon.png",
                                "badge": process.env.APP_API_URL + "/images/icon.png",
                                "data":'DICA: Acesse o menu do app e selecione "Informações adicionais" !',
                                "tag": "NOTIFICADO"
                            };
                            const boas_vindas = new Promise((resolve, reject) => {
                                const pushSubscription = {
                                    endpoint: body_sub.endpoint,
                                    keys: {
                                        p256dh: body_sub.keys.p256dh,
                                        auth: body_sub.keys.auth
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
                                        endpoint: body_sub.endpoint,
                                        data: value
                                    });
                                    console.log('BOAS VINDAS!')
                                }).catch((err) => {
                                        console.log('Falha ao enviar boas vindas', err);
                                });
                            });
                    }
                    else
                        console.log('PEDIDO DE SUBSCRIPTION: Falha no save da inscrição bd',err)
                })
            }
            else
                console.log('PEDIDO DE SUBSCRIPTION: Subscription já estava cadastrada!')

        })

    return res.status(201).json('final do /subscribe')
    },

    async index(req,res){

        var banner_list, maxPage, last_update_DATA, last_update_HORA, news
        var itens_por_pagina = 10
        var pagina = req.query.page

        try{
            if(typeof(pagina) != 'string' || pagina < 0){
                pagina = 1
            }

            const banner = {
                text:"SELECT url_image, url_target FROM banner WHERE ativo = true"
            }
            

            
             db.query(banner,(err,res)=>{
                if(res)
                    banner_list = res.rows
            })

            const pages = {
                text: "SELECT id FROM notificado",
            }


             db.query(pages,(err,res)=>{
                if(res)
                    maxPage = Math.ceil(res.rowCount/itens_por_pagina)
            })

            const query_scrap = {
                text: "select TO_CHAR(date(last_update AT TIME ZONE 'America/Sao_Paulo') :: DATE, 'dd/mm')AS data, TO_CHAR(last_update  AT TIME ZONE 'America/Sao_Paulo', 'hh24hmi') AS hora from last_scrap ORDER BY (last_update) DESC LIMIT 1 OFFSET 0",
            }
             db.query(query_scrap,(err, result)=>{
                if(result){
                    last_update_DATA = result.rows[0].data
                    last_update_HORA = result.rows[0].hora
                }
            })

            pagina = parseInt(pagina)
            const query = {
                text: "SELECT id,title,description,TO_CHAR(date :: DATE, 'dd/mm/yyyy')AS date, TO_CHAR(hour :: TIME, 'hh24:mi')AS hour, url, image_url FROM notificado ORDER BY (date, hour) DESC LIMIT $2 OFFSET ($1-1) * $2",
                values: [pagina,itens_por_pagina]
            }
             news = await db.query(query) 
        }finally{
            if(news)
                return res.render('index',{news:news.rows,itens_por_pagina: itens_por_pagina,pagina_atual: pagina,maxPage: maxPage,banner: banner_list,last_update_DATA,last_update_HORA})
            else  
                return res.send('<h1>Ocorreu um erro ao carregar o conteúdo</h1>')
        }
    },

    async sobre(req,res){
        return res.render('sobre')
    },

    async ajuda(req,res){
        return res.render('ajuda')
    }
}
