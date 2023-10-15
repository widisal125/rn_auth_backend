const express = require('express')
const createError = require('http-errors')
const router = express.Router()
const User = require('../models/User.model')
const { authSchema } = require('../helpers/validation_schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper')
const pool = require('../helpers/init_db');
const { getPasswordHash, checkPassword } = require('../helpers/password_helper')
const crypto = require('crypto')

router.post('/register', async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)

        const query = await pool.query("SELECT * FROM users WHERE email = $1", [result.email])
        const doesExist = (query.rowCount !== 0)

        const hashedPassword = await getPasswordHash(result.password)

        if (doesExist) throw createError.Conflict(`${result.email} is already registered`)       

        const user = await pool.query("INSERT INTO users (user_id, email, password) VALUES ($1, $2, $3) RETURNING *", 
            [crypto.randomUUID(), result.email, hashedPassword])

        const { email, password } = user.rows[0]

        const accessToken = await signAccessToken(email)
        const refreshToken = await signRefreshToken(password)
        res.send({accessToken, refreshToken})

    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        
        const query = await pool.query("SELECT * FROM users WHERE email = $1", [result.email])
        const doesExist = (query.rowCount !== 0)

        if (!doesExist) throw createError.NotFound(`User not registered`)

        const { user_id, password } = query.rows[0]

        const isMatch = await checkPassword(result.password, password)
        if (!isMatch) throw createError.Unauthorized('Invalid username or password')

        const accessToken = await signAccessToken(user_id)
        const refreshToken = await signRefreshToken(user_id)
        res.send({accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) {
            return next(createError.BadRequest('Invalid username or password'))
        }
        next(error)
    }
})

router.post('/refresh-token', async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()

        const userId = await verifyRefreshToken(refreshToken)

        const accessToken = await signAccessToken(userId)
        const newRefreshToken = await signRefreshToken(userId)
        res.send({accessToken, refreshToken: newRefreshToken })
    } catch (error) {
        next(error)
    }
})

router.delete('/logout', async (req, res, next) => {
    res.send('logout route')
})

module.exports = router