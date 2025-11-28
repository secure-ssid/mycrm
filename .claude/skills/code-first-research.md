# Code-First Research Skill

This skill establishes the principle of checking existing code before searching external resources.

## When to Use

Use this approach for ANY question about:
- How something works in this codebase
- What patterns are used
- Where to find implementations
- How to add new features consistently

## Research Priority Order

### 1. Check Existing Code FIRST

Before searching the web, always check:

1. **Similar implementations in the codebase**
   ```bash
   # Find similar patterns
   Glob: src/app/api/**/route.ts
   Grep: "pattern you're looking for"
   ```

2. **Project documentation**
   - `CLAUDE.md` - Project conventions and structure
   - `README.md` - Setup and overview
   - `plans/` - Feature plans and architecture

3. **Type definitions and schemas**
   - `prisma/schema.prisma` - Data models
   - `src/lib/types.ts` - Enum constants
   - `src/lib/validations/` - Zod schemas

4. **Existing components for patterns**
   - `src/components/ui/` - UI primitives
   - `src/app/(dashboard)/` - Page patterns

### 2. Use Codebase Search Tools

```bash
# Find files by pattern
Glob: **/*.tsx
Glob: src/lib/**/*.ts

# Search file contents
Grep: "getServerSession"
Grep: "createTaskSchema"

# Read specific files
Read: src/lib/auth.ts
```

### 3. Only Then Search Externally

If the answer isn't in the codebase:
- Search official documentation first
- Use Context7 for library-specific docs
- Web search as last resort

## Examples

### Bad: Searching Web First
```
User: "How do I add authentication to a route?"
❌ Immediately searches web for "Next.js authentication"
```

### Good: Check Code First
```
User: "How do I add authentication to a route?"
✅ Steps:
1. Grep for "getServerSession" to find existing auth patterns
2. Read src/app/api/customers/route.ts as example
3. Check CLAUDE.md for auth documentation
4. Only search web if pattern unclear
```

## MyCRM-Specific Lookups

### Authentication Pattern
```typescript
// Check existing: src/app/api/customers/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Validation Pattern
```typescript
// Check existing: src/lib/validations/task.ts
import { z } from 'zod'

export const createTaskSchema = z.object({
  description: z.string().min(1),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
})
```

### Page Component Pattern
```typescript
// Check existing: src/app/(dashboard)/tasks/page.tsx
async function getData() {
  return prisma.entity.findMany({...})
}

export default async function Page() {
  const data = await getData()
  return <div>...</div>
}
```

### Form Component Pattern
```typescript
// Check existing: src/app/(dashboard)/tasks/new/page.tsx
'use client'

export default function NewPage() {
  async function handleSubmit(e: React.FormEvent) {
    const res = await fetch('/api/entities', {...})
  }
}
```

## Benefits of Code-First Approach

1. **Consistency** - New code matches existing patterns
2. **Speed** - Answers are often already in the codebase
3. **Accuracy** - Uses actual project conventions, not generic examples
4. **Learning** - Better understanding of the codebase over time
5. **No outdated info** - Web results may be for different versions

## Search Order Summary

```
1. Codebase → Glob/Grep/Read tools
2. Project docs → CLAUDE.md, README, plans/
3. Official docs → Framework documentation
4. Context7 → Library-specific documentation
5. Web search → Last resort for novel problems
```
