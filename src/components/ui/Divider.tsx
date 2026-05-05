// src/components/ui/Divider.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants';

interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    style,
}) => {
    return (
        <View
            style={[
                orientation === 'horizontal' ? styles.horizontal : styles.vertical,
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    horizontal: {
        width: '100%',
        height: 1,
        backgroundColor: Colors.border.divider,
    },
    vertical: {
        height: '100%',
        width: 1,
        backgroundColor: Colors.border.divider,
    },
});
