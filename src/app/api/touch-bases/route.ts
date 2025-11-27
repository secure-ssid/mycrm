import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createTouchBaseSchema } from '@/lib/validations/touch-base'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const touchBases = await prisma.touchBase.findMany({
      where: {
        contact: {
          site: {
            customer: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        contact: { include: { site: { include: { customer: true } } } },
      },
      orderBy: { createdAt: 'desc' },
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
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validation = createTouchBaseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }
    const data = validation.data

    const touchBase = await prisma.touchBase.create({
      data: {
        whereMet: data.whereMet || null,
        notes: data.notes || null,
        conversationNotes: data.conversationNotes || null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        done: data.done || false,
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
