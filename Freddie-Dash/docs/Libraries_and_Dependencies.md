# Libraries and Dependencies

This document provides a comprehensive overview of all libraries and dependencies used in the FAST Dashboard application.

---

## Frontend Libraries

### Core Framework

| Library | Version | Purpose |
|---------|---------|---------|
| **React** | ^19.2.0 | Core UI library for building component-based user interfaces |
| **React DOM** | ^19.2.0 | React renderer for web browsers |
| **TypeScript** | 5.6.3 | Static type checking for JavaScript |

### Routing

| Library | Version | Purpose |
|---------|---------|---------|
| **Wouter** | ^3.3.5 | Lightweight client-side routing (~2KB) with hooks-based API |

### State Management

| Library | Version | Purpose |
|---------|---------|---------|
| **TanStack React Query** | ^5.60.5 | Server state management, caching, and synchronization |

### Form Handling

| Library | Version | Purpose |
|---------|---------|---------|
| **React Hook Form** | ^7.66.0 | Performant form handling with minimal re-renders |
| **@hookform/resolvers** | ^3.10.0 | Validation resolvers for React Hook Form |
| **Zod** | ^3.25.76 | TypeScript-first schema validation |
| **zod-validation-error** | ^3.4.0 | Human-readable error messages from Zod validation |

---

## UI Component Libraries

### Radix UI Primitives

Radix UI provides unstyled, accessible component primitives. The following components are used:

| Component | Version | Purpose |
|-----------|---------|---------|
| **@radix-ui/react-accordion** | ^1.2.12 | Collapsible content sections |
| **@radix-ui/react-alert-dialog** | ^1.1.15 | Modal dialogs for important actions |
| **@radix-ui/react-aspect-ratio** | ^1.1.8 | Maintain aspect ratios for media |
| **@radix-ui/react-avatar** | ^1.1.11 | User avatar display |
| **@radix-ui/react-checkbox** | ^1.3.3 | Checkbox input controls |
| **@radix-ui/react-collapsible** | ^1.1.12 | Expandable/collapsible sections |
| **@radix-ui/react-context-menu** | ^2.2.16 | Right-click context menus |
| **@radix-ui/react-dialog** | ^1.1.15 | Modal dialog windows |
| **@radix-ui/react-dropdown-menu** | ^2.1.16 | Dropdown menu components |
| **@radix-ui/react-hover-card** | ^1.1.15 | Hover-triggered info cards |
| **@radix-ui/react-label** | ^2.1.8 | Accessible form labels |
| **@radix-ui/react-menubar** | ^1.1.16 | Horizontal menu bar |
| **@radix-ui/react-navigation-menu** | ^1.2.14 | Site navigation menus |
| **@radix-ui/react-popover** | ^1.1.15 | Floating popover panels |
| **@radix-ui/react-progress** | ^1.1.8 | Progress bar indicators |
| **@radix-ui/react-radio-group** | ^1.3.8 | Radio button groups |
| **@radix-ui/react-scroll-area** | ^1.2.10 | Custom scrollable areas |
| **@radix-ui/react-select** | ^2.2.6 | Dropdown select inputs |
| **@radix-ui/react-separator** | ^1.1.8 | Visual dividers |
| **@radix-ui/react-slider** | ^1.3.6 | Range slider inputs |
| **@radix-ui/react-slot** | ^1.2.4 | Component composition utility |
| **@radix-ui/react-switch** | ^1.2.6 | Toggle switch controls |
| **@radix-ui/react-tabs** | ^1.1.13 | Tabbed interfaces |
| **@radix-ui/react-toast** | ^1.2.7 | Toast notifications |
| **@radix-ui/react-toggle** | ^1.1.10 | Toggle buttons |
| **@radix-ui/react-toggle-group** | ^1.1.11 | Groups of toggle buttons |
| **@radix-ui/react-tooltip** | ^1.2.8 | Hover tooltips |

### Additional UI Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **Lucide React** | ^0.545.0 | Icon library with 1000+ SVG icons |
| **cmdk** | ^1.1.1 | Command palette/search component |
| **Vaul** | ^1.1.2 | Drawer/sheet component for mobile |
| **Sonner** | ^2.0.7 | Toast notification system |
| **input-otp** | ^1.4.2 | One-time password input fields |
| **react-resizable-panels** | ^2.1.9 | Resizable panel layouts |
| **embla-carousel-react** | ^8.6.0 | Carousel/slider component |

---

## Styling

| Library | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS** | ^4.1.14 | Utility-first CSS framework |
| **tailwind-merge** | ^3.3.1 | Merge Tailwind classes without conflicts |
| **tailwindcss-animate** | ^1.0.7 | Animation utilities for Tailwind |
| **tw-animate-css** | ^1.4.0 | Additional CSS animations |
| **class-variance-authority** | ^0.7.1 | Component variant management |
| **clsx** | ^2.1.1 | Conditional className utility |
| **Autoprefixer** | ^10.4.21 | CSS vendor prefixing |
| **PostCSS** | ^8.5.6 | CSS transformation pipeline |

---

## Date & Time

| Library | Version | Purpose |
|---------|---------|---------|
| **date-fns** | ^3.6.0 | Modern JavaScript date utility library |
| **react-day-picker** | ^9.11.1 | Calendar/date picker component |

---

## Data Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| **Recharts** | ^2.15.4 | Composable charting library built on D3 |

---

## Animation

| Library | Version | Purpose |
|---------|---------|---------|
| **Framer Motion** | ^12.23.24 | Production-ready animation library |

---

## Theming

| Library | Version | Purpose |
|---------|---------|---------|
| **next-themes** | ^0.4.6 | Theme management (dark/light mode) |

---

## Data Export

| Library | Version | Purpose |
|---------|---------|---------|
| **xlsx** | ^0.18.5 | Excel file generation and parsing |

---

## Backend Libraries

### Server Framework

| Library | Version | Purpose |
|---------|---------|---------|
| **Express** | ^4.21.2 | Fast, minimalist web framework for Node.js |
| **express-session** | ^1.18.1 | Session middleware for Express |

### Database

| Library | Version | Purpose |
|---------|---------|---------|
| **Drizzle ORM** | ^0.39.3 | TypeScript-first ORM with SQL-like syntax |
| **drizzle-zod** | ^0.7.0 | Zod schema generation from Drizzle schemas |
| **pg** | ^8.16.3 | PostgreSQL client for Node.js |
| **connect-pg-simple** | ^10.0.0 | PostgreSQL session store for Express |

### Authentication

| Library | Version | Purpose |
|---------|---------|---------|
| **Passport** | ^0.7.0 | Authentication middleware for Node.js |
| **passport-local** | ^1.0.0 | Local username/password authentication strategy |

### Session Storage

| Library | Version | Purpose |
|---------|---------|---------|
| **memorystore** | ^1.6.7 | In-memory session store with expiration |

### WebSocket

| Library | Version | Purpose |
|---------|---------|---------|
| **ws** | ^8.18.0 | WebSocket client and server implementation |
| **bufferutil** | ^4.0.8 | WebSocket buffer utilities (optional) |

---

## Development Tools

### Build Tools

| Library | Version | Purpose |
|---------|---------|---------|
| **Vite** | ^7.1.9 | Next-generation frontend build tool |
| **@vitejs/plugin-react** | ^5.0.4 | React plugin for Vite |
| **esbuild** | ^0.25.0 | Extremely fast JavaScript bundler |
| **tsx** | ^4.20.5 | TypeScript execution for Node.js |

### Database Tools

| Library | Version | Purpose |
|---------|---------|---------|
| **drizzle-kit** | ^0.31.4 | CLI tools for Drizzle ORM migrations |

### Replit-Specific Plugins

| Library | Version | Purpose |
|---------|---------|---------|
| **@replit/vite-plugin-cartographer** | ^0.4.4 | Replit development integration |
| **@replit/vite-plugin-dev-banner** | ^0.1.1 | Development environment banner |
| **@replit/vite-plugin-runtime-error-modal** | ^0.0.4 | Runtime error display modal |

### CSS Processing

| Library | Version | Purpose |
|---------|---------|---------|
| **@tailwindcss/vite** | ^4.1.14 | Tailwind CSS integration for Vite |

### Source Mapping

| Library | Version | Purpose |
|---------|---------|---------|
| **@jridgewell/trace-mapping** | ^0.3.25 | Source map parsing and manipulation |

---

## Type Definitions

| Library | Purpose |
|---------|---------|
| **@types/connect-pg-simple** | TypeScript types for connect-pg-simple |
| **@types/express** | TypeScript types for Express |
| **@types/express-session** | TypeScript types for express-session |
| **@types/node** | TypeScript types for Node.js |
| **@types/passport** | TypeScript types for Passport |
| **@types/passport-local** | TypeScript types for passport-local |
| **@types/react** | TypeScript types for React |
| **@types/react-dom** | TypeScript types for React DOM |
| **@types/ws** | TypeScript types for ws |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  React  │──│ React Query  │──│  Radix UI + Tailwind  │   │
│  └─────────┘  └──────────────┘  └───────────────────────┘   │
│       │              │                      │                │
│       └──────────────┼──────────────────────┘                │
│                      │                                       │
│              ┌───────▼───────┐                               │
│              │    Wouter     │  (Client-side Routing)        │
│              └───────────────┘                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                        Backend                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Express   │──│   Passport   │──│  express-session   │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
│         │                                                    │
│  ┌──────▼──────┐                                             │
│  │ Drizzle ORM │                                             │
│  └──────┬──────┘                                             │
└─────────┼───────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Package Counts

| Category | Count |
|----------|-------|
| Production Dependencies | 44 |
| Development Dependencies | 18 |
| Optional Dependencies | 1 |
| **Total** | **63** |
