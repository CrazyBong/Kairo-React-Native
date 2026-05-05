import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Stub — full booking detail screen coming in Phase 6
export default function BookingDetailScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Booking Detail</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 18, color: '#013237' },
});
