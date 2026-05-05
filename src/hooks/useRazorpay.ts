import { useState } from 'react';
import { Alert } from 'react-native';

export interface PaymentSuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export function useRazorpay() {
    const [isProcessing, setIsProcessing] = useState(false);

    const openCheckout = (amount: number, orderId: string): Promise<PaymentSuccessResponse | null> => {
        // FIX: Promise wraps the full flow so it only resolves AFTER user confirms
        return new Promise((resolve) => {
            // FIX: isProcessing set true AFTER user confirms, not before the alert
            Alert.alert(
                'Mock Payment',
                `Confirm payment of ₹${amount.toFixed(2)} for your EV slot?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        // FIX: Alert dismiss resolves to null (no longer hangs)
                        onPress: () => resolve(null),
                    },
                    {
                        text: 'Pay Now',
                        onPress: () => {
                            // FIX: isProcessing only set after user interaction confirms payment
                            setIsProcessing(true);
                            // Simulate network delay for payment verification
                            setTimeout(() => {
                                setIsProcessing(false);
                                resolve({
                                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                                    razorpay_order_id: orderId,
                                    razorpay_signature: 'mock_signature_hash',
                                });
                            }, 1500);
                        },
                    },
                ],
                { cancelable: false }
            );
        });
    };

    return {
        openCheckout,
        isProcessing,
    };
}
