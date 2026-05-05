// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants';
import { Typography } from './Typography';

type Variant = 'primary' | 'white' | 'brand' | 'error' | 'glassDark' | 'glassLight';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    style,
}) => {
    const isDisabled = disabled || loading;

    const getTextColor = () => {
        if (variant === 'primary' || variant === 'brand' || variant === 'glassDark') return 'inverted';
        return 'primary';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={[
                styles.base,
                styles[variant],
                styles[`size_${size}`],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'white' ? Colors.brand.dark : Colors.brand.white}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Typography
                        variant={size === 'lg' ? 'button' : 'bodySmall'}
                        color={getTextColor()}
                        align="center"
                        style={[
                            { fontWeight: '500' },
                            icon ? { marginLeft: Spacing.sm } : { width: '100%', flex: 1 }
                        ]}
                    >
                        {label}
                    </Typography>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.pill,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    primary: {
        backgroundColor: Colors.brand.primary,
    },
    white: {
        backgroundColor: Colors.surface.default,
        borderColor: Colors.border.divider,
    },
    brand: {
        backgroundColor: Colors.brand.dark,
    },
    glassDark: {
        backgroundColor: Colors.surface.glassDark,
    },
    glassLight: {
        backgroundColor: Colors.surface.glassLight,
    },
    size_sm: {
        paddingHorizontal: Spacing.md,
        height: 36,
    },
    size_md: {
        paddingHorizontal: Spacing.lg,
        height: 48,
    },
    size_lg: {
        paddingHorizontal: Spacing.xl,
        height: 56,
    },
    fullWidth: {
        width: '100%',
    },
    error: {
        backgroundColor: Colors.semantic.error,
    },
    disabled: {
        opacity: 0.4,
    },
});
