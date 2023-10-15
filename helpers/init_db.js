const Pool = require('pg').Pool

const pool = new Pool({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "rn_auth_backend_db"
})

module.exports = pool