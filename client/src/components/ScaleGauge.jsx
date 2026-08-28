import RiskBadge from './RiskBadge'
import './ScaleGauge.css'

export default function ScaleGauge({ label, description, score, level }) {
  const percent = Math.min(100, Math.max(0, (score / 4) * 100))

  return (
    <div className="scale-gauge">
      <div className="scale-gauge__header">
        <div>
          <div className="scale-gauge__label">{label}</div>
          {description && <div className="scale-gauge__description">{description}</div>}
        </div>
        <RiskBadge level={level} />
      </div>

      <div className="scale-gauge__track">
        <div className="scale-gauge__zone scale-gauge__zone--low" />
        <div className="scale-gauge__zone scale-gauge__zone--medium" />
        <div className="scale-gauge__zone scale-gauge__zone--high" />
        <div className="scale-gauge__marker" style={{ left: `${percent}%` }} />
      </div>

      <div className="scale-gauge__scoreRow">
        <span className="scale-gauge__score">{score.toFixed(2)}</span>
        <span className="scale-gauge__max">из 4.00</span>
      </div>
    </div>
  )
}
