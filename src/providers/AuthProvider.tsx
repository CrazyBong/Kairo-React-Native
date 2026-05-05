// src/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
    // Add auth-related methods if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, logout } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Consolidated navigation logic is in app/_layout.tsx
        // AuthProvider now strictly manages auth state/initialization
    }, [isAuthenticated, segments, router]);

    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};
