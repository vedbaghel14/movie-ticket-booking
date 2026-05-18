import AdminShell from '../components/AdminShell'
import { dummyBookingData } from '../assets/assets'

const ListBookings = () => {
  return (
    <AdminShell title="List Bookings" subtitle="View all user reservations in one place.">
      <section className="admin-table-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Movie Name</th>
                <th>Show Time</th>
                <th>Seats</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dummyBookingData.map((booking, index) => (
                <tr key={`${booking._id}-${index}`}>
                  <td>{booking.user.name}</td>
                  <td>{booking.show.movie.title}</td>
                  <td>{new Date(booking.show.showDateTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}</td>
                  <td>{booking.bookedSeats.join(', ')}</td>
                  <td>${booking.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  )
}

export default ListBookings
