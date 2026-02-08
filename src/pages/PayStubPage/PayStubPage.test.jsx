import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PayStubPage from './PayStubPage';

// Mock env vars
vi.stubEnv('VITE_NANNY_NAME', 'Jane Doe');
vi.stubEnv('VITE_NANNY_LAST_FOUR', '5678');
vi.stubEnv('VITE_NANNY_ADDRESS', '123 Main St, Seattle, WA');

describe('PayStubPage', () => {
  const mockEmployer = [
    { label: 'Employer Name', value: 'Acme Corp' },
    { label: 'EIN', value: '12-3456789' },
    { label: 'Address', value: '456 Business Ave' }
  ];

  const mockConfig = {
    regularHourlyRate: 21,
    overtimeRate: 25,
    mileageRate: 0.67,
    ptoAccrualHours: 40
  };

  const mockWithholdings = [
    { name: 'Social Security', percentage: 6.2 },
    { name: 'Medicare', percentage: 1.45 }
  ];

  const defaultProps = {
    hours: [],
    mileage: [],
    expenses: [],
    pto: [],
    config: mockConfig,
    withholdings: mockWithholdings,
    employer: mockEmployer
  };

  it('renders employer info section', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByText('Employer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('12-3456789')).toBeInTheDocument();
    expect(screen.getByText('456 Business Ave')).toBeInTheDocument();
  });

  it('renders employee section label', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByText('Employee')).toBeInTheDocument();
  });

  it('renders employee info labels', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByText('Employee Name')).toBeInTheDocument();
    expect(screen.getByText('Employee SSN')).toBeInTheDocument();
    expect(screen.getByText('Employee Address')).toBeInTheDocument();
  });

  it('renders masked values for sensitive fields', () => {
    render(<PayStubPage {...defaultProps} />);

    const maskedValues = screen.getAllByText('****');
    expect(maskedValues.length).toBe(2); // SSN, address masked
  });

  it('renders pay period and pay date labels', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByText('Pay Period')).toBeInTheDocument();
    expect(screen.getByText('Pay Date')).toBeInTheDocument();
  });

  it('renders print button', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /print pay stub/i })).toBeInTheDocument();
  });

  it('calls window.print when print button clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<PayStubPage {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /print pay stub/i }));

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('renders view toggle', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /^weekly$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bi-weekly/i })).toBeInTheDocument();
  });

  it('renders pay stub header', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByText('Pay Stub')).toBeInTheDocument();
  });

  it('renders without employer data gracefully', () => {
    render(<PayStubPage {...defaultProps} employer={[]} />);

    expect(screen.queryByText('Employer')).not.toBeInTheDocument();
    // Employee section should still render since env vars are set
    expect(screen.getByText('Employee')).toBeInTheDocument();
  });

  it('renders net pay section', () => {
    render(<PayStubPage {...defaultProps} />);

    expect(screen.getByText('Net Pay')).toBeInTheDocument();
  });
});
