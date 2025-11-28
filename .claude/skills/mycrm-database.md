# MyCRM Database & Prisma Skill

This skill guides database operations, schema design, and Prisma patterns in MyCRM.

## When to Use

Use this skill when:
- Adding new database models
- Creating relationships between entities
- Writing complex Prisma queries
- Handling enum-like fields in SQLite
- Managing migrations and seeding

## Database Architecture

### SQLite Considerations

MyCRM uses SQLite which has some limitations:
1. **No native enums** - Use String fields with TypeScript constants
2. **No array types** - Use JSON stored as String
3. **Limited concurrent writes** - Fine for single-user CRM

### Prisma Client Location
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Entity Relationships

```
User (auth)
└── Customer (top-level account)
    ├── Strategy (1:1 optional)
    ├── Site (1:many)
    │   ├── Contact (1:many)
    │   │   └── TouchBase (1:many)
    │   ├── Pipeline (1:many)
    │   │   └── Project (1:1 optional)
    │   └── Project (1:many)
    │       └── Pipeline (1:1 optional, backref)
    ├── Goal (1:many)
    ├── Meeting (1:many)
    ├── Task (1:many)
    ├── Document (1:many)
    └── ActivityLog (1:many)
```

## Schema Patterns

### Basic Model with User Ownership
```prisma
model Customer {
  id          String    @id @default(uuid())
  userId      String
  name        String
  industry    String?
  status      String    @default("ACTIVE")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sites       Site[]

  @@index([userId])
  @@index([name])
  @@index([status])
}
```

### One-to-One Relationship
```prisma
model Strategy {
  id             String   @id @default(uuid())
  customerId     String   @unique  // @unique makes it 1:1
  overview       String?
  updatedAt      DateTime @updatedAt

  customer       Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
}
```

### One-to-Many Relationship
```prisma
model Site {
  id          String    @id @default(uuid())
  customerId  String
  name        String

  customer    Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  contacts    Contact[]

  @@index([customerId])
}
```

### Self-referential / Complex Relations
```prisma
model Pipeline {
  id             String   @id @default(uuid())
  siteId         String
  description    String

  site           Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  project        Project? // Optional 1:1 when converted

  @@index([siteId])
}

model Project {
  id            String    @id @default(uuid())
  siteId        String
  pipelineId    String?   @unique  // Optional 1:1 backref

  site          Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  pipeline      Pipeline? @relation(fields: [pipelineId], references: [id])

  @@index([siteId])
}
```

## Enum-like Fields (SQLite Workaround)

### In Schema (use String)
```prisma
model Task {
  status      String    @default("PENDING")  // PENDING, IN_PROGRESS, DONE
  priority    String    @default("MEDIUM")   // LOW, MEDIUM, HIGH, URGENT
}
```

### In TypeScript (`src/lib/types.ts`)
```typescript
export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]
```

### In Validation (`src/lib/validations/task.ts`)
```typescript
import { z } from 'zod'

export const createTaskSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
})
```

## JSON Fields Pattern

### In Schema
```prisma
model Strategy {
  painPoints     String?  // JSON: Array of { title, description }
  opportunities  String?  // JSON: Array of { title, description }
}
```

### In TypeScript
```typescript
// src/lib/types.ts
export type PainPoint = {
  title: string
  description: string
}

// Reading JSON
const painPoints: PainPoint[] = strategy.painPoints
  ? JSON.parse(strategy.painPoints)
  : []

// Writing JSON
await prisma.strategy.update({
  where: { id },
  data: {
    painPoints: JSON.stringify(painPoints),
  },
})
```

## Query Patterns

### Basic CRUD
```typescript
// Create
const customer = await prisma.customer.create({
  data: {
    userId: session.user.id,
    name: 'Acme Corp',
    status: 'ACTIVE',
  },
})

// Read (single)
const customer = await prisma.customer.findUnique({
  where: { id: customerId },
})

// Read (with ownership check)
const customer = await prisma.customer.findFirst({
  where: { id: customerId, userId: session.user.id },
})

// Update
const customer = await prisma.customer.update({
  where: { id: customerId },
  data: { name: 'New Name' },
})

// Delete
await prisma.customer.delete({
  where: { id: customerId },
})
```

### Including Relations
```typescript
const customer = await prisma.customer.findUnique({
  where: { id },
  include: {
    strategy: true,           // Include 1:1
    sites: {                  // Include 1:many with nested
      include: {
        contacts: true,
        _count: { select: { pipelines: true } },
      },
    },
    _count: {                 // Count relations
      select: { tasks: true, goals: true },
    },
  },
})
```

### Filtering
```typescript
const tasks = await prisma.task.findMany({
  where: {
    customer: { userId: session.user.id },  // Ownership via relation
    status: 'PENDING',                       // Exact match
    priority: { in: ['HIGH', 'URGENT'] },   // Multiple values
    dueDate: { lte: new Date() },           // Date comparison
    description: { contains: 'review' },    // Text search
  },
})
```

### Ordering
```typescript
const tasks = await prisma.task.findMany({
  orderBy: [
    { status: 'asc' },      // Multiple order fields
    { priority: 'desc' },
    { dueDate: 'asc' },
  ],
})
```

### Aggregations
```typescript
// Count
const count = await prisma.customer.count({
  where: { userId: session.user.id },
})

// Group by
const tasksByStatus = await prisma.task.groupBy({
  by: ['status'],
  _count: true,
  where: { customer: { userId: session.user.id } },
})

// Sum (for Decimal fields)
const pipelines = await prisma.pipeline.findMany({
  select: { value: true },
})
const total = pipelines.reduce((sum, p) => sum + Number(p.value), 0)
```

### Nested Creates
```typescript
const customer = await prisma.customer.create({
  data: {
    userId: session.user.id,
    name: 'Acme Corp',
    sites: {
      create: [
        {
          name: 'HQ',
          contacts: {
            create: { name: 'John Smith', role: 'CEO' },
          },
        },
      ],
    },
  },
})
```

### Upsert
```typescript
const strategy = await prisma.strategy.upsert({
  where: { customerId },
  create: {
    customerId,
    overview: 'New strategy',
  },
  update: {
    overview: 'Updated strategy',
  },
})
```

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema to database (dev, no migration)
npm run db:push

# Create migration (production)
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio
```

## Seed Data Pattern

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data (makes seed idempotent)
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@mycrm.com' },
  })

  if (existingUser) {
    // Delete in reverse order of dependencies
    await prisma.touchBase.deleteMany({ where: { contact: { site: { customer: { userId: existingUser.id } } } } })
    await prisma.contact.deleteMany({ where: { site: { customer: { userId: existingUser.id } } } })
    await prisma.site.deleteMany({ where: { customer: { userId: existingUser.id } } })
    await prisma.customer.deleteMany({ where: { userId: existingUser.id } })
  }

  // Create user with upsert
  const user = await prisma.user.upsert({
    where: { email: 'demo@mycrm.com' },
    update: {},
    create: {
      email: 'demo@mycrm.com',
      name: 'Demo User',
      password: await hash('demo1234', 12),
    },
  })

  // Create nested data
  await prisma.customer.create({
    data: {
      userId: user.id,
      name: 'Sample Customer',
      sites: {
        create: {
          name: 'Main Office',
          contacts: {
            create: { name: 'Contact Person' },
          },
        },
      },
    },
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## Performance Tips

1. **Use indexes** for frequently queried fields:
   ```prisma
   @@index([userId])
   @@index([status])
   @@index([createdAt])
   ```

2. **Select only needed fields** for large queries:
   ```typescript
   const names = await prisma.customer.findMany({
     select: { id: true, name: true },
   })
   ```

3. **Use `findFirst` with ownership check** instead of `findUnique` + separate auth check

4. **Batch operations** with `createMany`/`deleteMany` when possible

5. **Avoid N+1 queries** - use `include` instead of separate queries
