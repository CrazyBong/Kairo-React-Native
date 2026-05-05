import React, { createContext, useContext, useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import { getMe } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';

interface AuthContextType {
    isReady: boolean;
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
    const {
        accessToken,
        isAuthenticated,
        isHydrated,
        hydrate,
        logout,
        setUser,
    } = useAuthStore();
    const [isBootstrappingUser, setIsBootstrappingUser] = useState(true);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        let isMounted = true;

        async function loadCurrentUser() {
            if (!isHydrated) {
                return;
            }

            if (!accessToken || !isAuthenticated) {
                if (isMounted) {
                    setIsBootstrappingUser(false);
                }
                return;
            }

            try {
                const response = await getMe();
                if (isMounted) {
                    setUser(response.data.data);
                    setIsBootstrappingUser(false);
                }
            } catch (error) {
                if (isMounted) {
                    const status = error instanceof AxiosError ? error.response?.status : undefined;
                    if (status === 401) {
                        logout();
                    }
                    setIsBootstrappingUser(false);
                }
            }
        }

        if (isHydrated) {
            setIsBootstrappingUser(true);
        }
        loadCurrentUser();

        return () => {
            isMounted = false;
        };
    }, [accessToken, isAuthenticated, isHydrated, logout, setUser]);

    return (
        <AuthContext.Provider value={{ isReady: isHydrated && !isBootstrappingUser }}>
            {children}
        </AuthContext.Provider>
    );
};
