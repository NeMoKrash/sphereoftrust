import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import './ThankYouPage.css'

export default function ThankYouPage() {
  const { t } = useLanguage()

  return (
    <div className="thankyou-page">
      <SiteHeader />

      <div className="page">
        <div className="page-narrow">
          <div className="card thank-you-card">
            <div className="thank-you-badge">{t('thankyou.badge')}</div>
            <h1 className="title">{t('thankyou.title')}</h1>
            <p className="subtitle">{t('thankyou.text')}</p>

            <Link to="/" className="btn btn-ghost btn-block" style={{ marginTop: 24 }}>
              {t('thankyou.home')}
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
