import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MileagePage from './MileagePage';

describe('MileagePage', () => {
  const mockData = [
    { id: 1, date: '01/15/2024', miles: 25.5, purpose: 'Grocery run' },
    { id: 2, date: '01/16/2024', miles: 10, purpose: 'Park trip' }
  ];

  const defaultProps = {
    data: mockData,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders data table with entries', () => {
    render(<MileagePage {...defaultProps} />);

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
    expect(screen.getByText('Grocery run')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<MileagePage {...defaultProps} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Miles')).toBeInTheDocument();
    expect(screen.getByText('Purpose')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<MileagePage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add mileage/i })).toBeInTheDocument();
  });

  it('opens form when add button clicked', () => {
    render(<MileagePage {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /add mileage/i }));
    expect(screen.getByText('Add Mileage Entry')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<MileagePage {...defaultProps} data={[]} />);

    expect(screen.getByText(/no mileage recorded yet/i)).toBeInTheDocument();
  });
});
