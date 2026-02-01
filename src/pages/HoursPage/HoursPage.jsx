import { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';
import EntryForm, { FORM_TYPES } from '../../components/EntryForm';
import { formatDateDisplay, getDayOfMonth, formatDateISO } from '../../utils/dateUtils';
import { calculateTotalHours } from '../../utils/calculations';
import './HoursPage.scss';

const columns = [
  {
    id: 'date',
    label: 'Date',
    render: (value) => formatDateDisplay(value)
  },
  {
    id: 'dayOfMonth',
    label: 'Day',
    align: 'center',
    width: 60
  },
  {
    id: 'regularHours',
    label: 'Regular',
    align: 'right',
    render: (value) => value?.toFixed(1) || '0.0'
  },
  {
    id: 'overtimeHours',
    label: 'OT',
    align: 'right',
    render: (value) => value?.toFixed(1) || '0.0'
  },
  {
    id: 'totalHours',
    label: 'Total',
    align: 'right',
    render: (value) => value?.toFixed(1) || '0.0'
  }
];

const HoursPage = ({ data = [], onAdd, onEdit, onDelete, isLoading = false }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry) => {
    setEditingEntry({
      ...entry,
      date: formatDateISO(new Date(entry.date))
    });
    setFormOpen(true);
  };

  const handleDelete = async (entry) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await onDelete?.(entry);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const entry = {
        ...values,
        dayOfMonth: getDayOfMonth(values.date),
        regularHours: parseFloat(values.regularHours) || 0,
        overtimeHours: parseFloat(values.overtimeHours) || 0,
        totalHours: calculateTotalHours(
          parseFloat(values.regularHours) || 0,
          parseFloat(values.overtimeHours) || 0
        )
      };

      if (editingEntry) {
        await onEdit?.({ ...entry, id: editingEntry.id });
      } else {
        await onAdd?.(entry);
      }
      handleCloseForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort by date descending
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="hours-page">
      <DataTable
        columns={columns}
        data={sortedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hours recorded yet. Click the + button to add your first entry."
      />

      <div className="fab-container">
        <Tooltip title="Add Hours">
          <Fab color="primary" onClick={handleOpenForm}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </div>

      <EntryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        formType={FORM_TYPES.HOURS}
        initialData={editingEntry}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default HoursPage;
