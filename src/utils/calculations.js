/**
 * Calculation utilities for nanny pay tracking
 */

// Default rates (can be overridden by config)
export const DEFAULT_RATES = {
  regularHourlyRate: 21,
  overtimeRate: 25,
  mileageRate: 0.67
};

/**
 * Calculate total hours from regular and overtime
 * @param {number} regularHours
 * @param {number} overtimeHours
 * @returns {number}
 */
export const calculateTotalHours = (regularHours, overtimeHours) => {
  return (regularHours || 0) + (overtimeHours || 0);
};

/**
 * Calculate pay for hours worked
 * @param {number} regularHours
 * @param {number} overtimeHours
 * @param {number} regularRate
 * @param {number} overtimeRate
 * @returns {{ regularPay: number, overtimePay: number, totalPay: number }}
 */
export const calculateHoursPay = (
  regularHours,
  overtimeHours,
  regularRate = DEFAULT_RATES.regularHourlyRate,
  overtimeRate = DEFAULT_RATES.overtimeRate
) => {
  const regularPay = (regularHours || 0) * regularRate;
  const overtimePay = (overtimeHours || 0) * overtimeRate;
  return {
    regularPay,
    overtimePay,
    totalPay: regularPay + overtimePay
  };
};

/**
 * Calculate mileage reimbursement
 * @param {number} miles
 * @param {number} mileageRate
 * @returns {number}
 */
export const calculateMileageReimbursement = (miles, mileageRate = DEFAULT_RATES.mileageRate) => {
  return (miles || 0) * mileageRate;
};

/**
 * Sum all hours entries
 * @param {Array<{ regularHours: number, overtimeHours: number }>} entries
 * @returns {{ totalRegularHours: number, totalOvertimeHours: number, totalHours: number }}
 */
export const sumHoursEntries = (entries) => {
  const totalRegularHours = entries.reduce((sum, entry) => sum + (entry.regularHours || 0), 0);
  const totalOvertimeHours = entries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0);
  return {
    totalRegularHours,
    totalOvertimeHours,
    totalHours: totalRegularHours + totalOvertimeHours
  };
};

/**
 * Sum all mileage entries
 * @param {Array<{ miles: number }>} entries
 * @returns {number}
 */
export const sumMileageEntries = (entries) => {
  return entries.reduce((sum, entry) => sum + (entry.miles || 0), 0);
};

/**
 * Sum all expense entries
 * @param {Array<{ amount: number }>} entries
 * @returns {number}
 */
export const sumExpenseEntries = (entries) => {
  return entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
};

/**
 * Calculate complete summary for a period
 * @param {object} data
 * @param {Array} data.hoursEntries
 * @param {Array} data.mileageEntries
 * @param {Array} data.expenseEntries
 * @param {object} rates
 * @returns {object}
 */
export const calculatePeriodSummary = (data, rates = DEFAULT_RATES) => {
  const { hoursEntries = [], mileageEntries = [], expenseEntries = [] } = data;

  // Hours
  const hoursSummary = sumHoursEntries(hoursEntries);
  const hoursPay = calculateHoursPay(
    hoursSummary.totalRegularHours,
    hoursSummary.totalOvertimeHours,
    rates.regularHourlyRate,
    rates.overtimeRate
  );

  // Mileage
  const totalMiles = sumMileageEntries(mileageEntries);
  const mileageReimbursement = calculateMileageReimbursement(totalMiles, rates.mileageRate);

  // Expenses
  const totalExpenses = sumExpenseEntries(expenseEntries);

  // Grand total
  const grandTotal = hoursPay.totalPay + mileageReimbursement + totalExpenses;

  return {
    hours: {
      regular: hoursSummary.totalRegularHours,
      overtime: hoursSummary.totalOvertimeHours,
      total: hoursSummary.totalHours,
      regularPay: hoursPay.regularPay,
      overtimePay: hoursPay.overtimePay,
      totalPay: hoursPay.totalPay
    },
    mileage: {
      totalMiles,
      reimbursement: mileageReimbursement
    },
    expenses: {
      total: totalExpenses
    },
    grandTotal
  };
};

/**
 * Format a number as currency
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Format a number with 2 decimal places
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  return Number(num).toFixed(2);
};

/**
 * Parse a currency string to a number
 * @param {string} currencyStr
 * @returns {number}
 */
export const parseCurrency = (currencyStr) => {
  if (typeof currencyStr === 'number') return currencyStr;
  if (!currencyStr) return 0;
  return parseFloat(currencyStr.replace(/[$,]/g, '')) || 0;
};
