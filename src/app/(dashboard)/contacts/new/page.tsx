'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Site = {
  id: string
  name: string
  customer: {
    id: string
    name: string
  }
}

export default function NewContactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sites, setSites] = useState<Site[]>([])

  useEffect(() => {
    async function fetchSites() {
      const res = await fetch('/api/sites')
      const data = await res.json()
      setSites(data)
    }
    fetchSites()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      role: formData.get('role') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      isChampion: formData.get('isChampion') === 'on',
      notes: formData.get('notes') as string || null,
      siteId: formData.get('siteId') as string,
    }

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to create contact')
      }

      router.push('/contacts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/contacts" className="hover:text-primary-600">
            Contacts
          </Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Add Contact
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
              Site *
            </label>
            <select name="siteId" required className="input">
              <option value="">Select a site...</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.customer.name} - {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Name *
            </label>
            <input name="name" type="text" required className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Role
            </label>
            <input name="role" type="text" className="input" placeholder="VP of Operations" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email
              </label>
              <input name="email" type="email" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Phone
              </label>
              <input name="phone" type="tel" className="input" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input name="isChampion" type="checkbox" className="w-4 h-4 rounded" />
            <label className="text-sm text-surface-700 dark:text-surface-300">
              Mark as Champion (key advocate)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Notes
            </label>
            <textarea name="notes" rows={3} className="input" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary btn-md">
              {loading ? 'Creating...' : 'Create Contact'}
            </button>
            <Link href="/contacts" className="btn-secondary btn-md">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
