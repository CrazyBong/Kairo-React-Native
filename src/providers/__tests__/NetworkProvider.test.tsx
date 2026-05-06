import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';

import { NetworkProvider } from '@/providers/NetworkProvider';

describe('NetworkProvider', () => {
    it('shows an offline banner when connectivity drops', async () => {
        (NetInfo.fetch as jest.Mock).mockResolvedValue({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
        });

        render(
            <NetworkProvider>
                <></>
            </NetworkProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('network-offline-banner')).toBeTruthy();
        });
    });
});
