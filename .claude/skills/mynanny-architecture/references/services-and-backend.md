# Services & Backend Reference

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Environment Variables](#environment-variables)
- [Google Sheets API (Read)](#google-sheets-api-read)
- [Apps Script Backend (Write)](#apps-script-backend-write)
- [Sheet Schemas](#sheet-schemas)
- [Row ID System](#row-id-system)
- [CORS Strategy](#cors-strategy)

---

## Architecture Overview

This is a **client-only** application with a split data access pattern:

```
┌─────────────────────────────────────────────────┐
│  React SPA (client)                             │
│  src/services/googleSheets.js                   │
│                                                 │
│  READ:  GET → Google Sheets API v4 (API key)    │
│  WRITE: POST → Apps Script Web App (no auth)    │
└─────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐   ┌──────────────────────────┐
│ Sheets API v4   │   │ google-apps-script.js     │
│ (Google Cloud)  │   │ (deployed as Web App)     │
│ Read-only       │   │ Execute as: Me            │
│ API key auth    │   │ Access: Anyone            │
└─────────────────┘   └──────────────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────────────────────────────────────┐
│              Google Spreadsheet                   │
│  Tabs: Hours | Mileage | Expenses | Notes | PTO  │
│        Config | Withholdings                      │
└──────────────────────────────────────────────────┘
```

---

## Environment Variables

```
VITE_GOOGLE_API_KEY     # Google Cloud API key (Sheets API enabled)
VITE_GOOGLE_SHEET_ID    # Google Sheet document ID (from URL)
VITE_APPS_SCRIPT_URL    # Deployed Apps Script web app URL
VITE_PASSWORD           # App password for PasswordGate
VITE_STORAGE_KEY        # localStorage key for auth (default: "mynanny_auth")
```

---

## Google Sheets API (Read)

**File:** `src/services/googleSheets.js`

### Base URL
```
https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{sheetName}?key={API_KEY}
```

### Fetch function
`fetchSheetData(sheetName)` — returns `Array<Array<string>>` (rows of cells).

### Parsers (all skip header row, assign `id = index + 2` for row number)

| Function | Returns |
|----------|---------|
| `parseHoursEntries(rows)` | `[{ id, date, dayOfMonth, regularHours, overtimeHours, totalHours }]` |
| `parseMileageEntries(rows)` | `[{ id, date, miles, purpose }]` |
| `parseExpenseEntries(rows)` | `[{ id, date, amount, category, description }]` |
| `parseNotesEntries(rows)` | `[{ id, date, category, note }]` |
| `parsePTOEntries(rows)` | `[{ id, date, hours, note }]` |
| `parseConfig(rows)` | `{ regularHourlyRate, overtimeRate, mileageRate, ptoAccrualHours }` |
| `parseWithholdings(rows)` | `[{ name, percentage }]` (filters out percentage ≤ 0) |

### Exported fetch functions
```js
fetchHours()        → parseHoursEntries(await fetchSheetData('Hours'))
fetchMileage()      → parseMileageEntries(await fetchSheetData('Mileage'))
fetchExpenses()     → parseExpenseEntries(await fetchSheetData('Expenses'))
fetchNotes()        → parseNotesEntries(await fetchSheetData('Notes'))
fetchPTO()          → parsePTOEntries(await fetchSheetData('PTO'))
fetchConfig()       → parseConfig(await fetchSheetData('Config'))
fetchWithholdings() → parseWithholdings(await fetchSheetData('Withholdings'))
                      // Silently returns [] on error
fetchAllData()      → Promise.all([all 7]) → { hours, mileage, expenses, notes, pto, config, withholdings }
```

---

## Apps Script Backend (Write)

**File:** `google-apps-script.js` (deployed in Google Apps Script editor)

### Deployment Setup
1. Open Google Sheet → Extensions → Apps Script
2. Paste `google-apps-script.js` contents
3. Deploy as Web App: Execute as "Me", Access "Anyone"
4. Copy URL → `VITE_APPS_SCRIPT_URL`

### POST Request Format
```json
{
  "action": "add" | "update" | "delete",
  "sheet": "Hours" | "Mileage" | "Expenses" | "Notes" | "PTO",
  "data": { ... },      // for add/update
  "row": 2              // for update/delete (row number)
}
```

### Response Format
```json
{ "success": true, "row": 5 }   // add/update
{ "success": true }               // delete
{ "success": false, "error": "message" }  // error
```

### Operations

**`addRow(sheetName, data)`** — `sheet.appendRow(rowData)`, returns new row number.

**`updateRow(sheetName, rowNumber, data)`** — `sheet.getRange(row, 1, 1, cols).setValues([rowData])`. Rejects row < 2.

**`deleteRow(sheetName, rowNumber)`** — `sheet.deleteRow(rowNumber)`. Rejects row < 2.

### Row data mapping per sheet

| Sheet | Columns |
|-------|---------|
| Hours | `[date, dayOfMonth, regularHours, overtimeHours\|0, totalHours]` |
| Mileage | `[date, miles, purpose\|'']` |
| Expenses | `[date, amount, category, description\|'']` |
| Notes | `[date, category, note]` |
| PTO | `[date, hours, note\|'']` |

### Client-side write wrappers (googleSheets.js)
```js
// Add
addHoursEntry(entry)    addMileageEntry(entry)    addExpenseEntry(entry)
addNotesEntry(entry)    addPTOEntry(entry)

// Update (rowNumber, entry)
updateHoursEntry()      updateMileageEntry()      updateExpenseEntry()
updateNotesEntry()      updatePTOEntry()

// Delete (rowNumber)
deleteHoursEntry()      deleteMileageEntry()      deleteExpenseEntry()
deleteNotesEntry()      deletePTOEntry()
```

### `initializeSpreadsheet()` function
Run once in Apps Script editor to create all tabs with headers and default config values. Creates: Hours, Mileage, Expenses, Notes, PTO, Config (with default rates), Withholdings (with WA state defaults: SS 6.2%, Medicare 1.45%, WA PFML 0.81%, WA Cares 0.58%).

---

## Sheet Schemas

### Hours
| Column | Type | Notes |
|--------|------|-------|
| Date | string | "YYYY-MM-DD" |
| Day of Month | number | Extracted from date |
| Regular Hours | number | |
| Overtime | number | Defaults to 0 |
| Total Hours | number | regular + overtime |

### Mileage
| Column | Type | Notes |
|--------|------|-------|
| Date | string | "YYYY-MM-DD" |
| Miles | number | |
| Purpose | string | Optional |

### Expenses
| Column | Type | Notes |
|--------|------|-------|
| Date | string | "YYYY-MM-DD" |
| Amount | number | Dollar amount |
| Category | string | From EXPENSE_CATEGORIES constant |
| Description | string | Optional |

### Notes
| Column | Type | Notes |
|--------|------|-------|
| Date | string | "YYYY-MM-DD" |
| Category | string | From NOTE_CATEGORIES constant |
| Note | string | Free text |

### PTO
| Column | Type | Notes |
|--------|------|-------|
| Date | string | "YYYY-MM-DD" |
| Hours | number | |
| Note | string | Optional |

### Config
| Setting | Default Value |
|---------|--------------|
| Regular Hourly Rate | 21 |
| Overtime Rate | 25 |
| Mileage Rate | 0.67 |
| PTO Accrual Hours | 40 |

### Withholdings
| Name | Default Percentage |
|------|-------------------|
| Social Security | 6.20 |
| Medicare | 1.45 |
| WA Paid Leave (PFML) | 0.81 |
| WA Cares Fund | 0.58 |
| WA Unemployment | 0.00 |

---

## Row ID System

Entries are identified by their **1-indexed row number** in the Google Sheet:
- Row 1 = header (never modified/deleted)
- Row 2 = first data entry (`id: 2`)
- Row N = Nth entry

**Critical:** When a row is deleted, all rows below shift up by 1. The app handles this by refetching all data after any write operation, so IDs are always recalculated from current sheet state.

---

## CORS Strategy

Apps Script web apps don't support CORS headers directly. The workaround:
- POST requests use `Content-Type: text/plain;charset=utf-8` (not `application/json`)
- This avoids triggering a CORS preflight OPTIONS request
- The request body is still JSON, just sent as plain text
- Apps Script parses it via `e.postData.contents`
