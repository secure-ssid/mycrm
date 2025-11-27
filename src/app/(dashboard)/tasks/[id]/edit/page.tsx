'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
}

type Task = {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  priority: string
  status: string
  customerId: string
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [task, setTask] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [taskRes, customersRes] = await Promise.all([
        fetch(`/api/tasks/${params.id}`),
        fetch('/api/customers'),
      ])
      const taskData = await taskRes.json()
      const customersData = await customersRes.json()
      setTask(taskData)
      setCustomers(customersData)
    }
    fetchData()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      dueDate: formData.get('dueDate') as string || null,
      priority: formData.get('priority') as string,
      status: formData.get('status') as string,
      customerId: formData.get('customerId') as string,
    }

    try {
      const res = await fetch(`/api/tasks/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update task')
      }

      router.push('/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete task')
      }

      router.push('/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  if (!task) {
    return <div className="text-surface-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/tasks" className="hover:text-primary-600">
            Tasks
          </Link>
          <span>/</span>
          <span>{task.title}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Task
        </h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Customer *
            </label>
            <select name="customerId" required className="input" defaultValue={task.customerId}>
              <option value="">Select a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Task Title *
            </label>
            <input
              name="title"
              type="text"
              required
              className="input"
              defaultValue={task.title}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="input"
              defaultValue={task.description || ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                className="input"
                defaultValue={task.dueDate ? task.dueDate.split('T')[0] : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Priority
              </label>
              <select name="priority" className="input" defaultValue={task.priority}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Status
            </label>
            <select name="status" className="input" defaultValue={task.status}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger btn-md"
            >
              {deleting ? 'Deleting...' : 'Delete Task'}
            </button>
            <div className="flex gap-3">
              <Link href="/tasks" className="btn-secondary btn-md">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="btn-primary btn-md">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
