import React, { useEffect, useMemo, useState } from 'react'
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/api.js'

const COLUMNS = [
  { key: 'todo', title: 'A Fazer' },
  { key: 'in_progress', title: 'Em Progresso' },
  { key: 'done', title: 'Concluídas' }
]

function Column({ title, status, children, onDropTask }) {
  const [isOver, setIsOver] = useState(false)

  function handleDragOver(e) {
    e.preventDefault()
    setIsOver(true)
  }
  function handleDragEnter(e) {
    e.preventDefault()
    setIsOver(true)
  }
  function handleDragLeave() {
    setIsOver(false)
  }
  function handleDrop(e) {
    e.preventDefault()
    setIsOver(false)
    const id = (e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text') || '').trim()
    if (!id) return
    onDropTask(status, id)
  }

  return (
    <div
      className={`column${isOver ? ' drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function TaskCard({ task, onEdit, onMove, onDelete }) {
  return (
    <div
      className="card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
        // Dica visual durante arraste
        e.dataTransfer.effectAllowed = 'move'
      }}
    >
      <div className="card-title">{task.title}</div>
      {task.description ? <div className="card-desc">{task.description}</div> : null}
      <div className="card-actions">
        <button onClick={() => onEdit(task)}>Editar</button>
        <select value={task.status} onChange={(e) => onMove(task, e.target.value)}>
          <option value="todo">A Fazer</option>
          <option value="in_progress">Em Progresso</option>
          <option value="done">Concluídas</option>
        </select>
        <button className="danger" onClick={() => onDelete(task)}>Excluir</button>
      </div>
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchTasks()
      .then((data) => {
        if (!cancelled) {
          setTasks(data || [])
          setError('')
        }
      })
      .catch((err) => !cancelled && setError(err.message || 'Erro ao carregar'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const grouped = useMemo(() => {
    const map = { todo: [], in_progress: [], done: [] }
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t)
    }
    return map
  }, [tasks])

  function onInputChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onAddTask(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Título é obrigatório')
      return
    }
    setSaving(true)
    try {
      const created = await createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        status: 'todo'
      })
      setTasks((prev) => [...prev, created])
      setForm({ title: '', description: '' })
      setError('')
    } catch (err) {
      setError(err.message || 'Erro ao criar tarefa')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(task) {
    const title = window.prompt('Novo título:', task.title)
    if (title == null) return
    const description = window.prompt('Nova descrição (opcional):', task.description || '')
    try {
      const updated = await updateTask(task.id, {
        title: title.trim(),
        description: (description || '').trim()
      })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message || 'Erro ao editar')
    }
  }

  async function handleMove(task, newStatus) {
    if (task.status === newStatus) return
    try {
      const updated = await updateTask(task.id, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message || 'Erro ao mover')
    }
  }

  async function handleDropTask(newStatus, taskId) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    await handleMove(task, newStatus)
  }

  async function handleDelete(task) {
    if (!window.confirm('Excluir esta tarefa?')) return
    try {
      await deleteTask(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(err.message || 'Erro ao excluir')
    }
  }

  return (
    <div className="container">
      <h1>Mini Kanban</h1>

      <form className="form" onSubmit={onAddTask}>
        <input
          name="title"
          placeholder="Título da tarefa"
          value={form.title}
          onChange={onInputChange}
        />
        <input
          name="description"
          placeholder="Descrição (opcional)"
          value={form.description}
          onChange={onInputChange}
        />
        <button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar'}</button>
      </form>

      {loading && <div className="info">Carregando...</div>}
      {!!error && <div className="error">{error}</div>}

      <div className="board">
        {COLUMNS.map((col) => (
          <Column
            key={col.key}
            title={col.title}
            status={col.key}
            onDropTask={handleDropTask}
          >
            {grouped[col.key].map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={handleEdit}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ))}
          </Column>
        ))}
      </div>
    </div>
  )
}

