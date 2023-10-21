const express = require('express')
const createError = require('http-errors')
const crypto = require('crypto')
const pool = require('../helpers/init_db');
const router = express.Router()

router.get('/create', async (req, res, next) => {
    res.sendFile(__dirname + '/pages/destinations.html')
})
router.post('/create', async (req, res, next) => {
    try {
        const data = req.body
        const destination = await pool.query("INSERT INTO destinations (dest_id, dest_name, dest_category_text, dest_description, dest_rating, dest_main_image_url, dest_price) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [crypto.randomUUID(), data.name, data.category_text, data.description, data.rating, data.main_image_url, data.price])

        res.send("Created")
    } catch (error) {
        next(error)
    }
})
router.get('/update', async (req, res, next) => {
    res.sendFile(__dirname + '/pages/update_destination.html')
})
router.post('/update', async (req, res, next) => {
    try {
        const data = req.body
        const destination = await pool.query("INSERT INTO destination_images (image_url, dest_id) VALUES ($1, $2)", [data.image_url, data.dest_id])

        res.send('Updated')
    } catch (error) {
        next(error)
    }
})

// Create destination
router.post('/', async (req, res, next) => {
    try {

    } catch (error) {
        next(error)
    }
})

// Get all destinations
router.get('/', async (req, res, next) => {
    try {
        const dest = await pool.query("SELECT * FROM destinations")
        const data = await Promise.all(dest.rows.map(async (d) => {
            const images = await pool.query("SELECT * FROM destination_images WHERE dest_id = $1", [d.dest_id])
            return {
                ...d,
                images: images.rows.map(img => img.image_url)
            }
        }))        
        res.send(data)
    } catch (error) {
        next(error)
    }
})

// Get destination by id
router.get('/:dest_id', async (req, res, next) => {
    try {
        const { dest_id } = req.params
        console.log(dest_id)
        const dest = await pool.query("SELECT * FROM destinations WHERE dest_id = $1", [dest_id])
        const images = await pool.query("SELECT * FROM destination_images WHERE dest_id = $1", [dest_id])
        const data = {
            ...dest.rows[0],
            images: images.rows.map(img => img.image_url)
        }
        res.send(data)
    } catch (error) {
        next(error)
    }
})

// Delete destination by id
router.delete('/', async (req, res, next) => {

})

module.exports = router