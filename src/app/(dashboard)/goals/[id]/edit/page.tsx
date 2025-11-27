'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
}

type Goal = {
  id: string
  title: string
  description: string | null
  targetValue: number | null
  currentValue: number
  metric: string | null
  dueDate: string | null
  status: string
  customerId: string
}

export default function EditGoalPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [goal, setGoal] = useState<Goal | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [goalRes, customersRes] = await Promise.all([
        fetch(`/api/goals/${params.id}`),
        fetch('/api/customers'),
      ])
      const goalData = await goalRes.json()
      const customersData = await customersRes.json()
      setGoal(goalData)
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
      targetValue: formData.get('targetValue') ? parseInt(formData.get('targetValue') as string) : null,
      currentValue: formData.get('currentValue') ? parseInt(formData.get('currentValue') as string) : 0,
      metric: formData.get('metric') as string || null,
      dueDate: formData.get('dueDate') as string || null,
      status: formData.get('status') as string,
      customerId: formData.get('customerId') as string,
    }

    try {
      const res = await fetch(`/api/goals/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update goal')
      }

      router.push('/goals')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this goal?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/goals/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete goal')
      }

      router.push('/goals')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  if (!goal) {
    return <div className="text-surface-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/goals" className="hover:text-primary-600">
            Goals
          </Link>
          <span>/</span>
          <span>{goal.title}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Goal
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
            <select name="customerId" required className="input" defaultValue={goal.customerId}>
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
              Goal Title *
            </label>
            <input
              name="title"
              type="text"
              required
              className="input"
              defaultValue={goal.title}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              className="input"
              defaultValue={goal.description || ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Metric (e.g., %)
              </label>
              <input
                name="metric"
                type="text"
                className="input"
                defaultValue={goal.metric || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                className="input"
                defaultValue={goal.dueDate ? goal.dueDate.split('T')[0] : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Target Value
              </label>
              <input
                name="targetValue"
                type="number"
                className="input"
                defaultValue={goal.targetValue || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Current Value
              </label>
              <input
                name="currentValue"
                type="number"
                className="input"
                defaultValue={goal.currentValue}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Status
            </label>
            <select name="status" className="input" defaultValue={goal.status}>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="AT_RISK">At Risk</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger btn-md"
            >
              {deleting ? 'Deleting...' : 'Delete Goal'}
            </button>
            <div className="flex gap-3">
              <Link href="/goals" className="btn-secondary btn-md">
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
