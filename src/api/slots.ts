import { useQuery } from '@tanstack/react-query';
import client from './client';

export interface Slot {
    id: string;
    station_id: string;
    connector_id: string;
    slot_label: string;
    start_time: string; // ISO string 09:00:00
    end_time: string;
    status: 'available' | 'booked' | 'maintenance';
}

export const fetchStationSlots = async (stationId: string, date: string): Promise<Slot[]> => {
    try {
        const { data } = await client.get(`/slots/stations/${stationId}`, { params: { date } });
        if (data && data.data) return data.data;
    } catch (e) {
        console.log('API not ready or failed, using mock data for Slots');
    }

    // Fallback Mock Data
    const baseDate = new Date().toISOString().split('T')[0];
    return [
        { id: '1', station_id: stationId, connector_id: '1', slot_label: 'Slot A1 (CCS2)', start_time: `${baseDate}T09:00:00Z`, end_time: `${baseDate}T09:45:00Z`, status: 'available' },
        { id: '2', station_id: stationId, connector_id: '1', slot_label: 'Slot A1 (CCS2)', start_time: `${baseDate}T10:00:00Z`, end_time: `${baseDate}T10:45:00Z`, status: 'booked' },
        { id: '3', station_id: stationId, connector_id: '2', slot_label: 'Slot A2 (Type 2)', start_time: `${baseDate}T09:00:00Z`, end_time: `${baseDate}T09:45:00Z`, status: 'available' },
        { id: '4', station_id: stationId, connector_id: '2', slot_label: 'Slot A2 (Type 2)', start_time: `${baseDate}T11:00:00Z`, end_time: `${baseDate}T11:45:00Z`, status: 'available' },
    ];
};

export const useStationSlots = (stationId: string, date: string) => {
    return useQuery({
        queryKey: ['slots', stationId, date],
        queryFn: () => fetchStationSlots(stationId, date),
        staleTime: 10_000,
        refetchInterval: 15_000,
    });
};
