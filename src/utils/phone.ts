const INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/;

export function formatIndianPhoneNumber(value: string): string {
    const rawDigits = value.replace(/\D/g, '');
    const digits = rawDigits.startsWith('91') && rawDigits.length > 10 ? rawDigits.slice(2) : rawDigits;
    const normalizedDigits = digits.slice(-10);
    return `+91${normalizedDigits}`;
}

export function isValidIndianPhoneNumber(value: string): boolean {
    return INDIAN_PHONE_REGEX.test(value);
}
