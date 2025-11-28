import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { format, isBefore, startOfDay } from 'date-fns'

async function getDashboardData(userId: string) {
  const today = startOfDay(new Date())

  const [
    customerCount,
    pipelines,
    tasks,
    touchBases,
    goals,
    recentActivity,
  ] = await Promise.all([
    prisma.customer.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.pipeline.findMany({
      where: { site: { customer: { userId } } },
      select: { value: true, status: true },
    }),
    prisma.task.findMany({
      where: { customer: { userId }, status: { not: 'DONE' } },
      include: { customer: true },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.touchBase.findMany({
      where: { done: false, contact: { site: { customer: { userId } } } },
      include: { contact: { include: { site: { include: { customer: true } } } } },
      orderBy: { followUpDate: 'asc' },
      take: 5,
    }),
    prisma.goal.findMany({
      where: { customer: { userId }, quarter: 'Q4 2025' }, // TODO: Dynamic quarter
      include: { customer: true },
    }),
    prisma.activityLog.findMany({
      where: { customer: { userId } },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const openPipelineValue = pipelines
    .filter((p) => p.status === 'OPEN' || p.status === 'CLOSING_SOON')
    .reduce((sum, p) => sum + Number(p.value), 0)

  const wonPipelineValue = pipelines
    .filter((p) => p.status === 'CLOSED_WON')
    .reduce((sum, p) => sum + Number(p.value), 0)

  const overdueFollowUps = touchBases.filter(
    (t) => t.followUpDate && isBefore(new Date(t.followUpDate), today)
  ).length

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && isBefore(new Date(t.dueDate), today)
  ).length

  return {
    customerCount,
    openPipelineValue,
    wonPipelineValue,
    tasks,
    touchBases,
    goals,
    recentActivity,
    overdueFollowUps,
    overdueTasks,
  }
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const data = await getDashboardData(user.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Dashboard
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          Welcome back! Here&apos;s your CRM overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Customers"
          value={data.customerCount}
          href="/customers"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Open Pipeline"
          value={`$${data.openPipelineValue.toLocaleString()}`}
          href="/pipeline"
          color="primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Overdue Tasks"
          value={data.overdueTasks}
          href="/tasks"
          color={data.overdueTasks > 0 ? 'danger' : 'success'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          label="Overdue Follow-ups"
          value={data.overdueFollowUps}
          href="/follow-ups"
          color={data.overdueFollowUps > 0 ? 'warning' : 'success'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/customers/new" className="btn-primary btn-sm">
            + New Customer
          </Link>
          <Link href="/pipeline/new" className="btn-secondary btn-sm">
            + New Opportunity
          </Link>
          <Link href="/tasks/new" className="btn-secondary btn-sm">
            + New Task
          </Link>
          <Link href="/follow-ups/new" className="btn-secondary btn-sm">
            + Log Follow-up
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="card">
          <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              Upcoming Tasks
            </h2>
            <Link href="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {data.tasks.length === 0 ? (
              <p className="p-4 text-sm text-surface-500 text-center">No pending tasks</p>
            ) : (
              data.tasks.map((task) => (
                <div key={task.id} className="p-4 flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    task.priority === 'URGENT' ? 'bg-danger-500' :
                    task.priority === 'HIGH' ? 'bg-warning-500' :
                    'bg-surface-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-surface-500">
                      {task.customer && <span>{task.customer.name}</span>}
                      {task.dueDate && (
                        <span className={isBefore(new Date(task.dueDate), new Date()) ? 'text-danger-500' : ''}>
                          Due {format(task.dueDate, 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="card">
          <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              Pending Follow-ups
            </h2>
            <Link href="/follow-ups" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {data.touchBases.length === 0 ? (
              <p className="p-4 text-sm text-surface-500 text-center">No pending follow-ups</p>
            ) : (
              data.touchBases.map((tb) => (
                <div key={tb.id} className="p-4">
                  <p className="font-medium text-surface-900 dark:text-surface-100">
                    {tb.contact.name}
                  </p>
                  <p className="text-sm text-surface-500">
                    {tb.contact.site.customer.name} - {tb.contact.site.name}
                  </p>
                  {tb.followUpDate && (
                    <p className={`text-sm mt-1 ${
                      isBefore(new Date(tb.followUpDate), new Date())
                        ? 'text-danger-500 font-medium'
                        : 'text-surface-500'
                    }`}>
                      {isBefore(new Date(tb.followUpDate), new Date()) ? 'Overdue: ' : 'Due: '}
                      {format(tb.followUpDate, 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      {data.goals.length > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              Q4 2025 Goals
            </h2>
            <Link href="/goals" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="p-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.goals.map((goal) => {
              const progress = goal.target > 0 ? (goal.actual / goal.target) * 100 : 0
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      {goal.type}
                    </span>
                    <span className="text-sm text-surface-500">
                      {goal.actual}/{goal.target}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        progress >= 100 ? 'bg-success-500' :
                        progress >= 50 ? 'bg-primary-500' :
                        'bg-warning-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data.recentActivity.length > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.action === 'CREATED' ? 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400' :
                  activity.action === 'UPDATED' ? 'bg-info-100 text-info-600 dark:bg-info-900 dark:text-info-400' :
                  'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-400'
                }`}>
                  {activity.action === 'CREATED' ? '+' : activity.action === 'UPDATED' ? '~' : '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-900 dark:text-surface-100">
                    <span className="font-medium">{activity.entityType}</span>
                    {' '}{activity.action.toLowerCase()}
                    {activity.customer && ` for ${activity.customer.name}`}
                  </p>
                  <p className="text-xs text-surface-500">
                    {format(activity.createdAt, 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  href,
  icon,
  color = 'default',
}: {
  label: string
  value: string | number
  href: string
  icon: React.ReactNode
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}) {
  const colorClasses = {
    default: 'text-surface-600 dark:text-surface-400',
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    danger: 'text-danger-600 dark:text-danger-400',
  }

  return (
    <Link
      href={href}
      className="card p-4 hover:shadow-dropdown transition-shadow"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={colorClasses[color]}>{icon}</div>
        <span className="text-sm text-surface-500">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
    </Link>
  )
}
