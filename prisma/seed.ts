import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo user
  const hashedPassword = await hash('demo1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@mycrm.com' },
    update: {},
    create: {
      email: 'demo@mycrm.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })
  console.log('✓ Created demo user:', user.email)

  // Create sample customers
  const acmeCorp = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      industry: 'Manufacturing',
      status: 'ACTIVE',
      strategy: {
        create: {
          overview: 'Acme is our largest manufacturing client with 12 sites across the midwest.',
          currentStatus: 'Strong relationship, expanding into new product lines.',
          painPoints: JSON.stringify([
            { title: 'Legacy Systems', description: 'Running outdated ERP system from 2010' },
            { title: 'Manual Processes', description: 'Still using spreadsheets for inventory tracking' },
          ]),
          opportunities: JSON.stringify([
            { title: 'ERP Modernization', description: 'Large project to replace legacy systems' },
            { title: 'IoT Integration', description: 'Factory floor monitoring and automation' },
          ]),
        },
      },
      sites: {
        create: [
          {
            name: 'Acme HQ',
            address: '100 Industrial Blvd',
            city: 'Chicago',
            state: 'IL',
            competitors: 'TechVendor Inc, Legacy Systems LLC',
            contacts: {
              create: [
                {
                  name: 'John Smith',
                  role: 'VP of Operations',
                  email: 'jsmith@acme.com',
                  phone: '312-555-0100',
                  isChampion: true,
                  notes: 'Key decision maker, very responsive',
                },
                {
                  name: 'Sarah Johnson',
                  role: 'IT Director',
                  email: 'sjohnson@acme.com',
                  phone: '312-555-0101',
                  notes: 'Technical evaluator',
                },
              ],
            },
            pipelines: {
              create: {
                description: 'ERP System Upgrade',
                value: 250000,
                status: 'CLOSING_SOON',
                expectedClose: 'Q1 2026',
              },
            },
          },
          {
            name: 'Acme Plant - Detroit',
            address: '500 Factory Lane',
            city: 'Detroit',
            state: 'MI',
            contacts: {
              create: {
                name: 'Mike Wilson',
                role: 'Plant Manager',
                email: 'mwilson@acme.com',
                phone: '313-555-0200',
              },
            },
          },
        ],
      },
      goals: {
        create: [
          {
            type: 'Quarterly Revenue',
            target: 100000,
            actual: 75000,
            quarter: 'Q4 2025',
          },
          {
            type: 'Site Visits',
            target: 4,
            actual: 2,
            quarter: 'Q4 2025',
          },
        ],
      },
      meetings: {
        create: {
          date: new Date('2025-01-15T14:00:00'),
          attendees: 'John Smith, Sarah Johnson',
          agenda: 'Q1 planning and ERP project kickoff',
          notes: 'Discussed timeline, need to follow up with SOW',
        },
      },
    },
  })
  console.log('✓ Created customer:', acmeCorp.name)

  const techStartup = await prisma.customer.create({
    data: {
      name: 'TechStartup Inc',
      industry: 'Software',
      status: 'PROSPECT',
      sites: {
        create: {
          name: 'TechStartup Office',
          address: '250 Innovation Way',
          city: 'San Francisco',
          state: 'CA',
          contacts: {
            create: [
              {
                name: 'Emily Chen',
                role: 'CTO',
                email: 'echen@techstartup.io',
                isChampion: true,
              },
              {
                name: 'Alex Rivera',
                role: 'Engineering Manager',
                email: 'arivera@techstartup.io',
              },
            ],
          },
          pipelines: {
            create: {
              description: 'Cloud Infrastructure Setup',
              value: 50000,
              status: 'OPEN',
              expectedClose: 'Q2 2026',
            },
          },
        },
      },
    },
  })
  console.log('✓ Created customer:', techStartup.name)

  const globalRetail = await prisma.customer.create({
    data: {
      name: 'Global Retail Co',
      industry: 'Retail',
      status: 'ACTIVE',
      strategy: {
        create: {
          overview: 'National retail chain with 50+ locations.',
          currentStatus: 'Mid-contract, focusing on renewals.',
          painPoints: JSON.stringify([
            { title: 'POS Integration', description: 'Multiple POS systems across stores' },
          ]),
        },
      },
      sites: {
        create: [
          {
            name: 'Global Retail - Corporate',
            address: '1 Retail Plaza',
            city: 'New York',
            state: 'NY',
            contacts: {
              create: {
                name: 'Patricia Adams',
                role: 'VP of IT',
                email: 'padams@globalretail.com',
                phone: '212-555-0300',
                isChampion: true,
              },
            },
          },
          {
            name: 'Global Retail - LA Store',
            address: '999 Sunset Blvd',
            city: 'Los Angeles',
            state: 'CA',
          },
        ],
      },
      tasks: {
        create: [
          {
            description: 'Send renewal proposal',
            dueDate: new Date('2025-02-01'),
            priority: 'HIGH',
            status: 'PENDING',
          },
          {
            description: 'Schedule quarterly review call',
            dueDate: new Date('2025-01-20'),
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
          },
        ],
      },
    },
  })
  console.log('✓ Created customer:', globalRetail.name)

  // Create a project linked to a pipeline
  const acmeHQ = await prisma.site.findFirst({
    where: { name: 'Acme HQ' },
    include: { pipelines: true },
  })

  if (acmeHQ && acmeHQ.pipelines[0]) {
    await prisma.project.create({
      data: {
        siteId: acmeHQ.id,
        pipelineId: acmeHQ.pipelines[0].id,
        partner: 'Integration Partners LLC',
        solutionType: 'Enterprise ERP',
        orderStatus: 'NOT_ORDERED',
        installStatus: 'NOT_STARTED',
        notes: 'Waiting for final approval',
      },
    })
    console.log('✓ Created project for Acme HQ')
  }

  // Create some touch bases (follow-ups)
  const johnSmith = await prisma.contact.findFirst({
    where: { name: 'John Smith' },
  })

  if (johnSmith) {
    await prisma.touchBase.createMany({
      data: [
        {
          contactId: johnSmith.id,
          whereMet: 'Industry Conference',
          notes: 'Great conversation about their expansion plans',
          conversationNotes: 'John mentioned they are looking to expand to 3 new sites in 2026.',
          followUpDate: new Date('2025-01-10'),
          done: false,
        },
        {
          contactId: johnSmith.id,
          whereMet: 'Phone Call',
          notes: 'Quarterly check-in',
          conversationNotes: 'Reviewed current projects, all on track.',
          followUpDate: new Date('2024-12-15'),
          done: true,
        },
      ],
    })
    console.log('✓ Created touch bases for John Smith')
  }

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📧 Login credentials:')
  console.log('   Email: demo@mycrm.com')
  console.log('   Password: demo1234')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
