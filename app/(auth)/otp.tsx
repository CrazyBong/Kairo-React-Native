import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { sendOtp, verifyOtp } from '@/api/auth';
import { OTPInput } from '@/components/auth/OTPInput';
import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { normalizeApiError } from '@/utils/api-error';

export default function OTPScreen() {
    const router = useRouter();
    const { phone } = useLocalSearchParams<{ phone: string }>();
    const setTokens = useAuthStore((state) => state.setTokens);

    const [error, setError] = useState('');
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (!phone) {
            router.replace('/(auth)');
        }
    }, [phone, router]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((previousTimer) => previousTimer - 1);
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timer]);

    const verifyMutation = useMutation({
        mutationFn: (otp: string) => verifyOtp(phone!, otp),
        onSuccess: (response: any) => {
            const data = response.data?.data;
            if (!data?.access_token || !data?.refresh_token) {
                setError('Verification failed. Please try again.');
                return;
            }

            setTokens(data.access_token, data.refresh_token);
            if (data.is_new_user) {
                router.replace('/(auth)/profile-setup');
            } else {
                router.replace('/(app)');
            }
        },
        onError: (mutationError) => {
            setError(normalizeApiError(mutationError).message);
        },
    });

    const resendMutation = useMutation({
        mutationFn: () => sendOtp(phone!),
        onSuccess: () => {
            setTimer(30);
            setError('');
        },
        onError: (mutationError) => {
            setError(normalizeApiError(mutationError).message);
        },
    });

    if (!phone) {
        return null;
    }

    const handleComplete = (otp: string) => {
        setError('');
        verifyMutation.mutate(otp);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Typography variant="body" color="tertiary">
                            Back
                        </Typography>
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Typography variant="h1" color="primary">
                            Verify your number
                        </Typography>
                        <Typography variant="body" color="tertiary" style={styles.subtitle}>
                            Code sent to {phone}
                        </Typography>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.formContainer}>
                    <OTPInput length={6} onComplete={handleComplete} error={error} />

                    <View style={styles.resendContainer}>
                        {timer > 0 ? (
                            <Typography variant="body" color="tertiary">
                                Resend code in{' '}
                                <Typography variant="body" color="primary">
                                    00:{timer.toString().padStart(2, '0')}
                                </Typography>
                            </Typography>
                        ) : (
                            <TouchableOpacity
                                onPress={() => resendMutation.mutate()}
                                disabled={resendMutation.isPending}
                            >
                                <Typography variant="body" color="primary">
                                    {resendMutation.isPending ? 'Sending...' : 'Resend Code'}
                                </Typography>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>

            {verifyMutation.isPending ? (
                <View style={styles.footerOverlay}>
                    <Typography variant="body" color="primary">
                        Verifying...
                    </Typography>
                </View>
            ) : null}
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
        paddingTop: Spacing.xxl,
    },
    backButton: {
        marginBottom: Spacing.xl,
    },
    header: {
        marginBottom: Spacing.xxl,
    },
    subtitle: {
        marginTop: Spacing.xs,
    },
    formContainer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    resendContainer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    footerOverlay: {
        position: 'absolute',
        bottom: Spacing.xl,
        alignSelf: 'center',
    },
});
