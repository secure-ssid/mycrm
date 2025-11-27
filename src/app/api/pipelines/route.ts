import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pipelines = await prisma.pipeline.findMany({
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
    const data = await req.json()

    if (!data.name || !data.siteId) {
      return NextResponse.json(
        { error: 'Name and site are required' },
        { status: 400 }
      )
    }

    const pipeline = await prisma.pipeline.create({
      data: {
        name: data.name,
        description: data.description || null,
        value: data.value || 0,
        probability: data.probability || 50,
        status: data.status || 'PROSPECT',
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
