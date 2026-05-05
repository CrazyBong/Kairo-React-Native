// src/components/ui/Chip.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants';
import { Typography } from './Typography';

interface ChipProps {
    label: string;
    active?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
    label,
    active = false,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onPress}
            onPress={onPress}
            style={[
                styles.base,
                active ? styles.active : styles.inactive,
                style,
            ]}
        >
            <Typography
                variant="label"
                color={active ? 'inverted' : 'primary'}
            >
                {label}
            </Typography>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.pill,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    active: {
        backgroundColor: Colors.brand.black,
        borderColor: Colors.brand.black,
    },
    inactive: {
        backgroundColor: Colors.brand.white,
        borderColor: Colors.border.default,
    },
});
