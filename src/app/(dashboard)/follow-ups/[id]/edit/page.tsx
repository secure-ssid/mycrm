'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Contact = {
  id: string
  name: string
  site: {
    id: string
    name: string
    customer: {
      id: string
      name: string
    }
  }
}

type TouchBase = {
  id: string
  date: string
  notes: string | null
  outcome: string | null
  nextSteps: string | null
  contactId: string
}

export default function EditFollowUpPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [touchBase, setTouchBase] = useState<TouchBase | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [tbRes, contactsRes] = await Promise.all([
        fetch(`/api/touch-bases/${params.id}`),
        fetch('/api/contacts'),
      ])
      const tbData = await tbRes.json()
      const contactsData = await contactsRes.json()
      setTouchBase(tbData)
      setContacts(contactsData)
    }
    fetchData()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      date: formData.get('date') as string,
      notes: formData.get('notes') as string || null,
      outcome: formData.get('outcome') as string || null,
      nextSteps: formData.get('nextSteps') as string || null,
      contactId: formData.get('contactId') as string,
    }

    try {
      const res = await fetch(`/api/touch-bases/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update follow-up')
      }

      router.push('/follow-ups')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this follow-up?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/touch-bases/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete follow-up')
      }

      router.push('/follow-ups')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  if (!touchBase) {
    return <div className="text-surface-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/follow-ups" className="hover:text-primary-600">
            Follow-ups
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Follow-up
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
              Contact *
            </label>
            <select name="contactId" required className="input" defaultValue={touchBase.contactId}>
              <option value="">Select a contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} • {contact.site.customer.name} - {contact.site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Date *
            </label>
            <input
              name="date"
              type="date"
              required
              className="input"
              defaultValue={touchBase.date.split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              className="input"
              defaultValue={touchBase.notes || ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Outcome
            </label>
            <input
              name="outcome"
              type="text"
              className="input"
              defaultValue={touchBase.outcome || ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Next Steps
            </label>
            <textarea
              name="nextSteps"
              rows={2}
              className="input"
              defaultValue={touchBase.nextSteps || ''}
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger btn-md"
            >
              {deleting ? 'Deleting...' : 'Delete Follow-up'}
            </button>
            <div className="flex gap-3">
              <Link href="/follow-ups" className="btn-secondary btn-md">
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
