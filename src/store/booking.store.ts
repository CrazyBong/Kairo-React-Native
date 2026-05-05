import { create } from 'zustand';

export interface BookingDraft {
    stationId: string;
    stationName: string;
    slotId: string;
    slotLabel: string;
    chargerType: string;
    scheduledStart: string;
    scheduledEnd: string;
    estimatedCost: number;
}

interface BookingState {
    draft: BookingDraft | null;
    setDraft: (draft: BookingDraft) => void;
    clearDraft: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
    draft: null,
    setDraft: (draft) => set({ draft }),
    clearDraft: () => set({ draft: null }),
}));
