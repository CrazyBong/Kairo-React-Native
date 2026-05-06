import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useChargingSimulation } from '@/hooks/useChargingSimulation';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockUseSegments = jest.fn();
const mockGetSafeBatteryState = jest.fn();
const mockGetSafeBatteryLevel = jest.fn();
const mockAddSafeBatteryListener = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
    useSegments: () => mockUseSegments(),
}));

jest.mock('@/utils/safe-battery', () => ({
    BatteryState: {
        UNKNOWN: 0,
        UNPLUGGED: 1,
        CHARGING: 2,
        FULL: 3,
    },
    getSafeBatteryState: (...args: unknown[]) => mockGetSafeBatteryState(...args),
    getSafeBatteryLevel: (...args: unknown[]) => mockGetSafeBatteryLevel(...args),
    addSafeBatteryListener: (...args: unknown[]) => mockAddSafeBatteryListener(...args),
}));

describe('useChargingSimulation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSegments.mockReturnValue(['(app)', 'index']);
        mockGetSafeBatteryState.mockResolvedValue(1);
        mockGetSafeBatteryLevel.mockResolvedValue(0.76);
        mockAddSafeBatteryListener.mockImplementation((callback: (event: { batteryState: number }) => void) => {
            return {
                remove: jest.fn(),
                callback,
            };
        });
    });

    it('redirects to the charging screen when the battery listener reports a charging state', async () => {
        let listenerCallback: ((event: { batteryState: number }) => void) | undefined;
        mockAddSafeBatteryListener.mockImplementation((callback: (event: { batteryState: number }) => void) => {
            listenerCallback = callback;
            return { remove: jest.fn() };
        });

        renderHook(() => useChargingSimulation());
        await waitFor(() => expect(mockAddSafeBatteryListener).toHaveBeenCalled());

        await act(async () => {
            listenerCallback?.({ batteryState: 2 });
        });

        expect(mockReplace).toHaveBeenCalledWith('/(app)/charging');
    });

    it('does not redirect when the user is already on a charging route', async () => {
        mockUseSegments.mockReturnValue(['(app)', 'charging']);

        let listenerCallback: ((event: { batteryState: number }) => void) | undefined;
        mockAddSafeBatteryListener.mockImplementation((callback: (event: { batteryState: number }) => void) => {
            listenerCallback = callback;
            return { remove: jest.fn() };
        });

        renderHook(() => useChargingSimulation());

        await act(async () => {
            listenerCallback?.({ batteryState: 2 });
        });

        expect(mockReplace).not.toHaveBeenCalled();
    });
});
