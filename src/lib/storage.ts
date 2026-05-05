/* eslint-disable @typescript-eslint/no-require-imports */
type StorageValue = string | null;

interface KeyValueStorage {
    getString(key: string): StorageValue;
    set(key: string, value: string): void;
    delete(key: string): void;
    clearAll(): void;
}

class MemoryStorage implements KeyValueStorage {
    private readonly store = new Map<string, string>();

    getString(key: string): StorageValue {
        return this.store.get(key) ?? null;
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
            MMKV?: new (config?: { id?: string }) => KeyValueStorage;
        };

        if (mmkvModule.MMKV) {
            return new mmkvModule.MMKV({ id: 'kairo-auth' });
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

export function resetAppStorage(): void {
    storageInstance = new MemoryStorage();
}
