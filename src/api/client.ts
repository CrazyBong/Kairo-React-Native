import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

import { getAppStorage } from '@/lib/storage';
import { captureHandledError, Sentry } from '@/lib/monitoring';
import { useAuthStore } from '@/store/auth.store';
import { normalizeApiError } from '@/utils/api-error';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/v1';

const requestIdempotencyKeys = new WeakMap<object, string>();

function createRequestId(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }

    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getStableIdempotencyKey(config: object): string {
    if (!requestIdempotencyKeys.has(config)) {
        requestIdempotencyKeys.set(config, createRequestId());
    }

    return requestIdempotencyKeys.get(config)!;
}

const client: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'X-App-Version': Constants.expoConfig?.version ?? '1.0.0',
        'Accept-Language': 'en-IN',
    },
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken ?? getAppStorage().getString('access_token') ?? null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method && ['post', 'delete', 'patch', 'put'].includes(config.method.toLowerCase())) {
        config.headers['Idempotency-Key'] = getStableIdempotencyKey(config);
    }

    Sentry.addBreadcrumb({
        category: 'http',
        type: 'http',
        level: 'info',
        message: `${config.method?.toUpperCase() ?? 'GET'} ${config.url ?? ''}`,
        data: {
            method: config.method,
            url: config.url,
        },
    });

    return config;
});

let isRefreshing = false;
let failedQueue: {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((pendingRequest) => {
        if (error) {
            pendingRequest.reject(error);
            return;
        }

        pendingRequest.resolve(token!);
    });

    failedQueue = [];
}

client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError & { config?: InternalAxiosRequestConfig & { _retry?: boolean } }) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (!originalRequest) {
            return Promise.reject(normalizeApiError(error));
        }

        const isAuthRefreshCandidate =
            status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/otp') &&
            !originalRequest.url?.includes('/auth/token/refresh');

        if (isAuthRefreshCandidate) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return client(originalRequest);
                    })
                    .catch((refreshError) => Promise.reject(normalizeApiError(refreshError)));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getAppStorage().getString('refresh_token') ?? null;
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const { data } = await axios.post<{
                    data: { access_token: string; refresh_token?: string };
                }>(`${API_URL}/auth/token/refresh`, {
                    refresh_token: refreshToken,
                }, {
                    timeout: 10000,
                });

                const access_token = data?.data?.access_token;
                const nextRefreshToken = data?.data?.refresh_token;
                if (!access_token) {
                    throw new Error('Missing access token in refresh response');
                }
                useAuthStore.getState().setAccessToken(access_token, nextRefreshToken);

                processQueue(null, access_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return client(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                processQueue(refreshError);
                captureHandledError(refreshError, {
                    area: 'auth_refresh',
                    extras: {
                        url: originalRequest.url,
                    },
                });
                return Promise.reject(normalizeApiError(refreshError));
            } finally {
                isRefreshing = false;
            }
        }

        if (!status || status >= 500) {
            captureHandledError(error, {
                area: 'api_client',
                extras: {
                    status,
                    method: originalRequest.method,
                    url: originalRequest.url,
                },
            });
        }

        return Promise.reject(normalizeApiError(error));
    }
);

export default client;
