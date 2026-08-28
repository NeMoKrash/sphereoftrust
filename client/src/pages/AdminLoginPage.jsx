import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../api'
import { setToken } from '../adminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await adminLogin(username, password)
      setToken(token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="card">
          <div className="eyebrow">Сфера доверия</div>
          <h1 className="title">Вход</h1>
          <p className="subtitle">Кабинет психолога — доступ только для специалистов школы</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Логин</label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="field-error" style={{ marginTop: 14 }}>{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: 26 }}
              disabled={loading}
            >
              {loading ? 'Входим…' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
