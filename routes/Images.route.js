const express = require('express')
const createError = require('http-errors')
const router = express.Router()
const crypto = require('crypto')
const path = require('path')
const pool = require('../helpers/init_db');

router.get('/', async (req, res, next) => {
    res.sendFile(__dirname + '/pages/images.html')
})

router.post('/', async (req, res, next) => {
    try {
        if (req.files) {
            var file = req.files.file
            var ext = path.extname(file.name)
            console.log(ext)
            var filename = crypto.randomUUID() + ext
            file.mv('./uploads/' + filename, async (err) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                } else {
                    const imageUrl = req.getPublicUrl(filename)
                    await pool.query("INSERT INTO images (image_url, original_name) VALUES ($1, $2)", [imageUrl, file.name])

                    const html = "<div>" + imageUrl + "</div><div>" + file.name + "</div>"
                    res.send(html)
                }
            })
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router