import { useState } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import AdminShell from '../components/AdminShell'
import { dummyShowsData } from '../assets/assets'

const AddShows = () => {
  const [showPrice, setShowPrice] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [selectedTimes, setSelectedTimes] = useState([])

  const handleAddTime = () => {
    if (dateTime && !selectedTimes.includes(dateTime)) {
      setSelectedTimes((current) => [...current, dateTime])
      setDateTime('')
    }
  }

  const removeTime = (time) => {
    setSelectedTimes((current) => current.filter((item) => item !== time))
  }

  return (
    <AdminShell title="Add Shows" subtitle="Create new screenings for existing movies.">
      <section className="admin-add-shows">
        <div className="admin-movie-cards">
          {dummyShowsData.slice(0, 4).map((movie) => (
            <article key={movie._id} className="admin-show-card admin-show-card--small">
              <img src={movie.backdrop_path} alt={movie.title} />
              <div>
                <p>{movie.title}</p>
                <span>{movie.genres.slice(0, 2).map((genre) => genre.name).join(', ')}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="admin-show-form">
          <label htmlFor="show-price">Show Price</label>
          <input
            id="show-price"
            type="number"
            placeholder="$ Enter show price"
            value={showPrice}
            onChange={(event) => setShowPrice(event.target.value)}
          />

          <label htmlFor="show-date-time">Select Date and Time</label>
          <div className="datetime-row">
            <input
              id="show-date-time"
              type="datetime-local"
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
            />
            <button className="primary-button primary-button--small" type="button" onClick={handleAddTime}>
              Add Time
            </button>
          </div>

          <div className="selected-times">
            <p>Selected Date-Time</p>
            {selectedTimes.length ? (
              <div className="selected-times__list">
                {selectedTimes.map((time) => (
                  <span key={time} className="selected-time-pill">
                    {new Date(time).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    <button type="button" onClick={() => removeTime(time)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="admin-form__hint">No times selected yet.</p>
            )}
          </div>

          <button className="primary-button" type="button">
            Add Show
          </button>
        </div>
      </section>
    </AdminShell>
  )
}

export default AddShows
