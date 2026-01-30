export const PREDICTION_CUTOFF_MINUTES = 30;
export const PREDICTION_CUTOFF_MS = PREDICTION_CUTOFF_MINUTES * 60 * 1000;

/**
 * Checks if a match is locked for predictions.
 * A match is locked if:
 * 1. It has already started.
 * 2. It is within 30 minutes of starting.
 * 
 * @param startTime ISO string or Date object of the match start time
 * @returns boolean true if locked
 */
export function isMatchLocked(startTime: string | Date | undefined): boolean {
    if (!startTime) return false;

    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diff = start - now;

    return diff < PREDICTION_CUTOFF_MS;
}

/**
 * Returns a human-readable reason why the match is locked.
 * @param startTime ISO string or Date object
 */
export function getLockReason(startTime: string | Date | undefined): string | null {
    if (!isMatchLocked(startTime)) return null;

    const start = new Date(startTime!).getTime();
    const now = Date.now();

    if (now >= start) {
        return 'El partido ya comenzó';
    }

    return `Cierre de apuestas (${PREDICTION_CUTOFF_MINUTES} min antes)`;
}
