import { useQuery } from '@tanstack/react-query';

import client from './client';

import type { ApiSuccessResponse } from '@/types/api';

export interface ReviewSummary {
    avg_rating: number;
    total_reviews: number;
}

export interface StationReview {
    id: string;
    user_id: string;
    station_id: string;
    booking_id?: string | null;
    rating: number;
    comment?: string | null;
    phone_masked: string;
    created_at: string;
}

export interface StationReviewsResponse {
    summary: ReviewSummary;
    reviews: StationReview[];
}

export function fetchStationReviews(stationId: string) {
    return client.get<ApiSuccessResponse<StationReviewsResponse>>(`/reviews/stations/${stationId}`);
}

export function useStationReviews(stationId: string) {
    return useQuery({
        queryKey: ['reviews', stationId],
        queryFn: async () => {
            const response = await fetchStationReviews(stationId);
            return response.data.data;
        },
        enabled: Boolean(stationId),
        staleTime: 60_000,
    });
}
