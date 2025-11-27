'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  industry: string | null
  status: string
}

export default function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/customers/${params.id}`)
        if (!res.ok) throw new Error('Customer not found')
        const data = await res.json()
        setCustomer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customer')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      industry: formData.get('industry') as string || null,
      status: formData.get('status') as string,
    }

    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update customer')
      }

      router.push(`/customers/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-200 rounded w-48 mb-6"></div>
          <div className="card p-6 space-y-4">
            <div className="h-10 bg-surface-200 rounded"></div>
            <div className="h-10 bg-surface-200 rounded"></div>
            <div className="h-10 bg-surface-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-2xl">
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
    <div className="max-w-2xl">
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
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Customer
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
              defaultValue={customer.name}
              className="input"
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
              defaultValue={customer.industry || ''}
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
            <select
              id="status"
              name="status"
              className="input"
              defaultValue={customer.status}
            >
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary btn-md"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href={`/customers/${customer.id}`} className="btn-secondary btn-md">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
