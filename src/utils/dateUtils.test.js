import { describe, it, expect } from 'vitest';
import {
  formatDateISO,
  formatDateDisplay,
  getDayOfMonth,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  isDateInRange,
  getWeekRangeLabel,
  getMonthLabel,
  getPreviousWeek,
  getNextWeek,
  getPreviousMonth,
  getNextMonth,
  parseDate,
  getToday
} from './dateUtils';

describe('dateUtils', () => {
  describe('formatDateISO', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      expect(formatDateISO(date)).toBe('2024-06-15');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(formatDateISO(date)).toBe('2024-01-05');
    });
  });

  describe('formatDateDisplay', () => {
    it('formats date as MM/DD/YYYY', () => {
      const date = new Date(2024, 5, 15);
      expect(formatDateDisplay(date)).toBe('06/15/2024');
    });

    it('accepts string input in MM/DD/YYYY format', () => {
      expect(formatDateDisplay('06/15/2024')).toBe('06/15/2024');
    });
  });

  describe('getDayOfMonth', () => {
    it('returns the day of month', () => {
      const date = new Date(2024, 5, 15);
      expect(getDayOfMonth(date)).toBe(15);
    });

    it('accepts string input', () => {
      // Use MM/DD/YYYY format to avoid timezone parsing issues
      expect(getDayOfMonth('06/15/2024')).toBe(15);
    });
  });

  describe('getWeekStart', () => {
    it('returns Sunday of the week', () => {
      const wednesday = new Date(2024, 5, 12); // Wednesday, June 12, 2024
      const result = getWeekStart(wednesday);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getDate()).toBe(9);
    });

    it('returns same day if already Sunday', () => {
      const sunday = new Date(2024, 5, 9); // Sunday, June 9, 2024
      const result = getWeekStart(sunday);
      expect(result.getDate()).toBe(9);
    });
  });

  describe('getWeekEnd', () => {
    it('returns Saturday of the week', () => {
      const wednesday = new Date(2024, 5, 12); // Wednesday, June 12, 2024
      const result = getWeekEnd(wednesday);
      expect(result.getDay()).toBe(6); // Saturday
      expect(result.getDate()).toBe(15);
    });
  });

  describe('getMonthStart', () => {
    it('returns the first day of the month', () => {
      const date = new Date(2024, 5, 15);
      const result = getMonthStart(date);
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(5);
    });
  });

  describe('getMonthEnd', () => {
    it('returns the last day of the month', () => {
      const date = new Date(2024, 5, 15); // June 2024
      const result = getMonthEnd(date);
      expect(result.getDate()).toBe(30); // June has 30 days
    });

    it('handles months with 31 days', () => {
      const date = new Date(2024, 6, 15); // July 2024
      const result = getMonthEnd(date);
      expect(result.getDate()).toBe(31);
    });
  });

  describe('isDateInRange', () => {
    const start = new Date(2024, 5, 1);
    const end = new Date(2024, 5, 30);

    it('returns true for date within range', () => {
      const date = new Date(2024, 5, 15);
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('returns true for date at start of range', () => {
      expect(isDateInRange(start, start, end)).toBe(true);
    });

    it('returns true for date at end of range', () => {
      expect(isDateInRange(end, start, end)).toBe(true);
    });

    it('returns false for date outside range', () => {
      const date = new Date(2024, 6, 1);
      expect(isDateInRange(date, start, end)).toBe(false);
    });

    it('accepts string input', () => {
      expect(isDateInRange('2024-06-15', start, end)).toBe(true);
    });
  });

  describe('getWeekRangeLabel', () => {
    it('returns formatted week range', () => {
      const date = new Date(2024, 5, 12); // Wednesday, June 12, 2024
      const label = getWeekRangeLabel(date);
      expect(label).toBe('06/09/2024 - 06/15/2024');
    });
  });

  describe('getMonthLabel', () => {
    it('returns month name and year', () => {
      const date = new Date(2024, 5, 15);
      expect(getMonthLabel(date)).toBe('June 2024');
    });
  });

  describe('getPreviousWeek', () => {
    it('returns date 7 days earlier', () => {
      const date = new Date(2024, 5, 15);
      const result = getPreviousWeek(date);
      expect(result.getDate()).toBe(8);
    });
  });

  describe('getNextWeek', () => {
    it('returns date 7 days later', () => {
      const date = new Date(2024, 5, 15);
      const result = getNextWeek(date);
      expect(result.getDate()).toBe(22);
    });
  });

  describe('getPreviousMonth', () => {
    it('returns date in previous month', () => {
      const date = new Date(2024, 5, 15);
      const result = getPreviousMonth(date);
      expect(result.getMonth()).toBe(4); // May
    });
  });

  describe('getNextMonth', () => {
    it('returns date in next month', () => {
      const date = new Date(2024, 5, 15);
      const result = getNextMonth(date);
      expect(result.getMonth()).toBe(6); // July
    });
  });

  describe('parseDate', () => {
    it('parses MM/DD/YYYY format', () => {
      const result = parseDate('06/15/2024');
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
      expect(result.getFullYear()).toBe(2024);
    });

    it('parses YYYY-MM-DD format', () => {
      const result = parseDate('2024-06-15');
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
      expect(result.getFullYear()).toBe(2024);
    });

    it('returns null for empty string', () => {
      expect(parseDate('')).toBe(null);
    });

    it('returns null for null input', () => {
      expect(parseDate(null)).toBe(null);
    });
  });

  describe('timezone handling - YYYY-MM-DD format parsed as local time', () => {
    it('parseDate does not shift day when parsing YYYY-MM-DD', () => {
      const result = parseDate('2026-01-26');
      expect(result.getDate()).toBe(26);
      expect(result.getMonth()).toBe(0);
      expect(result.getFullYear()).toBe(2026);
    });

    it('formatDateDisplay returns same day for YYYY-MM-DD input', () => {
      const result = formatDateDisplay('2026-01-26');
      expect(result).toBe('01/26/2026');
    });

    it('getDayOfMonth returns correct day for YYYY-MM-DD input', () => {
      expect(getDayOfMonth('2026-01-26')).toBe(26);
      expect(getDayOfMonth('2026-01-01')).toBe(1);
      expect(getDayOfMonth('2026-12-31')).toBe(31);
    });

    it('isDateInRange correctly handles YYYY-MM-DD string dates', () => {
      const start = new Date(2026, 0, 1);
      const end = new Date(2026, 0, 31);

      expect(isDateInRange('2026-01-15', start, end)).toBe(true);
      expect(isDateInRange('2026-01-01', start, end)).toBe(true);
      expect(isDateInRange('2026-01-31', start, end)).toBe(true);
      expect(isDateInRange('2026-02-01', start, end)).toBe(false);
    });

    it('formatDateDisplay round-trips correctly', () => {
      const originalDate = '2026-01-26';
      const displayed = formatDateDisplay(originalDate);
      expect(displayed).toBe('01/26/2026');

      const reparsed = parseDate(displayed);
      expect(reparsed.getDate()).toBe(26);
    });

    it('handles edge case dates near midnight correctly', () => {
      expect(getDayOfMonth('2026-01-01')).toBe(1);
      expect(getDayOfMonth('2026-06-30')).toBe(30);
      expect(getDayOfMonth('2026-12-31')).toBe(31);
    });
  });

  describe('getToday', () => {
    it('returns today with time set to midnight', () => {
      const result = getToday();
      const now = new Date();
      expect(result.getDate()).toBe(now.getDate());
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });
});
