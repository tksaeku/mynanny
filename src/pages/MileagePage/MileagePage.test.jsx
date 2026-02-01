import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MileagePage from './MileagePage';

describe('MileagePage', () => {
  const mockData = [
    { id: 1, date: '01/15/2024', miles: 25.5, purpose: 'Grocery run' },
    { id: 2, date: '01/16/2024', miles: 10, purpose: 'Park trip' }
  ];

  const createDefaultProps = () => ({
    data: mockData,
    onAdd: vi.fn().mockResolvedValue(undefined),
    onEdit: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined)
  });

  it('renders data table with entries', () => {
    render(<MileagePage {...createDefaultProps()} />);

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
    expect(screen.getByText('Grocery run')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<MileagePage {...createDefaultProps()} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Miles')).toBeInTheDocument();
    expect(screen.getByText('Purpose')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<MileagePage {...createDefaultProps()} />);

    expect(screen.getByRole('button', { name: /add mileage/i })).toBeInTheDocument();
  });

  it('opens form when add button clicked', () => {
    render(<MileagePage {...createDefaultProps()} />);

    fireEvent.click(screen.getByRole('button', { name: /add mileage/i }));
    expect(screen.getByText('Add Mileage Entry')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<MileagePage {...createDefaultProps()} data={[]} />);

    expect(screen.getByText(/no mileage recorded yet/i)).toBeInTheDocument();
  });

  describe('callback functions', () => {
    it('calls onAdd when form is submitted for new entry', async () => {
      const props = createDefaultProps();
      render(<MileagePage {...props} />);

      fireEvent.click(screen.getByRole('button', { name: /add mileage/i }));

      const dateInput = screen.getByLabelText(/date/i);
      const milesInput = screen.getByLabelText(/miles/i);
      const purposeInput = screen.getByLabelText(/purpose/i);

      fireEvent.change(dateInput, { target: { value: '2024-01-20' } });
      fireEvent.change(milesInput, { target: { value: '15.5' } });
      fireEvent.change(purposeInput, { target: { value: 'Test purpose' } });

      fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

      await waitFor(() => {
        expect(props.onAdd).toHaveBeenCalledTimes(1);
        expect(props.onAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            date: '2024-01-20',
            miles: 15.5,
            purpose: 'Test purpose'
          })
        );
      });
    });

    it('calls onEdit when form is submitted for existing entry', async () => {
      const props = createDefaultProps();
      render(<MileagePage {...props} />);

      // Data is sorted by date descending, so first row is id:2 (01/16), second is id:1 (01/15)
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[1]); // Click edit on second row (id:1)

      await waitFor(() => {
        expect(screen.getByText('Edit Mileage Entry')).toBeInTheDocument();
      });

      const milesInput = screen.getByLabelText(/miles/i);
      fireEvent.change(milesInput, { target: { value: '30' } });

      fireEvent.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        expect(props.onEdit).toHaveBeenCalledTimes(1);
        expect(props.onEdit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            miles: 30
          })
        );
      });
    });

    it('calls onDelete when delete is confirmed', async () => {
      const props = createDefaultProps();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<MileagePage {...props} />);

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

    it('does not call onDelete when delete is cancelled', async () => {
      const props = createDefaultProps();
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<MileagePage {...props} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      expect(props.onDelete).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('does not call onAdd when form is cancelled', () => {
      const props = createDefaultProps();
      render(<MileagePage {...props} />);

      fireEvent.click(screen.getByRole('button', { name: /add mileage/i }));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(props.onAdd).not.toHaveBeenCalled();
    });
  });
});
