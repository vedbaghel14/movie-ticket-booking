import { useState, useEffect, useCallback } from 'react'
import AdminShell from '../components/AdminShell'
import { adminApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'
import '../listshows.css'

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

  <section className="relative rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6">

   <div className="relative rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 overflow-hidden">

          

            <div className="max-h-[700px] overflow-y-auto p-4 pr-3 custom-scrollbar rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111827] via-[#0B1120] to-[#09090F] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

  <table className="w-full border-separate border-spacing-y-10">

    {/* Header */}
    <thead className='h-10 '>

      <tr>

        <th className="
          sticky top-1 z-20
          bg-gradient-to-r from-[#111827] via-[#0B1120] to-[#111827]
          backdrop-blur-xl
          shadow-[0_15px_40px_rgba(0,0,0,0.45)]
          border-b border-white/10
          px-8 py-6
          text-left
          text-base
          uppercase
          tracking-[0.25em]
          text-pink-300
          font-black
        ">
          Movie Name
        </th>

        <th className="
          sticky top-1 z-20
          bg-gradient-to-r from-[#111827] via-[#0B1120] to-[#111827]
          backdrop-blur-xl
          shadow-[0_15px_40px_rgba(0,0,0,0.45)]
          border-b border-white/10
          px-8 py-6
          text-left
          text-base
          uppercase
          tracking-[0.25em]
          text-pink-300
          font-black
        ">
          Show Time
        </th>

        <th className="
          sticky top-1 z-20
          bg-gradient-to-r from-[#111827] via-[#0B1120] to-[#111827]
          backdrop-blur-xl
          shadow-[0_15px_40px_rgba(0,0,0,0.45)]
          border-b border-white/10
          px-8 py-6
          text-left
          text-base
          uppercase
          tracking-[0.25em]
          text-pink-300
          font-black
        ">
          Bookings
        </th>

        <th className="
          sticky top-1 z-20
          bg-gradient-to-r from-[#111827] via-[#0B1120] to-[#111827]
          backdrop-blur-xl
          shadow-[0_15px_40px_rgba(0,0,0,0.45)]
          border-b border-white/10
          px-8 py-6
          text-left
          text-base
          uppercase
          tracking-[0.25em]
          text-pink-300
          font-black
        ">
          Earnings
        </th>

      </tr>

    </thead>

    {/* Body */}
    <tbody>

      {shows.map((show) => {

        const bookingCount =
          Object.keys(show.occupiedSeats || {}).length

        const earnings =
          show.showPrice * Math.max(1, bookingCount)

        return (

          <tr
            key={show._id}
            className="
              bg-white/[0.04]
              hover:bg-white/[0.07]
              transition-all
              duration-500
              hover:-translate-y-1
              hover:shadow-[0_0_35px_rgba(236,72,153,0.12)]
            "
          >

            {/* Movie */}
            <td className="px-8 py-10 ">

              <div>

                <p className="
                  font-black
                  text-2xl
                  text-white
                  leading-tight
                ">
                  {show.movie?.title}
                </p>

                <div className="
                  mt-3
                  pt-3
                  border-t border-white/5
                ">

                  <p className="
                    text-zinc-400
                    text-base
                  ">
                    Premium Movie Screening
                  </p>

                </div>

              </div>

            </td>

            {/* Time */}
            <td className="px-8 py-10">

              <div>

                <p className="
                  font-bold
                  text-xl
                  text-white
                ">
                  {new Date(show.showDateTime).toLocaleString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }
                  )}
                </p>

                <div className="
                  mt-3
                  pt-3
                  border-t border-white/5
                ">

                  <p className="
                    text-zinc-500
                    text-base
                  ">
                    Scheduled Showtime
                  </p>

                </div>

              </div>

            </td>

            {/* Bookings */}
            <td className="px-8 py-10">

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-full
                  bg-pink-500/15
                  text-pink-300
                  text-base
                  font-black
                  border border-pink-500/20
                "
              >
                🎟️ {bookingCount} Bookings
              </span>

            </td>

            {/* Earnings */}
            <td className="px-8 py-10 h-30 flex justify-center items-center ">

              <span
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-full
                  bg-emerald-500/15
                  text-emerald-300
                  text-base
                  font-black
                  border border-emerald-500/20
                "
              >
                💰 ${earnings}
              </span>

            </td>

          </tr>

        )

      })}

    </tbody>

  </table>

</div>
          </div>

      

  

  </section>

) : (

  <div className="flex flex-col items-center justify-center min-h-[300px] text-center rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">

    <div className="text-6xl mb-5">
      🎬
    </div>

    <h2 className="text-3xl font-black text-white mb-3">
      No Shows Available
    </h2>

    <p className="text-zinc-400 text-lg max-w-md">
      Add new screenings from the Add Shows page to start managing movie performances.
    </p>

  </div>

)}
    </AdminShell>
  )
}

export default ListShows
