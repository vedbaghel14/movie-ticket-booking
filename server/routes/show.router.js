const express = require('express')
const router = express.Router()
const {getShow} = require('../controllers/show.controller')

router.get('/nowplaying', getShow)

module.exports = router