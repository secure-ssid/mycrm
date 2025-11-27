import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getCustomers() {
  return prisma.customer.findMany({
    include: {
      sites: {
        include: {
          _count: { select: { contacts: true } },
        },
      },
      _count: {
        select: { goals: true, meetings: true, tasks: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Customers
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Manage your customer accounts
          </p>
        </div>
        <Link href="/customers/new" className="btn-primary btn-md">
          + Add Customer
        </Link>
      </div>

      {/* Customer Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="card p-5 hover:shadow-dropdown transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-surface-900 dark:text-surface-100">
                  {customer.name}
                </h3>
                {customer.industry && (
                  <p className="text-sm text-surface-500">{customer.industry}</p>
                )}
              </div>
              <StatusBadge status={customer.status} />
            </div>

            <div className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{customer.sites.length} site{customer.sites.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>
                  {customer.sites.reduce((sum, site) => sum + site._count.contacts, 0)} contacts
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-700 flex gap-4 text-xs text-surface-500">
              <span>{customer._count.tasks} tasks</span>
              <span>{customer._count.meetings} meetings</span>
              <span>{customer._count.goals} goals</span>
            </div>
          </Link>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-primary-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
            No customers yet
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Get started by adding your first customer
          </p>
          <Link href="/customers/new" className="btn-primary btn-md">
            + Add Customer
          </Link>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-warning',
    PROSPECT: 'badge-info',
    ARCHIVED: 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
  }

  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PROSPECT: 'Prospect',
    ARCHIVED: 'Archived',
  }

  return (
    <span className={`badge ${styles[status] || styles.ACTIVE}`}>
      {labels[status] || status}
    </span>
  )
}
