const express = require('express')
const {createBooking, getOccupiedSeats} = require('../controllers/booking.controller')


const bookingRouter = express.Router()
bookingRouter.post('/create', createBooking)
bookingRouter.get('/seats/:showId', getOccupiedSeats)

module.exports = bookingRouter
