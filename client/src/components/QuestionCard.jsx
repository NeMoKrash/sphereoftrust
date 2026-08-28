import './QuestionCard.css'

const OPTIONS = [
  { score: 0, label: 'Никогда не было' },
  { score: 1, label: 'Было раз' },
  { score: 2, label: 'Бывает иногда' },
  { score: 3, label: 'Бывает раз в неделю' },
  { score: 4, label: 'Бывает несколько раз в неделю' },
]

export default function QuestionCard({ number, text, value, onChange }) {
  return (
    <div className="question-card">
      <div className="question-card__number">Вопрос {number} из 13</div>
      <div className="question-card__text">{text}</div>

      <div className="question-card__options">
        {OPTIONS.map((opt) => (
          <label
            key={opt.score}
            className={`question-card__option${value === opt.score ? ' is-selected' : ''}`}
          >
            <input
              type="radio"
              name={`question-${number}`}
              checked={value === opt.score}
              onChange={() => onChange(opt.score)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
