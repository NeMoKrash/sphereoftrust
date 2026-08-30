import { useLanguage } from '../context/LanguageContext'
import './SiteFooter.css'

export default function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="site-footer">
      <img src="/logo.svg" alt="" className="site-footer__logo" />
      <div className="site-footer__text">
        <div className="site-footer__name">{t('siteName')}</div>
        <div className="site-footer__note">{t('home.privacyText')}</div>
      </div>
    </footer>
  )
}
