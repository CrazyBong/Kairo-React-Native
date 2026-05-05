/**
 * Kairo Design System: Safe Battery & Charging Simulation Utility
 * 
 * FIX: This file is now a PURE JS MOCK to prevent any native module crashes 
 * (like "Cannot find native module 'ExpoBattery'") across all environments.
 * It will simulate plug-in events using a custom event emitter.
 */

export enum BatteryState {
    UNKNOWN = 0,
    UNPLUGGED = 1,
    CHARGING = 2,
    FULL = 3,
}

// Internal state for mocking
let currentBatteryState = BatteryState.UNKNOWN;
let currentBatteryLevel = 0.75;
const listeners = new Set<(data: { batteryState: BatteryState }) => void>();

export const getSafeBatteryState = async (): Promise<BatteryState> => {
    return currentBatteryState;
};

export const getSafeBatteryLevel = async (): Promise<number> => {
    return currentBatteryLevel;
};

export const addSafeBatteryListener = (callback: (data: { batteryState: BatteryState }) => void) => {
    listeners.add(callback);
    return {
        remove: () => {
            listeners.delete(callback);
        }
    };
};

/**
 * Manual Trigger for Simulation (can be called from Profile page)
 */
export const triggerSimulatorCharging = (isCharging: boolean) => {
    currentBatteryState = isCharging ? BatteryState.CHARGING : BatteryState.UNPLUGGED;
    listeners.forEach(cb => cb({ batteryState: currentBatteryState }));
};
