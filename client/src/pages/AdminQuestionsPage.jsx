import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminQuestions, updateAdminQuestion } from '../api'
import { clearToken, getToken } from '../adminAuth'
import './AdminQuestionsPage.css'

export default function AdminQuestionsPage() {
  const navigate = useNavigate()
  const token = getToken()

  const [questions, setQuestions] = useState([])
  const [scales, setScales] = useState({})
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [savedId, setSavedId] = useState(null)

  useEffect(() => {
    getAdminQuestions(token)
      .then((data) => {
        setQuestions(data.questions)
        setScales(data.scales)
      })
      .catch((err) => {
        if (err.message.toLowerCase().includes('токен')) {
          clearToken()
          navigate('/admin/login')
          return
        }
        setError(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateLocal = (id, changes) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...changes } : q)))
  }

  const handleSave = async (question) => {
    setSavingId(question.id)
    try {
      await updateAdminQuestion(token, question.id, {
        text: question.text,
        scale: question.scale,
        active: question.active,
      })
      setSavedId(question.id)
      setTimeout(() => setSavedId(null), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  if (error) return <p className="field-error">{error}</p>
  if (questions.length === 0) return <p className="subtitle">Загрузка…</p>

  return (
    <div className="card">
      <h2 className="section-title">Вопросы анкеты</h2>
      <p className="subtitle" style={{ marginBottom: 20 }}>
        Здесь можно изменить формулировку вопроса, привязать его к шкале методики или временно
        отключить из опроса.
      </p>

      <div className="questions-list">
        {questions.map((q) => (
          <div className="question-row" key={q.id}>
            <div className="question-row__number">№{q.number}</div>

            <div className="question-row__fields">
              <textarea
                value={q.text}
                onChange={(e) => updateLocal(q.id, { text: e.target.value })}
                rows={2}
              />

              <div className="question-row__meta">
                <select value={q.scale} onChange={(e) => updateLocal(q.id, { scale: e.target.value })}>
                  {Object.entries(scales).map(([key, s]) => (
                    <option key={key} value={key}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <label className="question-row__active">
                  <input
                    type="checkbox"
                    checked={q.active}
                    onChange={(e) => updateLocal(q.id, { active: e.target.checked })}
                  />
                  Показывать в опросе
                </label>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSave(q)}
                  disabled={savingId === q.id}
                >
                  {savingId === q.id ? 'Сохраняем…' : savedId === q.id ? 'Сохранено' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
