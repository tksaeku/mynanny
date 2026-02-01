import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotesPage from './NotesPage';

describe('NotesPage', () => {
  const mockData = [
    { id: 1, date: '01/15/2024', category: 'General', note: 'Kids had a great day!' },
    { id: 2, date: '01/16/2024', category: 'Milestone', note: 'First steps!' }
  ];

  const defaultProps = {
    data: mockData,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders data table with entries', () => {
    render(<NotesPage {...defaultProps} />);

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
    expect(screen.getByText('Kids had a great day!')).toBeInTheDocument();
  });

  it('renders category chips', () => {
    render(<NotesPage {...defaultProps} />);

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Milestone')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<NotesPage {...defaultProps} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<NotesPage {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
  });

  it('opens form when add button clicked', () => {
    render(<NotesPage {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /add note/i }));
    expect(screen.getByText('Add Note')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<NotesPage {...defaultProps} data={[]} />);

    expect(screen.getByText(/no notes recorded yet/i)).toBeInTheDocument();
  });
});
