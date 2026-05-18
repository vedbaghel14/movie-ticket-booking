import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <img src={assets.logo} alt="QuickShow" />
          <p>
            Lorem Ipsum has been the industry's standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </p>

          <div className="store-badges">
            <a href="/" aria-label="Get it on Google Play">
              <img src={assets.googlePlay} alt="" />
            </a>
            <a href="/" aria-label="Download on the App Store">
              <img src={assets.appStore} alt="" />
            </a>
          </div>
        </div>

        <div className="site-footer__links">
          <h3>Company</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/privacy">Privacy policy</Link>
        </div>

        <div className="site-footer__contact">
          <h3>Get in touch</h3>
          <a href="tel:+11234567890">+1-212-456-7890</a>
          <a href="mailto:contact@example.com">contact@example.com</a>
        </div>
      </div>

      <p className="site-footer__copyright">
        Copyright 2025 &copy; GreatStack. All Right Reserved.
      </p>
    </footer>
  )
}

export default Footer
