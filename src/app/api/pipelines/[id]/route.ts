import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: params.id },
      include: {
        site: { include: { customer: true } },
      },
    })

    if (!pipeline) {
      return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 })
    }

    return NextResponse.json(pipeline)
  } catch (error) {
    console.error('Get pipeline error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pipeline' },
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
    const data = await req.json()

    const pipeline = await prisma.pipeline.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description || null,
        value: data.value,
        probability: data.probability,
        status: data.status,
        siteId: data.siteId,
      },
    })

    return NextResponse.json(pipeline)
  } catch (error) {
    console.error('Update pipeline error:', error)
    return NextResponse.json(
      { error: 'Failed to update pipeline' },
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
    await prisma.pipeline.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete pipeline error:', error)
    return NextResponse.json(
      { error: 'Failed to delete pipeline' },
      { status: 500 }
    )
  }
}
