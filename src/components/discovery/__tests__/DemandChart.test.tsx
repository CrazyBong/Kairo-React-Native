import React from 'react';
import { render } from '@testing-library/react-native';

import { DemandChart } from '@/components/discovery/DemandChart';

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-native-reanimated', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        __esModule: true,
        default: {
            View: ({ children, ...props }: React.ComponentProps<typeof View>) => <View {...props}>{children}</View>,
        },
        FadeInUp: {
            delay: () => ({
                springify: () => ({}),
            }),
        },
    };
});

describe('DemandChart', () => {
    it('renders an empty-state message when no useful forecast exists', () => {
        const screen = render(<DemandChart forecast={[]} peakHours={[]} />);

        expect(
            screen.getByText('Not enough booking history yet to generate a useful demand trend.')
        ).toBeTruthy();
    });

    it('renders peak-hour insights from backend forecast data', () => {
        const screen = render(
            <DemandChart
                forecast={[
                    { hour: 0, predicted_bookings: 1, load_percent: 10 },
                    { hour: 4, predicted_bookings: 0.5, load_percent: 5 },
                    { hour: 8, predicted_bookings: 8, load_percent: 90 },
                    { hour: 12, predicted_bookings: 6, load_percent: 60 },
                    { hour: 16, predicted_bookings: 4, load_percent: 40 },
                    { hour: 20, predicted_bookings: 7, load_percent: 80 },
                ]}
                peakHours={[8, 20]}
            />
        );

        expect(screen.getByText(/8AM, 8PM/)).toBeTruthy();
        expect(screen.getByText(/4AM \(Lowest Demand\)/)).toBeTruthy();
    });
});
