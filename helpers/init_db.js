const Pool = require('pg').Pool

const connectionString = process.env.CONN_STRING

const pool = new Pool({
    connectionString
})

module.exports = pool