import React from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    NotificationItem,
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
} from '@/api/notifications';
import { Typography } from '@/components/ui/Typography';
import { Colors, Radius, Spacing } from '@/constants';
import { normalizeApiError } from '@/utils/api-error';

function formatNotificationTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Just now';
    }

    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) {
        return 'Just now';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
        return 'Less than an hour ago';
    }
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    if (diffHours < 48) {
        return 'Yesterday';
    }

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const { data, isLoading, error } = useNotifications();
    const markAllReadMutation = useMarkAllNotificationsRead();
    const markReadMutation = useMarkNotificationRead();
    const notifications = data?.items ?? [];
    const unreadCount = data?.unreadCount ?? 0;
    const [activeNotificationId, setActiveNotificationId] = React.useState<string | null>(null);

    const handleMarkAllRead = () => {
        if (unreadCount === 0 || markAllReadMutation.isPending) {
            return;
        }

        markAllReadMutation.mutate();
    };

    const handleTapNotification = (id: string) => {
        const notification = notifications.find((item) => item.id === id);
        if (!notification || notification.is_read || activeNotificationId === id) {
            return;
        }

        setActiveNotificationId(id);
        markReadMutation.mutate(id, {
            onSettled: () => {
                setActiveNotificationId((current) => (current === id ? null : current));
            },
        });
    };

    const renderNotification = ({ item: notif, index }: ListRenderItemInfo<NotificationItem>) => {
        const isRead = notif.is_read;
        const time = formatNotificationTime(notif.created_at);
        let iconName: string = 'notifications';
        let iconColor: string = Colors.brand.primary;

        if (notif.type.includes('error') || notif.type.includes('failed')) {
            iconName = 'alert-circle';
            iconColor = Colors.semantic.error;
        } else if (notif.type.includes('warning') || notif.type.includes('surge')) {
            iconName = 'warning';
            iconColor = Colors.semantic.warning;
        } else if (
            notif.type.includes('success') ||
            notif.type.includes('confirmed') ||
            notif.type.includes('completed')
        ) {
            iconName = 'checkmark-circle';
            iconColor = Colors.semantic.success;
        } else if (notif.type.includes('charge') || notif.type.includes('energy')) {
            iconName = 'flash';
        }

        return (
            <Animated.View entering={FadeInUp.delay(100 * index).springify()}>
                <TouchableOpacity
                    style={[styles.notificationCard, !isRead && styles.unreadCard]}
                    activeOpacity={0.7}
                    onPress={() => handleTapNotification(notif.id)}
                    accessibilityLabel={`Notification: ${notif.title}`}
                    disabled={activeNotificationId === notif.id}
                >
                    {!isRead ? <View style={styles.unreadDot} /> : null}

                    <View style={styles.iconBox}>
                        <Ionicons name={iconName as never} size={24} color={iconColor} />
                    </View>

                    <View style={styles.textContent}>
                        <View style={styles.cardHeader}>
                            <Typography variant="label" color={isRead ? 'secondary' : 'primary'}>
                                {notif.title}
                            </Typography>
                            <Typography variant="caption" color="tertiary" style={styles.timeText}>
                                {time}
                            </Typography>
                        </View>
                        <Typography
                            variant="bodySmall"
                            color={isRead ? 'tertiary' : 'secondary'}
                            style={styles.messageText}
                        >
                            {notif.body}
                        </Typography>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerSpacer, { height: insets.top }]} />
            <View style={styles.header}>
                <Typography variant="h2" color="primary">
                    Alerts
                </Typography>
                <TouchableOpacity
                    onPress={handleMarkAllRead}
                    accessibilityLabel="Mark all notifications as read"
                    disabled={markAllReadMutation.isPending || unreadCount === 0}
                >
                    <Typography variant="caption" color="secondary" style={styles.markRead}>
                        Mark all read
                    </Typography>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={[styles.content, styles.emptyState]}>
                    <ActivityIndicator color={Colors.brand.primary} />
                    <Typography variant="bodySmall" color="secondary" style={styles.stateText}>
                        Loading alerts...
                    </Typography>
                </View>
            ) : error ? (
                <View style={[styles.content, styles.emptyState]}>
                    <Typography variant="bodySmall" color="error" align="center">
                        {normalizeApiError(error).message}
                    </Typography>
                </View>
            ) : notifications.length === 0 ? (
                <View style={[styles.content, styles.emptyState]}>
                    <Typography variant="bodySmall" color="secondary" align="center">
                        You&apos;re all caught up. New charging and booking alerts will appear here.
                    </Typography>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNotification}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={<View style={styles.bottomSpacer} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },
    headerSpacer: {
        backgroundColor: Colors.brand.white,
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.brand.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    markRead: { textDecorationLine: 'underline' },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
    emptyState: {
        minHeight: 220,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },
    stateText: {
        marginTop: Spacing.sm,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: Colors.brand.white,
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unreadCard: { borderColor: '#EAF9E7', backgroundColor: '#F6FFF6' },
    unreadDot: {
        position: 'absolute',
        top: Spacing.lg,
        left: Spacing.sm,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.brand.primary,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface.subtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    textContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    timeText: { fontSize: 10 },
    messageText: { marginTop: 4, lineHeight: 18 },
    bottomSpacer: { height: 100 },
});
