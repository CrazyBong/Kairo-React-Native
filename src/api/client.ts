import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { v4 as uuidv4 } from 'uuid';

import { getAppStorage } from '@/lib/storage';
import { useAuthStore } from '@/store/auth.store';
import { normalizeApiError } from '@/utils/api-error';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/v1';

const requestIdempotencyKeys = new WeakMap<object, string>();

function getStableIdempotencyKey(config: object): string {
    if (!requestIdempotencyKeys.has(config)) {
        requestIdempotencyKeys.set(config, uuidv4());
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
    const token = useAuthStore.getState().accessToken ?? getAppStorage().getString('access_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method && ['post', 'delete', 'patch', 'put'].includes(config.method.toLowerCase())) {
        config.headers['Idempotency-Key'] = getStableIdempotencyKey(config);
    }

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

        if (!originalRequest) {
            return Promise.reject(normalizeApiError(error));
        }

        const isAuthRefreshCandidate =
            error.response?.status === 401 &&
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
                const refreshToken = getAppStorage().getString('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const { data } = await axios.post<{
                    data: { access_token: string; refresh_token?: string };
                }>(`${API_URL}/auth/token/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token, refresh_token: nextRefreshToken } = data.data;
                useAuthStore.getState().setAccessToken(access_token, nextRefreshToken);

                processQueue(null, access_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return client(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                processQueue(refreshError);
                return Promise.reject(normalizeApiError(refreshError));
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(normalizeApiError(error));
    }
);

export default client;
