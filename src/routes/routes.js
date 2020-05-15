const {Router} = require('express')
const routes = Router()
const news = require('../controller/News')
routes.get('*', (req,res,next)=>{
    if(req.protocol !== 'https' && req.hostname !== 'localhost'){
        console.log('REDIRECT: HTTP > HTTPS')
        res.redirect('https://'+req.hostname+req.url)
    }
    else
        next()
})
routes.get('/', news.index) //controler / retornara uma lista de noticias
routes.get('/sobre', news.sobre) 
routes.get('/ajuda', news.ajuda) 
routes.post('/subscribe', news.subscribe)   //CADASTRA O USER PARA RECEBER NOTIFICAÇÕES

module.exports = routes