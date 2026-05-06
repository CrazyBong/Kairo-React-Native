/* eslint-disable import/first */

const mockAxiosPost = jest.fn();
let mockClient: jest.Mock;
let mockRequestUse: jest.Mock;
let mockResponseUse: jest.Mock;

jest.mock('axios', () => {
    mockRequestUse = jest.fn();
    mockResponseUse = jest.fn();
    const create = jest.fn(() => {
        mockClient = Object.assign(jest.fn(), {
            interceptors: {
                request: { use: mockRequestUse },
                response: { use: mockResponseUse },
            },
        });

        return mockClient;
    });
    const mockAxios = Object.assign(jest.fn(), {
        create,
        post: mockAxiosPost,
    });

    return {
        __esModule: true,
        default: mockAxios,
        create,
        post: mockAxiosPost,
        AxiosError: class AxiosError extends Error {
            response?: unknown;
            config?: unknown;
        },
    };
});

const mockGetString = jest.fn();
const mockLogout = jest.fn();
const mockSetAccessToken = jest.fn();
const mockGetState = jest.fn();

jest.mock('@/lib/storage', () => ({
    getAppStorage: () => ({
        getString: mockGetString,
    }),
}));

jest.mock('@/store/auth.store', () => ({
    useAuthStore: {
        getState: () => mockGetState(),
    },
}));

const mockCaptureHandledError = jest.fn();
const mockAddBreadcrumb = jest.fn();

jest.mock('@/lib/monitoring', () => ({
    captureHandledError: (...args: unknown[]) => mockCaptureHandledError(...args),
    Sentry: {
        addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
    },
}));

import '@/api/client';

describe('api client interceptors', () => {
    beforeEach(() => {
        mockAxiosPost.mockReset();
        mockClient.mockReset();
        mockGetString.mockReset();
        mockLogout.mockReset();
        mockSetAccessToken.mockReset();
        mockGetState.mockReset();
        mockCaptureHandledError.mockReset();
        mockAddBreadcrumb.mockReset();
        mockGetState.mockReturnValue({
            accessToken: 'access-token',
            logout: mockLogout,
            setAccessToken: mockSetAccessToken,
        });
        mockGetString.mockImplementation((key: string) => {
            if (key === 'refresh_token') {
                return 'refresh-token';
            }

            return undefined;
        });
    });

    it('adds auth and idempotency headers on mutation requests', () => {
        const requestInterceptor = mockRequestUse.mock.calls[0][0] as (config: any) => any;
        const config = requestInterceptor({
            method: 'post',
            headers: {},
            url: '/bookings',
        });

        expect(config.headers.Authorization).toBe('Bearer access-token');
        expect(config.headers['Idempotency-Key']).toBeTruthy();
        expect(mockAddBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({
                category: 'http',
                message: 'POST /bookings',
            })
        );
    });

    it('logs out and captures handled refresh failures', async () => {
        const responseInterceptor = mockResponseUse.mock.calls[0][1] as (error: any) => Promise<unknown>;
        const originalRequest = {
            method: 'get',
            url: '/bookings',
            headers: {} as Record<string, string>,
        };

        mockAxiosPost.mockRejectedValueOnce(new Error('refresh failed'));

        await expect(
            responseInterceptor({
                config: originalRequest,
                response: {
                    status: 401,
                },
            })
        ).rejects.toBeTruthy();

        expect(mockLogout).toHaveBeenCalled();
        expect(mockCaptureHandledError).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                area: 'auth_refresh',
                extras: { url: '/bookings' },
            })
        );
    });

    it('captures handled 5xx API failures with request context', async () => {
        const responseInterceptor = mockResponseUse.mock.calls[0][1] as (error: any) => Promise<unknown>;
        const originalRequest = {
            method: 'get',
            url: '/stations/nearby',
            headers: {} as Record<string, string>,
        };

        await expect(
            responseInterceptor({
                config: originalRequest,
                response: {
                    status: 500,
                },
                message: 'server exploded',
            })
        ).rejects.toBeTruthy();

        expect(mockCaptureHandledError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'server exploded',
            }),
            expect.objectContaining({
                area: 'api_client',
                extras: {
                    status: 500,
                    method: 'get',
                    url: '/stations/nearby',
                },
            })
        );
    });
});
