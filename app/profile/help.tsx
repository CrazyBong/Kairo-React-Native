import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function HelpSupportScreen() {
    const router = useRouter();

    const faqs = [
        { q: "How do I cancel a booking?", a: "Go to Bookings → tap your booking → Cancel. Cancellations made 30 min before the slot are fully refunded." },
        { q: "What happens if a charger doesn't work?", a: "Tap 'Report Issue' on the booking screen. Our support team will refund and rebook within 15 minutes." },
        { q: "How is surge pricing calculated?", a: "Surge is applied when demand exceeds 80% of station capacity. It ranges from 1.1x to 2.0x base price." },
        { q: "Where can I find my invoice?", a: "Go to Bookings → tap completed booking → 'Download Invoice'." },
    ];

    // FIX: Contact options are interactive
    const handleLiveChat = () => {
        Alert.alert('Live Chat', 'Our support agent will connect shortly.\n\nAvg. response: 2 minutes.');
    };

    const handleCallSupport = () => {
        Linking.openURL('tel:+918001234567');
    };

    // FIX: FAQ items have onPress — expand/collapse answer
    const [expanded, setExpanded] = React.useState<number | null>(null);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    accessibilityLabel="Go back to profile"
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Typography variant="h3" color="primary">Help &amp; Support</Typography>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInUp.springify()}>

                    {/* FIX: Each contact row wrapped in its own TouchableOpacity */}
                    <View style={styles.contactCard}>
                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={handleLiveChat}
                            accessibilityLabel="Open live chat support"
                        >
                            <View style={styles.iconBox}>
                                <Ionicons name="chatbubbles" size={24} color={Colors.brand.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h4" color="primary">Live Chat</Typography>
                                <Typography variant="bodySmall" color="secondary">Typical reply time: 2 mins</Typography>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.border.subtle} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={handleCallSupport}
                            accessibilityLabel="Call Kairo support"
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                                <Ionicons name="call" size={24} color={Colors.brand.dark} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h4" color="primary">Call Support</Typography>
                                <Typography variant="bodySmall" color="secondary">24/7 Roadside Assistance</Typography>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.border.subtle} />
                        </TouchableOpacity>
                    </View>

                    <Typography variant="h4" color="primary" style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>
                        FREQUENTLY ASKED QUESTIONS
                    </Typography>

                    {/* FIX: FAQ items expand/collapse on press */}
                    <View style={styles.faqList}>
                        {faqs.map((faq, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.faqItem}
                                onPress={() => setExpanded(expanded === i ? null : i)}
                                accessibilityLabel={`FAQ: ${faq.q}`}
                                activeOpacity={0.7}
                            >
                                <View style={{ flex: 1 }}>
                                    <Typography variant="body" color="primary">{faq.q}</Typography>
                                    {expanded === i && (
                                        <Typography variant="bodySmall" color="secondary" style={{ marginTop: Spacing.sm }}>
                                            {faq.a}
                                        </Typography>
                                    )}
                                </View>
                                <Ionicons
                                    name={expanded === i ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={Colors.border.subtle}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
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
    sectionTitle: { marginBottom: Spacing.md, fontSize: 13, letterSpacing: 1 },
    contactCard: {
        backgroundColor: Colors.brand.white, borderRadius: Radius.lg,
        borderWidth: 1, borderColor: Colors.border.subtle,
    },
    contactRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
    iconBox: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF9E7',
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
    },
    divider: { height: 1, backgroundColor: Colors.border.subtle, marginHorizontal: Spacing.lg },
    faqList: { gap: Spacing.sm },
    faqItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        backgroundColor: Colors.brand.white, padding: Spacing.lg,
        borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.subtle,
    },
});
