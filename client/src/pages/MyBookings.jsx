import { dummyShowsData } from '../assets/assets'

const bookings = [
  {
    id: 'booking-1',
    movie: dummyShowsData[0],
    title: 'Alita Battle Angel 2024',
    duration: '2 hours 15 minutes',
    dateTime: '13th May 2025 - 5:00 PM',
    amount: 700,
    totalTickets: 2,
    seats: ['B12', 'B13'],
  },
  {
    id: 'booking-2',
    movie: dummyShowsData[0],
    title: 'Alita Battle Angel 2024',
    duration: '2 hours 15 minutes',
    dateTime: '13th May 2025 - 5:00 PM',
    amount: 700,
    totalTickets: 2,
    seats: ['B12', 'B13'],
  },
]

const MyBookings = () => {
  return (
    <main className="my-bookings-page">
      <section className="my-bookings-content">
        <h1>My Bookings</h1>

        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <img src={booking.movie.backdrop_path} alt={booking.title} />

              <div className="booking-card__details">
                <h2>{booking.title}</h2>
                <p>{booking.duration}</p>
                <time>{booking.dateTime}</time>
              </div>

              <div className="booking-card__summary">
                <strong>&#8377;{booking.amount}</strong>
                <div>
                  <p>Total Tickets: <b>{booking.totalTickets}</b></p>
                  <p>Seat Number: <b>{booking.seats.join(', ')}</b></p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default MyBookings
