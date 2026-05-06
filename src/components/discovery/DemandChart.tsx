import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import type { DemandForecastPoint } from '@/api/demand';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants';

interface DemandChartProps {
    forecast?: DemandForecastPoint[];
    peakHours?: number[];
    isLoading?: boolean;
}

function formatHourLabel(hour: number) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const normalized = hour % 12 === 0 ? 12 : hour % 12;
    return `${normalized}${period}`;
}

function getDisplayPoints(forecast: DemandForecastPoint[]) {
    const targetHours = [0, 4, 8, 12, 16, 20];
    return targetHours.map((hour) => {
        const point = forecast.find((item) => item.hour === hour);
        return {
            hour,
            label: formatHourLabel(hour),
            demand: point?.load_percent ?? 0,
        };
    });
}

export const DemandChart: React.FC<DemandChartProps> = ({
    forecast = [],
    peakHours = [],
    isLoading = false,
}) => {
    const displayData = getDisplayPoints(forecast);
    const hasSignal = displayData.some((item) => item.demand > 0);
    const lowestDemandPoint = displayData.reduce<(typeof displayData)[number] | null>((lowest, current) => {
        if (!lowest || current.demand < lowest.demand) {
            return current;
        }
        return lowest;
    }, null);

    return (
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.container}>
            <Typography variant="h4" color="primary" style={styles.title}>
                DEMAND FORECAST
            </Typography>

            {isLoading ? (
                <Typography variant="bodySmall" color="secondary">
                    Loading demand forecast...
                </Typography>
            ) : !hasSignal ? (
                <Typography variant="bodySmall" color="secondary">
                    Not enough booking history yet to generate a useful demand trend.
                </Typography>
            ) : (
                <>
                    <View style={styles.chartArea}>
                        {displayData.map((item) => {
                            const height: `${number}%` = `${Math.max(item.demand, 6)}%`;
                            let barColor: string = Colors.semantic.success;
                            if (item.demand > 60) {
                                barColor = Colors.semantic.warning;
                            }
                            if (item.demand > 80) {
                                barColor = Colors.semantic.error;
                            }

                            const isPeakHour = peakHours.includes(item.hour);

                            return (
                                <View key={item.hour} style={styles.barColumn}>
                                    <View style={styles.barTrack}>
                                        <View style={[styles.barFill, { height, backgroundColor: barColor }]} />
                                    </View>
                                    <Typography
                                        variant="caption"
                                        color={isPeakHour ? 'primary' : 'tertiary'}
                                        style={styles.label}
                                    >
                                        {item.label}
                                    </Typography>
                                    {isPeakHour ? <View style={styles.currentIndicator} /> : null}
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.insights}>
                        {lowestDemandPoint ? (
                            <Typography variant="bodySmall" color="secondary">
                                <Typography variant="bodySmall" color="primary">
                                    Best time to charge:
                                </Typography>
                                {' '}
                                {lowestDemandPoint.label} (Lowest Demand)
                            </Typography>
                        ) : null}
                        <Typography variant="bodySmall" color="secondary" style={styles.insightSpacing}>
                            <Typography variant="bodySmall" color="primary">
                                Peak Hours:
                            </Typography>
                            {' '}
                            {peakHours.length > 0
                                ? peakHours.map(formatHourLabel).join(', ')
                                : 'No peak window identified yet'}
                        </Typography>
                    </View>
                </>
            )}
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
    },
    insightSpacing: {
        marginTop: 4,
    },
});
