import { device } from 'detox';

beforeAll(async () => {
    await device.launchApp({ delete: true, newInstance: true });
});
