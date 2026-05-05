import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Slot } from '@/api/slots';

export const useStationWebSocket = (stationId: string) => {
    const queryClient = useQueryClient();
    const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!stationId) {
            return;
        }

        mockIntervalRef.current = setInterval(() => {
            queryClient.setQueryData<Slot[]>(['slots', stationId], (existingSlots) => {
                if (!existingSlots || existingSlots.length === 0) {
                    return existingSlots;
                }

                const targetIndex = Math.floor(Math.random() * existingSlots.length);
                const currentStatus = existingSlots[targetIndex].status;
                const nextStatus = currentStatus === 'AVAILABLE' ? 'LOCKED' : 'AVAILABLE';

                const updatedSlots = [...existingSlots];
                updatedSlots[targetIndex] = {
                    ...updatedSlots[targetIndex],
                    status: nextStatus,
                };

                return updatedSlots;
            });
        }, 5000);

        return () => {
            if (mockIntervalRef.current) {
                clearInterval(mockIntervalRef.current);
            }
        };
    }, [queryClient, stationId]);
};
