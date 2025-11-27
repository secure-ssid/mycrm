import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getStats() {
  const [customerCount, siteCount, contactCount, pipelineCount] = await Promise.all([
    prisma.customer.count(),
    prisma.site.count(),
    prisma.contact.count(),
    prisma.pipeline.count(),
  ])

  const openPipelines = await prisma.pipeline.aggregate({
    where: { status: { in: ['OPEN', 'CLOSING_SOON'] } },
    _sum: { value: true },
  })

  return {
    customerCount,
    siteCount,
    contactCount,
    pipelineCount,
    pipelineValue: openPipelines._sum.value?.toNumber() ?? 0,
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <main className="min-h-screen bg-surface-100 dark:bg-primary-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            MyCRM
          </h1>
          <p className="text-xl text-surface-600 dark:text-surface-400 mb-8">
            Account Planning CRM for B2B Customer Relationships
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="btn-primary btn-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-secondary btn-lg"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <StatCard
            label="Customers"
            value={stats.customerCount}
            color="primary"
          />
          <StatCard
            label="Sites"
            value={stats.siteCount}
            color="info"
          />
          <StatCard
            label="Contacts"
            value={stats.contactCount}
            color="success"
          />
          <StatCard
            label="Pipeline Value"
            value={`$${stats.pipelineValue.toLocaleString()}`}
            color="warning"
          />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Multi-Site Tracking"
            description="Track customers across multiple locations with site-specific contacts and opportunities."
          />
          <FeatureCard
            title="Pipeline Management"
            description="Manage your sales pipeline with deal tracking, projections, and win/loss analysis."
          />
          <FeatureCard
            title="Strategic Planning"
            description="Document account strategies, pain points, and growth opportunities."
          />
          <FeatureCard
            title="Contact Follow-ups"
            description="Never miss a follow-up with touch base tracking and reminders."
          />
          <FeatureCard
            title="Goal Tracking"
            description="Set and track quarterly goals for revenue, contacts, and site visits."
          />
          <FeatureCard
            title="Meeting Notes"
            description="Keep detailed records of meetings with agendas, notes, and action items."
          />
        </div>

        {/* Demo Credentials */}
        <div className="mt-16 text-center">
          <div className="card inline-block px-8 py-6">
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">
              Demo Credentials
            </p>
            <p className="font-mono text-sm">
              Email: demo@mycrm.com
            </p>
            <p className="font-mono text-sm">
              Password: demo1234
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: 'primary' | 'success' | 'warning' | 'info'
}) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300',
    success: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
    info: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-300',
  }

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-lg text-surface-900 dark:text-surface-100 mb-2">
        {title}
      </h3>
      <p className="text-surface-600 dark:text-surface-400">
        {description}
      </p>
    </div>
  )
}
