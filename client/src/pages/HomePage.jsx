import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext'
import './HomePage.css'

export default function HomePage() {
  const { setStudent, resetSurvey } = useSurvey()
  const navigate = useNavigate()

  const [city, setCity] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!city.trim() || !school.trim()) {
      setError('Заполните город и школу')
      return
    }

    const gradeNumber = Number(grade)
    if (!Number.isInteger(gradeNumber) || gradeNumber < 1 || gradeNumber > 11) {
      setError('Класс — это число от 1 до 11, без буквы')
      return
    }

    setError('')
    resetSurvey()
    setStudent({ city: city.trim(), school: school.trim(), grade: gradeNumber })
    navigate('/survey')
  }

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="card">
          <div className="eyebrow">Сфера доверия</div>
          <h1 className="title">Опрос о школьной атмосфере</h1>
          <p className="subtitle">
            Опрос полностью анонимный — мы не спрашиваем имя. Ответы помогают психологу вовремя
            заметить, если кому-то в классе некомфортно.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="city">Город</label>
              <input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Например, Алматы"
              />
            </div>

            <div className="field">
              <label htmlFor="school">Школа</label>
              <input
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Например, №12"
              />
            </div>

            <div className="field">
              <label htmlFor="grade">Класс</label>
              <input
                id="grade"
                type="number"
                min="1"
                max="11"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Например, 8"
              />
            </div>

            {error && <div className="field-error" style={{ marginTop: 14 }}>{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 26 }}>
              Начать опрос
            </button>
          </form>
        </div>

        <div className="admin-entry">
          <Link to="/admin/login">Вход для психолога</Link>
        </div>
      </div>
    </div>
  )
}
