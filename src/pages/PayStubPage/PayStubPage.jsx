import { useState, useMemo } from 'react';
import { Paper, Typography, Divider, Button } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PrintIcon from '@mui/icons-material/Print';
import ViewToggle from '../../components/ViewToggle';
import { VIEW_MODES } from '../../constants';
import {
  getWeekStart,
  getWeekEnd,
  getBiweeklyStart,
  getBiweeklyEnd,
  getBiweeklyRangeLabel,
  getPreviousBiweek,
  getNextBiweek,
  getMonthStart,
  getMonthEnd,
  getWeekRangeLabel,
  getMonthLabel,
  getPreviousWeek,
  getNextWeek,
  getPreviousMonth,
  getNextMonth,
  isDateInRange,
  parseDate
} from '../../utils/dateUtils';
import { calculatePeriodSummary, formatCurrency } from '../../utils/calculations';
import './PayStubPage.scss';

const nannyName = import.meta.env.VITE_NANNY_NAME || '';
const nannyLastFour = import.meta.env.VITE_NANNY_LAST_FOUR || '';
const nannyAddress = import.meta.env.VITE_NANNY_ADDRESS || '';

const employeeInfo = [
  { label: 'Employee Name',       value: nannyName,                    maskedValue: nannyName },
  { label: 'Employee SSN',        value: `XXX-XX-${nannyLastFour}`,    maskedValue: '****' },
  { label: 'Employee Address',    value: nannyAddress,                 maskedValue: '****' },
];

const PayStubPage = ({
  hours = [],
  mileage = [],
  expenses = [],
  pto = [],
  config = {},
  withholdings = [],
  employer = []
}) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.WEEKLY);
  const [currentDate, setCurrentDate] = useState(new Date());

  const dateRange = useMemo(() => {
    switch (viewMode) {
      case VIEW_MODES.WEEKLY:
        return {
          start: getWeekStart(currentDate),
          end: getWeekEnd(currentDate),
          label: getWeekRangeLabel(currentDate)
        };
      case VIEW_MODES.BIWEEKLY:
        return {
          start: getBiweeklyStart(currentDate),
          end: getBiweeklyEnd(currentDate),
          label: getBiweeklyRangeLabel(currentDate)
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
  const filteredPTO = useMemo(() => filterByDateRange(pto), [pto, dateRange]);

  const summary = useMemo(() => {
    return calculatePeriodSummary(
      {
        hoursEntries: filteredHours,
        mileageEntries: filteredMileage,
        expenseEntries: filteredExpenses,
        ptoEntries: filteredPTO
      },
      config,
      withholdings
    );
  }, [filteredHours, filteredMileage, filteredExpenses, filteredPTO, config, withholdings]);

  const handlePrevious = () => {
    if (viewMode === VIEW_MODES.WEEKLY) {
      setCurrentDate(getPreviousWeek(currentDate));
    } else if (viewMode === VIEW_MODES.BIWEEKLY) {
      setCurrentDate(getPreviousBiweek(currentDate));
    } else if (viewMode === VIEW_MODES.MONTHLY) {
      setCurrentDate(getPreviousMonth(currentDate));
    }
  };

  const handleNext = () => {
    if (viewMode === VIEW_MODES.WEEKLY) {
      setCurrentDate(getNextWeek(currentDate));
    } else if (viewMode === VIEW_MODES.BIWEEKLY) {
      setCurrentDate(getNextBiweek(currentDate));
    } else if (viewMode === VIEW_MODES.MONTHLY) {
      setCurrentDate(getNextMonth(currentDate));
    }
  };

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    setCurrentDate(new Date());
  };

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  const hasWithholdings = summary.withholdings.items.length > 0;

  return (
    <div className="pay-stub-page">
      <ViewToggle
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        dateLabel={dateRange.label}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <Paper className="pay-stub">
        <div className="pay-stub__header">
          <AccountBalanceIcon className="pay-stub__icon" />
          <Typography variant="subtitle2">Pay Stub</Typography>
        </div>

        {(employer.length > 0 || nannyName) && (
          <>
            <div className="pay-stub__info-header">
              {employer.length > 0 && (
                <div className="pay-stub__info-column">
                  <Typography className="pay-stub__section-label">Employer</Typography>
                  {employer.map((item) => (
                    <div className="pay-stub__info-row" key={item.label}>
                      <span className="pay-stub__info-label">{item.label}</span>
                      <span className="pay-stub__info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {nannyName && (
                <div className="pay-stub__info-column">
                  <Typography className="pay-stub__section-label">Employee</Typography>
                  {employeeInfo.map((item) => (
                    <div className="pay-stub__info-row" key={item.label}>
                      <span className="pay-stub__info-label">{item.label}</span>
                      <span className="pay-stub__info-value pay-stub__info-value--masked">{item.maskedValue}</span>
                      <span className="pay-stub__info-value pay-stub__info-value--unmasked">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Divider />
          </>
        )}

        <div className="pay-stub__period-info">
          <div className="pay-stub__period-item">
            <span className="pay-stub__info-label">Pay Period</span>
            <span className="pay-stub__info-value">{dateRange.label}</span>
          </div>
          <div className="pay-stub__period-item">
            <span className="pay-stub__info-label">Pay Date</span>
            <span className="pay-stub__info-value">{today}</span>
          </div>
        </div>

        <Divider />

        <div className="pay-stub__section">
          <Typography className="pay-stub__section-label">Gross Taxable Income</Typography>
          <div className="pay-stub__row">
            <span>Hours Pay</span>
            <span className="pay-stub__value">{formatCurrency(summary.hours.totalPay)}</span>
          </div>
          {summary.pto.totalPay > 0 && (
            <div className="pay-stub__row">
              <span>PTO Pay</span>
              <span className="pay-stub__value">{formatCurrency(summary.pto.totalPay)}</span>
            </div>
          )}
          <Divider />
          <div className="pay-stub__row pay-stub__row--subtotal">
            <span>Subtotal</span>
            <span className="pay-stub__value">{formatCurrency(summary.withholdings.grossTaxableIncome)}</span>
          </div>
        </div>

        {hasWithholdings && (
          <div className="pay-stub__section">
            <Typography className="pay-stub__section-label">Withholdings</Typography>
            {summary.withholdings.items.map((item) => (
              <div className="pay-stub__row" key={item.name}>
                <span>{item.name} ({item.percentage}%)</span>
                <span className="pay-stub__value pay-stub__value--deduction">-{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <Divider />
            <div className="pay-stub__row pay-stub__row--subtotal">
              <span>Total Withholdings</span>
              <span className="pay-stub__value pay-stub__value--deduction">-{formatCurrency(summary.withholdings.totalWithholdings)}</span>
            </div>
          </div>
        )}

        {summary.withholdings.totalReimbursements > 0 && (
          <div className="pay-stub__section">
            <Typography className="pay-stub__section-label">Reimbursements</Typography>
            {summary.mileage.reimbursement > 0 && (
              <div className="pay-stub__row">
                <span>Mileage</span>
                <span className="pay-stub__value">{formatCurrency(summary.mileage.reimbursement)}</span>
              </div>
            )}
            {summary.expenses.total > 0 && (
              <div className="pay-stub__row">
                <span>Expenses</span>
                <span className="pay-stub__value">{formatCurrency(summary.expenses.total)}</span>
              </div>
            )}
            <Divider />
            <div className="pay-stub__row pay-stub__row--subtotal">
              <span>Total Reimbursements</span>
              <span className="pay-stub__value">{formatCurrency(summary.withholdings.totalReimbursements)}</span>
            </div>
          </div>
        )}

        <div className="pay-stub__net-pay">
          <span>Net Pay</span>
          <span className="pay-stub__net-pay-amount">{formatCurrency(summary.grandTotal)}</span>
        </div>
      </Paper>

      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        onClick={handlePrint}
        fullWidth
        className="pay-stub-page__print-button"
      >
        Print Pay Stub
      </Button>
    </div>
  );
};

export default PayStubPage;
