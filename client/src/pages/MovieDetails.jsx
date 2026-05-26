import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Heart,
  Star,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { showApi, userApi } from '../lib/api'
import { useAppContext } from '../context/Appcontext'
import { imageUrl } from '../lib/imageUrl'

const formatRuntime = (runtime) => {
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  return `${hours}h ${minutes}m`
}

const MovieCard = ({ movie }) => {
  const releaseYear = new Date(movie.release_date).getFullYear()
  const genres = Array.isArray(movie.genres)
    ? movie.genres.slice(0, 2).map((genre) => genre.name).join(', ')
    : ''
  const rating = movie.vote_average?.toFixed(1) || 'N/A'

  return (
    <article className="movie-card hover:-translate-y-1 transition duration-300">
      <img src={imageUrl(movie.backdrop_path)} alt={movie.title} className="movie-card__image" />
      <div className="movie-card__body">
        <h3>{movie.title}</h3>
        <p>{releaseYear} - {genres} - {movie.runtime ? formatRuntime(movie.runtime) : ''}</p>
        <div className="movie-card__actions">
          <Link to={`/movie/${movie._id}`} className="primary-button primary-button--small" onClick={() => { window.scrollTo(0, 0) }}>
            Buy Ticket
          </Link>
          <span className="movie-card__rating">
            <Star size={16} fill="currentColor" />
            {rating}
          </span>
        </div>
      </div>
    </article>
  )
}

const MovieDetails = () => {
  const [show, setShow] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const Navigate = useNavigate()
  const { getToken, favouriteMovies, fetchFavouriteMovies } = useAppContext()

  // Fetch show details from backend
  useEffect(() => {
    let cancelled = false
    const getShow = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await showApi.getSingle(id)
        if (!cancelled) {
          if (data.success && data.movie) {
            // Check if movie is in favourites
            const isFav = favouriteMovies.some((m) => m._id === id || m._id === data.movie._id)
            setIsFavorite(isFav)
            setShow(data)
          } else {
            setError('Movie not found or no active shows.')
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[MovieDetails] Backend unreachable.', err.message)
          setError('Could not load movie details. Please try again later.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    getShow()
    return () => { cancelled = true }
  }, [id])

  // Fetch recommendations from public now playing API
  useEffect(() => {
    let cancelled = false
    const fetchRecs = async () => {
      try {
        const data = await showApi.getPublicNowPlaying()
        if (!cancelled && data.success) {
          const recs = data.movies
            .filter((m) => m._id !== id)
            .slice(0, 4)
          setRecommendations(recs)
        }
      } catch (err) {
        console.warn('[MovieDetails] Could not fetch recommendations.', err.message)
      }
    }
    fetchRecs()
    return () => { cancelled = true }
  }, [id])

  const handleTrailer = () => {
    // Use the movie ID to search for a trailer — open TMDB page as fallback
    window.open(`https://www.themoviedb.org/movie/${show?.movie?.id || id}`, '_blank')
  }

  const handleFavorite = async () => {
    try {
      const token = await getToken()
      await userApi.toggleFavourite(id, token)
      setIsFavorite((prev) => !prev)
      if (!isFavorite) {
        toast.success('Added to favorites')
      } else {
        toast('Removed from favorites')
      }
      fetchFavouriteMovies()
    } catch (err) {
      console.warn('[MovieDetails] Favourite toggle failed.', err.message)
      setIsFavorite((prev) => !prev)
      if (!isFavorite) {
        toast.success('Added to favorites')
      } else {
        toast('Removed from favorites')
      }
    }
  }

  const handleBookNow = () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }
    toast.success('Date selected!')
    Navigate(`/movies/${id}/${selectedDate}`)
    window.scrollTo(0, 80)
  }

  useEffect(() => {
    if (show?.dateTime) {
      const firstDate = Object.keys(show.dateTime)[0]
      setSelectedDate(firstDate)
    }
  }, [show])

  const cast = show?.movie?.casts?.slice(0, 7)

  // Loading
  if (loading) {
    return (
      <main className="movie-details-page">
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading movie details…</p>
        </div>
      </main>
    )
  }

  // Error or no movie
  if (error || !show?.movie) {
    return (
      <main className="movie-details-page">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
            <p className="mb-6">{error || "The movie you're looking for doesn't have any active shows."}</p>
            <Link to="/movies" className="primary-button">Browse Movies</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="movie-details-page">
      <section className="movie-details-hero">
        <img
          src={imageUrl(show.movie.poster_path)}
          alt={show.movie.title}
          className="movie-details-hero__poster"
        />
        <div className="movie-details-hero__content">
          <p className="movie-details-hero__language">{show.movie.original_language?.toUpperCase() || 'ENGLISH'}</p>
          <h1>{show.movie.title}</h1>
          <p className="movie-details-hero__rating">
            <Star size={16} fill="currentColor" />
            {show.movie.vote_average?.toFixed(1)}
          </p>
          <p className="movie-details-hero__overview">{show.movie.overview}</p>
          <p className="movie-details-hero__meta">
            {show.movie.runtime ? formatRuntime(show.movie.runtime) : ''} &bull;{' '}
            {Array.isArray(show.movie.genres) ? show.movie.genres.map((genre) => genre.name).join(', ') : ''} &bull;{' '}
            {show.movie.release_date?.split('-')[0]}
          </p>
          <div className="movie-details-hero__actions">
            <button type="button" className="secondary-button" onClick={handleTrailer}>
              <CirclePlay size={16} />
              Watch Trailer
            </button>
            <a href="#choose-date" className="primary-button primary-button--detail">
              Buy Tickets
            </a>
            <button
              className="favorite-button"
              type="button"
              aria-label="Add to favorites"
              onClick={handleFavorite}
            >
              <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </section>

      {cast && cast.length > 0 && (
        <section className="details-section favorite-cast-section">
          <h2>Your Favorite Cast</h2>
          <div className="cast-row">
            {cast.map((person, index) => (
              <article className="cast-card" key={index}>
                <img src={imageUrl(person.profile_path)} alt={person.name} />
                <h3>{person.name}</h3>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="date-booking-panel" id="choose-date">
        <div className="date-booking-panel__dates">
          <h2>Choose Date</h2>
          <div className="date-picker">
            <button type="button" className="date-picker__arrow" aria-label="Previous dates">
              <ChevronLeft size={28} />
            </button>
            {show.dateTime ? Object.keys(show.dateTime).map((dateKey) => {
              const date = new Date(dateKey)
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
              const dayNumber = date.getDate()
              const isActive = dateKey === selectedDate
              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`date-button${isActive ? ' is-active' : ''}`}
                  onClick={() => {
                    setSelectedDate(dateKey)
                    toast.success(`Selected ${dayName}`)
                  }}
                >
                  <span>{dayName}</span>
                  <strong>{dayNumber}</strong>
                </button>
              )
            }) : (
              <p>No showtimes available</p>
            )}
            <button type="button" className="date-picker__arrow" aria-label="Next dates">
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
        <button type="button" className="primary-button primary-button--book" onClick={handleBookNow}>
          Book Now
        </button>
      </section>

      {recommendations.length > 0 && (
        <section className="details-section recommendations-section">
          <div className="section-header">
            <h2>You May Also Like</h2>
            <Link to="/movies" onClick={() => window.scrollTo(0, 0)} className="primary-button primary-button--small">
              View All
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="movies-grid recommendations-grid">
            {recommendations.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
          <div className="show-more-wrap details-show-more">
            <Link to="/movies" onClick={() => window.scrollTo(0, 0)} className="primary-button primary-button--wide">
              Show more
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}

export default MovieDetails
