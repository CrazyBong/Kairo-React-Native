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
    const subscriptionRef = useRef<{ remove?: () => void } | null>(null);
    const hasInitializedRef = useRef(false);
    const previousBatteryStateRef = useRef<BatteryState | null>(null);

    useEffect(() => {
        async function initBattery() {
            const state = await getSafeBatteryState();
            const level = await getSafeBatteryLevel();
            setBatteryState(state);
            setChargeLevel(level);
            previousBatteryStateRef.current = state;
            hasInitializedRef.current = true;

            // Subscribe to state changes (plug/unplug)
            subscriptionRef.current = addSafeBatteryListener(({ batteryState }) => {
                setBatteryState(batteryState);
            });
        }

        initBattery();

        return () => {
            subscriptionRef.current?.remove?.();
        };
    }, []);

    useEffect(() => {
        if (!hasInitializedRef.current || batteryState === null) {
            return;
        }

        const isCharging = batteryState === BatteryState.CHARGING || batteryState === BatteryState.FULL;
        const previousBatteryState = previousBatteryStateRef.current;
        const wasCharging =
            previousBatteryState === BatteryState.CHARGING || previousBatteryState === BatteryState.FULL;
        const isOnChargingScreen = (segments as string[]).includes('charging');

        if (isCharging && !wasCharging && !isOnChargingScreen) {
            console.log('[Charging] Hardware trigger: Plug-in detected. Redirecting to simulation...');
            router.replace('/(app)/charging');
        }

        previousBatteryStateRef.current = batteryState;
    }, [batteryState, router, segments]);

    return {
        batteryState,
        chargeLevel,
        isPluggedIn: batteryState === BatteryState.CHARGING || batteryState === BatteryState.FULL
    };
}
