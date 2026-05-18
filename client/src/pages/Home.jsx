import { ArrowRight, CalendarDays, Clock, Play, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { assets, dummyShowsData, dummyTrailers } from '../assets/assets'
import { useState } from 'react'

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

const Home = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])
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
            <span>
              <CalendarDays size={16} />
              {featuredMovie.year}
            </span>
            <span>
              <Clock size={16} />
              {featuredMovie.duration}
            </span>
          </div>

          <p>{featuredMovie.description}</p>

          <Link to="/movies" className="primary-button">
            Explore Movies
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="content-section now-showing">
        <div className="section-header">
         
          <h2>Now Showing</h2>
          <Link to="/movies" onClick={()=>{window.scrollTo(0,0)}}>
            View All
            <ArrowRight size={15} className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
          </Link>
        </div>

        <div className="movies-grid">
          {dummyShowsData.slice(0, 8).map((movie) => (
            <MovieCard key={movie._id} movie={movie} /> 
          ))}
        </div>

        <div className="show-more-wrap">
          <Link to="/movies" className="primary-button primary-button--wide" onClick={() => window.scrollTo(0, 0)}>
            Show more
          </Link>
        </div>
      </section>

      <section className="content-section trailers-section">
        <h2>Trailers</h2>

  

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
          {dummyTrailers.map((trailer, index) => (
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
              <img src={trailer.image} alt="" />
              <span>
                <Play size={15} fill="currentColor" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
