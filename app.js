const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const { verifyAccessToken } = require('./helpers/jwt_helper')
const pool = require('./helpers/init_db')
const AuthRoute = require('./routes/Auth.route')
const ImagesRoute = require('./routes/Images.route')
const DestinationsRoute = require('./routes/Destinations.route')
const upload = require('express-fileupload')
const url = require('url')

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(upload())
app.use('/public', express.static('uploads'))
app.use(function (req, res, next) {
    req.getPublicUrl = function (data) {
        return url.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: '/public/' + data,
        })
    }
    return next()
})

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send('Hello')
})

app.get('/test', async (req, res, next) => {
    res.send('Hello')
})

app.get('/db', async (req, res, next) => {
    const createUsersTable = await pool.query("CREATE TABLE IF NOT EXISTS users(user_id VARCHAR(255) PRIMARY KEY, email VARCHAR(255), password VARCHAR(255))")
    console.log(createUsersTable)

    const createDestinationsTable = await pool.query("CREATE TABLE IF NOT EXISTS destinations("+
        "dest_id VARCHAR(255) PRIMARY KEY, " +
        "dest_name VARCHAR(255), " +
        "dest_category_text VARCHAR(255)," +
        "dest_description TEXT, " + 
        "dest_rating FLOAT, " +
        "dest_main_image_url VARCHAR(255), " +
        "dest_price FLOAT)")
    console.log(createDestinationsTable)

    const createImagesTable = await pool.query("CREATE TABLE IF NOT EXISTS images(image_url VARCHAR(255) PRIMARY KEY, original_name VARCHAR(255))")
    console.log(createImagesTable)

    const createDestinationImagesTable = await pool.query("CREATE TABLE IF NOT EXISTS destination_images(image_url VARCHAR(255) PRIMARY KEY, dest_id VARCHAR(255))")
    console.log(createDestinationImagesTable)

    res.send('DB created')
})

app.use('/auth', AuthRoute)
app.use('/images', ImagesRoute)
app.use('/destinations', DestinationsRoute)

app.use(async (req, res, next) => {
    next(createError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})