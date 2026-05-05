import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

// High-Fidelity Mock Data
const MOCK_BOOKINGS = [
  {
    id: 'BKG-5928',
    stationName: 'Tata Power Supercharger',
    address: 'Koramangala, Bangalore',
    chargerInfo: 'Slot A1 • CCS2',
    date: 'Today',
    time: '4:30 PM - 5:15 PM',
    status: 'Upcoming',
    cost: '₹450.00'
  },
  {
    id: 'BKG-1029',
    stationName: 'Ather Grid Hub',
    address: 'Indiranagar 100ft Road',
    chargerInfo: 'Slot B2 • Type 2',
    date: 'Mon, 25 Apr',
    time: '2:00 PM - 3:00 PM',
    status: 'Completed',
    cost: '₹320.00'
  },
  {
    id: 'BKG-9931',
    stationName: 'BP Pulse Highway',
    address: 'Mysore Road',
    chargerInfo: 'Slot C1 • Fast Charger',
    date: 'Fri, 15 Apr',
    time: '9:00 AM - 9:45 AM',
    status: 'Cancelled',
    cost: 'Refunded'
  }
];

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2" color="primary">My Bookings</Typography>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {MOCK_BOOKINGS.map((booking, index) => {
          const isUpcoming = booking.status === 'Upcoming';
          const isCancelled = booking.status === 'Cancelled';

          return (
            <Animated.View key={booking.id} entering={FadeInDown.delay(100 * index).springify()}>
              <TouchableOpacity style={styles.bookingCard} activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                  <View style={styles.badgeWrap}>
                    <View style={[styles.statusBadge, isUpcoming ? styles.badgeUpcoming : isCancelled ? styles.badgeCancelled : styles.badgeCompleted]}>
                      <Typography variant="caption" style={{ color: isUpcoming ? Colors.semantic.warning : isCancelled ? Colors.semantic.error : Colors.semantic.success }}>
                        {booking.status.toUpperCase()}
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="label" color="primary">#{booking.id}</Typography>
                </View>

                <View style={styles.cardBody}>
                  <Typography variant="h4" color="primary" style={{ marginBottom: 4 }}>{booking.stationName}</Typography>
                  <Typography variant="bodySmall" color="secondary" style={{ marginBottom: Spacing.md }}>{booking.address}</Typography>

                  <View style={styles.detailGrid}>
                    <DetailItem icon="calendar-outline" text={booking.date} />
                    <DetailItem icon="time-outline" text={booking.time} />
                    <DetailItem icon="flash-outline" text={booking.chargerInfo} />
                    <DetailItem icon="cash-outline" text={booking.cost} />
                  </View>
                </View>

                {isUpcoming && (
                  <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Typography variant="button" color="secondary">Cancel</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
                      <Typography variant="button" style={{ color: Colors.brand.white }}>Get Directions</Typography>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const DetailItem = ({ icon, text }: { icon: any, text: string }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={16} color={Colors.text.tertiary} />
    <Typography variant="bodySmall" color="secondary" style={{ marginLeft: 6 }}>{text}</Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  content: {
    padding: Spacing.xl,
  },
  bookingCard: {
    backgroundColor: Colors.brand.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Shadow.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeWrap: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: '#f3f4f6',
  },
  badgeUpcoming: {
    backgroundColor: '#FFFBEB',
  },
  badgeCompleted: {
    backgroundColor: '#ECFDF5',
  },
  badgeCancelled: {
    backgroundColor: '#FEF2F2',
  },
  cardBody: {
    marginBottom: Spacing.sm,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  }
});
