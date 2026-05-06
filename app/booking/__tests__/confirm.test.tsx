/* eslint-disable import/first, @typescript-eslint/no-require-imports */

import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('react-native-reanimated', () => {
    const { View } = require('react-native');

    return {
        __esModule: true,
        default: {
            View,
        },
        FadeInDown: {
            springify: () => undefined,
        },
    };
});

import BookingConfirmScreen from '../confirm';
import { useBookingStore } from '@/store/booking.store';

const mockReplace = jest.fn();
const mockCreateBooking = jest.fn();
const mockVerifyPayment = jest.fn();
const mockOpenCheckout = jest.fn();

jest.mock('expo-router', () => ({
    router: {
        replace: (...args: unknown[]) => mockReplace(...args),
    },
}));

jest.mock('@/api/bookings', () => ({
    createBooking: (...args: unknown[]) => mockCreateBooking(...args),
}));

jest.mock('@/api/payments', () => ({
    verifyPayment: (...args: unknown[]) => mockVerifyPayment(...args),
}));

jest.mock('@/hooks/useRazorpay', () => ({
    useRazorpay: () => ({
        openCheckout: (...args: unknown[]) => mockOpenCheckout(...args),
        isProcessing: false,
    }),
}));

function renderScreen() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false, gcTime: 0 },
        },
    });

    const rendered = render(
        <QueryClientProvider client={queryClient}>
            <BookingConfirmScreen />
        </QueryClientProvider>
    );

    return {
        ...rendered,
        queryClient,
    };
}

describe('BookingConfirmScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        useBookingStore.setState({
            draft: {
                stationId: 'station-1',
                stationName: 'Kairo Hub',
                slotId: 'slot-1',
                slotLabel: 'Slot 1',
                chargerType: 'CCS2',
                scheduledStart: '2026-06-03T14:00:00.000Z',
                scheduledEnd: '2026-06-03T15:00:00.000Z',
                estimatedCost: 100,
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        useBookingStore.getState().clearDraft();
    });

    it('clears the draft and informs the user when payment is cancelled', async () => {
        mockCreateBooking.mockResolvedValue({
            data: {
                data: {
                    booking_id: 'booking-1',
                    razorpay_order_id: 'order-1',
                },
            },
        });
        mockOpenCheckout.mockResolvedValue(null);

        const { queryClient, unmount } = renderScreen();

        fireEvent.press(screen.getByText(/Pay/));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Payment cancelled',
                'Your slot hold will be released automatically if payment is not completed in time.',
                expect.any(Array),
                { cancelable: false }
            );
        });
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
            text: string;
            onPress?: () => void;
        }[];

        expect(buttons.map((button) => button.text)).toEqual(['View bookings', 'Go home']);
        await act(async () => {
            buttons[0]?.onPress?.();
        });

        expect(useBookingStore.getState().draft).toBeNull();
        expect(mockReplace).toHaveBeenCalledWith('/(app)/bookings');
        queryClient.clear();
        unmount();
    });

    it('moves the user to server reconciliation flow when verification fails after booking creation', async () => {
        mockCreateBooking.mockResolvedValue({
            data: {
                data: {
                    booking_id: 'booking-1',
                    razorpay_order_id: 'order-1',
                },
            },
        });
        mockOpenCheckout.mockResolvedValue({
            razorpay_order_id: 'order-1',
            razorpay_payment_id: 'payment-1',
            razorpay_signature: 'sig-1',
        });
        mockVerifyPayment.mockRejectedValue(new Error('Verification failed'));

        const { queryClient, unmount } = renderScreen();

        fireEvent.press(screen.getByText(/Pay/));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Payment reconciliation in progress',
                expect.stringContaining('Verification failed'),
                expect.any(Array),
                { cancelable: false }
            );
        });
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
            text: string;
            onPress?: () => void;
        }[];

        expect(buttons.map((button) => button.text)).toEqual(['Open bookings', 'Go home']);
        await act(async () => {
            buttons[0]?.onPress?.();
        });

        expect(useBookingStore.getState().draft).toBeNull();
        expect(mockReplace).toHaveBeenCalledWith('/(app)/bookings');
        queryClient.clear();
        unmount();
    });
});
