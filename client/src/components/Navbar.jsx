import { MenuIcon, Search, TicketPlus, User, XIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useState,useEffect } from 'react'
import { useClerk, UserButton, useUser } from '@clerk/react'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: 'Theatres', to: '/theatres' },
  { label: 'Releases', to: '/releases' },
  { label: 'Favourite', to: '/favourite' }
]

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false)
  const {user} = useUser()
  const {openSignIn} = useClerk()

  const navigate = useNavigate()
  const [showNavbar, setShowNavbar] = useState(true)

useEffect(() => {
  let lastScrollY = window.scrollY

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // scrolling down
      setShowNavbar(false)
    } else {
      // scrolling up
      setShowNavbar(true)
    }

    lastScrollY = window.scrollY
  }

  window.addEventListener("scroll", handleScroll)

  return () => window.removeEventListener("scroll", handleScroll)
}, [])

  return (
    <header className={`site-navbar ${showNavbar ? "show" : "hide"}`}>
      <NavLink to="/" className="site-navbar__logo" aria-label="QuickShow home">
        <img src={assets.logo} alt="QuickShow" />
      </NavLink>

     <nav
  className={`
    ${
      isOpen
        ? 'h-[100vh] w-[100vw] absolute left-[-16px] top-[-10px] bg-black/80 backdrop-blur-md text-white flex flex-col items-center justify-center z-50 transition-all duration-300'
        : 'hidden'
    }
    md:flex md:static md:bg-transparent md:text-inherit
  `}
  aria-label="Primary navigation"
>
  {isOpen && (
    <XIcon
      className="md:hidden absolute top-4 right-4 w-10 h-10 cursor-pointer"
      onClick={() => setIsOpen(false)}
    />
  )}     
        {navItems.map((item) => (
          <NavLink
            onClick={()=>{window.scrollTo(0,0); setIsOpen(false)}}
            key={item.to}
            to={item.to}
            className={({ isActive }) => `site-navbar__link${isActive ? ' is-active' : ''} ${isOpen ? 'text-2xl' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="site-navbar__actions">
        <button className="icon-button" type="button" aria-label="Search">
          <Search size={20} /> 
        </button>
        {
          !user ? (
             <button onClick={openSignIn} className="primary-button primary-button--login" type="button"> Log In </button>
          ) : (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label={"My Bookings"} labelIcon={<TicketPlus width={15} />} onClick={()=> navigate('/my-bookings')}/>
              </UserButton.MenuItems>
            </UserButton>
          )
        }
       
      </div>
      <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer absolute right-0 top-20' onClick={()=>{setIsOpen(!isOpen)}}/>
    </header>
  )
}

export default Navbar
