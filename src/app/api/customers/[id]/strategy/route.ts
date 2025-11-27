import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()

    const strategy = await prisma.strategy.create({
      data: {
        customerId: params.id,
        overview: data.overview || null,
        currentStatus: data.currentStatus || null,
        painPoints: data.painPoints || null,
        opportunities: data.opportunities || null,
        actionPlan: data.actionPlan || null,
        nextSteps: data.nextSteps || null,
        onenoteLink: data.onenoteLink || null,
      },
    })

    return NextResponse.json(strategy)
  } catch (error) {
    console.error('Create strategy error:', error)
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()

    const strategy = await prisma.strategy.update({
      where: { customerId: params.id },
      data: {
        overview: data.overview || null,
        currentStatus: data.currentStatus || null,
        painPoints: data.painPoints || null,
        opportunities: data.opportunities || null,
        actionPlan: data.actionPlan || null,
        nextSteps: data.nextSteps || null,
        onenoteLink: data.onenoteLink || null,
      },
    })

    return NextResponse.json(strategy)
  } catch (error) {
    console.error('Update strategy error:', error)
    return NextResponse.json(
      { error: 'Failed to update strategy' },
      { status: 500 }
    )
  }
}
