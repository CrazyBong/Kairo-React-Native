import { useState, useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { getSafeBatteryState, getSafeBatteryLevel, addSafeBatteryListener, BatteryState } from '@/utils/safe-battery';

/**
 * Supercharger Simulation Hook
 * Triggers Phase 10 logic: Hardware plug-in detection -> Simulation Redirect
 */
export function useChargingSimulation() {
    const router = useRouter();
    const segments = useSegments();
    const [batteryState, setBatteryState] = useState<BatteryState | null>(null);
    const [chargeLevel, setChargeLevel] = useState<number>(0);
    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        async function initBattery() {
            const state = await getSafeBatteryState();
            const level = await getSafeBatteryLevel();
            setBatteryState(state);
            setChargeLevel(level);

            // Subscribe to state changes (plug/unplug)
            subscriptionRef.current = addSafeBatteryListener(({ batteryState }) => {
                setBatteryState(batteryState);
            });
        }

        initBattery();

        return () => {
            subscriptionRef.current?.remove();
        };
    }, []);

    useEffect(() => {
        // Trigger: Phone is plugged in (CHARGING or FULL)
        const isCharging = batteryState === BatteryState.CHARGING || batteryState === BatteryState.FULL;

        // Robust check for current segment
        const isOnChargingScreen = (segments as string[]).includes('charging');

        if (isCharging && !isOnChargingScreen) {
            console.log('[Charging] Hardware trigger: Plug-in detected. Redirecting to simulation...');
            router.push('/(app)/charging');
        }
    }, [batteryState, router, segments]);

    return {
        batteryState,
        chargeLevel,
        isPluggedIn: batteryState === BatteryState.CHARGING || batteryState === BatteryState.FULL
    };
}
