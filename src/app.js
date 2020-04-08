const express = require('express')
const cors = require('cors')
const routes = require('./routes/routes')
const scrap = require('./controller/Scrap')     //Executa a função callCheckNew() a cada intervalo de tempo

const app = express()
app.use(cors()) //libera acesso para outras aplicações
app.use(express.json())
app.use(routes)



app.listen(9000, function(){
    console.log('Server is Runnuing');
})



//TIPOS DE PARÂMETROS

//QUERY PARAMS: request.query (Filtros, ordenação, paginação...)
//ROUTE PARAMS: request.params (Identificar um recurso na alteração ou remoção)
//BODY: (Dados para criação ou alteração de um registro)