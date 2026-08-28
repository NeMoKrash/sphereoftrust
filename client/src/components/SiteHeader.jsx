import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { LANGS } from '../i18n/translations'
import './SiteHeader.css'

export default function SiteHeader() {
  const { lang, setLang, t } = useLanguage()

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo">
        {t('siteName')}
      </Link>

      <nav className="site-header__nav">
        <Link to="/about">{t('nav.about')}</Link>
        <Link to="/">{t('nav.survey')}</Link>
        <Link to="/climate-map">{t('nav.map')}</Link>
        <Link to="/admin/login">{t('nav.admin')}</Link>
      </nav>

      <div className="site-header__lang">
        {LANGS.map((code) => (
          <button
            key={code}
            type="button"
            className={code === lang ? 'is-active' : ''}
            onClick={() => setLang(code)}
          >
            {code === 'ru' ? 'РУС' : 'ҚАЗ'}
          </button>
        ))}
      </div>
    </header>
  )
}
