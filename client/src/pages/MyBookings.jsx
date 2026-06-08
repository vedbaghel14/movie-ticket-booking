import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { dateFormat } from '../lib/dateFormat'
import { bookingApi, userApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'
import { imageUrl } from '../lib/imageUrl'
import Loading from '../components/Loading'

function timeFormat(runtime) {
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const MyBookings = () => {
  const currency = '$'
  const { getToken } = useAppContext()
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [payingBookingId, setPayingBookingId] = useState(null)
  const [error, setError] = useState(null)

  const getMyBookings = async () => {
    try {
      const token = await getToken()
      const res = await userApi.getBookings(token)
      if (res.success) {
        setBookings(res.bookings)
      } else {
        setBookings([])
      }
    } catch (err) {
      console.warn('[MyBookings] Backend unreachable.', err.message)
      setError('Could not load your bookings. Please try again later.')
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const verifySession = async (sessionId) => {
    try {
      const token = await getToken()
      await bookingApi.verifySession(sessionId, token)
      toast.success('Payment confirmed!')
      getMyBookings()
      window.history.replaceState(null, '', window.location.pathname)
    } catch (err) {
      console.error('[MyBookings] verifySession failed:', err)
      toast.error(err.message || 'Could not verify payment.')
    }
  }

  const handlePayNow = async (bookingId) => {
    try {
      setPayingBookingId(bookingId)
      setIsPaying(true)
      const token = await getToken()
      const data = await bookingApi.pay(bookingId, token)
      if (data?.success && data?.url) {
        window.location.href = data.url
        return
      }
      throw new Error('Could not create payment session')
    } catch (err) {
      console.error('[MyBookings] Payment retry failed:', err)
      toast.error(err.message || 'Could not start payment. Please try again.')
    } finally {
      setIsPaying(false)
      setPayingBookingId(null)
    }
  }

  useEffect(() => {
    getMyBookings()
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      verifySession(sessionId)
    }
  }, [location.search])

  if (isLoading) {
    return (
      <Loading text="🎟️ Loading Your Bookings..." subtitle="Fetching your reservations, please wait." />
    )
  }

  if (error) {
    return (
      <main className="my-bookings-page">
        <section className="my-bookings-content">
          <h1>My Bookings</h1>
          <p style={{ textAlign: 'center', padding: '40px 0' }}>{error}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="my-bookings-page">
      <section className="my-bookings-content">
        <h1>My Bookings</h1>
        {bookings.length > 0 ? (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-card" key={booking._id}>
                <img src={imageUrl(booking.show?.movie?.poster_path || booking.show?.movie?.backdrop_path)} alt={booking.show?.movie?.title} />
                <div className="booking-card__details">
                  <h2>{booking.show?.movie?.title}</h2>
                  <p>{booking.show?.movie?.runtime ? timeFormat(booking.show.movie.runtime) : ''}</p>
                  <time>{dateFormat(booking.show?.showDateTime)}</time>
                </div>
                <div className="booking-card__summary">
                  <strong>{currency}{booking.amount}</strong>
                  {booking.isPaid ? (
                    <span className="badge badge--success">Paid</span>
                  ) : (
                    <button
                      className="primary-button primary-button--small"
                      onClick={() => handlePayNow(booking._id)}
                      disabled={isPaying && payingBookingId === booking._id}
                    >
                      {isPaying && payingBookingId === booking._id ? 'Redirecting...' : 'Pay Now'}
                    </button>
                  )}
                  <div>
                    <p>Total Tickets: <b>{booking.bookedSeats?.length}</b></p>
                    <p>Seat Number: <b>{booking.bookedSeats?.join(', ')}</b></p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '40px 0' }}>No bookings yet.</p>
        )}
      </section>
    </main>
  )
}

export default MyBookings
