import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-block">
          <div className="brand-block footer-brand">
            <div className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>RoomSpot</span>
          </div>
          <p>
            RoomSpot makes it easier to discover rooms, apartments and rental properties that
            match your needs and budget.
          </p>
          <div className="social-row" aria-label="Social media">
            <span>f</span>
            <span>x</span>
            <span>in</span>
            <span>ig</span>
          </div>
        </div>

        <div>
          <h4>Explore</h4>
          <ul>
            <li>Home</li>
            <li>Rooms</li>
            <li>Properties</li>
            <li>Popular Locations</li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Contact</li>
            <li>Careers</li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms &amp; Conditions</li>
          </ul>
        </div>

        <div>
          <h4>For Owners</h4>
          <ul>
            <li>List Your Property</li>
            <li>Owner Login</li>
            <li>Manage Properties</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <div className="footer-meta-row">
          <span>Designed &amp; Developed by Manish Kumar</span>
          <Link to="/portfolio" className="portfolio-cta-link">My Portfolio</Link>
        </div>
        <span>© 2026 RoomSpot. All rights reserved.</span>
      </div>
    </footer>
  )
}
