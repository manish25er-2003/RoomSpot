export default function PropertyCard({ property, onViewDetails }) {
  const compactDescription = property.description.length > 90
    ? `${property.description.slice(0, 90).trim()}...`
    : property.description

  return (
    <article className="property-card">
      <div className="property-image-wrap">
        <img src={property.image} alt={property.title} />
        <span className="property-badge">{property.status}</span>
      </div>

      <div className="property-card-content">
        <div className="property-meta-top">
          <span className="property-type">{property.type}</span>
          <span className="property-price">₹{property.rent.toLocaleString('en-IN')}/month</span>
        </div>

        <h3>{property.title}</h3>
        <p className="property-location">{property.location}</p>
        <p className="property-description">{compactDescription}</p>

        <button type="button" className="secondary-btn property-button" onClick={onViewDetails}>
          View
        </button>
      </div>
    </article>
  )
}
