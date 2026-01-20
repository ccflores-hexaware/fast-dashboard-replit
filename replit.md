# Freddie Mac Enterprise IT Management Suite

## Overview
This is an enterprise IT management suite developed for Freddie Mac containing two main applications:

### Application Structure
The suite uses a **super application** pattern with a landing page at the root that allows users to navigate between:

1. **FAST Dashboard** (`/fast`) - Freddie Mac Asset & System Tracking
   - Manages technology portfolios across Assets, TPI, BTO, CMDB, and Recon modules
   - Full CRUD capabilities for Admins, read-only for Viewers

2. **PBC Automation System** (`/pbc`) - Self-Service Control Evidence System
   - Request control execution evidence for auditors
   - Supports 43 IAM controls (9 automated, 34 manual)
   - Date range selection with validation
   - Request history tracking with View/Download functionality
   - Request history search functionality (filter by Control ID, Request ID, status, or date range)
   - Excel export of evidence reports

### Navigation Flow
- **Landing Page** (`/`): Choose between FAST or PBC applications
- **FAST Dashboard**: Has its own layout with tabs (FAST, Sub-assets, TPI, BTO, CMDB, Recon) + Home button
- **PBC System**: Has its own layout with "Back to Home" navigation

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query for server state, React Context for UI state
- **UI Components**: shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode)
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod
- **Storage Pattern**: Interface-based abstraction

### Key Design Patterns
- **Role-Based Access Control**: Admin flag for conditional UI.
- **View Toggle**: Switch between table and card views.
- **Column Filtering & Visibility**: Excel-style multi-select filters and configurable column visibility with persistence.
- **Card Field Visibility**: Configurable display with a 7-field limit and persistence.
- **Standard CRUD Operations**: Create, Read, Update, Delete across modules.
- **Activity Tracking**: Unified activity log for FAST assets using JSONB.
- **Responsive Layout**: Mobile-first design.
- **SCD Type 2 History**: TPI and CMDB modules utilize Slowly Changing Dimension Type 2 for historical data auditing, employing PostgreSQL triggers to capture full record snapshots with start and end dates.

### Module-Specific Features
- **FAST**: Activity log for user edits.
- **Sub-assets**: One-level deep sub-asset creation linked to parent FAST assets.
- **TPI & CMDB**: SCD Type 2 history for external system updates. CMDB includes bulk history upload via Excel/CSV files with drag-and-drop support, template download, and row-level error reporting.
- **BTO**: Data derived from TPI assets and BTO mapping, displayed with hierarchical aggregation and Excel export. Includes BTO mapping reassignment feature allowing users to change the Higher Level BTO for any BTO/Division mapping. Features a "Show zero-asset mappings" toggle to view and reassign mappings with no associated assets.
- **Recon**: Read-only module with a two-step master-detail flow:
  - **Application List View (1st screen)**: Shows unique applications with name, status badge, and record count. Supports search by application name, filter by application status dropdown, and pagination.
  - **Application Detail View (2nd screen)**: Shows records for a selected application, grouped by Account Name with collapsible accordion rows. Features include: search across all fields, Excel-style column filtering, column sorting, and a details dialog when clicking a row. Pagination operates per account group.

### Project Structure
The project is organized into `client/` (React frontend), `server/` (Express backend), and `shared/` (common types and schemas). It emphasizes shared components, hooks, and utilities to reduce redundancy across features.

### Modular Feature Architecture
All major pages follow a consistent modular architecture pattern with feature-specific folders:
- **FAST** (`client/src/features/FAST/`): components/, hooks/, types/, constants/
- **SubAssets** (`client/src/features/SubAssets/`): components/, hooks/, types/, constants/
- **TPI** (`client/src/features/TPI/`): components/, hooks/, types/, constants/
- **CMDB** (`client/src/features/CMDB/`): components/, hooks/, types/, constants/, utils/
- **Recon** (`client/src/features/Recon/`): components/, hooks/, types/, constants/
- **BTO** (`client/src/pages/BTOPage.tsx`): Uses unique expandable table structure, kept as single file
- **PBC** (`client/src/pages/PBCAutomationPage.tsx`): Self-service PBC automation with mock data in `client/src/lib/pbcMockData.ts`

### Layout Components
- **DashboardLayout** (`client/src/components/DashboardLayout.tsx`): Shared layout for FAST modules
- **PBCLayout** (`client/src/components/PBCLayout.tsx`): Separate layout for PBC system
- **LandingPage** (`client/src/pages/LandingPage.tsx`): Application selector/launcher

Each feature module contains:
- **types/**: TypeScript interfaces for assets, columns, and state
- **constants/**: Column definitions, presets, and field configurations
- **hooks/**: React hooks for data fetching, state management, column visibility, and dialogs
- **components/**: UI components including tables, cards, toolbars, headers, and dialogs

Main page files are kept minimal (50-120 lines), importing from their respective feature modules.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **Drizzle Kit**: For database migrations.

### UI Libraries
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **date-fns**: Date formatting.
- **cmdk**: Command palette.
- **embla-carousel**: Carousel functionality.
- **@tanstack/react-virtual**: List virtualization for performance with large datasets.

### Development Tools
- **tsx**: TypeScript execution for server.
- **esbuild**: Production bundling for server.
- **Vite**: Frontend development server.
- **Vitest**: Unit testing framework.