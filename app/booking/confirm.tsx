import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';

import { createBooking } from '@/api/bookings';
import { verifyPayment } from '@/api/payments';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useBookingStore } from '@/store/booking.store';
import { formatCurrency } from '@/utils/formatters';
import { normalizeApiError } from '@/utils/api-error';

export default function BookingConfirmScreen() {
    const draft = useBookingStore((state) => state.draft);
    const clearDraft = useBookingStore((state) => state.clearDraft);
    const { openCheckout, isProcessing } = useRazorpay();

    const bookingMutation = useMutation({
        mutationFn: createBooking,
    });

    const paymentVerificationMutation = useMutation({
        mutationFn: verifyPayment,
    });

    if (!draft) {
        return (
            <View style={styles.errorContainer}>
                <Typography variant="body" color="secondary">
                    No booking draft found.
                </Typography>
                <Button
                    label="Go Home"
                    onPress={() => router.replace('/(app)')}
                    style={styles.homeButton}
                />
            </View>
        );
    }

    const subtotal = draft.estimatedCost;
    const taxes = subtotal * 0.18;
    const total = subtotal + taxes;
    const isSubmitting = bookingMutation.isPending || paymentVerificationMutation.isPending || isProcessing;

    const redirectAfterPaymentIssue = (destination: '/(app)' | '/(app)/bookings') => {
        clearDraft();
        router.replace(destination);
    };

    const handlePayment = async () => {
        let bookingId: string | null = null;
        let bookingCreated = false;

        try {
            const bookingResponse = await bookingMutation.mutateAsync({
                slot_id: draft.slotId,
                scheduled_start: draft.scheduledStart,
                scheduled_end: draft.scheduledEnd,
            });
            bookingId = bookingResponse.data.data.booking_id;
            bookingCreated = true;

            const paymentResult = await openCheckout(total, bookingResponse.data.data.razorpay_order_id);
            if (!paymentResult) {
                Alert.alert(
                    'Payment cancelled',
                    'Your slot hold will be released automatically if payment is not completed in time.',
                    [
                        {
                            text: 'View bookings',
                            onPress: () => redirectAfterPaymentIssue('/(app)/bookings'),
                        },
                        {
                            text: 'Go home',
                            style: 'cancel',
                            onPress: () => redirectAfterPaymentIssue('/(app)'),
                        },
                    ],
                    { cancelable: false }
                );
                return;
            }

            await paymentVerificationMutation.mutateAsync({
                booking_id: bookingId,
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_signature: paymentResult.razorpay_signature,
            });

            clearDraft();
            router.replace('/booking/success');
        } catch (error) {
            const normalizedError = normalizeApiError(error);
            bookingMutation.reset();
            paymentVerificationMutation.reset();
            if (bookingCreated && bookingId) {
                Alert.alert(
                    'Payment reconciliation in progress',
                    `${normalizedError.message} We are checking the payment status on the server. If payment was not completed, your slot hold will expire automatically.`,
                    [
                        {
                            text: 'Open bookings',
                            onPress: () => redirectAfterPaymentIssue('/(app)/bookings'),
                        },
                        {
                            text: 'Go home',
                            style: 'cancel',
                            onPress: () => redirectAfterPaymentIssue('/(app)'),
                        },
                    ],
                    { cancelable: false }
                );
                return;
            }
            Alert.alert('Payment error', normalizedError.message);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View entering={FadeInDown.springify()}>
                    <Typography variant="h2" color="primary" style={styles.title}>
                        Checkout
                    </Typography>

                    <View style={styles.receiptCard}>
                        <View style={styles.receiptHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="flash" size={20} color={Colors.brand.primary} />
                            </View>
                            <View style={styles.stationHeader}>
                                <Typography variant="label" color="primary">
                                    {draft.stationName}
                                </Typography>
                                <Typography variant="caption" color="secondary">
                                    {draft.slotLabel} - {draft.chargerType}
                                </Typography>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <DetailRow label="Start" value={new Date(draft.scheduledStart).toLocaleString('en-IN')} />
                        <DetailRow label="End" value={new Date(draft.scheduledEnd).toLocaleString('en-IN')} />

                        <View style={styles.divider} />

                        <DetailRow label="Subtotal" value={formatCurrency(subtotal)} />
                        <DetailRow label="Taxes & Fees" value={formatCurrency(taxes)} />

                        <View style={[styles.divider, styles.dashedDivider]} />

                        <DetailRow label="Total" value={formatCurrency(total)} emphasis />
                    </View>

                    {bookingMutation.error ? (
                        <Typography variant="bodySmall" color="error" style={styles.errorText}>
                            {normalizeApiError(bookingMutation.error).message}
                        </Typography>
                    ) : null}
                </Animated.View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    label={isSubmitting ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                    onPress={handlePayment}
                    loading={isSubmitting}
                    fullWidth
                />
            </View>
        </View>
    );
}

const DetailRow = ({
    label,
    value,
    emphasis = false,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) => (
    <View style={styles.detailRow}>
        <Typography variant={emphasis ? 'h4' : 'body'} color="secondary">
            {label}
        </Typography>
        <Typography variant={emphasis ? 'h4' : 'body'} color="primary">
            {value}
        </Typography>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingTop: 80,
    },
    title: {
        marginBottom: Spacing.xl,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeButton: {
        marginTop: Spacing.md,
    },
    receiptCard: {
        backgroundColor: Colors.brand.white,
        borderRadius: Radius.lg,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    receiptHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stationHeader: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface.subtle,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border.subtle,
        marginVertical: Spacing.lg,
    },
    dashedDivider: {
        height: 0,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
        borderStyle: 'dashed',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    errorText: {
        marginTop: Spacing.md,
    },
    footer: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.xl,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: Colors.border.subtle,
    },
});
