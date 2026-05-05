import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapViewNative, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { Station, formatStationAddress } from '@/api/stations';
import { Colors } from '@/constants';

import { Typography } from '../ui/Typography';

interface DiscoveryMapViewProps {
    stations: Station[];
    onSelectStation: (stationId: string) => void;
}

const DEFAULT_REGION = {
    latitude: 23.2599,
    longitude: 77.4126,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
};

export const MapView: React.FC<DiscoveryMapViewProps> = ({ stations, onSelectStation }) => {
    if (Platform.OS === 'web') {
        return (
            <View style={styles.webFallback}>
                <Typography variant="h3" color="primary">
                    Live station discovery is available in native builds.
                </Typography>
                <Typography variant="body" color="secondary" align="center" style={styles.webText}>
                    The list below is still connected to the backend, so you can browse and open station details from
                    the web preview.
                </Typography>
            </View>
        );
    }

    const firstStation = stations[0];
    const initialRegion = firstStation
        ? {
              latitude: firstStation.lat,
              longitude: firstStation.lng,
              latitudeDelta: DEFAULT_REGION.latitudeDelta,
              longitudeDelta: DEFAULT_REGION.longitudeDelta,
          }
        : DEFAULT_REGION;

    return (
        <MapViewNative
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={initialRegion}
        >
            {stations.map((station) => (
                <Marker
                    key={station.id}
                    coordinate={{ latitude: station.lat, longitude: station.lng }}
                    title={station.name}
                    description={formatStationAddress(station.address)}
                    pinColor={station.available_slots > 0 ? Colors.brand.primary : Colors.semantic.error}
                    onPress={() => onSelectStation(station.id)}
                />
            ))}
        </MapViewNative>
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    webFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.brand.mintWhite,
        padding: 24,
    },
    webText: {
        marginTop: 8,
        maxWidth: 280,
    },
});
