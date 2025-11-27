import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

async function getCustomerWithStrategy(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      strategy: true,
    },
  })

  if (!customer) notFound()
  return customer
}

type PainPoint = { title: string; description: string }
type Opportunity = { title: string; description: string }
type ActionItem = { initiative: string; tasks: string[] }
type NextStep = { step: string; dueDate: string | null }

function parseJSON<T>(str: string | null, fallback: T[]): T[] {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export default async function StrategyPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await getCustomerWithStrategy(params.id)
  const strategy = customer.strategy

  const painPoints = parseJSON<PainPoint>(strategy?.painPoints ?? null, [])
  const opportunities = parseJSON<Opportunity>(strategy?.opportunities ?? null, [])
  const actionPlan = parseJSON<ActionItem>(strategy?.actionPlan ?? null, [])
  const nextSteps = parseJSON<NextStep>(strategy?.nextSteps ?? null, [])

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
            <Link
              href={`/customers/${customer.id}`}
              className="hover:text-primary-600"
            >
              {customer.name}
            </Link>
            <span>/</span>
            <span>Strategy</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Account Strategy
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            {customer.name}
          </p>
        </div>
        <Link
          href={`/customers/${customer.id}/strategy/edit`}
          className="btn-primary btn-md"
        >
          Edit Strategy
        </Link>
      </div>

      {!strategy ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-primary-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
            No strategy document yet
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Create an account strategy to track pain points, opportunities, and action plans.
          </p>
          <Link
            href={`/customers/${customer.id}/strategy/edit`}
            className="btn-primary btn-md"
          >
            Create Strategy
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Overview */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Overview
            </h2>
            <p className="text-surface-700 dark:text-surface-300 whitespace-pre-wrap">
              {strategy.overview || 'No overview provided.'}
            </p>
            {strategy.currentStatus && (
              <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <h3 className="text-sm font-medium text-surface-500 mb-2">
                  Current Status
                </h3>
                <p className="text-surface-700 dark:text-surface-300">
                  {strategy.currentStatus}
                </p>
              </div>
            )}
            {strategy.onenoteLink && (
              <div className="mt-4">
                <a
                  href={strategy.onenoteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-500 text-sm"
                >
                  Open in OneNote →
                </a>
              </div>
            )}
          </div>

          {/* Pain Points */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Pain Points
            </h2>
            {painPoints.length > 0 ? (
              <div className="space-y-4">
                {painPoints.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-medium text-danger-600 dark:text-danger-400">
                      {item.title}
                    </h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500">No pain points documented.</p>
            )}
          </div>

          {/* Opportunities */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Opportunities
            </h2>
            {opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-medium text-success-600 dark:text-success-400">
                      {item.title}
                    </h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500">No opportunities documented.</p>
            )}
          </div>

          {/* Action Plan */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Action Plan
            </h2>
            {actionPlan.length > 0 ? (
              <div className="space-y-4">
                {actionPlan.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-medium text-surface-900 dark:text-surface-100">
                      {item.initiative}
                    </h3>
                    {item.tasks.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {item.tasks.map((task, j) => (
                          <li
                            key={j}
                            className="text-sm text-surface-600 dark:text-surface-400 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500">No action plan documented.</p>
            )}
          </div>

          {/* Next Steps */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Next Steps
            </h2>
            {nextSteps.length > 0 ? (
              <div className="space-y-3">
                {nextSteps.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-primary-700 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-600 flex items-center justify-center text-xs font-medium text-primary-700 dark:text-primary-200">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-surface-700 dark:text-surface-300">
                        {item.step}
                      </p>
                      {item.dueDate && (
                        <p className="text-xs text-surface-500 mt-1">
                          Due: {item.dueDate}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500">No next steps documented.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
