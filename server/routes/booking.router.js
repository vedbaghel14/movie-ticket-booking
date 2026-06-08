const express = require('express')
const {
  createBooking,
  createPaymentSession,
  verifyPaymentSession,
  getOccupiedSeats,
} = require('../controllers/booking.controller')

const bookingRouter = express.Router()
bookingRouter.post('/create', createBooking)
bookingRouter.post('/pay/:bookingId', createPaymentSession)
bookingRouter.get('/verify/:sessionId', verifyPaymentSession)
bookingRouter.get('/seats/:showId', getOccupiedSeats)

module.exports = bookingRouter
