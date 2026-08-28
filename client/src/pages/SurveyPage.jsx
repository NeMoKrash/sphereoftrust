import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions, submitSurvey } from '../api'
import { useSurvey } from '../context/SurveyContext'
import { useLanguage } from '../context/LanguageContext'
import QuestionCard from '../components/QuestionCard'
import './SurveyPage.css'

export default function SurveyPage() {
  const { student, answers, answerQuestion } = useSurvey()
  const { lang, t } = useLanguage()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!student.region) {
      navigate('/')
      return
    }

    getQuestions()
      .then(setQuestions)
      .catch(() => setError('Не удалось загрузить вопросы. Обновите страницу.'))
      .finally(() => setLoading(false))
  }, [student.region, navigate])

  if (loading) {
    return (
      <div className="page">
        <p className="subtitle">{t('survey.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <p className="field-error">{error}</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="page">
        <p className="subtitle">Вопросы пока не добавлены.</p>
      </div>
    )
  }

  const question = questions[index]
  const questionText = lang === 'kz' && question.textKz ? question.textKz : question.text
  const currentValue = answers[question.id]
  const isLast = index === questions.length - 1
  const progress = Math.round(((index + 1) / questions.length) * 100)

  const handleNext = async () => {
    if (currentValue === undefined) return

    if (!isLast) {
      setIndex((i) => i + 1)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await submitSurvey({
        region: student.region,
        city: student.city,
        school: student.school,
        grade: student.grade,
        gradeLetter: student.gradeLetter,
        answers: questions.map((q) => ({ questionId: q.id, score: answers[q.id] })),
      })
      navigate('/thank-you')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="survey-progress">
          <div className="survey-progress__bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="card">
          <QuestionCard
            number={question.number}
            total={questions.length}
            text={questionText}
            value={currentValue}
            onChange={(score) => answerQuestion(question.id, score)}
          />

          {error && <div className="field-error" style={{ marginTop: 14 }}>{error}</div>}

          <div className="btn-row">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0 || submitting}
            >
              {t('survey.back')}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleNext}
              disabled={currentValue === undefined || submitting}
            >
              {isLast ? (submitting ? t('survey.submitting') : t('survey.finish')) : t('survey.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
