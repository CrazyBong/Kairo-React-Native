// src/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { MMKV } from 'react-native-mmkv';
import Constants from 'expo-constants';

// ─── Environment Validation ────────────────────────────────────────────────
const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
    console.error(
        '[Kairo] EXPO_PUBLIC_API_URL is not defined. Check your .env.development file.'
    );
}

// ─── Lazy MMKV — Nitro JSI modules must not be initialized at top-level ───
let _storage: MMKV | null = null;
const getStorage = (): MMKV => {
    if (!_storage) _storage = new MMKV({ id: 'kairo-auth' });
    return _storage;
};

// ─── Idempotency Key Store ─────────────────────────────────────────────────
// Keys are generated and stored per-request so retries reuse the same key.
const requestIdempotencyKeys = new WeakMap<object, string>();
const generateIdempotencyKey = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─── Axios Client ─────────────────────────────────────────────────────────
const client: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'X-App-Version': Constants.expoConfig?.version ?? '1.0.0',
        'Accept-Language': 'en-IN',
    },
});

// REQUEST INTERCEPTOR — Inject JWT and Idempotency Key
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const storage = getStorage();
    const token = storage.getString('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Stable idempotency key: generated once per config object, reused on retry
    if (config.method && ['post', 'delete', 'patch', 'put'].includes(config.method.toLowerCase())) {
        if (!requestIdempotencyKeys.has(config)) {
            requestIdempotencyKeys.set(config, generateIdempotencyKey());
        }
        config.headers['Idempotency-Key'] = requestIdempotencyKeys.get(config)!;
    }

    return config;
});

// RESPONSE INTERCEPTOR — Token Refresh Logic
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token!);
    });
    failedQueue = [];
};

client.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/otp')
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return client(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getStorage().getString('refresh_token');
                if (!refreshToken) throw new Error('No refresh token available');

                const { data } = await axios.post(
                    `${API_URL}/auth/token/refresh`,
                    { refresh_token: refreshToken }
                );

                const { access_token, refresh_token: newRefreshToken } = (data as any).data;

                getStorage().set('access_token', access_token);
                if (newRefreshToken) getStorage().set('refresh_token', newRefreshToken);

                processQueue(null, access_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return client(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Only clear auth keys, not all MMKV data
                const storage = getStorage();
                storage.delete('access_token');
                storage.delete('refresh_token');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default client;
