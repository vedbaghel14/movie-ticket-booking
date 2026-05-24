const express = require('express')
const router = express.Router()
const {getNowPlaying,addShow, getSingleShow, getAllShows} = require('../controllers/show.controller')
const {protectAdmin}= require('../middlewares/auth.middlewares')

router.get('/nowplaying', protectAdmin ,getNowPlaying)
router.post('/add', protectAdmin,addShow)
router.get('/all',getAllShows)
router.get('/:movieId',getSingleShow)


module.exports = router