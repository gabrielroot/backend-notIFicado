const db = require('../data/db')
const webPush = require('web-push')
const q = require('q');

module.exports = {
    async subscribe(req, res){
        const subscription = req.body.subscription;
        const userId = req.body.userId;
        console.log('jjjjj',req.body)        
        console.log('iiiiiiiiiiiii',res.status(201).json({}))
        res.status(201).json({})
        webPush.setVapidDetails('mailto:test@example.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);
        
        const payload = JSON.stringify({
            title: 'Push notifications with Service Workers',
        });

        webPush.sendNotification(subscription, payload)
            .catch(error => console.error(error));










        //TODO: Store subscription keys and userId in DB
        const query = {
            text: 'INSERT INTO pushnotification(userid,subscription) values ($1,$2)',
            values:[userId, subscription]
        }
        db.query(query, (err,res)=>{
            if(res)
                console.log('Inscrição salva no bd')
            else
                console.log('Falha no save da inscrição bd',err)
        })
            
    return res.send('kkkkk')
    },

    async push(req, res){
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
            text: 'SELECT * from pushnotification'
        }

        let subscriptions = (await db.query(query)).rows


        let parallelSubscriptionCalls = subscriptions.map((subscription) => {
            return new Promise((resolve, reject) => {
                const pushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    }
                };

                const pushPayload = JSON.stringify(payload);
                const pushOptions = {
                    vapidDetails: {
                        subject: "http://example.com",
                        privateKey: keys.privateKey,
                        publicKey: keys.publicKey
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
                        endpoint: subscription.endpoint,
                        data: value
                    });
                }).catch((err) => {
                    reject({
                        status: false,
                        endpoint: subscription.endpoint,
                        data: err
                    });
                });
            });
        });
        q.allSettled(parallelSubscriptionCalls).then((pushResults) => {
            console.info(pushResults);
        });
        res.json({
            data: 'Push triggered'
        })
    },

    async index(req,res){
        let pagina = req.query.page

        if(typeof(pagina) != 'string' || pagina < 0){
            pagina = 0
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
                maxPage = res.rowCount
        })

        const query = {
            text: "SELECT id,title,description,TO_CHAR(date :: DATE, 'dd/mm/yyyy')AS date, TO_CHAR(hour :: TIME, 'hh24:mi')AS hour, url, image_url FROM notificado ORDER BY id DESC LIMIT 10 OFFSET $1*2",
            values: [pagina]
        }

        pagina = parseInt(pagina)


        db.query(query,(err, news)=>{
            if(news)
                return res.render('index',{news:news.rows,pagina,showPages: 10,maxPage: maxPage,banner: banner_list})
            else  
                return res.json(err)
        }) 
        
    },

    async sobre(req,res){
        return res.render('sobre')
    },

    async off(req,res){
        return res.render('offline')
    }
}