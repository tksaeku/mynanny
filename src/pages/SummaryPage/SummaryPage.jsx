import { useState, useMemo } from 'react';
import { Paper, Typography, Divider, Box, Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ViewToggle, { VIEW_MODES } from '../../components/ViewToggle';
import DataTable from '../../components/DataTable';
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getWeekRangeLabel,
  getMonthLabel,
  getPreviousWeek,
  getNextWeek,
  getPreviousMonth,
  getNextMonth,
  isDateInRange,
  formatDateDisplay,
  parseDate
} from '../../utils/dateUtils';
import { calculatePeriodSummary, formatCurrency } from '../../utils/calculations';
import './SummaryPage.scss';

const SummaryPage = ({ hours = [], mileage = [], expenses = [], notes = [], config = {} }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.WEEKLY);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get date range based on view mode
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case VIEW_MODES.WEEKLY:
        return {
          start: getWeekStart(currentDate),
          end: getWeekEnd(currentDate),
          label: getWeekRangeLabel(currentDate)
        };
      case VIEW_MODES.MONTHLY:
        return {
          start: getMonthStart(currentDate),
          end: getMonthEnd(currentDate),
          label: getMonthLabel(currentDate)
        };
      case VIEW_MODES.HISTORICAL:
      default:
        return {
          start: null,
          end: null,
          label: 'All Time'
        };
    }
  }, [viewMode, currentDate]);

  // Filter data by date range
  const filterByDateRange = (entries) => {
    if (!dateRange.start || !dateRange.end) return entries;
    return entries.filter((entry) => {
      const entryDate = parseDate(entry.date);
      return entryDate && isDateInRange(entryDate, dateRange.start, dateRange.end);
    });
  };

  const filteredHours = useMemo(() => filterByDateRange(hours), [hours, dateRange]);
  const filteredMileage = useMemo(() => filterByDateRange(mileage), [mileage, dateRange]);
  const filteredExpenses = useMemo(() => filterByDateRange(expenses), [expenses, dateRange]);

  // Calculate summary
  const summary = useMemo(() => {
    return calculatePeriodSummary(
      {
        hoursEntries: filteredHours,
        mileageEntries: filteredMileage,
        expenseEntries: filteredExpenses
      },
      config
    );
  }, [filteredHours, filteredMileage, filteredExpenses, config]);

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === VIEW_MODES.WEEKLY) {
      setCurrentDate(getPreviousWeek(currentDate));
    } else if (viewMode === VIEW_MODES.MONTHLY) {
      setCurrentDate(getPreviousMonth(currentDate));
    }
  };

  const handleNext = () => {
    if (viewMode === VIEW_MODES.WEEKLY) {
      setCurrentDate(getNextWeek(currentDate));
    } else if (viewMode === VIEW_MODES.MONTHLY) {
      setCurrentDate(getNextMonth(currentDate));
    }
  };

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    setCurrentDate(new Date()); // Reset to current date when changing mode
  };

  // Combined entries for the table
  const combinedEntries = useMemo(() => {
    const entries = [];

    filteredHours.forEach((entry) => {
      entries.push({
        id: `hours-${entry.id}`,
        type: 'Hours',
        date: entry.date,
        description: `${entry.regularHours}h regular${entry.overtimeHours > 0 ? ` + ${entry.overtimeHours}h OT` : ''}`,
        amount: (entry.regularHours * (config.regularHourlyRate || 21)) +
                (entry.overtimeHours * (config.overtimeRate || 25))
      });
    });

    filteredMileage.forEach((entry) => {
      entries.push({
        id: `mileage-${entry.id}`,
        type: 'Mileage',
        date: entry.date,
        description: `${entry.miles} miles${entry.purpose ? ` - ${entry.purpose}` : ''}`,
        amount: entry.miles * (config.mileageRate || 0.67)
      });
    });

    filteredExpenses.forEach((entry) => {
      entries.push({
        id: `expense-${entry.id}`,
        type: 'Expense',
        date: entry.date,
        description: `${entry.category}${entry.description ? `: ${entry.description}` : ''}`,
        amount: entry.amount
      });
    });

    // Sort by date descending
    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredHours, filteredMileage, filteredExpenses, config]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Hours':
        return 'primary';
      case 'Mileage':
        return 'secondary';
      case 'Expense':
        return 'warning';
      default:
        return 'default';
    }
  };

  const tableColumns = [
    {
      id: 'date',
      label: 'Date',
      width: 100,
      render: (value) => formatDateDisplay(value)
    },
    {
      id: 'type',
      label: 'Type',
      width: 100,
      render: (value) => (
        <Chip label={value} size="small" color={getTypeColor(value)} variant="outlined" />
      )
    },
    {
      id: 'description',
      label: 'Description'
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right',
      render: (value) => formatCurrency(value)
    }
  ];

  return (
    <div className="summary-page">
      <ViewToggle
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        dateLabel={dateRange.label}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {/* Summary Cards */}
      <div className="summary-page__cards">
        <Paper className="summary-card">
          <div className="summary-card__header">
            <AccessTimeIcon className="summary-card__icon summary-card__icon--hours" />
            <Typography variant="subtitle2">Hours</Typography>
          </div>
          <div className="summary-card__content">
            <div className="summary-card__row">
              <span>Regular ({summary.hours.regular}h × {formatCurrency(config.regularHourlyRate || 21)})</span>
              <span className="summary-card__value">{formatCurrency(summary.hours.regularPay)}</span>
            </div>
            <div className="summary-card__row">
              <span>Overtime ({summary.hours.overtime}h × {formatCurrency(config.overtimeRate || 25)})</span>
              <span className="summary-card__value">{formatCurrency(summary.hours.overtimePay)}</span>
            </div>
            <Divider />
            <div className="summary-card__row summary-card__row--total">
              <span>Total Hours Pay</span>
              <span className="summary-card__value">{formatCurrency(summary.hours.totalPay)}</span>
            </div>
          </div>
        </Paper>

        <Paper className="summary-card">
          <div className="summary-card__header">
            <DirectionsCarIcon className="summary-card__icon summary-card__icon--mileage" />
            <Typography variant="subtitle2">Mileage</Typography>
          </div>
          <div className="summary-card__content">
            <div className="summary-card__row">
              <span>{summary.mileage.totalMiles} miles × {formatCurrency(config.mileageRate || 0.67)}</span>
              <span className="summary-card__value">{formatCurrency(summary.mileage.reimbursement)}</span>
            </div>
          </div>
        </Paper>

        <Paper className="summary-card">
          <div className="summary-card__header">
            <ReceiptIcon className="summary-card__icon summary-card__icon--expenses" />
            <Typography variant="subtitle2">Expenses</Typography>
          </div>
          <div className="summary-card__content">
            <div className="summary-card__row">
              <span>{filteredExpenses.length} expense(s)</span>
              <span className="summary-card__value">{formatCurrency(summary.expenses.total)}</span>
            </div>
          </div>
        </Paper>
      </div>

      {/* Grand Total */}
      <Paper className="summary-page__total">
        <Typography variant="h6">Total Due</Typography>
        <Typography variant="h4" className="summary-page__total-amount">
          {formatCurrency(summary.grandTotal)}
        </Typography>
      </Paper>

      {/* Combined Entries Table */}
      <Box className="summary-page__entries">
        <Typography variant="subtitle1" className="summary-page__entries-title">
          All Entries
        </Typography>
        <DataTable
          columns={tableColumns}
          data={combinedEntries}
          showActions={false}
          emptyMessage="No entries for this period"
        />
      </Box>
    </div>
  );
};

export default SummaryPage;
