/** @type {Detox.DetoxConfig} */
const androidGradleBuildCommand =
    process.platform === 'win32'
        ? 'cd android && gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug'
        : 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug';

module.exports = {
    testRunner: {
        args: {
            $0: 'jest',
            config: 'e2e/jest.config.js',
        },
        jest: {
            setupTimeout: 120000,
        },
    },
    apps: {
        'android.debug': {
            type: 'android.apk',
            binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
            build: androidGradleBuildCommand,
        },
    },
    devices: {
        emulator: {
            type: 'android.emulator',
            device: {
                avdName: 'Pixel_6_API_35',
            },
        },
    },
    configurations: {
        'android.emu.debug': {
            device: 'emulator',
            app: 'android.debug',
        },
    },
};
