import { ArrowRight, CalendarDays, Clock, Play, Star, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppContext } from '../context/Appcontext'
import { showApi } from '../lib/api'
import { assets } from '../assets/assets'
import { imageUrl } from '../lib/imageUrl'
import BackgroundGlow from '../components/BackgroundGlow'

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
          <Link to={`/movie/${movie._id}`} className="primary-button primary-button--small" onClick={() => window.scrollTo(0, 0)}>
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

const Home = () => {
  const [trailers, setTrailers] = useState([])
  const [currentTrailer, setCurrentTrailer] = useState(null)
  const [trailersLoading, setTrailersLoading] = useState(true)
  const [nowPlaying, setNowPlaying] = useState([])
  const { shows } = useAppContext()

  // ---- fetch trailers from backend ----
  useEffect(() => {
    let cancelled = false
    const fetchTrailers = async () => {
      try {
        const data = await showApi.getPublicTrailers()
        if (!cancelled && data.success && data.trailers.length > 0) {
          setTrailers(data.trailers)
          setCurrentTrailer(data.trailers[0])
        }
      } catch (err) {
        console.warn('[Home] Could not fetch trailers.', err.message)
      } finally {
        if (!cancelled) setTrailersLoading(false)
      }
    }
    fetchTrailers()
    return () => { cancelled = true }
  }, [])

  // ---- fallback: fetch now-playing from public endpoint ----
  useEffect(() => {
    let cancelled = false
    const fetchNowPlaying = async () => {
      try {
        const data = await showApi.getPublicNowPlaying()
        if (!cancelled && data.success) {
          setNowPlaying(data.movies)
        }
      } catch (err) {
        console.warn('[Home] Could not fetch now playing.', err.message)
      }
    }
    fetchNowPlaying()
    return () => { cancelled = true }
  }, [])

  // Prefer context shows (full DB records with casts/runtime).
  // Fall back to public now-playing (also persisted in DB).
  const movieList = shows.length > 0 ? shows : nowPlaying

  const featuredMovie = {
    title: 'Guardians of the Galaxy',
    genreLine: 'Action | Adventure | Sci-Fi',
    year: 2018,
    duration: '2h 8m',
    description:
      'In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.',
  }

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-section__content">
          <img src={assets.marvelLogo} alt="Marvel Studios" className="hero-section__brand" />
          <h1>{featuredMovie.title}</h1>
          <div className="hero-section__meta">
            <span>{featuredMovie.genreLine}</span>
            <span><CalendarDays size={16} />{featuredMovie.year}</span>
            <span><Clock size={16} />{featuredMovie.duration}</span>
          </div>
          <p>{featuredMovie.description}</p>
          <Link to="/movies" className="primary-button" onClick={()=>window.scrollTo(0,0)}>
            Explore Movies
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="content-section now-showing">
        <div className="section-header">
          <h2>Now Showing</h2>
          
          <Link to="/movies" onClick={() => { window.scrollTo(0, 0) }}>
            View All
            <ArrowRight size={15} className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
          </Link>
        
        </div>


        {movieList.length > 0 ? (
          <div className="movies-grid">
            {movieList.slice(0, 4).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="admin-form__hint" style={{ textAlign: 'center', padding: '40px 0' }}>
            No active showtimes. Add shows from the admin panel.
          </p>
        )}

        <div className="show-more-wrap">
          <Link to="/movies" className="primary-button primary-button--wide" onClick={() => window.scrollTo(0, 0)}>
            Show more
          </Link>
        </div>
      </section>

      <section className="content-section trailers-section">
        <h2>Trailers</h2>
        {trailersLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={24} className="spin-icon" style={{ color: '#fff' }} />
          </div>
        ) : trailers.length > 0 && currentTrailer ? (
          <>
            <div className="w-full max-w-5xl mx-auto mt-6 aspect-video rounded-2xl overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={currentTrailer.videoUrl.replace("watch?v=", "embed/")}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-2xl"
              ></iframe>
            </div>

            <div className="trailer-thumbs">
              {trailers.slice(0, 4).map((trailer, index) => (
                <a
                  key={trailer.videoUrl}
                  href={trailer.videoUrl.replace("watch?v=", "embed/")}
                  target="_blank"
                  rel="noreferrer"
                  className="trailer-thumb relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60"
                  aria-label={`Play trailer ${index + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentTrailer(trailer);
                  }}
                >
                  <img src={trailer.image} alt={trailer.title || ''} />
                  <span><Play size={15} fill="currentColor" /></span>
                </a>
              ))}
            </div>
          </>
        ) : (
          <p className="admin-form__hint" style={{ textAlign: 'center', padding: '40px 0' }}>
            No trailers available right now.
          </p>
        )}
      </section>
    </main>
  )
}

export default Home
