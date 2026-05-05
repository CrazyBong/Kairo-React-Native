// src/components/ui/Avatar.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants';
import { Typography } from './Typography';

interface AvatarProps {
    initials: string;
    size?: number;
    style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ initials, size = 48, style }) => {
    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                style,
            ]}
        >
            <Typography variant="h4" color="primary">
                {initials.substring(0, 2).toUpperCase()}
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface.glassDark,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
});
