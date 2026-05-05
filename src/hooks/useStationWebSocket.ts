import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Slot } from '@/api/slots';

/**
 * Real-Time Synchronization Layer (Mocked Simulation)
 * In production: replace setInterval with new WebSocket(WS_URL)
 * and listen to `onmessage` events with `{ slot_id, status }` payloads.
 * The setQueryData patching strategy below works identically for both.
 */
export const useStationWebSocket = (stationId: string) => {
    const queryClient = useQueryClient();
    const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // FIX: fixed interval comment (was "4 to 8 seconds" but code uses fixed 5000ms)
        console.log(`[WebSocket] Connected to station ${stationId} namespace.`);

        mockIntervalRef.current = setInterval(() => {
            const today = new Date().toISOString().split('T')[0];
            const cacheKey = ['slots', stationId, today];

            // FIX: TOCTOU fixed — ALL mutation logic is inside setQueryData callback
            // This is atomic: we read and write in one step, eliminating the race condition
            queryClient.setQueryData<Slot[]>(cacheKey, (old) => {
                if (!old || old.length === 0) return old;

                const targetIndex = Math.floor(Math.random() * old.length);
                const currentStatus = old[targetIndex].status;
                const newStatus = currentStatus === 'available' ? 'booked' : 'available';

                const updated = [...old];
                updated[targetIndex] = { ...updated[targetIndex], status: newStatus };

                console.log(`[WebSocket Mock] Slot ${old[targetIndex].slot_label} → ${newStatus}`);
                return updated;
            });
        }, 5000);

        return () => {
            if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
            console.log(`[WebSocket] Disconnected from station ${stationId}.`);
        };
    }, [stationId, queryClient]);
};
