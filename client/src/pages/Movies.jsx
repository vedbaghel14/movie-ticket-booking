import { ArrowRight, Loader2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/Appcontext'
import { useEffect, useRef, useState } from 'react'
import { showApi } from '../lib/api'
import { imageUrl } from '../lib/imageUrl'
import Loading from '../components/Loading'

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
          <Link to={`/movie/${movie._id}`} className="primary-button primary-button--small" onClick={()=>window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })}>
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

const Movies = () => {
  const { shows } = useAppContext()

  // ---- local state: guards against race conditions with context ----
  const [nowPlaying, setNowPlaying] = useState([])
  const [loading, setLoading] = useState(true)

  // useRef survives StrictMode double-mount; the callback ref pattern
  // ensures the latest fetch result isn't thrown away by a stale closure.
  const mountedRef = useRef(true)

  useEffect(() => {
    // Reset the ref on mount (handles StrictMode unmount/remount)
    mountedRef.current = true

    let cancelled = false

    const fetchNowPlaying = async () => {
      try {
        const data = await showApi.getPublicNowPlaying()
        // Only apply if the component is still mounted AND this specific
        // effect invocation hasn't been cancelled (handles StrictMode)
        if (!cancelled && mountedRef.current && data.success) {
          setNowPlaying(data.movies)
        }
      } catch (err) {
        console.warn('[Movies] Could not fetch now playing.', err.message)
        // DO NOT clear nowPlaying — keep whatever we had before
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchNowPlaying()

    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [])

  // ---- merge strategy (order matters — see explanation below) ----
  // 1. If context has active shows (from DB), prefer those — they have
  //    full movie details (casts, runtime) populated by addShow.
  // 2. Otherwise fall back to TMDB now-playing (also persisted in DB).
  // 3. While loading, show nothing yet (avoids the flash of "No movies").
  const movieList = shows.length > 0 ? shows : nowPlaying

  // ---- loading state ----
  if (loading && movieList.length === 0) {
    const text = "🎬 Loading Movies..."
    const subtitle = "Please wait while we fetch the latest movies."
    return (
    <>
    <Loading text={text} subtitle={subtitle} />
    </>
    )
  }

  // ---- empty state ----
  if (movieList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <h1 className="text-3xl font-bold text-center">No movies available</h1>
        <p className="text-gray-400">Check back later for new showtimes.</p>
      </div>
    )
  }

  // ---- populated state ----
  return (
    <main className="movies-page">
      <section className="content-section now-showing">

        <div className="section-header">

          <h1 className="flex items-center gap-4 text-3xl md:text-4xl font-black tracking-tight mb-8">
            <span className="text-red-500 text-6xl">🎬</span>
            <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 bg-clip-text text-transparent">
              All Movies
            </span>
          </h1>

        </div>

        <div className="movies-grid">
          {movieList.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Movies
