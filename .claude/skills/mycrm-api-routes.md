# MyCRM API Routes Skill

This skill guides the creation of API routes with proper authentication, validation, and error handling.

## When to Use

Use this skill when:
- Creating new API endpoints for CRUD operations
- Adding authentication to routes
- Implementing data validation
- Handling errors consistently

## API Route Structure

### Collection Route (`/api/[entities]/route.ts`)

Handles GET (list) and POST (create) operations:

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createEntitySchema } from '@/lib/validations/entity'

// GET - List all entities for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const entities = await prisma.entity.findMany({
      where: {
        // Always filter by userId for user-scoped data
        userId: session.user.id,
        // OR for nested entities:
        // customer: { userId: session.user.id },
      },
      include: {
        // Include related data as needed
        relatedEntity: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(entities)
  } catch (error) {
    console.error('Get entities error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    )
  }
}

// POST - Create a new entity
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validate input with Zod
    const validation = createEntitySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data

    // Create with userId for ownership
    const entity = await prisma.entity.create({
      data: {
        userId: session.user.id,
        name: data.name,
        // Handle optional fields
        description: data.description || null,
        // Handle dates
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        // Use defaults for enums
        status: data.status || 'ACTIVE',
      },
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Create entity error:', error)
    return NextResponse.json(
      { error: 'Failed to create entity' },
      { status: 500 }
    )
  }
}
```

### Individual Route (`/api/[entities]/[id]/route.ts`)

Handles GET (single), PUT (update), and DELETE operations:

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateEntitySchema } from '@/lib/validations/entity'

type Props = {
  params: Promise<{ id: string }>
}

// GET - Fetch a single entity
export async function GET(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const entity = await prisma.entity.findFirst({
      where: {
        id,
        userId: session.user.id, // Verify ownership
      },
      include: {
        relatedEntities: true,
      },
    })

    if (!entity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Get entity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entity' },
      { status: 500 }
    )
  }
}

// PUT - Update an entity
export async function PUT(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    // Validate input
    const validation = updateEntitySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Verify ownership before update
    const existing = await prisma.entity.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const data = validation.data

    const entity = await prisma.entity.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status,
      },
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Update entity error:', error)
    return NextResponse.json(
      { error: 'Failed to update entity' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an entity
export async function DELETE(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Verify ownership before delete
    const existing = await prisma.entity.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.entity.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete entity error:', error)
    return NextResponse.json(
      { error: 'Failed to delete entity' },
      { status: 500 }
    )
  }
}
```

## Validation Schema Pattern

Create in `src/lib/validations/[entity].ts`:

```typescript
import { z } from 'zod'

// Export enum constants for use in validation and UI
export const EntityStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const

export const createEntitySchema = z.object({
  // Required string
  name: z.string().min(1, 'Name is required').max(255),

  // Optional string
  description: z.string().max(1000).optional().nullable(),

  // UUID reference
  customerId: z.string().uuid('Invalid customer ID'),

  // Optional UUID
  siteId: z.string().uuid('Invalid site ID').optional().nullable(),

  // Enum validation
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),

  // Date as ISO string
  dueDate: z.string().datetime().optional().nullable(),

  // Number
  value: z.number().min(0).optional(),

  // Boolean
  isActive: z.boolean().optional(),
})

// Update schema can extend or customize create schema
export const updateEntitySchema = createEntitySchema.partial()

// Export TypeScript types
export type CreateEntityInput = z.infer<typeof createEntitySchema>
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>
```

## Authentication Patterns

### Session Check (Required for all routes)
```typescript
const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### User-Scoped Queries
```typescript
// For top-level entities (Customer)
where: { userId: session.user.id }

// For nested entities (Task -> Customer -> User)
where: {
  customer: { userId: session.user.id }
}

// For deeply nested entities (Contact -> Site -> Customer -> User)
where: {
  site: { customer: { userId: session.user.id } }
}
```

## Error Handling

### Standard Error Responses
```typescript
// 400 - Bad Request (validation errors)
return NextResponse.json(
  { error: 'Validation failed', details: validation.error.issues },
  { status: 400 }
)

// 401 - Unauthorized (not logged in)
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 403 - Forbidden (logged in but no access)
return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

// 404 - Not Found
return NextResponse.json({ error: 'Not found' }, { status: 404 })

// 500 - Server Error
return NextResponse.json({ error: 'Failed to [action]' }, { status: 500 })
```

### Error Logging
Always log errors server-side for debugging:
```typescript
console.error('[Action] error:', error)
```

## Common Patterns

### Pagination (if needed)
```typescript
const page = parseInt(url.searchParams.get('page') || '1')
const limit = parseInt(url.searchParams.get('limit') || '20')

const entities = await prisma.entity.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
})
```

### Filtering
```typescript
const status = url.searchParams.get('status')

const entities = await prisma.entity.findMany({
  where: {
    userId: session.user.id,
    ...(status && { status }),
  },
})
```

### Including Related Data
```typescript
const entity = await prisma.entity.findFirst({
  include: {
    customer: true,              // Include related entity
    _count: {                    // Include counts
      select: { items: true },
    },
    items: {                     // Include with nested relations
      include: { subItems: true },
      orderBy: { createdAt: 'desc' },
    },
  },
})
```
