import { requireAuth } from '@/lib/auth-utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-primary-900">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6">
        {children}
      </main>
    </div>
  )
}
