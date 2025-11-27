import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createMeetingSchema } from '@/lib/validations/meeting'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        customer: {
          userId: session.user.id,
        },
      },
      include: {
        customer: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error('Get meetings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
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
    const validation = createMeetingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }
    const data = validation.data

    const meeting = await prisma.meeting.create({
      data: {
        date: new Date(data.date),
        attendees: data.attendees || null,
        agenda: data.agenda || null,
        notes: data.notes || null,
        outcomes: data.outcomes || null,
        siteId: data.siteId || null,
        customerId: data.customerId,
      },
    })

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Create meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
