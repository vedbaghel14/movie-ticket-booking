import { useState, useEffect, useCallback } from 'react'
import AdminShell from '../components/AdminShell'
import { adminApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'

const ListBookings = () => {
  const { getToken, refreshKey } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await adminApi.getBookings(token)
      if (res.success) {
        setBookings(res.bookings)
      } else {
        setError(res.message || 'Failed to load bookings.')
      }
    } catch (err) {
      console.warn('[ListBookings] Backend unreachable.', err.message)
      setError('Could not connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings, refreshKey])

  if (loading) return <AdminShell title="List Bookings"><p className="admin-form__hint">Loading bookings…</p></AdminShell>

  if (error) {
    return (
      <AdminShell title="List Bookings">
        <div className="admin-empty-state">
          <p>{error}</p>
          <button className="primary-button primary-button--small" type="button" onClick={fetchBookings}>
            Retry
          </button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="List Bookings" subtitle="View all user reservations in one place.">
      {bookings.length > 0 ? (
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
                {bookings.map((booking, index) => (
                  <tr key={`${booking._id}-${index}`}>
                    <td>{booking.user?.name || booking.user?.fullName || booking.user?.emailAddresses?.[0]?.emailAddress || 'User'}</td>
                    <td>{booking.show?.movie?.title}</td>
                    <td>{new Date(booking.show?.showDateTime).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}</td>
                    <td>{booking.bookedSeats?.join(', ')}</td>
                    <td>${booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="admin-empty-state">
          <p>No bookings found.</p>
        </div>
      )}
    </AdminShell>
  )
}

export default ListBookings
