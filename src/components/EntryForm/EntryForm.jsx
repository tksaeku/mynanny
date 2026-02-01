import { useState, useEffect } from 'react';
import { TextField, MenuItem } from '@mui/material';
import FormDialog from '../FormDialog';
import { formatDateISO } from '../../utils/dateUtils';
import { FORM_TYPES, EXPENSE_CATEGORIES, NOTE_CATEGORIES } from '../../constants';
import './EntryForm.scss';

const getInitialValues = (formType) => {
  const today = formatDateISO(new Date());

  switch (formType) {
    case FORM_TYPES.HOURS:
      return { date: today, regularHours: '', overtimeHours: '' };
    case FORM_TYPES.MILEAGE:
      return { date: today, miles: '', purpose: '' };
    case FORM_TYPES.EXPENSES:
      return { date: today, amount: '', category: '', description: '' };
    case FORM_TYPES.NOTES:
      return { date: today, category: '', note: '' };
    default:
      return { date: today };
  }
};

const EntryForm = ({
  open,
  onClose,
  onSubmit,
  formType,
  initialData = null,
  isSubmitting = false
}) => {
  const [values, setValues] = useState(getInitialValues(formType));

  useEffect(() => {
    if (initialData) {
      setValues(initialData);
    } else {
      setValues(getInitialValues(formType));
    }
  }, [initialData, formType, open]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  const getTitle = () => {
    const action = initialData ? 'Edit' : 'Add';
    switch (formType) {
      case FORM_TYPES.HOURS:
        return `${action} Hours Entry`;
      case FORM_TYPES.MILEAGE:
        return `${action} Mileage Entry`;
      case FORM_TYPES.EXPENSES:
        return `${action} Expense Entry`;
      case FORM_TYPES.NOTES:
        return `${action} Note`;
      default:
        return `${action} Entry`;
    }
  };

  const renderFields = () => {
    switch (formType) {
      case FORM_TYPES.HOURS:
        return (
          <>
            <TextField
              label="Date"
              type="date"
              value={values.date || ''}
              onChange={handleChange('date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Regular Hours"
              type="number"
              value={values.regularHours || ''}
              onChange={handleChange('regularHours')}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.5 }}
            />
            <TextField
              label="Overtime Hours"
              type="number"
              value={values.overtimeHours || ''}
              onChange={handleChange('overtimeHours')}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
              helperText="Optional - leave blank if none"
            />
          </>
        );

      case FORM_TYPES.MILEAGE:
        return (
          <>
            <TextField
              label="Date"
              type="date"
              value={values.date || ''}
              onChange={handleChange('date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Miles"
              type="number"
              value={values.miles || ''}
              onChange={handleChange('miles')}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.1 }}
            />
            <TextField
              label="Purpose"
              value={values.purpose || ''}
              onChange={handleChange('purpose')}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g., Grocery run, park trip"
            />
          </>
        );

      case FORM_TYPES.EXPENSES:
        return (
          <>
            <TextField
              label="Date"
              type="date"
              value={values.date || ''}
              onChange={handleChange('date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Amount"
              type="number"
              value={values.amount || ''}
              onChange={handleChange('amount')}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{ startAdornment: '$' }}
            />
            <TextField
              label="Category"
              select
              value={values.category || ''}
              onChange={handleChange('category')}
              fullWidth
              required
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={values.description || ''}
              onChange={handleChange('description')}
              fullWidth
              multiline
              rows={2}
              placeholder="What was the expense for?"
            />
          </>
        );

      case FORM_TYPES.NOTES:
        return (
          <>
            <TextField
              label="Date"
              type="date"
              value={values.date || ''}
              onChange={handleChange('date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Category"
              select
              value={values.category || ''}
              onChange={handleChange('category')}
              fullWidth
              required
            >
              {NOTE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Note"
              value={values.note || ''}
              onChange={handleChange('note')}
              fullWidth
              required
              multiline
              rows={4}
              placeholder="Enter your note..."
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={getTitle()}
      onSubmit={handleSubmit}
      submitLabel={initialData ? 'Update' : 'Add'}
      isSubmitting={isSubmitting}
    >
      <div className="entry-form">
        {renderFields()}
      </div>
    </FormDialog>
  );
};

export default EntryForm;
