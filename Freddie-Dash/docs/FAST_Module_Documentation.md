# FAST Module - Feature Documentation

## Overview

The **Full Asset Status Tracker (FAST)** module is the primary component of the FAST Dashboard application. It provides comprehensive asset tracking for onboarding, maintenance, and attestation workflows within Freddie Mac's IT infrastructure.

---

## Core Features

### 1. Data Views

#### Table View
- Displays assets in a traditional tabular format with sortable columns
- Supports column-specific filtering with Excel-style multi-select dropdowns
- Sortable columns with ascending/descending toggle (click column header)
- Horizontal scrolling for wide datasets with frozen first column

#### Card View
- Displays assets as visual cards with key information summarized
- Configurable field visibility (up to 7 fields per card)
- Version selector dropdown when viewing historical versions
- Responsive grid layout (1-4 columns based on screen size)

### 2. Version History

The FAST module includes comprehensive asset-level versioning:

- **Automatic Snapshots**: Every edit creates a new version, preserving the previous version as a read-only historical record
- **Version Numbers**: Automatically increment on each save (v1, v2, v3, etc.)
- **FAST History Toggle**: Checkbox to show/hide version history
  - When OFF: Only shows the latest version of each asset
  - When ON: Shows all historical versions with Version column visible
- **Read-Only Historical Versions**: Users cannot edit past versions; only the latest version is editable
- **Date Range Filtering**: When FAST History is enabled, filter versions by date range with presets:
  - All Time
  - Today
  - Yesterday
  - Last 7 Days
  - Last 30 Days
  - This Month
  - Last Month
  - Custom Range (with calendar picker featuring month/year dropdowns)

### 3. Search and Filtering

#### Global Search
- Search across all fields or select a specific column from dropdown
- Real-time filtering as you type
- Case-insensitive matching

#### Column Filters
- Excel-style multi-select filters on each column header
- Filter indicator badge shows when filters are active
- "Select All" / "Deselect All" quick actions
- Search within filter options

### 4. Column Visibility (Table View)

- **Configurable Columns**: Toggle visibility for any of the 50 available columns
- **Column Count Badge**: Shows visible/total columns (e.g., "15/50")
- **Presets**:
  - Show All Columns
  - Admin Default (comprehensive view)
  - Viewer Default (essential columns)
  - Onboarding Focus
  - Compliance Focus
- **Persistence**: Settings saved to browser localStorage per module
- **Search**: Filter columns by name in the visibility panel

### 5. Card Field Visibility (Card View)

- **Configurable Fields**: Select which fields appear on asset cards
- **7-Field Maximum**: Limit ensures cards remain readable
- **Presets**: Same preset options as table view
- **Persistence**: Settings saved separately from table column visibility

### 6. Asset Duplication

- **Duplicate Button**: Creates a copy of any asset from the detail dialog
- **Numbered Suffixes**: Copies are named with incremental suffixes:
  - First copy: `AST-0001-COPY1`
  - Second copy: `AST-0001-COPY2`
  - And so on...
- **Fresh Version**: Duplicates start at version 1 with isLatestVersion = true
- **Audit Trail**: Duplicate records the current user and timestamp

### 7. Fake Asset Management

- **Mark as Fake Asset**: Permanently flag assets as fake/test data
  - **One-Way Action**: Once marked as fake, assets cannot be unmarked (permanent)
  - **Confirmation Required**: Warning dialog appears before marking, explaining the action is irreversible
  - **Button Hidden After Marking**: The "Mark Fake" button is hidden for assets already marked as fake
- **Sync to Fake Asset List**: When an asset is marked as fake in FAST:
  - Automatically creates a new record in the Fake Asset List module
  - Maps available FAST fields to Asset fields (ID, Name, CMDB Status, etc.)
  - User can edit the new Fake Asset List record to fill in additional Asset-specific fields
  - Since marking is permanent, records remain in Fake Asset List
- **Duplicated Assets**: When duplicating a fake asset, the copy inherits the fake status (also permanent)
- **Fake Asset List Module**:
  - Separate table with its own column structure (parent-child relationship with FAST)
  - Has "Add New" button for creating records directly
  - Admins can edit records to fill in additional details not available in FAST
  - **No versioning**: Fake Asset List does not have version history, Version column, or FAST History toggle

### 8. Export to Excel

- **One-Click Export**: Download current filtered data as Excel file
- **Timestamped Filenames**: Files named with format: `FAST_Export_YYYYMMDD_HHMMSS.xlsx`
- **Respects Filters**: Only exports currently filtered/visible data

### 9. Asset Creation and Editing

#### Adding New Assets
- "Add New" button (Admin only) opens creation dialog
- **Real-time Asset ID Validation**: 
  - Debounced validation (500ms delay)
  - Checks for duplicate IDs across all existing assets
  - Visual feedback: green checkmark for available, red X for taken
- Required fields enforced before save

#### Editing Existing Assets
- Click any row/card to open detail view
- "Edit" button switches to edit mode (Admin only)
- **Dropdown Components**: Enum fields use select dropdowns with predefined options
- **Date Fields**: Calendar picker with standardized format (MMM d, yyyy HH:mm)
- **Audit Fields**: Last Modified By/Date auto-populated and read-only

### 10. Role-Based Access Control

#### Admin Role
- Full CRUD capabilities (Create, Read, Update, Delete)
- Can add new assets
- Can edit existing assets
- Can duplicate assets
- Can mark assets as fake (permanent, one-way action)
- Access to all column visibility presets

#### Viewer Role
- Read-only access
- Cannot create, edit, or duplicate assets
- Can view all data and use filtering/search
- Can change views and column visibility
- Can export to Excel

### 11. Pagination

- Standard pagination with page size options
- **Smart Pagination for Version History**: In card view with FAST History enabled, pagination counts unique assets (not individual version records)
- Page navigation with first/previous/next/last controls
- Items per page selector

### 12. Empty State Handling

- When no records match current filters: Displays friendly "No Records Found" message
- Includes suggestion to adjust filters or search criteria
- Consistent styling across table and card views

---

## Data Fields (50 Columns)

The FAST module tracks extensive asset metadata including:

| Category | Fields |
|----------|--------|
| **Identity** | Asset ID, Name, Description, Version |
| **Ownership** | KALM Assignee, Business Owner, IT Owner, SME |
| **Status** | Onboarding Status, Onboarding Disposition, AIR Disposition, CMDB Status, Connector Status |
| **Technical** | Technology, Hosted, Is SAAS, COTS or In House Built, Multi-Factor Authentication |
| **Business** | Asset Tier, BTO Alignment, High-Level BTO, Division, Customer Facing, External Facing |
| **Compliance** | InfoSec Critical, Information Classification, Cash Payment Systems, Block Funding |
| **Audit** | Last Modified By, Last Modified Date, Maintenance Window |
| **Flags** | Is Fake Asset, Is Latest Version |

---

## Date Format Standards

All date fields use consistent formatting:
- **Display Format**: `MMM d, yyyy HH:mm` (e.g., "Dec 16, 2025 17:45")
- **Sorting**: Chronological order (newest first or oldest first)
- **Calendar Navigation**: Month/year dropdown selectors for quick navigation (2020-2030 range)

---

## Visual Design

- **Card Border Color**: Green (#89c24b) matching the Export button
- **Version Badges**: 
  - Green for latest version
  - Blue for selected historical version
  - Gray for unselected versions
- **Status Badges**: Color-coded by status type
- **Responsive Layout**: Adapts to screen size with mobile-first design
