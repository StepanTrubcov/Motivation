import test from 'node:test';
import assert from 'node:assert/strict';
import { createRetryRequestIds } from './retryRequestIds.mjs';
test('retry tokens stay bounded and retain the same request id until expiry', () => {
    let now = 0;
    const ids = createRetryRequestIds({ limit: 3, ttlMs: 100, now: () => now });
    ids.set('a', 'stable-id');
    assert.equal(ids.get('a'), 'stable-id');
    for (let i = 0; i < 1000; i++) ids.set(String(i), String(i));
    assert.equal(ids.size, 3);
    ids.set('retry', 'retry-id');
    assert.equal(ids.get('retry'), 'retry-id');
    now = 100;
    assert.equal(ids.size, 0);
});
