import { createContext, useContext, useMemo, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'sphere_lang'

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'kz') return saved
  } catch {
    // localStorage недоступен — используем язык по умолчанию
  }
  return 'ru'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  const setLang = (next) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ничего страшного, просто не сохранится между визитами
    }
  }

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key) => translations[lang]?.[key] ?? translations.ru[key] ?? key,
    }),
    [lang]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage должен использоваться внутри LanguageProvider')
  return ctx
}
