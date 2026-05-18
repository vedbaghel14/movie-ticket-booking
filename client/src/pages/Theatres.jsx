import { MapPin, Star, Clock, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dummyTheaterData } from '../assets/assets'

const Theatres = () => {
  return (
    <main className="theatres-page">
      <section className="content-section">
        <div className="section-header">
          <h1>Nearby Theatres</h1>
          
        </div>

        <div className="theatres-grid">
          {dummyTheaterData.map((theater) => (
            <article key={theater._id} className="theater-card">
              <img src={theater.image} alt={theater.name} className="theater-card__image" />

              <div className="theater-card__body">
                <h3>{theater.name}</h3>
                <p className="theater-card__location">
                  <MapPin size={14} />
                  {theater.location}
                </p>
                <p className="theater-card__distance">{theater.distance} away</p>

                <div className="theater-card__rating">
                  <Star size={14} fill="currentColor" />
                  {theater.rating}
                </div>

                <div className="theater-card__amenities">
                  {theater.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="theater-card__actions">
                  <Link to={`/theater/${theater._id}`} className="primary-button primary-button--small">
                    View Shows
                  </Link>
                  <button className="secondary-button secondary-button--small" type="button">
                    <Phone size={14} />
                    Call
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Theatres