import { formatIndianPhoneNumber, isValidIndianPhoneNumber } from '@/utils/phone';

describe('phone utilities', () => {
    it('formats a raw number into the backend phone format', () => {
        expect(formatIndianPhoneNumber('98765 43210')).toBe('+919876543210');
    });

    it('rejects numbers that do not match the supported Indian mobile pattern', () => {
        expect(isValidIndianPhoneNumber('+911234567890')).toBe(false);
        expect(isValidIndianPhoneNumber('+919876543210')).toBe(true);
    });
});
