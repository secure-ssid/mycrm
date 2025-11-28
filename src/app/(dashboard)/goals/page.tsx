import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

async function getGoals(userId: string) {
  return prisma.goal.findMany({
    where: { customer: { userId } },
    include: {
      customer: true,
    },
    orderBy: [{ quarter: 'desc' }, { type: 'asc' }],
  })
}

export default async function GoalsPage() {
  const user = await requireAuth()
  const goals = await getGoals(user.id)

  const currentQuarter = 'Q4 2025' // TODO: Calculate dynamically
  const currentGoals = goals.filter((g) => g.quarter === currentQuarter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Goals
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Track quarterly targets and progress
          </p>
        </div>
        <Link href="/goals/new" className="btn-primary btn-md">+ Add Goal</Link>
      </div>

      {/* Current Quarter Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {currentGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {/* All Goals Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-surface-100 dark:bg-primary-800 border-b border-surface-200 dark:border-surface-700">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100">
            All Goals
          </h2>
        </div>
        <table className="w-full">
          <thead className="bg-surface-50 dark:bg-primary-800">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Quarter</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Customer</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Progress</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
            {goals.map((goal) => {
              const progress = goal.target > 0 ? (goal.actual / goal.target) * 100 : 0
              const isComplete = progress >= 100
              const isOnTrack = progress >= 50

              return (
                <tr key={goal.id} className="hover:bg-surface-50 dark:hover:bg-primary-800">
                  <td className="px-4 py-3 text-surface-700 dark:text-surface-300">{goal.quarter}</td>
                  <td className="px-4 py-3 text-surface-900 dark:text-surface-100 font-medium">{goal.type}</td>
                  <td className="px-4 py-3 text-surface-700 dark:text-surface-300">
                    {goal.customer?.name || 'All Customers'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isComplete
                              ? 'bg-success-500'
                              : isOnTrack
                              ? 'bg-warning-500'
                              : 'bg-danger-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-surface-600 dark:text-surface-400 w-16 text-right">
                        {goal.actual}/{goal.target}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        isComplete
                          ? 'badge-success'
                          : isOnTrack
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {isComplete ? 'Complete' : isOnTrack ? 'On Track' : 'Behind'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {goals.length === 0 && (
          <div className="p-8 text-center text-surface-500">
            No goals set. Add your first quarterly goal.
          </div>
        )}
      </div>
    </div>
  )
}

function GoalCard({ goal }: { goal: Awaited<ReturnType<typeof getGoals>>[0] }) {
  const progress = goal.target > 0 ? (goal.actual / goal.target) * 100 : 0
  const isComplete = progress >= 100

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-surface-900 dark:text-surface-100">{goal.type}</h3>
        <span className="text-sm text-surface-500">{goal.quarter}</span>
      </div>
      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
        {goal.actual}
        <span className="text-lg text-surface-400">/{goal.target}</span>
      </div>
      <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isComplete ? 'bg-success-500' : 'bg-primary-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
