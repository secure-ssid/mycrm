'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Strategy = {
  id?: string
  overview: string
  currentStatus: string
  painPoints: string
  opportunities: string
  actionPlan: string
  nextSteps: string
  onenoteLink: string
}

type Customer = {
  id: string
  name: string
  strategy: Strategy | null
}

export default function EditStrategyPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  const [formData, setFormData] = useState({
    overview: '',
    currentStatus: '',
    painPoints: '',
    opportunities: '',
    actionPlan: '',
    nextSteps: '',
    onenoteLink: '',
  })

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/customers/${params.id}`)
        if (!res.ok) throw new Error('Customer not found')
        const data = await res.json()
        setCustomer(data)

        if (data.strategy) {
          setFormData({
            overview: data.strategy.overview || '',
            currentStatus: data.strategy.currentStatus || '',
            painPoints: data.strategy.painPoints || '',
            opportunities: data.strategy.opportunities || '',
            actionPlan: data.strategy.actionPlan || '',
            nextSteps: data.strategy.nextSteps || '',
            onenoteLink: data.strategy.onenoteLink || '',
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customer')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/customers/${params.id}/strategy`, {
        method: customer?.strategy ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to save strategy')
      }

      router.push(`/customers/${params.id}/strategy`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-200 rounded w-48 mb-6"></div>
          <div className="card p-6 space-y-4">
            <div className="h-32 bg-surface-200 rounded"></div>
            <div className="h-32 bg-surface-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-4xl">
        <div className="card p-6 text-center">
          <p className="text-danger-500">{error || 'Customer not found'}</p>
          <Link href="/customers" className="btn-secondary btn-md mt-4">
            Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/customers" className="hover:text-primary-600">
            Customers
          </Link>
          <span>/</span>
          <Link href={`/customers/${customer.id}`} className="hover:text-primary-600">
            {customer.name}
          </Link>
          <span>/</span>
          <Link href={`/customers/${customer.id}/strategy`} className="hover:text-primary-600">
            Strategy
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          {customer.strategy ? 'Edit Strategy' : 'Create Strategy'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 text-sm">
            {error}
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Overview
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Account Overview
              </label>
              <textarea
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                rows={4}
                className="input"
                placeholder="Describe the customer relationship, key partnerships, and overall strategy..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Current Status
              </label>
              <textarea
                value={formData.currentStatus}
                onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                rows={2}
                className="input"
                placeholder="Current state of the relationship and any active initiatives..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                OneNote Link
              </label>
              <input
                type="url"
                value={formData.onenoteLink}
                onChange={(e) => setFormData({ ...formData, onenoteLink: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Pain Points
            </h2>
            <textarea
              value={formData.painPoints}
              onChange={(e) => setFormData({ ...formData, painPoints: e.target.value })}
              rows={6}
              className="input"
              placeholder='JSON format: [{"title": "Issue", "description": "Details"}]'
            />
            <p className="text-xs text-surface-500 mt-2">
              Enter as JSON array or plain text
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Opportunities
            </h2>
            <textarea
              value={formData.opportunities}
              onChange={(e) => setFormData({ ...formData, opportunities: e.target.value })}
              rows={6}
              className="input"
              placeholder='JSON format: [{"title": "Opportunity", "description": "Details"}]'
            />
            <p className="text-xs text-surface-500 mt-2">
              Enter as JSON array or plain text
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Action Plan
            </h2>
            <textarea
              value={formData.actionPlan}
              onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
              rows={6}
              className="input"
              placeholder='JSON format: [{"initiative": "Name", "tasks": ["Task 1", "Task 2"]}]'
            />
            <p className="text-xs text-surface-500 mt-2">
              Enter as JSON array or plain text
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Next Steps
            </h2>
            <textarea
              value={formData.nextSteps}
              onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
              rows={6}
              className="input"
              placeholder='JSON format: [{"step": "Description", "dueDate": "2024-03-01"}]'
            />
            <p className="text-xs text-surface-500 mt-2">
              Enter as JSON array or plain text
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary btn-md"
          >
            {saving ? 'Saving...' : 'Save Strategy'}
          </button>
          <Link
            href={`/customers/${customer.id}/strategy`}
            className="btn-secondary btn-md"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
