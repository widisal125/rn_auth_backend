const Pool = require('pg').Pool

const connectionString = process.env.CONN_STRING

const pool = new Pool({
    connectionString
})

// const pool = new Pool({
//     host: process.env.POSTGRES_HOST,
//     port: process.env.POSTGRES_PORT,
//     user: process.env.POSTGRES_USER,    
//     password: process.env.POSTGRES_USERPW,
//     database: process.env.POSTGRES_DBNAME,    
// })

module.exports = pool