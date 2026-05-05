import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadow } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

const SUGGESTED_STOPS = [
    { id: '1', name: 'Tata Power, Sagar', distance: '120km away', plug: 'CCS2 • 50kW', price: '₹8.50/kWh', duration: '45m' },
    { id: '2', name: 'ChargeZone, Jabalpur', distance: '310km away', plug: 'CCS2 • 60kW', price: '₹9.00/kWh', duration: '30m' }
];

export default function RoutePlannerScreen() {
    const router = useRouter();
    const [hasPlanned, setHasPlanned] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Typography variant="h3" color="primary">EV Route Planner</Typography>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp.springify()} style={styles.inputCard}>
                    <View style={styles.routeInputs}>
                        <View style={styles.routeDecor}>
                            <View style={styles.dotOrigin} />
                            <View style={styles.lineDecor} />
                            <Ionicons name="location" size={16} color={Colors.semantic.error} />
                        </View>
                        <View style={styles.inputsWrapper}>
                            <View style={styles.inputBox}>
                                <Typography variant="caption" color="secondary">FROM</Typography>
                                <TextInput style={styles.textInput} value="Current Location" editable={false} />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.inputBox}>
                                <Typography variant="caption" color="secondary">TO</Typography>
                                <TextInput style={styles.textInput} placeholder="Search Destination..." placeholderTextColor={Colors.text.tertiary} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.vehicleStats}>
                        <View style={styles.statBox}>
                            <Typography variant="caption" color="secondary">Vehicle Range</Typography>
                            <View style={styles.statRow}>
                                <Ionicons name="speedometer-outline" size={16} color={Colors.brand.primary} />
                                <Typography variant="label" color="primary" style={{ marginLeft: 4 }}>220 km</Typography>
                            </View>
                        </View>
                        <View style={styles.statBox}>
                            <Typography variant="caption" color="secondary">Current Battery</Typography>
                            <View style={styles.statRow}>
                                <Ionicons name="battery-half" size={16} color={Colors.semantic.success} />
                                <Typography variant="label" color="primary" style={{ marginLeft: 4 }}>65%</Typography>
                            </View>
                        </View>
                        <View style={styles.statBox}>
                            <Typography variant="caption" color="secondary">Charger</Typography>
                            <View style={styles.statRow}>
                                <Ionicons name="flash-outline" size={16} color={Colors.brand.primary} />
                                <Typography variant="label" color="primary" style={{ marginLeft: 4 }}>CCS2</Typography>
                            </View>
                        </View>
                    </View>

                    {!hasPlanned && (
                        <Button
                            label="Calculate Charging Stops"
                            onPress={() => setHasPlanned(true)}
                            style={{ marginTop: Spacing.xl }}
                            fullWidth
                        />
                    )}
                </Animated.View>

                {hasPlanned && (
                    <Animated.View entering={FadeIn.delay(300)}>
                        <Typography variant="h4" color="primary" style={styles.sectionTitle}>SUGGESTED FULL ROUTE</Typography>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryMapMock}>
                                <Ionicons name="map-outline" size={48} color={Colors.brand.primary} style={{ opacity: 0.5 }} />
                                <Typography variant="label" color="primary" style={{ marginTop: 8 }}>Total: 340km • ~5h 20m</Typography>
                            </View>
                            <Typography variant="bodySmall" color="secondary" align="center" style={{ marginTop: Spacing.md }}>
                                This route requires 2 intelligent charging stops to prevent battery depletion.
                            </Typography>
                        </View>

                        {SUGGESTED_STOPS.map((stop, i) => (
                            <Animated.View key={stop.id} entering={FadeInUp.delay(500 + (i * 100)).springify()} style={styles.stopCard}>
                                <View style={styles.stopHeader}>
                                    <View style={styles.stopNumber}>
                                        <Typography variant="caption" style={{ color: Colors.brand.white }}>{i + 1}</Typography>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                                        <Typography variant="h4" color="primary">{stop.name}</Typography>
                                        <Typography variant="caption" color="secondary">{stop.distance} away • Recommend {stop.duration} charge</Typography>
                                    </View>
                                </View>

                                <View style={styles.stopFooter}>
                                    <View style={styles.pill}><Typography variant="caption" color="primary">{stop.plug}</Typography></View>
                                    <View style={styles.pill}><Typography variant="caption" color="primary">{stop.price}</Typography></View>
                                </View>

                                <TouchableOpacity
                                    style={styles.bookStopBtn}
                                    onPress={() => router.push({ pathname: '/station/[id]', params: { id: stop.id } })}
                                >
                                    <Typography variant="button" style={{ color: Colors.brand.white }}>Book Slot Ahead</Typography>
                                    <Ionicons name="arrow-forward" size={16} color={Colors.brand.white} style={{ marginLeft: 6 }} />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}

                        <View style={{ height: 100 }} />
                    </Animated.View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.mintWhite },
    header: { paddingTop: 60, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.brand.white, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
    backBtn: { padding: Spacing.xs, width: 44 },
    content: { padding: Spacing.xl },
    inputCard: { backgroundColor: Colors.brand.white, padding: Spacing.xl, borderRadius: Radius.lg, ...Shadow.subtle, marginBottom: Spacing.xxl },
    routeInputs: { flexDirection: 'row', marginBottom: Spacing.lg },
    routeDecor: { width: 24, alignItems: 'center', marginTop: 14 },
    dotOrigin: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.brand.primary },
    lineDecor: { width: 2, height: 40, backgroundColor: Colors.border.divider, marginVertical: 4 },
    inputsWrapper: { flex: 1 },
    inputBox: { paddingVertical: Spacing.xs },
    divider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: Spacing.xs },
    textInput: { fontFamily: 'Inter_500Medium', fontSize: 16, color: Colors.text.primary, paddingVertical: 4, outlineWidth: 0 },
    vehicleStats: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAF9', padding: Spacing.md, borderRadius: Radius.md, marginTop: Spacing.md },
    statBox: { alignItems: 'flex-start' },
    statRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    sectionTitle: { marginBottom: Spacing.md, fontSize: 13, letterSpacing: 1 },
    summaryCard: { backgroundColor: '#EAF9E7', padding: Spacing.xl, borderRadius: Radius.lg, marginBottom: Spacing.lg },
    summaryMapMock: { backgroundColor: Colors.brand.white, borderRadius: Radius.md, height: 120, justifyContent: 'center', alignItems: 'center' },
    stopCard: { backgroundColor: Colors.brand.white, padding: Spacing.xl, borderRadius: Radius.lg, marginBottom: Spacing.md, ...Shadow.subtle },
    stopHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    stopNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.brand.primary, justifyContent: 'center', alignItems: 'center' },
    stopFooter: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    pill: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm },
    bookStopBtn: { backgroundColor: Colors.brand.dark, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: Radius.sm }
});
