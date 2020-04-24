const {Router} = require('express')
const routes = Router()
const news = require('../controller/News')
const cors = require('cors')
const corsOptions = {
    origin: process.env.APP_API_URL,
    optionsSuccessStatus: 200 
}
  


routes.get('/', news.index) //controler / retornara uma lista de noticias
routes.get('/sobre', news.sobre) 
routes.get('/ajuda', news.ajuda) 
routes.post('/subscribe',cors(corsOptions), news.subscribe)   //CADASTRA O USER PARA RECEBER NOTIFICAÇÕES
routes.post('/push', cors(corsOptions), news.push)             //ENVIA NOTIFICAÇÃO AOS USERS

module.exports = routes