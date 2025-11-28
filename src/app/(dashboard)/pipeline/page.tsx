import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

async function getPipelines(userId: string) {
  return prisma.pipeline.findMany({
    where: { site: { customer: { userId } } },
    include: {
      site: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function PipelinePage() {
  const user = await requireAuth()
  const pipelines = await getPipelines(user.id)

  const grouped = {
    OPEN: pipelines.filter((p) => p.status === 'OPEN'),
    CLOSING_SOON: pipelines.filter((p) => p.status === 'CLOSING_SOON'),
    CLOSED_WON: pipelines.filter((p) => p.status === 'CLOSED_WON'),
    CLOSED_LOST: pipelines.filter((p) => p.status === 'CLOSED_LOST'),
  }

  const totalValue = pipelines
    .filter((p) => p.status === 'OPEN' || p.status === 'CLOSING_SOON')
    .reduce((sum, p) => sum + Number(p.value), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Pipeline
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Total open value: ${totalValue.toLocaleString()}
          </p>
        </div>
        <Link href="/pipeline/new" className="btn-primary btn-md">+ Add Opportunity</Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <PipelineColumn title="Open" count={grouped.OPEN.length} pipelines={grouped.OPEN} color="info" />
        <PipelineColumn title="Closing Soon" count={grouped.CLOSING_SOON.length} pipelines={grouped.CLOSING_SOON} color="warning" />
        <PipelineColumn title="Won" count={grouped.CLOSED_WON.length} pipelines={grouped.CLOSED_WON} color="success" />
        <PipelineColumn title="Lost" count={grouped.CLOSED_LOST.length} pipelines={grouped.CLOSED_LOST} color="danger" />
      </div>
    </div>
  )
}

function PipelineColumn({
  title,
  count,
  pipelines,
  color,
}: {
  title: string
  count: number
  pipelines: Awaited<ReturnType<typeof getPipelines>>
  color: 'info' | 'warning' | 'success' | 'danger'
}) {
  const colorClasses = {
    info: 'bg-info-500',
    warning: 'bg-warning-500',
    success: 'bg-success-500',
    danger: 'bg-danger-500',
  }

  return (
    <div className="bg-surface-200 dark:bg-primary-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`} />
        <h2 className="font-semibold text-surface-900 dark:text-surface-100">
          {title}
        </h2>
        <span className="text-sm text-surface-500">({count})</span>
      </div>

      <div className="space-y-3">
        {pipelines.map((pipeline) => (
          <div
            key={pipeline.id}
            className="card p-4 cursor-pointer hover:shadow-dropdown transition-shadow"
          >
            <p className="font-medium text-surface-900 dark:text-surface-100 mb-1">
              {pipeline.description}
            </p>
            <p className="text-sm text-surface-500 mb-2">
              {pipeline.site.customer.name} - {pipeline.site.name}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                ${Number(pipeline.value).toLocaleString()}
              </span>
              {pipeline.expectedClose && (
                <span className="text-surface-500">{pipeline.expectedClose}</span>
              )}
            </div>
          </div>
        ))}

        {pipelines.length === 0 && (
          <p className="text-center text-sm text-surface-500 py-4">
            No opportunities
          </p>
        )}
      </div>
    </div>
  )
}
