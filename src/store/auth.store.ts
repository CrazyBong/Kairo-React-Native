// src/store/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// Lazy MMKV initialization — Nitro JSI modules must not be initialized at top-level
let _storage: MMKV | null = null;
const getStorage = (): MMKV => {
    if (!_storage) {
        _storage = new MMKV({ id: 'kairo-auth' });
    }
    return _storage;
};

const mmkvStorage = {
    getItem: (key: string) => getStorage().getString(key) ?? null,
    setItem: (key: string, value: string) => getStorage().set(key, value),
    removeItem: (key: string) => getStorage().delete(key),
};

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
    setTokens: (access: string, refresh: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist<AuthState>(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            setTokens: (access: string, refresh: string) => {
                set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
            },
            setUser: (user: User) => set({ user }),
            logout: () => {
                const storage = getStorage();
                storage.delete('access_token');
                storage.delete('refresh_token');
                set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'kairo-auth',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
