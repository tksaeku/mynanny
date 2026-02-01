import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggle, { VIEW_MODES } from './ViewToggle';

describe('ViewToggle', () => {
  const defaultProps = {
    viewMode: VIEW_MODES.WEEKLY,
    onViewModeChange: vi.fn(),
    dateLabel: '01/01/2024 - 01/07/2024',
    onPrevious: vi.fn(),
    onNext: vi.fn()
  };

  it('renders all view mode buttons', () => {
    render(<ViewToggle {...defaultProps} />);

    expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all time/i })).toBeInTheDocument();
  });

  it('highlights active view mode', () => {
    render(<ViewToggle {...defaultProps} viewMode={VIEW_MODES.MONTHLY} />);

    const monthlyButton = screen.getByRole('button', { name: /monthly/i });
    expect(monthlyButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onViewModeChange when view mode clicked', () => {
    const onViewModeChange = vi.fn();
    render(<ViewToggle {...defaultProps} onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByRole('button', { name: /monthly/i }));
    expect(onViewModeChange).toHaveBeenCalledWith(VIEW_MODES.MONTHLY);
  });

  it('renders date label', () => {
    render(<ViewToggle {...defaultProps} />);

    expect(screen.getByText('01/01/2024 - 01/07/2024')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<ViewToggle {...defaultProps} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('calls onPrevious when previous clicked', () => {
    const onPrevious = vi.fn();
    render(<ViewToggle {...defaultProps} onPrevious={onPrevious} />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPrevious).toHaveBeenCalled();
  });

  it('calls onNext when next clicked', () => {
    const onNext = vi.fn();
    render(<ViewToggle {...defaultProps} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('hides navigation in historical mode', () => {
    render(<ViewToggle {...defaultProps} viewMode={VIEW_MODES.HISTORICAL} />);

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('hides navigation when canNavigate is false', () => {
    render(<ViewToggle {...defaultProps} canNavigate={false} />);

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });
});
