import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../adminAuth'
import './AdminLayout.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  const token = getToken()

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    clearToken()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__title">Сфера доверия · Кабинет психолога</div>

        <nav className="admin-header__nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Статистика
          </NavLink>
          <NavLink
            to="/admin/questions"
            className={({ isActive }) => (isActive ? 'is-active' : '')}
          >
            Вопросы
          </NavLink>
        </nav>

        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Выйти
        </button>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
