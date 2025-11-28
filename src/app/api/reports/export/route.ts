import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Sanitize CSV values to prevent formula injection
function escapeCSV(value: string | null | undefined): string {
  if (!value) return '""'
  // Escape quotes by doubling them
  let escaped = value.replace(/"/g, '""')
  // Prefix formula-starting characters with a single quote to prevent Excel formula injection
  if (/^[=+\-@\t\r]/.test(escaped)) {
    escaped = "'" + escaped
  }
  return `"${escaped}"`
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Fetch all data for export - filtered by userId
    const [customers, pipelines, tasks, goals, contacts] = await Promise.all([
      prisma.customer.findMany({
        where: { userId },
        include: {
          sites: {
            include: {
              _count: { select: { contacts: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.pipeline.findMany({
        where: { site: { customer: { userId } } },
        include: {
          site: {
            include: { customer: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.findMany({
        where: { customer: { userId } },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.goal.findMany({
        where: { customer: { userId } },
        include: { customer: true },
        orderBy: { quarter: 'desc' },
      }),
      prisma.contact.findMany({
        where: { site: { customer: { userId } } },
        include: {
          site: {
            include: { customer: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    // Build CSV content
    const lines: string[] = []

    // Customers Section
    lines.push('=== CUSTOMERS ===')
    lines.push('Name,Industry,Status,Sites,Contacts')
    customers.forEach(c => {
      const contactCount = c.sites.reduce((sum, s) => sum + s._count.contacts, 0)
      lines.push(`${escapeCSV(c.name)},${escapeCSV(c.industry)},${escapeCSV(c.status)},${c.sites.length},${contactCount}`)
    })
    lines.push('')

    // Pipeline Section
    lines.push('=== PIPELINE ===')
    lines.push('Description,Customer,Site,Value,Status,Expected Close')
    pipelines.forEach(p => {
      lines.push(`${escapeCSV(p.description)},${escapeCSV(p.site.customer.name)},${escapeCSV(p.site.name)},${p.value},${escapeCSV(p.status)},${escapeCSV(p.expectedClose)}`)
    })
    lines.push('')

    // Tasks Section
    lines.push('=== TASKS ===')
    lines.push('Description,Customer,Priority,Status,Due Date')
    tasks.forEach(t => {
      const dueDate = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : ''
      lines.push(`${escapeCSV(t.description)},${escapeCSV(t.customer?.name)},${escapeCSV(t.priority)},${escapeCSV(t.status)},${escapeCSV(dueDate)}`)
    })
    lines.push('')

    // Goals Section
    lines.push('=== GOALS ===')
    lines.push('Type,Customer,Quarter,Target,Actual,Progress')
    goals.forEach(g => {
      const progress = g.target > 0 ? Math.round((g.actual / g.target) * 100) : 0
      lines.push(`${escapeCSV(g.type)},${escapeCSV(g.customer?.name || 'All')},${escapeCSV(g.quarter)},${g.target},${g.actual},${progress}%`)
    })
    lines.push('')

    // Contacts Section
    lines.push('=== CONTACTS ===')
    lines.push('Name,Role,Email,Phone,Customer,Site,Champion')
    contacts.forEach(c => {
      lines.push(`${escapeCSV(c.name)},${escapeCSV(c.role)},${escapeCSV(c.email)},${escapeCSV(c.phone)},${escapeCSV(c.site.customer.name)},${escapeCSV(c.site.name)},${c.isChampion ? 'Yes' : 'No'}`)
    })

    const csv = lines.join('\n')
    const timestamp = new Date().toISOString().split('T')[0]

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="crm-export-${timestamp}.csv"`,
      },
    })
  } catch (error) {
    console.error('[Export] CSV generation failed:', error)
    // Return HTML error page for form submission instead of JSON
    const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Export Failed</title></head>
<body style="font-family: sans-serif; padding: 40px; text-align: center;">
  <h1>Export Failed</h1>
  <p>Unable to generate CSV export. Please try again or contact support.</p>
  <a href="/reports" style="color: #5034FF;">Return to Reports</a>
</body>
</html>`
    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}
