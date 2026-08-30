import { useLanguage } from '../context/LanguageContext'
import './QuestionCard.css'

const OPTION_KEYS = [
  { score: 0, key: 'option.never' },
  { score: 1, key: 'option.once' },
  { score: 2, key: 'option.sometimes' },
  { score: 3, key: 'option.weekly' },
  { score: 4, key: 'option.multiWeekly' },
]

export default function QuestionCard({ number, total, text, value, onChange }) {
  const { t } = useLanguage()

  return (
    <div className="question-card">
      <div className="question-card__brand">
        <img src="/logo.svg" alt="" className="question-card__brand-icon" />
        {t('siteName')}
      </div>

      <div className="question-card__number">
        {t('survey.question')} {number} {t('survey.of')} {total}
      </div>
      <div className="question-card__text">{text}</div>

      <div className="question-card__options">
        {OPTION_KEYS.map((opt) => (
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
            <span>{t(opt.key)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
