import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import client from './client';

import type { ApiSuccessResponse } from '@/types/api';

export interface Booking {
    id: string;
    user_id: string;
    slot_id: string;
    station_id: string;
    status: string;
    scheduled_start: string;
    scheduled_end: string;
    actual_start: string | null;
    actual_end: string | null;
    amount: number;
    energy_consumed_kwh: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateBookingPayload {
    slot_id: string;
    scheduled_start: string;
    scheduled_end: string;
}

export interface CreateBookingResponse {
    booking_id: string;
    razorpay_order_id: string;
    amount: number;
    lock_expires_at: string;
}

export function createBooking(payload: CreateBookingPayload) {
    return client.post<ApiSuccessResponse<CreateBookingResponse>>('/bookings', payload);
}

export function fetchBookings() {
    return client.get<ApiSuccessResponse<Booking[]>>('/bookings');
}

export function cancelBooking(bookingId: string) {
    return client.delete<ApiSuccessResponse<{ status: string }>>(`/bookings/${bookingId}`);
}

export function useBookings() {
    return useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const response = await fetchBookings();
            return response.data.data;
        },
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateBookingPayload) => {
            const response = await createBooking(payload);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookingId: string) => {
            const response = await cancelBooking(bookingId);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}
