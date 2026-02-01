import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RATES,
  calculateTotalHours,
  calculateHoursPay,
  calculateMileageReimbursement,
  sumHoursEntries,
  sumMileageEntries,
  sumExpenseEntries,
  calculatePeriodSummary,
  formatCurrency,
  formatNumber,
  parseCurrency
} from './calculations';

describe('calculations', () => {
  describe('DEFAULT_RATES', () => {
    it('has correct default values', () => {
      expect(DEFAULT_RATES.regularHourlyRate).toBe(21);
      expect(DEFAULT_RATES.overtimeRate).toBe(25);
      expect(DEFAULT_RATES.mileageRate).toBe(0.67);
    });
  });

  describe('calculateTotalHours', () => {
    it('sums regular and overtime hours', () => {
      expect(calculateTotalHours(8, 2)).toBe(10);
    });

    it('handles zero values', () => {
      expect(calculateTotalHours(8, 0)).toBe(8);
      expect(calculateTotalHours(0, 2)).toBe(2);
    });

    it('handles null/undefined values', () => {
      expect(calculateTotalHours(null, 2)).toBe(2);
      expect(calculateTotalHours(8, undefined)).toBe(8);
    });
  });

  describe('calculateHoursPay', () => {
    it('calculates pay with default rates', () => {
      const result = calculateHoursPay(8, 2);
      expect(result.regularPay).toBe(168); // 8 * 21
      expect(result.overtimePay).toBe(50); // 2 * 25
      expect(result.totalPay).toBe(218);
    });

    it('calculates pay with custom rates', () => {
      const result = calculateHoursPay(8, 2, 20, 30);
      expect(result.regularPay).toBe(160);
      expect(result.overtimePay).toBe(60);
      expect(result.totalPay).toBe(220);
    });

    it('handles zero hours', () => {
      const result = calculateHoursPay(0, 0);
      expect(result.totalPay).toBe(0);
    });
  });

  describe('calculateMileageReimbursement', () => {
    it('calculates reimbursement with default rate', () => {
      expect(calculateMileageReimbursement(100)).toBe(67); // 100 * 0.67
    });

    it('calculates reimbursement with custom rate', () => {
      expect(calculateMileageReimbursement(100, 0.50)).toBe(50);
    });

    it('handles zero miles', () => {
      expect(calculateMileageReimbursement(0)).toBe(0);
    });
  });

  describe('sumHoursEntries', () => {
    it('sums multiple entries', () => {
      const entries = [
        { regularHours: 8, overtimeHours: 1 },
        { regularHours: 6, overtimeHours: 2 },
        { regularHours: 8, overtimeHours: 0 }
      ];
      const result = sumHoursEntries(entries);
      expect(result.totalRegularHours).toBe(22);
      expect(result.totalOvertimeHours).toBe(3);
      expect(result.totalHours).toBe(25);
    });

    it('handles empty array', () => {
      const result = sumHoursEntries([]);
      expect(result.totalHours).toBe(0);
    });
  });

  describe('sumMileageEntries', () => {
    it('sums multiple entries', () => {
      const entries = [
        { miles: 15 },
        { miles: 20 },
        { miles: 10 }
      ];
      expect(sumMileageEntries(entries)).toBe(45);
    });

    it('handles empty array', () => {
      expect(sumMileageEntries([])).toBe(0);
    });
  });

  describe('sumExpenseEntries', () => {
    it('sums multiple entries', () => {
      const entries = [
        { amount: 25.50 },
        { amount: 12.00 },
        { amount: 8.75 }
      ];
      expect(sumExpenseEntries(entries)).toBeCloseTo(46.25);
    });

    it('handles empty array', () => {
      expect(sumExpenseEntries([])).toBe(0);
    });
  });

  describe('calculatePeriodSummary', () => {
    it('calculates complete summary', () => {
      const data = {
        hoursEntries: [
          { regularHours: 8, overtimeHours: 1 },
          { regularHours: 8, overtimeHours: 0 }
        ],
        mileageEntries: [
          { miles: 20 },
          { miles: 15 }
        ],
        expenseEntries: [
          { amount: 25 },
          { amount: 10 }
        ]
      };

      const result = calculatePeriodSummary(data);

      expect(result.hours.regular).toBe(16);
      expect(result.hours.overtime).toBe(1);
      expect(result.hours.total).toBe(17);
      expect(result.hours.regularPay).toBe(336); // 16 * 21
      expect(result.hours.overtimePay).toBe(25); // 1 * 25
      expect(result.hours.totalPay).toBe(361);

      expect(result.mileage.totalMiles).toBe(35);
      expect(result.mileage.reimbursement).toBeCloseTo(23.45); // 35 * 0.67

      expect(result.expenses.total).toBe(35);

      expect(result.grandTotal).toBeCloseTo(419.45); // 361 + 23.45 + 35
    });

    it('handles empty data', () => {
      const result = calculatePeriodSummary({});
      expect(result.grandTotal).toBe(0);
    });

    it('uses custom rates', () => {
      const data = {
        hoursEntries: [{ regularHours: 10, overtimeHours: 0 }],
        mileageEntries: [{ miles: 10 }],
        expenseEntries: []
      };
      const customRates = {
        regularHourlyRate: 25,
        overtimeRate: 35,
        mileageRate: 0.50
      };

      const result = calculatePeriodSummary(data, customRates);
      expect(result.hours.regularPay).toBe(250); // 10 * 25
      expect(result.mileage.reimbursement).toBe(5); // 10 * 0.50
    });
  });

  describe('formatCurrency', () => {
    it('formats positive amounts', () => {
      expect(formatCurrency(123.45)).toBe('$123.45');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats large amounts with commas', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatNumber', () => {
    it('formats to 2 decimal places', () => {
      expect(formatNumber(123.456)).toBe('123.46');
      expect(formatNumber(123)).toBe('123.00');
    });
  });

  describe('parseCurrency', () => {
    it('parses currency string', () => {
      expect(parseCurrency('$123.45')).toBe(123.45);
    });

    it('parses string with commas', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
    });

    it('returns number if given number', () => {
      expect(parseCurrency(123.45)).toBe(123.45);
    });

    it('handles empty/null values', () => {
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency(null)).toBe(0);
    });
  });
});
