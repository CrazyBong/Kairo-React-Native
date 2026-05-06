// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
    const easProjectId = process.env.EAS_PROJECT_ID;

    return ({
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
        apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1',
        googleMapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        ...(easProjectId
            ? {
                  eas: {
                      projectId: easProjectId,
                  },
              }
            : {}),
    },
    plugins: [
        'expo-router',
        'expo-location',
        'expo-font',
        'expo-secure-store',
        '@sentry/react-native'
    ],
    experiments: {
        typedRoutes: true
    }
    });
};
