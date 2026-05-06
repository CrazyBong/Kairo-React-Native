import * as SecureStore from 'expo-secure-store';

import { initializeAppSecurity } from '@/lib/security';
import { getAppStorage, resetAppStorage } from '@/lib/storage';

describe('app security bootstrap', () => {
    beforeEach(() => {
        resetAppStorage();
        jest.clearAllMocks();
    });

    it('reuses the existing secure-store key when present', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('persisted-key');

        const key = await initializeAppSecurity();

        expect(key).toBe('persisted-key');
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
        resetAppStorage();
        expect(getAppStorage()).toBeDefined();
    });

    it('fails closed when secure storage is unavailable', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('secure store unavailable'));

        await expect(initializeAppSecurity()).rejects.toThrow('secure store unavailable');
    });
});
