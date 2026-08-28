import { useEffect, useState } from 'react'
import { getPublicSummary } from '../api'
import { useLanguage } from '../context/LanguageContext'
import { REGIONS } from '../data/regions'
import SiteHeader from '../components/SiteHeader'
import StatCard from '../components/StatCard'
import './ClimateMapPage.css'

function levelColor(index) {
  if (index >= 70) return 'high'
  if (index >= 40) return 'medium'
  return 'low'
}

export default function ClimateMapPage() {
  const { lang, t } = useLanguage()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
  }, [])

  const regionLabel = (ru) => {
    const region = REGIONS.find((r) => r.ru === ru)
    return region ? (lang === 'kz' ? region.kz : region.ru) : ru
  }

  return (
    <div className="climate-page">
      <SiteHeader />

      <div className="page">
        <div className="page-wide">
          <div className="card">
            <div className="eyebrow">{t('map.eyebrow')}</div>
            <h1 className="title">{t('map.title')}</h1>
            <p className="subtitle">{t('map.subtitle')}</p>
          </div>

          {error && <p className="field-error" style={{ marginTop: 16 }}>{error}</p>}

          {summary && (
            <>
              <div className="climate-stat-row">
                <StatCard title={t('map.totalLabel')} value={summary.totalSubmissions} />
                <StatCard title={t('map.regionsLabel')} value={`${summary.regionsCount} / ${REGIONS.length}`} />
                <StatCard title={t('map.schoolsLabel')} value={summary.schoolsCount} />
              </div>

              <div className="card" style={{ marginTop: 20 }}>
                <h2 className="section-title">{t('map.regionListTitle')}</h2>
                <div className="region-grid">
                  {summary.perRegion.map((r) => (
                    <div className="region-card" key={r.region}>
                      <div className="region-card__name">{regionLabel(r.region)}</div>
                      {r.submissions > 0 ? (
                        <>
                          <div className={`region-card__index region-card__index--${levelColor(r.safetyIndex)}`}>
                            {r.safetyIndex}%
                          </div>
                          <div className="region-card__count">{r.submissions}</div>
                        </>
                      ) : (
                        <div className="region-card__empty">{t('map.noData')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
