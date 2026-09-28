import { popularLocations } from '../data/properties'

export default function SearchBar({ filters, onFilterChange, onSearch, onPopularLocation }) {
  return (
    <div className="hero-search-wrap">
      <div className="hero-search">
        <div className="search-field">
          <label>Location</label>
          <input
            type="text"
            value={filters.location}
            onChange={(event) => onFilterChange('location', event.target.value)}
            placeholder="Enter city or location"
          />
        </div>

        <div className="search-field">
          <label>Property Type</label>
          <select value={filters.type} onChange={(event) => onFilterChange('type', event.target.value)}>
            <option value="">Select type</option>
            <option value="Room">Room</option>
            <option value="Apartment">Apartment</option>
            <option value="Flat">Flat</option>
            <option value="PG">PG</option>
            <option value="Shared Room">Shared Room</option>
            <option value="Private Room">Private Room</option>
          </select>
        </div>

        <div className="search-field">
          <label>Budget</label>
          <input
            type="number"
            min="0"
            value={filters.budget}
            onChange={(event) => onFilterChange('budget', event.target.value)}
            placeholder="Select budget"
          />
        </div>

        <button type="button" className="primary-btn hero-search-btn" onClick={onSearch}>
          Search Rooms
        </button>
      </div>

      <div className="popular-locations">
        <span>Popular Locations</span>
        <div className="location-chips">
          {popularLocations.map((item) => (
            <button key={item} type="button" className="chip-button" onClick={() => onPopularLocation(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
