# FAST Dashboard

## Overview

The FAST Dashboard is an enterprise IT asset management prototype built for Freddie Mac. It provides a unified interface for viewing and managing technology portfolios across multiple data domains including Assets, TPI (Technology Portfolio Insight), BTO (Business Technology Office), and CMDB (Configuration Management Database). The application supports two user personas: Admins with full CRUD capabilities and Viewers with read-only access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, React Context for user/theme state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Storage Pattern**: Interface-based storage abstraction (currently using in-memory storage, ready for database migration)

### Key Design Patterns
- **Role-Based Access Control**: User context provides `isAdmin` flag to conditionally render edit controls
- **View Toggle Pattern**: Users can switch between table and card views for data display
- **Column Filtering**: Excel-style multi-select filters on table columns
- **Responsive Layout**: Mobile-first design with consistent navigation header

### Project Structure
```
client/src/           # React frontend
  components/         # UI components (DataTable, DataCard, filters, layout)
  components/ui/      # shadcn/ui primitives
  pages/              # Route pages (Dashboard is the main page)
  lib/                # Utilities, mock data, context providers
  hooks/              # Custom React hooks
server/               # Express backend
  routes.ts           # API route registration
  storage.ts          # Data access layer interface
  vite.ts             # Vite dev server integration
shared/               # Shared types and schemas
  schema.ts           # Drizzle database schema and Zod types
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations stored in `/migrations`

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities
- **cmdk**: Command palette component
- **embla-carousel**: Carousel functionality

### Development Tools
- **tsx**: TypeScript execution for server
- **esbuild**: Production bundling for server code
- **Vite plugins**: Replit-specific dev tools (cartographer, dev-banner, runtime-error-modal)

### Branding
- Custom color scheme based on Freddie Mac corporate identity (Deep Blue primary, accent colors)
- Google Fonts: Open Sans (body), Source Sans 3 (headings)