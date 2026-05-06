import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Updates from 'expo-updates';

import { AppErrorBoundary } from '@/components/app/AppErrorBoundary';

function ThrowingChild(): React.ReactElement {
    throw new Error('boom');
}

describe('AppErrorBoundary', () => {
    it('renders a recovery UI when a child crashes', () => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        render(
            <AppErrorBoundary>
                <ThrowingChild />
            </AppErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeTruthy();
        expect(screen.getByText('Reload app')).toBeTruthy();
        expect(screen.getByTestId('error-boundary-retry')).toBeTruthy();
        expect(Updates.reloadAsync).not.toHaveBeenCalled();

        (console.error as jest.Mock).mockRestore();
    });

    it('tries to reload the app when the recovery action is pressed', () => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        render(
            <AppErrorBoundary>
                <ThrowingChild />
            </AppErrorBoundary>
        );

        fireEvent.press(screen.getByTestId('error-boundary-retry'));

        expect(Updates.reloadAsync).toHaveBeenCalled();

        (console.error as jest.Mock).mockRestore();
    });
});
