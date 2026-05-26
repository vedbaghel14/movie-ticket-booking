import { CalendarDays, Loader2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { showApi } from '../lib/api'
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

const Releases = () => {
  const [recentReleases, setRecentReleases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchReleases = async () => {
      try {
        const data = await showApi.getPublicNowPlaying()
        if (!cancelled && data.success) {
          const sorted = data.movies
            .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
          setRecentReleases(sorted)
        }
      } catch (err) {
        console.warn('[Releases] Could not fetch now playing.', err.message)
        // Keep previous data on failure — don't clear
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReleases()
    return () => { cancelled = true }
  }, [])

  return (
    <main className="releases-page">
      <section className="content-section">
        <div className="section-header">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent tracking-tight mb-8">
  🎬 New Releases
</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 size={28} className="spin-icon" style={{ color: '#e11d48' }} />
          </div>
        ) : recentReleases.length > 0 ? (
          <div className="movies-grid">
            {recentReleases.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="no-releases">
            <p>No new releases available at the moment.</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default Releases