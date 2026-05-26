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
              <div className="flex items-center justify-between mb-10">

  <div>

    <h2 className="flex items-center gap-4 text-4xl md:text-5xl font-black tracking-tight">

      <span className="text-red-500 text-5xl">🎬</span>

      <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 bg-clip-text text-transparent">
        Active Movies
      </span>

    </h2>

    <p className="mt-4 text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl">
      Upcoming shows currently live in the theatre.
    </p>

  </div>

</div>
            </div>
            <a href="/admin/add-shows" className="primary-button primary-button--small">
              Add Show
              <ArrowRight size={14} />
            </a>
          </div>

<div className="relative rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 overflow-hidden">

  {/* Top Glow */}
  <div className="absolute top-0 left-1/3 w-[300px] h-[300px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>

  {/* Scrollable Container */}
  <div className="max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

      {dashboardData.activeShows.map((show) => (

       <article
          key={show._id}
          className="
            group
            overflow-hidden
            rounded-3xl
            bg-[#0B1020]
            border border-white/10
            hover:border-pink-500/30
            hover:-translate-y-2
            transition-all duration-500
            shadow-lg
            hover:shadow-[0_0_40px_rgba(236,72,153,0.15)]
            flex
            flex-col
          "
        >

          {/* Movie Image */}
          <div className="overflow-hidden">

            <img
              src={imageUrl(show.movie.backdrop_path)}
              alt={show.movie.title}
              className="
                w-full
                h-[220px]
                object-cover
                group-hover:scale-110
                transition duration-700
              "
            />

          </div>

          {/* Content */}
          <div className="flex flex-col justify-center gap-3 min-h-[100px]">

            {/* Title + Price */}
            <div className="flex flex-col gap-3">

              <div className="flex items-start justify-between gap-3">

                <p className="text-xl font-bold text-white line-clamp-2 leading-tight">
                  {show.movie.title}
                </p>

                <strong className="text-pink-400 text-xl font-black whitespace-nowrap">
                  {currency}{show.showPrice}
                </strong>

              </div>

            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-zinc-400 text-sm">

              <span className="flex items-center gap-2">

                <Star
                  size={16}
                  className="text-yellow-400"
                  fill="currentColor"
                />

                {show.movie.vote_average?.toFixed(1) ?? '4.5'}

              </span>

              <span className="truncate ml-3">
                {dateFormat(show.showDateTime)}
              </span>

            </div>

          </div>

        </article>

      ))}

    </div>

  </div>

</div>
        </section>
      )}
    </AdminShell>
  )
}

export default AdminDashboard
