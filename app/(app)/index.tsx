import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { MapView } from '@/components/discovery/MapView';
import { StationCard } from '@/components/discovery/StationCard';
import { Typography } from '@/components/ui/Typography';
import { useNearbyStations } from '@/api/stations';
import { Colors, Radius, Shadow, Spacing } from '@/constants';

const DEFAULT_SEARCH = {
    lat: 23.2599,
    lng: 77.4126,
    radius_km: 12,
    available_only: false,
    limit: 20,
};

export default function DiscoverScreen() {
    const router = useRouter();
    const { data: stations = [], isLoading, error, refetch } = useNearbyStations(DEFAULT_SEARCH);

    return (
        <View style={styles.container}>
            <MapView
                stations={stations}
                onSelectStation={(stationId) => router.push(`/station/${stationId}`)}
            />

            <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.sheet} testID="discover-screen">
                <View style={styles.sheetHeader}>
                    <View>
                        <Typography variant="h3" color="primary">
                            Nearby stations
                        </Typography>
                        <Typography variant="bodySmall" color="secondary">
                            Backend-powered search around Bhopal demo coordinates
                        </Typography>
                    </View>

                    <TouchableOpacity
                        style={styles.routeButton}
                        activeOpacity={0.85}
                        onPress={() => router.push('/route-planner')}
                    >
                        <Ionicons name="navigate" size={18} color={Colors.brand.white} />
                        <Typography variant="label" style={styles.routeButtonText}>
                            Plan Route
                        </Typography>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.centerState}>
                        <ActivityIndicator color={Colors.brand.primary} />
                        <Typography variant="body" color="secondary" style={styles.stateText}>
                            Loading stations...
                        </Typography>
                    </View>
                ) : error ? (
                    <View style={styles.centerState}>
                        <Typography variant="body" color="error" align="center">
                            We could not load nearby stations right now.
                        </Typography>
                        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                            <Typography variant="label" color="primary">
                                Retry
                            </Typography>
                        </TouchableOpacity>
                    </View>
                ) : stations.length === 0 ? (
                    <View style={styles.centerState}>
                        <Typography variant="body" color="secondary" align="center">
                            No stations were found in this area yet.
                        </Typography>
                    </View>
                ) : (
                    <FlatList
                        data={stations}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <StationCard
                                station={{
                                    id: item.id,
                                    name: item.name,
                                    address:
                                        item.address?.line1 ??
                                        ([item.address?.city, item.address?.state].filter(Boolean).join(', ') ||
                                            'Address unavailable'),
                                    distance: item.distance_km ?? 0,
                                    available_ports: item.available_slots,
                                    total_ports: item.total_slots,
                                    charger_types: (item.charger_types ?? []).filter(Boolean) as string[],
                                }}
                                onPress={(stationId) => router.push(`/station/${stationId}`)}
                            />
                        )}
                    />
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.brand.white,
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.brand.white,
        borderTopLeftRadius: Radius.lg,
        borderTopRightRadius: Radius.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
        ...Shadow.float,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    routeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand.dark,
        borderRadius: Radius.pill,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    routeButtonText: {
        color: Colors.brand.white,
        marginLeft: 6,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.md,
    },
    centerState: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
        paddingHorizontal: Spacing.lg,
    },
    stateText: {
        marginTop: Spacing.sm,
    },
    retryButton: {
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderRadius: Radius.pill,
        borderColor: Colors.border.subtle,
    },
});
