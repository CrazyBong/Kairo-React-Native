/* eslint-disable @typescript-eslint/no-require-imports */
type StorageValue = string | undefined;
let storageEncryptionKey: string | null = null;

interface KeyValueStorage {
    getString(key: string): StorageValue;
    set(key: string, value: string): void;
    delete(key: string): void;
    clearAll(): void;
}

class MemoryStorage implements KeyValueStorage {
    private readonly store = new Map<string, string>();

    getString(key: string): StorageValue {
        return this.store.get(key);
    }

    set(key: string, value: string): void {
        this.store.set(key, value);
    }

    delete(key: string): void {
        this.store.delete(key);
    }

    clearAll(): void {
        this.store.clear();
    }
}

let storageInstance: KeyValueStorage | null = null;

function createStorage(): KeyValueStorage {
    try {
        const mmkvModule = require('react-native-mmkv') as {
            MMKV?: new (config?: { id?: string; encryptionKey?: string }) => KeyValueStorage;
        };

        if (mmkvModule.MMKV) {
            return new mmkvModule.MMKV({
                id: 'kairo-auth',
                encryptionKey: storageEncryptionKey ?? undefined,
            });
        }
    } catch {
        // Tests and non-native environments fall back to memory storage.
    }

    return new MemoryStorage();
}

export function getAppStorage(): KeyValueStorage {
    if (!storageInstance) {
        storageInstance = createStorage();
    }

    return storageInstance;
}

export function setStorageEncryptionKey(encryptionKey: string | null): void {
    storageEncryptionKey = encryptionKey;
    storageInstance = null;
}

export function resetAppStorage(): void {
    storageInstance = new MemoryStorage();
    storageEncryptionKey = null;
}
