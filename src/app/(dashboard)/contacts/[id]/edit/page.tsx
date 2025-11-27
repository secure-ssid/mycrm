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

type Contact = {
  id: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  isChampion: boolean
  notes: string | null
  siteId: string
}

export default function EditContactPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [contact, setContact] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [contactRes, sitesRes] = await Promise.all([
        fetch(`/api/contacts/${params.id}`),
        fetch('/api/sites'),
      ])
      const contactData = await contactRes.json()
      const sitesData = await sitesRes.json()
      setContact(contactData)
      setSites(sitesData)
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
      role: formData.get('role') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      isChampion: formData.get('isChampion') === 'on',
      notes: formData.get('notes') as string || null,
      siteId: formData.get('siteId') as string,
    }

    try {
      const res = await fetch(`/api/contacts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update contact')
      }

      router.push('/contacts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this contact?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/contacts/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete contact')
      }

      router.push('/contacts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  if (!contact) {
    return <div className="text-surface-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/contacts" className="hover:text-primary-600">
            Contacts
          </Link>
          <span>/</span>
          <span>{contact.name}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Contact
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
            <select name="siteId" required className="input" defaultValue={contact.siteId}>
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
            <input
              name="name"
              type="text"
              required
              className="input"
              defaultValue={contact.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Role
            </label>
            <input
              name="role"
              type="text"
              className="input"
              defaultValue={contact.role || ''}
              placeholder="VP of Operations"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                className="input"
                defaultValue={contact.email || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                className="input"
                defaultValue={contact.phone || ''}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              name="isChampion"
              type="checkbox"
              className="w-4 h-4 rounded"
              defaultChecked={contact.isChampion}
            />
            <label className="text-sm text-surface-700 dark:text-surface-300">
              Mark as Champion (key advocate)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              className="input"
              defaultValue={contact.notes || ''}
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger btn-md"
            >
              {deleting ? 'Deleting...' : 'Delete Contact'}
            </button>
            <div className="flex gap-3">
              <Link href="/contacts" className="btn-secondary btn-md">
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
