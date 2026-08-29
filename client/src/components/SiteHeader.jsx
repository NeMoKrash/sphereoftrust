import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { LANGS } from '../i18n/translations'
import './SiteHeader.css'

export default function SiteHeader() {
  const { lang, setLang, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)

  return (
    <header className="site-header">
      <div className="site-header__row">
        <Link to="/" className="site-header__logo" onClick={close}>
          {t('siteName')}
        </Link>

        <nav className="site-header__nav">
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/start">{t('nav.survey')}</Link>
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

        <button
          type="button"
          className={`site-header__burger${isOpen ? ' is-open' : ''}`}
          aria-label="Меню"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {isOpen && (
        <nav className="site-header__mobile-nav">
          <Link to="/about" onClick={close}>{t('nav.about')}</Link>
          <Link to="/start" onClick={close}>{t('nav.survey')}</Link>
          <Link to="/climate-map" onClick={close}>{t('nav.map')}</Link>
          <Link to="/admin/login" onClick={close}>{t('nav.admin')}</Link>

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
        </nav>
      )}
    </header>
  )
}
