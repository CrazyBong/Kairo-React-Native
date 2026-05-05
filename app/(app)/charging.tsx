import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SwipeButton } from '@/components/ui/SwipeButton';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeInDown,
    FadeInUp,
    interpolate,
    useSharedValue
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { getSafeBatteryLevel, addSafeBatteryListener, BatteryState } from '@/utils/safe-battery';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.72;

export default function ChargingTabScreen() {
    // Session State
    const [isStarted, setIsStarted] = useState(false);
    const [soc, setSoc] = useState(0);
    const [power, setPower] = useState(0);

    const pulse = useSharedValue(1);

    // Initial Load - Get real battery level but keep sim idle
    useEffect(() => {
        getSafeBatteryLevel().then(level => setSoc(Math.round(level * 100)));

        const sub = addSafeBatteryListener(({ batteryState }) => {
            const charging = batteryState === BatteryState.CHARGING || batteryState === BatteryState.FULL;
            if (!charging) {
                setIsStarted(false);
                setPower(0);
                pulse.value = withTiming(1);
            }
        });

        return () => sub.remove();
    }, [pulse]);

    // Simulation Engine - Only runs if IS STARTED
    useEffect(() => {
        if (!isStarted) {
            setPower(0);
            return;
        }

        const timer = setInterval(() => {
            setPower(prev => {
                const noise = Math.random() * 5 - 2.5;
                const base = prev === 0 ? 15 : prev;
                const next = base + noise;
                return Math.min(68, Math.max(15, next));
            });

            setSoc(prev => (prev < 100 ? prev + 0.005 : 100));
        }, 1000);

        pulse.value = withRepeat(
            withSequence(withTiming(1.03, { duration: 2500 }), withTiming(1, { duration: 2500 })),
            -1,
            true
        );

        return () => clearInterval(timer);
    }, [isStarted, pulse]);

    const range = useMemo(() => Math.round(soc * 6), [soc]);
    const timeRemaining = useMemo(() => {
        if (!isStarted || soc >= 100) return 0;
        const currentPower = power || 1;
        return Math.round((100 - soc) * (150 / currentPower));
    }, [soc, power, isStarted]);

    const animatedCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.03], [0.8, 1])
    }));

    const handleStop = () => {
        setIsStarted(false);
        setPower(0);
        pulse.value = withTiming(1);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Badge
                    label={isStarted ? "ACTIVE SESSION" : "READY TO START"}
                    variant={isStarted ? "success" : "info"}
                    style={styles.badge}
                />
                <Typography variant="h3" align="center" style={styles.headerTitle}>Supercharging</Typography>
                <Typography variant="caption" color="secondary" align="center">Slot A1 · CCS2 High Power</Typography>
            </View>

            {/* Main Visualizer */}
            <View style={styles.visualizerContainer}>
                <Animated.View style={[styles.glowCircle, animatedCircleStyle, !isStarted && { opacity: 0.2 }]} />
                <View style={[styles.mainCircle, !isStarted && { borderColor: Colors.border.divider }]}>
                    <View style={styles.socContainer}>
                        <Typography variant="h1" style={[styles.socText, !isStarted && { color: Colors.text.secondary }]}>{Math.floor(soc)}%</Typography>
                        <Typography variant="label" color="secondary" align="center" style={styles.chargedLabel}>Charged</Typography>
                    </View>
                </View>

                {/* Energy Flow Particles - Only show if started */}
                {isStarted && (
                    <View style={styles.flowContainer}>
                        {[1, 2, 3].map((i) => (
                            <MotiView
                                key={i}
                                from={{ translateY: 60, opacity: 0 }}
                                animate={{ translateY: -100, opacity: 0.4 }}
                                transition={{
                                    loop: true,
                                    duration: 3000,
                                    delay: i * 1000,
                                    type: 'timing'
                                }}
                                style={styles.energyParticle}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* Stats Grid */}
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.statsGrid}>
                <StatCard label="POWER SHARING" value={`${power.toFixed(1)} kW`} />
                <StatCard label="RANGE ADDED" value={`+${range} km`} valueColor={Colors.brand.primary} />
                <StatCard label="TIME LEFT" value={`${timeRemaining} min`} />
            </Animated.View>

            {/* Interactions Footer */}
            <View style={styles.footer}>
                {!isStarted ? (
                    <Animated.View entering={FadeInUp.springify()}>
                        <SwipeButton
                            onSwipeComplete={() => setIsStarted(true)}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown.springify()}>
                        <Button
                            label="STOP CHARGING"
                            variant="error"
                            size="lg"
                            fullWidth
                            onPress={handleStop}
                            style={styles.stopButton}
                        />
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const StatCard = ({ label, value, valueColor }: { label: string, value: string, valueColor?: string }) => (
    <Card elevated padding="lg" style={styles.statCard}>
        <Typography variant="caption" style={styles.statLabel}>{label}</Typography>
        <Typography variant="h3" style={{ color: valueColor || Colors.brand.dark, fontWeight: '700' }}>{value}</Typography>
    </Card>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFDFB',
        paddingTop: 60,
    },
    header: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    badge: {
        marginBottom: 12,
        paddingHorizontal: 12,
        alignSelf: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.brand.dark,
    },
    visualizerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: CIRCLE_SIZE + 60,
    },
    glowCircle: {
        position: 'absolute',
        width: CIRCLE_SIZE + 40,
        height: CIRCLE_SIZE + 40,
        borderRadius: (CIRCLE_SIZE + 40) / 2,
        backgroundColor: Colors.brand.primary + '08',
        borderWidth: 1,
        borderColor: Colors.brand.primary + '15',
    },
    mainCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: 10,
        borderColor: Colors.brand.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.brand.white,
        shadowColor: Colors.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    socContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    socText: {
        fontSize: 84,
        fontWeight: '900',
        color: Colors.brand.dark,
        letterSpacing: -4,
        lineHeight: 84,
    },
    chargedLabel: {
        marginTop: 6,
        letterSpacing: 3,
        textTransform: 'uppercase',
        fontSize: 11,
        fontWeight: '700',
        color: Colors.text.secondary,
    },
    flowContainer: {
        position: 'absolute',
        bottom: 0,
        width: 100,
        height: 120,
        alignItems: 'center',
        left: (width - 100) / 2,
        zIndex: -1,
    },
    energyParticle: {
        width: 4,
        height: 20,
        backgroundColor: Colors.brand.primary,
        borderRadius: 2,
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.xl,
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        borderRadius: Radius.pill,
    },
    statLabel: {
        marginBottom: 8,
        letterSpacing: 1.5,
        fontSize: 10,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    footer: {
        padding: Spacing.xl,
        paddingBottom: 40,
        alignItems: 'center',
    },
    stopButton: {
        borderRadius: Radius.pill,
        height: 68, // Increased height as requested
    }
});
