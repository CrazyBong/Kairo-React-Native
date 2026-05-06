import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/Button';

describe('Button', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls onPress when active', () => {
        const onPress = jest.fn();
        const screen = render(<Button label="Book now" onPress={onPress} />);

        fireEvent.press(screen.getByText('Book now'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('prevents presses while loading', () => {
        const onPress = jest.fn();
        const screen = render(<Button label="Book now" onPress={onPress} loading />);
        const button = screen.UNSAFE_getByType(TouchableOpacity);

        expect(button.props.disabled).toBe(true);
        expect(onPress).not.toHaveBeenCalled();
    });

    it('triggers light haptics on press by default', () => {
        const onPress = jest.fn();
        const screen = render(<Button label="Charge now" onPress={onPress} />);

        fireEvent.press(screen.getByText('Charge now'));

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
