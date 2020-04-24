const {Router} = require('express')
const routes = Router()
const news = require('../controller/News')
  


routes.get('/', news.index) //controler / retornara uma lista de noticias
routes.get('/sobre', news.sobre) 
routes.get('/ajuda', news.ajuda) 
routes.post('/subscribe', news.subscribe)   //CADASTRA O USER PARA RECEBER NOTIFICAÇÕES
routes.post('/push', news.push)             //ENVIA NOTIFICAÇÃO AOS USERS

module.exports = routes