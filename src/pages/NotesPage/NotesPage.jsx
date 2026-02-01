import { useState } from 'react';
import { Fab, Tooltip, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';
import EntryForm, { FORM_TYPES } from '../../components/EntryForm';
import { formatDateDisplay, formatDateISO } from '../../utils/dateUtils';
import './NotesPage.scss';

const getCategoryColor = (category) => {
  const colors = {
    General: 'default',
    Milestone: 'success',
    Health: 'error',
    Behavior: 'warning',
    Activity: 'info',
    Other: 'default'
  };
  return colors[category] || 'default';
};

const columns = [
  {
    id: 'date',
    label: 'Date',
    width: 120,
    render: (value) => formatDateDisplay(value)
  },
  {
    id: 'category',
    label: 'Category',
    width: 120,
    render: (value) => (
      <Chip
        label={value}
        size="small"
        color={getCategoryColor(value)}
        variant="outlined"
      />
    )
  },
  {
    id: 'note',
    label: 'Note'
  }
];

const NotesPage = ({ data = [], onAdd, onEdit, onDelete, isLoading = false }) => {
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
    if (window.confirm('Are you sure you want to delete this note?')) {
      await onDelete?.(entry);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (editingEntry) {
        await onEdit?.({ ...values, id: editingEntry.id });
      } else {
        await onAdd?.(values);
      }
      handleCloseForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort by date descending
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="notes-page">
      <DataTable
        columns={columns}
        data={sortedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No notes recorded yet. Click the + button to add your first note."
      />

      <div className="fab-container">
        <Tooltip title="Add Note">
          <Fab color="primary" onClick={handleOpenForm}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </div>

      <EntryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        formType={FORM_TYPES.NOTES}
        initialData={editingEntry}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default NotesPage;
