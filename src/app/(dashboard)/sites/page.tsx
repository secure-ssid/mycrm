import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getSites() {
  return prisma.site.findMany({
    include: {
      customer: true,
      contacts: true,
      pipelines: true,
      projects: true,
    },
    orderBy: [
      { customer: { name: 'asc' } },
      { name: 'asc' },
    ],
  })
}

export default async function SitesPage() {
  const sites = await getSites()

  // Group sites by customer
  const sitesByCustomer = sites.reduce((acc, site) => {
    const customerId = site.customer.id
    if (!acc[customerId]) {
      acc[customerId] = {
        customer: site.customer,
        sites: [],
      }
    }
    acc[customerId].sites.push(site)
    return acc
  }, {} as Record<string, { customer: typeof sites[0]['customer']; sites: typeof sites }>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Sites
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {sites.length} sites across {Object.keys(sitesByCustomer).length} customers
          </p>
        </div>
        <Link href="/sites/new" className="btn-primary btn-md">
          + Add Site
        </Link>
      </div>

      <div className="space-y-6">
        {Object.values(sitesByCustomer).map(({ customer, sites: customerSites }) => (
          <div key={customer.id} className="card">
            <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
              <Link
                href={`/customers/${customer.id}`}
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                {customer.name}
              </Link>
            </div>
            <div className="divide-y divide-surface-200 dark:divide-surface-700">
              {customerSites.map((site) => (
                <div key={site.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-surface-900 dark:text-surface-100">
                      {site.name}
                    </h3>
                    {site.address && (
                      <p className="text-sm text-surface-500">{site.address}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-surface-500">
                      <span>{site.contacts.length} contacts</span>
                      <span>{site.pipelines.length} opportunities</span>
                      <span>{site.projects.length} projects</span>
                    </div>
                  </div>
                  <Link
                    href={`/sites/${site.id}/edit`}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {sites.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-surface-500 mb-4">No sites yet</p>
          <Link href="/sites/new" className="btn-primary btn-md">
            Add Your First Site
          </Link>
        </div>
      )}
    </div>
  )
}
