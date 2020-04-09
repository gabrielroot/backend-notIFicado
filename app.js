const express = require('express')
const cors = require('cors')
const routes = require('./src/routes/routes')
const nunjucks = require('nunjucks')
const scrap = require('./src/controller/Scrap')     //Executa a função callCheckNew() a cada intervalo de tempo

const app = express()

nunjucks.configure('./src/views',{
    express: app,
    noCache: true,
    autoescape: false
})

app.set('view engine', 'njk')

app.use(express.static('./src/public'))
app.use(cors()) //libera acesso para outras aplicações
app.use(routes)




app.listen(9000, function(){
    console.log('Server is Runnuing');
})



//TIPOS DE PARÂMETROS

//QUERY PARAMS: request.query (Filtros, ordenação, paginação...)
//ROUTE PARAMS: request.params (Identificar um recurso na alteração ou remoção)
//BODY: (Dados para criação ou alteração de um registro)