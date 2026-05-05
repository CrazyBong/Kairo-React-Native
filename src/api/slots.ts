import { useQuery } from '@tanstack/react-query';

import client from './client';

import type { ApiSuccessResponse } from '@/types/api';

export interface Slot {
    id: string;
    station_id: string;
    slot_number: number;
    charger_type: string;
    power_kw: number;
    status: 'AVAILABLE' | 'BOOKED' | 'IN_USE' | 'OFFLINE' | 'LOCKED';
    fault_code?: string | null;
    locked_until?: string | null;
    created_at?: string;
    updated_at?: string;
}

export async function fetchStationSlots(stationId: string): Promise<Slot[]> {
    const response = await client.get<ApiSuccessResponse<Slot[]>>(`/slots/stations/${stationId}`);
    return response.data.data;
}

export function useStationSlots(stationId: string) {
    return useQuery({
        queryKey: ['slots', stationId],
        queryFn: () => fetchStationSlots(stationId),
        enabled: Boolean(stationId),
        staleTime: 10_000,
        refetchInterval: 15_000,
    });
}
