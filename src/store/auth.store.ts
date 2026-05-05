import { create } from 'zustand';

import { getAppStorage } from '@/lib/storage';

export interface User {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
    role: 'user' | 'admin';
    vehicle_type: string | null;
    preferred_connector: string | null;
    expo_push_token: string | null;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setTokens: (access: string, refresh: string) => void;
    setAccessToken: (accessToken: string, refreshToken?: string | null) => void;
    setUser: (user: User | null) => void;
    hydrate: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isHydrated: false,
    setTokens: (accessToken, refreshToken) => {
        const storage = getAppStorage();
        storage.set('access_token', accessToken);
        storage.set('refresh_token', refreshToken);

        set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
        });
    },
    setAccessToken: (accessToken, refreshToken) => {
        const storage = getAppStorage();
        storage.set('access_token', accessToken);
        if (refreshToken !== undefined) {
            if (refreshToken === null) {
                storage.delete('refresh_token');
            } else {
                storage.set('refresh_token', refreshToken);
            }
        }

        set((state) => ({
            accessToken,
            refreshToken: refreshToken === undefined ? state.refreshToken : refreshToken,
            isAuthenticated: true,
        }));
    },
    setUser: (user) => {
        set((state) => ({
            user,
            isAuthenticated: Boolean(state.accessToken),
        }));
    },
    hydrate: () => {
        const storage = getAppStorage();
        const accessToken = storage.getString('access_token');
        const refreshToken = storage.getString('refresh_token');

        set({
            accessToken,
            refreshToken,
            isAuthenticated: Boolean(accessToken),
            isHydrated: true,
        });
    },
    logout: () => {
        const storage = getAppStorage();
        storage.delete('access_token');
        storage.delete('refresh_token');

        set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isHydrated: true,
        });
    },
}));
