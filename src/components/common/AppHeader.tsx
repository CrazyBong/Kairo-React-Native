import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '@/constants';
import { Typography } from '../ui/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppHeaderProps {
  title: string;
  onNotificationPress?: () => void;
  unreadCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, onNotificationPress, unreadCount = 0 }) => {
  return (
    <View style={styles.container}>
      <Typography variant="h3" color="primary">{title}</Typography>
      
      <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
        <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.text.primary} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Typography variant="caption" style={styles.badgeText} color="inverted">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.divider,
  },
  iconButton: {
    padding: Spacing.xs,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
