import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { StationCard } from '@/components/discovery/StationCard';

describe('StationCard', () => {
    it('renders station information and calls onPress with the station id', () => {
        const onPress = jest.fn();

        const screen = render(
            <StationCard
                station={{
                    id: 'station-1',
                    name: 'Tata Power Hub',
                    address: 'DB Mall, Bhopal',
                    distance: 1.4,
                    available_ports: 3,
                    total_ports: 6,
                    charger_types: ['CCS2', 'TYPE2'],
                }}
                onPress={onPress}
            />
        );

        expect(screen.getByText('Tata Power Hub')).toBeTruthy();
        expect(screen.getByText('3/6 Available')).toBeTruthy();

        fireEvent.press(screen.getByText('Tata Power Hub'));

        expect(onPress).toHaveBeenCalledWith('station-1');
    });
});
