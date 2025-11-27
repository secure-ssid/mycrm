import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const goals = await prisma.goal.findMany({
      where: {
        customer: {
          userId: session.user.id,
        },
      },
      include: {
        customer: true,
      },
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
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
    const data = await req.json()

    if (!data.title || !data.customerId) {
      return NextResponse.json(
        { error: 'Title and customer are required' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description || null,
        targetValue: data.targetValue || null,
        currentValue: data.currentValue || 0,
        metric: data.metric || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status || 'ACTIVE',
        customerId: data.customerId,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
