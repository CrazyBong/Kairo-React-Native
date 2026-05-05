import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStationDetail, Station } from '@/api/stations';
import { DemandChart } from '@/components/discovery/DemandChart';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function StationDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: station, isLoading, error } = useStationDetail(id || '1');

    if (isLoading || !station) {
        return (
            <View style={styles.container}>
                <Skeleton width="100%" height={260} radius="sm" />
                <View style={{ padding: Spacing.xl }}>
                    <Skeleton width={200} height={32} style={{ marginBottom: Spacing.sm }} />
                    <Skeleton width={280} height={16} style={{ marginBottom: Spacing.md }} />
                    <Skeleton width={120} height={20} />

                    <View style={{ flexDirection: 'row', marginTop: Spacing.xl, gap: Spacing.sm }}>
                        <Skeleton width={80} height={30} radius="pill" />
                        <Skeleton width={80} height={30} radius="pill" />
                    </View>
                </View>
            </View>
        );
    }

    const openMaps = (s: Station) => {
        const url = Platform.OS === 'ios'
            ? `maps://?daddr=${s.lat},${s.lng}`
            : `geo:${s.lat},${s.lng}?q=${encodeURIComponent(s.name)}`;
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <ScrollView bounces={false} style={styles.scrollview} contentContainerStyle={styles.content}>

                {/* Header Image & Back Button */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: station.image_url || 'https://via.placeholder.com/400x250' }} style={styles.heroImage} />
                    <View style={styles.overlay} />

                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.brand.white} />
                    </TouchableOpacity>
                </View>

                {/* Station Info */}
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.infoSection}>
                    <Typography variant="h1" color="primary">{station.name}</Typography>
                    <Typography variant="body" color="secondary" style={styles.address as any}>{station.address}</Typography>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color={Colors.semantic.warning} />
                        <Typography variant="label" style={styles.ratingText as any}>{station.rating}</Typography>
                        <Typography variant="caption" color="tertiary">({station.total_reviews} reviews)</Typography>
                    </View>
                </Animated.View>

                {/* Charger Types */}
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>CHARGER TYPES</Typography>
                    <View style={styles.chargersContainer}>
                        {station.connectors.map(conn => (
                            <View key={conn.id} style={styles.chargerBadge as any}>
                                <Ionicons name="flash" size={14} color={Colors.brand.white} />
                                <Typography variant="caption" style={{ color: Colors.brand.white, marginLeft: 4 }}>
                                    {conn.type} {conn.capacity_kw}kW
                                </Typography>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Availability */}
                <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>AVAILABILITY</Typography>
                    <View style={styles.row}>
                        <View style={styles.availabilityDots}>
                            {Array.from({ length: station.total_slots }).map((_, i) => (
                                <View key={i} style={[
                                    styles.dot,
                                    i < station.available_slots ? styles.dotAvailable : styles.dotOccupied
                                ] as any} />
                            ))}
                        </View>
                        <Typography variant="body" color="primary" style={styles.availabilityText}>
                            {station.available_slots} of {station.total_slots} available
                        </Typography>
                    </View>
                </Animated.View>

                {/* Pricing & Hours */}
                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailBox as any}>
                            <MaterialCommunityIcons name="currency-inr" size={20} color={Colors.brand.primary} />
                            <Typography variant="label" style={styles.detailTitle as any}>₹{station.pricing_kwh.toFixed(2)}/kWh</Typography>
                            <Typography variant="caption" color="tertiary">₹{station.pricing_min.toFixed(2)} idle fee/min</Typography>
                        </View>
                        <View style={styles.detailBox as any}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.brand.primary} />
                            <Typography variant="label" style={styles.detailTitle as any}>Operating Hours</Typography>
                            <Typography variant="caption" color="tertiary">{station.opening_hours}</Typography>
                        </View>
                    </View>

                    {/* Peak Hour Surge Pricing Banner */}
                    <View style={styles.surgeBanner}>
                        <Ionicons name="flash" size={16} color={Colors.semantic.warning} />
                        <Typography variant="bodySmall" style={{ marginLeft: Spacing.sm, color: Colors.brand.dark, flex: 1 }}>
                            <Typography variant="bodySmall" style={{ fontFamily: 'Inter_700Bold', color: '#B45309' }}>Surge Pricing Active:</Typography>
                            {' '}Current rates are 1.2x baseline due to peak local grid demand.
                        </Typography>
                    </View>
                </Animated.View>

                {/* Demand Forecast Chart */}
                <View style={{ paddingHorizontal: Spacing.xl, marginTop: Spacing.xl }}>
                    <DemandChart />
                </View>

                {/* Actions */}
                <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.actionsContainer}>
                    <Button
                        variant="white"
                        label="View on Google Maps"
                        onPress={() => openMaps(station)}
                        fullWidth
                        style={{ marginBottom: Spacing.md }}
                    />
                </Animated.View>

                {/* Spacer for bottom sheet */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Bottom CTA */}
            <View style={styles.bottomCTA}>
                <View>
                    <Typography variant="caption" color="tertiary">Starting from</Typography>
                    <Typography variant="h3" color="primary">₹{station.pricing_kwh.toFixed(2)}<Typography variant="body" color="secondary">/kWh</Typography></Typography>
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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollview: { flex: 1 },
    content: { paddingBottom: Spacing.xxl },
    heroContainer: { height: 260, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    backButton: { position: 'absolute', top: 50, left: Spacing.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    infoSection: { padding: Spacing.xl, paddingBottom: Spacing.md },
    address: { marginTop: Spacing.xs, marginBottom: Spacing.md },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { marginLeft: 4, marginRight: 6 },
    section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
    sectionTitle: { marginBottom: Spacing.sm, fontSize: 13, letterSpacing: 1 },
    chargersContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chargerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.brand.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill },
    row: { flexDirection: 'row', alignItems: 'center' },
    availabilityDots: { flexDirection: 'row', gap: 4, marginRight: Spacing.md },
    dot: { width: 12, height: 12, borderRadius: 6 },
    dotAvailable: { backgroundColor: Colors.semantic.success },
    dotOccupied: { backgroundColor: Colors.border.divider },
    availabilityText: { fontWeight: '600' },
    detailsGrid: { flexDirection: 'row', gap: Spacing.md },
    detailBox: { flex: 1, backgroundColor: Colors.surface.default, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
    detailTitle: { marginTop: Spacing.sm, marginBottom: 2 },
    actionsContainer: { paddingHorizontal: Spacing.xl },
    surgeBanner: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: Spacing.md, borderRadius: Radius.md, marginTop: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: '#FEF3C7' },
    bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.brand.white, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 },
    bookButton: { minWidth: 160 },
});
