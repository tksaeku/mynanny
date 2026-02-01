import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormDialog from './FormDialog';

describe('FormDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Dialog',
    onSubmit: vi.fn(),
    children: <div>Form content</div>
  };

  it('renders title', () => {
    render(<FormDialog {...defaultProps} />);

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<FormDialog {...defaultProps} />);

    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('renders submit button with custom label', () => {
    render(<FormDialog {...defaultProps} submitLabel="Add Entry" />);

    expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument();
  });

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(<FormDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close icon clicked', () => {
    const onClose = vi.fn();
    render(<FormDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSubmit when form submitted', () => {
    const onSubmit = vi.fn();
    render(<FormDialog {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('disables buttons when isSubmitting', () => {
    render(<FormDialog {...defaultProps} isSubmitting={true} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('does not render when closed', () => {
    render(<FormDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });
});
