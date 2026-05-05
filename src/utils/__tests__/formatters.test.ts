import { formatCurrency, formatDateTime, formatDistance, formatTimeRange } from '@/utils/formatters';

describe('formatter utilities', () => {
    it('formats INR amounts with two decimal places', () => {
        expect(formatCurrency(299.5)).toContain('299.50');
    });

    it('keeps one decimal place for short distances and rounds longer ones', () => {
        expect(formatDistance(1.44)).toBe('1.4 km');
        expect(formatDistance(12.8)).toBe('13 km');
    });

    it('formats a date-time string into a readable short form', () => {
        const result = formatDateTime('2026-05-06T09:00:00.000Z');

        expect(result).toContain('6');
        expect(result).toContain('May');
    });

    it('formats a time range from two ISO timestamps', () => {
        const result = formatTimeRange('2026-05-06T09:00:00.000Z', '2026-05-06T09:45:00.000Z');

        expect(result).toContain(' - ');
        expect(result).toMatch(/\d{1,2}:\d{2}/i);
    });
});
