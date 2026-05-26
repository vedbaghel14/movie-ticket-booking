import { ArrowRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { showApi, bookingApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'

const leftRows = ['C', 'D', 'E', 'F', 'G']

const Seat = ({ id, isSelected, isBooked, onToggle }) => {
  return (
    <button
      type="button"
      disabled={isBooked}
      className={`seat-button${isSelected ? ' is-selected' : ''}${isBooked ? ' is-booked' : ''}`}
      aria-label={`Seat ${id}`}
      onClick={onToggle}
    >
      {id}
    </button>
  )
}

const SeatRow = ({ row, start, end, showLabel = true, selectedSeats, occupiedSeats, onToggleSeat }) => {
  const seats = Array.from({ length: end - start + 1 }, (_, index) => start + index)
  return (
    <div className="seat-row">
      {showLabel && <span className="seat-row__label">{row}</span>}
      {seats.map((seat) => {
        const seatId = `${row}${seat}`
        return (
          <Seat
            key={seatId}
            id={seatId}
            isSelected={selectedSeats.includes(seatId)}
            isBooked={occupiedSeats.includes(seatId)}
            onToggle={() => onToggleSeat(seatId)}
          />
        )
      })}
    </div>
  )
}

const SeatNumbers = ({ start, end, showSpacer = true, indent }) => {
  const numbers = Array.from({ length: end - start + 1 }, (_, index) => start + index)
  const shouldShowSpacer = indent ?? showSpacer
  return (
    <div className="seat-row seat-row--numbers">
      {shouldShowSpacer && <div className="seat-number-spacer" />}
      {numbers.map((number) => (
        <span key={number} className="seat-number">{number}</span>
      ))}
    </div>
  )
}

const SeatLayout = () => {
  const { id, date } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAppContext()

  const [movie, setMovie] = useState(null)
  const [showIdsByTime, setShowIdsByTime] = useState({})
  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedShowId, setSelectedShowId] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ---- fetch show details for this movie/date ----
  useEffect(() => {
    let cancelled = false
    const fetchShow = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await showApi.getSingle(id)
        if (!cancelled) {
          if (data.success && data.movie) {
            setMovie(data.movie)
            const dateSlots = data.dateTime ? (data.dateTime[date] || []) : []
            const times = []
            const idMap = {}
            dateSlots.forEach((slot) => {
              const timeStr = new Date(slot.time).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: false,
              })
              times.push(timeStr)
              idMap[timeStr] = slot.showid || slot.showId
            })
            setAvailableTimes(times)
            setShowIdsByTime(idMap)
          } else {
            setError('Movie not found or no active shows for this date.')
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[SeatLayout] Backend unreachable.', err.message)
          setError('Could not load show details. Please try again later.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchShow()
    return () => { cancelled = true }
  }, [id, date])

  // ---- fetch occupied seats when a time is selected ----
  useEffect(() => {
    if (!selectedTime) return
    const showId = showIdsByTime[selectedTime]
    if (!showId) return
    setSelectedShowId(showId)

    const fetchSeats = async () => {
      try {
        const data = await bookingApi.getOccupiedSeats(showId)
        if (data.success) {
          setOccupiedSeats(data.occupiedSeats || [])
        }
      } catch (err) {
        console.warn('[SeatLayout] Could not fetch occupied seats.', err.message)
      }
    }
    fetchSeats()
  }, [selectedTime, showIdsByTime])

  // Reset on date / time change
  useEffect(() => {
    setSelectedTime(null)
    setSelectedSeats([])
    setOccupiedSeats([])
    setSelectedShowId(null)
  }, [date])

  useEffect(() => {
    setSelectedSeats([])
  }, [selectedTime])

  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) return
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    )
  }

  const handleCheckout = async () => {
    if (selectedTime === null) {
      toast.error('Please select a timing')
      return
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    if (!selectedShowId) {
      toast.error('Show not found. Please try selecting a time again.')
      return
    }

    setSubmitting(true)
    try {
      const token = await getToken()
      await bookingApi.create({ showId: selectedShowId, selectedSeats }, token)
      toast.success('Booking successful!')
      window.scrollTo(0, 0)
      navigate('/my-bookings')
    } catch (err) {
      console.error('[SeatLayout] Booking failed:', err)
      toast.error(err.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="seat-layout-page">
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading seat layout…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="seat-layout-page">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Show Unavailable</h2>
            <p className="mb-6">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="seat-layout-page">
      <aside className="timing-panel">
        <h2>Available Timings</h2>
        <div className="timing-list">
          {availableTimes.length > 0 ? (
            availableTimes.map((time, index) => (
              <button
                key={`${time}-${index}`}
                type="button"
                className={`timing-button${time === selectedTime ? ' is-active' : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                <Clock size={16} />
                {time}
              </button>
            ))
          ) : (
            <p>No timings available for this date.</p>
          )}
        </div>
      </aside>

      <section className="seat-selection">
        <h1>{movie ? `Select seats for ${movie.title}` : 'Select Your Seat'}</h1>

        <div className="screen-wrap">
          <div className="screen-arc" />
          <p>SCREEN SIDE</p>
        </div>

        <div className="seat-map-scroll scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="seat-map">
            <div className="premium-rows">
              <div className="seat-row seat-row--compact">
                <span className="seat-row__label">A</span>
                {Array.from({ length: 9 }, (_, index) => {
                  const seatId = `A${index + 1}`
                  return (
                    <Seat
                      key={seatId}
                      id={seatId}
                      isSelected={selectedSeats.includes(seatId)}
                      isBooked={occupiedSeats.includes(seatId)}
                      onToggle={() => toggleSeat(seatId)}
                    />
                  )
                })}
              </div>
              <div className="seat-row seat-row--compact">
                <span className="seat-row__label">B</span>
                {Array.from({ length: 9 }, (_, index) => {
                  const seatId = `B${index + 1}`
                  return (
                    <Seat
                      key={seatId}
                      id={seatId}
                      isSelected={selectedSeats.includes(seatId)}
                      isBooked={occupiedSeats.includes(seatId)}
                      onToggle={() => toggleSeat(seatId)}
                    />
                  )
                })}
              </div>
              <SeatNumbers start={1} end={9} indent />
            </div>

            <div className="standard-rows">
              <div className="standard-rows__labels"> </div>
              <div className="standard-rows__block">
                {leftRows.map((row) => (
                  <SeatRow
                    key={`${row}-left`}
                    row={row}
                    start={1}
                    end={9}
                    showLabel
                    selectedSeats={selectedSeats}
                    occupiedSeats={occupiedSeats}
                    onToggleSeat={toggleSeat}
                  />
                ))}
                <SeatNumbers start={1} end={9} />
              </div>
              <div className="standard-rows__block">
                {leftRows.map((row) => (
                  <SeatRow
                    key={`${row}-right`}
                    row={row}
                    start={10}
                    end={18}
                    showLabel={false}
                    selectedSeats={selectedSeats}
                    occupiedSeats={occupiedSeats}
                    onToggleSeat={toggleSeat}
                  />
                ))}
                <SeatNumbers showSpacer={false} start={10} end={18} />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="primary-button checkout-button"
          onClick={handleCheckout}
          disabled={submitting}
        >
          {submitting ? 'Booking...' : (
            <>Proceed to checkout<ArrowRight size={18} /></>
          )}
        </button>
      </section>
    </main>
  )
}

export default SeatLayout
