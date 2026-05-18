import { ArrowRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const leftRows = ['C', 'D', 'E', 'F', 'G']
const bookedSeats = ['A2', 'B4', 'D11']



const Seat = ({ id, isSelected, isBooked, onToggle }) => {
  return (
    <button
      type="button"
      disabled={isBooked}
      className={`
        seat-button
        ${isSelected ? ' is-selected' : ''}
        ${isBooked ? ' is-booked' : ''}
      `}
      aria-label={`Seat ${id}`}
      onClick={onToggle}
    >
      {id}
    </button>
  )
}

const SeatRow = ({ row, start, end, showLabel=true, selectedSeats, onToggleSeat }) => {
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
            isBooked={bookedSeats.includes(seatId)}
            onToggle={() => onToggleSeat(seatId)}
          />
        )
      })}
    </div>
  )
}

const SeatNumbers = ({ start, end, showSpacer = true, indent }) => {

  const numbers = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index
  )

  const shouldShowSpacer = indent ?? showSpacer

  return (
    <div className="seat-row seat-row--numbers">

      {shouldShowSpacer && (
        <div className="seat-number-spacer" />
      )}

      {numbers.map((number) => (
        <span
          key={number}
          className="seat-number"
        >
          {number}
        </span>
      ))}
    </div>
  )
}

const SeatLayout = () => {
  const { id, date } = useParams()
  const show = dummyShowsData.find((movie) => movie._id === id)
  const availableTimes = dummyDateTimeData[date] || []
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const navigate = useNavigate()


  useEffect(() => {
    setSelectedTime(null)
    setSelectedSeats([])
  }, [date])

  useEffect(() => {
  setSelectedSeats([])
}, [selectedTime])

const handleCheckout = () => {
  if (selectedTime === null) {
   toast.error('Please select a timing')
    return
  }

  if (selectedSeats.length === 0) {
    toast.error('Please select at least one seat')
    return
  }
  toast.success('seat selection successful')
  window.scrollTo(0, 0)
  navigate('/my-bookings')
  console.log(selectedSeats)
}

  const timings = availableTimes.length
    ? availableTimes.map((slot) => new Date(slot.time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }))
    : ['06:30', '09:30', '12:00', '16:30', '20:00']

const toggleSeat = (seatId) => {

  if (bookedSeats.includes(seatId)) return

  setSelectedSeats((prev) => {
    if (prev.includes(seatId)) {
      return prev.filter((seat) => seat !== seatId)
    }

    return [...prev, seatId]
  })
}

  return (
    <main className="seat-layout-page">
      <aside className="timing-panel">
        <h2>Available Timings</h2>

        <div className="timing-list">
          {timings.map((time, index) => (
            <button
              key={`${time}-${index}`}
              type="button"
              className={`timing-button${index === selectedTime ? ' is-active' : ''}`}
              onClick={() => setSelectedTime(index)}
            >
              <Clock size={16} />
              {time}
            </button>
          ))}
        </div>
      </aside>

      <section className="seat-selection">
        <h1>{show ? `Select seats for ${show.title}` : 'Select Your Seat'}</h1>

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
                      isBooked={bookedSeats.includes(seatId)}
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
                      isBooked={bookedSeats.includes(seatId)}
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
                    onToggleSeat={toggleSeat}
                  />
                ))}
              
                <SeatNumbers  showSpacer={false} start={10} end={18} />
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="primary-button checkout-button" onClick={handleCheckout}>
          Proceed to checkout
          <ArrowRight size={18} />
        </button>
      </section>
    </main>
  )
}

export default SeatLayout
