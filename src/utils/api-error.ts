import { AxiosError } from 'axios';

import type { ApiErrorPayload, ApiErrorResponse, AppApiError } from '@/types/api';

const DEFAULT_ERROR_CODE = 'UNKNOWN_ERROR';
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

function getPayloadFromResponse(data: ApiErrorResponse | undefined): ApiErrorPayload | undefined {
    if (!data) {
        return undefined;
    }

    if (data.error) {
        return data.error;
    }

    if (typeof data.detail === 'string') {
        return { message: data.detail };
    }

    return data.detail;
}

export function normalizeApiError(error: unknown): AppApiError {
    if ((error as AppApiError)?.code && (error as AppApiError)?.status !== undefined) {
        return error as AppApiError;
    }

    if (error instanceof AxiosError) {
        const status = error.response?.status ?? 500;
        const responseData = error.response?.data as ApiErrorResponse | undefined;
        const payload = getPayloadFromResponse(responseData);
        const message = payload?.message ?? responseData?.message ?? error.message ?? DEFAULT_ERROR_MESSAGE;

        const normalizedError = new Error(message) as AppApiError;
        normalizedError.code = payload?.code ?? DEFAULT_ERROR_CODE;
        normalizedError.status = status;
        normalizedError.details = payload?.details;
        normalizedError.requestId =
            (error.response?.headers?.['x-request-id'] as string | undefined) ??
            responseData?.meta?.request_id;

        return normalizedError;
    }

    const fallbackError = new Error(
        error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE
    ) as AppApiError;
    fallbackError.code = DEFAULT_ERROR_CODE;
    fallbackError.status = 500;

    return fallbackError;
}
