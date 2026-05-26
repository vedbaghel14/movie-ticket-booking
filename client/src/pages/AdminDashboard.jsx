import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Star, Users, Wallet, Film } from 'lucide-react'
import AdminShell from '../components/AdminShell'
import { dateFormat } from '../lib/dateFormat'
import { adminApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'
import { imageUrl } from '../lib/imageUrl'

// ---------------------------------------------------------------------------
// Dashboard cards configuration
// ---------------------------------------------------------------------------

const CARD_ICONS = {
  totalBookings: <Users size={18} />,
  totalRevenue: <Wallet size={18} />,
  activeMovies: <Film size={18} />,
  totalUser: <Star size={18} />,
}

const CARD_LABELS = {
  totalBookings: 'Total Bookings',
  totalRevenue: 'Total Revenue',
  activeMovies: 'Active Movies',
  totalUser: 'Total Users',
}

// ---------------------------------------------------------------------------
// AdminDashboard component
// ---------------------------------------------------------------------------

const AdminDashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL ?? '$'
  const { getToken, refreshKey } = useAppContext()

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUser: 0,
    activeShows: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const dashboardCards = [
    { title: CARD_LABELS.totalBookings, value: dashboardData.totalBookings, icon: CARD_ICONS.totalBookings },
    { title: CARD_LABELS.totalRevenue, value: `${currency}${dashboardData.totalRevenue}`, icon: CARD_ICONS.totalRevenue },
    { title: CARD_LABELS.activeMovies, value: dashboardData.activeShows.length, icon: CARD_ICONS.activeMovies },
    { title: CARD_LABELS.totalUser, value: dashboardData.totalUser, icon: CARD_ICONS.totalUser },
  ]

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await adminApi.getDashboard(token)
      if (res.success) {
        setDashboardData(res.dashboardData)
      } else {
        setError(res.message || 'Failed to load dashboard data.')
      }
    } catch (err) {
      console.warn('[AdminDashboard] Backend unreachable.', err.message)
      setError('Could not connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard, refreshKey])

  if (loading) {
    return (
      <AdminShell title="Dashboard">
        <div className="dashboard-loading">
          <p>Loading dashboard...</p>
        </div>
      </AdminShell>
    )
  }

  if (error) {
    return (
      <AdminShell title="Dashboard">
        <div className="admin-empty-state">
          <p>{error}</p>
          <button className="primary-button primary-button--small" type="button" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Dashboard">
      {/* ---- stat cards ---- */}
      <div className="dashboard-top-cards">
        {dashboardCards.map((card, idx) => (
          <article key={idx} className="dashboard-card">
            <span className="dashboard-card__icon">{card.icon}</span>
            <p>{card.title}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      {/* ---- active shows section ---- */}
      {dashboardData.activeShows.length > 0 && (
        <section className="admin-section">
          <div className="section-header admin-section-header">
            <div>
              <h2>Active Movies</h2>
              <p>Upcoming shows currently live in the theatre.</p>
            </div>
            <a href="/admin/add-shows" className="primary-button primary-button--small">
              Add Show
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="admin-show-grid">
            {dashboardData.activeShows.slice(0, 3).map((show) => (
              <article key={show._id} className="admin-show-card">
                <img src={imageUrl(show.movie.backdrop_path)} alt={show.movie.title} />
                <div className="admin-show-card__body">
                  <p>{show.movie.title}</p>
                  <strong>{currency}{show.showPrice}</strong>
                  <div className="admin-show-card__meta">
                    <span><Star size={14} /> {show.movie.vote_average?.toFixed(1) ?? '4.5'}</span>
                    <span>{dateFormat(show.showDateTime)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </AdminShell>
  )
}

export default AdminDashboard
