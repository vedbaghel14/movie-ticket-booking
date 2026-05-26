import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import BackgroundGlow from './BackgroundGlow'

const adminNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Add Shows', to: '/admin/add-shows' },
  { label: 'List Shows', to: '/admin/list-shows' },
  { label: 'List Bookings', to: '/admin/list-bookings' },
]

const AdminShell = ({ title, subtitle, children }) => {
  return (
    <div className="admin-shell">

       <BackgroundGlow />


      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
        </div>

        <div className="admin-sidebar__profile">
          <img src={assets.profile} alt="Richard Sanford" className="relative w-20 h-20 rounded-full border-2 border-pink-500 object-cover" />
          <div>
            <strong className="block text-2xl font-bold text-white">Richard Sanford</strong>
            <p className="font-bold">Administrator</p>
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
          <div className="mb-10 flex flex-col gap-5">

            <p className="text-sm uppercase tracking-[0.4em] text-pink-500 font-bold mb-3 ">
              ADMIN DASHBOARD
            </p>

            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-pink-200 to-pink-500 bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>

          </div>
          {subtitle && <p className="admin-header__subtitle">{subtitle}</p>}
        </header>

        <section className="admin-body">{children}</section>
      </div>
    </div>
  )
}

export default AdminShell
