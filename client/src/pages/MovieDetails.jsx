import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Heart,
  Star,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { dummyShowsData, dummyTrailers, dummyDateTimeData } from '../assets/assets'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const guardiansMovie = {
  title: 'Guardians of the Galaxy',
  language: 'ENGLISH',
  rating: '4.5 IMDb Rating',
  runtime: '2h 19m',
  genres: 'Action | Adventure',
  releaseDate: '1 May, 2025',
  poster:
    'https://image.tmdb.org/t/p/original/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg',
  overview:
    'From the Marvel Cinematic Universe comes an epic space adventure. Peter Quill, a brash space adventurer who calls himself Star-Lord, finds himself the target of relentless bounty hunters after stealing a mysterious orb. To evade capture, he forms an uneasy alliance with a group of misfits: Gamora, Drax the Destroyer, Rocket Raccoon, and Groot.',
}

const bookingDates = [
  { day: 'Tue', date: '15' },
  { day: 'Wed', date: '16' },
  { day: 'Thu', date: '17', active: true },
  { day: 'Fri', date: '18' },
  { day: 'Sat', date: '19' },
  { day: 'Sun', date: '20' },
]

const formatRuntime = (runtime) => {
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  return `${hours}h ${minutes}m`
}

const MovieCard = ({ movie }) => {
  const releaseYear = new Date(movie.release_date).getFullYear()
  const genres = movie.genres.slice(0, 2).map((genre) => genre.name).join(', ')

  return (
    <article className="movie-card hover:-translate-y-1 transition duration-300">
      <img src={movie.backdrop_path} alt={movie.title} className="movie-card__image" />

      <div className="movie-card__body">
        <h3>{movie.title}</h3>
        <p>{releaseYear} - {genres} - {formatRuntime(movie.runtime)}</p>

        <div className="movie-card__actions">
          <Link to={`/movie/${movie._id}`} className="primary-button primary-button--small" onClick={() => { window.scrollTo(0, 70) }}>
            Buy Ticket
          </Link>

          <span className="movie-card__rating">
            <Star size={16} fill="currentColor" />
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  )
}



const MovieDetails = () => {
  const [show, setShow] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const { id } = useParams()
  const [isFavorite, setIsFavorite] = useState(false)
const getShow = async () => {

  const loadingToast = toast.loading('Loading movie details...')

  try {
    const currentMovie = await dummyShowsData.find(
      (movie) => movie._id === id
    )

    setShow({
      movie: currentMovie,
      dateTime: dummyDateTimeData
    })

    toast.success('Movie loaded!', {
      id: loadingToast,
    })

  } catch (error) {

    toast.error('Failed to load movie', {
      id: loadingToast,
    })
  }
}

  const handleTrailer = () => {
    const trailer = dummyTrailers?.[0]?.videoUrl

    if (!trailer) {
      toast.error('Trailer not available')
      return
    }

    window.open(trailer, '_blank')
  }

  const handleFavorite = () => {
    setIsFavorite((prev) => !prev)

    if (!isFavorite) {
      toast.success('Added to favorites')
    } else {
      toast('Removed from favorites')
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
    getShow()
  }, [id])

  useEffect(() => {
    if (show?.dateTime) {
      const firstDate = Object.keys(show.dateTime)[0]
      setSelectedDate(firstDate)
    }
  }, [show])

  const Navigate = useNavigate()
  const cast = show?.movie?.casts?.slice(0, 7)
  const recommendations = dummyShowsData.slice(0, 4)

  return show ? (
    <main className="movie-details-page">
      <section className="movie-details-hero">
        <img
          src={show.movie.poster_path}
          alt={show.movie.title}
          className="movie-details-hero__poster"
        />

        <div className="movie-details-hero__content">
          <p className="movie-details-hero__language">ENGLISH</p>
          <h1>{show.movie.title}</h1>

          <p className="movie-details-hero__rating">
            <Star size={16} fill="currentColor" />
            {show.movie.vote_average.toFixed(1)}
          </p>

          <p className="movie-details-hero__overview">{show.movie.overview}</p>

          <p className="movie-details-hero__meta">
            {formatRuntime(show.movie.runtime)} &bull; {show.movie.genres.map(genre => genre.name).join(", ")} &bull; {show.movie.release_date.split("-")[0]}
          </p>

          <div className="movie-details-hero__actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleTrailer}
            >
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
              <Heart
                size={22}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="details-section favorite-cast-section">
        <h2>Your Favorite Cast</h2>

        <div className="cast-row">
          {show.movie.casts.slice(0, 12).map((person, index) => (
            <article className="cast-card" key={index}>
              <img src={person.profile_path} alt={person.name} />
              <h3>{person.name}</h3>
              {/* <p>Peter Quill</p> */}
            </article>
          ))}
        </div>
      </section>

      <section className="date-booking-panel" id="choose-date">
        <div className="date-booking-panel__dates">
          <h2>Choose Date</h2>

          <div className="date-picker">
            <button type="button" className="date-picker__arrow" aria-label="Previous dates">
              <ChevronLeft size={28} />
            </button>

            {Object.keys(show.dateTime).map((dateKey) => {
              const date = new Date(dateKey)
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
              const dayNumber = date.getDate()
              const isActive = dateKey === selectedDate

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={`date-button${isActive ? ' is-active' : ''}`}
                  onClick={() => {setSelectedDate(dateKey)
                    toast.success(`Selected ${dayName}`)
                  }}
                >
                  <span>{dayName}</span>
                  <strong>{dayNumber}</strong>
                </button>
              )
            })}

            <button type="button" className="date-picker__arrow" aria-label="Next dates">
              <ChevronRight size={28} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="primary-button primary-button--book"
          onClick={handleBookNow}
        >
          Book Now
        </button>
      </section>

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
    </main>
  ) : <div>Loading...</div>
}

export default MovieDetails
