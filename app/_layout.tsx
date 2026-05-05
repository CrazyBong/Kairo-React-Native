// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useAuthStore } from '@/store/auth.store';
import { useChargingSimulation } from '@/hooks/useChargingSimulation';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    initialRouteName: '(app)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
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
        if (error) throw error;
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

// 🔧 DEV MODE: Set to false when ready to re-enable auth
const DEV_BYPASS_AUTH = true;

function RootLayoutNav() {
    const { isAuthenticated } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    // Phase 10: Register global Charging Simulation listener
    useChargingSimulation();

    useEffect(() => {
        if (DEV_BYPASS_AUTH) return;

        const inAuthGroup = segments[0] === '(auth)';
        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(app)');
        }
    }, [isAuthenticated, segments]);

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                {DEV_BYPASS_AUTH ? null : <Stack.Screen name="(auth)" />}
                <Stack.Screen name="(app)" />
                <Stack.Screen name="station/[id]" options={{ presentation: 'card' }} />
                <Stack.Screen name="station/[id]/slots" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="booking/[id]" options={{ presentation: 'card' }} />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}
