import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
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

const Favourite = () => {
  const { favouriteMovies } = useAppContext()

  return favouriteMovies.length > 0 ? (

    <main className="favourite-page">
      <section className="content-section now-showing">
        <div className="section-header">
        <h1 className="flex items-center gap-4 text-4xl md:text-5xl font-black tracking-tight mb-8">

  <span className="text-red-500 text-5xl">❤️</span>

   <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 bg-clip-text text-transparent">
    Favourite Movies
  </span>

</h1>
        </div>
        <div className="movies-grid">
          {favouriteMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>
    </main>
  ) : (
    <div>
      <h1 className='text-3xl font-bold text-center'>No favourite movies yet</h1>
    </div>
  )
}

export default Favourite
