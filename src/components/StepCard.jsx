export default function StepCard({ number, title, description }) {
  return (
    <article className="step-card">
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
