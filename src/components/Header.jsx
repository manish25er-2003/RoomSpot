export default function Header({ onLogin, onRegister, onListProperty }) {
  const navItems = ['Home', 'Rooms', 'Properties', 'About Us', 'Contact']

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand-block" aria-label="RoomSpot home">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>RoomSpot</span>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item} href="#" className="nav-link">
              {item}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="ghost-btn" onClick={onLogin}>
            Login
          </button>
          <button type="button" className="ghost-btn" onClick={onRegister}>
            Register
          </button>
          <button type="button" className="primary-btn header-list-btn" onClick={onListProperty || onRegister}>
            List Your Property
          </button>
        </div>

        <button type="button" className="mobile-menu-btn" aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
