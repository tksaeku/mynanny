import { useState, useEffect, useCallback } from 'react';
import { CircularProgress, Alert, Snackbar } from '@mui/material';
import TabNavigation from './components/TabNavigation';
import PasswordGate, { isAuthenticated } from './components/PasswordGate';
import SummaryPage from './pages/SummaryPage';
import HoursPage from './pages/HoursPage';
import MileagePage from './pages/MileagePage';
import ExpensesPage from './pages/ExpensesPage';
import NotesPage from './pages/NotesPage';
import {
  fetchAllData,
  addHoursEntry,
  addMileageEntry,
  addExpenseEntry,
  addNotesEntry,
  updateHoursEntry,
  updateMileageEntry,
  updateExpenseEntry,
  updateNotesEntry,
  deleteHoursEntry,
  deleteMileageEntry,
  deleteExpenseEntry,
  deleteNotesEntry
} from './services/googleSheets';
import { formatDateDisplay, getDayOfMonth } from './utils/dateUtils';
import { calculateTotalHours } from './utils/calculations';
import './App.scss';

const App = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [activeTab, setActiveTab] = useState('summary');
  const [data, setData] = useState({
    hours: [],
    mileage: [],
    expenses: [],
    notes: [],
    config: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchAllData();
      setData(result);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data from Google Sheets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [loadData, authenticated]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Hours handlers
  const handleAddHours = async (entry) => {
    try {
      await addHoursEntry({
        date: formatDateDisplay(entry.date),
        dayOfMonth: getDayOfMonth(entry.date),
        regularHours: entry.regularHours,
        overtimeHours: entry.overtimeHours || 0,
        totalHours: calculateTotalHours(entry.regularHours, entry.overtimeHours || 0)
      });
      showNotification('Hours entry added successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to add hours entry', 'error');
      throw err;
    }
  };

  const handleEditHours = async (entry) => {
    try {
      await updateHoursEntry(entry.id, {
        date: formatDateDisplay(entry.date),
        dayOfMonth: getDayOfMonth(entry.date),
        regularHours: entry.regularHours,
        overtimeHours: entry.overtimeHours || 0,
        totalHours: calculateTotalHours(entry.regularHours, entry.overtimeHours || 0)
      });
      showNotification('Hours entry updated successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to update hours entry', 'error');
      throw err;
    }
  };

  const handleDeleteHours = async (entry) => {
    try {
      await deleteHoursEntry(entry.id);
      showNotification('Hours entry deleted successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to delete hours entry', 'error');
    }
  };

  // Mileage handlers
  const handleAddMileage = async (entry) => {
    try {
      await addMileageEntry({
        date: formatDateDisplay(entry.date),
        miles: entry.miles,
        purpose: entry.purpose || ''
      });
      showNotification('Mileage entry added successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to add mileage entry', 'error');
      throw err;
    }
  };

  const handleEditMileage = async (entry) => {
    try {
      await updateMileageEntry(entry.id, {
        date: formatDateDisplay(entry.date),
        miles: entry.miles,
        purpose: entry.purpose || ''
      });
      showNotification('Mileage entry updated successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to update mileage entry', 'error');
      throw err;
    }
  };

  const handleDeleteMileage = async (entry) => {
    try {
      await deleteMileageEntry(entry.id);
      showNotification('Mileage entry deleted successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to delete mileage entry', 'error');
    }
  };

  // Expenses handlers
  const handleAddExpense = async (entry) => {
    try {
      await addExpenseEntry({
        date: formatDateDisplay(entry.date),
        amount: entry.amount,
        category: entry.category,
        description: entry.description || ''
      });
      showNotification('Expense entry added successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to add expense entry', 'error');
      throw err;
    }
  };

  const handleEditExpense = async (entry) => {
    try {
      await updateExpenseEntry(entry.id, {
        date: formatDateDisplay(entry.date),
        amount: entry.amount,
        category: entry.category,
        description: entry.description || ''
      });
      showNotification('Expense entry updated successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to update expense entry', 'error');
      throw err;
    }
  };

  const handleDeleteExpense = async (entry) => {
    try {
      await deleteExpenseEntry(entry.id);
      showNotification('Expense entry deleted successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to delete expense entry', 'error');
    }
  };

  // Notes handlers
  const handleAddNote = async (entry) => {
    try {
      await addNotesEntry({
        date: formatDateDisplay(entry.date),
        category: entry.category,
        note: entry.note
      });
      showNotification('Note added successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to add note', 'error');
      throw err;
    }
  };

  const handleEditNote = async (entry) => {
    try {
      await updateNotesEntry(entry.id, {
        date: formatDateDisplay(entry.date),
        category: entry.category,
        note: entry.note
      });
      showNotification('Note updated successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to update note', 'error');
      throw err;
    }
  };

  const handleDeleteNote = async (entry) => {
    try {
      await deleteNotesEntry(entry.id);
      showNotification('Note deleted successfully');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to delete note', 'error');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <CircularProgress />
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <Alert severity="error">{error}</Alert>
        </div>
      );
    }

    switch (activeTab) {
      case 'summary':
        return (
          <SummaryPage
            hours={data.hours}
            mileage={data.mileage}
            expenses={data.expenses}
            notes={data.notes}
            config={data.config}
          />
        );
      case 'hours':
        return (
          <HoursPage
            data={data.hours}
            onAdd={handleAddHours}
            onEdit={handleEditHours}
            onDelete={handleDeleteHours}
          />
        );
      case 'mileage':
        return (
          <MileagePage
            data={data.mileage}
            onAdd={handleAddMileage}
            onEdit={handleEditMileage}
            onDelete={handleDeleteMileage}
          />
        );
      case 'expenses':
        return (
          <ExpensesPage
            data={data.expenses}
            onAdd={handleAddExpense}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        );
      case 'notes':
        return (
          <NotesPage
            data={data.notes}
            onAdd={handleAddNote}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        );
      default:
        return null;
    }
  };

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Nanny</h1>
      </header>

      <main className="app-content">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="page-container">
          {renderContent()}
        </div>
      </main>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
