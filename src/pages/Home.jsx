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
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handlePopularLocation = (location) => {
    const nextFilters = { ...filters, location }
    setFilters(nextFilters)
    setAppliedFilters(nextFilters)
    setHasSearched(true)
  }

  const filteredProperties = useMemo(() => {
    const budgetValue = appliedFilters.budget === '' ? null : Number(appliedFilters.budget)

    return propertyData.filter((property) => {
      const locationQuery = appliedFilters.location.trim().toLowerCase()
      const matchesLocation = !locationQuery || property.location.toLowerCase().includes(locationQuery)
      const propertyType = property.type.toLowerCase()
      const selectedType = appliedFilters.type.toLowerCase()
      const matchesType = !selectedType
        || (selectedType === 'room' ? propertyType.includes('room')
          : selectedType === 'flat' ? ['flat', 'apartment'].includes(propertyType)
            : propertyType === selectedType)
      const matchesBudget = budgetValue === null || property.rent <= budgetValue
      return matchesLocation && matchesType && matchesBudget
    })
  }, [appliedFilters])

  const handleSearch = () => {
    setAppliedFilters({ ...filters })
    setHasSearched(true)
  }

  const resetFilters = () => {
    const cleared = { location: '', type: '', budget: '' }
    setFilters(cleared)
    setAppliedFilters(cleared)
    setHasSearched(true)
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

        {hasSearched && (
          <section className="search-results-section" aria-live="polite">
            <div className="container">
              <div className="search-results-heading">
                <div>
                  <div className="eyebrow eyebrow-dark">Search results</div>
                  <h2>{appliedFilters.location ? `Rooms near ${appliedFilters.location}` : 'Rooms matching your search'}</h2>
                  <p>{filteredProperties.length} available {filteredProperties.length === 1 ? 'option' : 'options'} match your filters.</p>
                </div>
                <button type="button" className="secondary-btn" onClick={resetFilters}>Clear filters</button>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="no-results">
                  <h3>No rooms found</h3>
                  <p>Try another location, room type, or a higher budget.</p>
                </div>
              ) : (
                <div className="property-grid">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={`search-${property.id}`} property={property} onViewDetails={() => setSelectedProperty(property)} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

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

            <div className="property-grid">
              {propertyData.slice(0, 8).map((property) => (
                <PropertyCard key={`featured-${property.id}`} property={property} onViewDetails={() => setSelectedProperty(property)} />
              ))}
            </div>
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
