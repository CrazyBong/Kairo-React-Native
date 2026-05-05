import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Schematic Map Mock
// This completely bypasses react-native-maps to avoid the strict Google Play Services API Key lockdown on Android.
// We render a large scrollable area simulating a map with grid lines, and absolutely position our beautiful custom markers.

const isWeb = Platform.OS === 'web';
const { width, height } = Dimensions.get('window');
const MAP_SIZE = 1200; // Large scrollable area

const MOCK_STATIONS = [
  { id: '1', name: 'Tata Power', sub: 'Supercharger', top: 300, left: 400, type: 'Fast Charger', available: 4, total: 6 },
  { id: '2', name: 'Ather Grid', sub: 'Fast Charger', top: 500, left: 200, type: 'Fast Charger', available: 2, total: 4 },
  { id: '3', name: 'Tata Charge', sub: 'Supercharger', top: 250, left: 700, type: 'Supercharger', available: 3, total: 6 },
  { id: '4', name: 'BP Pulse', sub: 'Fast Charger', top: 650, left: 550, type: 'Fast Charger', available: 1, total: 2 },
  { id: '5', name: 'Statiq', sub: 'Fast Charger', top: 400, left: 800, type: 'Fast Charger', available: 2, total: 3 },
];

export const MapView: React.FC = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));

  if (isWeb) {
    return (
      <View style={styles.webFallback}>
        <Typography variant="h2" color="primary">Map View (Web Preview)</Typography>
        <Typography variant="body" color="tertiary" align="center" style={{ marginTop: 10 }}>
          Native maps require a native build. Please use iOS Simulator or Android Emulator.
        </Typography>
      </View>
    );
  }

  // Draw some basic grid lines to simulate roads/blocks
  const gridLines = [];
  for (let i = 0; i < MAP_SIZE; i += 100) {
    gridLines.push(<View key={`v-${i}`} style={[styles.gridLineVertical, { left: i }]} />);
    gridLines.push(<View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: i }]} />);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ width: MAP_SIZE }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ height: MAP_SIZE, width: MAP_SIZE, justifyContent: 'center', alignItems: 'center' }}
        >
          {/* Base Map Grid */}
          <View style={[styles.mapCanvas, { transform: [{ scale }] }]}>
            {gridLines}

            {/* Markers */}
            {MOCK_STATIONS.map((station) => {
              const isSelected = selectedId === station.id;
              return (
                <View
                  key={station.id}
                  style={[styles.absoluteMarker, { top: station.top, left: station.left, zIndex: isSelected ? 10 : 1 }]}
                >
                  <TouchableOpacity
                    style={styles.markerContainer}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedId(station.id);
                      router.push({ pathname: '/station/[id]', params: { id: station.id } });
                    }}
                  >
                    {/* Info Card */}
                    <View style={[styles.markerCard, isSelected && styles.markerCardSelected]}>
                      <View style={styles.markerRow}>
                        <View style={styles.logoCircle}>
                          <Typography variant="caption" color="primary">{station.name[0]}</Typography>
                        </View>
                        <View>
                          <Typography variant="label" color="primary" style={{ lineHeight: 14 }}>{station.name}</Typography>
                          <Typography variant="caption" style={{ color: Colors.semantic.success }}>{station.sub}</Typography>
                        </View>
                      </View>
                      <View style={styles.availabilityPill}>
                        <Typography variant="caption" style={{ color: Colors.semantic.success }}>
                          {station.available}/{station.total}
                        </Typography>
                        <Ionicons name="flash" size={10} color={Colors.semantic.success} style={{ marginLeft: 2 }} />
                      </View>
                    </View>

                    {/* Pointer Arrow */}
                    <View style={[styles.pointer, isSelected && styles.pointerSelected]} />
                    {/* Dot Anchor */}
                    <View style={styles.anchorDot} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Floating Mock Map Label */}
      <View style={styles.mockOverlay}>
        <Typography variant="caption" color="primary">Mock Map Active</Typography>
      </View>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <Ionicons
          name="add"
          size={24}
          color={Colors.brand.primary}
          style={styles.zoomButton}
          onPress={handleZoomIn}
        />
        <View style={styles.zoomDivider} />
        <Ionicons
          name="remove"
          size={24}
          color={Colors.brand.primary}
          style={styles.zoomButton}
          onPress={handleZoomOut}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.mintWhite,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.brand.mintWhite,
  },
  mapCanvas: {
    width: MAP_SIZE,
    height: MAP_SIZE,
    backgroundColor: '#E6E0D5', // Very subtle warm gray map background
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  mockOverlay: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  zoomControls: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: Colors.brand.white,
    borderRadius: Radius.lg,
    ...Shadow.subtle,
    overflow: 'hidden',
  },
  zoomButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.brand.white,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
  },

  // Custom Marker Styles
  absoluteMarker: {
    position: 'absolute',
    // align bottom center to top/left coord
    transform: [{ translateX: -75 }, { translateY: -60 }],
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  markerCard: {
    backgroundColor: Colors.brand.white,
    padding: Spacing.xs,
    paddingRight: Spacing.sm,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.subtle,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  markerCardSelected: {
    borderColor: Colors.brand.primary,
    ...Shadow.float,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.mintWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.subtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.brand.white,
    marginTop: -2,
  },
  pointerSelected: {
    borderTopColor: Colors.brand.primary,
  },
  anchorDot: {
    position: 'absolute',
    bottom: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.dark,
    borderWidth: 1.5,
    borderColor: Colors.brand.white,
  }
});
