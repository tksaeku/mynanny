/**
 * Google Apps Script for Nanny Tracking App
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click Deploy > New deployment
 * 5. Select "Web app" as the type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Add the URL to your .env file as VITE_APPS_SCRIPT_URL
 *
 * SHEET STRUCTURE:
 * Create the following tabs in your Google Sheet with these headers:
 *
 * Hours: Date | Day of Month | Regular Hours | Overtime | Total Hours
 * Mileage: Date | Miles | Purpose
 * Expenses: Date | Amount | Category | Description
 * Notes: Date | Category | Note
 * PTO: Date | Hours | Note
 * Config: Setting | Value
 * Withholdings: Name | Percentage
 *
 * Config tab should have these rows:
 * Regular Hourly Rate | 21
 * Overtime Rate | 25
 * Mileage Rate | 0.67
 * PTO Accrual Hours | 40
 */

/**
 * Handle HTTP POST requests
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const { action, sheet, data, row } = request;

    let result;

    switch (action) {
      case 'add':
        result = addRow(sheet, data);
        break;
      case 'update':
        result = updateRow(sheet, row, data);
        break;
      case 'delete':
        result = deleteRow(sheet, row);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return createCorsResponse(result);

  } catch (error) {
    return createCorsResponse({ success: false, error: error.message });
  }
}

/**
 * Create a response with CORS headers
 */
function createCorsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Nanny Tracker API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Add a new row to a sheet
 */
function addRow(sheetName, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  let rowData;

  switch (sheetName) {
    case 'Hours':
      rowData = [
        data.date,
        data.dayOfMonth,
        data.regularHours,
        data.overtimeHours || 0,
        data.totalHours
      ];
      break;
    case 'Mileage':
      rowData = [
        data.date,
        data.miles,
        data.purpose || ''
      ];
      break;
    case 'Expenses':
      rowData = [
        data.date,
        data.amount,
        data.category,
        data.description || ''
      ];
      break;
    case 'Notes':
      rowData = [
        data.date,
        data.category,
        data.note
      ];
      break;
    case 'PTO':
      rowData = [
        data.date,
        data.hours,
        data.note || ''
      ];
      break;
    default:
      throw new Error(`Unknown sheet: ${sheetName}`);
  }

  sheet.appendRow(rowData);
  const newRow = sheet.getLastRow();

  return { success: true, row: newRow };
}

/**
 * Update an existing row in a sheet
 */
function updateRow(sheetName, rowNumber, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  if (rowNumber < 2) {
    throw new Error('Cannot update header row');
  }

  let rowData;

  switch (sheetName) {
    case 'Hours':
      rowData = [
        data.date,
        data.dayOfMonth,
        data.regularHours,
        data.overtimeHours || 0,
        data.totalHours
      ];
      break;
    case 'Mileage':
      rowData = [
        data.date,
        data.miles,
        data.purpose || ''
      ];
      break;
    case 'Expenses':
      rowData = [
        data.date,
        data.amount,
        data.category,
        data.description || ''
      ];
      break;
    case 'Notes':
      rowData = [
        data.date,
        data.category,
        data.note
      ];
      break;
    case 'PTO':
      rowData = [
        data.date,
        data.hours,
        data.note || ''
      ];
      break;
    default:
      throw new Error(`Unknown sheet: ${sheetName}`);
  }

  const range = sheet.getRange(rowNumber, 1, 1, rowData.length);
  range.setValues([rowData]);

  return { success: true, row: rowNumber };
}

/**
 * Delete a row from a sheet
 */
function deleteRow(sheetName, rowNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  if (rowNumber < 2) {
    throw new Error('Cannot delete header row');
  }

  sheet.deleteRow(rowNumber);

  return { success: true };
}

/**
 * Initialize the spreadsheet with required tabs and headers
 * Run this function once to set up your spreadsheet
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create Hours sheet
  let hoursSheet = ss.getSheetByName('Hours');
  if (!hoursSheet) {
    hoursSheet = ss.insertSheet('Hours');
    hoursSheet.appendRow(['Date', 'Day of Month', 'Regular Hours', 'Overtime', 'Total Hours']);
    hoursSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  // Create Mileage sheet
  let mileageSheet = ss.getSheetByName('Mileage');
  if (!mileageSheet) {
    mileageSheet = ss.insertSheet('Mileage');
    mileageSheet.appendRow(['Date', 'Miles', 'Purpose']);
    mileageSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }

  // Create Expenses sheet
  let expensesSheet = ss.getSheetByName('Expenses');
  if (!expensesSheet) {
    expensesSheet = ss.insertSheet('Expenses');
    expensesSheet.appendRow(['Date', 'Amount', 'Category', 'Description']);
    expensesSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }

  // Create Notes sheet
  let notesSheet = ss.getSheetByName('Notes');
  if (!notesSheet) {
    notesSheet = ss.insertSheet('Notes');
    notesSheet.appendRow(['Date', 'Category', 'Note']);
    notesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }

  // Create PTO sheet
  let ptoSheet = ss.getSheetByName('PTO');
  if (!ptoSheet) {
    ptoSheet = ss.insertSheet('PTO');
    ptoSheet.appendRow(['Date', 'Hours', 'Note']);
    ptoSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }

  // Create Config sheet
  let configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    configSheet.appendRow(['Setting', 'Value']);
    configSheet.appendRow(['Regular Hourly Rate', 21]);
    configSheet.appendRow(['Overtime Rate', 25]);
    configSheet.appendRow(['Mileage Rate', 0.67]);
    configSheet.appendRow(['PTO Accrual Hours', 40]);
    configSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  // Create Withholdings sheet
  let withholdingsSheet = ss.getSheetByName('Withholdings');
  if (!withholdingsSheet) {
    withholdingsSheet = ss.insertSheet('Withholdings');
    withholdingsSheet.appendRow(['Name', 'Percentage']);
    withholdingsSheet.appendRow(['Social Security', 6.20]);
    withholdingsSheet.appendRow(['Medicare', 1.45]);
    withholdingsSheet.appendRow(['WA Paid Leave (PFML)', 0.81]);
    withholdingsSheet.appendRow(['WA Cares Fund', 0.58]);
    withholdingsSheet.appendRow(['WA Unemployment', 0.00]);
    withholdingsSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  // Remove default Sheet1 if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getUi().alert('Spreadsheet initialized successfully!');
}
