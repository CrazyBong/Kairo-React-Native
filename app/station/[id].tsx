import React from 'react';
import { Alert, Image, Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useDemandPrediction, useStationPricing } from '@/api/demand';
import { useStationReviews } from '@/api/reviews';
import { formatStationAddress, useStationDetail } from '@/api/stations';
import { DemandChart } from '@/components/discovery/DemandChart';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants';
import { formatCurrency } from '@/utils/formatters';

const FALLBACK_STATION_IMAGE =
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1200';

export default function StationDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: station, isLoading, error } = useStationDetail(id ?? '');
    const { data: demand, isLoading: isDemandLoading } = useDemandPrediction(id ?? '');
    const { data: pricing } = useStationPricing(id ?? '');
    const { data: reviewData, isLoading: isReviewsLoading } = useStationReviews(id ?? '');

    if (isLoading || !station) {
        return (
            <View style={styles.container}>
                <Skeleton width="100%" height={260} radius="sm" />
                <View style={styles.loadingContent}>
                    <Skeleton width={220} height={32} style={styles.loadingSpacing} />
                    <Skeleton width={280} height={16} style={styles.loadingSpacing} />
                    <Skeleton width={120} height={20} />
                </View>
            </View>
        );
    }

    const openMaps = async () => {
        const url =
            Platform.OS === 'ios'
                ? `maps://?daddr=${station.lat},${station.lng}`
                : `geo:${station.lat},${station.lng}?q=${encodeURIComponent(station.name)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (!supported) {
                throw new Error('Unsupported maps URL');
            }

            await Linking.openURL(url);
        } catch {
            Alert.alert('Unable to open maps', 'Maps could not be opened on this device right now.');
        }
    };

    const billingUnit = station.price_per_unit != null ? '/kWh' : station.price_per_hour != null ? '/hour' : '';
    const priceLabel =
        pricing?.effective_price != null
            ? `${formatCurrency(pricing.effective_price)}${billingUnit}`
            : station.price_per_unit != null
              ? `${formatCurrency(station.price_per_unit)}/kWh`
              : station.price_per_hour != null
                ? `${formatCurrency(station.price_per_hour)}/hour`
                : 'Dynamic pricing';

    const chargerTypes = (station.charger_types ?? []).filter(Boolean) as string[];
    const reviewSummary = reviewData?.summary;
    const totalReviews = reviewSummary?.total_reviews ?? station.total_reviews ?? 0;
    const averageRatingValue = reviewSummary?.avg_rating ?? station.avg_rating;
    const averageRating =
        typeof averageRatingValue === 'number' && Number.isFinite(averageRatingValue)
            ? averageRatingValue.toFixed(1)
            : 'New';
    const topReviews = reviewData?.reviews?.slice(0, 3) ?? [];
    const slotIndicatorCount = Math.min(Math.max(station.total_slots, 0), 24);

    return (
        <View style={styles.container}>
            <ScrollView bounces={false} style={styles.scrollview} contentContainerStyle={styles.content}>
                <View style={styles.heroContainer}>
                    <Image
                        source={{
                            uri: station.image_url || FALLBACK_STATION_IMAGE,
                        }}
                        style={styles.heroImage}
                    />
                    <View style={styles.overlay} />

                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.brand.white} />
                    </TouchableOpacity>
                </View>

                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.infoSection}>
                    <Typography variant="h1" color="primary">
                        {station.name}
                    </Typography>
                    <Typography variant="body" color="secondary" style={styles.address}>
                        {formatStationAddress(station.address)}
                    </Typography>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color={Colors.semantic.warning} />
                        <Typography variant="label" style={styles.ratingText}>
                            {averageRating}
                        </Typography>
                        <Typography variant="caption" color="tertiary">
                            ({totalReviews} reviews)
                        </Typography>
                    </View>

                    {error ? (
                        <Typography variant="bodySmall" color="warning" style={styles.warningText}>
                            Some station details may be stale.
                        </Typography>
                    ) : null}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                        CHARGER TYPES
                    </Typography>
                    <View style={styles.chargersContainer}>
                        {chargerTypes.length > 0 ? (
                            chargerTypes.map((chargerType) => (
                                <View key={chargerType} style={styles.chargerBadge}>
                                    <Ionicons name="flash" size={14} color={Colors.brand.white} />
                                    <Typography variant="caption" style={styles.chargerBadgeText}>
                                        {chargerType}
                                    </Typography>
                                </View>
                            ))
                        ) : (
                            <Typography variant="bodySmall" color="secondary">
                                Charger type details are unavailable for this station.
                            </Typography>
                        )}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                        AVAILABILITY
                    </Typography>
                    <View style={styles.row}>
                        <View style={styles.availabilityDots}>
                            {Array.from({ length: slotIndicatorCount }).map((_, index) => (
                                <View
                                    key={`${station.id}-${index}`}
                                    style={[
                                        styles.dot,
                                        index < station.available_slots ? styles.dotAvailable : styles.dotOccupied,
                                    ]}
                                />
                            ))}
                        </View>
                        <Typography variant="body" color="primary" style={styles.availabilityText}>
                            {station.available_slots} of {station.total_slots} available
                        </Typography>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailBox}>
                            <MaterialCommunityIcons name="currency-inr" size={20} color={Colors.brand.primary} />
                            <Typography variant="label" style={styles.detailTitle}>
                                {priceLabel}
                            </Typography>
                            <Typography variant="caption" color="tertiary">
                                {pricing?.surge_multiplier && pricing.surge_multiplier !== 1
                                    ? `${station.network} • ${pricing.surge_multiplier.toFixed(2)}x surge`
                                    : station.network}
                            </Typography>
                        </View>
                        <View style={styles.detailBox}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.brand.primary} />
                            <Typography variant="label" style={styles.detailTitle}>
                                Operating Hours
                            </Typography>
                            <Typography variant="caption" color="tertiary">
                                {station.operating_hours?.open ?? '00:00'} - {station.operating_hours?.close ?? '23:59'}
                            </Typography>
                        </View>
                    </View>
                </Animated.View>

                <View style={styles.chartSection}>
                    <DemandChart
                        forecast={demand?.forecast}
                        peakHours={demand?.peak_hours}
                        isLoading={isDemandLoading}
                    />
                </View>

                <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                        RECENT REVIEWS
                    </Typography>
                    {isReviewsLoading ? (
                        <Typography variant="bodySmall" color="secondary">
                            Loading reviews...
                        </Typography>
                    ) : topReviews.length === 0 ? (
                        <Typography variant="bodySmall" color="secondary">
                            No user reviews yet for this station.
                        </Typography>
                    ) : (
                        topReviews.map((review) => {
                            const safeRating = Math.min(Math.max(Number(review.rating) || 0, 0), 5);

                            return (
                                <View key={review.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <Typography variant="label" color="primary">
                                            {review.phone_masked}
                                        </Typography>
                                        <Typography variant="caption" color="tertiary">
                                            {Array.from({ length: safeRating })
                                                .map(() => '★')
                                                .join('')}
                                        </Typography>
                                    </View>
                                    <Typography variant="bodySmall" color="secondary">
                                        {review.comment?.trim() || 'User left a rating without a written comment.'}
                                    </Typography>
                                </View>
                            );
                        })
                    )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.actionsContainer}>
                    <Button
                        variant="white"
                        label="Open in Maps"
                        onPress={openMaps}
                        fullWidth
                        style={styles.mapsButton}
                    />
                </Animated.View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <View style={styles.bottomCTA}>
                <View>
                    <Typography variant="caption" color="tertiary">
                        Starting from
                    </Typography>
                    <Typography variant="h3" color="primary">
                        {priceLabel}
                    </Typography>
                </View>
                <Button
                    label="Book a Slot"
                    onPress={() => router.push(`/station/${station.id}/slots`)}
                    style={styles.bookButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.white },
    scrollview: { flex: 1 },
    content: { paddingBottom: Spacing.xxl },
    heroContainer: { height: 260, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
    backButton: {
        position: 'absolute',
        top: 50,
        left: Spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: { padding: Spacing.xl },
    loadingSpacing: { marginBottom: Spacing.sm },
    infoSection: { padding: Spacing.xl, paddingBottom: Spacing.md },
    address: { marginTop: Spacing.xs, marginBottom: Spacing.md },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { marginLeft: 4, marginRight: 6 },
    warningText: { marginTop: Spacing.sm },
    section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
    sectionTitle: { marginBottom: Spacing.sm, fontSize: 13, letterSpacing: 1 },
    chargersContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chargerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand.primary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: Radius.pill,
    },
    chargerBadgeText: { color: Colors.brand.white, marginLeft: 4 },
    row: { flexDirection: 'row', alignItems: 'center' },
    availabilityDots: {
        flexDirection: 'row',
        gap: 4,
        marginRight: Spacing.md,
        flexWrap: 'wrap',
        maxWidth: 160,
    },
    dot: { width: 12, height: 12, borderRadius: 6 },
    dotAvailable: { backgroundColor: Colors.semantic.success },
    dotOccupied: { backgroundColor: Colors.border.divider },
    availabilityText: { fontWeight: '600' },
    detailsGrid: { flexDirection: 'row', gap: Spacing.md },
    detailBox: {
        flex: 1,
        backgroundColor: Colors.surface.default,
        padding: Spacing.md,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    detailTitle: { marginTop: Spacing.sm, marginBottom: 2 },
    chartSection: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
    reviewCard: {
        backgroundColor: Colors.surface.default,
        padding: Spacing.md,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        marginBottom: Spacing.sm,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    actionsContainer: { paddingHorizontal: Spacing.xl },
    mapsButton: { marginBottom: Spacing.md },
    bottomSpacer: { height: 100 },
    bottomCTA: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.brand.white,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: 34,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border.subtle,
    },
    bookButton: { minWidth: 160 },
});
