import { prisma } from '@/lib/db'

async function getProjects() {
  return prisma.project.findMany({
    include: {
      site: {
        include: { customer: true },
      },
      pipeline: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Projects
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Track order and installation status
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-100 dark:bg-primary-800">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Customer / Site</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Solution</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Partner</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Order Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400">Install Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-surface-50 dark:hover:bg-primary-800">
                <td className="px-4 py-3">
                  <p className="font-medium text-surface-900 dark:text-surface-100">
                    {project.site.customer.name}
                  </p>
                  <p className="text-sm text-surface-500">{project.site.name}</p>
                </td>
                <td className="px-4 py-3 text-surface-700 dark:text-surface-300">
                  {project.solutionType || '-'}
                </td>
                <td className="px-4 py-3 text-surface-700 dark:text-surface-300">
                  {project.partner || '-'}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={project.orderStatus} />
                </td>
                <td className="px-4 py-3">
                  <InstallStatusBadge status={project.installStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {projects.length === 0 && (
          <div className="p-8 text-center text-surface-500">
            No projects yet. Projects are created when pipeline deals are won.
          </div>
        )}
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NOT_ORDERED: 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
    ORDERED: 'badge-info',
    PARTIAL: 'badge-warning',
    COMPLETE: 'badge-success',
  }

  const labels: Record<string, string> = {
    NOT_ORDERED: 'Not Ordered',
    ORDERED: 'Ordered',
    PARTIAL: 'Partial',
    COMPLETE: 'Complete',
  }

  return (
    <span className={`badge ${styles[status]}`}>
      {labels[status] || status}
    </span>
  )
}

function InstallStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NOT_STARTED: 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
    IN_PROGRESS: 'badge-warning',
    COMPLETE: 'badge-success',
  }

  const labels: Record<string, string> = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETE: 'Complete',
  }

  return (
    <span className={`badge ${styles[status]}`}>
      {labels[status] || status}
    </span>
  )
}
