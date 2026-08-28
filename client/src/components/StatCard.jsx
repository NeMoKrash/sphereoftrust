import './StatCard.css'

export default function StatCard({ title, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-card__title">{title}</div>
      <div className="stat-card__value">{value}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  )
}
