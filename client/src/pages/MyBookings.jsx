import { dummyBookingData, dummyShowsData } from '../assets/assets'
import { dateFormat } from '../lib/dateFormat';
import { useEffect, useState } from 'react';

function timeFormat(runtime) {
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

const MyBookings = () => {
    const currency = '$';
    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const getMyBookings = async () => {
      setBookings(dummyBookingData)
      setIsLoading(false)
    }

    useEffect(() => {
      getMyBookings()
    }, [])

  return !isLoading ? (
    <main className="my-bookings-page">
      <section className="my-bookings-content">
        <h1>My Bookings</h1>

        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <img src={booking.show.movie.poster_path} alt={booking.title} />

              <div className="booking-card__details">
                <h2>{booking.show.movie.title}</h2>
                <p>{timeFormat(booking.show.movie.runtime)}</p>
                <time>{dateFormat(booking.show.showDateTime)}</time>
              </div>

              <div className="booking-card__summary">
                <strong>{currency}{booking.amount}</strong>
                {booking.isPaid ? null : (
                  <button className="primary-button primary-button--small">Pay Now</button>
                )}
                <div>
                  <p>Total Tickets: <b>{booking.bookedSeats.length}</b></p>
                  <p>Seat Number: <b>{booking.bookedSeats.join(', ')}</b></p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  ) :  <div className="loader text-center mt-10 font-weight-bold h-">Loading...</div>
}

export default MyBookings
