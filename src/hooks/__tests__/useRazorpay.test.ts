import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { useRazorpay } from '@/hooks/useRazorpay';

describe('useRazorpay', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('resolves null when the user cancels the payment dialog', async () => {
        const { result } = renderHook(() => useRazorpay());

        let paymentPromise: Promise<unknown> | undefined;
        await act(async () => {
            paymentPromise = result.current.openCheckout(299.5, 'order_1');
        });

        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as { onPress?: () => void }[];
        await act(async () => {
            buttons[0].onPress?.();
        });

        await expect(paymentPromise).resolves.toBeNull();
        expect(result.current.isProcessing).toBe(false);
    });

    it('returns mock payment metadata after the user confirms payment', async () => {
        const { result } = renderHook(() => useRazorpay());

        let paymentPromise: Promise<unknown> | undefined;
        await act(async () => {
            paymentPromise = result.current.openCheckout(299.5, 'order_123');
        });

        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as { onPress?: () => void }[];
        act(() => {
            buttons[1].onPress?.();
        });

        expect(result.current.isProcessing).toBe(true);

        await act(async () => {
            jest.advanceTimersByTime(1500);
            await paymentPromise;
        });

        await expect(paymentPromise).resolves.toMatchObject({
            razorpay_order_id: 'order_123',
            razorpay_signature: 'mock_signature_hash',
        });
        expect(result.current.isProcessing).toBe(false);
    });
});
