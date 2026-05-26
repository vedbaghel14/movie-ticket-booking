import { useState, useEffect, useCallback } from 'react'
import { Star, Check, X, Plus, Loader2 } from 'lucide-react'
import AdminShell from '../components/AdminShell'
import { dummyShowsData } from '../assets/assets'
import { kConverter } from '../lib/kConverter'
import { adminApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'
import { imageUrl } from '../lib/imageUrl'

// ---------------------------------------------------------------------------
// AddShows — admin page for creating new screenings
// ---------------------------------------------------------------------------

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL ?? '$'
  const { getToken, triggerRefresh } = useAppContext()

  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showPrice, setShowPrice] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [dateTimeSelection, setDateTimeSelection] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)

  // ---- fetch now-playing movies from TMDB via backend ----
  const fetchNowPlayingMovies = useCallback(async () => {
    setLoadingMovies(true)
    try {
      const token = await getToken()
      const res = await adminApi.getNowPlayingMovies(token)
      if (res.success) {
        setNowPlayingMovies(res.movies)
      }
    } catch (err) {
      console.warn('[AddShows] Backend unreachable, using dummy movies.', err.message)
      setNowPlayingMovies(dummyShowsData)
    } finally {
      setLoadingMovies(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchNowPlayingMovies()
  }, [fetchNowPlayingMovies])

  // ---- movie selection ----
  const handleSelectMovie = (movie) => {
    setSelectedMovie((prev) => (prev?._id === movie._id ? null : movie))
  }

  // ---- date/time management ----
  const handleAddTime = () => {
    if (!dateTime) return
    if (dateTimeSelection.find((item) => item === dateTime)) return
    setDateTimeSelection((prev) => [...prev, dateTime])
    setDateTime('')
  }

  const removeTime = (timeToRemove) => {
    setDateTimeSelection((prev) => prev.filter((t) => t !== timeToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTime()
    }
  }

  // ---- form submission ----
  const handleSubmit = async () => {
    if (!selectedMovie) {
      setSubmitMessage({ type: 'error', text: 'Please select a movie first.' })
      return
    }
    if (!showPrice || Number(showPrice) <= 0) {
      setSubmitMessage({ type: 'error', text: 'Please enter a valid show price.' })
      return
    }
    if (dateTimeSelection.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Please add at least one date & time.' })
      return
    }

    setSubmitting(true)
    setSubmitMessage(null)

    // Build payload: convert each local datetime-local value into a
    // proper UTC ISO-8601 string so the server stores the correct moment
    // regardless of timezone.
    //
    // <input type="datetime-local"> produces "2026-05-26T18:30" (no tz).
    // new Date(iso) in the browser interprets it as local time, then
    // .toISOString() converts to UTC: "2026-05-26T13:00:00.000Z" for IST.
    const showsInput = dateTimeSelection.map((iso) => new Date(iso).toISOString())

    const payload = {
      movieId: selectedMovie._id,
      showsInput,
      showPrice: Number(showPrice),
    }

    try {
      const token = await getToken()
      await adminApi.createShow(payload, token)
      setSubmitMessage({
        type: 'success',
        text: `${dateTimeSelection.length} show(s) created successfully for "${selectedMovie.title}"!`,
      })
      setSelectedMovie(null)
      setShowPrice('')
      setDateTime('')
      setDateTimeSelection([])
      triggerRefresh()
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message || 'Failed to create show. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString([], {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <AdminShell title="Add Shows" subtitle="Create new screenings for existing movies.">
      <section className="admin-add-shows">
        <p className="admin-section-label">Now Playing Movies</p>
        <div className="admin-movie-cards">
          {loadingMovies ? (
            <p className="admin-form__hint">Loading movies…</p>
          ) : nowPlayingMovies.length > 0 ? (
            nowPlayingMovies.map((movie) => {
              const isSelected = selectedMovie?._id === movie._id
              const genres = Array.isArray(movie.genres) ? movie.genres : []
              return (
                <article
                  key={movie._id}
                  className={`admin-show-card admin-show-card--small${isSelected ? ' is-selected' : ''}`}
                  onClick={() => handleSelectMovie(movie)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectMovie(movie)}
                >
                  <img src={imageUrl(movie.backdrop_path || movie.poster_path)} alt={movie.title} />
                  <div>
                    <p>{movie.title}</p>
                    <div className="admin-movie-meta">
                      <span><Star size={12} /> {movie.vote_average?.toFixed(1) ?? '4.5'}</span>
                      <span>{kConverter(movie.vote_count ?? 0)} votes</span>
                    </div>
                    <span className="admin-movie-genres">
                      {genres.slice(0, 2).map((g) => g.name).join(', ')}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="admin-movie-check"><Check size={18} /></span>
                  )}
                </article>
              )
            })
          ) : (
            <div className="admin-empty-state">
              <p>No movies available right now.</p>
              <button className="primary-button primary-button--small" type="button" onClick={fetchNowPlayingMovies}>
                Refresh
              </button>
            </div>
          )}
        </div>

          {/* ---- show form ---- */}
          <div className="admin-show-form">
            <label htmlFor="show-price">Show Price</label>
            <input
              id="show-price"
              type="number"
              min="0"
              step="0.01"
              placeholder={`${currency} Enter show price`}
              value={showPrice}
              onChange={(e) => setShowPrice(e.target.value)}
            />

            <label htmlFor="show-date-time">Select Date and Time</label>
            <div className="datetime-row">
              <input
                id="show-date-time"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="primary-button primary-button--small" type="button" onClick={handleAddTime} disabled={!dateTime}>
                <Plus size={14} /> Add Time
              </button>
            </div>

            <div className="selected-times">
              <p>
                Selected Date-Time
                {dateTimeSelection.length > 0 && <span className="selected-times__count"> ({dateTimeSelection.length})</span>}
              </p>
              {dateTimeSelection.length > 0 ? (
                <div className="selected-times__list">
                  {dateTimeSelection.map((time) => (
                    <span key={time} className="selected-time-pill">
                      {formatDateTime(time)}
                      <button type="button" onClick={() => removeTime(time)} aria-label={`Remove ${formatDateTime(time)}`}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="admin-form__hint">No times selected yet.</p>
              )}
            </div>

            {submitMessage && (
              <p className={`admin-form__message admin-form__message--${submitMessage.type}`}>
                {submitMessage.text}
              </p>
            )}

            <button className="primary-button" type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (<> <Loader2 size={16} className="spin-icon" /> Creating… </>) : ('Add Show')}
            </button>
          </div>
        </section>

      <style>{`
        .admin-section-label { margin: 0 0 14px; color: #fff; font-size: 15px; font-weight: 800; }
        .admin-movie-meta { display: flex; gap: 10px; align-items: center; margin: 6px 0 4px; color: rgba(255,255,255,0.72); font-size: 11px; font-weight: 600; }
        .admin-movie-meta span { display: inline-flex; gap: 4px; align-items: center; }
        .admin-movie-meta svg { color: var(--accent); }
        .admin-movie-genres { color: rgba(255,255,255,0.56); font-size: 11px; font-weight: 500; }
        .admin-show-card--small.is-selected { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
        .admin-show-card--small { cursor: pointer; transition: border-color 160ms ease, box-shadow 160ms ease; position: relative; }
        .admin-show-card--small:hover { border-color: rgba(255,63,108,0.5); }
        .admin-movie-check { position: absolute; top: 8px; right: 8px; display: grid; width: 28px; height: 28px; place-items: center; border-radius: 50%; background: var(--accent); color: #fff; box-shadow: 0 4px 12px rgba(255,63,108,0.4); }
        .selected-times__count { color: var(--accent); font-weight: 700; }
        .admin-form__message { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; margin: 0; }
        .admin-form__message--success { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.24); }
        .admin-form__message--error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.22); }
        .admin-empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px 24px; color: rgba(255,255,255,0.64); font-size: 14px; }
        .spin-icon { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .primary-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>
    </AdminShell>
  )
}

export default AddShows
