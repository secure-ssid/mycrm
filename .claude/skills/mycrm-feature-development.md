# MyCRM Feature Development Skill

This skill guides the development of new features in MyCRM following established conventions and patterns.

## When to Use

Use this skill when:
- Adding a new entity or module to the CRM
- Creating new pages in the dashboard
- Building forms for data entry
- Implementing list views with filtering

## Project Architecture

```
src/
├── app/
│   ├── (auth)/           # Public auth pages (login, register)
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── [entity]/
│   │   │   ├── page.tsx         # List view (Server Component)
│   │   │   ├── new/page.tsx     # Create form (Client Component)
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Detail view
│   │   │       └── edit/page.tsx # Edit form
│   │   └── layout.tsx    # Auth wrapper with sidebar
│   └── api/              # API routes for mutations
├── components/
│   ├── ui/               # Reusable primitives (Button, Card, Input)
│   ├── layout/           # Sidebar, Header
│   └── [feature]/        # Feature-specific components
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── auth.ts           # NextAuth configuration
│   ├── auth-utils.ts     # Server-side auth helpers
│   ├── types.ts          # Enum constants for SQLite
│   └── validations/      # Zod schemas per entity
└── prisma/
    └── schema.prisma     # Database schema
```

## Feature Checklist

When adding a new feature, create these files in order:

### 1. Database Layer
- [ ] Add model to `prisma/schema.prisma`
- [ ] Add enum constants to `src/lib/types.ts` (SQLite doesn't support enums)
- [ ] Run `npm run db:push` to sync schema
- [ ] Update seed data in `prisma/seed.ts` if needed

### 2. Validation Layer
- [ ] Create `src/lib/validations/[entity].ts` with Zod schemas
- [ ] Export `create[Entity]Schema` and `update[Entity]Schema`
- [ ] Export TypeScript types: `Create[Entity]Input`, `Update[Entity]Input`

### 3. API Layer
- [ ] Create `src/app/api/[entities]/route.ts` (GET list, POST create)
- [ ] Create `src/app/api/[entities]/[id]/route.ts` (GET one, PUT update, DELETE)
- [ ] Use `getServerSession(authOptions)` for auth
- [ ] Filter by `userId` for user-scoped data
- [ ] Use Zod validation before database operations

### 4. UI Layer
- [ ] Create list page: `src/app/(dashboard)/[entities]/page.tsx`
- [ ] Create form page: `src/app/(dashboard)/[entities]/new/page.tsx`
- [ ] Create detail page: `src/app/(dashboard)/[entities]/[id]/page.tsx`
- [ ] Create edit page: `src/app/(dashboard)/[entities]/[id]/edit/page.tsx`
- [ ] Add navigation link to `src/components/layout/sidebar.tsx`

## Code Patterns

### List Page (Server Component)
```tsx
import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getEntities() {
  return prisma.entity.findMany({
    include: { relatedEntity: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function EntitiesPage() {
  const entities = await getEntities()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Entities
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Manage your entities
          </p>
        </div>
        <Link href="/entities/new" className="btn-primary btn-md">
          + Add Entity
        </Link>
      </div>
      {/* List content */}
    </div>
  )
}
```

### Form Page (Client Component)
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewEntityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const res = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create')
      }

      router.push('/entities')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

## UI Components

### Available Button Classes
- `btn-primary btn-sm|btn-md|btn-lg` - Primary purple button
- `btn-secondary btn-sm|btn-md|btn-lg` - Secondary gray button
- `btn-danger btn-sm|btn-md|btn-lg` - Red danger button
- `btn-ghost btn-sm|btn-md|btn-lg` - Transparent ghost button

### Available Badge Classes
- `badge badge-success` - Green (completed, active)
- `badge badge-warning` - Orange (in progress, at risk)
- `badge badge-danger` - Red (overdue, urgent)
- `badge badge-info` - Cyan (info, open)

### Card Component
```tsx
<div className="card p-4">
  {/* Card content */}
</div>
```

## Color Palette (monday.com inspired)
- Primary: `text-primary-600`, `bg-primary-500`
- Success: `text-success-600`, `bg-success-500` (#00C875)
- Warning: `text-warning-600`, `bg-warning-500` (#FDAB3D)
- Danger: `text-danger-600`, `bg-danger-500` (#E2445C)
- Info: `text-info-600`, `bg-info-500` (#00D2D2)
- Surface: `text-surface-900` (light), `dark:text-surface-100` (dark)

## Data Relationships

```
Customer (top-level account)
├── Strategy (1:1)
├── Sites (1:many)
│   ├── Contacts (1:many)
│   │   └── TouchBases (1:many, follow-ups)
│   ├── Pipelines (1:many)
│   │   └── Project (1:1, optional conversion)
│   └── Projects (1:many)
├── Goals (1:many)
├── Meetings (1:many)
├── Tasks (1:many)
├── Documents (1:many)
└── ActivityLog (1:many)
```

## Testing Checklist

After implementing a feature:
- [ ] Run `npm run build` to check for TypeScript errors
- [ ] Test create flow with valid data
- [ ] Test validation with invalid data
- [ ] Test edit flow
- [ ] Test delete flow (if applicable)
- [ ] Verify dark mode styling
- [ ] Check responsive layout on mobile
