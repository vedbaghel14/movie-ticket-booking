import { useState, useEffect } from 'react'
import { dateFormat } from '../lib/dateFormat'
import { userApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'
import { imageUrl } from '../lib/imageUrl'

function timeFormat(runtime) {
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const MyBookings = () => {
  const currency = '$'
  const { getToken } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    getMyBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="loader text-center mt-10 font-weight-bold">Loading your bookings…</div>
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
                  {booking.isPaid ? null : (
                    <button className="primary-button primary-button--small">Pay Now</button>
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
