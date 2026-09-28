export default function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <div className="feature-card-row">
        <div className="feature-icon" aria-hidden="true">
          {icon}
        </div>

        <div className="feature-copy">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </article>
  )
}
