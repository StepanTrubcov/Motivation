export function appearanceKey(userId) {
    return userId == null ? null : `app-appearance:v1:${userId}`;
}

export function readUserAppearance(storage, userId, defaultAccent) {
    const fallback = { theme: 'dark', accentColor: defaultAccent };
    const key = appearanceKey(userId);
    if (!key) return fallback;
    try {
        const saved = JSON.parse(storage.getItem(key));
        return {
            theme: saved?.theme === 'light' ? 'light' : 'dark',
            accentColor: /^#[0-9a-f]{6}$/i.test(saved?.accentColor) ? saved.accentColor : defaultAccent,
        };
    } catch { return fallback; }
}

export function saveUserAppearance(storage, userId, appearance) {
    const key = appearanceKey(userId);
    if (!key) return;
    try { storage.setItem(key, JSON.stringify(appearance)); } catch { /* Keep the current session usable when storage is unavailable. */ }
}
