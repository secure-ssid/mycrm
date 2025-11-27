import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
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
  try {
    const data = await req.json()

    if (!data.title || !data.customerId) {
      return NextResponse.json(
        { error: 'Title and customer are required' },
        { status: 400 }
      )
    }

    const meeting = await prisma.meeting.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        notes: data.notes || null,
        attendees: data.attendees || null,
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
