import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getPipelines() {
  return prisma.pipeline.findMany({
    include: {
      site: { include: { customer: true } },
    },
    orderBy: { status: 'asc' },
  })
}

const statusColors = {
  PROSPECT: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-300',
  QUALIFIED: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
  PROPOSAL: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300',
  NEGOTIATION: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
  CLOSED_WON: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
  CLOSED_LOST: 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300',
}

export default async function PipelinePage() {
  const pipelines = await getPipelines()

  const totalValue = pipelines.reduce((sum, p) => sum + (p.value || 0), 0)
  const weightedValue = pipelines.reduce((sum, p) => sum + ((p.value || 0) * (p.probability || 0) / 100), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Sales Pipeline
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {pipelines.length} opportunities • ${totalValue.toLocaleString()} total value • ${Math.round(weightedValue).toLocaleString()} weighted
          </p>
        </div>
        <Link href="/pipeline/new" className="btn-primary btn-md">
          + Add Opportunity
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pipelines.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-surface-500 mb-4">No opportunities yet</p>
            <Link href="/pipeline/new" className="btn-primary btn-md">
              Add Your First Opportunity
            </Link>
          </div>
        ) : (
          pipelines.map((pipeline) => {
            const statusKey = pipeline.status as keyof typeof statusColors
            return (
              <div key={pipeline.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/pipeline/${pipeline.id}/edit`}
                        className="font-semibold text-primary-600 hover:text-primary-500"
                      >
                        {pipeline.name}
                      </Link>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[statusKey]}`}>
                        {pipeline.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                      {pipeline.site.customer.name} • {pipeline.site.name}
                    </p>
                    {pipeline.description && (
                      <p className="text-sm text-surface-500 mb-2">{pipeline.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-surface-500">
                      <span>${pipeline.value?.toLocaleString() || 0}</span>
                      <span>{pipeline.probability}% probability</span>
                      {pipeline.value && pipeline.probability && (
                        <span>${Math.round((pipeline.value * pipeline.probability) / 100).toLocaleString()} weighted</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/pipeline/${pipeline.id}/edit`}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
