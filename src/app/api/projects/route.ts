import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createProjectSchema } from '@/lib/validations/project'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        site: {
          customer: {
            userId: session.user.id,
          },
        },
      },
      include: {
        site: { include: { customer: true } },
      },
      orderBy: { createdAt: 'desc' },
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
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validation = createProjectSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }
    const data = validation.data

    const project = await prisma.project.create({
      data: {
        partner: data.partner || null,
        solutionType: data.solutionType || null,
        orderStatus: data.orderStatus || 'NOT_ORDERED',
        installStatus: data.installStatus || 'NOT_STARTED',
        notes: data.notes || null,
        pipelineId: data.pipelineId || null,
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
