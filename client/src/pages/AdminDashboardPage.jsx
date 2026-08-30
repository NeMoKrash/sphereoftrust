import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { getAdminMe, getStats } from '../api'
import { clearToken, getToken } from '../adminAuth'
import { GRADE_LETTERS } from '../data/gradeLetters'
import StatCard from '../components/StatCard'
import ScaleGauge from '../components/ScaleGauge'
import './AdminDashboardPage.css'

const GRADES = Array.from({ length: 11 }, (_, i) => i + 1)

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const token = getToken()

  const [me, setMe] = useState(null)
  const [stats, setStats] = useState(null)
  const [grade, setGrade] = useState('')
  const [gradeLetter, setGradeLetter] = useState('')
  const [error, setError] = useState('')

  const handleAuthError = (err) => {
    if (err.message.toLowerCase().includes('токен')) {
      clearToken()
      navigate('/admin/login')
      return true
    }
    return false
  }

  useEffect(() => {
    getAdminMe(token)
      .then(setMe)
      .catch((err) => {
        if (!handleAuthError(err)) setError(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getStats(token, { grade, gradeLetter })
      .then(setStats)
      .catch((err) => {
        if (!handleAuthError(err)) setError(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, gradeLetter])

  if (error) return <p className="field-error">{error}</p>
  if (!stats) return <p className="subtitle">Загрузка статистики…</p>

  const scaleEntries = Object.entries(stats.scaleAverages)
  const roleData = [
    { name: 'Жертвы, высокий риск', value: stats.riskCounts.victims },
    { name: 'Агрессоры, высокий риск', value: stats.riskCounts.aggressors },
  ]

  return (
    <div className="dashboard">
      {me && (
        <div className="dashboard__school card">
          <div className="dashboard__school-label">Ваша школа</div>
          <div className="dashboard__school-value">
            Школа №{me.school}, {me.city}, {me.region}
          </div>
        </div>
      )}

      <div className="dashboard__filters card">
        <div className="field">
          <label>Класс</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">Все классы</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Буква</label>
          <select value={gradeLetter} onChange={(e) => setGradeLetter(e.target.value)}>
            <option value="">Все буквы</option>
            {GRADE_LETTERS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard__stat-row">
        <StatCard title="Всего анкет" value={stats.total} />
        <StatCard
          title="Индекс безопасности среды"
          value={`${stats.maps.safetyIndex}%`}
          hint="доля учеников без выраженных проблем"
        />
        <StatCard
          title="Карта виктимизации"
          value={`${stats.maps.victimizationPct}%`}
          hint="прямые жертвы травли"
        />
        <StatCard
          title="Карта скрытой изоляции"
          value={`${stats.maps.isolationPct}%`}
          hint="жертвы бойкота и игнора"
        />
      </div>

      <div className="dashboard__grid">
        <div className="card">
          <h2 className="section-title">Шкалы методики</h2>
          {scaleEntries.map(([key, scale]) => (
            <ScaleGauge key={key} {...scale} />
          ))}
        </div>

        <div className="card">
          <h2 className="section-title">Роли в выборке</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="var(--color-primary)"
                radius={[8, 8, 0, 0]}
                label={{ position: 'top', fontSize: 13, fontWeight: 700, fill: 'var(--color-text)' }}
                minPointSize={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Последние анкеты</h2>
        {stats.submissions.length === 0 ? (
          <p className="subtitle">Анкет пока нет</p>
        ) : (
          <div className="table-wrap">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Класс</th>
                  <th>Прямая викт.</th>
                  <th>Косв. викт.</th>
                  <th>Прямая агрессия</th>
                  <th>Косв. агрессия</th>
                </tr>
              </thead>
              <tbody>
                {stats.submissions.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>
                      {s.grade}
                      {s.gradeLetter}
                    </td>
                    <td>{s.scales.direct_victim.score.toFixed(2)}</td>
                    <td>{s.scales.indirect_victim.score.toFixed(2)}</td>
                    <td>{s.scales.direct_aggressor.score.toFixed(2)}</td>
                    <td>{s.scales.indirect_aggressor.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
