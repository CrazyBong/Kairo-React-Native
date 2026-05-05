// src/components/ui/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography as Tokens } from '@/constants';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    style,
    onFocus,
    onBlur,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    return (
        <View style={styles.container}>
            {label && (
                <Typography variant="label" color="primary" style={styles.label}>
                    {label}
                </Typography>
            )}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error ? styles.inputError : null,
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={Colors.text.disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {error ? (
                <Typography variant="caption" color="primary" style={styles.errorText}>
                    {error}
                </Typography>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: Spacing.md,
    },
    label: {
        marginBottom: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border.default, // Figma solid black border initially
        borderRadius: Radius.none,          // Figma technical sharp corners for inputs
        backgroundColor: Colors.surface.default,
    },
    inputFocused: {
        borderWidth: 2,                     // Thicker border on focus (approximating outline)
        borderStyle: 'dashed',              // Figma dashed outline focus!
    },
    inputError: {
        borderColor: Colors.semantic.error,
        borderStyle: 'solid',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: Spacing.md,
        ...Tokens.body,
        color: Colors.text.primary,
    },
    leftIcon: {
        paddingLeft: Spacing.md,
    },
    rightIcon: {
        paddingRight: Spacing.md,
    },
    errorText: {
        color: Colors.semantic.error,
        marginTop: Spacing.xs,
    },
});
