import './RiskBadge.css'

const COLORS = {
  low: { bg: 'var(--color-low-bg)', color: 'var(--color-low)' },
  medium: { bg: 'var(--color-medium-bg)', color: 'var(--color-medium)' },
  high: { bg: 'var(--color-high-bg)', color: 'var(--color-high)' },
}

export default function RiskBadge({ level }) {
  const colors = COLORS[level.key] || COLORS.low

  return (
    <span className="risk-badge" style={{ background: colors.bg, color: colors.color }}>
      {level.label}
    </span>
  )
}
