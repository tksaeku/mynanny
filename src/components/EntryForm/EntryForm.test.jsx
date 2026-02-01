import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EntryForm, { FORM_TYPES } from './EntryForm';

describe('EntryForm', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    formType: FORM_TYPES.HOURS
  };

  describe('hours form', () => {
    it('renders hours fields', () => {
      render(<EntryForm {...defaultProps} formType={FORM_TYPES.HOURS} />);

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/regular hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/overtime hours/i)).toBeInTheDocument();
    });

    it('shows Add Hours Entry title for new entry', () => {
      render(<EntryForm {...defaultProps} formType={FORM_TYPES.HOURS} />);

      expect(screen.getByText('Add Hours Entry')).toBeInTheDocument();
    });

    it('shows Edit Hours Entry title for existing entry', () => {
      render(
        <EntryForm
          {...defaultProps}
          formType={FORM_TYPES.HOURS}
          initialData={{ date: '2024-01-15', regularHours: 8, overtimeHours: 0 }}
        />
      );

      expect(screen.getByText('Edit Hours Entry')).toBeInTheDocument();
    });
  });

  describe('mileage form', () => {
    it('renders mileage fields', () => {
      render(<EntryForm {...defaultProps} formType={FORM_TYPES.MILEAGE} />);

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/miles/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/purpose/i)).toBeInTheDocument();
    });
  });

  describe('expenses form', () => {
    it('renders expense fields', () => {
      render(<EntryForm {...defaultProps} formType={FORM_TYPES.EXPENSES} />);

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  describe('notes form', () => {
    it('renders notes fields', () => {
      render(<EntryForm {...defaultProps} formType={FORM_TYPES.NOTES} />);

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      // Use exact match for Note field to avoid matching dialog title
      expect(screen.getByRole('textbox', { name: /note/i })).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with form values', () => {
      const onSubmit = vi.fn();
      render(
        <EntryForm
          {...defaultProps}
          formType={FORM_TYPES.HOURS}
          onSubmit={onSubmit}
        />
      );

      const regularHoursInput = screen.getByLabelText(/regular hours/i);
      fireEvent.change(regularHoursInput, { target: { value: '8' } });

      fireEvent.click(screen.getByRole('button', { name: /add/i }));

      expect(onSubmit).toHaveBeenCalled();
      expect(onSubmit.mock.calls[0][0]).toHaveProperty('regularHours', '8');
    });
  });

  describe('form closing', () => {
    it('calls onClose when cancel clicked', () => {
      const onClose = vi.fn();
      render(<EntryForm {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
