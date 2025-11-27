import Link from 'next/link'

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-surface-300 dark:text-surface-700 mb-4">
          404
        </div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
          Page not found
        </h2>
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary btn-md">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
