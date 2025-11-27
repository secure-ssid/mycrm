'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
}

type Site = {
  id: string
  name: string
  address: string | null
  customerId: string
}

export default function EditSitePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [site, setSite] = useState<Site | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [siteRes, customersRes] = await Promise.all([
        fetch(`/api/sites/${params.id}`),
        fetch('/api/customers'),
      ])
      const siteData = await siteRes.json()
      const customersData = await customersRes.json()
      setSite(siteData)
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
      name: formData.get('name') as string,
      address: formData.get('address') as string || null,
      customerId: formData.get('customerId') as string,
    }

    try {
      const res = await fetch(`/api/sites/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update site')
      }

      router.push('/sites')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this site? This will also delete all associated contacts, opportunities, and projects.')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/sites/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete site')
      }

      router.push('/sites')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  if (!site) {
    return <div className="text-surface-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/sites" className="hover:text-primary-600">
            Sites
          </Link>
          <span>/</span>
          <span>{site.name}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Site
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
            <select name="customerId" required className="input" defaultValue={site.customerId}>
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
              defaultValue={site.name}
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
              defaultValue={site.address || ''}
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger btn-md"
            >
              {deleting ? 'Deleting...' : 'Delete Site'}
            </button>
            <div className="flex gap-3">
              <Link href="/sites" className="btn-secondary btn-md">
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
