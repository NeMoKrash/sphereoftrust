import { Link } from 'react-router-dom'
import './ThankYouPage.css'

export default function ThankYouPage() {
  return (
    <div className="page">
      <div className="page-narrow">
        <div className="card thank-you-card">
          <div className="thank-you-badge">Готово</div>
          <h1 className="title">Спасибо за прохождение опроса!</h1>
          <p className="subtitle">
            Твои ответы приняты анонимно. Если ты испытываешь сложности или давление в школе,
            помни, что ты всегда можешь обратиться к психологической службе.
          </p>

          <Link to="/" className="btn btn-ghost btn-block" style={{ marginTop: 24 }}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
