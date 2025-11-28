import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import {
  PipelineFunnelChart,
  PipelineDistributionChart,
  GoalProgressChart,
} from '@/components/charts/pipeline-charts'

async function getReportData(userId: string) {
  const [customers, sites, contacts, pipelines, tasks, goals] = await Promise.all([
    prisma.customer.count({ where: { userId } }),
    prisma.site.count({ where: { customer: { userId } } }),
    prisma.contact.count({ where: { site: { customer: { userId } } } }),
    prisma.pipeline.findMany({
      where: { site: { customer: { userId } } },
      select: { value: true, status: true },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { customer: { userId } },
      _count: true,
    }),
    prisma.goal.findMany({
      where: { customer: { userId } },
      select: { type: true, actual: true, target: true, quarter: true },
    }),
  ])

  // Aggregate pipeline data by status
  const pipelineByStatus = ['OPEN', 'CLOSING_SOON', 'CLOSED_WON', 'CLOSED_LOST'].map(status => {
    const statusPipelines = pipelines.filter(p => p.status === status)
    return {
      status,
      count: statusPipelines.length,
      value: statusPipelines.reduce((sum, p) => sum + Number(p.value), 0),
    }
  })

  const openPipelineValue = pipelineByStatus
    .filter(p => p.status === 'OPEN' || p.status === 'CLOSING_SOON')
    .reduce((sum, p) => sum + p.value, 0)

  const wonPipelineValue = pipelineByStatus
    .find(p => p.status === 'CLOSED_WON')?.value || 0

  const taskStats = {
    pending: tasks.find((t) => t.status === 'PENDING')?._count || 0,
    inProgress: tasks.find((t) => t.status === 'IN_PROGRESS')?._count || 0,
    done: tasks.find((t) => t.status === 'DONE')?._count || 0,
  }

  // Get current quarter goals
  const currentQuarter = 'Q4 2025' // TODO: Calculate dynamically
  const currentGoals = goals.filter(g => g.quarter === currentQuarter)

  return {
    customers,
    sites,
    contacts,
    pipelineByStatus,
    openPipelineValue,
    wonPipelineValue,
    taskStats,
    goals: currentGoals,
    totalDeals: pipelines.length,
  }
}

export default async function ReportsPage() {
  const user = await requireAuth()
  const data = await getReportData(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Reports
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Overview of your CRM metrics and performance
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Customers"
          value={data.customers}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Sites"
          value={data.sites}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          }
        />
        <StatCard
          label="Contacts"
          value={data.contacts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Deals"
          value={data.totalDeals}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-surface-600 dark:text-surface-400">Open Pipeline Value</span>
            <span className="badge badge-info">Active</span>
          </div>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            ${data.openPipelineValue.toLocaleString()}
          </p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-surface-600 dark:text-surface-400">Closed Won (Lifetime)</span>
            <span className="badge badge-success">Won</span>
          </div>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400">
            ${data.wonPipelineValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline Value by Stage */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Pipeline Value by Stage
          </h2>
          <PipelineFunnelChart data={data.pipelineByStatus} />
        </div>

        {/* Deal Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Deal Distribution
          </h2>
          <PipelineDistributionChart data={data.pipelineByStatus} />
        </div>
      </div>

      {/* Goals Progress Chart */}
      {data.goals.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Q4 2025 Goal Progress
          </h2>
          <GoalProgressChart data={data.goals} />
        </div>
      )}

      {/* Task Status */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Task Status Summary
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <TaskStatusCard label="Pending" count={data.taskStats.pending} color="surface" />
          <TaskStatusCard label="In Progress" count={data.taskStats.inProgress} color="warning" />
          <TaskStatusCard label="Completed" count={data.taskStats.done} color="success" />
        </div>
      </div>

      {/* Pipeline Details Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-surface-100 dark:bg-primary-800 border-b border-surface-200 dark:border-surface-700">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100">
            Pipeline Summary by Stage
          </h2>
        </div>
        <table className="w-full">
          <thead className="bg-surface-50 dark:bg-primary-800">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Stage</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Deals</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Value</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Avg Deal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
            {data.pipelineByStatus.map((stage) => (
              <tr key={stage.status} className="hover:bg-surface-50 dark:hover:bg-primary-800">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stage.status === 'OPEN' ? 'bg-info-500' :
                      stage.status === 'CLOSING_SOON' ? 'bg-warning-500' :
                      stage.status === 'CLOSED_WON' ? 'bg-success-500' :
                      'bg-danger-500'
                    }`} />
                    <span className="font-medium text-surface-900 dark:text-surface-100">
                      {stage.status.replace('_', ' ').replace('CLOSED ', '')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-surface-700 dark:text-surface-300">
                  {stage.count}
                </td>
                <td className="px-4 py-3 text-right font-medium text-surface-900 dark:text-surface-100">
                  ${stage.value.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-surface-700 dark:text-surface-300">
                  ${stage.count > 0 ? Math.round(stage.value / stage.count).toLocaleString() : 0}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-surface-100 dark:bg-primary-800 font-semibold">
            <tr>
              <td className="px-4 py-3 text-surface-900 dark:text-surface-100">Total</td>
              <td className="px-4 py-3 text-right text-surface-900 dark:text-surface-100">
                {data.pipelineByStatus.reduce((sum, s) => sum + s.count, 0)}
              </td>
              <td className="px-4 py-3 text-right text-surface-900 dark:text-surface-100">
                ${data.pipelineByStatus.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-surface-700 dark:text-surface-300">-</td>
            </tr>
          </tfoot>
        </table>
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

function TaskStatusCard({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: 'surface' | 'warning' | 'success'
}) {
  const colorClasses = {
    surface: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-400',
    success: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-400',
  }

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  )
}

function ExportButton() {
  return (
    <form action="/api/reports/export" method="GET">
      <button type="submit" className="btn-secondary btn-md flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>
    </form>
  )
}
