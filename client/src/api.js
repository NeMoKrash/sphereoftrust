const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error || 'Что-то пошло не так, попробуйте ещё раз')
  }

  return data
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export function getQuestions() {
  return request('/questions')
}

export function submitSurvey(payload) {
  return request('/submissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function adminLogin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function getAdminMe(token) {
  return request('/admin/me', { headers: authHeaders(token) })
}

export function getAdminQuestions(token) {
  return request('/admin/questions', { headers: authHeaders(token) })
}

export function updateAdminQuestion(token, id, changes) {
  return request(`/admin/questions/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(changes),
  })
}

export function getStats(token, filters = {}) {
  const params = new URLSearchParams()
  if (filters.grade) params.set('grade', filters.grade)
  if (filters.gradeLetter) params.set('gradeLetter', filters.gradeLetter)
  const query = params.toString()
  return request(`/admin/stats${query ? `?${query}` : ''}`, {
    headers: authHeaders(token),
  })
}

export function getPublicSummary() {
  return request('/public/summary')
}

export function getSuperAdminAdmins(token) {
  return request('/superadmin/admins', { headers: authHeaders(token) })
}

export function createSuperAdminAdmin(token, data) {
  return request('/superadmin/admins', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export function deleteSuperAdminAdmin(token, id) {
  return request(`/superadmin/admins/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function getSuperAdminStats(token, filters = {}) {
  const params = new URLSearchParams()
  if (filters.region) params.set('region', filters.region)
  if (filters.school) params.set('school', filters.school)
  if (filters.grade) params.set('grade', filters.grade)
  if (filters.gradeLetter) params.set('gradeLetter', filters.gradeLetter)
  const query = params.toString()
  return request(`/superadmin/stats${query ? `?${query}` : ''}`, {
    headers: authHeaders(token),
  })
}
