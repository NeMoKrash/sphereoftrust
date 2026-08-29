import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSuperAdminAdmin, deleteSuperAdminAdmin, getSuperAdminAdmins } from '../api'
import { clearToken, getToken } from '../adminAuth'
import { REGIONS } from '../data/regions'
import './SuperAdminAdminsPage.css'

const emptyForm = { username: '', password: '', region: '', city: '', school: '' }

export default function SuperAdminAdminsPage() {
  const navigate = useNavigate()
  const token = getToken()

  const [admins, setAdmins] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    getSuperAdminAdmins(token)
      .then(setAdmins)
      .catch((err) => {
        if (err.message.toLowerCase().includes('токен')) {
          clearToken()
          navigate('/admin/login')
          return
        }
        setError(err.message)
      })
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await createSuperAdminAdmin(token, form)
      setForm(emptyForm)
      load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSuperAdminAdmin(token, id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <p className="field-error">{error}</p>

  return (
    <div className="dashboard">
      <div className="card">
        <h2 className="section-title">Добавить психолога</h2>
        <form onSubmit={handleCreate}>
          <div className="field-row">
            <div className="field">
              <label>Логин</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Область</label>
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              required
            >
              <option value="">Выберите область</option>
              {REGIONS.map((r) => (
                <option key={r.ru} value={r.ru}>
                  {r.ru}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Город / район</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Например, город Алматы"
                required
              />
            </div>
            <div className="field">
              <label>Номер школы</label>
              <input
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value.replace(/\D/g, '') })}
                placeholder="Например, 48"
                required
              />
            </div>
          </div>

          {formError && <div className="field-error" style={{ marginTop: 14 }}>{formError}</div>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }} disabled={saving}>
            {saving ? 'Создаём…' : 'Создать аккаунт'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title">Существующие аккаунты</h2>
        <div className="table-wrap">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Логин</th>
                <th>Область</th>
                <th>Город/район</th>
                <th>Школа</th>
                <th>Роль</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.username}</td>
                  <td>{a.region}</td>
                  <td>{a.city}</td>
                  <td>{a.isSuperAdmin ? '—' : `№${a.school}`}</td>
                  <td>{a.isSuperAdmin ? 'Супер-админ' : 'Психолог'}</td>
                  <td>
                    {!a.isSuperAdmin && (
                      <button type="button" className="btn btn-ghost" onClick={() => handleDelete(a.id)}>
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
