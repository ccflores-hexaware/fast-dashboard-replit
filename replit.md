# FAST Dashboard

## Overview
The FAST Dashboard is an enterprise IT asset management prototype developed for Freddie Mac. It offers a unified platform for managing technology portfolios across various data domains, including Assets, TPI (Technology Portfolio Insight), BTO (Business Technology Office), and CMDB (Configuration Management Database). The application supports two user roles: Admins with full CRUD capabilities and Viewers with read-only access. The business vision is to streamline IT asset visibility and management within the organization.

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
- **TPI & CMDB**: SCD Type 2 history for external system updates.
- **BTO**: Data derived from TPI assets and BTO mapping, displayed with hierarchical aggregation and Excel export.
- **Recon**: Read-only module with a two-step master-detail flow:
  - **Application List View (1st screen)**: Shows unique applications with name, status badge, and record count. Supports search by application name, filter by application status dropdown, and pagination.
  - **Application Detail View (2nd screen)**: Shows records for a selected application, grouped by Account Name with collapsible accordion rows. Features include: search across all fields, Excel-style column filtering, column sorting, and a details dialog when clicking a row. Pagination operates per account group.

### Project Structure
The project is organized into `client/` (React frontend), `server/` (Express backend), and `shared/` (common types and schemas). It emphasizes shared components, hooks, and utilities to reduce redundancy across features like TPI, CMDB, and Recon.

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

### Development Tools
- **tsx**: TypeScript execution for server.
- **esbuild**: Production bundling for server.
- **Vite**: Frontend development server.
- **Vitest**: Unit testing framework.