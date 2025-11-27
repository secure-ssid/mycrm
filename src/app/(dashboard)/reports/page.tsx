import { prisma } from '@/lib/db'

async function getStats() {
  const [customers, sites, contacts, pipelines, tasks] = await Promise.all([
    prisma.customer.count(),
    prisma.site.count(),
    prisma.contact.count(),
    prisma.pipeline.findMany({
      select: { value: true, status: true },
    }),
    prisma.task.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  const openPipelineValue = pipelines
    .filter((p) => p.status === 'OPEN' || p.status === 'CLOSING_SOON')
    .reduce((sum, p) => sum + Number(p.value), 0)

  const wonPipelineValue = pipelines
    .filter((p) => p.status === 'CLOSED_WON')
    .reduce((sum, p) => sum + Number(p.value), 0)

  const taskStats = {
    pending: tasks.find((t) => t.status === 'PENDING')?._count || 0,
    inProgress: tasks.find((t) => t.status === 'IN_PROGRESS')?._count || 0,
    done: tasks.find((t) => t.status === 'DONE')?._count || 0,
  }

  return {
    customers,
    sites,
    contacts,
    openPipelineValue,
    wonPipelineValue,
    taskStats,
  }
}

export default async function ReportsPage() {
  const stats = await getStats()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Reports
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          Overview of your CRM metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Customers"
          value={stats.customers}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Sites"
          value={stats.sites}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          }
        />
        <StatCard
          label="Contacts"
          value={stats.contacts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Open Pipeline"
          value={`$${stats.openPipelineValue.toLocaleString()}`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Pipeline Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Pipeline Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-surface-600 dark:text-surface-400">Open Value</span>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ${stats.openPipelineValue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-600 dark:text-surface-400">Won (Lifetime)</span>
              <span className="text-xl font-bold text-success-600 dark:text-success-400">
                ${stats.wonPipelineValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Task Status
          </h2>
          <div className="space-y-3">
            <TaskBar label="Pending" count={stats.taskStats.pending} color="surface" />
            <TaskBar label="In Progress" count={stats.taskStats.inProgress} color="warning" />
            <TaskBar label="Done" count={stats.taskStats.done} color="success" />
          </div>
        </div>
      </div>

      <div className="card p-6 text-center text-surface-500">
        <p>More reports and charts coming soon...</p>
        <p className="text-sm mt-1">Pipeline trends, contact activity, goal progress</p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-primary-500">{icon}</div>
        <span className="text-sm text-surface-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        {value}
      </p>
    </div>
  )
}

function TaskBar({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: 'surface' | 'warning' | 'success'
}) {
  const colors = {
    surface: 'bg-surface-400',
    warning: 'bg-warning-500',
    success: 'bg-success-500',
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-surface-600 dark:text-surface-400">{label}</span>
      <div className="flex-1 h-4 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color]}`}
          style={{ width: `${Math.max(count * 10, 5)}%` }}
        />
      </div>
      <span className="w-8 text-sm font-medium text-surface-700 dark:text-surface-300 text-right">
        {count}
      </span>
    </div>
  )
}
