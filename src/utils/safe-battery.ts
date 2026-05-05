import Constants from 'expo-constants';
import { Platform } from 'react-native';

type BatteryListenerPayload = { batteryState: BatteryState };
type BatteryListener = (data: BatteryListenerPayload) => void;

type NativeBatteryModule = {
    BatteryState: {
        UNKNOWN: number;
        UNPLUGGED: number;
        CHARGING: number;
        FULL: number;
    };
    getBatteryStateAsync: () => Promise<number>;
    getBatteryLevelAsync: () => Promise<number>;
    addBatteryStateListener: (listener: (event: { batteryState: number }) => void) => { remove: () => void };
};

export enum BatteryState {
    UNKNOWN = 0,
    UNPLUGGED = 1,
    CHARGING = 2,
    FULL = 3,
}

let currentBatteryState = BatteryState.UNKNOWN;
let currentBatteryLevel = 0.75;
const listeners = new Set<BatteryListener>();

function shouldUseNativeBattery(): boolean {
    if (Platform.OS === 'web') {
        return false;
    }

    return Constants.appOwnership !== 'expo';
}

function getNativeBatteryModule(): NativeBatteryModule | null {
    if (!shouldUseNativeBattery()) {
        return null;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const batteryModule = require('expo-battery') as NativeBatteryModule;
        return batteryModule;
    } catch {
        return null;
    }
}

function mapNativeBatteryState(nativeBatteryState: number): BatteryState {
    switch (nativeBatteryState) {
        case BatteryState.UNPLUGGED:
            return BatteryState.UNPLUGGED;
        case BatteryState.CHARGING:
            return BatteryState.CHARGING;
        case BatteryState.FULL:
            return BatteryState.FULL;
        default:
            return BatteryState.UNKNOWN;
    }
}

export async function getSafeBatteryState(): Promise<BatteryState> {
    const nativeBattery = getNativeBatteryModule();
    if (nativeBattery) {
        try {
            const nativeState = await nativeBattery.getBatteryStateAsync();
            currentBatteryState = mapNativeBatteryState(nativeState);
            return currentBatteryState;
        } catch {
            return currentBatteryState;
        }
    }

    return currentBatteryState;
}

export async function getSafeBatteryLevel(): Promise<number> {
    const nativeBattery = getNativeBatteryModule();
    if (nativeBattery) {
        try {
            currentBatteryLevel = await nativeBattery.getBatteryLevelAsync();
            return currentBatteryLevel;
        } catch {
            return currentBatteryLevel;
        }
    }

    return currentBatteryLevel;
}

export function addSafeBatteryListener(callback: BatteryListener) {
    const nativeBattery = getNativeBatteryModule();
    if (nativeBattery) {
        try {
            return nativeBattery.addBatteryStateListener(({ batteryState }) => {
                currentBatteryState = mapNativeBatteryState(batteryState);
                callback({ batteryState: currentBatteryState });
            });
        } catch {
            // Fall back to the simulator listener below.
        }
    }

    listeners.add(callback);
    return {
        remove: () => {
            listeners.delete(callback);
        },
    };
}

export function triggerSimulatorCharging(isCharging: boolean) {
    currentBatteryState = isCharging ? BatteryState.CHARGING : BatteryState.UNPLUGGED;
    listeners.forEach((callback) => callback({ batteryState: currentBatteryState }));
}
