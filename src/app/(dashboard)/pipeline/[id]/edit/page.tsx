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

type Pipeline = {
  id: string
  name: string
  description: string | null
  value: number | null
  probability: number
  status: string
  siteId: string
}

export default function EditPipelinePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [pipelineRes, sitesRes] = await Promise.all([
        fetch(`/api/pipelines/${params.id}`),
        fetch('/api/sites'),
      ])
      const pipelineData = await pipelineRes.json()
      const sitesData = await sitesRes.json()
      setPipeline(pipelineData)
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
      description: formData.get('description') as string || null,
      value: parseInt(formData.get('value') as string) || 0,
      probability: parseInt(formData.get('probability') as string) || 50,
      status: formData.get('status') as string,
      siteId: formData.get('siteId') as string,
    }

    try {
      const res = await fetch(`/api/pipelines/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update opportunity')
      }

      router.push('/pipeline')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this opportunity?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/pipelines/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete opportunity')
      }

      router.push('/pipeline')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  if (!pipeline) {
    return <div className="text-surface-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
          <Link href="/pipeline" className="hover:text-primary-600">
            Pipeline
          </Link>
          <span>/</span>
          <span>{pipeline.name}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Edit Opportunity
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
            <select name="siteId" required className="input" defaultValue={pipeline.siteId}>
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
              Opportunity Name *
            </label>
            <input
              name="name"
              type="text"
              required
              className="input"
              defaultValue={pipeline.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="input"
              defaultValue={pipeline.description || ''}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Value
              </label>
              <input
                name="value"
                type="number"
                className="input"
                defaultValue={pipeline.value || 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Probability (%)
              </label>
              <input
                name="probability"
                type="number"
                min="0"
                max="100"
                className="input"
                defaultValue={pipeline.probability}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Status
              </label>
              <select name="status" className="input" defaultValue={pipeline.status}>
                <option value="PROSPECT">Prospect</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger btn-md"
            >
              {deleting ? 'Deleting...' : 'Delete Opportunity'}
            </button>
            <div className="flex gap-3">
              <Link href="/pipeline" className="btn-secondary btn-md">
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
