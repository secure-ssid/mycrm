import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        site: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data.name || !data.siteId) {
      return NextResponse.json(
        { error: 'Name and site are required' },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        role: data.role || null,
        email: data.email || null,
        phone: data.phone || null,
        isChampion: data.isChampion || false,
        notes: data.notes || null,
        siteId: data.siteId,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
