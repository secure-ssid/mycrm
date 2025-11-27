import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateTouchBaseSchema } from '@/lib/validations/touch-base'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const touchBase = await prisma.touchBase.findUnique({
      where: { id: params.id },
      include: {
        contact: { include: { site: { include: { customer: true } } } },
      },
    })

    if (!touchBase) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 })
    }

    return NextResponse.json(touchBase)
  } catch (error) {
    console.error('Get touch base error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch follow-up' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validation = updateTouchBaseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }
    const data = validation.data

    const touchBase = await prisma.touchBase.update({
      where: { id: params.id },
      data: {
        whereMet: data.whereMet || null,
        notes: data.notes || null,
        conversationNotes: data.conversationNotes || null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        done: data.done,
        contactId: data.contactId,
      },
    })

    return NextResponse.json(touchBase)
  } catch (error) {
    console.error('Update touch base error:', error)
    return NextResponse.json(
      { error: 'Failed to update follow-up' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.touchBase.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete touch base error:', error)
    return NextResponse.json(
      { error: 'Failed to delete follow-up' },
      { status: 500 }
    )
  }
}
