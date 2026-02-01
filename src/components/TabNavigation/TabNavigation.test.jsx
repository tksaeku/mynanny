import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabNavigation from './TabNavigation';

describe('TabNavigation', () => {
  const defaultProps = {
    activeTab: 'summary',
    onTabChange: vi.fn()
  };

  it('renders all tabs', () => {
    render(<TabNavigation {...defaultProps} />);

    expect(screen.getByRole('tab', { name: /summary/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /hours/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /mileage/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /expenses/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    render(<TabNavigation {...defaultProps} activeTab="hours" />);

    const hoursTab = screen.getByRole('tab', { name: /hours/i });
    expect(hoursTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<TabNavigation {...defaultProps} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /mileage/i }));
    expect(onTabChange).toHaveBeenCalledWith('mileage');
  });
});
