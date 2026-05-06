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
        return new Promise((resolve) => {
            Alert.alert(
                'Mock Payment',
                `Confirm payment of Rs ${amount.toFixed(2)} for your EV slot?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => resolve(null),
                    },
                    {
                        text: 'Pay Now',
                        onPress: () => {
                            setIsProcessing(true);
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
