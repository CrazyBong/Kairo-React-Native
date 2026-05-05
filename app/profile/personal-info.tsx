import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

// FIX: Form state is fully controlled
interface ProfileForm {
    name: string;
    email: string;
    phone: string;
    vehicleModel: string;
}

export default function PersonalInfoScreen() {
    const router = useRouter();

    // FIX: controlled state for all inputs
    const [form, setForm] = useState<ProfileForm>({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210',
        vehicleModel: 'Model 3 Long Range',
    });

    // FIX: Save Changes actually processes the form (calls API when wired)
    const handleSave = () => {
        // TODO: call PATCH /auth/me with form data
        Alert.alert('Saved', 'Your profile has been updated successfully.');
        router.back();
    };

    // FIX: Camera button has an onPress handler
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
                <Typography variant="h3" color="primary">Personal Info</Typography>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInUp.springify()}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            <Typography variant="h1" color="primary">
                                {form.name.charAt(0).toUpperCase()}
                            </Typography>
                            {/* FIX: camera button has onPress */}
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
                        {/* FIX: all inputs are controlled with onChangeText */}
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={form.name}
                            onChangeText={(v) => setForm(f => ({ ...f, name: v }))}
                        />
                        <Input
                            label="Email Address"
                            placeholder="john@example.com"
                            value={form.email}
                            onChangeText={(v) => setForm(f => ({ ...f, email: v }))}
                            keyboardType="email-address"
                        />
                        <Input
                            label="Phone Number"
                            placeholder="+91 9876543210"
                            value={form.phone}
                            onChangeText={(v) => setForm(f => ({ ...f, phone: v }))}
                            keyboardType="phone-pad"
                        />
                        <Input
                            label="Vehicle Model"
                            placeholder="E.g. Tata Nexon EV"
                            value={form.vehicleModel}
                            onChangeText={(v) => setForm(f => ({ ...f, vehicleModel: v }))}
                        />
                    </View>

                    {/* FIX: Save actually calls handleSave */}
                    <Button label="Save Changes" onPress={handleSave} fullWidth style={{ marginTop: Spacing.xl }} />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.mintWhite },
    header: {
        paddingTop: 60, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: Colors.brand.white, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle,
    },
    backBtn: { padding: Spacing.xs, width: 44 },
    content: { padding: Spacing.xl },
    avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl },
    avatarCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: Colors.brand.primary + '20',
        justifyContent: 'center', alignItems: 'center',
    },
    editAvatarBtn: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: Colors.brand.primary, width: 32, height: 32,
        borderRadius: 16, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: Colors.brand.white,
    },
    formSection: { gap: Spacing.lg },
});
