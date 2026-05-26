import { useState, useEffect, useCallback } from 'react'
import AdminShell from '../components/AdminShell'
import { adminApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'

const ListShows = () => {
  const { getToken, refreshKey } = useAppContext()
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchShows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await adminApi.getShows(token)
      if (res.success) {
        setShows(res.shows)
      } else {
        setError(res.message || 'Failed to load shows.')
      }
    } catch (err) {
      console.warn('[ListShows] Backend unreachable.', err.message)
      setError('Could not connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchShows()
  }, [fetchShows, refreshKey])

  if (loading) return <AdminShell title="List Shows"><p className="admin-form__hint">Loading shows…</p></AdminShell>

  if (error) {
    return (
      <AdminShell title="List Shows">
        <div className="admin-empty-state">
          <p>{error}</p>
          <button className="primary-button primary-button--small" type="button" onClick={fetchShows}>
            Retry
          </button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="List Shows" subtitle="Review current showtimes and performance.">
      {shows.length > 0 ? (
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
                {shows.map((show) => {
                  const bookingCount = Object.keys(show.occupiedSeats || {}).length
                  return (
                    <tr key={show._id}>
                      <td>{show.movie?.title}</td>
                      <td>{new Date(show.showDateTime).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
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
      ) : (
        <div className="admin-empty-state">
          <p>No shows available. Add some from the Add Shows page.</p>
        </div>
      )}
    </AdminShell>
  )
}

export default ListShows
