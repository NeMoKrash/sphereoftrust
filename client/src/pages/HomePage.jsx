import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicSummary } from '../api'
import { useLanguage } from '../context/LanguageContext'
import SiteHeader from '../components/SiteHeader'
import StatCard from '../components/StatCard'
import './HomePage.css'

export default function HomePage() {
  const { t } = useLanguage()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getPublicSummary()
      .then(setSummary)
      .catch(() => {
        // Публичная статистика необязательна для лендинга — просто не покажем блок
      })
  }, [])

  return (
    <div className="home-page">
      <SiteHeader />

      <div className="page">
        <div className="page-narrow">
          <div className="card home-hero">
            <div className="eyebrow">{t('home.eyebrow')}</div>
            <h1 className="title">{t('home.title')}</h1>
            <p className="subtitle">{t('home.subtitle')}</p>

            <div className="privacy-badge">
              <div className="privacy-badge__title">{t('home.privacyTitle')}</div>
              <div className="privacy-badge__text">{t('home.privacyText')}</div>
            </div>

            <Link to="/start" className="btn btn-primary btn-block" style={{ marginTop: 24 }}>
              {t('home.cta')}
            </Link>
          </div>

          {summary && (
            <div className="card home-stats">
              <div className="home-stats__label">{t('home.statsTeaser')}</div>
              <div className="home-stats__row">
                <StatCard title={t('map.totalLabel')} value={summary.totalSubmissions} />
                <StatCard title={t('map.regionsLabel')} value={`${summary.regionsCount} / 20`} />
                <StatCard title={t('map.schoolsLabel')} value={summary.schoolsCount} />
              </div>
              <Link to="/climate-map" className="home-link">
                {t('home.viewMap')}
              </Link>
            </div>
          )}

          <div className="card home-methodology">
            <p>{t('home.methodologyTeaser')}</p>
            <Link to="/about" className="home-link">
              {t('home.learnMore')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
