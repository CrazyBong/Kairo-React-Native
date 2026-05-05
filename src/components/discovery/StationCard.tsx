import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants';
import { Typography } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Station {
  id: string;
  name: string;
  address: string;
  distance: number; // km
  available_ports: number;
  total_ports: number;
  charger_types: string[]; // e.g., 'CCS2', 'Type 2'
}

interface StationCardProps {
  station: Station;
  onPress?: (id: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({ station, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => onPress?.(station.id)}
      style={styles.container}
    >
      <View style={styles.imagePlaceholder}>
        <MaterialCommunityIcons name="ev-station" size={32} color={Colors.brand.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h3" color="primary" numberOfLines={1} style={styles.title}>
            {station.name}
          </Typography>
          <View style={styles.distanceBadge}>
            <Typography variant="caption" color="secondary">{station.distance} km</Typography>
          </View>
        </View>
        
        <Typography variant="caption" color="tertiary" numberOfLines={1} style={styles.address}>
          {station.address}
        </Typography>

        <View style={styles.metrics}>
          <View style={styles.metricRow}>
            <MaterialCommunityIcons name="ev-plug-ccs2" size={16} color={Colors.text.secondary} />
            <Typography variant="bodySmall" color="secondary" style={styles.metricText}>
              {station.charger_types.join(', ')}
            </Typography>
          </View>
          <View style={styles.metricRow}>
            <View style={[styles.statusDot, { backgroundColor: station.available_ports > 0 ? Colors.semantic.success : Colors.semantic.error }]} />
            <Typography variant="bodySmall" color={station.available_ports > 0 ? 'success' : 'error'} style={styles.metricText}>
              {station.available_ports}/{station.total_ports} Available
            </Typography>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.default,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.md,
    width: 300,
    elevation: 2, // Minor shadow
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    backgroundColor: Colors.brand.mintWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: Colors.surface.subtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    marginLeft: Spacing.sm,
  },
  address: {
    marginTop: 2,
  },
  metrics: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    marginLeft: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
