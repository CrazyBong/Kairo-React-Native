import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useBookingStore } from '@/store/booking.store';
import { useRazorpay } from '@/hooks/useRazorpay';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function BookingConfirmScreen() {
    const draft = useBookingStore(s => s.draft);
    const { openCheckout, isProcessing } = useRazorpay();

    if (!draft) {
        return (
            <View style={styles.errorContainer}>
                <Typography variant="body" color="secondary">No booking draft found.</Typography>
                <Button label="Go Home" onPress={() => router.replace('/(app)/')} style={{ marginTop: Spacing.md }} />
            </View>
        );
    }

    const handlePayment = async () => {
        // We simulate creating an order ID on backend
        const mockOrderId = `order_${Date.now()}`;
        const paymentResult = await openCheckout(draft.estimatedCost, mockOrderId);

        if (paymentResult) {
            // Payment successful, map to success screen
            router.replace('/booking/success');
        }
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View entering={FadeInDown.springify()}>
                    <Typography variant="h2" color="primary" style={{ marginBottom: Spacing.xl }}>Checkout</Typography>

                    <View style={styles.receiptCard}>
                        <View style={styles.receiptHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="flash" size={20} color={Colors.brand.primary} />
                            </View>
                            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                                <Typography variant="label" color="primary">{draft.stationName}</Typography>
                                <Typography variant="caption" color="secondary">{draft.slotLabel} • {draft.chargerType}</Typography>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <Typography variant="body" color="secondary">Date</Typography>
                            <Typography variant="label" color="primary">{formatDate(draft.scheduledStart)}</Typography>
                        </View>

                        <View style={styles.detailRow}>
                            <Typography variant="body" color="secondary">Time</Typography>
                            <Typography variant="label" color="primary">{formatTime(draft.scheduledStart)} - {formatTime(draft.scheduledEnd)}</Typography>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <Typography variant="body" color="secondary">Subtotal</Typography>
                            <Typography variant="body" color="primary">₹{draft.estimatedCost.toFixed(2)}</Typography>
                        </View>
                        <View style={styles.detailRow}>
                            <Typography variant="body" color="secondary">Taxes & Fees</Typography>
                            <Typography variant="body" color="primary">₹{(draft.estimatedCost * 0.18).toFixed(2)}</Typography>
                        </View>

                        <View style={[styles.divider, { borderStyle: 'dashed' }]} />

                        <View style={styles.detailRow}>
                            <Typography variant="h3" color="primary">Total</Typography>
                            <Typography variant="h3" color="primary">₹{(draft.estimatedCost * 1.18).toFixed(2)}</Typography>
                        </View>
                    </View>

                    <Typography variant="caption" color="tertiary" style={styles.legalText}>
                        By proceeding, you agree to Kairo's Terms of Service and Cancellation Policy.
                    </Typography>
                </Animated.View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    label={`Pay ₹${(draft.estimatedCost * 1.18).toFixed(2)}`}
                    onPress={handlePayment}
                    loading={isProcessing}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingTop: 80,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    legalText: {
        marginTop: Spacing.xl,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
        lineHeight: 18,
    },
    footer: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.xl,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    }
});
