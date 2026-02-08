import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SummaryPage from './SummaryPage';

describe('SummaryPage', () => {
  const mockHours = [
    { id: 1, date: '01/15/2024', regularHours: 8, overtimeHours: 1, totalHours: 9 }
  ];

  const mockMileage = [
    { id: 1, date: '01/15/2024', miles: 20, purpose: 'Park trip' }
  ];

  const mockExpenses = [
    { id: 1, date: '01/15/2024', amount: 25, category: 'Supplies', description: 'Art supplies' }
  ];

  const mockConfig = {
    regularHourlyRate: 21,
    overtimeRate: 25,
    mileageRate: 0.67
  };

  const defaultProps = {
    hours: mockHours,
    mileage: mockMileage,
    expenses: mockExpenses,
    notes: [],
    config: mockConfig
  };

  it('renders view toggle', () => {
    render(<SummaryPage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /^weekly$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bi-weekly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all time/i })).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<SummaryPage {...defaultProps} />);

    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Mileage')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('renders total due section', () => {
    render(<SummaryPage {...defaultProps} />);

    expect(screen.getByText('Total Due')).toBeInTheDocument();
  });

  it('renders entries table', () => {
    render(<SummaryPage {...defaultProps} />);

    expect(screen.getByText('All Entries')).toBeInTheDocument();
  });

  it('changes view mode when toggle clicked', () => {
    render(<SummaryPage {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /monthly/i }));

    const monthlyButton = screen.getByRole('button', { name: /monthly/i });
    expect(monthlyButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows navigation buttons in weekly mode', () => {
    render(<SummaryPage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('hides navigation buttons in historical mode', () => {
    render(<SummaryPage {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /all time/i }));

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('shows empty message when no entries', () => {
    render(<SummaryPage hours={[]} mileage={[]} expenses={[]} notes={[]} config={mockConfig} />);

    expect(screen.getByText('No entries for this period')).toBeInTheDocument();
  });
});
