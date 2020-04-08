const { Pool } = require('pg')

module.exports = new Pool({
    user: 'grafite7_62',
    password: '#linnux!',
    host: 'localhost',
    port: '5432',
    database: 'notificado'
})