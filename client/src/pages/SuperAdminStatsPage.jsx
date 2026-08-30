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
  const [city, setCity] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [gradeLetter, setGradeLetter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getSuperAdminStats(token, { region, city, school, grade, gradeLetter })
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
  }, [region, city, school, grade, gradeLetter])

  if (error) return <p className="field-error">{error}</p>
  if (!stats) return <p className="subtitle">Загрузка статистики…</p>

  const { overview, drill, filtered } = stats
  const scaleEntries = Object.entries(filtered.scaleAverages)
  // Пока новый ответ сервера ещё в пути после клика, drill может на мгновение
  // отставать от уже обновлённых region/city — подстрахуемся пустым массивом.
  const byDistrict = drill.byDistrict || []
  const bySchool = drill.bySchool || []

  const gotoCountry = () => {
    setRegion('')
    setCity('')
    setSchool('')
  }
  const gotoRegion = () => {
    setCity('')
    setSchool('')
  }
  const gotoDistrict = () => setSchool('')

  return (
    <div className="dashboard">
      <div className="card">
        <div className="breadcrumb">
          <button type="button" className={!region ? 'is-current' : ''} onClick={gotoCountry}>
            Казахстан
          </button>
          {region && (
            <>
              <span className="breadcrumb__sep">→</span>
              <button type="button" className={!city ? 'is-current' : ''} onClick={gotoRegion}>
                {region}
              </button>
            </>
          )}
          {city && (
            <>
              <span className="breadcrumb__sep">→</span>
              <button type="button" className={!school ? 'is-current' : ''} onClick={gotoDistrict}>
                {city}
              </button>
            </>
          )}
          {school && (
            <>
              <span className="breadcrumb__sep">→</span>
              <span className="is-current">Школа №{school}</span>
            </>
          )}
        </div>

        {!region && (
          <>
            <h2 className="section-title" style={{ marginTop: 20 }}>
              Срез по стране — выберите область
            </h2>
            <div className="climate-stat-row">
              <StatCard title="Прошли опрос" value={overview.totalSubmissions} />
              <StatCard title="Регионов подключено" value={`${overview.regionsCount} / ${REGIONS.length}`} />
              <StatCard title="Школ охвачено" value={overview.schoolsCount} />
            </div>
            <div className="region-grid" style={{ marginTop: 20 }}>
              {overview.perRegion.map((r) => (
                <button
                  type="button"
                  className="region-card region-card--clickable"
                  key={r.region}
                  onClick={() => setRegion(r.region)}
                >
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
                </button>
              ))}
            </div>
          </>
        )}

        {region && !city && (
          <>
            <h2 className="section-title" style={{ marginTop: 20 }}>
              Срез по области — выберите район
            </h2>
            {byDistrict.length === 0 ? (
              <p className="subtitle">В этой области пока нет анкет</p>
            ) : (
              <div className="region-grid" style={{ marginTop: 12 }}>
                {byDistrict.map((d) => (
                  <button
                    type="button"
                    className="region-card region-card--clickable"
                    key={d.city}
                    onClick={() => setCity(d.city)}
                  >
                    <div className="region-card__name">{d.city}</div>
                    <div className={`region-card__index region-card__index--${levelColor(d.safetyIndex)}`}>
                      {d.safetyIndex}%
                    </div>
                    <div className="region-card__count">{d.submissions}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {region && city && !school && (
          <>
            <h2 className="section-title" style={{ marginTop: 20 }}>
              Срез по району — выберите школу
            </h2>
            {bySchool.length === 0 ? (
              <p className="subtitle">В этом районе пока нет анкет</p>
            ) : (
              <div className="region-grid" style={{ marginTop: 12 }}>
                {bySchool.map((s) => (
                  <button
                    type="button"
                    className="region-card region-card--clickable"
                    key={s.school}
                    onClick={() => setSchool(s.school)}
                  >
                    <div className="region-card__name">Школа №{s.school}</div>
                    <div className={`region-card__index region-card__index--${levelColor(s.safetyIndex)}`}>
                      {s.safetyIndex}%
                    </div>
                    <div className="region-card__count">{s.submissions}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {region && city && school && (
        <>
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
            <StatCard title="Анкет по фильтру" value={filtered.total} />
            <StatCard title="Индекс безопасности среды" value={`${filtered.maps.safetyIndex}%`} />
            <StatCard title="Жертвы высокого риска" value={filtered.riskCounts.victims} />
            <StatCard title="Агрессоры высокого риска" value={filtered.riskCounts.aggressors} />
          </div>

          <div className="card">
            <h2 className="section-title">Отчёт по школе: шкалы методики</h2>
            {scaleEntries.map(([key, scale]) => (
              <ScaleGauge key={key} {...scale} />
            ))}
          </div>

          <div className="card">
            <h2 className="section-title">Анкеты школы</h2>
            {filtered.submissions.length === 0 ? (
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
                    {filtered.submissions.map((s) => (
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
        </>
      )}
    </div>
  )
}
