import React from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants';
import { Sentry } from '@/lib/monitoring';

interface NetworkStatus {
    isOnline: boolean;
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
}

const INITIAL_STATUS: NetworkStatus = {
    isOnline: true,
    isConnected: true,
    isInternetReachable: true,
};

const NetworkContext = React.createContext<NetworkStatus>(INITIAL_STATUS);

function toNetworkStatus(state: NetInfoState): NetworkStatus {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable ?? true;

    return {
        isConnected,
        isInternetReachable,
        isOnline: Boolean(isConnected && isInternetReachable),
    };
}

function OfflineBanner() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.banner, { paddingTop: insets.top + Spacing.sm }]} testID="network-offline-banner">
            <Typography variant="bodySmall" color="inverted" align="center">
                You&apos;re offline. Some live data may be stale until the connection returns.
            </Typography>
        </View>
    );
}

export const useNetworkStatus = () => React.useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = React.useState<NetworkStatus>(INITIAL_STATUS);

    React.useEffect(() => {
        const syncNetworkState = (state: NetInfoState) => {
            const nextStatus = toNetworkStatus(state);
            setStatus(nextStatus);
            onlineManager.setOnline(nextStatus.isOnline);
            Sentry.addBreadcrumb({
                category: 'network',
                level: 'info',
                message: nextStatus.isOnline ? 'Network reconnected' : 'Network offline',
                data: {
                    type: state.type,
                    isConnected: nextStatus.isConnected,
                    isInternetReachable: nextStatus.isInternetReachable,
                },
            });
        };

        const unsubscribe = NetInfo.addEventListener(syncNetworkState);
        NetInfo.fetch().then(syncNetworkState).catch(() => {
            onlineManager.setOnline(true);
        });

        return unsubscribe;
    }, []);

    return (
        <NetworkContext.Provider value={status}>
            {children}
            {!status.isOnline ? <OfflineBanner /> : null}
        </NetworkContext.Provider>
    );
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backgroundColor: Colors.brand.dark,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
});
