import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ConnectedCarHeroProps {
    batteryLevel: number;
    carName: string;
    status: 'Parked' | 'Charging' | 'Driving' | 'Not connected';
}

export const ConnectedCarHero: React.FC<ConnectedCarHeroProps> = ({ batteryLevel, carName, status }) => {
    // Interactive Responsive States
    const [isLocked, setIsLocked] = useState(true);
    const [climateOn, setClimateOn] = useState(false);
    const [isCharging, setIsCharging] = useState(false);
    const [trunkOpen, setTrunkOpen] = useState(false);

    return (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.container}>
            {/* Header Info */}
            <View style={styles.header}>
                <View>
                    <Typography variant="h2" color="primary">{carName}</Typography>
                    <Typography variant="caption" color="secondary" style={styles.statusText}>
                        <View style={styles.statusDot} /> {status}
                    </Typography>
                </View>
                <View style={styles.batteryBlock}>
                    <Ionicons name="battery-half" size={24} color={Colors.semantic.success} />
                    <Typography variant="h3" color="primary" style={{ marginLeft: 4 }}>{batteryLevel}%</Typography>
                </View>
            </View>

            {/* Car Image Proxy - Premium aesthetic */}
            <View style={styles.imageContainer}>
                {/* We use a high quality remote silhouette or beautiful car image as proxy */}
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=600&auto=format&fit=crop' }}
                    style={styles.carImage}
                    resizeMode="cover"
                />
                <View style={styles.imageGradientOverlay} />
            </View>

            {/* Tesla-inspired Quick Actions */}
            <View style={styles.quickActions}>
                <QuickAction
                    icon={isLocked ? "lock-closed" : "lock-open"}
                    label={isLocked ? "Locked" : "Unlocked"}
                    active={isLocked}
                    onPress={() => setIsLocked(!isLocked)}
                />
                <QuickAction
                    icon="snow"
                    label="Climate"
                    active={climateOn}
                    activeColor={Colors.brand.primary} // Blueish ideal, using primary for brand
                    onPress={() => setClimateOn(!climateOn)}
                />
                <QuickAction
                    icon="flash"
                    label="Charge"
                    active={isCharging}
                    activeColor={Colors.semantic.success}
                    onPress={() => setIsCharging(!isCharging)}
                />
                <QuickAction
                    icon="car"
                    label="Trunk"
                    active={trunkOpen}
                    activeColor={Colors.semantic.warning}
                    onPress={() => setTrunkOpen(!trunkOpen)}
                />
            </View>
        </Animated.View>
    );
};

// Helper for quick action circles
const QuickAction = ({ icon, label, active, activeColor, onPress }: { icon: any, label: string, active?: boolean, activeColor?: string, onPress: () => void }) => {
    const bgColor = active ? (activeColor || Colors.brand.primary) : Colors.brand.dark;
    return (
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={onPress}>
            <View style={[styles.actionCircle, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={22} color={Colors.brand.white} />
            </View>
            <Typography variant="caption" color="secondary" style={{ marginTop: 6 }}>{label}</Typography>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.brand.white,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    statusText: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.semantic.success,
        marginRight: 6,
        marginTop: 2,
    },
    batteryBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface.subtle,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.pill,
    },
    imageContainer: {
        height: 220,
        width: '100%',
        marginVertical: Spacing.sm,
        position: 'relative',
    },
    carImage: {
        width: '100%',
        height: '100%',
    },
    imageGradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xxl,
        marginTop: Spacing.lg,
    },
    actionItem: {
        alignItems: 'center',
    },
    actionCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.brand.dark,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.subtle,
    }
});
