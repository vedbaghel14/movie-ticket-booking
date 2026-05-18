import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const adminNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Add Shows', to: '/admin/add-shows' },
  { label: 'List Shows', to: '/admin/list-shows' },
  { label: 'List Bookings', to: '/admin/list-bookings' },
]

const AdminShell = ({ title, subtitle, children }) => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
        </div>

        <div className="admin-sidebar__profile">
          <img src={assets.profile} alt="Richard Sanford" />
          <div>
            <strong>Richard Sanford</strong>
            <p>Administrator</p>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-sidebar__link${isActive ? ' is-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">Admin Dashboard</p>
            <h1>{title}</h1>
          </div>
          {subtitle && <p className="admin-header__subtitle">{subtitle}</p>}
        </header>

        <section className="admin-body">{children}</section>
      </div>
    </div>
  )
}

export default AdminShell
