import { ArrowRight, Star, Users, Wallet, Film } from 'lucide-react'
import AdminShell from '../components/AdminShell'
import { dummyDashboardData } from '../assets/assets'

const AdminDashboard = () => {
  const { totalBookings, totalRevenue, totalUser, activeShows } = dummyDashboardData

  return (
    <AdminShell title="Dashboard">
      <div className="dashboard-top-cards">
        <article className="dashboard-card">
          <span className="dashboard-card__icon"><Users size={18} /></span>
          <p>Total Bookings</p>
          <strong>{totalBookings}</strong>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-card__icon"><Wallet size={18} /></span>
          <p>Total Revenue</p>
          <strong>${totalRevenue}</strong>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-card__icon"><Film size={18} /></span>
          <p>Active Movies</p>
          <strong>{activeShows.length}</strong>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-card__icon"><Star size={18} /></span>
          <p>Total Users</p>
          <strong>{totalUser}</strong>
        </article>
      </div>

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
          {activeShows.slice(0, 3).map((show) => (
            <article key={show._id} className="admin-show-card">
              <img src={show.movie.backdrop_path} alt={show.movie.title} />
              <div className="admin-show-card__body">
                <p>{show.movie.title}</p>
                <strong>${show.showPrice}</strong>
                <div className="admin-show-card__meta">
                  <span>
                    <Star size={14} /> 4.5
                  </span>
                  <span>{new Date(show.showDateTime).getFullYear()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  )
}

export default AdminDashboard
