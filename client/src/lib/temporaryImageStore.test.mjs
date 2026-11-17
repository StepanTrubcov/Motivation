import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemporaryImageStore } from './temporaryImageStore.mjs';
function setup(options = {}) {
    let time = 0, id = 0;
    const timers = new Map();
    const store = createTemporaryImageStore({ ttlMs: 100, maxEntries: 3, maxBytes: 12,
        now: () => time,
        schedule: (fn, delay) => { const key = ++id; timers.set(key, { fn, at: time + delay }); return key; },
        cancel: key => timers.delete(key), ...options });
    return { store, timers, advance(ms) {
        time += ms;
        for (const [key, timer] of timers) if (timer.at <= time) { timers.delete(key); timer.fn(); }
    } };
}
const image = bytes => ({ buffer: Buffer.alloc(bytes), createdAt: 0 });
test('temporary images expire even when no more requests arrive', () => {
    const { store, timers, advance } = setup();
    store.set('a', image(4));
    assert.equal(store.get('a').buffer.byteLength, 4);
    advance(100);
    assert.equal(timers.size, 0);
    assert.equal(store.bytes, 0);
    assert.equal(store.get('a'), undefined);
});
test('both byte budget and entry limit hold under a burst', () => {
    const { store, timers } = setup();
    for (let i = 0; i < 10000; i++) store.set(String(i), image(5));
    assert.equal(store.size, 2);
    assert.equal(store.bytes, 10);
    assert.equal(timers.size, 2);
    store.clear();
    assert.equal(timers.size, 0);
    assert.equal(store.bytes, 0);
});
test('recently accessed links survive eviction ahead of unused links', () => {
    const { store } = setup({ maxEntries: 2 });
    store.set('a', image(4)); store.set('b', image(4));
    store.get('a'); store.set('c', image(4));
    assert.ok(store.get('a')); assert.ok(store.get('c'));
    assert.equal(store.get('b'), undefined);
});
test('replacing and deleting entries releases buffers and timer references', () => {
    const { store, timers, advance } = setup();
    store.set('a', image(8)); advance(50); store.set('a', image(4));
    assert.equal(store.bytes, 4); assert.equal(timers.size, 1);
    advance(50); assert.ok(store.get('a'));
    store.delete('a'); assert.equal(store.bytes, 0); assert.equal(timers.size, 0);
});
test('oversized images do not flush existing valid story links', () => {
    const { store } = setup(); store.set('a', image(4));
    assert.throws(() => store.set('large', image(100)));
    assert.ok(store.get('a')); assert.equal(store.bytes, 4);
});
