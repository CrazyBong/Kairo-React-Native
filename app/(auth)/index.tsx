import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { sendOtp } from '@/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants';
import { formatIndianPhoneNumber, isValidIndianPhoneNumber } from '@/utils/phone';
import { normalizeApiError } from '@/utils/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { SendOtpResponse } from '@/api/auth';

function getDevOtpFromResponse(
    payload: SendOtpResponse | ApiSuccessResponse<SendOtpResponse>
): string | null | undefined {
    if ('data' in payload) {
        return payload.data?.dev_otp;
    }

    return payload.dev_otp;
}

export default function PhoneScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const sendOtpMutation = useMutation({
        mutationFn: sendOtp,
        onSuccess: (response, formattedPhone) => {
            const devOtp = getDevOtpFromResponse(response.data);
            if (__DEV__ && devOtp) {
                Alert.alert('Development OTP', `Use OTP ${devOtp} to continue.`, [
                    {
                        text: 'Continue',
                        onPress: () => {
                            router.push({ pathname: '/(auth)/otp', params: { phone: formattedPhone } });
                        },
                    },
                ]);
                return;
            }

            router.push({ pathname: '/(auth)/otp', params: { phone: formattedPhone } });
        },
        onError: (mutationError) => {
            setError(normalizeApiError(mutationError).message);
        },
    });

    const handleContinue = () => {
        const formattedPhone = formatIndianPhoneNumber(phone);

        if (!isValidIndianPhoneNumber(formattedPhone)) {
            setError('Please enter a valid 10-digit Indian mobile number.');
            return;
        }

        setError('');
        sendOtpMutation.mutate(formattedPhone);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <View style={styles.header}>
                        <View style={styles.iconPlaceholder}>
                            <Image
                                source={require('../../assets/kairo-logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Typography variant="h1" color="primary">
                            Enter your number
                        </Typography>
                        <Typography variant="body" color="tertiary" style={styles.subtitle} align="center">
                            We&apos;ll send a one-time password to verify your phone number.
                        </Typography>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.formContainer}>
                    <Input
                        testID="auth-phone-input"
                        placeholder="Mobile Number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(text.replace(/\D/g, '').slice(0, 10));
                            if (error) {
                                setError('');
                            }
                        }}
                        error={error}
                        maxLength={10}
                        leftIcon={
                            <Typography variant="body" color="primary" style={styles.prefix}>
                                +91
                            </Typography>
                        }
                    />
                </Animated.View>
            </View>

            <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.footer}>
                <Button
                    label="Continue"
                    onPress={handleContinue}
                    loading={sendOtpMutation.isPending}
                    disabled={phone.length < 10}
                    testID="auth-continue-button"
                    fullWidth
                    size="lg"
                />
                <Typography variant="caption" color="tertiary" style={styles.terms} align="center">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </Typography>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.brand.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.hero,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    iconPlaceholder: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoImage: {
        width: 112,
        height: 112,
        borderRadius: 24,
    },
    subtitle: {
        marginTop: Spacing.xs,
        maxWidth: 320,
    },
    formContainer: {
        marginTop: Spacing.xl,
    },
    prefix: {
        paddingRight: Spacing.sm,
        borderRightWidth: 1,
        borderColor: Colors.border.divider,
        marginRight: Spacing.sm,
    },
    footer: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxl,
        paddingTop: Spacing.lg,
    },
    terms: {
        marginTop: Spacing.md,
    },
});
