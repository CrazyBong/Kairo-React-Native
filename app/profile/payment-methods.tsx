import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function PaymentMethodsScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Typography variant="h3" color="primary">Payment Methods</Typography>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInUp.springify()}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle}>SAVED CARDS</Typography>

                    <View style={[styles.card, styles.selectedCard]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="card" size={24} color={Colors.brand.primary} />
                            <View style={styles.defaultBadge}>
                                <Typography variant="caption" color="primary" style={{ fontSize: 10 }}>DEFAULT</Typography>
                            </View>
                        </View>
                        <Typography variant="h3" color="primary" style={{ marginTop: Spacing.md, letterSpacing: 2 }}>•••• •••• •••• 4242</Typography>
                        <View style={styles.cardFooter}>
                            <Typography variant="bodySmall" color="secondary">John Doe</Typography>
                            <Typography variant="bodySmall" color="secondary">12/28</Typography>
                        </View>
                    </View>

                    <Typography variant="h4" color="primary" style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>OTHER METHODS</Typography>

                    <TouchableOpacity style={styles.methodRow}>
                        <View style={styles.methodLeft}>
                            <Ionicons name="logo-google" size={20} color={Colors.brand.dark} />
                            <Typography variant="body" color="primary" style={{ marginLeft: Spacing.md }}>Google Pay</Typography>
                        </View>
                        <Typography variant="label" color="primary">Linked</Typography>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.methodRow, { marginTop: Spacing.sm }]}>
                        <View style={styles.methodLeft}>
                            <Ionicons name="add-circle-outline" size={20} color={Colors.brand.primary} />
                            <Typography variant="body" color="primary" style={{ marginLeft: Spacing.md }}>Add New Payment Method</Typography>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.mintWhite },
    header: { paddingTop: 60, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.brand.white, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
    backBtn: { padding: Spacing.xs, width: 44 },
    content: { padding: Spacing.xl },
    sectionTitle: { marginBottom: Spacing.md, fontSize: 13, letterSpacing: 1 },
    card: { backgroundColor: Colors.brand.white, padding: Spacing.xl, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.subtle },
    selectedCard: { borderColor: Colors.brand.primary, backgroundColor: '#F6FCF8' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    defaultBadge: { backgroundColor: Colors.brand.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg },
    methodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.brand.white, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.subtle },
    methodLeft: { flexDirection: 'row', alignItems: 'center' }
});
