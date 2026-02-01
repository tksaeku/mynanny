import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SHEET_TABS,
  fetchHours,
  fetchMileage,
  fetchExpenses,
  fetchNotes,
  fetchConfig,
  fetchAllData
} from './googleSheets';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('googleSheets service', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('SHEET_TABS', () => {
    it('has correct tab names', () => {
      expect(SHEET_TABS.HOURS).toBe('Hours');
      expect(SHEET_TABS.MILEAGE).toBe('Mileage');
      expect(SHEET_TABS.EXPENSES).toBe('Expenses');
      expect(SHEET_TABS.NOTES).toBe('Notes');
      expect(SHEET_TABS.CONFIG).toBe('Config');
    });
  });

  describe('fetchHours', () => {
    it('parses hours data correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          values: [
            ['Date', 'Day of Month', 'Regular Hours', 'Overtime', 'Total Hours'],
            ['01/15/2024', '15', '8', '1', '9'],
            ['01/16/2024', '16', '6', '0', '6']
          ]
        })
      });

      const result = await fetchHours();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 2,
        date: '01/15/2024',
        dayOfMonth: 15,
        regularHours: 8,
        overtimeHours: 1,
        totalHours: 9
      });
    });

    it('handles empty sheet', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ values: [] })
      });

      const result = await fetchHours();
      expect(result).toEqual([]);
    });

    it('handles header-only sheet', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          values: [['Date', 'Day of Month', 'Regular Hours', 'Overtime', 'Total Hours']]
        })
      });

      const result = await fetchHours();
      expect(result).toEqual([]);
    });
  });

  describe('fetchMileage', () => {
    it('parses mileage data correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          values: [
            ['Date', 'Miles', 'Purpose'],
            ['01/15/2024', '25.5', 'Grocery run']
          ]
        })
      });

      const result = await fetchMileage();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 2,
        date: '01/15/2024',
        miles: 25.5,
        purpose: 'Grocery run'
      });
    });
  });

  describe('fetchExpenses', () => {
    it('parses expense data correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          values: [
            ['Date', 'Amount', 'Category', 'Description'],
            ['01/15/2024', '25.99', 'Supplies', 'Art supplies for kids']
          ]
        })
      });

      const result = await fetchExpenses();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 2,
        date: '01/15/2024',
        amount: 25.99,
        category: 'Supplies',
        description: 'Art supplies for kids'
      });
    });
  });

  describe('fetchNotes', () => {
    it('parses notes data correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          values: [
            ['Date', 'Category', 'Note'],
            ['01/15/2024', 'General', 'Kids had a great day']
          ]
        })
      });

      const result = await fetchNotes();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 2,
        date: '01/15/2024',
        category: 'General',
        note: 'Kids had a great day'
      });
    });
  });

  describe('fetchConfig', () => {
    it('parses config data correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          values: [
            ['Setting', 'Value'],
            ['Regular Hourly Rate', '22'],
            ['Overtime Rate', '30'],
            ['Mileage Rate', '0.70']
          ]
        })
      });

      const result = await fetchConfig();

      expect(result).toEqual({
        regularHourlyRate: 22,
        overtimeRate: 30,
        mileageRate: 0.70
      });
    });

    it('uses defaults for missing values', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ values: [] })
      });

      const result = await fetchConfig();

      expect(result).toEqual({
        regularHourlyRate: 21,
        overtimeRate: 25,
        mileageRate: 0.67
      });
    });
  });

  describe('fetchAllData', () => {
    it('fetches all sheets in parallel', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ values: [] })
      });

      const result = await fetchAllData();

      expect(result).toHaveProperty('hours');
      expect(result).toHaveProperty('mileage');
      expect(result).toHaveProperty('expenses');
      expect(result).toHaveProperty('notes');
      expect(result).toHaveProperty('config');
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('error handling', () => {
    it('throws error on fetch failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(fetchHours()).rejects.toThrow('Failed to fetch Hours: Not Found');
    });
  });
});
