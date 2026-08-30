import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../adminAuth'
import { getAdminMe } from '../api'
import './AdminLayout.css'

export default function SuperAdminLayout() {
  const navigate = useNavigate()
  const token = getToken()
  const [status, setStatus] = useState('checking') // checking | super | not-super

  useEffect(() => {
    if (!token) return
    getAdminMe(token)
      .then((me) => setStatus(me.isSuperAdmin ? 'super' : 'not-super'))
      .catch(() => setStatus('not-super'))
  }, [token])

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  if (status === 'checking') {
    return <p className="subtitle" style={{ padding: 32 }}>Проверяем доступ…</p>
  }

  if (status === 'not-super') {
    return <Navigate to="/admin" replace />
  }

  const handleLogout = () => {
    clearToken()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__title">Сенім аясы / Сфера доверия · Супер-админ</div>

        <nav className="admin-header__nav">
          <NavLink to="/superadmin" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Статистика РК
          </NavLink>
          <NavLink
            to="/superadmin/admins"
            className={({ isActive }) => (isActive ? 'is-active' : '')}
          >
            Психологи
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
