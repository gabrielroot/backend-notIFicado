const {Router} = require('express')
const routes = Router()
const news = require('../controller/News')


routes.get('/', news.index) //controler / retornara uma lista de noticias
routes.get('/ajuda', news.ajuda) 
routes.post('/subscribe', news.subscribe)   //CADASTRA O USER PARA RECEBER NOTIFICAÇÕES

module.exports = routes