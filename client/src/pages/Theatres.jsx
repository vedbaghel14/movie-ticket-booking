import { useEffect, useState } from "react";
import { MapPin, Star, Phone } from "lucide-react";
import axios from "axios";
import Loading from "../components/Loading";


const THEATRE_IMAGES = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHRoZWF0ZXIlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505775561242-727b7fba20f0?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559583109-3e7968136c99?q=80&w=1600&auto=format&fit=crop",
];

const Theatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNearbyTheatres = async (lat, lng) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/theatres/nearby`,
        {
          params: {
            lat,
            lng,
          },
        }
      );

      setTheatres(res.data.theatres);
      sessionStorage.setItem("theatres", JSON.stringify(res.data.theatres));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedTheatres = sessionStorage.getItem("theatres");
    if (cachedTheatres) {
      setTheatres(JSON.parse(cachedTheatres));
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearbyTheatres(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.log(error);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    const text = "🍿 Loading Nearby Theatres..."
    const subtitle = "Fetching the best theatres around your location."
    return (
      <>
      <Loading text={text} subtitle={subtitle} />
      </>
     
    );
  }

  return (
    <main className="theatres-page">
      <section className="content-section">
        <div className="section-header">
          <h1 className="h-20 text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent tracking-tight mb-8">
            🍿 Nearby Theatres
          </h1>
        </div>

        <div className="theatres-grid">
          {theatres.slice(0, 12).map((theater, index) => (
            <article key={theater.fsq_id} className="theater-card hover:-translate-y-1 transition duration-300">
              <img
                src={THEATRE_IMAGES[index % THEATRE_IMAGES.length]}
                alt={theater.name}
                className="theater-card__image"
                loading="lazy"
              />

              <div className="theater-card__body">
                <h3>{theater.name}</h3>

                <p className="theater-card__location">
                  <MapPin size={14} />
                  {theater.location.formatted_address}
                </p>

                <p className="theater-card__distance">
                  {(theater.distance / 1000).toFixed(1)} km away
                </p>

                <div className="theater-card__rating">
                  <Star size={14} fill="currentColor" />
                  {theater.rating || "4.2"}
                </div>

                <div className="theater-card__actions">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      theater.name
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="primary-button primary-button--small"
                  >
                    Directions
                  </a>

                  {theater.tel && (
                    <a
                      href={`tel:${theater.tel}`}
                      className="secondary-button secondary-button--small"
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Theatres;