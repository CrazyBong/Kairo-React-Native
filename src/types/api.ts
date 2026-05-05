export interface ApiMeta {
    timestamp?: string;
    request_id?: string;
    [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
    data: T;
    meta?: ApiMeta;
    pagination?: Record<string, unknown>;
    message?: string;
}

export interface ApiErrorPayload {
    code?: string;
    message?: string;
    details?: unknown;
}

export interface ApiErrorResponse {
    error?: ApiErrorPayload;
    detail?: ApiErrorPayload | string;
    message?: string;
    meta?: ApiMeta;
}

export interface AppApiError extends Error {
    code: string;
    status: number;
    details?: unknown;
    requestId?: string;
}
