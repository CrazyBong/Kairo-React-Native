import client from './client';

import type { ApiSuccessResponse } from '@/types/api';

export interface VerifyPaymentPayload {
    booking_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export function verifyPayment(payload: VerifyPaymentPayload) {
    return client.post<ApiSuccessResponse<{ status: string }>>('/payments/verify', payload);
}
