const showModel = require('../models/show.model')
const bookingModel = require('../models/booking.model')
const stripe = require('stripe')
const { inngest } = require('../inngest')

const checkAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await showModel.findById(showId)
    if (!showData) {
      return false
    }

    const occupiedSeats = showData.occupiedSeats || {}
    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat])
    return !isAnySeatTaken
  } catch (err) {
    console.error(err.message)
    return false
  }
}

const buildStripeSession = async ({ origin, booking, showData }) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

  const lineItems = [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: showData.movie.title,
      },
      unit_amount: showData.showPrice * 100,
    },
    quantity: 1,
  }]

  return stripeInstance.checkout.sessions.create({
    success_url: `${origin}/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/my-bookings?cancelled=true`,
    line_items: lineItems,
    mode: 'payment',
    metadata: {
      bookingId: booking._id.toString(),
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  })
}

const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { showId, selectedSeats } = req.body
    const { origin } = req.headers

    const isAvailable = await checkAvailability(showId, selectedSeats)
    if (!isAvailable) {
      return res.status(400).send({ success: false, message: 'Selected seat(s) are not available' })
    }

    const showData = await showModel.findById(showId).populate('movie')
    if (!showData) {
      return res.status(404).send({ success: false, message: 'Show not found' })
    }

    const amount = showData.showPrice * selectedSeats.length
    const booking = await bookingModel.create({
      user: userId,
      show: showId,
      bookedSeats: selectedSeats,
      amount,
      isPaid: false,
    })

    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId
    })
    showData.markModified('occupiedSeats')
    await showData.save()

    const session = await buildStripeSession({ origin, booking, showData })
    booking.paymentLink = session.url
    booking.checkoutSessionId = session.id
    await booking.save()
    //run inngest shedule function to check payment status after 10 minutes
    await inngest.send({
        name:"app/checkpayment",
        data:{
            bookingId:booking._id.toString()
        }
    })
    res.status(200).send({ success: true, url: session.url })
  } catch (err) {
    console.error('[createBooking]', err)
    res.status(500).send({ success: false, message: err.message })
  }
}

const createPaymentSession = async (req, res) => {
  try {
    const userId = req.auth().userId
    const { bookingId } = req.params
    const { origin } = req.headers

    const booking = await bookingModel.findById(bookingId).populate({
      path: 'show',
      populate: { path: 'movie' },
    })

    if (!booking) {
      return res.status(404).send({ success: false, message: 'Booking not found' })
    }
    if (booking.user !== userId) {
      return res.status(403).send({ success: false, message: 'Unauthorized' })
    }
    if (booking.isPaid) {
      return res.status(400).send({ success: false, message: 'Booking is already paid' })
    }

    const session = await buildStripeSession({ origin, booking, showData: booking.show })
    booking.paymentLink = session.url
    booking.checkoutSessionId = session.id
    await booking.save()

    res.status(200).send({ success: true, url: session.url })
  } catch (err) {
    console.error('[createPaymentSession]', err)
    res.status(500).send({ success: false, message: err.message })
  }
}

const verifyPaymentSession = async (req, res) => {
  try {
    const userId = req.auth().userId
    const { sessionId } = req.params

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId)

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).send({ success: false, message: 'Payment is not completed' })
    }

    const bookingId = session.metadata?.bookingId
    if (!bookingId) {
      return res.status(400).send({ success: false, message: 'Missing booking metadata' })
    }

    const booking = await bookingModel.findById(bookingId)
    if (!booking) {
      return res.status(404).send({ success: false, message: 'Booking not found' })
    }
    if (booking.user !== userId) {
      return res.status(403).send({ success: false, message: 'Unauthorized' })
    }

    if (!booking.isPaid) {
      booking.isPaid = true
      await booking.save()
      await inngest.send({
        name: 'app/show.booked',
        data: { bookingId: booking._id.toString() },
      })
    }

    res.status(200).send({ success: true })
  } catch (err) {
    console.error('[verifyPaymentSession]', err)
    res.status(500).send({ success: false, message: err.message })
  }
}

const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params
    const showData = await showModel.findById(showId)
    const occupiedSeats = Object.keys(showData.occupiedSeats || {})

    res.json({ success: true, occupiedSeats })
  } catch (err) {
    res.status(500).send({ success: false, message: err.message })
  }
}

module.exports = {
  createBooking,
  createPaymentSession,
  verifyPaymentSession,
  getOccupiedSeats,
}
