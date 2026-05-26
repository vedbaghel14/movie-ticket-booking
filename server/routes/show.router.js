const express = require('express')
const router = express.Router()
const {getNowPlaying,addShow, getSingleShow, getAllShows, getPublicNowPlaying, getPublicTrailers} = require('../controllers/show.controller')
const {protectAdmin}= require('../middlewares/auth.middlewares')

router.get('/nowplaying', protectAdmin ,getNowPlaying)
router.get('/public/nowplaying', getPublicNowPlaying)
router.get('/public/trailers', getPublicTrailers)
router.post('/add', protectAdmin,addShow)
router.get('/all',getAllShows)
router.get('/:movieId',getSingleShow)


module.exports = router