const db = require('../data/db')
const webPush = require('web-push')
const q = require('q');

module.exports = {
    async subscribe(req, res){
        var body_sub = req.body;
        webPush.setVapidDetails('mailto:gabrielfer.s88@gmail.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);

        const query = {
            text: "SELECT * FROM pushnotification where subscription->>'endpoint' = $1",
            values:[body_sub.endpoint]
        }
        db.query(query,(err,result)=>{
            console.log('Número de linhas encontradas no BD',result.rowCount)
            if(!result.rowCount){
                const query = {
                    text: 'INSERT INTO pushnotification(subscription) values ($1)',
                    values:[body_sub]
                }
                db.query(query, (err,res)=>{
                    if(res){
                            console.log('Inscrição salva no bd')////////
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
                                }).catch((err) => {
                                    reject({
                                        status: false,
                                        endpoint: sub.endpoint,
                                        data: err
                                    });
                                });
                            });
            
                        q.allSettled(boas_vindas).then((pushResults) => {
                            console.info(pushResults);
                        });
                    }
                    else
                        console.log('Falha no save da inscrição bd',err)
                })
            }
            else
                console.log('Subscription já estava cadastrada!')

        })

    return res.status(201).json('final do /subscribe')
    },

    async push(req, res, next){
        const dominio_hospedagem = process.env.APP_API_URL.slice(process.env.APP_API_URL.indexOf('//')+2, process.env.APP_API_URL.length) //pego somente o conteúdo após o //
        
        console.log('REQUISIÇÂO RECEBIDA EM ',dominio_hospedagem+'/push')
        

        const payload = {
            title: req.body.title,
            message: req.body.message,
            url: req.body.url,
            ttl: req.body.ttl,
            icon: req.body.icon,
            image: req.body.image,
            badge: req.body.badge,
            tag: req.body.tag
        };

        const query = {
            text: 'SELECT subscription from pushnotification'
        }

        await db.query(query,(err,sub)=>{
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
                    }).catch((err) => {
                        reject({
                            status: false,
                            endpoint: sub.subscription.endpoint,
                            data: err
                        });
                    });
                });
            });
            q.allSettled(parallelSubscriptionCalls).then((pushResults) => {
                console.info(pushResults);
            });
            // res.json({
            //     data: 'Push triggered'
            // })
        }   
        else
            return('Erro ao tentar resgatar as subscriptions')
    })
    },

    async index(req,res){
        let pagina = req.query.page
        const itens_por_pagina = 10


        if(typeof(pagina) != 'string' || pagina < 0){
            pagina = 1
        }

        const banner = {
            text:"SELECT url_image, url_target FROM banner WHERE ativo = true"
        }
        
        let banner_list
        
        db.query(banner,(err,res)=>{
            if(res)
                banner_list = res.rows
        })

        const pages = {
            text: "SELECT id FROM notificado",
        }

        let maxPage
        db.query(pages,(err,res)=>{
            if(res)
                maxPage = Math.ceil(res.rowCount/itens_por_pagina)
        })

        last_update_DATA = ''
        last_update_HORA = ''
        const query_scrap = {
            text: "select TO_CHAR(date(last_update) :: DATE, 'dd/mm')AS data, TO_CHAR(last_update ::time :: TIME, 'hh24hmi')AS hora from last_scrap ORDER BY (last_update) DESC LIMIT 1 OFFSET 0",
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


        db.query(query,(err, news)=>{
            if(news)
                return res.render('index',{news:news.rows,itens_por_pagina: itens_por_pagina,pagina_atual: pagina,maxPage: maxPage,banner: banner_list,last_update_DATA,last_update_HORA})
            else  
                return res.json(err)
        }) 
        
    },

    async sobre(req,res){
        return res.render('sobre')
    },

    async ajuda(req,res){
        return res.render('ajuda')
    }
}