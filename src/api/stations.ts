import { useQuery } from '@tanstack/react-query';
import client from './client';

export interface Connector {
    id: string;
    type: string;
    capacity_kw: number;
}

export interface Station {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    rating: number;
    total_reviews: number;
    connectors: Connector[];
    pricing_kwh: number;
    pricing_min: number;
    available_slots: number;
    total_slots: number;
    image_url: string | null;
    opening_hours: string;
}

export const fetchStationDetail = async (id: string): Promise<Station> => {
    // Try real API first
    try {
        const { data } = await client.get(`/stations/${id}`);
        if (data && data.data) return data.data;
    } catch (e) {
        console.log('API not ready or failed, using mock data for Station Details');
    }

    // Fallback Mock Data for UI development
    return {
        id,
        name: 'Tata Power Supercharger',
        address: 'Koramangala, Bengaluru',
        lat: 12.9279,
        lng: 77.6271,
        rating: 4.8,
        total_reviews: 124,
        connectors: [
            { id: '1', type: 'CCS2', capacity_kw: 50 },
            { id: '2', type: 'Type 2', capacity_kw: 22 },
        ],
        pricing_kwh: 18.5,
        pricing_min: 2.0,
        available_slots: 4,
        total_slots: 6,
        image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80',
        opening_hours: '24/7',
    };
};

export const useStationDetail = (id: string) => {
    return useQuery({
        queryKey: ['station', id],
        queryFn: () => fetchStationDetail(id),
    });
};
