# Pages Reference

## Table of Contents
- [HomePage](#homepage)
- [SummaryPage](#summarypage)
- [PayStubPage](#paystubpage)
- [CRUD Pages Pattern](#crud-pages-pattern)
- [HoursPage](#hourspage)
- [MileagePage](#mileagepage)
- [ExpensesPage](#expensespage)
- [NotesPage](#notespage)
- [PTOPage](#ptopage)

---

## HomePage

**File:** `src/pages/HomePage/HomePage.jsx`

Container component with two subtabs: **Summary** and **PayStub**.

**Props:** Receives all data and handlers from App.jsx, passes them through to child pages.

**Behavior:** Internal tab state switches between SummaryPage and PayStubPage.

---

## SummaryPage

**File:** `src/pages/SummaryPage/SummaryPage.jsx` (~360 lines)

Main dashboard showing period-filtered summary with totals.

**Props:**
- `hours`, `mileage`, `expenses`, `notes`, `pto` — entry arrays
- `config` — rates object
- `withholdings` — withholdings array
- `onAddEntry`, `onEditEntry`, `onDeleteEntry` — CRUD handlers
- `onRefresh` — refetch all data

**State:**
- `viewMode` — WEEKLY / BIWEEKLY / MONTHLY / HISTORICAL
- `currentDate` — anchor date for period calculation
- `bulkFormOpen` — toggle for BulkEntryForm dialog

**Rendered sections:**
1. ViewToggle (period selector + nav arrows)
2. Summary cards (4): Hours, Mileage, Expenses, PTO — each showing totals and dollar amounts
3. Grand Total display
4. Combined entries table — all entry types merged, sorted by date
5. FAB button → opens BulkEntryForm

**Filtering:** Uses `isDateInRange()` to filter all entries to the selected period. In HISTORICAL mode, shows all entries unfiltered.

---

## PayStubPage

**File:** `src/pages/PayStubPage/PayStubPage.jsx`

Formatted pay stub view with withholdings breakdown.

**Props:** Same as SummaryPage (data arrays, config, withholdings).

**Sections:**
1. ViewToggle for period selection
2. **Gross Taxable Income** — hours pay + PTO pay
3. **Withholdings** — itemized list with name, percentage, calculated amount
4. **Reimbursements** — mileage reimbursement + expense total
5. **Net Pay** — grand total after withholdings + reimbursements

---

## CRUD Pages Pattern

All 5 entry pages (Hours, Mileage, Expenses, Notes, PTO) follow the same pattern:

```
Page component
├── State: formOpen, editingEntry, deletingId
├── DataTable (displays entries, handles sort)
├── FormDialog + EntryForm (add/edit modal)
├── Delete confirmation dialog
└── FAB button (opens add form)
```

**Common props from App.jsx:**
- `entries` — array of entry objects
- `onAdd(data)` — add handler
- `onUpdate(id, data)` — update handler
- `onDelete(id)` — delete handler

**CRUD flow:**
1. **Add:** FAB click → FormDialog opens → EntryForm renders → submit → `onAdd(data)` → close + refetch
2. **Edit:** Edit icon click → `editingEntry` set → FormDialog opens with `initialData` → submit → `onUpdate(id, data)` → close + refetch
3. **Delete:** Delete icon click → confirm dialog → `onDelete(id)` → `deletingId` shows spinner → refetch

**Default sort:** All pages sort by date descending (newest first).

---

## HoursPage

**File:** `src/pages/HoursPage/HoursPage.jsx` (~140 lines)

**Columns:**
| Column ID | Label | Type | Sortable |
|-----------|-------|------|----------|
| date | Date | date | yes |
| regularHours | Regular | number | yes |
| overtimeHours | Overtime | number | yes |
| totalHours | Total | number | yes |

**Form:** Uses `FORM_TYPES.HOURS` — fields: date, regularHours, overtimeHours. Auto-calculates totalHours and dayOfMonth on submit.

---

## MileagePage

**File:** `src/pages/MileagePage/MileagePage.jsx` (~110 lines)

**Columns:**
| Column ID | Label | Type | Sortable |
|-----------|-------|------|----------|
| date | Date | date | yes |
| miles | Miles | number | yes |
| purpose | Purpose | string | no |

**Form:** Uses `FORM_TYPES.MILEAGE` — fields: date, miles, purpose.

---

## ExpensesPage

**File:** `src/pages/ExpensesPage/ExpensesPage.jsx` (~120 lines)

**Columns:**
| Column ID | Label | Type | Sortable |
|-----------|-------|------|----------|
| date | Date | date | yes |
| amount | Amount | number | yes |
| category | Category | string | yes |
| description | Description | string | no |

**Amount rendering:** Uses `formatCurrency()` for display.

**Form:** Uses `FORM_TYPES.EXPENSES` — fields: date, amount, category (select), description.

---

## NotesPage

**File:** `src/pages/NotesPage/NotesPage.jsx` (~110 lines)

**Columns:**
| Column ID | Label | Type | Sortable |
|-----------|-------|------|----------|
| date | Date | date | yes |
| category | Category | string | yes |
| note | Note | string | no |

**Form:** Uses `FORM_TYPES.NOTES` — fields: date, category (select), note (multiline).

---

## PTOPage

**File:** `src/pages/PTOPage/PTOPage.jsx` (~130 lines)

**Columns:**
| Column ID | Label | Type | Sortable |
|-----------|-------|------|----------|
| date | Date | date | yes |
| hours | Hours | number | yes |
| note | Note | string | no |

**Extra display:** Shows PTO balance summary (accrued / used / available) above the table.

**Form:** Uses `FORM_TYPES.PTO` — fields: date, hours, note.
