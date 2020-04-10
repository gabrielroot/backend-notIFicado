const {Router} = require('express')
const routes = Router()
const news = require('../controller/News')

routes.get('/', news.index) //controler / retornara uma lista de noticias

module.exports = routes