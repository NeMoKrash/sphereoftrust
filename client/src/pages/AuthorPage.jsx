import SiteHeader from '../components/SiteHeader'
import './AuthorPage.css'

export default function AuthorPage() {
  return (
    <div className="author-page">
      <SiteHeader />

      <div className="page">
        <div className="page-narrow">
          <div className="card author-card">
            <div className="author-card__line">
              <span className="author-card__label">Автор:</span>
              Абенов Эрик, 10В, Лицей №48
            </div>
            <div className="author-card__line">
              <span className="author-card__label">Руководитель:</span>
              Айтуова Лаззат Рахматуллаевна
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
