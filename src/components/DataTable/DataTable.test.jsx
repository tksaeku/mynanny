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

  describe('sorting', () => {
    const sortableColumns = [
      { id: 'date', label: 'Date', type: 'date', sortable: true },
      { id: 'hours', label: 'Hours', type: 'number', sortable: true, align: 'right' },
      { id: 'note', label: 'Note' }
    ];

    const sortableData = [
      { id: 1, date: '01/15/2024', hours: 8, note: 'Day A' },
      { id: 2, date: '01/16/2024', hours: 6, note: 'Day B' },
      { id: 3, date: '01/14/2024', hours: 10, note: 'Day C' }
    ];

    it('renders sort labels for sortable columns', () => {
      render(<DataTable columns={sortableColumns} data={sortableData} showActions={false} />);

      const dateHeader = screen.getByText('Date');
      const hoursHeader = screen.getByText('Hours');
      const noteHeader = screen.getByText('Note');

      expect(dateHeader.closest('span')).toHaveClass('MuiTableSortLabel-root');
      expect(hoursHeader.closest('span')).toHaveClass('MuiTableSortLabel-root');
      // Note column is not sortable, so it should not have a TableSortLabel wrapper
      expect(noteHeader.closest('span.MuiTableSortLabel-root')).toBeNull();
    });

    it('sorts data ascending when sortable column clicked', () => {
      render(<DataTable columns={sortableColumns} data={sortableData} showActions={false} />);

      fireEvent.click(screen.getByText('Hours'));

      const rows = screen.getAllByRole('row');
      // First row is header, data starts at index 1
      expect(rows[1]).toHaveTextContent('6'); // 6 hours (lowest)
      expect(rows[2]).toHaveTextContent('8'); // 8 hours
      expect(rows[3]).toHaveTextContent('10'); // 10 hours (highest)
    });

    it('toggles sort direction when same column clicked twice', () => {
      render(<DataTable columns={sortableColumns} data={sortableData} showActions={false} />);

      // First click - ascending
      fireEvent.click(screen.getByText('Hours'));
      let rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('6');

      // Second click - descending
      fireEvent.click(screen.getByText('Hours'));
      rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('10');
    });

    it('applies default sort on initial render', () => {
      render(
        <DataTable
          columns={sortableColumns}
          data={sortableData}
          showActions={false}
          defaultSort={{ column: 'hours', direction: 'desc' }}
        />
      );

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('10'); // Highest hours first
      expect(rows[3]).toHaveTextContent('6'); // Lowest hours last
    });

    it('sorts dates correctly', () => {
      render(
        <DataTable
          columns={sortableColumns}
          data={sortableData}
          showActions={false}
          defaultSort={{ column: 'date', direction: 'asc' }}
        />
      );

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('01/14/2024'); // Earliest date first
      expect(rows[3]).toHaveTextContent('01/16/2024'); // Latest date last
    });
  });
});
