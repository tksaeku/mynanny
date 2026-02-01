/**
 * Date utility functions for the nanny tracking app
 */

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export const formatDateISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date string without timezone issues
 * @param {string} dateStr
 * @returns {Date}
 */
const parseDateString = (dateStr) => {
  // Handle YYYY-MM-DD format (from date input) - parse as local time, not UTC
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  // Handle MM/DD/YYYY format
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
};

/**
 * Format a date for display (MM/DD/YYYY)
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateDisplay = (date) => {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

/**
 * Get the day of month from a date
 * @param {Date|string} date
 * @returns {number}
 */
export const getDayOfMonth = (date) => {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  return d.getDate();
};

/**
 * Get the start of the week (Sunday) for a given date
 * @param {Date} date
 * @returns {Date}
 */
export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the week (Saturday) for a given date
 * @param {Date} date
 * @returns {Date}
 */
export const getWeekEnd = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get the start of the month for a given date
 * @param {Date} date
 * @returns {Date}
 */
export const getMonthStart = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the month for a given date
 * @param {Date} date
 * @returns {Date}
 */
export const getMonthEnd = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Check if a date falls within a range (inclusive)
 * @param {Date|string} date
 * @param {Date} start
 * @param {Date} end
 * @returns {boolean}
 */
export const isDateInRange = (date, start, end) => {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  return d >= start && d <= end;
};

/**
 * Get the current week's date range as a formatted string
 * @param {Date} date
 * @returns {string}
 */
export const getWeekRangeLabel = (date) => {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  return `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`;
};

/**
 * Get the month name and year
 * @param {Date} date
 * @returns {string}
 */
export const getMonthLabel = (date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Navigate to previous week
 * @param {Date} date
 * @returns {Date}
 */
export const getPreviousWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return d;
};

/**
 * Navigate to next week
 * @param {Date} date
 * @returns {Date}
 */
export const getNextWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 7);
  return d;
};

/**
 * Navigate to previous month
 * @param {Date} date
 * @returns {Date}
 */
export const getPreviousMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 1);
  return d;
};

/**
 * Navigate to next month
 * @param {Date} date
 * @returns {Date}
 */
export const getNextMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
};

/**
 * Parse a date string that may be in various formats
 * @param {string} dateStr
 * @returns {Date}
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // Handle MM/DD/YYYY format
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Handle YYYY-MM-DD format
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateStr);
};

/**
 * Get today's date with time set to midnight
 * @returns {Date}
 */
export const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
