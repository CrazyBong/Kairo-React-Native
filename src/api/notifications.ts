import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import client from './client';

import type { ApiMeta, ApiSuccessResponse } from '@/types/api';

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationMeta extends ApiMeta {
    unread_count?: number;
}

interface NotificationsResponse extends ApiSuccessResponse<NotificationItem[]> {
    meta?: NotificationMeta;
}

export interface NotificationsQueryData {
    items: NotificationItem[];
    unreadCount: number;
}

export function fetchNotifications() {
    return client.get<NotificationsResponse>('/notifications');
}

export function markNotificationRead(notificationId: string) {
    return client.post<ApiSuccessResponse<{ status: string }>>(`/notifications/${notificationId}/read`);
}

export function markAllNotificationsRead() {
    return client.post<ApiSuccessResponse<{ marked_read: number }>>('/notifications/read-all');
}

export function useNotifications() {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async (): Promise<NotificationsQueryData> => {
            const response = await fetchNotifications();
            return {
                items: response.data.data ?? [],
                unreadCount: response.data.meta?.unread_count ?? 0,
            };
        },
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const response = await markNotificationRead(notificationId);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await markAllNotificationsRead();
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
