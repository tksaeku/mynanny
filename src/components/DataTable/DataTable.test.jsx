import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from './DataTable';

describe('DataTable', () => {
  const columns = [
    { id: 'date', label: 'Date' },
    { id: 'hours', label: 'Hours', align: 'right' },
    { id: 'note', label: 'Note' }
  ];

  const data = [
    { id: 1, date: '01/15/2024', hours: 8, note: 'Regular day' },
    { id: 2, date: '01/16/2024', hours: 6, note: 'Half day' }
  ];

  const defaultProps = {
    columns,
    data
  };

  it('renders column headers', () => {
    render(<DataTable {...defaultProps} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable {...defaultProps} />);

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Regular day')).toBeInTheDocument();
  });

  it('renders empty message when no data', () => {
    render(<DataTable {...defaultProps} data={[]} emptyMessage="No data" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders edit and delete buttons when handlers provided', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<DataTable {...defaultProps} onEdit={onEdit} onDelete={onDelete} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onEdit with row data when edit clicked', () => {
    const onEdit = vi.fn();
    render(<DataTable {...defaultProps} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });

  it('calls onDelete with row data when delete clicked', () => {
    const onDelete = vi.fn();
    render(<DataTable {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(data[0]);
  });

  it('hides actions column when showActions is false', () => {
    render(<DataTable {...defaultProps} showActions={false} />);

    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('uses custom render function for columns', () => {
    const columnsWithRender = [
      {
        id: 'hours',
        label: 'Hours',
        render: (value) => `${value}h`
      }
    ];

    render(<DataTable columns={columnsWithRender} data={data} />);

    expect(screen.getByText('8h')).toBeInTheDocument();
  });
});
