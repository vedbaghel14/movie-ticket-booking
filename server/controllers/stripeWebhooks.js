const stripePkg = require('stripe')
const bookingModel = require('../models/booking.model')

/**
 * Stripe webhook handler
 * - Verifies the signature using STRIPE_WEBHOOK_SECRET
 * - Handles `checkout.session.completed` and marks booking as paid
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  const rawBody = req.body
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET env var')
    return res.status(500).send('Webhook not configured')
  }

  let event
  try {
    const stripe = new stripePkg(process.env.STRIPE_SECRET_KEY)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('⚠️  Stripe webhook signature verification failed.', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const bookingId = session.metadata?.bookingId
        if (bookingId) {
          const booking = await bookingModel.findById(bookingId)
          if (booking && !booking.isPaid) {
            booking.isPaid = true
            booking.checkoutSessionId = session.id
            await booking.save()
            console.log(`Booking ${bookingId} marked paid via webhook.`)
          }
        }
        break
      }

      // Add other event types you want to handle here
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Error processing webhook event', err)
    return res.status(500).send('Server error')
  }
}

module.exports = {
  handleWebhook,
}
