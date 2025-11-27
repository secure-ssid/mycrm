'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      industry: formData.get('industry') as string || null,
      status: formData.get('status') as string,
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to create customer')
      }

      const customer = await res.json()
      router.push(`/customers/${customer.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/customers" className="hover:text-primary-600">
            Customers
          </Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Add Customer
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
            <label
              htmlFor="name"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
            >
              Customer Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
            >
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              className="input"
              placeholder="Manufacturing, Software, etc."
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
            >
              Status
            </label>
            <select id="status" name="status" className="input">
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-md"
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
            <Link href="/customers" className="btn-secondary btn-md">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
