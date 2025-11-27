import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { format } from 'date-fns'

async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      strategy: true,
      sites: {
        include: {
          contacts: true,
          pipelines: true,
          projects: true,
        },
      },
      goals: {
        orderBy: { quarter: 'desc' },
        take: 5,
      },
      meetings: {
        orderBy: { date: 'desc' },
        take: 5,
      },
      tasks: {
        where: { status: { not: 'DONE' } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      },
    },
  })

  if (!customer) notFound()
  return customer
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await getCustomer(params.id)

  const totalContacts = customer.sites.reduce(
    (sum, site) => sum + site.contacts.length,
    0
  )
  const totalPipelineValue = customer.sites.reduce(
    (sum, site) =>
      sum +
      site.pipelines
        .filter((p) => p.status === 'OPEN' || p.status === 'CLOSING_SOON')
        .reduce((s, p) => s + Number(p.value), 0),
    0
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
            <Link href="/customers" className="hover:text-primary-600">
              Customers
            </Link>
            <span>/</span>
            <span>{customer.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {customer.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={customer.status} />
            {customer.industry && (
              <span className="text-surface-600 dark:text-surface-400">
                {customer.industry}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/customers/${customer.id}/strategy`}
            className="btn-secondary btn-md"
          >
            View Strategy
          </Link>
          <Link
            href={`/customers/${customer.id}/edit`}
            className="btn-primary btn-md"
          >
            Edit Customer
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Sites" value={customer.sites.length} />
        <StatCard label="Contacts" value={totalContacts} />
        <StatCard
          label="Open Pipeline"
          value={`$${totalPipelineValue.toLocaleString()}`}
        />
        <StatCard label="Open Tasks" value={customer.tasks.length} />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sites & Contacts - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sites */}
          <div className="card">
            <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <h2 className="font-semibold text-surface-900 dark:text-surface-100">
                Sites ({customer.sites.length})
              </h2>
              <button className="text-sm text-primary-600 hover:text-primary-500">
                + Add Site
              </button>
            </div>
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              {customer.sites.map((site) => (
                <div key={site.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-surface-900 dark:text-surface-100">
                        {site.name}
                      </h3>
                      {(site.city || site.state) && (
                        <p className="text-sm text-surface-500">
                          {[site.city, site.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-surface-600 dark:text-surface-400">
                        {site.contacts.length} contacts
                      </p>
                      <p className="text-surface-600 dark:text-surface-400">
                        {site.pipelines.length} opportunities
                      </p>
                    </div>
                  </div>

                  {/* Contacts */}
                  {site.contacts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                      <p className="text-xs font-medium text-surface-500 mb-2">
                        CONTACTS
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {site.contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-primary-700 rounded-full text-sm"
                          >
                            {contact.isChampion && (
                              <span className="text-warning-500">★</span>
                            )}
                            <span className="text-surface-700 dark:text-surface-300">
                              {contact.name}
                            </span>
                            {contact.role && (
                              <span className="text-surface-500 text-xs">
                                {contact.role}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pipelines */}
                  {site.pipelines.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                      <p className="text-xs font-medium text-surface-500 mb-2">
                        PIPELINE
                      </p>
                      <div className="space-y-2">
                        {site.pipelines.map((pipeline) => (
                          <div
                            key={pipeline.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-surface-700 dark:text-surface-300">
                              {pipeline.description}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-primary-600 dark:text-primary-400">
                                ${Number(pipeline.value).toLocaleString()}
                              </span>
                              <PipelineStatusBadge status={pipeline.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {customer.sites.length === 0 && (
                <div className="p-8 text-center text-surface-500">
                  No sites yet. Add the first site for this customer.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Strategy Summary */}
          {customer.strategy && (
            <div className="card p-5">
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-3">
                Strategy
              </h3>
              {customer.strategy.overview && (
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                  {customer.strategy.overview}
                </p>
              )}
              <Link
                href={`/customers/${customer.id}/strategy`}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View full strategy →
              </Link>
            </div>
          )}

          {/* Tasks */}
          <div className="card">
            <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
              <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                Open Tasks
              </h3>
            </div>
            <div className="p-5">
              {customer.tasks.length > 0 ? (
                <div className="space-y-3">
                  {customer.tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded border-surface-300"
                        readOnly
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-surface-700 dark:text-surface-300">
                          {task.description}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-surface-500">
                            Due {format(task.dueDate, 'MMM d')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500">No open tasks</p>
              )}
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="card">
            <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
              <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                Recent Meetings
              </h3>
            </div>
            <div className="p-5">
              {customer.meetings.length > 0 ? (
                <div className="space-y-3">
                  {customer.meetings.map((meeting) => (
                    <div key={meeting.id}>
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        {format(meeting.date, 'MMM d, yyyy')}
                      </p>
                      {meeting.agenda && (
                        <p className="text-xs text-surface-500 truncate">
                          {meeting.agenda}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500">No meetings recorded</p>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="card">
            <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
              <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                Goals
              </h3>
            </div>
            <div className="p-5">
              {customer.goals.length > 0 ? (
                <div className="space-y-3">
                  {customer.goals.map((goal) => {
                    const progress =
                      goal.target > 0 ? (goal.actual / goal.target) * 100 : 0
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-surface-700 dark:text-surface-300">
                            {goal.type}
                          </span>
                          <span className="text-surface-500">
                            {goal.actual}/{goal.target}
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-surface-500">No goals set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-surface-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-warning',
    PROSPECT: 'badge-info',
    ARCHIVED: 'bg-surface-200 text-surface-600',
  }
  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PROSPECT: 'Prospect',
    ARCHIVED: 'Archived',
  }
  return <span className={`badge ${styles[status]}`}>{labels[status]}</span>
}

function PipelineStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: 'badge-info',
    CLOSING_SOON: 'badge-warning',
    CLOSED_WON: 'badge-success',
    CLOSED_LOST: 'badge-danger',
  }
  const labels: Record<string, string> = {
    OPEN: 'Open',
    CLOSING_SOON: 'Closing',
    CLOSED_WON: 'Won',
    CLOSED_LOST: 'Lost',
  }
  return <span className={`badge text-xs ${styles[status]}`}>{labels[status]}</span>
}
