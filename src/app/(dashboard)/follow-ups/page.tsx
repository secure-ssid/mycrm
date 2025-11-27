import { prisma } from '@/lib/db'
import { format, isPast, isToday } from 'date-fns'

async function getFollowUps() {
  return prisma.touchBase.findMany({
    where: { done: false },
    include: {
      contact: {
        include: {
          site: {
            include: { customer: true },
          },
        },
      },
    },
    orderBy: { followUpDate: 'asc' },
  })
}

export default async function FollowUpsPage() {
  const followUps = await getFollowUps()

  const overdue = followUps.filter(
    (f) => f.followUpDate && isPast(f.followUpDate) && !isToday(f.followUpDate)
  )
  const today = followUps.filter((f) => f.followUpDate && isToday(f.followUpDate))
  const upcoming = followUps.filter(
    (f) => f.followUpDate && !isPast(f.followUpDate) && !isToday(f.followUpDate)
  )
  const noDate = followUps.filter((f) => !f.followUpDate)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Follow-ups
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {followUps.length} pending follow-ups
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {overdue.length > 0 && (
          <FollowUpSection title="Overdue" items={overdue} variant="danger" />
        )}
        {today.length > 0 && (
          <FollowUpSection title="Today" items={today} variant="warning" />
        )}
        {upcoming.length > 0 && (
          <FollowUpSection title="Upcoming" items={upcoming} variant="info" />
        )}
        {noDate.length > 0 && (
          <FollowUpSection title="No Date Set" items={noDate} variant="default" />
        )}

        {followUps.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-surface-500">No pending follow-ups. Great job!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FollowUpSection({
  title,
  items,
  variant,
}: {
  title: string
  items: Awaited<ReturnType<typeof getFollowUps>>
  variant: 'danger' | 'warning' | 'info' | 'default'
}) {
  const headerColors = {
    danger: 'text-danger-600 dark:text-danger-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-info-600 dark:text-info-400',
    default: 'text-surface-600 dark:text-surface-400',
  }

  return (
    <div>
      <h2 className={`font-semibold mb-3 ${headerColors[variant]}`}>
        {title} ({items.length})
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">
                  {item.contact.name}
                </p>
                <p className="text-sm text-surface-500">
                  {item.contact.site.customer.name} - {item.contact.site.name}
                </p>
                {item.whereMet && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                    Met at: {item.whereMet}
                  </p>
                )}
              </div>
              <div className="text-right">
                {item.followUpDate && (
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {format(item.followUpDate, 'MMM d, yyyy')}
                  </p>
                )}
                <button className="text-xs text-primary-600 hover:text-primary-500 mt-1">
                  Mark Done
                </button>
              </div>
            </div>
            {item.notes && (
              <p className="mt-2 text-sm text-surface-600 dark:text-surface-400 border-t border-surface-200 dark:border-surface-700 pt-2">
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
