const { Pool } = require('pg')

module.exports = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
})
//?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory
