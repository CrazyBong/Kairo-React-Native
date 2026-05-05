import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useStationDetail } from '@/api/stations';
import { Slot, useStationSlots } from '@/api/slots';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants';
import { useStationWebSocket } from '@/hooks/useStationWebSocket';
import { useBookingStore } from '@/store/booking.store';

const SLOT_DURATION_OPTIONS = [30, 45, 60, 90, 120];
const COST_EFFICIENCY_FACTOR = 0.85;

function buildTimeChoices(openTime = '06:00', closeTime = '23:00'): { label: string; iso: string }[] {
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const choices: { label: string; iso: string }[] = [];
    const base = new Date();
    base.setSeconds(0, 0);
    base.setHours(openHour, openMinute, 0, 0);
    const now = new Date();
    if (now.getMinutes() > 0 && now.getMinutes() <= 30) {
        now.setMinutes(30, 0, 0);
    } else if (now.getMinutes() > 30) {
        now.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
        now.setMinutes(0, 0, 0);
    }

    const closeBoundary = new Date(base);
    closeBoundary.setHours(closeHour, closeMinute, 0, 0);

    while (base < closeBoundary) {
        if (base >= now) {
            choices.push({
                label: base.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
                iso: base.toISOString(),
            });
        }
        base.setMinutes(base.getMinutes() + 30);
    }

    return choices.slice(0, 10);
}

export default function SlotPickerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(45);
    const setDraft = useBookingStore((state) => state.setDraft);

    const { data: station } = useStationDetail(id ?? '');
    const { data: slots = [], isLoading } = useStationSlots(id ?? '');

    useStationWebSocket(id ?? '');

    const availableSlots = slots.filter((slot) => slot.status === 'AVAILABLE');
    const timeChoices = useMemo(
        () => buildTimeChoices(station?.operating_hours?.open, station?.operating_hours?.close),
        [station?.operating_hours?.close, station?.operating_hours?.open]
    );
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);

    const handleConfirm = () => {
        if (!station || !selectedSlot || !selectedStartTime) {
            return;
        }

        const start = new Date(selectedStartTime);
        const end = new Date(start.getTime() + selectedDuration * 60_000);
        const pricePerUnit = station.price_per_unit ?? 10;
        // Efficiency factor approximates tapering and conversion losses during a real charging session.
        const estimatedCost = Number(
            (((selectedSlot.power_kw * selectedDuration) / 60) * pricePerUnit * COST_EFFICIENCY_FACTOR).toFixed(2)
        );

        setDraft({
            stationId: station.id,
            stationName: station.name,
            slotId: selectedSlot.id,
            slotLabel: `Slot ${selectedSlot.slot_number}`,
            chargerType: selectedSlot.charger_type,
            scheduledStart: start.toISOString(),
            scheduledEnd: end.toISOString(),
            estimatedCost,
        });

        router.replace('/booking/confirm');
    };

    if (!station) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.closeBtn}
                        accessibilityLabel="Close slot picker"
                    >
                        <Ionicons name="close" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Typography variant="h3" color="primary">
                        Select a Slot
                    </Typography>
                    <View style={styles.closeBtn} />
                </View>
                <Typography variant="body" color="secondary" align="center">
                    {station.name}
                </Typography>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                        AVAILABLE SLOTS
                    </Typography>

                    {isLoading ? (
                        <Typography variant="body" color="tertiary" style={styles.helperText}>
                            Loading slots...
                        </Typography>
                    ) : availableSlots.length === 0 ? (
                        <Typography variant="body" color="secondary" style={styles.helperText}>
                            No slots are currently available at this station.
                        </Typography>
                    ) : (
                        <View style={styles.slotsGrid}>
                            {availableSlots.map((slot, index) => {
                                const isSelected = selectedSlot?.id === slot.id;

                                return (
                                    <Animated.View key={slot.id} entering={FadeInUp.delay(50 * index).springify()}>
                                        <TouchableOpacity
                                            onPress={() => setSelectedSlot(slot)}
                                            style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                                        >
                                            <View style={styles.slotHeader}>
                                                <Typography
                                                    variant="label"
                                                    color={isSelected ? 'inverted' : 'primary'}
                                                >
                                                    Slot {slot.slot_number}
                                                </Typography>
                                                <View
                                                    style={[
                                                        styles.statusDot,
                                                        isSelected ? styles.dotSelected : styles.dotAvailable,
                                                    ]}
                                                />
                                            </View>
                                            <Typography
                                                variant="body"
                                                color={isSelected ? 'inverted' : 'secondary'}
                                            >
                                                {slot.charger_type} - {slot.power_kw} kW
                                            </Typography>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                        START TIME
                    </Typography>
                    {timeChoices.length === 0 ? (
                        <Typography variant="body" color="secondary" style={styles.helperText}>
                            No future start times are available for the rest of today.
                        </Typography>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {timeChoices.map((timeChoice) => {
                                const isSelected = selectedStartTime === timeChoice.iso;

                                return (
                                    <TouchableOpacity
                                        key={timeChoice.iso}
                                        onPress={() => setSelectedStartTime(timeChoice.iso)}
                                        style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                                    >
                                        <Typography variant="label" color={isSelected ? 'inverted' : 'primary'}>
                                            {timeChoice.label}
                                        </Typography>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                <View style={styles.section}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                        DURATION
                    </Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {SLOT_DURATION_OPTIONS.map((minutes) => {
                            const isSelected = selectedDuration === minutes;

                            return (
                                <TouchableOpacity
                                    key={minutes}
                                    onPress={() => setSelectedDuration(minutes)}
                                    style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                                >
                                    <Typography variant="label" color={isSelected ? 'inverted' : 'primary'}>
                                        {minutes} min
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    label={
                        selectedSlot && selectedStartTime
                            ? `Confirm Slot - ${selectedDuration}m`
                            : 'Select slot and time'
                    }
                    onPress={handleConfirm}
                    disabled={!selectedSlot || !selectedStartTime}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.mintWhite },
    header: {
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.brand.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xs,
    },
    closeBtn: { padding: Spacing.xs, width: 44 },
    content: { padding: Spacing.xl },
    section: { marginBottom: Spacing.xxl },
    sectionTitle: { marginBottom: Spacing.md, fontSize: 13, letterSpacing: 1 },
    helperText: { textAlign: 'center', marginTop: 20 },
    slotsGrid: { gap: Spacing.md },
    slotCard: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.lg,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    slotCardSelected: {
        backgroundColor: Colors.brand.primary,
        borderColor: Colors.brand.primary,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    dotAvailable: { backgroundColor: Colors.semantic.success },
    dotSelected: { backgroundColor: Colors.brand.white },
    horizontalList: { gap: Spacing.sm },
    timeChip: {
        backgroundColor: Colors.brand.white,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.pill,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    timeChipSelected: {
        backgroundColor: Colors.brand.dark,
        borderColor: Colors.brand.dark,
    },
    durationChip: {
        backgroundColor: Colors.brand.white,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.pill,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    durationChipSelected: {
        backgroundColor: Colors.brand.dark,
        borderColor: Colors.brand.dark,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.brand.white,
        padding: Spacing.xl,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: Colors.border.subtle,
    },
    bottomSpacer: { height: 100 },
});
