import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { setStorageEncryptionKey } from '@/lib/storage';

const MMKV_ENCRYPTION_KEY_ALIAS = 'kairo.mmkv.encryption-key';
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function generateEncryptionKey(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(32);
    return toHex(bytes);
}

export async function initializeAppSecurity(): Promise<string> {
    const existingKey = await SecureStore.getItemAsync(MMKV_ENCRYPTION_KEY_ALIAS, SECURE_STORE_OPTIONS);
    if (existingKey) {
        setStorageEncryptionKey(existingKey);
        return existingKey;
    }

    const nextKey = await generateEncryptionKey();
    await SecureStore.setItemAsync(MMKV_ENCRYPTION_KEY_ALIAS, nextKey, SECURE_STORE_OPTIONS);
    setStorageEncryptionKey(nextKey);
    return nextKey;
}
