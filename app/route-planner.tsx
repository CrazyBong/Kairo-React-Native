import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useRoutePlanner } from '@/api/routing';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Shadow, Spacing } from '@/constants';
import { normalizeApiError } from '@/utils/api-error';
import { getSafeBatteryLevel } from '@/utils/safe-battery';

const DEFAULT_ORIGIN = {
    label: 'Bhopal',
    lat: 23.2599,
    lng: 77.4126,
};

const DESTINATION_PRESETS = [
    { label: 'Indore', lat: 22.7196, lng: 75.8577 },
    { label: 'Sagar', lat: 23.8388, lng: 78.7378 },
    { label: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
];

function formatDuration(totalMinutes: number): string {
    const roundedMinutes = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;

    if (hours === 0) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
}

export default function RoutePlannerScreen() {
    const router = useRouter();
    const routePlannerMutation = useRoutePlanner();
    const [destinationLabel, setDestinationLabel] = useState(DESTINATION_PRESETS[0].label);
    const [selectedDestination, setSelectedDestination] = useState(DESTINATION_PRESETS[0]);
    const [batteryPercent, setBatteryPercent] = useState('');
    const [vehicleRangeKm, setVehicleRangeKm] = useState('');
    const matchedDestination = useMemo(
        () =>
            DESTINATION_PRESETS.find(
                (preset) => preset.label.trim().toLowerCase() === destinationLabel.trim().toLowerCase()
            ) ?? null,
        [destinationLabel]
    );

    const routeResult = routePlannerMutation.data;
    const totalMinutes = useMemo(() => {
        const durationMinutes = routeResult?.route?.duration_min;
        if (typeof durationMinutes === 'number') {
            return durationMinutes;
        }

        const durationSeconds = routeResult?.route?.duration_sec;
        if (typeof durationSeconds === 'number') {
            return durationSeconds / 60;
        }

        return null;
    }, [routeResult]);
    const parsedBatteryPercent = Number(batteryPercent);
    const parsedVehicleRangeKm = Number(vehicleRangeKm);
    const canPlanRoute =
        Boolean(matchedDestination) &&
        Number.isFinite(parsedBatteryPercent) &&
        parsedBatteryPercent > 0 &&
        parsedBatteryPercent <= 100 &&
        Number.isFinite(parsedVehicleRangeKm) &&
        parsedVehicleRangeKm > 0;

    useEffect(() => {
        let isMounted = true;

        getSafeBatteryLevel().then((level) => {
            if (isMounted) {
                setBatteryPercent(String(Math.round(level * 100)));
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const handlePlanRoute = () => {
        if (!matchedDestination || !canPlanRoute) {
            return;
        }

        routePlannerMutation.mutate({
            origin_lat: DEFAULT_ORIGIN.lat,
            origin_lng: DEFAULT_ORIGIN.lng,
            dest_lat: matchedDestination.lat,
            dest_lng: matchedDestination.lng,
            current_battery_percent: parsedBatteryPercent,
            vehicle_range_km: parsedVehicleRangeKm,
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Typography variant="h3" color="primary">
                    EV Route Planner
                </Typography>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp.springify()} style={styles.inputCard}>
                    <View style={styles.routeInputs}>
                        <View style={styles.routeDecor}>
                            <View style={styles.dotOrigin} />
                            <View style={styles.lineDecor} />
                            <Ionicons name="location" size={16} color={Colors.semantic.error} />
                        </View>
                        <View style={styles.inputsWrapper}>
                            <View style={styles.inputBox}>
                                <Typography variant="caption" color="secondary">
                                    FROM
                                </Typography>
                                <TextInput style={styles.textInput} value={DEFAULT_ORIGIN.label} editable={false} />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.inputBox}>
                                <Typography variant="caption" color="secondary">
                                    TO
                                </Typography>
                                <TextInput
                                    style={styles.textInput}
                                    value={destinationLabel}
                                    onChangeText={(text) => {
                                        setDestinationLabel(text);
                                        const matchedPreset = DESTINATION_PRESETS.find(
                                            (preset) =>
                                                preset.label.trim().toLowerCase() === text.trim().toLowerCase()
                                        );
                                        if (matchedPreset) {
                                            setSelectedDestination(matchedPreset);
                                        }
                                    }}
                                    placeholder="Destination"
                                    placeholderTextColor={Colors.text.tertiary}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.destinationOptions}>
                        {DESTINATION_PRESETS.map((preset) => {
                            const isSelected = preset.label === selectedDestination.label;

                            return (
                                <TouchableOpacity
                                    key={preset.label}
                                    style={[styles.destinationChip, isSelected && styles.destinationChipSelected]}
                                    onPress={() => {
                                        setDestinationLabel(preset.label);
                                        setSelectedDestination(preset);
                                    }}
                                >
                                    <Typography variant="caption" color={isSelected ? 'inverted' : 'primary'}>
                                        {preset.label}
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.vehicleStats}>
                        <View style={styles.statInputBox}>
                            <Typography variant="caption" color="secondary">
                                Vehicle Range (km)
                            </Typography>
                            <TextInput
                                style={styles.statInput}
                                value={vehicleRangeKm}
                                onChangeText={(text) => setVehicleRangeKm(text.replace(/[^\d.]/g, ''))}
                                keyboardType="numeric"
                                placeholder="e.g. 220"
                                placeholderTextColor={Colors.text.tertiary}
                            />
                        </View>
                        <View style={styles.statInputBox}>
                            <Typography variant="caption" color="secondary">
                                Current Battery (%)
                            </Typography>
                            <TextInput
                                style={styles.statInput}
                                value={batteryPercent}
                                onChangeText={(text) => setBatteryPercent(text.replace(/[^\d.]/g, ''))}
                                keyboardType="numeric"
                                placeholder="e.g. 65"
                                placeholderTextColor={Colors.text.tertiary}
                            />
                        </View>
                    </View>

                    <Button
                        label={routePlannerMutation.isPending ? 'Planning...' : 'Calculate Charging Stops'}
                        onPress={handlePlanRoute}
                        style={styles.planButton}
                        fullWidth
                        disabled={!canPlanRoute}
                        loading={routePlannerMutation.isPending}
                    />

                    {!canPlanRoute ? (
                        <Typography variant="bodySmall" color="secondary" style={styles.helperText}>
                            Enter a supported destination, current battery percentage, and estimated vehicle range.
                        </Typography>
                    ) : null}

                    {routePlannerMutation.error ? (
                        <Typography variant="bodySmall" color="error" style={styles.errorText}>
                            {normalizeApiError(routePlannerMutation.error).message}
                        </Typography>
                    ) : null}
                </Animated.View>

                {routeResult ? (
                    <Animated.View entering={FadeIn.delay(300)}>
                        <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                            SUGGESTED FULL ROUTE
                        </Typography>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryMapMock}>
                                <Ionicons name="map-outline" size={48} color={Colors.brand.primary} style={styles.mapIcon} />
                                <Typography variant="label" color="primary" style={styles.summaryLabel}>
                                    Total: {routeResult.total_distance_km.toFixed(1)}km
                                    {totalMinutes !== null ? ` - ${formatDuration(totalMinutes)}` : ''}
                                </Typography>
                            </View>
                            <Typography variant="bodySmall" color="secondary" align="center" style={styles.summaryText}>
                                {routeResult.range_sufficient
                                    ? 'The current battery should be enough for this journey.'
                                    : `This route requires ${routeResult.charging_stops.length} charging stop(s) to stay within safe battery range.`}
                            </Typography>
                        </View>

                        {routeResult.charging_stops.map((stop, index) => (
                            <Animated.View
                                key={stop.station_id}
                                entering={FadeInUp.delay(500 + index * 100).springify()}
                                style={styles.stopCard}
                            >
                                <View style={styles.stopHeader}>
                                    <View style={styles.stopNumber}>
                                        <Typography variant="caption" style={styles.stopNumberText}>
                                            {index + 1}
                                        </Typography>
                                    </View>
                                    <View style={styles.stopInfo}>
                                        <Typography variant="h4" color="primary">
                                            {stop.station_name}
                                        </Typography>
                                        <Typography variant="caption" color="secondary">
                                            {stop.distance_from_origin_km.toFixed(1)}km from origin
                                        </Typography>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.bookStopBtn}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/station/[id]',
                                            params: { id: stop.station_id },
                                        })
                                    }
                                >
                                    <Typography variant="button" style={styles.bookStopText}>
                                        Book Slot Ahead
                                    </Typography>
                                    <Ionicons name="arrow-forward" size={16} color={Colors.brand.white} style={styles.bookStopIcon} />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}

                        {routeResult.charging_stops.length === 0 ? (
                            <View style={styles.noStopCard}>
                                <Typography variant="body" color="secondary" align="center">
                                    No charging stops are needed for this route.
                                </Typography>
                            </View>
                        ) : null}

                        <View style={styles.bottomSpacer} />
                    </Animated.View>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.mintWhite },
    header: {
        paddingTop: 60,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.brand.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    backBtn: { padding: Spacing.xs, width: 44 },
    headerSpacer: { width: 44 },
    content: { padding: Spacing.xl },
    inputCard: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.xl,
        borderRadius: Radius.lg,
        ...Shadow.subtle,
        marginBottom: Spacing.xxl,
    },
    routeInputs: { flexDirection: 'row', marginBottom: Spacing.lg },
    routeDecor: { width: 24, alignItems: 'center', marginTop: 14 },
    dotOrigin: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.brand.primary },
    lineDecor: { width: 2, height: 40, backgroundColor: Colors.border.divider, marginVertical: 4 },
    inputsWrapper: { flex: 1 },
    inputBox: { paddingVertical: Spacing.xs },
    divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: Spacing.xs },
    textInput: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: Colors.text.primary,
        paddingVertical: 4,
        outlineWidth: 0,
    },
    destinationOptions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
    destinationChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.pill,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        backgroundColor: Colors.brand.white,
    },
    destinationChipSelected: {
        backgroundColor: Colors.brand.dark,
        borderColor: Colors.brand.dark,
    },
    vehicleStats: {
        gap: Spacing.sm,
        backgroundColor: '#F8FAF9',
        padding: Spacing.md,
        borderRadius: Radius.md,
        marginTop: Spacing.md,
    },
    statInputBox: {
        backgroundColor: Colors.brand.white,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    statInput: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: Colors.text.primary,
        paddingTop: 4,
        paddingBottom: 2,
        outlineWidth: 0,
    },
    planButton: { marginTop: Spacing.xl },
    helperText: { marginTop: Spacing.sm },
    errorText: { marginTop: Spacing.md },
    sectionTitle: { marginBottom: Spacing.md, fontSize: 13, letterSpacing: 1 },
    summaryCard: { backgroundColor: '#EAF9E7', padding: Spacing.xl, borderRadius: Radius.lg, marginBottom: Spacing.lg },
    summaryMapMock: {
        backgroundColor: Colors.brand.white,
        borderRadius: Radius.md,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapIcon: { opacity: 0.5 },
    summaryLabel: { marginTop: 8 },
    summaryText: { marginTop: Spacing.md },
    stopCard: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.xl,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
        ...Shadow.subtle,
    },
    stopHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    stopNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.brand.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopNumberText: { color: Colors.brand.white },
    stopInfo: { flex: 1, marginLeft: Spacing.md },
    noStopCard: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.xl,
        borderRadius: Radius.lg,
        ...Shadow.subtle,
    },
    bookStopBtn: {
        backgroundColor: Colors.brand.dark,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: Radius.sm,
    },
    bookStopText: { color: Colors.brand.white },
    bookStopIcon: { marginLeft: 6 },
    bottomSpacer: { height: 100 },
});
