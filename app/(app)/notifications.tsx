import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Booking Confirmed!',
    message: 'Your slot at Tata Power Supercharger (4:30 PM) is secured. Navigate there 5 mins early.',
    time: '2 hours ago',
    type: 'success',
    isRead: false,
  },
  {
    id: 'n2',
    title: 'Surge Pricing Alert ⚡',
    message: 'High demand at Ather Grid Hub right now! Prices have temporarily surged 1.5x.',
    time: 'Yesterday',
    type: 'warning',
    isRead: true,
  },
  {
    id: 'n3',
    title: 'Charging Completed',
    message: 'Your vehicle has reached 80% charge. Total energy delivered: 24.5 kWh.',
    time: 'Mon, 02:45 PM',
    type: 'info',
    isRead: true,
  },
  {
    id: 'n4',
    title: 'Wallet Top-up Successful',
    message: '₹1000 was successfully added to your Kairo Wallet.',
    time: 'Last Week',
    type: 'success',
    isRead: true,
  }
];

export default function NotificationsScreen() {
  // FIX: notifications are stateful so read/unread can be mutated
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // FIX: "Mark all read" is now functional
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // FIX: tapping a card marks it as read
  const handleTapNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2" color="primary">Alerts</Typography>
        {/* FIX: "Mark all read" has onPress handler */}
        <TouchableOpacity onPress={handleMarkAllRead} accessibilityLabel="Mark all notifications as read">
          <Typography variant="caption" color="secondary" style={styles.markRead}>Mark all read</Typography>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notif, index) => {
          let iconName: string = 'notifications';
          let iconColor: string = Colors.brand.primary;

          if (notif.type === 'success') { iconName = 'checkmark-circle'; iconColor = Colors.semantic.success; }
          if (notif.type === 'warning') { iconName = 'warning'; iconColor = Colors.semantic.warning; }
          if (notif.type === 'info') { iconName = 'flash'; iconColor = Colors.brand.primary; }

          return (
            <Animated.View key={notif.id} entering={FadeInUp.delay(100 * index).springify()}>
              {/* FIX: card is interactive—tapping marks notification as read */}
              <TouchableOpacity
                style={[styles.notificationCard, !notif.isRead && styles.unreadCard]}
                activeOpacity={0.7}
                onPress={() => handleTapNotification(notif.id)}
                accessibilityLabel={`Notification: ${notif.title}`}
              >
                {!notif.isRead && <View style={styles.unreadDot} />}

                <View style={styles.iconBox}>
                  <Ionicons name={iconName as any} size={24} color={iconColor} />
                </View>

                <View style={styles.textContent}>
                  <View style={styles.cardHeader}>
                    <Typography variant="label" color={notif.isRead ? 'secondary' : 'primary'}>{notif.title}</Typography>
                    <Typography variant="caption" color="tertiary" style={{ fontSize: 10 }}>{notif.time}</Typography>
                  </View>
                  <Typography variant="bodySmall" color={notif.isRead ? 'tertiary' : 'secondary'} style={{ marginTop: 4, lineHeight: 18 }}>
                    {notif.message}
                  </Typography>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  header: {
    paddingTop: 60, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
    backgroundColor: Colors.brand.white, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'baseline',
    borderBottomWidth: 1, borderBottomColor: Colors.border.subtle,
  },
  markRead: { textDecorationLine: 'underline' },
  content: { padding: Spacing.lg },
  notificationCard: {
    flexDirection: 'row', backgroundColor: Colors.brand.white, padding: Spacing.lg,
    borderRadius: Radius.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: 'transparent',
  },
  // FIX: invalid hex '#FDFPFF' replaced with valid subtle green-white
  unreadCard: { borderColor: '#EAF9E7', backgroundColor: '#F6FFF6' },
  unreadDot: {
    position: 'absolute', top: Spacing.lg, left: Spacing.sm,
    width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand.primary,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface.subtle,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  textContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});
