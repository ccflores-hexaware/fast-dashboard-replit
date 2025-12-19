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
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Storage Pattern**: Interface-based storage abstraction with PostgreSQL database

### Key Design Patterns
- **Role-Based Access Control**: User context provides `isAdmin` flag to conditionally render edit controls
- **View Toggle Pattern**: Users can switch between table and card views for data display
- **Column Filtering**: Excel-style multi-select filters on table columns
- **Column Visibility**: Configurable column visibility with presets and localStorage persistence (Table view only)
- **Card Field Visibility**: Configurable card field display with 7-field maximum limit and localStorage persistence (Card view only)
- **Bidirectional Fake Asset Sync**: "Mark as Fake Asset" toggle syncs between FAST and Fake Asset List pages (permanent, one-way action)
- **Asset-Level Versioning (FAST only)**: FAST module supports full version history with automatic snapshots:
  - Each edit creates a new version and preserves the previous version as a read-only snapshot
  - "FAST History" checkbox toggles between showing only latest versions (default) or all historical versions
  - Historical versions are read-only; only the latest version can be edited
  - Version numbers increment automatically on each save
  - Date range filtering with presets (Today, Last 7 Days, etc.)
- **Responsive Layout**: Mobile-first design with consistent navigation header

### Project Structure
```
Freddie-Dash/
  client/               # React frontend (Vite)
    src/
      components/       # UI components
        ui/             # shadcn/ui primitives
        DashboardLayout.tsx
        DataTable.tsx   # Table view component
        DataCard.tsx    # Card view component
        FilterMenu.tsx  # Column filtering
        Pagination.tsx
      pages/
        Dashboard.tsx   # Main dashboard component (~2500 lines)
      lib/              # Utilities, context providers
        userContext.tsx # User/admin context
        queryClient.ts  # TanStack Query setup
        mockData.ts     # Sample data generation
      hooks/            # Custom React hooks
      App.tsx           # App entry with routing
    index.html          # HTML entry point
  server/               # Express backend
    index.ts            # Server entry point
    routes.ts           # API route registration
    storage.ts          # Data access layer interface
    vite.ts             # Vite dev server integration
  shared/               # Shared types and schemas
    schema.ts           # Drizzle database schema and Zod types
  docs/                 # Documentation
    FAST_Module_Documentation.md
    Functionality_Documentation.md
    Libraries_and_Dependencies.md
    UI_UX_Standards.md
  script/               # Build scripts
    build.ts            # Production build script
```

### Module-Specific Features

| Module | Versioning | Version Column | FAST History Toggle |
|--------|-----------|----------------|---------------------|
| FAST | Yes | Yes | Yes |
| Fake Asset List | No | No | No |
| TPI | No | Yes | No |
| BTO | No | No | No |
| CMDB | No | Yes | No |

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations with `npm run db:push`

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities
- **cmdk**: Command palette component
- **embla-carousel**: Carousel functionality

### Development Tools
- **tsx**: TypeScript execution for server
- **esbuild**: Production bundling for server code
- **Vite**: Frontend development server with HMR

### Branding
- Custom color scheme based on Freddie Mac corporate identity (Deep Blue primary, accent colors)
- Google Fonts: Open Sans (body), Source Sans 3 (headings)
