import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getTouchBases() {
  return prisma.touchBase.findMany({
    include: {
      contact: { include: { site: { include: { customer: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function FollowUpsPage() {
  const touchBases = await getTouchBases()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Follow-ups
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {touchBases.length} follow-ups recorded
          </p>
        </div>
        <Link href="/follow-ups/new" className="btn-primary btn-md">
          + Log Follow-up
        </Link>
      </div>

      <div className="space-y-4">
        {touchBases.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-surface-500 mb-4">No follow-ups yet</p>
            <Link href="/follow-ups/new" className="btn-primary btn-md">
              Log Your First Follow-up
            </Link>
          </div>
        ) : (
          touchBases.map((touchBase) => (
            <div key={touchBase.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/follow-ups/${touchBase.id}/edit`}
                    className="font-semibold text-primary-600 hover:text-primary-500"
                  >
                    {touchBase.contact.name}
                  </Link>
                  <p className="text-sm text-surface-500 mb-2">
                    {touchBase.contact.site.customer.name} • {touchBase.contact.site.name}
                  </p>
                  {touchBase.followUpDate && (
                    <p className="text-sm text-surface-500 mb-2">
                      Follow-up: {new Date(touchBase.followUpDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                  {touchBase.whereMet && (
                    <p className="text-sm text-surface-500 mb-2">
                      <strong>Where:</strong> {touchBase.whereMet}
                    </p>
                  )}
                  {touchBase.notes && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                      {touchBase.notes}
                    </p>
                  )}
                  {touchBase.conversationNotes && (
                    <p className="text-sm text-surface-500">
                      <strong>Notes:</strong> {touchBase.conversationNotes}
                    </p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${touchBase.done ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}>
                    {touchBase.done ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <Link
                  href={`/follow-ups/${touchBase.id}/edit`}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
