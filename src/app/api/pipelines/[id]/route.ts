import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updatePipelineSchema } from '@/lib/validations/pipeline'

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
    const body = await req.json()
    const validation = updatePipelineSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }
    const data = validation.data

    const pipeline = await prisma.pipeline.update({
      where: { id: params.id },
      data: {
        description: data.description,
        value: data.value,
        expectedClose: data.expectedClose || null,
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
