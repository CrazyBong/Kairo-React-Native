import { getAppStorage, resetAppStorage } from '@/lib/storage';
import { useAuthStore } from '@/store/auth.store';

describe('auth store', () => {
    beforeEach(() => {
        resetAppStorage();
        useAuthStore.setState({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isHydrated: false,
        });
    });

    it('persists tokens when authentication succeeds', () => {
        useAuthStore.getState().setTokens('access-token', 'refresh-token');

        expect(getAppStorage().getString('access_token')).toBe('access-token');
        expect(getAppStorage().getString('refresh_token')).toBe('refresh-token');
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('hydrates tokens from storage on app launch', () => {
        getAppStorage().set('access_token', 'persisted-access');
        getAppStorage().set('refresh_token', 'persisted-refresh');

        useAuthStore.getState().hydrate();

        expect(useAuthStore.getState().accessToken).toBe('persisted-access');
        expect(useAuthStore.getState().refreshToken).toBe('persisted-refresh');
        expect(useAuthStore.getState().isHydrated).toBe(true);
    });

    it('clears tokens on logout', () => {
        useAuthStore.getState().setTokens('access-token', 'refresh-token');

        useAuthStore.getState().logout();

        expect(getAppStorage().getString('access_token')).toBeNull();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
});
