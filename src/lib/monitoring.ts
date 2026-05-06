import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

import type { User } from '@/store/auth.store';

let hasInitializedMonitoring = false;

export function initializeMonitoring(): void {
    if (hasInitializedMonitoring) {
        return;
    }

    const dsn =
        process.env.EXPO_PUBLIC_SENTRY_DSN ??
        (Constants.expoConfig?.extra?.sentryDsn as string | undefined) ??
        undefined;

    Sentry.init({
        dsn,
        enabled: Boolean(dsn),
        environment: __DEV__ ? 'development' : 'production',
        tracesSampleRate: __DEV__ ? 1 : 0.2,
        attachScreenshot: true,
        attachStacktrace: true,
        enableAutoSessionTracking: true,
    });

    hasInitializedMonitoring = true;
}

export function setMonitoringUser(user: User | null): void {
    if (!user) {
        Sentry.setUser(null);
        return;
    }

    Sentry.setUser({
        id: user.id,
    });

    Sentry.setTag('user_role', user.role);
    if (user.vehicle_type) {
        Sentry.setTag('vehicle_type', user.vehicle_type);
    }
}

export function captureHandledError(
    error: unknown,
    context: {
        area: string;
        extras?: Record<string, unknown>;
    }
): void {
    Sentry.captureException(error, {
        tags: {
            area: context.area,
            handled: true,
        },
        extra: context.extras,
    });
}

export { Sentry };
