// src/components/ui/Badge.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants';
import { Typography } from './Typography';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    colorHex?: string; // Explicit color override, used for Charger Types
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'default',
    colorHex,
    style,
}) => {
    const getBackgroundColor = () => {
        if (colorHex) return colorHex;
        switch (variant) {
            case 'success': return Colors.semantic.success;
            case 'warning': return Colors.semantic.warning;
            case 'error': return Colors.semantic.error;
            case 'info': return Colors.brand.primary;
            default: return Colors.surface.subtle;
        }
    };

    const getTextColor = () => {
        // Determine if we need light or dark text based on variant.
        // For default/subtle, we use dark text
        if (!colorHex && variant === 'default') return 'primary';
        return 'inverted';
    };

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
            <Typography variant="mono" color={getTextColor()}>
                {label}
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.pill, // Figma pill badge
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
