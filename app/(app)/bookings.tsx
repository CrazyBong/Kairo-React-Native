import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useBookings, useCancelBooking } from '@/api/bookings';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Shadow, Spacing } from '@/constants';
import { formatCurrency, formatDateTime, formatTimeRange } from '@/utils/formatters';

export default function BookingsScreen() {
    const { data: bookings = [], isLoading, error, refetch } = useBookings();
    const cancelBookingMutation = useCancelBooking();
    const [cancellingBookingId, setCancellingBookingId] = React.useState<string | null>(null);

    const handleCancel = (bookingId: string) => {
        Alert.alert('Cancel booking', 'Do you want to cancel this booking?', [
            { text: 'Keep', style: 'cancel' },
            {
                text: 'Cancel booking',
                style: 'destructive',
                onPress: async () => {
                    setCancellingBookingId(bookingId);
                    try {
                        await cancelBookingMutation.mutateAsync(bookingId);
                    } finally {
                        setCancellingBookingId(null);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typography variant="h2" color="primary">
                    My Bookings
                </Typography>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <EmptyState message="Loading your bookings..." />
                ) : error ? (
                    <View style={styles.emptyState}>
                        <Typography variant="body" color="error" align="center">
                            We could not load your bookings.
                        </Typography>
                        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                            <Typography variant="label" color="primary">
                                Retry
                            </Typography>
                        </TouchableOpacity>
                    </View>
                ) : bookings.length === 0 ? (
                    <EmptyState message="No bookings yet. Your confirmed sessions will appear here." />
                ) : (
                    bookings.map((booking, index) => {
                        const isCancelable = ['PENDING_PAYMENT', 'CONFIRMED', 'LOCKED'].includes(booking.status);

                        return (
                            <Animated.View key={booking.id} entering={FadeInDown.delay(100 * index).springify()}>
                                <View style={styles.bookingCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.statusBadge}>
                                            <Typography variant="caption" color="primary">
                                                {booking.status.replace(/_/g, ' ')}
                                            </Typography>
                                        </View>
                                        <Typography variant="label" color="primary">
                                            #{booking.id.slice(0, 8)}
                                        </Typography>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <Typography variant="body" color="secondary">
                                            Scheduled start
                                        </Typography>
                                        <Typography variant="h4" color="primary" style={styles.primaryText}>
                                            {formatDateTime(booking.scheduled_start)}
                                        </Typography>
                                        <Typography variant="bodySmall" color="secondary">
                                            {formatTimeRange(booking.scheduled_start, booking.scheduled_end)}
                                        </Typography>

                                        <View style={styles.metrics}>
                                            <DetailItem icon="flash-outline" text={`Slot ${booking.slot_id.slice(0, 8)}`} />
                                            <DetailItem icon="cash-outline" text={formatCurrency(booking.amount)} />
                                        </View>
                                    </View>

                                    {isCancelable ? (
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            activeOpacity={0.8}
                                            disabled={cancelBookingMutation.isPending && cancellingBookingId === booking.id}
                                            onPress={() => handleCancel(booking.id)}
                                        >
                                            <Typography variant="button" color="primary">
                                                {cancelBookingMutation.isPending && cancellingBookingId === booking.id
                                                    ? 'Cancelling...'
                                                    : 'Cancel booking'}
                                            </Typography>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </Animated.View>
                        );
                    })
                )}

                {cancelBookingMutation.error ? (
                    <Typography variant="bodySmall" color="error" align="center" style={styles.errorText}>
                        We could not cancel that booking right now.
                    </Typography>
                ) : null}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const DetailItem = ({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) => (
    <View style={styles.detailItem}>
        <Ionicons name={icon} size={16} color={Colors.text.tertiary} />
        <Typography variant="bodySmall" color="secondary" style={styles.detailText}>
            {text}
        </Typography>
    </View>
);

const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyState}>
        <Typography variant="body" color="secondary" align="center">
            {message}
        </Typography>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.brand.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    content: {
        padding: Spacing.xl,
    },
    bookingCard: {
        backgroundColor: Colors.brand.white,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        ...Shadow.subtle,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Radius.sm,
        backgroundColor: Colors.surface.subtle,
    },
    cardBody: {
        marginBottom: Spacing.md,
    },
    primaryText: {
        marginTop: 4,
        marginBottom: 2,
    },
    metrics: {
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 6,
    },
    actionBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        paddingVertical: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
        paddingHorizontal: Spacing.xl,
    },
    retryButton: {
        marginTop: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        borderRadius: Radius.pill,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    errorText: {
        marginTop: Spacing.sm,
    },
    bottomSpacer: {
        height: 100,
    },
});
