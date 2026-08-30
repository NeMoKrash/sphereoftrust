import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSuperAdminStats } from '../api'
import { clearToken, getToken } from '../adminAuth'
import { REGIONS } from '../data/regions'
import { GRADE_LETTERS } from '../data/gradeLetters'
import StatCard from '../components/StatCard'
import ScaleGauge from '../components/ScaleGauge'
import './SuperAdminStatsPage.css'
import '../pages/ClimateMapPage.css'

const GRADES = Array.from({ length: 11 }, (_, i) => i + 1)

function levelColor(index) {
  if (index >= 70) return 'high'
  if (index >= 40) return 'medium'
  return 'low'
}

export default function SuperAdminStatsPage() {
  const navigate = useNavigate()
  const token = getToken()

  const [stats, setStats] = useState(null)
  const [region, setRegion] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [gradeLetter, setGradeLetter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getSuperAdminStats(token, { region, school, grade, gradeLetter })
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
  }, [region, school, grade, gradeLetter])

  if (error) return <p className="field-error">{error}</p>
  if (!stats) return <p className="subtitle">Загрузка статистики…</p>

  const { overview, filtered } = stats
  const scaleEntries = Object.entries(filtered.scaleAverages)

  return (
    <div className="dashboard">
      <div className="card">
        <h2 className="section-title">Общая картина по Казахстану</h2>
        <div className="climate-stat-row">
          <StatCard title="Прошли опрос" value={overview.totalSubmissions} />
          <StatCard title="Регионов подключено" value={`${overview.regionsCount} / ${REGIONS.length}`} />
          <StatCard title="Школ охвачено" value={overview.schoolsCount} />
        </div>

        <div className="region-grid" style={{ marginTop: 20 }}>
          {overview.perRegion.map((r) => (
            <div className="region-card" key={r.region}>
              <div className="region-card__name">{r.region}</div>
              {r.submissions > 0 ? (
                <>
                  <div className={`region-card__index region-card__index--${levelColor(r.safetyIndex)}`}>
                    {r.safetyIndex}%
                  </div>
                  <div className="region-card__count">{r.submissions}</div>
                </>
              ) : (
                <div className="region-card__empty">Пока нет анкет</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard__filters card">
        <div className="field">
          <label>Область</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Все области</option>
            {REGIONS.map((r) => (
              <option key={r.ru} value={r.ru}>
                {r.ru}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Номер школы</label>
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value.replace(/\D/g, ''))}
            placeholder="Например, 48"
          />
        </div>

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
        <StatCard title="Анкет по фильтру" value={filtered.total} />
        <StatCard title="Индекс безопасности среды" value={`${filtered.maps.safetyIndex}%`} />
        <StatCard title="Жертвы высокого риска" value={filtered.riskCounts.victims} />
        <StatCard title="Агрессоры высокого риска" value={filtered.riskCounts.aggressors} />
      </div>

      <div className="card">
        <h2 className="section-title">Шкалы методики (по фильтру)</h2>
        {scaleEntries.map(([key, scale]) => (
          <ScaleGauge key={key} {...scale} />
        ))}
      </div>

      <div className="card">
        <h2 className="section-title">Анкеты по фильтру</h2>
        {filtered.submissions.length === 0 ? (
          <p className="subtitle">Анкет пока нет</p>
        ) : (
          <div className="table-wrap">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Область</th>
                  <th>Город/район</th>
                  <th>Школа</th>
                  <th>Класс</th>
                  <th>Прямая викт.</th>
                  <th>Косв. викт.</th>
                  <th>Прямая агрессия</th>
                  <th>Косв. агрессия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.submissions.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>{s.region}</td>
                    <td>{s.city}</td>
                    <td>№{s.school}</td>
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
