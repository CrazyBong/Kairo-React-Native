import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { useAuthStore } from '@/store/auth.store';
import { ConnectedCarHero } from '@/components/profile/ConnectedCarHero';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { triggerSimulatorCharging } from '@/utils/safe-battery';

export default function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Welcome Bar */}
      <View style={styles.topBar}>
        <Typography variant="h3" color="primary">Hi, {user?.name || 'John'} 👋</Typography>
        <Ionicons name="notifications-outline" size={24} color={Colors.brand.dark} />
      </View>

      {/* Connected Vehicle Dashboard */}
      <ConnectedCarHero
        batteryLevel={72}
        carName="Model 3 Long Range"
        status="Parked"
      />

      {/* Settings & Stats */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.contentSection}>
        <Typography variant="h4" color="primary" style={styles.sectionTitle}>VEHICLE STATS</Typography>

        <SettingsRow icon="flash" title="Total Charged" value="1,420 kWh" />
        <SettingsRow icon="leaf" title="CO2 Saved" value="480 kg" />
        <SettingsRow icon="location" title="Favorite Station" value="Tata Power (2m)" />

        <Typography variant="h4" color="primary" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>KAIRO WALLET</Typography>

        <View style={styles.walletCard}>
          <View>
            <Typography variant="caption" color="tertiary" style={{ marginBottom: 4 }}>Available Balance</Typography>
            <Typography variant="h2" color="primary">₹1,500.00</Typography>
          </View>
          <TouchableOpacity style={styles.topUpBtn} onPress={() => Alert.alert("Add Funds", "Razorpay wallet top-up flow initiated.")}>
            <Ionicons name="add-circle" size={18} color={Colors.brand.primary} />
            <Typography variant="label" color="primary" style={{ marginLeft: 4 }}>Top Up</Typography>
          </TouchableOpacity>
        </View>

        <Typography variant="h4" color="primary" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>ACCOUNT</Typography>

        <SettingsRow icon="person" title="Personal Information" value="Edit" valueColor={Colors.brand.primary} onPress={() => router.push('/profile/personal-info')} />
        <SettingsRow icon="card" title="Payment Methods" onPress={() => router.push('/profile/payment-methods')} />
        <SettingsRow icon="help-circle" title="Help & Support" onPress={() => router.push('/profile/help')} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.semantic.error} />
          <Typography variant="button" style={{ color: Colors.semantic.error, marginLeft: 8 }}>Log Out</Typography>
        </TouchableOpacity>

        {/* FIX: Manual Override for Hackathon MVP Testing */}
        <TouchableOpacity
          style={styles.simulateBtn}
          onPress={() => {
            triggerSimulatorCharging(true);
            router.push('/charging/session');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="flash" size={20} color={Colors.brand.white} />
          <Typography variant="button" style={{ color: Colors.brand.white, marginLeft: 8 }}>Test Supercharger Dashboard</Typography>
        </TouchableOpacity>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </Animated.View>
    </ScrollView>
  );
}

const SettingsRow = ({ icon, title, value, valueColor, onPress }: { icon: any, title: string, value?: string, valueColor?: string, onPress?: () => void }) => (
  <TouchableOpacity style={styles.row} onPress={onPress || (() => { })} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={18} color={Colors.brand.primary} />
      </View>
      <Typography variant="body" color="primary">{title}</Typography>
    </View>
    <View style={styles.rowRight}>
      {value && <Typography variant="bodySmall" style={{ color: valueColor || Colors.text.secondary }}>{value}</Typography>}
      <Ionicons name="chevron-forward" size={20} color={Colors.border.subtle} style={{ marginLeft: Spacing.sm }} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9', // Slightly cooler off-white for profile backdrop
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.brand.white,
  },
  contentSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontSize: 13,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.brand.white,
    padding: Spacing.md,
    marginVertical: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2', // subtle error red
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  walletCard: {
    backgroundColor: '#F6FCF8',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.dark,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  }
});
