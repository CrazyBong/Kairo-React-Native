import { useMutation } from '@tanstack/react-query';

import client from './client';

export interface RoutePlanPayload {
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    current_battery_percent: number;
    vehicle_range_km: number;
}

export interface ChargingStop {
    station_id: string;
    station_name: string;
    location: {
        lat: number;
        lng: number;
    };
    distance_from_origin_km: number;
}

export interface RoutePlanResponse {
    route: {
        duration_sec?: number;
        duration_min?: number;
        geometry?: string;
        [key: string]: unknown;
    };
    charging_stops: ChargingStop[];
    total_distance_km: number;
    range_sufficient: boolean;
}

export async function planRoute(payload: RoutePlanPayload): Promise<RoutePlanResponse> {
    const response = await client.post<RoutePlanResponse>('/routes/plan', payload);
    return response.data;
}

export function useRoutePlanner() {
    return useMutation({
        mutationFn: planRoute,
    });
}
