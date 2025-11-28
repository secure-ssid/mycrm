import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { format } from 'date-fns'

async function getTasks(userId: string) {
  return prisma.task.findMany({
    where: { customer: { userId } },
    include: {
      customer: true,
      site: true,
    },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
  })
}

export default async function TasksPage() {
  const user = await requireAuth()
  const tasks = await getTasks(user.id)

  const pending = tasks.filter((t) => t.status === 'PENDING')
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS')
  const done = tasks.filter((t) => t.status === 'DONE')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Tasks
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {pending.length + inProgress.length} open tasks
          </p>
        </div>
        <Link href="/tasks/new" className="btn-primary btn-md">+ Add Task</Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <TaskColumn title="To Do" tasks={pending} status="PENDING" />
        <TaskColumn title="In Progress" tasks={inProgress} status="IN_PROGRESS" />
        <TaskColumn title="Done" tasks={done} status="DONE" />
      </div>
    </div>
  )
}

function TaskColumn({
  title,
  tasks,
  status,
}: {
  title: string
  tasks: Awaited<ReturnType<typeof getTasks>>
  status: string
}) {
  const headerColors: Record<string, string> = {
    PENDING: 'bg-surface-400',
    IN_PROGRESS: 'bg-warning-500',
    DONE: 'bg-success-500',
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${headerColors[status]}`} />
        <h2 className="font-semibold text-surface-900 dark:text-surface-100">
          {title}
        </h2>
        <span className="text-sm text-surface-500">({tasks.length})</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="card p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={status === 'DONE'}
                readOnly
                className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-surface-100">
                  {task.description}
                </p>
                {(task.customer || task.site) && (
                  <p className="text-sm text-surface-500 mt-1">
                    {task.customer?.name}
                    {task.site && ` - ${task.site.name}`}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span className="text-xs text-surface-500">
                      Due {format(task.dueDate, 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-center text-sm text-surface-500 py-4">
            No tasks
          </p>
        )}
      </div>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
    MEDIUM: 'badge-info',
    HIGH: 'badge-warning',
    URGENT: 'badge-danger',
  }

  return (
    <span className={`badge text-xs ${styles[priority]}`}>
      {priority.toLowerCase()}
    </span>
  )
}
