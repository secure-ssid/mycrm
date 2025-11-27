import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createSiteSchema } from '@/lib/validations/site'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sites = await prisma.site.findMany({
      where: {
        customer: {
          userId: session.user.id,
        },
      },
      include: {
        customer: true,
      },
      orderBy: [
        { customer: { name: 'asc' } },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error('Get sites error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = createSiteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }
    const data = validation.data

    const site = await prisma.site.create({
      data: {
        name: data.name,
        address: data.address || null,
        customerId: data.customerId,
      },
    })

    return NextResponse.json(site)
  } catch (error) {
    console.error('Create site error:', error)
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    )
  }
}
