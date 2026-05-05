import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useBookings } from '@/api/bookings';
import { ConnectedCarHero } from '@/components/profile/ConnectedCarHero';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { normalizeApiError } from '@/utils/api-error';
import { BatteryState, getSafeBatteryLevel, getSafeBatteryState, triggerSimulatorCharging } from '@/utils/safe-battery';

export default function ProfileScreen() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();
    const { data: bookings = [], error: bookingsError } = useBookings();
    const [batteryLevel, setBatteryLevel] = React.useState(0);
    const [vehicleStatus, setVehicleStatus] = React.useState<'Parked' | 'Charging' | 'Driving' | 'Not connected'>(
        user?.vehicle_type ? 'Parked' : 'Not connected'
    );

    React.useEffect(() => {
        let isMounted = true;

        async function loadBatterySnapshot() {
            if (!user?.vehicle_type) {
                return;
            }

            const [level, state] = await Promise.all([getSafeBatteryLevel(), getSafeBatteryState()]);
            if (!isMounted) {
                return;
            }

            setBatteryLevel(Math.round(level * 100));
            setVehicleStatus(
                state === BatteryState.CHARGING || state === BatteryState.FULL ? 'Charging' : 'Parked'
            );
        }

        loadBatterySnapshot();

        return () => {
            isMounted = false;
        };
    }, [user?.vehicle_type]);

    const completedBookings = React.useMemo(
        () => bookings.filter((booking) => booking.status === 'COMPLETED').length,
        [bookings]
    );
    const upcomingBookings = React.useMemo(
        () =>
            bookings.filter((booking) => ['PENDING_PAYMENT', 'CONFIRMED', 'LOCKED', 'ACTIVE'].includes(booking.status))
                .length,
        [bookings]
    );
    const totalChargedKwh = React.useMemo(() => {
        const total = bookings.reduce((sum, booking) => sum + (booking.energy_consumed_kwh ?? 0), 0);
        return total > 0 ? total : null;
    }, [bookings]);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
                <Typography variant="h3" color="primary">
                    Hi, {user?.name || 'Driver'}
                </Typography>
                <Ionicons name="notifications-outline" size={24} color={Colors.brand.dark} />
            </View>

            <ConnectedCarHero
                batteryLevel={batteryLevel}
                carName={user?.vehicle_type || 'Connected EV'}
                status={vehicleStatus}
            />

            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.contentSection}>
                <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                    VEHICLE STATS
                </Typography>

                {totalChargedKwh !== null ? (
                    <SettingsRow icon="flash" title="Total Charged" value={`${totalChargedKwh.toFixed(1)} kWh`} />
                ) : null}
                <SettingsRow icon="calendar" title="Upcoming Sessions" value={`${upcomingBookings}`} />
                <SettingsRow icon="checkmark-done" title="Completed Sessions" value={`${completedBookings}`} />

                {bookingsError ? (
                    <Typography variant="bodySmall" color="error" style={styles.inlineError}>
                        {normalizeApiError(bookingsError).message}
                    </Typography>
                ) : null}

                <Typography variant="h4" color="primary" style={[styles.sectionTitle, styles.sectionSpacing]}>
                    ACCOUNT
                </Typography>

                <SettingsRow
                    icon="person"
                    title="Personal Information"
                    value="Edit"
                    valueColor={Colors.brand.primary}
                    onPress={() => router.push('/profile/personal-info')}
                />
                <SettingsRow
                    icon="card"
                    title="Payment Methods"
                    onPress={() => router.push('/profile/payment-methods')}
                />
                <SettingsRow icon="help-circle" title="Help & Support" onPress={() => router.push('/profile/help')} />

                <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.semantic.error} />
                    <Typography variant="button" style={styles.logoutText}>
                        Log Out
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.simulateBtn}
                    onPress={() => {
                        triggerSimulatorCharging(true);
                        router.push('/(app)/charging');
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="flash" size={20} color={Colors.brand.white} />
                    <Typography variant="button" style={styles.simulateText}>
                        Open charging simulator
                    </Typography>
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </Animated.View>
        </ScrollView>
    );
}

const SettingsRow = ({
    icon,
    title,
    value,
    valueColor,
    onPress,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    value?: string;
    valueColor?: string;
    onPress?: () => void;
}) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.rowLeft}>
            <View style={styles.iconCircle}>
                <Ionicons name={icon} size={18} color={Colors.brand.primary} />
            </View>
            <Typography variant="body" color="primary">
                {title}
            </Typography>
        </View>
        <View style={styles.rowRight}>
            {value ? (
                <Typography variant="bodySmall" style={{ color: valueColor || Colors.text.secondary }}>
                    {value}
                </Typography>
            ) : null}
            <Ionicons name="chevron-forward" size={20} color={Colors.border.divider} style={styles.chevron} />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
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
    sectionSpacing: {
        marginTop: Spacing.xl,
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
    chevron: {
        marginLeft: Spacing.sm,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        marginTop: Spacing.xxl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        color: Colors.semantic.error,
        marginLeft: 8,
    },
    simulateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.brand.dark,
        marginTop: Spacing.md,
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
    },
    simulateText: {
        color: Colors.brand.white,
        marginLeft: 8,
    },
    inlineError: {
        marginTop: Spacing.sm,
    },
    bottomSpacer: {
        height: 100,
    },
});
