// src/components/auth/OTPInput.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Keyboard } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '@/constants';
import { Typography } from '../ui/Typography';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    error?: string | null;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, error }) => {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const inputs = useRef<(TextInput | null)[]>([]);

    const shakeTranslation = useSharedValue(0);

    useEffect(() => {
        if (error) {
            shakeTranslation.value = withSequence(
                withTiming(-8, { duration: 50 }),
                withTiming(8, { duration: 50 }),
                withTiming(-8, { duration: 50 }),
                withTiming(8, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
        }
    }, [error, shakeTranslation]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeTranslation.value }],
    }));

    const focusInput = (index: number) => {
        if (index >= 0 && index < length) {
            inputs.current[index]?.focus();
            setFocusedIndex(index);
        }
    };

    const handleTextChange = (text: string, index: number) => {
        const newOtp = [...otp];

        // Handle paste
        if (text.length > 1) {
            const pasted = text.slice(0, length).split('');
            pasted.forEach((char, i) => {
                if (index + i < length) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + pasted.length, length - 1);
            focusInput(nextIndex);
            if (newOtp.join('').length === length) {
                onComplete(newOtp.join(''));
                Keyboard.dismiss();
            }
            return;
        }

        // Normal input
        newOtp[index] = text;
        setOtp(newOtp);

        if (text !== '') {
            if (index < length - 1) {
                focusInput(index + 1);
            } else if (newOtp.join('').length === length) {
                onComplete(newOtp.join(''));
                Keyboard.dismiss();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
            focusInput(index - 1);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.inputContainer, animatedStyle]}>
                {otp.map((digit, index) => {
                    const isFocused = focusedIndex === index;
                    return (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                inputs.current[index] = ref;
                            }}
                            style={[
                                styles.box,
                                isFocused && styles.boxFocused,
                                error && styles.boxError,
                            ]}
                            value={digit}
                            onChangeText={(text) => handleTextChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            onFocus={() => setFocusedIndex(index)}
                            keyboardType="number-pad"
                            maxLength={length} // To catch pasting
                            selectTextOnFocus
                            cursorColor={Colors.brand.primary}
                        />
                    );
                })}
            </Animated.View>
            {error && (
                <Typography variant="caption" color="primary" style={styles.errorText}>
                    {error}
                </Typography>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    box: {
        width: 48,
        height: 56,
        borderWidth: 1,
        borderColor: Colors.border.default,
        borderRadius: Radius.md,
        backgroundColor: Colors.surface.default,
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'Inter_500Medium',
        color: Colors.text.primary,
    },
    boxFocused: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.brand.primary,
        backgroundColor: Colors.brand.mintWhite,
    },
    boxError: {
        borderColor: Colors.semantic.error,
        borderStyle: 'solid',
        backgroundColor: Colors.surface.default,
    },
    errorText: {
        color: Colors.semantic.error,
        marginTop: Spacing.sm,
    },
});
