import { ArrowRight, CalendarDays, Clock, Play, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { assets, dummyShowsData, dummyTrailers } from '../assets/assets'


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
    <article className="movie-card hover:-translate-y-1 transition duration-300">
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

const Movies = () => {
  return dummyShowsData.length > 0 ? (
    <main className="movies-page">
    
      <section className="content-section now-showing">
        <div className="section-header">
          <h2>All Movies</h2>
        </div>
        
        <div className="movies-grid">
          {dummyShowsData.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>
    </main>
  ) : (
    <div>
      <h1 className='text-3xl font-bold text-center'>No movies available</h1>
    </div>
  )
}

export default Movies
