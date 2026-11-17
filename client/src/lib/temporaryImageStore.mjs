export function createTemporaryImageStore({ maxEntries = 64, maxBytes = 64 * 1024 * 1024,
    ttlMs = 60 * 60 * 1000, now = Date.now, schedule = setTimeout, cancel = clearTimeout } = {}) {
    const entries = new Map();
    let bytes = 0;
    const remove = key => {
        const entry = entries.get(key);
        if (!entry) return false;
        cancel(entry.timer);
        bytes -= entry.bytes;
        return entries.delete(key);
    };
    const prune = () => {
        for (const [key, entry] of entries) if (entry.expiresAt <= now()) remove(key);
    };
    return {
        set(key, value) {
            const size = value.buffer.byteLength;
            if (size > maxBytes) throw new Error('Generated image exceeds temporary storage limit');
            prune();
            remove(key);
            while (entries.size >= maxEntries || bytes + size > maxBytes) remove(entries.keys().next().value);
            const expiresAt = now() + ttlMs;
            const timer = schedule(() => remove(key), ttlMs);
            timer?.unref?.();
            entries.set(key, { value: { ...value, expiresAt }, bytes: size, expiresAt, timer });
            bytes += size;
        },
        get(key) {
            const entry = entries.get(key);
            if (!entry) return undefined;
            if (entry.expiresAt <= now()) { remove(key); return undefined; }
            // Keep recently used story links ahead of unused generated images.
            entries.delete(key); entries.set(key, entry);
            return entry.value;
        },
        delete: remove,
        clear() { for (const key of entries.keys()) remove(key); },
        prune,
        get size() { prune(); return entries.size; },
        get bytes() { prune(); return bytes; },
    };
}
