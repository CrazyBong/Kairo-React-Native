import { useQuery } from '@tanstack/react-query';

import client from './client';

import type { ApiSuccessResponse } from '@/types/api';

export interface StationAddress {
    line1?: string;
    line2?: string | null;
    city?: string;
    state?: string;
    pincode?: string;
}

export interface Station {
    id: string;
    name: string;
    network: string;
    lat: number;
    lng: number;
    address?: StationAddress | null;
    available_slots: number;
    total_slots: number;
    avg_rating: number | null;
    total_reviews?: number | null;
    price_per_unit: number | null;
    price_per_hour: number | null;
    amenities: string[] | null;
    is_active: boolean;
    distance_km?: number;
    charger_types?: (string | null)[];
    image_url?: string | null;
    operating_hours?: {
        open?: string;
        close?: string;
        days?: number[];
    };
    last_heartbeat?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface NearbyStationsParams {
    lat: number;
    lng: number;
    radius_km?: number;
    charger_type?: string;
    available_only?: boolean;
    limit?: number;
    offset?: number;
}

export function formatStationAddress(address?: StationAddress | null): string {
    if (!address) {
        return 'Address unavailable';
    }

    return [address.line1, address.line2, address.city, address.state, address.pincode]
        .filter(Boolean)
        .join(', ');
}

export async function fetchNearbyStations(params: NearbyStationsParams): Promise<Station[]> {
    const response = await client.get<ApiSuccessResponse<Station[]>>('/stations/nearby', {
        params,
    });

    return response.data.data;
}

export async function fetchStationDetail(id: string): Promise<Station> {
    const response = await client.get<ApiSuccessResponse<Station>>(`/stations/${id}`);
    return response.data.data;
}

export function useNearbyStations(params: NearbyStationsParams) {
    return useQuery({
        queryKey: ['stations', 'nearby', params],
        queryFn: () => fetchNearbyStations(params),
        staleTime: 30_000,
    });
}

export function useStationDetail(id: string) {
    return useQuery({
        queryKey: ['station', id],
        queryFn: () => fetchStationDetail(id),
        enabled: Boolean(id),
    });
}
