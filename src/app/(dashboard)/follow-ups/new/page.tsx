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

export default function NewFollowUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    async function fetchContacts() {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      setContacts(data)
    }
    fetchContacts()
  }, [])

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
      const res = await fetch('/api/touch-bases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to create follow-up')
      }

      router.push('/follow-ups')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/follow-ups" className="hover:text-primary-600">
            Follow-ups
          </Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Log Follow-up
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
            <select name="contactId" required className="input">
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
            <input name="date" type="date" required className="input" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Notes
            </label>
            <textarea name="notes" rows={3} className="input" placeholder="What was discussed..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Outcome
            </label>
            <input name="outcome" type="text" className="input" placeholder="e.g., Positive, Neutral, Needs follow-up" />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Next Steps
            </label>
            <textarea name="nextSteps" rows={2} className="input" placeholder="What's the next action..." />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary btn-md">
              {loading ? 'Creating...' : 'Log Follow-up'}
            </button>
            <Link href="/follow-ups" className="btn-secondary btn-md">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
