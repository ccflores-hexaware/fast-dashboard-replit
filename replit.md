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
- **Standard CRUD Operations**: All modules support create, read, update, delete operations without versioning
- **Activity Tracking**: Unified activity log tracks field changes and comments for FAST assets with JSONB storage
- **Responsive Layout**: Mobile-first design with consistent navigation header

### Project Structure
```
/
  client/                 # React frontend (Vite)
    src/
      components/         # UI components
        ui/               # shadcn/ui primitives
        DashboardLayout.tsx
        DataTable.tsx     # Table view component
        DataCard.tsx      # Card view component
        FilterMenu.tsx    # Column filtering
        Pagination.tsx
      features/
        dashboard/
          DashboardContainer.tsx  # Shared dashboard logic (~1770 lines)
      pages/
        FASTPage.tsx      # FAST module entry point
        SubAssetsPage.tsx # Sub-assets module entry point
        TPIPage.tsx       # TPI module entry point
        BTOPage.tsx       # BTO module entry point
        CMDBPage.tsx      # CMDB module entry point
      lib/                # Utilities, context providers
        userContext.tsx   # User/admin context
        queryClient.ts    # TanStack Query setup
        mockData.ts       # Sample data generation
      hooks/              # Custom React hooks
      App.tsx             # App entry with routing
    index.html            # HTML entry point
  server/                 # Express backend
    index.ts              # Server entry point
    routes.ts             # API route registration
    storage.ts            # Data access layer interface
    vite.ts               # Vite dev server integration
  shared/                 # Shared types and schemas
    schema.ts             # Drizzle database schema and Zod types
  docs/                   # Documentation
    FAST_Module_Documentation.md
    Functionality_Documentation.md
    Libraries_and_Dependencies.md
    UI_UX_Standards.md
  script/                 # Build scripts
    build.ts              # Production build script
  attached_assets/        # Branding and reference images
  package.json            # Dependencies and scripts
  vite.config.ts          # Vite configuration
  tsconfig.json           # TypeScript configuration
  drizzle.config.ts       # Database ORM configuration
  replit.md               # Project documentation
```

### Module-Specific Features

| Module | Version Column | History Auditing |
|--------|----------------|------------------|
| FAST | No | Activity log (user edits) |
| Sub-assets | No | None |
| TPI | Yes | SCD Type 2 history (external system updates) |
| BTO | No | Derived data from TPI |
| CMDB | Yes | SCD Type 2 history (matching TPI pattern) |

### BTO Module (Derived Data)
- **Data Source**: BTO page data is derived by joining `tpi_assets` with `bto_mapping` table
- **Mapping Logic**: 
  - `tpi_assets.bto_alignment` = `bto_mapping.bto` AND
  - `tpi_assets.owning_internal_org` = `bto_mapping.division`
  - This combination maps to `bto_mapping.higher_level_bto`
- **Lookup Table**: `bto_mapping` stores static mapping with columns:
  - `higher_level_bto` (EBTO, EDO, EO&T)
  - `bto` (Business Technology Office name)
  - `division` (Division name)
- **UI Features**:
  - Expandable rows showing breakdown by BTO and Division
  - Aggregated totals by Higher Level BTO
  - Grand total of all matched assets
  - Export to Excel with hierarchical structure
- **API**: `GET /api/bto/summary` returns aggregated asset counts

### CMDB History Auditing
- **Table**: `cmdb_asset_history` stores full snapshots of CMDB records with start/end dates
- **Trigger**: PostgreSQL trigger `log_cmdb_asset_changes()` automatically captures INSERT/UPDATE operations
- **Pattern**: Slowly Changing Dimension Type 2 (SCD Type 2)
  - Current records have `end_date = 9999-12-31`
  - When updated, previous record's end_date is set to NOW(), new record starts with start_date = NOW()
- **UI**: 
  - Inline accordion in CMDB table rows with pagination (5 per page)
  - History sub-table dynamically matches visible columns from main table
  - Clickable rows open detail popup dialog
  - "Current" badge on first column for active records
  - **Detail Dialog History Tab**: Tabbed interface in asset detail dialog with Details and History tabs (available in both table and card views)
- **API**: `GET /api/cmdb/history/:cmdbAssetId` returns `{ history, total }`

### Sub-assets Feature
- **Table**: `sub_assets` stores extended asset details with 38+ columns
- **Parent Relationship**: `parentAssetId` foreign key links to FAST asset ID
- **ID Pattern**: Sub-assets use `{parentId}-SUB1`, `-SUB2` incrementing pattern
- **Nested Prevention**: Sub-assets are limited to one level deep. The GET /api/fast endpoint includes an `isSubAsset` computed flag via left join with sub_assets table. The "Create Sub-asset" button is hidden when viewing a sub-asset.
- **Creation Workflow**: 
  1. Admin clicks "Create Sub-asset" button in FAST asset detail dialog (only visible for parent assets)
  2. System generates new FAST asset with ID like `AST-0001-SUB1`
  3. System creates corresponding sub-asset record linking to parent
  4. User fills in sub-asset specific fields on Sub-assets page
- **Navigation**: Sub-assets tab between FAST and TPI in header
- **API Endpoints**:
  - `GET /api/sub-assets` - List all sub-assets
  - `POST /api/sub-assets` - Create new sub-asset
  - `PUT /api/sub-assets/:internalId` - Update sub-asset
  - `GET /api/fast/next-sub-id/:baseAssetId` - Get next sub-asset ID
  - `GET /api/sub-assets/counts` - Get sub-asset counts per parent

### TPI History Auditing
- **Table**: `tpi_asset_history` stores full snapshots of TPI records with start/end dates
- **Trigger**: PostgreSQL trigger `log_tpi_asset_changes()` automatically captures INSERT/UPDATE operations
- **Pattern**: Slowly Changing Dimension Type 2 (SCD Type 2)
  - Current records have `end_date = 9999-12-31`
  - When updated, previous record's end_date is set to NOW(), new record starts with start_date = NOW()
- **UI**: 
  - Inline accordion in TPI table rows with pagination (5 per page)
  - History sub-table dynamically matches visible columns from main table (excluding version)
  - Clickable rows open detail popup dialog
  - "Current" badge on first column for active records
  - **Detail Dialog History Tab**: Tabbed interface in asset detail dialog with Details and History tabs (available in both table and card views)
- **API**: `GET /api/tpi/history/:tpiAssetId` returns `{ history, total }`

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
