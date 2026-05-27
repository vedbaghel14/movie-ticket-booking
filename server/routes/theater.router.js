const express = require('express')
const router = express.Router()
const { getNearbyTheatres } = require('../controllers/theater.controller')

router.get('/nearby', getNearbyTheatres)

module.exports = router