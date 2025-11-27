import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getTasks() {
  return prisma.task.findMany({
    include: {
      customer: true,
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { dueDate: 'asc' },
    ],
  })
}

const statusColors = {
  TODO: 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300',
  IN_PROGRESS: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-300',
  COMPLETED: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
}

const priorityColors = {
  LOW: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
  MEDIUM: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
  HIGH: 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300',
}

export default async function TasksPage() {
  const tasks = await getTasks()

  const todoTasks = tasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS')
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Tasks
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {tasks.length} total tasks
          </p>
        </div>
        <Link href="/tasks/new" className="btn-primary btn-md">
          + Add Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              To Do ({todoTasks.length})
            </h2>
          </div>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {todoTasks.length === 0 ? (
              <div className="px-5 py-4 text-sm text-surface-500">No tasks</div>
            ) : (
              todoTasks.map((task) => (
                <TaskItem key={task.id} task={task} statusColors={statusColors} priorityColors={priorityColors} />
              ))
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              In Progress ({inProgressTasks.length})
            </h2>
          </div>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {inProgressTasks.length === 0 ? (
              <div className="px-5 py-4 text-sm text-surface-500">No tasks</div>
            ) : (
              inProgressTasks.map((task) => (
                <TaskItem key={task.id} task={task} statusColors={statusColors} priorityColors={priorityColors} />
              ))
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              Completed ({completedTasks.length})
            </h2>
          </div>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            {completedTasks.length === 0 ? (
              <div className="px-5 py-4 text-sm text-surface-500">No tasks</div>
            ) : (
              completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} statusColors={statusColors} priorityColors={priorityColors} />
              ))
            )}
          </div>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-surface-500 mb-4">No tasks yet</p>
          <Link href="/tasks/new" className="btn-primary btn-md">
            Add Your First Task
          </Link>
        </div>
      )}
    </div>
  )
}

function TaskItem({ task, statusColors, priorityColors }: { task: any; statusColors: any; priorityColors: any }) {
  const statusKey = task.status as keyof typeof statusColors
  const priorityKey = task.priority as keyof typeof priorityColors

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between mb-2">
        <Link
          href={`/tasks/${task.id}/edit`}
          className="font-medium text-surface-900 dark:text-surface-100 hover:text-primary-600"
        >
          {task.title}
        </Link>
      </div>
      <p className="text-xs text-surface-500 mb-2">{task.customer.name}</p>
      <div className="flex gap-2 flex-wrap">
        <span className={`text-xs px-2 py-1 rounded ${statusColors[statusKey]}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[priorityKey]}`}>
          {task.priority}
        </span>
      </div>
      {task.dueDate && (
        <p className="text-xs text-surface-500 mt-2">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
