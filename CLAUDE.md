# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyCRM is an Account Planning CRM for managing B2B customer relationships. It tracks multi-site accounts, sales pipelines, projects, contacts, follow-ups, goals, and strategic planning.

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components, Server Actions)
- **Database**: SQLite with Prisma ORM (12 entities)
- **Auth**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS v3 with monday.com inspired colors
- **Font**: Poppins (Google Fonts)
- **Validation**: Zod
- **Charts**: Recharts

## Build Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── customers/     # Customer management
│   │   ├── pipeline/      # Sales pipeline
│   │   ├── projects/      # Project tracking
│   │   ├── follow-ups/    # Touch bases and follow-ups
│   │   ├── goals/         # Goal tracking
│   │   ├── tasks/         # Task management
│   │   └── reports/       # Reports and analytics
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (sidebar, header)
│   └── [feature]/         # Feature-specific components
├── lib/
│   ├── db.ts              # Prisma client singleton
│   ├── types.ts           # TypeScript type constants (enums)
│   ├── actions/           # Server Actions
│   └── validations/       # Zod schemas
prisma/
├── schema.prisma          # Database schema
├── seed.ts                # Seed data
└── migrations/            # Database migrations
```

## Database Entities

1. **User** - NextAuth.js authentication
2. **Customer** - Top-level account (Acme Corp)
3. **Strategy** - Account strategy document
4. **Site** - Physical locations within a customer
5. **Contact** - People at each site
6. **TouchBase** - Contact follow-up records
7. **Pipeline** - Sales opportunities
8. **Project** - Won deals being implemented
9. **Goal** - Quarterly targets
10. **Meeting** - Meeting records with notes
11. **Task** - Action items
12. **ActivityLog** - Audit trail
13. **Document** - Linked documents/files

## Enum-like Fields (SQLite Limitation)

SQLite doesn't support enums, so we use String fields with TypeScript constants:

```typescript
import { CustomerStatus, PipelineStatus, TaskPriority } from '@/lib/types'

// Use like: status: CustomerStatus.ACTIVE
```

## Color Palette (monday.com inspired)

- Primary: `#5034FF` (purple), `#6161FF` (light purple)
- Success: `#00C875` (green)
- Warning: `#FDAB3D` (orange)
- Danger: `#E2445C` (red)
- Info: `#00D2D2` (cyan)
- Dark backgrounds: `#0F1048`, `#0b0b4a`

## Development Notes

- Use Server Components by default; add 'use client' only when needed
- Use Server Actions for mutations (no API routes)
- Access database directly in Server Components via Prisma
- Dark mode uses Tailwind's `class` strategy

## Demo Credentials

- Email: demo@mycrm.com
- Password: demo1234

## Key Files

### Auth
- `src/lib/auth.ts` - NextAuth.js configuration
- `src/lib/auth-utils.ts` - Server-side auth helpers (getSession, requireAuth)
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API route

### Layout
- `src/components/layout/sidebar.tsx` - Navigation sidebar
- `src/components/layout/header.tsx` - Top header with search and user menu
- `src/app/(dashboard)/layout.tsx` - Protected dashboard wrapper

### UI Components
- `src/components/ui/button.tsx` - Button variants (primary, secondary, danger, ghost)
- `src/components/ui/input.tsx` - Form input with label and error
- `src/components/ui/select.tsx` - Dropdown select with label and error
- `src/components/ui/card.tsx` - Card, CardHeader, CardTitle, CardContent

## Sprint Plan

See `/plans/account-planning-crm-mvp.md` for the full 3-week implementation plan.

## Progress

- **Day 1**: Project setup, Prisma schema, seed data
- **Day 2**: Auth, dashboard shell, all page stubs
