import { useBookingStore } from '@/store/booking.store';

describe('booking store', () => {
    beforeEach(() => {
        useBookingStore.setState({ draft: null });
    });

    it('stores a booking draft for checkout flows', () => {
        const draft = {
            stationId: 'station-1',
            stationName: 'Tata Power Hub',
            slotId: 'slot-1',
            slotLabel: 'Slot 1',
            chargerType: 'CCS2',
            scheduledStart: '2026-05-06T09:00:00.000Z',
            scheduledEnd: '2026-05-06T09:45:00.000Z',
            estimatedCost: 299.5,
        };

        useBookingStore.getState().setDraft(draft);

        expect(useBookingStore.getState().draft).toEqual(draft);
    });

    it('clears the draft after a booking completes or is cancelled', () => {
        useBookingStore.getState().setDraft({
            stationId: 'station-1',
            stationName: 'Tata Power Hub',
            slotId: 'slot-1',
            slotLabel: 'Slot 1',
            chargerType: 'CCS2',
            scheduledStart: '2026-05-06T09:00:00.000Z',
            scheduledEnd: '2026-05-06T09:45:00.000Z',
            estimatedCost: 299.5,
        });

        useBookingStore.getState().clearDraft();

        expect(useBookingStore.getState().draft).toBeNull();
    });
});
