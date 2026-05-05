import { AxiosError } from 'axios';

import { normalizeApiError } from '@/utils/api-error';

describe('normalizeApiError', () => {
    it('maps axios API errors into the shared error shape', () => {
        const axiosError = new AxiosError('Request failed');
        axiosError.response = {
            data: {
                error: {
                    code: 'SLOT_UNAVAILABLE',
                    message: 'This slot is already booked.',
                },
                meta: {
                    request_id: 'req-123',
                },
            },
            status: 409,
            statusText: 'Conflict',
            headers: {},
            config: {} as never,
        };

        const result = normalizeApiError(axiosError);

        expect(result.code).toBe('SLOT_UNAVAILABLE');
        expect(result.status).toBe(409);
        expect(result.message).toBe('This slot is already booked.');
        expect(result.requestId).toBe('req-123');
    });

    it('creates a safe fallback for unknown failures', () => {
        const result = normalizeApiError(new Error('boom'));

        expect(result.code).toBe('UNKNOWN_ERROR');
        expect(result.status).toBe(500);
        expect(result.message).toBe('boom');
    });
});
