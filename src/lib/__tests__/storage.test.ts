/* eslint-disable @typescript-eslint/no-require-imports */
describe('app storage', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.unmock('react-native-mmkv');
    });

    it('falls back to in-memory storage when MMKV is unavailable', () => {
        jest.isolateModules(() => {
            jest.doMock('react-native-mmkv', () => {
                throw new Error('MMKV unavailable');
            });

            const { getAppStorage, resetAppStorage } = require('@/lib/storage') as typeof import('@/lib/storage');

            resetAppStorage();
            const storage = getAppStorage();
            storage.set('token', 'abc');

            expect(storage.getString('token')).toBe('abc');
            storage.delete('token');
            expect(storage.getString('token')).toBeUndefined();
        });
    });

    it('uses the MMKV implementation when the native module is available', () => {
        jest.isolateModules(() => {
            const set = jest.fn();
            const getString = jest.fn((key: string) => (key === 'token' ? 'persisted' : undefined));
            const remove = jest.fn();

            jest.doMock('react-native-mmkv', () => ({
                MMKV: jest.fn().mockImplementation(() => ({
                    set,
                    getString,
                    delete: remove,
                    clearAll: jest.fn(),
                })),
            }));

            const { getAppStorage } = require('@/lib/storage') as typeof import('@/lib/storage');
            const storage = getAppStorage();

            storage.set('token', 'next');
            expect(set).toHaveBeenCalledWith('token', 'next');
            expect(storage.getString('token')).toBe('persisted');
            expect(getString).toHaveBeenCalledWith('token');
            storage.delete('token');
            expect(remove).toHaveBeenCalledWith('token');
        });
    });
});
