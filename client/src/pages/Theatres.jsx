import { MapPin, Star, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

// Static theatre data — there is no backend API for theatres as they
// are configuration data that rarely changes.
const theatreData = [
  {
    _id: "theater_1",
    name: "PVR Director's Cut",
    location: "Ambience Mall, Vasant Kunj, New Delhi",
    distance: "2.4 km",
    rating: 4.7,
    amenities: ["IMAX", "Dolby Atmos", "Luxury Recliners", "Gourmet Food"],
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop",
  },
  {
    _id: "theater_2",
    name: "INOX Nehru Place",
    location: "Nehru Place, New Delhi",
    distance: "3.8 km",
    rating: 4.4,
    amenities: ["Laser Projection", "4DX", "Food Court"],
    image:
      "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    _id: "theater_3",
    name: "Cinepolis DLF Avenue",
    location: "Saket, New Delhi",
    distance: "5.1 km",
    rating: 4.5,
    amenities: ["ScreenX", "Dolby Atmos", "VIP Lounge"],
    image:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1600&auto=format&fit=crop",
  },
  {
    _id: "theater_4",
    name: "PVR Vegas",
    location: "Dwarka, New Delhi",
    distance: "6.2 km",
    rating: 4.3,
    amenities: ["IMAX", "Kids Zone", "Parking"],
    image:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1600&auto=format&fit=crop",
  },
  {
    _id: "theater_5",
    name: "Miraj Cinemas",
    location: "Rohini, New Delhi",
    distance: "7.4 km",
    rating: 4.1,
    amenities: ["Recliners", "Dolby Digital", "Snacks Bar"],
    image:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop",
  },
  {
    _id: "theater_6",
    name: "Carnival Cinemas",
    location: "Lajpat Nagar, New Delhi",
    distance: "8.0 km",
    rating: 4.0,
    amenities: ["3D", "VIP Seats", "Parking"],
    image:
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?q=80&w=1600&auto=format&fit=crop",
  }
]

const Theatres = () => {
  return (
    <main className="theatres-page">
      <section className="content-section">
        <div className="section-header">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent tracking-tight mb-8">
  🍿 Nearby Theatres
</h1>
           
        </div>

        <div className="theatres-grid">
          {theatreData.map((theater) => (
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
                  <Link to="/movies" className="primary-button primary-button--small">
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