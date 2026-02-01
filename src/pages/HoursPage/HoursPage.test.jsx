import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HoursPage from './HoursPage';

describe('HoursPage', () => {
  const mockData = [
    { id: 1, date: '01/15/2024', dayOfMonth: 15, regularHours: 8, overtimeHours: 1, totalHours: 9 },
    { id: 2, date: '01/16/2024', dayOfMonth: 16, regularHours: 6, overtimeHours: 0, totalHours: 6 }
  ];

  const defaultProps = {
    data: mockData,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders data table with entries', () => {
    render(<HoursPage {...defaultProps} />);

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
    expect(screen.getByText('01/16/2024')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<HoursPage {...defaultProps} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('OT')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<HoursPage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add hours/i })).toBeInTheDocument();
  });

  it('opens form when add button clicked', () => {
    render(<HoursPage {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /add hours/i }));
    expect(screen.getByText('Add Hours Entry')).toBeInTheDocument();
  });

  it('opens edit form when edit clicked', () => {
    render(<HoursPage {...defaultProps} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Hours Entry')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<HoursPage {...defaultProps} data={[]} />);

    expect(screen.getByText(/no hours recorded yet/i)).toBeInTheDocument();
  });

  it('shows confirmation before delete', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = vi.fn();

    render(<HoursPage {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
