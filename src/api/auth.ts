import client from './client';

import type { ApiSuccessResponse } from '@/types/api';

export interface User {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
    role: 'user' | 'admin';
    vehicle_type: string | null;
    preferred_connector: string | null;
    expo_push_token: string | null;
}

export interface VerifyOtpResponse {
    is_new_user: boolean;
    access_token: string;
    refresh_token: string;
    token_type?: string;
    access_token_expires_in?: number;
    refresh_token_expires_in?: number;
    user?: User;
}

export function sendOtp(phone: string) {
    return client.post('/auth/otp/send', { phone });
}

export function verifyOtp(phone: string, otp: string) {
    return client.post<ApiSuccessResponse<VerifyOtpResponse>>('/auth/otp/verify', {
        phone,
        otp,
    });
}

export function getMe() {
    return client.get<ApiSuccessResponse<User>>('/auth/me');
}

export function logout() {
    return client.delete('/auth/logout');
}

export function updateProfile(data: Partial<User>) {
    return client.patch<ApiSuccessResponse<User>>('/auth/me', data);
}
