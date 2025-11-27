'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
}

type Meeting = {
  id: string
  title: string
  date: string
  notes: string | null
  attendees: string | null
  customerId: string
}

export default function EditMeetingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [meetingRes, customersRes] = await Promise.all([
        fetch(`/api/meetings/${params.id}`),
        fetch('/api/customers'),
      ])
      const meetingData = await meetingRes.json()
      const customersData = await customersRes.json()
      setMeeting(meetingData)
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
      date: formData.get('date') as string,
      notes: formData.get('notes') as string || null,
      attendees: formData.get('attendees') as string || null,
      customerId: formData.get('customerId') as string,
    }

    try {
      const res = await fetch(`/api/meetings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update meeting')
      }

      router.push('/meetings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this meeting?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/meetings/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete meeting')
      }

      router.push('/meetings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  if (!meeting) {
    return <div className="text-surface-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/meetings" className="hover:text-primary-600">
            Meetings
          </Link>
          <span>/</span>
          <span>{meeting.title}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Meeting
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
            <select name="customerId" required className="input" defaultValue={meeting.customerId}>
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
              Meeting Title *
            </label>
            <input
              name="title"
              type="text"
              required
              className="input"
              defaultValue={meeting.title}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Date & Time *
            </label>
            <input
              name="date"
              type="datetime-local"
              required
              className="input"
              defaultValue={meeting.date.slice(0, 16)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Attendees
            </label>
            <input
              name="attendees"
              type="text"
              className="input"
              defaultValue={meeting.attendees || ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Meeting Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              className="input"
              defaultValue={meeting.notes || ''}
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger btn-md"
            >
              {deleting ? 'Deleting...' : 'Delete Meeting'}
            </button>
            <div className="flex gap-3">
              <Link href="/meetings" className="btn-secondary btn-md">
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
