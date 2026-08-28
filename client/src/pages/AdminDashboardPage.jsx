import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../api'
import { clearToken, getToken } from '../adminAuth'
import StatCard from '../components/StatCard'
import ScaleGauge from '../components/ScaleGauge'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const token = getToken()

  const [stats, setStats] = useState(null)
  const [city, setCity] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getStats(token, { city, school, grade })
      .then(setStats)
      .catch((err) => {
        if (err.message.toLowerCase().includes('токен')) {
          clearToken()
          navigate('/admin/login')
          return
        }
        setError(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, school, grade])

  if (error) return <p className="field-error">{error}</p>
  if (!stats) return <p className="subtitle">Загрузка статистики…</p>

  const scaleEntries = Object.entries(stats.scaleAverages)
  const roleData = [
    { name: 'Жертвы, высокий риск', value: stats.riskCounts.victims },
    { name: 'Агрессоры, высокий риск', value: stats.riskCounts.aggressors },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__filters card">
        <div className="field">
          <label>Город</label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              setSchool('')
            }}
          >
            <option value="">Все города</option>
            {stats.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Школа</label>
          <select value={school} onChange={(e) => setSchool(e.target.value)}>
            <option value="">Все школы</option>
            {stats.schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Класс</label>
          <input
            type="number"
            min="1"
            max="11"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Все классы"
          />
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
              <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
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
                  <th>Город</th>
                  <th>Школа</th>
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
                    <td>{s.city}</td>
                    <td>{s.school}</td>
                    <td>{s.grade}</td>
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
