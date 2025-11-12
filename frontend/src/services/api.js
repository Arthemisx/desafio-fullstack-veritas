// Use relative paths in dev; Vite proxy forwards to backend.
const API_URL = ''

async function http(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export function fetchTasks() {
  return http('GET', '/tasks')
}

export function createTask(task) {
  return http('POST', '/tasks', task)
}

export function updateTask(id, partial) {
  return http('PUT', `/tasks/${id}`, partial)
}

export function deleteTask(id) {
  return http('DELETE', `/tasks/${id}`)
}



