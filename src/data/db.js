const { Pool } = require('pg')

module.exports = new Pool({
    user: 'grafite7_62',
    password: '123',
    host: 'localhost',
    port: '5432',
    database: 'notificado'
})

// module.exports = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: false,
// })
// //?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory
