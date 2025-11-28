# MyCRM

An Account Planning CRM for managing B2B customer relationships. Track multi-site accounts, sales pipelines, projects, contacts, follow-ups, goals, and strategic planning.

## Features

- **Customer Management** - Track companies with multiple sites and contacts
- **Sales Pipeline** - Manage opportunities through stages (Open, Closing Soon, Won, Lost)
- **Task Management** - Kanban-style task board with priorities and due dates
- **Goal Tracking** - Set and monitor quarterly targets with progress visualization
- **Follow-ups** - Schedule and track touch bases with contacts
- **Reports & Analytics** - Dashboard with charts and CSV export
- **Strategy Documents** - Account planning and strategic notes per customer

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Database**: SQLite with Prisma ORM
- **Auth**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with monday.com inspired design
- **Charts**: Recharts
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/secure-ssid/mycrm.git
cd mycrm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Seed sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Email**: demo@mycrm.com
- **Password**: demo1234

## Scripts

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
├── app/
│   ├── (auth)/            # Login, register pages
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── customers/     # Customer management
│   │   ├── pipeline/      # Sales pipeline
│   │   ├── projects/      # Project tracking
│   │   ├── follow-ups/    # Touch bases
│   │   ├── goals/         # Goal tracking
│   │   ├── tasks/         # Task management
│   │   └── reports/       # Reports and analytics
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Sidebar, header
│   └── charts/            # Recharts visualizations
└── lib/
    ├── db.ts              # Prisma client
    ├── auth.ts            # NextAuth config
    └── validations/       # Zod schemas
```

## Screenshots

### Dashboard
The home dashboard displays key metrics, upcoming tasks, pending follow-ups, and goal progress.

### Pipeline
Kanban-style board showing opportunities by stage with deal values.

### Reports
Analytics page with pipeline funnel, deal distribution charts, and CSV export.

## License

MIT
