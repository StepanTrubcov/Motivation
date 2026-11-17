// Only retry tokens are bounded; server-side completion receipts remain intact.
export function createRetryRequestIds({ limit = 128, ttlMs = 48 * 60 * 60 * 1000, now = Date.now } = {}) {
    const entries = new Map();
    const prune = () => {
        for (const [key, entry] of entries) if (entry.expiresAt <= now()) entries.delete(key);
    };
    return {
        get(key) {
            prune();
            const entry = entries.get(key);
            if (!entry) return undefined;
            entries.delete(key); entries.set(key, entry);
            return entry.id;
        },
        set(key, id) {
            prune(); entries.delete(key);
            while (entries.size >= limit) entries.delete(entries.keys().next().value);
            entries.set(key, { id, expiresAt: now() + ttlMs });
        },
        delete: key => entries.delete(key),
        get size() { prune(); return entries.size; },
    };
}
