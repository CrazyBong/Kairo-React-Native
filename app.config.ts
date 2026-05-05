// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Kairo',
    slug: 'kairo-evcharge',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'kairo',
    userInterfaceStyle: 'automatic',
    splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'in.evchargefinder.kairo'
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff'
        },
        package: 'in.evchargefinder.kairo',
        config: {
            googleMaps: {
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyDummyKeyForOSMFallbackD0N0TUSE',
            }
        }
    },
    web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/favicon.png'
    },
    extra: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1',
        googleMapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        eas: {
            projectId: 'your-project-id'
        }
    },
    plugins: [
        'expo-router',
        'expo-location'
    ],
    experiments: {
        typedRoutes: true
    }
});
