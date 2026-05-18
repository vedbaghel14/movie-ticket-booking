import AdminShell from '../components/AdminShell'
import { dummyDashboardData } from '../assets/assets'

const ListShows = () => {
  const { activeShows } = dummyDashboardData

  return (
    <AdminShell title="List Shows" subtitle="Review current showtimes and performance.">
      <section className="admin-table-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Movie Name</th>
                <th>Show Time</th>
                <th>Total Booking</th>
                <th>Earning</th>
              </tr>
            </thead>
            <tbody>
              {activeShows.map((show) => {
                const bookingCount = Object.keys(show.occupiedSeats).length
                return (
                  <tr key={show._id}>
                    <td>{show.movie.title}</td>
                    <td>{new Date(show.showDateTime).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}</td>
                    <td>{bookingCount}</td>
                    <td>${show.showPrice * Math.max(1, bookingCount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  )
}

export default ListShows
