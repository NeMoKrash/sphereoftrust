import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import SiteHeader from '../components/SiteHeader'
import './AboutPage.css'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="about-page">
      <SiteHeader />

      <div className="page">
        <div className="page-narrow">
          <div className="card">
            <div className="eyebrow">{t('about.eyebrow')}</div>
            <h1 className="title">{t('about.title')}</h1>

            <section className="about-section">
              <h2>{t('about.relevanceTitle')}</h2>
              <p>{t('about.relevanceText')}</p>
            </section>

            <section className="about-section">
              <h2>{t('about.methodologyTitle')}</h2>
              <p>{t('about.methodologyText')}</p>
            </section>

            <Link to="/author" className="about-authors-link">
              Об авторах проекта →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
