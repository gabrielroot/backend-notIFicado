const { Pool } = require('pg')
require('dotenv').config()

if(process.env.APP_API_URL.slice(7,16) == 'localhost')
    module.exports = new Pool({
        user: 'grafite7_62',
        password: '123',
        host: 'localhost',
        port: '5432',
        database: 'notificado'
    })
else
    module.exports = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false,
    })


///// Usado para fazer conexões externas (com ssl)
// ?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory
