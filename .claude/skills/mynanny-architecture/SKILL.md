---
name: mynanny-architecture
description: >
  Comprehensive architecture reference for the mynanny nanny-tracking application.
  MUST be consulted before making any code changes, adding features, fixing bugs,
  refactoring, writing tests, or researching the codebase. Provides the complete
  application structure, data flow, component hierarchy, service layer design,
  Google Sheets backend integration, styling system, and coding conventions.
  Use this skill whenever working in the mynanny project for any reason.
---

# Mynanny Architecture Guide

## Table of Contents
- [Application Overview](#application-overview)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Data Flow](#data-flow)
- [Key Design Patterns](#key-design-patterns)
- [Reference Files](#reference-files)

## Application Overview

Password-protected React SPA for tracking nanny hours, mileage, expenses, notes, and PTO. Calculates pay with overtime, mileage reimbursement, withholdings, and PTO accrual. Uses Google Sheets as the database — reads via Sheets API v4, writes via Apps Script web app.

**Entry point:** `src/main.jsx` → MUI ThemeProvider → `src/App.jsx` (auth gate + tab router + state manager)

## Tech Stack

- **UI:** React 18 + Vite 5 + Material UI 5 + SASS (BEM naming)
- **Database:** Google Sheets API v4 (read) + Google Apps Script (write)
- **Testing:** Vitest + React Testing Library
- **Deploy:** `npm run deploy` → rsync to Dreamhost

## Directory Structure

```
src/
├── App.jsx                    # Central state, auth, tab routing, CRUD handlers
├── main.jsx                   # MUI theme, React root
├── constants.js               # VIEW_MODES, FORM_TYPES, category lists
├── components/                # Reusable UI (each has folder: JSX + SCSS + index.js)
│   ├── PasswordGate/          # Auth gate, localStorage persistence
│   ├── TabNavigation/         # Desktop tabs / mobile hamburger drawer
│   ├── ViewToggle/            # Weekly/Biweekly/Monthly/All-Time period selector
│   ├── FormDialog/            # Generic modal dialog wrapper
│   ├── EntryForm/             # Dynamic form for all 5 entry types
│   ├── BulkEntryForm/         # Multi-row mixed-type bulk entry form
│   └── DataTable/             # Sortable table with edit/delete actions
├── pages/                     # Tab views (each has folder: JSX + SCSS + test)
│   ├── HomePage/              # Container for Summary + PayStub subtabs
│   ├── SummaryPage/           # Dashboard with period summary + combined table
│   ├── PayStubPage/           # Formatted pay stub with withholdings
│   ├── HoursPage/             # CRUD for hours entries
│   ├── MileagePage/           # CRUD for mileage entries
│   ├── ExpensesPage/          # CRUD for expense entries
│   ├── NotesPage/             # CRUD for notes entries
│   └── PTOPage/               # CRUD for PTO entries
├── services/
│   └── googleSheets.js        # All Google Sheets I/O (read + write)
├── utils/
│   ├── calculations.js        # Pay math, summaries, formatting
│   └── dateUtils.js           # Date parsing, ranges, periods
├── styles/
│   ├── _variables.scss        # Colors, spacing, breakpoints, shadows
│   └── _mixins.scss           # Media queries, flexbox, typography, card
└── test/
    └── setup.js               # Vitest setup (jest-dom)
```

## Data Flow

```
User → PasswordGate (localStorage) → App.jsx
  ↓ on auth
  fetchAllData() → Promise.all([7 sheets]) → Google Sheets API v4
  ↓ parsed into typed objects
  App state: { hours, mileage, expenses, notes, pto, config, withholdings }
  ↓ passed as props
  Pages → Components (DataTable, EntryForm, etc.)

Write operations:
  User form submit → Page handler → googleSheets.addXxxEntry()
    → POST to Apps Script URL (action: add/update/delete)
    → Apps Script modifies Google Sheet row
    → App refetches all data
```

**Row ID system:** Each entry's `id` = its 1-indexed row number in the sheet (header = row 1, first data = row 2). Used for update/delete targeting.

## Key Design Patterns

1. **State lives in App.jsx** — all data, loading, error, notification state. Pages receive data + handlers as props.
2. **Generic components** — DataTable, EntryForm, FormDialog are reusable across all entry types via configuration (column defs, formType prop).
3. **Dual API architecture** — Sheets API (public, read-only, API key) for reads; Apps Script web app (POST, no auth) for writes. Content-Type is `text/plain` to avoid CORS preflight.
4. **Date handling** — Manual parsing to avoid UTC midnight bugs. Storage: `YYYY-MM-DD`. Display: `MM/DD/YYYY`. Always local time.
5. **Period calculations** — Biweekly uses epoch of Jan 5, 2025 to align 2-week windows. PTO accrual = floor(totalHours / accrualHours).
6. **Withholdings** — Applied only to taxable income (hours + PTO pay), not reimbursements (mileage + expenses). Grand total = gross - withholdings + reimbursements.
7. **Co-located files** — Each component/page in its own folder with JSX, SCSS, test, and index.js barrel export.

## Reference Files

Consult these for detailed information when needed:

- **[references/components.md](references/components.md)** — Complete component API: props, state, rendering logic for all 7 components
- **[references/services-and-backend.md](references/services-and-backend.md)** — Google Sheets service layer, Apps Script backend, sheet schemas, environment variables
- **[references/utils-and-calculations.md](references/utils-and-calculations.md)** — All date utilities, pay calculations, formatting functions, constants
- **[references/pages.md](references/pages.md)** — Page component details, CRUD patterns, column definitions
- **[references/styling.md](references/styling.md)** — SCSS variables, mixins, Vite SCSS config, theming
