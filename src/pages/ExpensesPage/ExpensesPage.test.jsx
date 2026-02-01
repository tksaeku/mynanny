import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpensesPage from './ExpensesPage';

describe('ExpensesPage', () => {
  const mockData = [
    { id: 1, date: '01/15/2024', amount: 25.99, category: 'Supplies', description: 'Art supplies' },
    { id: 2, date: '01/16/2024', amount: 12.50, category: 'Food', description: 'Snacks' }
  ];

  const defaultProps = {
    data: mockData,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders data table with entries', () => {
    render(<ExpensesPage {...defaultProps} />);

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('Supplies')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<ExpensesPage {...defaultProps} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<ExpensesPage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument();
  });

  it('opens form when add button clicked', () => {
    render(<ExpensesPage {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /add expense/i }));
    expect(screen.getByText('Add Expense Entry')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<ExpensesPage {...defaultProps} data={[]} />);

    expect(screen.getByText(/no expenses recorded yet/i)).toBeInTheDocument();
  });
});
