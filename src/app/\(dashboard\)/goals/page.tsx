import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getGoals() {
  return prisma.goal.findMany({
    include: {
      customer: true,
    },
    orderBy: { dueDate: 'asc' },
  })
}

const statusColors = {
  ACTIVE: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-300',
  COMPLETED: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
  AT_RISK: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
  CANCELLED: 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300',
}

export default async function GoalsPage() {
  const goals = await getGoals()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Goals
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {goals.length} goals
          </p>
        </div>
        <Link href="/goals/new" className="btn-primary btn-md">
          + Add Goal
        </Link>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-surface-500 mb-4">No goals yet</p>
            <Link href="/goals/new" className="btn-primary btn-md">
              Add Your First Goal
            </Link>
          </div>
        ) : (
          goals.map((goal) => {
            const statusKey = goal.status as keyof typeof statusColors
            const progress = goal.targetValue ? ((goal.currentValue || 0) / goal.targetValue) * 100 : 0

            return (
              <div key={goal.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Link
                      href={`/goals/${goal.id}/edit`}
                      className="font-semibold text-primary-600 hover:text-primary-500"
                    >
                      {goal.title}
                    </Link>
                    <p className="text-sm text-surface-500">{goal.customer.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[statusKey]}`}>
                    {goal.status}
                  </span>
                </div>

                {goal.description && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                    {goal.description}
                  </p>
                )}

                {goal.targetValue && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-500">{goal.metric}</span>
                      <span className="text-surface-600 dark:text-surface-400">
                        {goal.currentValue} / {goal.targetValue}
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {goal.dueDate && (
                  <p className="text-sm text-surface-500">
                    Due: {new Date(goal.dueDate).toLocaleDateString()}
                  </p>
                )}

                <div className="mt-3">
                  <Link
                    href={`/goals/${goal.id}/edit`}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
