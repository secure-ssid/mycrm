import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const data = await req.json()

    if (!data.name || !data.customerId) {
      return NextResponse.json(
        { error: 'Name and customer are required' },
        { status: 400 }
      )
    }

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
