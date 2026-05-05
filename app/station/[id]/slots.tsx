import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useStationDetail } from '@/api/stations';
import { useStationSlots, Slot } from '@/api/slots';
import { useStationWebSocket } from '@/hooks/useStationWebSocket';
import { useBookingStore } from '@/store/booking.store';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SlotPickerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    // State
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [duration, setDuration] = useState(45); // Default 45 mins

    // Data
    const { data: station } = useStationDetail(id || '1');
    const { data: slots, isLoading: slotsLoading } = useStationSlots(id || '1', selectedDate);
    const setDraft = useBookingStore(s => s.setDraft);

    // Initialize Real-Time WebSocket Listener
    useStationWebSocket(id || '1');

    // Generate next 7 days for the date picker
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            iso: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate()
        };
    });

    const handleConfirm = () => {
        if (!station || !selectedSlot) return;

        const slotStart = new Date(selectedSlot.start_time);
        const slotEnd = new Date(selectedSlot.end_time);
        // FIX: cap duration to not exceed the slot's available window
        const maxDuration = Math.floor((slotEnd.getTime() - slotStart.getTime()) / 60000);
        const clampedDuration = Math.min(duration, maxDuration);
        const end = new Date(slotStart.getTime() + clampedDuration * 60000);

        const charger = station.connectors.find(c => c.id === selectedSlot.connector_id);
        const kwCapacity = charger?.capacity_kw || 50;
        // FIX: null-safe pricing_kwh with fallback
        const pricePerKwh = station.pricing_kwh ?? 18.5;
        const estimatedCost = (kwCapacity * (clampedDuration / 60) * pricePerKwh);

        setDraft({
            stationId: station.id,
            stationName: station.name,
            slotId: selectedSlot.id,
            slotLabel: selectedSlot.slot_label,
            chargerType: charger?.type || 'CCS2',
            scheduledStart: slotStart.toISOString(),
            scheduledEnd: end.toISOString(),
            estimatedCost,
        });

        router.replace('/booking/confirm');
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!station) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.closeBtn}
                        accessibilityLabel="Close slot picker"
                    >
                        <Ionicons name="close" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Typography variant="h3" color="primary">Select a Slot</Typography>
                    <View style={styles.closeBtn} />
                </View>
                <Typography variant="body" color="secondary" align="center">{station.name}</Typography>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Date Selector */}
                <View style={styles.section}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                        {dates.map((d) => {
                            const isSelected = selectedDate === d.iso;
                            return (
                                <TouchableOpacity
                                    key={d.iso}
                                    onPress={() => { setSelectedDate(d.iso); setSelectedSlot(null); }}
                                    style={[styles.dateBox, isSelected && styles.dateBoxSelected]}
                                >
                                    <Typography variant="caption" color={isSelected ? 'inverted' : 'tertiary'}>{d.day.toUpperCase()}</Typography>
                                    <Typography variant="h2" color={isSelected ? 'inverted' : 'primary'} style={styles.dateNum as any}>{String(d.date)}</Typography>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>

                {/* Slots List */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
                        <Typography variant="h4" color="primary" style={styles.sectionTitle}>AVAILABLE SLOTS</Typography>
                        <View style={{ backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="flash" size={12} color={Colors.semantic.warning} />
                            <Typography variant="caption" style={{ color: '#B45309', marginLeft: 4 }}>1.2x Surge Pricing</Typography>
                        </View>
                    </View>

                    {slotsLoading ? (
                        <Typography variant="body" color="tertiary" style={{ textAlign: 'center', marginTop: 20 }}>Loading slots...</Typography>
                    ) : (
                        <View style={styles.slotsGrid}>
                            {slots?.map((slot, index) => {
                                const isSelected = selectedSlot?.id === slot.id;
                                const isBooked = slot.status !== 'available';

                                return (
                                    <Animated.View key={slot.id} entering={FadeInUp.delay(50 * index).springify()}>
                                        <TouchableOpacity
                                            disabled={isBooked}
                                            onPress={() => setSelectedSlot(slot)}
                                            style={[
                                                styles.slotCard,
                                                isBooked && styles.slotCardBooked,
                                                isSelected && styles.slotCardSelected
                                            ]}
                                        >
                                            <View style={styles.slotHeader as any}>
                                                <Typography variant="label" color={isBooked ? 'tertiary' : (isSelected ? 'inverted' : 'primary')}>
                                                    {slot.slot_label}
                                                </Typography>
                                                <View style={[styles.statusDot, isBooked ? styles.dotBooked : (isSelected ? styles.dotSelectedVal : styles.dotAvailable)] as any} />
                                            </View>
                                            <Typography variant="body" color={isBooked ? 'tertiary' : (isSelected ? 'inverted' : 'secondary')}>
                                                {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                                            </Typography>
                                        </TouchableOpacity>
                                    </Animated.View>
                                )
                            })}
                        </View>
                    )}
                </View>

                {/* Duration Selector */}
                {selectedSlot && (
                    <Animated.View entering={FadeInUp.springify()} style={styles.section}>
                        <Typography variant="h4" color="primary" style={styles.sectionTitle}>DURATION</Typography>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
                            {[30, 45, 60, 90, 120].map(mins => (
                                <TouchableOpacity
                                    key={mins}
                                    onPress={() => setDuration(mins)}
                                    style={[styles.durationChip, duration === mins && styles.durationChipSelected] as any}
                                >
                                    <Typography variant="label" color={duration === mins ? 'inverted' : 'primary'}>
                                        {String(mins)} min
                                    </Typography>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    label={selectedSlot ? `Confirm Slot • ${duration}m` : "Select a slot"}
                    onPress={handleConfirm}
                    disabled={!selectedSlot}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.mintWhite },
    header: { paddingTop: 60, paddingBottom: Spacing.md, backgroundColor: Colors.brand.white, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.xs },
    closeBtn: { padding: Spacing.xs, width: 44 },
    content: { padding: Spacing.xl },
    section: { marginBottom: Spacing.xxl },
    sectionTitle: { marginBottom: Spacing.md, fontSize: 13, letterSpacing: 1 },
    dateScroll: { gap: Spacing.md },
    dateBox: { width: 64, height: 80, backgroundColor: Colors.brand.white, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border.subtle },
    dateBoxSelected: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
    dateNum: { marginTop: 2, fontSize: 24 },
    slotsGrid: { gap: Spacing.md },
    slotCard: { backgroundColor: Colors.brand.white, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle },
    slotCardBooked: { backgroundColor: '#F3F4F6', opacity: 0.7, borderColor: 'transparent' },
    slotCardSelected: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
    slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    dotAvailable: { backgroundColor: Colors.semantic.success },
    dotBooked: { backgroundColor: Colors.border.divider },
    dotSelectedVal: { backgroundColor: Colors.brand.white },
    durationChip: { backgroundColor: Colors.brand.white, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.border.subtle },
    durationChipSelected: { backgroundColor: Colors.brand.dark, borderColor: Colors.brand.dark },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.brand.white, padding: Spacing.xl, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#f0f0f0', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 },
});
