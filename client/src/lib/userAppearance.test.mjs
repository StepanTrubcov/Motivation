import test from 'node:test';
import assert from 'node:assert/strict';
import { readUserAppearance, saveUserAppearance, appearanceKey } from './userAppearance.mjs';
const accent = '#59cf8d';
const storage = () => {
    const data = new Map();
    return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
};
test('switching accounts restores independent theme and accent choices', () => {
    const s = storage();
    saveUserAppearance(s, 'alice', { theme: 'light', accentColor: '#9747ff' });
    assert.deepEqual(readUserAppearance(s, 'bob', accent), { theme: 'dark', accentColor: accent });
    saveUserAppearance(s, 'bob', { theme: 'dark', accentColor: '#ff8126' });
    assert.deepEqual(readUserAppearance(s, 'alice', accent), { theme: 'light', accentColor: '#9747ff' });
    assert.deepEqual(readUserAppearance(s, 'bob', accent), { theme: 'dark', accentColor: '#ff8126' });
});
test('shared legacy values never leak into a new account', () => {
    const s = storage();
    s.setItem('app-theme', 'light');
    s.setItem('app-accent-color', '#9747ff');
    assert.deepEqual(readUserAppearance(s, 'new-user', accent), { theme: 'dark', accentColor: accent });
    assert.equal(appearanceKey(null), null);
});
test('corrupt settings and unavailable storage fall back safely', () => {
    const s = storage();
    s.setItem(appearanceKey('a'), '{');
    assert.equal(readUserAppearance(s, 'a', accent).theme, 'dark');
    const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); } };
    assert.equal(readUserAppearance(blocked, 'a', accent).accentColor, accent);
    assert.doesNotThrow(() => saveUserAppearance(blocked, 'a', { theme: 'light', accentColor: accent }));
});
