import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createPipelineSchema } from '@/lib/validations/pipeline'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pipelines = await prisma.pipeline.findMany({
      where: {
        site: {
          customer: {
            userId: session.user.id,
          },
        },
      },
      include: {
        site: { include: { customer: true } },
      },
      orderBy: { status: 'asc' },
    })

    return NextResponse.json(pipelines)
  } catch (error) {
    console.error('Get pipelines error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pipelines' },
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
    const validation = createPipelineSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }
    const data = validation.data

    const pipeline = await prisma.pipeline.create({
      data: {
        description: data.description,
        value: data.value || 0,
        expectedClose: data.expectedClose || null,
        status: data.status || 'OPEN',
        siteId: data.siteId,
      },
    })

    return NextResponse.json(pipeline)
  } catch (error) {
    console.error('Create pipeline error:', error)
    return NextResponse.json(
      { error: 'Failed to create pipeline' },
      { status: 500 }
    )
  }
}
