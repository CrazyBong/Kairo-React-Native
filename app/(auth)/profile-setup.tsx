import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { updateProfile } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { normalizeApiError } from '@/utils/api-error';

export default function ProfileSetupScreen() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [vehicle, setVehicle] = useState('');
    const [error, setError] = useState('');

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (response) => {
            setUser(response.data.data);
            router.replace('/(app)');
        },
        onError: (mutationError) => {
            setError(normalizeApiError(mutationError).message);
        },
    });

    const handleComplete = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Name is required.');
            return;
        }

        setError('');
        updateMutation.mutate({
            name: trimmedName,
            email: email.trim() || null,
            vehicle_type: vehicle.trim() || null,
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <View style={styles.header}>
                        <View style={styles.iconPlaceholder}>
                            <View style={styles.avatarShape} />
                        </View>
                        <Typography variant="h1" color="primary">
                            Complete your profile
                        </Typography>
                        <Typography variant="body" color="tertiary" style={styles.subtitle}>
                            Add the basics now. You can refine the rest later from your profile.
                        </Typography>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.formContainer}>
                    <Input
                        label="Full Name *"
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (error) {
                                setError('');
                            }
                        }}
                        error={error && !name.trim() ? error : undefined}
                    />
                    <Input
                        label="Email Address (Optional)"
                        placeholder="e.g. rahul@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Input
                        label="Vehicle Model (Optional)"
                        placeholder="e.g. Tata Nexon EV"
                        value={vehicle}
                        onChangeText={setVehicle}
                    />
                    {error && name.trim() ? (
                        <Typography variant="bodySmall" color="error" style={styles.errorText}>
                            {error}
                        </Typography>
                    ) : null}
                </Animated.View>
            </ScrollView>

            <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.footer}>
                <Button
                    label="Go to Dashboard"
                    onPress={handleComplete}
                    loading={updateMutation.isPending}
                    disabled={!name.trim()}
                    fullWidth
                    size="lg"
                />
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
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    subtitle: {
        marginTop: Spacing.xs,
    },
    iconPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.brand.mintWhite,
        marginBottom: Spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarShape: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.brand.primary,
    },
    formContainer: {
        marginTop: Spacing.lg,
    },
    errorText: {
        marginTop: Spacing.sm,
    },
    footer: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxl + Spacing.sm,
        paddingTop: Spacing.lg,
        backgroundColor: Colors.brand.white,
    },
});
