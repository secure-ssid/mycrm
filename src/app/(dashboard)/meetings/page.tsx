import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getMeetings() {
  return prisma.meeting.findMany({
    include: {
      customer: true,
    },
    orderBy: { date: 'desc' },
  })
}

export default async function MeetingsPage() {
  const meetings = await getMeetings()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Meetings
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {meetings.length} meetings recorded
          </p>
        </div>
        <Link href="/meetings/new" className="btn-primary btn-md">
          + Log Meeting
        </Link>
      </div>

      <div className="space-y-4">
        {meetings.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-surface-500 mb-4">No meetings yet</p>
            <Link href="/meetings/new" className="btn-primary btn-md">
              Log Your First Meeting
            </Link>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/meetings/${meeting.id}/edit`}
                    className="font-semibold text-primary-600 hover:text-primary-500"
                  >
                    {meeting.agenda || 'Meeting'}
                  </Link>
                  <p className="text-sm text-surface-500 mb-2">
                    {meeting.customer.name}
                  </p>
                  <p className="text-sm text-surface-500 mb-2">
                    {new Date(meeting.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {meeting.attendees && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                      <strong>Attendees:</strong> {meeting.attendees}
                    </p>
                  )}
                  {meeting.notes && (
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {meeting.notes.substring(0, 100)}
                      {meeting.notes.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
                <Link
                  href={`/meetings/${meeting.id}/edit`}
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
