import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const touchBases = await prisma.touchBase.findMany({
      include: {
        contact: { include: { site: { include: { customer: true } } } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(touchBases)
  } catch (error) {
    console.error('Get touch bases error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch follow-ups' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data.contactId) {
      return NextResponse.json(
        { error: 'Contact is required' },
        { status: 400 }
      )
    }

    const touchBase = await prisma.touchBase.create({
      data: {
        date: new Date(data.date),
        notes: data.notes || null,
        outcome: data.outcome || null,
        nextSteps: data.nextSteps || null,
        contactId: data.contactId,
      },
    })

    return NextResponse.json(touchBase)
  } catch (error) {
    console.error('Create touch base error:', error)
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    )
  }
}
