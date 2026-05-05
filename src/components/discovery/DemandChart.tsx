import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import Animated, { FadeInUp } from 'react-native-reanimated';

const DEMAND_DATA = [
    { hour: '12AM', demand: 20 }, { hour: '4AM', demand: 10 },
    { hour: '8AM', demand: 85 }, { hour: '12PM', demand: 65 },
    { hour: '4PM', demand: 40 }, { hour: '8PM', demand: 90 },
];

export const DemandChart = () => {
    return (
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.container}>
            <Typography variant="h4" color="primary" style={styles.title}>DEMAND FORECAST</Typography>

            <View style={styles.chartArea}>
                {DEMAND_DATA.map((item, index) => {
                    const height: any = `${item.demand}%`;
                    let barColor: string = Colors.semantic.success;
                    if (item.demand > 60) barColor = Colors.semantic.warning;
                    if (item.demand > 80) barColor = Colors.semantic.error;

                    // Artificial current time highlight
                    const isCurrent = index === 3;

                    return (
                        <View key={item.hour} style={styles.barColumn}>
                            <View style={styles.barTrack}>
                                <View style={[styles.barFill, { height, backgroundColor: barColor }]} />
                            </View>
                            <Typography variant="caption" color={isCurrent ? 'primary' : 'tertiary'} style={[styles.label, isCurrent && { fontFamily: 'Inter_700Bold' }]}>
                                {item.hour}
                            </Typography>
                            {isCurrent && <View style={styles.currentIndicator} />}
                        </View>
                    );
                })}
            </View>

            <View style={styles.insights}>
                <Typography variant="bodySmall" color="secondary">
                    <Typography variant="bodySmall" color="primary" style={{ fontFamily: 'Inter_600SemiBold' }}>Best time to charge:</Typography>
                    {' '}4 AM (Lowest Demand)
                </Typography>
                <Typography variant="bodySmall" color="secondary" style={{ marginTop: 4 }}>
                    <Typography variant="bodySmall" color="primary" style={{ fontFamily: 'Inter_600SemiBold' }}>Peak Hours:</Typography>
                    {' '}8 AM & 8 PM — avoid for best rates
                </Typography>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.xl,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        marginBottom: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.lg,
        fontSize: 13,
        letterSpacing: 1,
    },
    chartArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        marginBottom: Spacing.md,
    },
    barColumn: {
        alignItems: 'center',
        width: 32,
    },
    barTrack: {
        width: 12,
        height: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: Radius.pill,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: Radius.pill,
    },
    label: {
        fontSize: 10,
        marginTop: Spacing.sm,
    },
    currentIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.brand.primary,
        marginTop: 4,
    },
    insights: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border.subtle,
    }
});
