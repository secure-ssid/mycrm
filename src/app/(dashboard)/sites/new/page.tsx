'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
}

export default function NewSitePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(data)
    }
    fetchCustomers()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      address: formData.get('address') as string || null,
      customerId: formData.get('customerId') as string,
    }

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to create site')
      }

      router.push('/sites')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/sites" className="hover:text-primary-600">
            Sites
          </Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Add Site
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
            <select name="customerId" required className="input">
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
              Site Name *
            </label>
            <input
              name="name"
              type="text"
              required
              className="input"
              placeholder="Headquarters, Chicago Office, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows={2}
              className="input"
              placeholder="123 Main St, City, State ZIP"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary btn-md">
              {loading ? 'Creating...' : 'Create Site'}
            </button>
            <Link href="/sites" className="btn-secondary btn-md">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
