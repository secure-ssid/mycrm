import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        site: { include: { customer: true } },
      },
      orderBy: { status: 'asc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data.name || !data.siteId) {
      return NextResponse.json(
        { error: 'Name and site are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status || 'PLANNING',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget || null,
        siteId: data.siteId,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
