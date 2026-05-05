import { planRoute } from '@/api/routing';

const mockPost = jest.fn();

jest.mock('@/api/client', () => ({
    __esModule: true,
    default: {
        post: (...args: unknown[]) => mockPost(...args),
    },
}));

describe('routing api', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('posts the route planning payload to the backend endpoint', async () => {
        const response = {
            data: {
                route: { duration_min: 120 },
                charging_stops: [],
                total_distance_km: 180,
                range_sufficient: true,
            },
        };
        mockPost.mockResolvedValue(response);

        const payload = {
            origin_lat: 23.2599,
            origin_lng: 77.4126,
            dest_lat: 22.7196,
            dest_lng: 75.8577,
            current_battery_percent: 65,
            vehicle_range_km: 220,
        };

        await expect(planRoute(payload)).resolves.toEqual(response.data);
        expect(mockPost).toHaveBeenCalledWith('/routes/plan', payload);
    });
});
