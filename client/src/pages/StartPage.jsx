import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSurvey } from '../context/SurveyContext'
import { useLanguage } from '../context/LanguageContext'
import { REGIONS } from '../data/regions'
import { GRADE_LETTERS } from '../data/gradeLetters'
import SiteHeader from '../components/SiteHeader'
import './StartPage.css'

const GRADES = Array.from({ length: 11 }, (_, i) => i + 1)
const OTHER_CITY = '__other__'

export default function StartPage() {
  const { setStudent, resetSurvey } = useSurvey()
  const { lang, t } = useLanguage()
  const navigate = useNavigate()

  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  const [cityOther, setCityOther] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [gradeLetter, setGradeLetter] = useState('')
  const [error, setError] = useState('')

  const regionData = REGIONS.find((r) => r.ru === region)
  const isOtherCity = city === OTHER_CITY

  const handleRegionChange = (value) => {
    setRegion(value)
    setCity('')
    setCityOther('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const finalCity = isOtherCity ? cityOther.trim() : city

    if (!region || !finalCity || !school.trim() || !gradeLetter) {
      setError(t('form.errorRequired'))
      return
    }

    const gradeNumber = Number(grade)
    if (!Number.isInteger(gradeNumber) || gradeNumber < 1 || gradeNumber > 11) {
      setError(t('form.errorGrade'))
      return
    }

    setError('')
    resetSurvey()
    setStudent({
      region,
      city: finalCity,
      school: school.trim(),
      grade: gradeNumber,
      gradeLetter,
    })
    navigate('/survey')
  }

  return (
    <div className="start-page">
      <SiteHeader />

      <div className="page">
        <div className="page-narrow">
          <div className="card">
            <div className="eyebrow">{t('home.eyebrow')}</div>
            <h1 className="title">{t('start.title')}</h1>
            <p className="subtitle">{t('start.subtitle')}</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="region">{t('form.region')}</label>
                <select id="region" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
                  <option value="">{t('form.regionPlaceholder')}</option>
                  {REGIONS.map((r) => (
                    <option key={r.ru} value={r.ru}>
                      {lang === 'kz' ? r.kz : r.ru}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">{t('form.city')}</label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!region}
                >
                  <option value="">{t('form.cityPlaceholder')}</option>
                  {regionData?.cities.map((c) => (
                    <option key={c.ru} value={c.ru}>
                      {lang === 'kz' ? c.kz : c.ru}
                    </option>
                  ))}
                  <option value={OTHER_CITY}>{t('form.cityOther')}</option>
                </select>

                {isOtherCity && (
                  <input
                    style={{ marginTop: 10 }}
                    value={cityOther}
                    onChange={(e) => setCityOther(e.target.value)}
                    placeholder={t('form.cityOtherPlaceholder')}
                  />
                )}
              </div>

              <div className="field">
                <label htmlFor="school">{t('form.school')}</label>
                <div className="input-with-prefix">
                  <span className="input-with-prefix__symbol">№</span>
                  <input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('form.schoolPlaceholder')}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="grade">{t('form.grade')}</label>
                  <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="">—</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="gradeLetter">{t('form.gradeLetter')}</label>
                  <select
                    id="gradeLetter"
                    value={gradeLetter}
                    onChange={(e) => setGradeLetter(e.target.value)}
                  >
                    <option value="">—</option>
                    {GRADE_LETTERS.map((letter) => (
                      <option key={letter} value={letter}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="field-error" style={{ marginTop: 14 }}>{error}</div>}

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 26 }}>
                {t('form.start')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
