export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDistance(distanceKm: number): string {
    return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
}

export function formatDateTime(isoString: string): string {
    return new Date(isoString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function formatTimeRange(startIso: string, endIso: string): string {
    const start = new Date(startIso);
    const end = new Date(endIso);

    return `${start.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
    })} - ${end.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
    })}`;
}
