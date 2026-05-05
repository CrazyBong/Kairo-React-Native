import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Shadow, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { MapView } from '@/components/discovery/MapView';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function DiscoverScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MapView />

      {/* Route Planner FAB */}
      <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/route-planner')}>
          <Ionicons name="navigate" size={20} color={Colors.brand.white} />
          <Typography variant="label" style={{ color: Colors.brand.white, marginLeft: 8 }}>Plan Route</Typography>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.white,
  },
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    alignSelf: 'center',
    zIndex: 100,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.dark,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    ...Shadow.float,
  }
});
