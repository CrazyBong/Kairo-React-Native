import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/notifications';

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('@/api/client', () => ({
    __esModule: true,
    default: {
        get: (...args: unknown[]) => mockGet(...args),
        post: (...args: unknown[]) => mockPost(...args),
    },
}));

describe('notifications api', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches notifications from the backend endpoint', async () => {
        const response = {
            data: {
                data: [],
                meta: { unread_count: 0 },
            },
        };
        mockGet.mockResolvedValue(response);

        await expect(fetchNotifications()).resolves.toEqual(response);
        expect(mockGet).toHaveBeenCalledWith('/notifications');
    });

    it('marks a single notification as read', async () => {
        const response = { data: { data: { status: 'read' } } };
        mockPost.mockResolvedValue(response);

        await expect(markNotificationRead('notif-1')).resolves.toEqual(response);
        expect(mockPost).toHaveBeenCalledWith('/notifications/notif-1/read');
    });

    it('marks all notifications as read', async () => {
        const response = { data: { data: { marked_read: 3 } } };
        mockPost.mockResolvedValue(response);

        await expect(markAllNotificationsRead()).resolves.toEqual(response);
        expect(mockPost).toHaveBeenCalledWith('/notifications/read-all');
    });
});
