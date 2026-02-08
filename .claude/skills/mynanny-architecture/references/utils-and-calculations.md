# Utils & Calculations Reference

## Table of Contents
- [Constants](#constants)
- [Date Utilities](#date-utilities)
- [Calculations](#calculations)
- [Formatting Functions](#formatting-functions)

---

## Constants

**File:** `src/constants.js`

```js
VIEW_MODES = { WEEKLY: 'weekly', BIWEEKLY: 'biweekly', MONTHLY: 'monthly', HISTORICAL: 'historical' }
FORM_TYPES = { HOURS: 'hours', MILEAGE: 'mileage', EXPENSES: 'expenses', NOTES: 'notes', PTO: 'pto' }
EXPENSE_CATEGORIES = ['Supplies', 'Food', 'Activities', 'Transportation', 'Medical', 'Other']
NOTE_CATEGORIES = ['General', 'Milestone', 'Health', 'Behavior', 'Activity', 'Other']
```

---

## Date Utilities

**File:** `src/utils/dateUtils.js` (~282 lines)

### Core functions

| Function | Signature | Returns | Notes |
|----------|-----------|---------|-------|
| `formatDateISO` | `(date) → string` | `"YYYY-MM-DD"` | For storage/API |
| `formatDateDisplay` | `(date) → string` | `"MM/DD/YYYY"` | For UI display |
| `getDayOfMonth` | `(date) → number` | Day number | |
| `parseDateString` | `(str) → Date` | Date object | Handles YYYY-MM-DD and MM/DD/YYYY, parses as local time (not UTC) |
| `parseDate` | `(str) → Date` | Date object | Flexible parser, alias/wrapper |
| `getToday` | `() → Date` | Today at midnight | |

### Week functions
| Function | Signature | Returns |
|----------|-----------|---------|
| `getWeekStart` | `(date) → Date` | Sunday of that week |
| `getWeekEnd` | `(date) → Date` | Saturday of that week |
| `getWeekRangeLabel` | `(start, end) → string` | `"Jan 5 - Jan 11, 2025"` |
| `getPreviousWeek` | `(date) → Date` | 7 days earlier |
| `getNextWeek` | `(date) → Date` | 7 days later |

### Biweekly functions
| Function | Signature | Returns | Notes |
|----------|-----------|---------|-------|
| `getBiweeklyStart` | `(date) → Date` | Start of 2-week period | Epoch: Jan 5, 2025 |
| `getBiweeklyEnd` | `(date) → Date` | End of 2-week period | |
| `getBiweeklyRangeLabel` | `(start, end) → string` | Formatted range | |
| `getPreviousBiweek` | `(date) → Date` | 14 days earlier | |
| `getNextBiweek` | `(date) → Date` | 14 days later | |

**Biweekly epoch:** Jan 5, 2025 is the fixed anchor date. All biweekly periods align to this date by calculating days since epoch and using modulo 14.

### Month functions
| Function | Signature | Returns |
|----------|-----------|---------|
| `getMonthStart` | `(date) → Date` | 1st of that month |
| `getMonthEnd` | `(date) → Date` | Last day of that month |
| `getMonthLabel` | `(date) → string` | `"January 2025"` |
| `getPreviousMonth` | `(date) → Date` | Same day, previous month |
| `getNextMonth` | `(date) → Date` | Same day, next month |

### Filtering
| Function | Signature | Returns |
|----------|-----------|---------|
| `isDateInRange` | `(date, start, end) → boolean` | Inclusive range check |

### Date parsing safety
All date parsing uses manual splitting (not `new Date(string)`) to avoid UTC midnight bugs. When parsing `"2025-01-15"`, the parts are extracted and passed to `new Date(year, month-1, day)` for local time.

---

## Calculations

**File:** `src/utils/calculations.js` (~219 lines)

### Default rates
```js
DEFAULT_RATES = { regularHourlyRate: 21, overtimeRate: 25, mileageRate: 0.67 }
```

### Hour calculations

| Function | Signature | Returns |
|----------|-----------|---------|
| `calculateTotalHours` | `(regular, overtime) → number` | Sum |
| `calculateHoursPay` | `(regular, overtime, regRate, otRate) → object` | `{ regularPay, overtimePay, totalPay }` |

### Summing functions

| Function | Signature | Returns |
|----------|-----------|---------|
| `sumHoursEntries` | `(entries) → object` | `{ totalRegularHours, totalOvertimeHours, totalHours }` |
| `sumMileageEntries` | `(entries) → number` | Total miles |
| `sumExpenseEntries` | `(entries) → number` | Total amount |
| `sumPTOHours` | `(entries) → number` | Total PTO hours |

### PTO balance
```js
calculatePTOBalance(allHours, allPTO, accrualHours)
→ { accrued, used, available }
```
- `accrued` = `Math.floor(totalHoursWorked / accrualHours)` — earns 1 PTO hour per N hours worked
- `used` = sum of all PTO entry hours
- `available` = accrued - used

### Period summary (main calculation function)
```js
calculatePeriodSummary(data, rates, withholdings)
→ {
    hours: { regularHours, overtimeHours, totalHours, regularPay, overtimePay, totalPay },
    mileage: { totalMiles, reimbursement },
    expenses: { total },
    pto: { totalHours, totalPay },
    withholdings: {
      grossTaxableIncome,   // hours.totalPay + pto.totalPay
      items: [{ name, percentage, amount }],
      totalWithholdings,
      totalReimbursements   // mileage.reimbursement + expenses.total
    },
    grandTotal              // grossTaxable - totalWithholdings + totalReimbursements
  }
```

**Key logic:**
- Withholdings apply ONLY to taxable income (hours + PTO pay)
- Reimbursements (mileage + expenses) are NOT taxed
- Grand total = grossTaxableIncome - totalWithholdings + totalReimbursements

---

## Formatting Functions

| Function | Signature | Returns | Notes |
|----------|-----------|---------|-------|
| `formatCurrency` | `(amount) → string` | `"$1,234.56"` | Uses `Intl.NumberFormat('en-US')` |
| `formatNumber` | `(num) → string` | `"1,234.56"` | 2 decimal places |
| `parseCurrency` | `(str) → number` | Numeric value | Handles `"$1,234.56"` → `1234.56` |
