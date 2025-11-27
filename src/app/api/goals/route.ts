import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createGoalSchema } from '@/lib/validations/goal'

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
    const body = await req.json()
    const validation = createGoalSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }
    const data = validation.data

    const goal = await prisma.goal.create({
      data: {
        type: data.type,
        target: data.target || 0,
        actual: data.actual || 0,
        quarter: data.quarter,
        deadline: data.deadline ? new Date(data.deadline) : null,
        reflection: data.reflection || null,
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
