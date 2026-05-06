/* eslint-disable @typescript-eslint/no-require-imports */

jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(async () => null),
    setItemAsync: jest.fn(async () => undefined),
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'when-unlocked',
}));

jest.mock('expo-crypto', () => ({
    getRandomBytesAsync: jest.fn(async () => new Uint8Array(32).fill(7)),
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(async () => undefined),
    ImpactFeedbackStyle: {
        Light: 'light',
    },
}));

jest.mock('expo-updates', () => ({
    reloadAsync: jest.fn(async () => undefined),
}));

jest.mock('@react-native-community/netinfo', () => ({
    __esModule: true,
    default: {
        addEventListener: jest.fn(() => jest.fn()),
        fetch: jest.fn(async () => ({
            isConnected: true,
            isInternetReachable: true,
            type: 'wifi',
        })),
    },
}));

jest.mock('react-native-safe-area-context', () => {
    return {
        SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    };
});

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    const Icon = ({ name }: { name?: string }) => React.createElement(Text, null, name ?? 'icon');

    return {
        Ionicons: Icon,
        MaterialCommunityIcons: Icon,
    };
});
