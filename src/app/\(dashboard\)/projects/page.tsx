import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getProjects() {
  return prisma.project.findMany({
    include: {
      site: { include: { customer: true } },
    },
    orderBy: { status: 'asc' },
  })
}

const statusColors = {
  PLANNING: 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300',
  ACTIVE: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-300',
  ON_HOLD: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
  COMPLETED: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
  CANCELLED: 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300',
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
            {projects.length} projects
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary btn-md">
          + Add Project
        </Link>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-surface-500 mb-4">No projects yet</p>
            <Link href="/projects/new" className="btn-primary btn-md">
              Add Your First Project
            </Link>
          </div>
        ) : (
          projects.map((project) => {
            const statusKey = project.status as keyof typeof statusColors

            return (
              <div key={project.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="font-semibold text-primary-600 hover:text-primary-500"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-surface-500">
                      {project.site.customer.name} • {project.site.name}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[statusKey]}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                    {project.description}
                  </p>
                )}

                <div className="flex gap-4 text-sm text-surface-500 mb-3">
                  {project.startDate && (
                    <span>
                      Start: {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  )}
                  {project.endDate && (
                    <span>
                      End: {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  )}
                  {project.budget && (
                    <span>${project.budget.toLocaleString()}</span>
                  )}
                </div>

                <Link
                  href={`/projects/${project.id}/edit`}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Edit
                </Link>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
