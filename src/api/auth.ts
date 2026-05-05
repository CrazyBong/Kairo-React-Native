// src/api/auth.ts
import client from './client';

export interface VerifyOtpResponse {
    is_new_user: boolean;
    access_token: string;
    refresh_token: string;
}

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

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export const sendOtp = (phone: string) => {
    return client.post('/auth/otp/send', { phone });
};

export const verifyOtp = (phone: string, otp: string) => {
    return client.post<ApiResponse<VerifyOtpResponse>>('/auth/otp/verify', { phone, otp });
};

export const getMe = () => {
    return client.get<ApiResponse<User>>('/auth/me');
};

export const logout = () => {
    return client.delete('/auth/logout');
};

export const updateProfile = (data: Partial<User>) => {
    return client.patch<ApiResponse<User>>('/auth/me', data);
};
