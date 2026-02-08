import { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';
import EntryForm from '../../components/EntryForm';
import { FORM_TYPES } from '../../constants';
import { formatDateDisplay, formatDateISO } from '../../utils/dateUtils';
import './PTOPage.scss';

const columns = [
  {
    id: 'date',
    label: 'Date',
    type: 'date',
    sortable: true,
    width: 120,
    render: (value) => formatDateDisplay(value)
  },
  {
    id: 'hours',
    label: 'Hours',
    type: 'number',
    sortable: true,
    align: 'right',
    width: 80,
    render: (value) => value?.toFixed(1) || '0.0'
  },
  {
    id: 'note',
    label: 'Note'
  }
];

const PTOPage = ({ data = [], onAdd, onEdit, onDelete }) => {
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
    if (window.confirm('Are you sure you want to delete this PTO entry?')) {
      await onDelete?.(entry);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const entry = {
        ...values,
        hours: parseFloat(values.hours) || 0
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

  return (
    <div className="pto-page">
      <DataTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No PTO recorded yet. Click the + button to add your first entry."
        defaultSort={{ column: 'date', direction: 'desc' }}
      />

      <div className="fab-container">
        <Tooltip title="Add PTO">
          <Fab color="primary" onClick={handleOpenForm}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </div>

      <EntryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        formType={FORM_TYPES.PTO}
        initialData={editingEntry}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PTOPage;
