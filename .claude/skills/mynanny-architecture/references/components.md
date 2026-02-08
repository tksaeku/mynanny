# Components Reference

## Table of Contents
- [PasswordGate](#passwordgate)
- [TabNavigation](#tabnavigation)
- [ViewToggle](#viewtoggle)
- [FormDialog](#formdialog)
- [EntryForm](#entryform)
- [BulkEntryForm](#bulkentryform)
- [DataTable](#datatable)

---

## PasswordGate

**File:** `src/components/PasswordGate/PasswordGate.jsx`

Simple password protection component. Blocks app until correct password entered.

**Props:**
- `onAuthenticated` — callback when auth succeeds

**Behavior:**
- Checks localStorage on mount via `isAuthenticated()`
- Compares input to `VITE_PASSWORD` env var
- Stores auth state in localStorage under key from `VITE_STORAGE_KEY`
- Exports utilities: `isAuthenticated()`, `setAuthenticated()`, `clearAuthentication()`

---

## TabNavigation

**File:** `src/components/TabNavigation/TabNavigation.jsx`

Responsive navigation with 6 tabs: Home, Hours, Mileage, Expenses, Notes, PTO.

**Props:**
- `activeTab` — current tab index (number)
- `onTabChange` — callback `(event, newValue) => void`

**Behavior:**
- Desktop (≥600px): MUI Tabs component
- Mobile (<600px): Hamburger icon → MUI Drawer with list items
- Each tab has an icon from `@mui/icons-material`
- Tab labels: `['Home', 'Hours', 'Mileage', 'Expenses', 'Notes', 'PTO']`

---

## ViewToggle

**File:** `src/components/ViewToggle/ViewToggle.jsx`

Period selector with navigation arrows for Summary and PayStub pages.

**Props:**
- `viewMode` — one of `VIEW_MODES.WEEKLY | BIWEEKLY | MONTHLY | HISTORICAL`
- `onViewModeChange` — callback `(mode) => void`
- `dateRange` — `{ start: Date, end: Date }`
- `onPrevious` — callback for left arrow
- `onNext` — callback for right arrow
- `rangeLabel` — string to display (e.g., "Jan 5 - Jan 18, 2025")

**Behavior:**
- Renders 4 toggle buttons for view modes
- Previous/next arrows hidden in HISTORICAL (All Time) mode
- Displays rangeLabel between arrows

---

## FormDialog

**File:** `src/components/FormDialog/FormDialog.jsx`

Generic modal dialog wrapper for add/edit forms.

**Props:**
- `open` — boolean
- `onClose` — callback
- `onSubmit` — callback
- `title` — dialog title string
- `isLoading` — boolean, shows "Saving..." on submit button
- `children` — form content (ReactNode)

---

## EntryForm

**File:** `src/components/EntryForm/EntryForm.jsx` (~280 lines)

Dynamic form that renders different fields based on entry type.

**Props:**
- `formType` — one of `FORM_TYPES.HOURS | MILEAGE | EXPENSES | NOTES | PTO`
- `initialData` — object for edit mode (pre-fills form), null for add mode
- `onSubmit` — callback `(formData) => void`
- `onCancel` — callback

**Fields by formType:**

| Type | Fields |
|------|--------|
| HOURS | date, regularHours, overtimeHours |
| MILEAGE | date, miles, purpose (text) |
| EXPENSES | date, amount, category (select from EXPENSE_CATEGORIES), description |
| NOTES | date, category (select from NOTE_CATEGORIES), note (multiline) |
| PTO | date, hours, note (text) |

**Behavior:**
- All dates default to today for new entries
- Hours form auto-calculates `totalHours = regular + overtime` and `dayOfMonth` from date
- Returns parsed numeric values (parseFloat for numbers)
- Uses HTML5 required validation

---

## BulkEntryForm

**File:** `src/components/BulkEntryForm/BulkEntryForm.jsx` (~473 lines)

Multi-row form for adding several entries at once, potentially of mixed types.

**Props:**
- `open` — boolean
- `onClose` — callback
- `onSubmit` — callback `(entries[]) => Promise` (array of `{ type, data }`)
- `isLoading` — boolean

**Behavior:**
- "Same date for all" toggle with shared date picker
- Add/remove rows dynamically
- Each row has a type selector + type-specific fields rendered inline
- Validates all rows before submission
- On partial failure: only removes successful rows, keeps failed rows with error messages displayed
- Shows success/failure counts in notification
- Closes automatically on full success

---

## DataTable

**File:** `src/components/DataTable/DataTable.jsx` (~167 lines)

Generic sortable table with edit/delete actions.

**Props:**
- `columns` — array of column configs:
  ```js
  { id, label, type ('date'|'number'|'string'), sortable, width, align, render }
  ```
- `data` — array of row objects
- `onEdit` — callback `(row) => void`
- `onDelete` — callback `(row) => void`
- `defaultSort` — `{ column: string, direction: 'asc'|'desc' }`
- `deletingId` — id of row currently being deleted (shows spinner)

**Behavior:**
- Click column header to sort (toggles asc/desc)
- Date-aware and number-aware sorting
- Custom cell rendering via `render` function in column config
- Edit button (pencil icon) and Delete button (trash icon) per row
- Delete button shows CircularProgress spinner when `deletingId` matches
- Empty state: "No entries found" message
