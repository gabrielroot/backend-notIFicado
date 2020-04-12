const express = require('express')
const bodyParser = require('body-parser');
const routes = require('./src/routes/routes')
const nunjucks = require('nunjucks')
require('dotenv/config')
const scrap = require('./src/controller/Scrap')     //Executa a função callCheckNew() a cada intervalo de tempo

// const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
// const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

// const fs = require('fs')
// const https = require('https')

// const key = fs.readFileSync('./localhost.key');
// const cert = fs.readFileSync('./localhost.crt');

const app = express()
// const server = https.createServer({key: key, cert: cert }, app);

// app.use((req, res, next) => {
//     if (!req.secure) {
//       return res.redirect('https://' + req.headers.host + req.url);
//     }
//     next();
//   })
nunjucks.configure('./src/views',{
    express: app,
    noCache: true,
    autoescape: false
})

app.set('view engine', 'njk')

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json())
app.use(express.static('./src/public'))
app.use(routes)




app.listen(process.env.PORT || 9000, function(){ //5000 ou 9000
    console.log('App is Runnuing!');
})

// server.listen(process.env.PORT || 443, function(){
//     console.log('Server is Runnuing');
// })


//TIPOS DE PARÂMETROS

//QUERY PARAMS: request.query (Filtros, ordenação, paginação...)
//ROUTE PARAMS: request.params (Identificar um recurso na alteração ou remoção)
//BODY: (Dados para criação ou alteração de um registro)