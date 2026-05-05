import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { useAuthStore } from '@/store/auth.store';
import { useChargingSimulation } from '@/hooks/useChargingSimulation';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
    initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryProvider>
                <AuthProvider>
                    <RootLayoutNav />
                </AuthProvider>
            </QueryProvider>
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
