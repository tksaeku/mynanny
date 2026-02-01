import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HoursPage from './HoursPage';

describe('HoursPage', () => {
  const mockData = [
    { id: 1, date: '01/15/2024', dayOfMonth: 15, regularHours: 8, overtimeHours: 1, totalHours: 9 },
    { id: 2, date: '01/16/2024', dayOfMonth: 16, regularHours: 6, overtimeHours: 0, totalHours: 6 }
  ];

  const createDefaultProps = () => ({
    data: mockData,
    onAdd: vi.fn().mockResolvedValue(undefined),
    onEdit: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined)
  });

  it('renders data table with entries', () => {
    render(<HoursPage {...createDefaultProps()} />);

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
    expect(screen.getByText('01/16/2024')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<HoursPage {...createDefaultProps()} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('OT')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<HoursPage {...createDefaultProps()} />);

    expect(screen.getByRole('button', { name: /add hours/i })).toBeInTheDocument();
  });

  it('opens form when add button clicked', () => {
    render(<HoursPage {...createDefaultProps()} />);

    fireEvent.click(screen.getByRole('button', { name: /add hours/i }));
    expect(screen.getByText('Add Hours Entry')).toBeInTheDocument();
  });

  it('opens edit form when edit clicked', () => {
    render(<HoursPage {...createDefaultProps()} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Hours Entry')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<HoursPage {...createDefaultProps()} data={[]} />);

    expect(screen.getByText(/no hours recorded yet/i)).toBeInTheDocument();
  });

  it('shows confirmation before delete', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const props = createDefaultProps();

    render(<HoursPage {...props} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(props.onDelete).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  describe('callback functions', () => {
    it('calls onAdd when form is submitted for new entry', async () => {
      const props = createDefaultProps();
      render(<HoursPage {...props} />);

      fireEvent.click(screen.getByRole('button', { name: /add hours/i }));

      const dateInput = screen.getByLabelText(/date/i);
      const regularHoursInput = screen.getByLabelText(/regular hours/i);

      fireEvent.change(dateInput, { target: { value: '2024-01-20' } });
      fireEvent.change(regularHoursInput, { target: { value: '8' } });

      fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

      await waitFor(() => {
        expect(props.onAdd).toHaveBeenCalledTimes(1);
        expect(props.onAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            date: '2024-01-20',
            regularHours: 8
          })
        );
      });
    });

    it('calls onEdit when form is submitted for existing entry', async () => {
      const props = createDefaultProps();
      render(<HoursPage {...props} />);

      // Data is sorted by date descending, so first row is id:2 (01/16), second is id:1 (01/15)
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[1]); // Click edit on second row (id:1)

      await waitFor(() => {
        expect(screen.getByText('Edit Hours Entry')).toBeInTheDocument();
      });

      const regularHoursInput = screen.getByLabelText(/regular hours/i);
      fireEvent.change(regularHoursInput, { target: { value: '10' } });

      fireEvent.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        expect(props.onEdit).toHaveBeenCalledTimes(1);
        expect(props.onEdit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            regularHours: 10
          })
        );
      });
    });

    it('calls onDelete when delete is confirmed', async () => {
      const props = createDefaultProps();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<HoursPage {...props} />);

      // Data is sorted by date descending, so first row is id:2 (01/16)
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(props.onDelete).toHaveBeenCalledTimes(1);
        expect(props.onDelete).toHaveBeenCalledWith(
          expect.objectContaining({ id: 2 })
        );
      });

      vi.restoreAllMocks();
    });

    it('does not call onDelete when delete is cancelled', () => {
      const props = createDefaultProps();
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<HoursPage {...props} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      expect(props.onDelete).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('does not call onAdd when form is cancelled', () => {
      const props = createDefaultProps();
      render(<HoursPage {...props} />);

      fireEvent.click(screen.getByRole('button', { name: /add hours/i }));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(props.onAdd).not.toHaveBeenCalled();
    });
  });
});
