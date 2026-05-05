describe('safe battery utilities', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.unmock('expo-constants');
        jest.unmock('expo-battery');
        jest.unmock('react-native');
    });

    it('uses simulator state when running in Expo Go or unsupported environments', async () => {
        let batteryModule: typeof import('@/utils/safe-battery') | undefined;

        jest.isolateModules(() => {
            jest.doMock('expo-constants', () => ({
                __esModule: true,
                default: { appOwnership: 'expo' },
            }));
            jest.doMock('react-native', () => ({
                Platform: { OS: 'ios' },
            }));

            batteryModule = jest.requireActual('@/utils/safe-battery') as typeof import('@/utils/safe-battery');
        });

        expect(batteryModule).toBeDefined();
        expect(await batteryModule?.getSafeBatteryState()).toBe(batteryModule?.BatteryState.UNKNOWN);

        const listener = jest.fn();
        const subscription = batteryModule?.addSafeBatteryListener(listener);
        batteryModule?.triggerSimulatorCharging(true);

        expect(listener).toHaveBeenCalledWith({
            batteryState: batteryModule?.BatteryState.CHARGING,
        });

        subscription?.remove();
    });

    it('prefers the native battery module in standalone builds', async () => {
        let batteryModule: typeof import('@/utils/safe-battery') | undefined;

        jest.isolateModules(() => {
            const nativeAddListener = jest.fn((callback: (event: { batteryState: number }) => void) => {
                callback({ batteryState: 3 });
                return { remove: jest.fn() };
            });

            jest.doMock('expo-constants', () => ({
                __esModule: true,
                default: { appOwnership: 'standalone' },
            }));
            jest.doMock('react-native', () => ({
                Platform: { OS: 'android' },
            }));
            jest.doMock('expo-battery', () => ({
                getBatteryStateAsync: jest.fn().mockResolvedValue(2),
                getBatteryLevelAsync: jest.fn().mockResolvedValue(0.42),
                addBatteryStateListener: nativeAddListener,
            }));

            batteryModule = jest.requireActual('@/utils/safe-battery') as typeof import('@/utils/safe-battery');
        });

        expect(batteryModule).toBeDefined();
        expect(await batteryModule?.getSafeBatteryState()).toBe(batteryModule?.BatteryState.CHARGING);
        expect(await batteryModule?.getSafeBatteryLevel()).toBe(0.42);

        const callback = jest.fn();
        batteryModule?.addSafeBatteryListener(callback);
        expect(callback).toHaveBeenCalledWith({
            batteryState: batteryModule?.BatteryState.FULL,
        });
    });
});
