import { useMemo, useState } from 'react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import FeatureCard from '../components/FeatureCard'
import PropertyCard from '../components/PropertyCard'
import StepCard from '../components/StepCard'
import Footer from '../components/Footer'
import { propertyData, featureData, steps } from '../data/properties'

export default function Home({ onLogin, onRegister, onListProperty }) {
  const [filters, setFilters] = useState({ location: '', type: '', budget: '' })
  const [appliedFilters, setAppliedFilters] = useState({ location: '', type: '', budget: '' })
  const [selectedProperty, setSelectedProperty] = useState(null)

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handlePopularLocation = (location) => {
    setFilters((prev) => ({ ...prev, location }))
  }

  const filteredProperties = useMemo(() => {
    const budgetValue = appliedFilters.budget === '' ? null : Number(appliedFilters.budget)

    return propertyData.filter((property) => {
      const matchesLocation = !appliedFilters.location || property.location.toLowerCase().includes(appliedFilters.location.toLowerCase())
      const matchesType = !appliedFilters.type || property.type === appliedFilters.type
      const matchesBudget = budgetValue === null || property.rent <= budgetValue
      return matchesLocation && matchesType && matchesBudget
    })
  }, [appliedFilters])

  const handleSearch = () => {
    setAppliedFilters({ ...filters })
  }

  const resetFilters = () => {
    const cleared = { location: '', type: '', budget: '' }
    setFilters(cleared)
    setAppliedFilters(cleared)
  }

  return (
    <div className="home-page">
      <Header onLogin={onLogin} onRegister={onRegister} onListProperty={onListProperty} />

      <main>
        <section className="hero-section">
          <div className="container hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">Trusted rental platform</div>
              <h1>Find a Room You'll Love to Call Home</h1>
              <p>
                Discover affordable rooms, apartments and rental properties in your preferred
                location. Search, compare and find a place that fits your lifestyle and budget.
              </p>

              <SearchBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onPopularLocation={handlePopularLocation}
              />
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="visual-card visual-card-main">
                <div className="mini-label">Featured listing</div>
                <div className="mini-house">
                  <span className="roof" />
                  <span className="wall" />
                  <span className="window" />
                  <span className="window second" />
                  <span className="door" />
                </div>
                <div className="visual-info">
                  <strong>Luxury 2BHK</strong>
                  <span>₹18,500/month</span>
                </div>
              </div>
              <div className="visual-card visual-card-small">
                <span className="rating-pill">4.9 Rating</span>
                <div className="stats-row">
                  <div>
                    <strong>500+</strong>
                    <span>Homes</span>
                  </div>
                  <div>
                    <strong>2k+</strong>
                    <span>Tenants</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section features-section">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow eyebrow-dark">Why choose RoomSpot</div>
              <h2>Why Choose RoomSpot?</h2>
              <p>Everything you need to find the right rental place in one simple platform.</p>
            </div>

            <div className="feature-grid">
              {featureData.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section listings-section">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <div className="eyebrow eyebrow-dark">Featured rooms</div>
                <h2>Featured Rental Properties</h2>
              </div>
              <button type="button" className="secondary-btn" onClick={resetFilters}>
                View All Properties
              </button>
            </div>

            <p className="section-subtitle">
              Explore some of the latest rooms and properties available on RoomSpot.
            </p>

            {(filteredProperties.length === 0) ? (
              <div className="no-results">
                <h3>No rooms available</h3>
                <p>Try updating the location, type or budget to see other matching listings.</p>
                <button type="button" className="primary-btn" onClick={resetFilters}>Reset filters</button>
              </div>
            ) : (
              <div className="property-grid">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} onViewDetails={() => setSelectedProperty(property)} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section process-section">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow eyebrow-dark">Simple process</div>
              <h2>Find Your New Place in 3 Simple Steps</h2>
            </div>

            <div className="step-grid">
              {steps.map((step) => (
                <StepCard key={step.number} number={step.number} title={step.title} description={step.description} />
              ))}
            </div>
          </div>
        </section>

        <section className="owner-section">
          <div className="container owner-inner">
            <div>
              <div className="eyebrow eyebrow-light">For property owners</div>
              <h2>Have a Room or Property to Rent?</h2>
            </div>

            <div className="owner-content">
              <p>List your property on RoomSpot and connect with people looking for rooms and rental properties.</p>
              <button type="button" className="primary-btn owner-btn" onClick={onListProperty || onRegister}>
                List Your Property
              </button>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-inner">
            <div>
              <h2>Ready to Find Your Next Home?</h2>
              <p>Start exploring rooms and rental properties that match your location, lifestyle and budget.</p>
            </div>

            <div className="cta-actions">
              <button type="button" className="primary-btn" onClick={onLogin}>
                Find a Room
              </button>
              <button type="button" className="secondary-btn light-btn" onClick={onRegister}>
                Create Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {selectedProperty && (
        <div className="property-modal-backdrop" onClick={() => setSelectedProperty(null)}>
          <div className="property-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedProperty(null)} aria-label="Close details">
              ×
            </button>
            <div className="property-modal-image-wrap">
              <img src={selectedProperty.image} alt={selectedProperty.title} />
              <span className="property-badge modal-badge">{selectedProperty.status}</span>
            </div>

            <div className="property-modal-content">
              <div className="property-meta-top">
                <span className="property-type">{selectedProperty.type}</span>
                <span className="property-price">₹{selectedProperty.rent.toLocaleString('en-IN')}/month</span>
              </div>

              <h3>{selectedProperty.title}</h3>
              <p className="property-location">{selectedProperty.location}</p>
              <p className="property-description modal-description">{selectedProperty.description}</p>

              <div className="detail-points">
                <span>Furnished</span>
                <span>Secure entry</span>
                <span>Utilities included</span>
                <span>Near transport</span>
              </div>

              <button type="button" className="primary-btn modal-button" onClick={onLogin}>
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
