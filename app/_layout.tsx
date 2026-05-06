import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';

import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { NetworkProvider } from '@/providers/NetworkProvider';
import { useAuthStore } from '@/store/auth.store';
import { useChargingSimulation } from '@/hooks/useChargingSimulation';
import { initializeAppSecurity } from '@/lib/security';
import { AppErrorBoundary } from '@/components/app/AppErrorBoundary';
import { initializeMonitoring, Sentry } from '@/lib/monitoring';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
    initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();
initializeMonitoring();

export default function RootLayout() {
    const [isSecurityReady, setIsSecurityReady] = useState(false);
    const [securityError, setSecurityError] = useState<Error | null>(null);
    const [loaded, error] = useFonts({
        Inter_300Light,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    useEffect(() => {
        let isMounted = true;
        let hasSecurityFailed = false;

        initializeAppSecurity()
            .catch((securityError) => {
                hasSecurityFailed = true;
                Sentry.captureException(securityError);
                if (isMounted) {
                    setSecurityError(
                        securityError instanceof Error
                            ? securityError
                            : new Error('App security initialization failed')
                    );
                }
            })
            .finally(() => {
                if (isMounted && !hasSecurityFailed) {
                    setIsSecurityReady(true);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (securityError) {
        throw securityError;
    }

    useEffect(() => {
        if (loaded && isSecurityReady) {
            SplashScreen.hideAsync();
        }
    }, [isSecurityReady, loaded]);

    if (!loaded || !isSecurityReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AppErrorBoundary>
                    <QueryProvider>
                        <NetworkProvider>
                            <AuthProvider>
                                <RootLayoutNav />
                            </AuthProvider>
                        </NetworkProvider>
                    </QueryProvider>
                </AppErrorBoundary>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

function RootLayoutNav() {
    const { isAuthenticated, isHydrated } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useChargingSimulation();

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)');
            return;
        }

        if (isAuthenticated && inAuthGroup) {
            router.replace('/(app)');
        }
    }, [isAuthenticated, isHydrated, router, segments]);

    if (!isHydrated) {
        return null;
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
                <Stack.Screen name="station/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen
                    name="station/[id]/slots"
                    options={{ presentation: 'modal', headerShown: false }}
                />
                <Stack.Screen name="booking/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="booking/confirm" options={{ presentation: 'card' }} />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}
