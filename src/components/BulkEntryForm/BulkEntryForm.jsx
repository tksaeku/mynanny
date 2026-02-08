import { useState } from 'react';
import {
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Button,
  Alert,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FormDialog from '../FormDialog';
import { FORM_TYPES, EXPENSE_CATEGORIES, NOTE_CATEGORIES } from '../../constants';
import { formatDateISO } from '../../utils/dateUtils';
import './BulkEntryForm.scss';

const TYPE_OPTIONS = [
  { value: FORM_TYPES.HOURS, label: 'Hours' },
  { value: FORM_TYPES.MILEAGE, label: 'Mileage' },
  { value: FORM_TYPES.EXPENSES, label: 'Expense' },
  { value: FORM_TYPES.NOTES, label: 'Note' },
  { value: FORM_TYPES.PTO, label: 'PTO' }
];

const createEmptyRow = (type = FORM_TYPES.HOURS) => ({
  id: crypto.randomUUID(),
  type,
  date: formatDateISO(new Date()),
  // Hours fields
  regularHours: '',
  overtimeHours: '',
  // Mileage fields
  miles: '',
  purpose: '',
  // Expenses fields
  amount: '',
  category: '',
  description: '',
  // Notes fields
  note: '',
  // PTO fields
  hours: ''
});

const BulkEntryForm = ({
  open,
  onClose,
  onBulkAdd
}) => {
  const [rows, setRows] = useState([createEmptyRow()]);
  const [sameDate, setSameDate] = useState(true);
  const [sharedDate, setSharedDate] = useState(formatDateISO(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(0);

  const handleClose = () => {
    setRows([createEmptyRow()]);
    setSameDate(true);
    setSharedDate(formatDateISO(new Date()));
    setErrors([]);
    setSuccessCount(0);
    onClose();
  };

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleDeleteRow = (rowId) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== rowId));
    }
  };

  const handleRowChange = (rowId, field, value) => {
    setRows(rows.map((row) => {
      if (row.id !== rowId) return row;

      // If changing type, reset type-specific fields
      if (field === 'type') {
        return {
          ...createEmptyRow(value),
          id: row.id,
          date: row.date
        };
      }

      return { ...row, [field]: value };
    }));
  };

  const getRowDate = (row) => (sameDate ? sharedDate : row.date);

  const validateRow = (row) => {
    const date = getRowDate(row);
    if (!date) return 'Date is required';

    switch (row.type) {
      case FORM_TYPES.HOURS:
        if (!row.regularHours && row.regularHours !== 0) return 'Regular hours is required';
        break;
      case FORM_TYPES.MILEAGE:
        if (!row.miles && row.miles !== 0) return 'Miles is required';
        break;
      case FORM_TYPES.EXPENSES:
        if (!row.amount && row.amount !== 0) return 'Amount is required';
        if (!row.category) return 'Category is required';
        break;
      case FORM_TYPES.NOTES:
        if (!row.category) return 'Category is required';
        if (!row.note) return 'Note is required';
        break;
      case FORM_TYPES.PTO:
        if (!row.hours && row.hours !== 0) return 'Hours is required';
        break;
      default:
        return 'Unknown entry type';
    }
    return null;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors([]);
    setSuccessCount(0);

    // First, validate all rows and collect valid entries
    const validationErrors = [];
    const validEntries = [];

    for (const row of rows) {
      const validationError = validateRow(row);
      if (validationError) {
        validationErrors.push({ rowId: row.id, message: validationError });
        continue;
      }

      const date = getRowDate(row);
      let entryData;

      switch (row.type) {
        case FORM_TYPES.HOURS:
          entryData = {
            date,
            regularHours: parseFloat(row.regularHours) || 0,
            overtimeHours: parseFloat(row.overtimeHours) || 0
          };
          break;
        case FORM_TYPES.MILEAGE:
          entryData = {
            date,
            miles: parseFloat(row.miles) || 0,
            purpose: row.purpose || ''
          };
          break;
        case FORM_TYPES.EXPENSES:
          entryData = {
            date,
            amount: parseFloat(row.amount) || 0,
            category: row.category,
            description: row.description || ''
          };
          break;
        case FORM_TYPES.NOTES:
          entryData = {
            date,
            category: row.category,
            note: row.note
          };
          break;
        case FORM_TYPES.PTO:
          entryData = {
            date,
            hours: parseFloat(row.hours) || 0,
            note: row.note || ''
          };
          break;
      }

      validEntries.push({
        rowId: row.id,
        type: row.type,
        data: entryData
      });
    }

    // If there are validation errors only, show them without calling the API
    if (validEntries.length === 0 && validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Submit all valid entries in one batch
    let apiErrors = [];
    let successes = 0;

    if (validEntries.length > 0) {
      const result = await onBulkAdd(validEntries.map(({ type, data }) => ({ type, data })));
      successes = result.successCount;

      // Map API errors back to row IDs
      apiErrors = result.errors.map((err) => {
        const matchingEntry = validEntries.find(
          (e) => e.type === err.type && e.data === err.entry
        );
        return {
          rowId: matchingEntry?.rowId,
          message: err.message
        };
      });
    }

    const allErrors = [...validationErrors, ...apiErrors];
    setErrors(allErrors);
    setSuccessCount(successes);
    setIsSubmitting(false);

    // Close if all succeeded
    if (allErrors.length === 0) {
      handleClose();
    } else {
      // Remove successful rows, keep failed ones
      const failedRowIds = new Set(allErrors.map((e) => e.rowId));
      setRows(rows.filter((row) => failedRowIds.has(row.id)));
    }
  };

  const renderTypeFields = (row) => {
    switch (row.type) {
      case FORM_TYPES.HOURS:
        return (
          <>
            <TextField
              placeholder="Regular"
              type="number"
              size="small"
              value={row.regularHours}
              onChange={(e) => handleRowChange(row.id, 'regularHours', e.target.value)}
              inputProps={{ min: 0, step: 0.5 }}
              className="bulk-entry-form__field bulk-entry-form__field--small"
            />
            <TextField
              placeholder="OT"
              type="number"
              size="small"
              value={row.overtimeHours}
              onChange={(e) => handleRowChange(row.id, 'overtimeHours', e.target.value)}
              inputProps={{ min: 0, step: 0.5 }}
              className="bulk-entry-form__field bulk-entry-form__field--small"
            />
          </>
        );
      case FORM_TYPES.MILEAGE:
        return (
          <>
            <TextField
              placeholder="Miles"
              type="number"
              size="small"
              value={row.miles}
              onChange={(e) => handleRowChange(row.id, 'miles', e.target.value)}
              inputProps={{ min: 0, step: 0.1 }}
              className="bulk-entry-form__field bulk-entry-form__field--small"
            />
            <TextField
              placeholder="Purpose"
              size="small"
              value={row.purpose}
              onChange={(e) => handleRowChange(row.id, 'purpose', e.target.value)}
              className="bulk-entry-form__field bulk-entry-form__field--medium"
            />
          </>
        );
      case FORM_TYPES.EXPENSES:
        return (
          <>
            <TextField
              placeholder="Amount"
              type="number"
              size="small"
              value={row.amount}
              onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{ startAdornment: '$' }}
              className="bulk-entry-form__field bulk-entry-form__field--small"
            />
            <TextField
              placeholder="Category"
              select
              size="small"
              value={row.category}
              onChange={(e) => handleRowChange(row.id, 'category', e.target.value)}
              className="bulk-entry-form__field bulk-entry-form__field--medium"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField
              placeholder="Description"
              size="small"
              value={row.description}
              onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
              className="bulk-entry-form__field bulk-entry-form__field--medium"
            />
          </>
        );
      case FORM_TYPES.NOTES:
        return (
          <>
            <TextField
              placeholder="Category"
              select
              size="small"
              value={row.category}
              onChange={(e) => handleRowChange(row.id, 'category', e.target.value)}
              className="bulk-entry-form__field bulk-entry-form__field--medium"
            >
              {NOTE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField
              placeholder="Note"
              size="small"
              value={row.note}
              onChange={(e) => handleRowChange(row.id, 'note', e.target.value)}
              className="bulk-entry-form__field bulk-entry-form__field--large"
            />
          </>
        );
      case FORM_TYPES.PTO:
        return (
          <>
            <TextField
              placeholder="Hours"
              type="number"
              size="small"
              value={row.hours}
              onChange={(e) => handleRowChange(row.id, 'hours', e.target.value)}
              inputProps={{ min: 0, step: 0.5 }}
              className="bulk-entry-form__field bulk-entry-form__field--small"
            />
            <TextField
              placeholder="Note"
              size="small"
              value={row.note}
              onChange={(e) => handleRowChange(row.id, 'note', e.target.value)}
              className="bulk-entry-form__field bulk-entry-form__field--medium"
            />
          </>
        );
      default:
        return null;
    }
  };

  const getRowError = (rowId) => errors.find((e) => e.rowId === rowId);

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title="Add Multiple Entries"
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? 'Saving...' : `Add ${rows.length} ${rows.length === 1 ? 'Entry' : 'Entries'}`}
      isSubmitting={isSubmitting}
      maxWidth="md"
    >
      <div className="bulk-entry-form">
        {/* Same date toggle */}
        <div className="bulk-entry-form__date-toggle">
          <FormControlLabel
            control={
              <Checkbox
                checked={sameDate}
                onChange={(e) => setSameDate(e.target.checked)}
              />
            }
            label="Same date for all entries"
          />
          {sameDate && (
            <TextField
              type="date"
              size="small"
              value={sharedDate}
              onChange={(e) => setSharedDate(e.target.value)}
              className="bulk-entry-form__shared-date"
            />
          )}
        </div>

        {/* Success/error messages */}
        {successCount > 0 && errors.length > 0 && (
          <Alert severity="warning" className="bulk-entry-form__alert">
            {successCount} {successCount === 1 ? 'entry' : 'entries'} saved. {errors.length} failed.
          </Alert>
        )}

        {/* Entry rows */}
        <div className="bulk-entry-form__rows">
          {rows.map((row, index) => {
            const rowError = getRowError(row.id);
            return (
              <div
                key={row.id}
                className={`bulk-entry-form__row ${rowError ? 'bulk-entry-form__row--error' : ''}`}
              >
                <span className="bulk-entry-form__row-number">{index + 1}</span>

                <TextField
                  select
                  size="small"
                  value={row.type}
                  onChange={(e) => handleRowChange(row.id, 'type', e.target.value)}
                  className="bulk-entry-form__field bulk-entry-form__field--type"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>

                {renderTypeFields(row)}

                {!sameDate && (
                  <TextField
                    type="date"
                    size="small"
                    value={row.date}
                    onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                    className="bulk-entry-form__field bulk-entry-form__field--date"
                  />
                )}

                <IconButton
                  onClick={() => handleDeleteRow(row.id)}
                  disabled={rows.length === 1}
                  size="small"
                  className="bulk-entry-form__delete-btn"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                {rowError && (
                  <Box className="bulk-entry-form__row-error">
                    {rowError.message}
                  </Box>
                )}
              </div>
            );
          })}
        </div>

        {/* Add row button */}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          variant="outlined"
          size="small"
          className="bulk-entry-form__add-btn"
        >
          Add Row
        </Button>
      </div>
    </FormDialog>
  );
};

export default BulkEntryForm;
