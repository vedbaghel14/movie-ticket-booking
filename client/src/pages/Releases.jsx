import { CalendarDays, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dummyShowsData } from '../assets/assets'

const formatRuntime = (runtime) => {
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  return `${hours}h ${minutes}m`
}

const MovieCard = ({ movie }) => {
  const releaseYear = new Date(movie.release_date).getFullYear()
  const genres = movie.genres.slice(0, 2).map((genre) => genre.name).join(', ')
  const rating = movie.vote_average.toFixed(1)

  return (
    <article className="movie-card">
      <img src={movie.backdrop_path} alt={movie.title} className="movie-card__image" />

      <div className="movie-card__body">
        <h3>{movie.title}</h3>
        <p>{releaseYear} - {genres} - {formatRuntime(movie.runtime)}</p>

        <div className="movie-card__actions">
          <Link to={`/movie/${movie._id}`} className="primary-button primary-button--small">
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
  // Filter for movies released in the last year (since current date is May 9, 2026)
  const recentReleases = dummyShowsData.filter((movie) => {
    const releaseDate = new Date(movie.release_date)
    const oneYearAgo = new Date('2025-05-09')
    return releaseDate >= oneYearAgo
  }).sort((a, b) => new Date(b.release_date) - new Date(a.release_date))

  return (
    <main className="releases-page">
      <section className="content-section">
        <div className="section-header">
          <h1>New Releases</h1>
        </div>

        <div className="movies-grid">
          {recentReleases.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>

        {recentReleases.length === 0 && (
          <div className="no-releases">
            <p>No new releases available at the moment.</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default Releases