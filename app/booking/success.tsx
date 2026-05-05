import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useBookingStore } from '@/store/booking.store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Guarded import to prevent Expo Go native layer crashes
let Audio: any = null;
try {
    Audio = require('expo-av').Audio;
} catch (e) {
    console.warn("expo-av not natively bundled, sound disabled.");
}

export default function BookingSuccessScreen() {
    const clearDraft = useBookingStore(s => s.clearDraft);
    const soundRef = useRef<any>(null);

    // FIX: Booking ID generated once via useMemo, not on every render
    const bookingId = useMemo(() =>
        `KRO-${Math.floor(Math.random() * 89999 + 10000)}`, []);

    useEffect(() => {
        // Trigger haptic success pulse (works in Expo Go)
        async function playMicroInteractions() {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                if (Audio) {
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3' },
                        { shouldPlay: true }
                    );
                    // FIX: store ref so we can unload on unmount (no setTimeout leak)
                    soundRef.current = sound;
                }
            } catch (err) {
                console.log('Audio/Haptics not available:', err);
            }
        }
        playMicroInteractions();

        // Prevent back navigation to the payment screen
        const backAction = () => {
            clearDraft();
            router.replace('/(app)');
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        // FIX: Clean up sound resource on unmount
        return () => {
            backHandler.remove();
            soundRef.current?.unloadAsync?.();
        };
    }, []);

    // FIX: "View Bookings" navigates to bookings tab, not home
    const handleViewBookings = () => {
        clearDraft();
        router.replace('/(app)/bookings');
    };

    const handleReturnHome = () => {
        clearDraft();
        router.replace('/(app)');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={ZoomIn.duration(600).springify()} style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={96} color={Colors.semantic.success} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.textContainer}>
                    <Typography variant="h1" color="primary" align="center" style={{ marginBottom: Spacing.sm }}>
                        Booking Confirmed!
                    </Typography>
                    <Typography variant="bodyLarge" color="secondary" align="center">
                        Your EV charging slot is secured.
                    </Typography>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.card}>
                    {/* FIX: bookingId is stable via useMemo */}
                    <Typography variant="body" color="primary" align="center" style={{ fontWeight: '500', marginBottom: 4 }}>
                        Booking ID: #{bookingId}
                    </Typography>
                    <Typography variant="caption" color="tertiary" align="center">
                        A confirmation has been sent to your registered phone number.
                    </Typography>
                </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
                {/* FIX: navigates to bookings tab */}
                <Button label="View Bookings" variant="brand" onPress={handleViewBookings} fullWidth style={{ marginBottom: Spacing.md }} />
                <TouchableOpacity
                    onPress={handleReturnHome}
                    style={{ alignItems: 'center', paddingVertical: Spacing.sm }}
                    accessibilityLabel="Return to home screen"
                >
                    <Typography variant="bodySmall" color="secondary">Back to Home</Typography>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
    iconContainer: {
        marginBottom: Spacing.xl,
        shadowColor: Colors.semantic.success,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    },
    textContainer: { marginBottom: Spacing.xxl },
    card: {
        backgroundColor: Colors.brand.white,
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#EAF9E7',
    },
    footer: { padding: Spacing.xl, paddingBottom: 40 },
});
