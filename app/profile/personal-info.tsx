import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { updateProfile } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { normalizeApiError } from '@/utils/api-error';

interface ProfileForm {
    name: string;
    email: string;
    phone: string;
    vehicleModel: string;
}

export default function PersonalInfoScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [error, setError] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [form, setForm] = useState<ProfileForm>({
        name: '',
        email: '',
        phone: '',
        vehicleModel: '',
    });

    useEffect(() => {
        if (isDirty) {
            return;
        }

        setForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
            phone: user?.phone ?? '',
            vehicleModel: user?.vehicle_type ?? '',
        });
    }, [isDirty, user?.email, user?.name, user?.phone, user?.vehicle_type]);

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (response) => {
            setUser(response.data.data);
            setIsDirty(false);
            Alert.alert('Saved', 'Your profile has been updated successfully.');
            router.back();
        },
        onError: (mutationError) => {
            setError(normalizeApiError(mutationError).message);
        },
    });

    const handleSave = () => {
        const trimmedName = form.name.trim();
        if (!trimmedName) {
            setError('Full name is required.');
            return;
        }

        setError('');
        updateMutation.mutate({
            name: trimmedName,
            email: form.email.trim() || null,
            vehicle_type: form.vehicleModel.trim() || null,
        });
    };

    const handleChangeAvatar = () => {
        Alert.alert('Change Photo', 'Photo picker will open here when integrated.');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Typography variant="h3" color="primary">
                    Personal Info
                </Typography>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInUp.springify()}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            <Typography variant="h1" color="primary">
                                {form.name.trim().charAt(0).toUpperCase() || 'D'}
                            </Typography>
                            <TouchableOpacity
                                style={styles.editAvatarBtn}
                                onPress={handleChangeAvatar}
                                accessibilityLabel="Change profile photo"
                            >
                                <Ionicons name="camera" size={14} color={Colors.brand.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={form.name}
                            onChangeText={(value) => {
                                setIsDirty(true);
                                setForm((current) => ({ ...current, name: value }));
                                if (error) {
                                    setError('');
                                }
                            }}
                            error={error && !form.name.trim() ? error : undefined}
                        />
                        <Input
                            label="Email Address"
                            placeholder="john@example.com"
                            value={form.email}
                            onChangeText={(value) => {
                                setIsDirty(true);
                                setForm((current) => ({ ...current, email: value }));
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            label="Phone Number"
                            placeholder="+91 9876543210"
                            value={form.phone}
                            keyboardType="phone-pad"
                            editable={false}
                            style={styles.readOnlyInput}
                        />
                        <Input
                            label="Vehicle Model"
                            placeholder="E.g. Tata Nexon EV"
                            value={form.vehicleModel}
                            onChangeText={(value) => {
                                setIsDirty(true);
                                setForm((current) => ({ ...current, vehicleModel: value }));
                            }}
                        />
                        {error && form.name.trim() ? (
                            <Typography variant="bodySmall" color="error">
                                {error}
                            </Typography>
                        ) : null}
                    </View>

                    <Button
                        label="Save Changes"
                        onPress={handleSave}
                        fullWidth
                        loading={updateMutation.isPending}
                        style={styles.saveButton}
                    />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.mintWhite },
    header: {
        paddingTop: 60,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.brand.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    backBtn: { padding: Spacing.xs, width: 44 },
    content: { padding: Spacing.xl },
    avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${Colors.brand.primary}20`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.brand.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.brand.white,
    },
    formSection: { gap: Spacing.lg },
    readOnlyInput: {
        opacity: 0.7,
    },
    saveButton: {
        marginTop: Spacing.xl,
    },
});
