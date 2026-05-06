import { useQuery } from '@tanstack/react-query';

import client from './client';

import type { ApiSuccessResponse } from '@/types/api';

export interface DemandForecastPoint {
    hour: number;
    predicted_bookings: number;
    load_percent: number;
}

export interface DemandPrediction {
    station_id: string;
    forecast: DemandForecastPoint[];
    peak_hours: number[];
    model_type: string;
}

export interface StationPricing {
    station_id: string;
    base_price: number;
    effective_price: number;
    surge_multiplier: number;
    demand_load_percent: number;
    reason: string;
}

export function fetchDemandPrediction(stationId: string) {
    return client.get<ApiSuccessResponse<DemandPrediction>>(`/demand/predict/${stationId}`);
}

export function fetchStationPricing(stationId: string) {
    return client.get<ApiSuccessResponse<StationPricing>>(`/demand/pricing/${stationId}`);
}

export function useDemandPrediction(stationId: string) {
    return useQuery({
        queryKey: ['demand', 'prediction', stationId],
        queryFn: async () => {
            const response = await fetchDemandPrediction(stationId);
            return response.data.data;
        },
        enabled: Boolean(stationId),
        staleTime: 60_000,
    });
}

export function useStationPricing(stationId: string) {
    return useQuery({
        queryKey: ['demand', 'pricing', stationId],
        queryFn: async () => {
            const response = await fetchStationPricing(stationId);
            return response.data.data;
        },
        enabled: Boolean(stationId),
        staleTime: 60_000,
    });
}
