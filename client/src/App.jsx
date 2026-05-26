import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Theatres from './pages/Theatres'
import Releases from './pages/Releases'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import AddShows from './pages/AddShows'
import ListShows from './pages/ListShows'
import ListBookings from './pages/ListBookings'
import {Toaster} from 'react-hot-toast'
import Favourite from './pages/Favourite'
import { useLocation } from 'react-router-dom'
import { useAppContext } from './context/Appcontext'
import { SignIn } from '@clerk/react'
import { useEffect } from 'react'

const App = () => {


  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const {user} = useAppContext()
  
//   const {pathname} = useLocation()

//   useEffect(() => {

//    if (pathname === "/movies") {
//     window.scrollTo(0, 121)
//   }

// }, [pathname])


  return (
    <>
      <Toaster />
      {isAdminRoute ? null : <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/theatres' element={<Theatres />} />
        <Route path='/releases' element={<Releases />} />
        <Route path='/movie/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/favourite' element={<Favourite />} />
        <Route path='/admin/*' element={!user ? (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin/dashboard'} />
          </div>
        ) : (
          <Navigate to='/admin/dashboard' replace />
        )} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/add-shows' element={<AddShows />} />
        <Route path='/admin/list-shows' element={<ListShows />} />
        <Route path='/admin/list-bookings' element={<ListBookings />} />
      </Routes>
      {isAdminRoute ? null : <Footer />}
    </>
  )
}

export default App
