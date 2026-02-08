/**
 * Google Sheets service for reading and writing nanny tracking data
 */

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Sheet tab names
export const SHEET_TABS = {
  HOURS: 'Hours',
  MILEAGE: 'Mileage',
  EXPENSES: 'Expenses',
  NOTES: 'Notes',
  PTO: 'PTO',
  CONFIG: 'Config',
  WITHHOLDINGS: 'Withholdings',
  EMPLOYER: 'Employer'
};

/**
 * Fetch data from a sheet tab
 * @param {string} sheetName
 * @returns {Promise<Array<Array<string>>>}
 */
const fetchSheetData = async (sheetName) => {
  const url = `${SHEETS_API_BASE}/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sheetName}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.values || [];
};

/**
 * Parse hours entries from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {Array<object>}
 */
const parseHoursEntries = (rows) => {
  if (rows.length <= 1) return []; // Skip header or empty

  return rows.slice(1).map((row, index) => ({
    id: index + 2, // Row number (1-indexed, skip header)
    date: row[0] || '',
    dayOfMonth: parseInt(row[1]) || 0,
    regularHours: parseFloat(row[2]) || 0,
    overtimeHours: parseFloat(row[3]) || 0,
    totalHours: parseFloat(row[4]) || 0
  }));
};

/**
 * Parse mileage entries from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {Array<object>}
 */
const parseMileageEntries = (rows) => {
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: index + 2,
    date: row[0] || '',
    miles: parseFloat(row[1]) || 0,
    purpose: row[2] || ''
  }));
};

/**
 * Parse expense entries from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {Array<object>}
 */
const parseExpenseEntries = (rows) => {
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: index + 2,
    date: row[0] || '',
    amount: parseFloat(row[1]) || 0,
    category: row[2] || '',
    description: row[3] || ''
  }));
};

/**
 * Parse notes entries from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {Array<object>}
 */
const parseNotesEntries = (rows) => {
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: index + 2,
    date: row[0] || '',
    category: row[1] || '',
    note: row[2] || ''
  }));
};

/**
 * Parse PTO entries from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {Array<object>}
 */
const parsePTOEntries = (rows) => {
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: index + 2,
    date: row[0] || '',
    hours: parseFloat(row[1]) || 0,
    note: row[2] || ''
  }));
};

/**
 * Parse withholdings from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {Array<{ name: string, percentage: number }>}
 */
const parseWithholdings = (rows) => {
  if (rows.length <= 1) return [];

  return rows.slice(1)
    .map((row) => ({
      name: row[0] || '',
      percentage: parseFloat(row[1]) || 0
    }))
    .filter((item) => item.name && item.percentage > 0);
};

/**
 * Parse employer info from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {Array<{ label: string, value: string }>}
 */
const parseEmployer = (rows) => {
  if (rows.length <= 1) return [];

  return rows.slice(1)
    .map((row) => ({
      label: row[0] || '',
      value: row[1] || ''
    }))
    .filter((item) => item.label);
};

/**
 * Parse config from sheet data
 * @param {Array<Array<string>>} rows
 * @returns {object}
 */
const parseConfig = (rows) => {
  const config = {};

  if (rows.length > 1) {
    rows.slice(1).forEach((row) => {
      const key = row[0];
      const value = row[1];
      if (key) {
        config[key] = value;
      }
    });
  }

  return {
    regularHourlyRate: parseFloat(config['Regular Hourly Rate']) || 21,
    overtimeRate: parseFloat(config['Overtime Rate']) || 25,
    mileageRate: parseFloat(config['Mileage Rate']) || 0.67,
    ptoAccrualHours: parseFloat(config['PTO Accrual Hours']) || 40
  };
};

/**
 * Fetch all hours entries
 * @returns {Promise<Array<object>>}
 */
export const fetchHours = async () => {
  const rows = await fetchSheetData(SHEET_TABS.HOURS);
  return parseHoursEntries(rows);
};

/**
 * Fetch all mileage entries
 * @returns {Promise<Array<object>>}
 */
export const fetchMileage = async () => {
  const rows = await fetchSheetData(SHEET_TABS.MILEAGE);
  return parseMileageEntries(rows);
};

/**
 * Fetch all expense entries
 * @returns {Promise<Array<object>>}
 */
export const fetchExpenses = async () => {
  const rows = await fetchSheetData(SHEET_TABS.EXPENSES);
  return parseExpenseEntries(rows);
};

/**
 * Fetch all notes entries
 * @returns {Promise<Array<object>>}
 */
export const fetchNotes = async () => {
  const rows = await fetchSheetData(SHEET_TABS.NOTES);
  return parseNotesEntries(rows);
};

/**
 * Fetch all PTO entries
 * @returns {Promise<Array<object>>}
 */
export const fetchPTO = async () => {
  const rows = await fetchSheetData(SHEET_TABS.PTO);
  return parsePTOEntries(rows);
};

/**
 * Fetch configuration
 * @returns {Promise<object>}
 */
export const fetchConfig = async () => {
  const rows = await fetchSheetData(SHEET_TABS.CONFIG);
  return parseConfig(rows);
};

/**
 * Fetch withholdings configuration
 * @returns {Promise<Array<{ name: string, percentage: number }>>}
 */
export const fetchWithholdings = async () => {
  try {
    const rows = await fetchSheetData(SHEET_TABS.WITHHOLDINGS);
    return parseWithholdings(rows);
  } catch {
    return [];
  }
};

/**
 * Fetch employer information
 * @returns {Promise<Array<{ label: string, value: string }>>}
 */
export const fetchEmployer = async () => {
  try {
    const rows = await fetchSheetData(SHEET_TABS.EMPLOYER);
    return parseEmployer(rows);
  } catch {
    return [];
  }
};

/**
 * Fetch all data from all sheets
 * @returns {Promise<object>}
 */
export const fetchAllData = async () => {
  const [hours, mileage, expenses, notes, pto, config, withholdings, employer] = await Promise.all([
    fetchHours(),
    fetchMileage(),
    fetchExpenses(),
    fetchNotes(),
    fetchPTO(),
    fetchConfig(),
    fetchWithholdings(),
    fetchEmployer()
  ]);

  return { hours, mileage, expenses, notes, pto, config, withholdings, employer };
};

/**
 * Add an entry via Apps Script
 * @param {string} sheetName
 * @param {object} data
 * @returns {Promise<object>}
 */
const addEntry = async (sheetName, data) => {
  if (!APPS_SCRIPT_URL) {
    throw new Error('Apps Script URL not configured. Set VITE_APPS_SCRIPT_URL in .env');
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'add',
      sheet: sheetName,
      data
    })
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to add entry');
  }

  return result;
};

/**
 * Update an entry via Apps Script
 * @param {string} sheetName
 * @param {number} rowNumber
 * @param {object} data
 * @returns {Promise<object>}
 */
const updateEntry = async (sheetName, rowNumber, data) => {
  if (!APPS_SCRIPT_URL) {
    throw new Error('Apps Script URL not configured. Set VITE_APPS_SCRIPT_URL in .env');
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'update',
      sheet: sheetName,
      row: rowNumber,
      data
    })
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to update entry');
  }

  return result;
};

/**
 * Delete an entry via Apps Script
 * @param {string} sheetName
 * @param {number} rowNumber
 * @returns {Promise<object>}
 */
const deleteEntry = async (sheetName, rowNumber) => {
  if (!APPS_SCRIPT_URL) {
    throw new Error('Apps Script URL not configured. Set VITE_APPS_SCRIPT_URL in .env');
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'delete',
      sheet: sheetName,
      row: rowNumber
    })
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete entry');
  }

  return result;
};

/**
 * Add hours entry
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const addHoursEntry = (entry) => addEntry(SHEET_TABS.HOURS, entry);

/**
 * Add mileage entry
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const addMileageEntry = (entry) => addEntry(SHEET_TABS.MILEAGE, entry);

/**
 * Add expense entry
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const addExpenseEntry = (entry) => addEntry(SHEET_TABS.EXPENSES, entry);

/**
 * Add notes entry
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const addNotesEntry = (entry) => addEntry(SHEET_TABS.NOTES, entry);

/**
 * Update hours entry
 * @param {number} rowNumber
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const updateHoursEntry = (rowNumber, entry) => updateEntry(SHEET_TABS.HOURS, rowNumber, entry);

/**
 * Update mileage entry
 * @param {number} rowNumber
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const updateMileageEntry = (rowNumber, entry) => updateEntry(SHEET_TABS.MILEAGE, rowNumber, entry);

/**
 * Update expense entry
 * @param {number} rowNumber
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const updateExpenseEntry = (rowNumber, entry) => updateEntry(SHEET_TABS.EXPENSES, rowNumber, entry);

/**
 * Update notes entry
 * @param {number} rowNumber
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const updateNotesEntry = (rowNumber, entry) => updateEntry(SHEET_TABS.NOTES, rowNumber, entry);

/**
 * Delete hours entry
 * @param {number} rowNumber
 * @returns {Promise<object>}
 */
export const deleteHoursEntry = (rowNumber) => deleteEntry(SHEET_TABS.HOURS, rowNumber);

/**
 * Delete mileage entry
 * @param {number} rowNumber
 * @returns {Promise<object>}
 */
export const deleteMileageEntry = (rowNumber) => deleteEntry(SHEET_TABS.MILEAGE, rowNumber);

/**
 * Delete expense entry
 * @param {number} rowNumber
 * @returns {Promise<object>}
 */
export const deleteExpenseEntry = (rowNumber) => deleteEntry(SHEET_TABS.EXPENSES, rowNumber);

/**
 * Delete notes entry
 * @param {number} rowNumber
 * @returns {Promise<object>}
 */
export const deleteNotesEntry = (rowNumber) => deleteEntry(SHEET_TABS.NOTES, rowNumber);

/**
 * Add PTO entry
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const addPTOEntry = (entry) => addEntry(SHEET_TABS.PTO, entry);

/**
 * Update PTO entry
 * @param {number} rowNumber
 * @param {object} entry
 * @returns {Promise<object>}
 */
export const updatePTOEntry = (rowNumber, entry) => updateEntry(SHEET_TABS.PTO, rowNumber, entry);

/**
 * Delete PTO entry
 * @param {number} rowNumber
 * @returns {Promise<object>}
 */
export const deletePTOEntry = (rowNumber) => deleteEntry(SHEET_TABS.PTO, rowNumber);
