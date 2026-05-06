/// <reference types="detox" />

describe('Auth smoke flow', () => {
    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('lets the user request an OTP and reach the verification screen', async () => {
        await expect(element(by.id('auth-phone-input'))).toBeVisible();
        await element(by.id('auth-phone-input')).typeText('9876543210');
        await element(by.id('auth-continue-button')).tap();

        await expect(element(by.id('auth-otp-input-0'))).toBeVisible();
    });
});
