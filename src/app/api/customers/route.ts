import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { name, industry, status } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        industry: industry || null,
        status: status || 'PROSPECT',
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        sites: {
          include: {
            _count: { select: { contacts: true } },
          },
        },
        _count: {
          select: { goals: true, meetings: true, tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
