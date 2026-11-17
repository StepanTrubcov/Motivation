import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackgroundCheckQueue } from './backgroundCheckQueue.mjs';

test('rapid actions queue a fresh pass without concurrent requests', async () => {
    let release;
    let runs = 0;
    let active = 0;
    let maxActive = 0;
    const queue = createBackgroundCheckQueue(async () => {
        runs++;
        maxActive = Math.max(maxActive, ++active);
        if (runs === 1) await new Promise(resolve => { release = resolve; });
        active--;
    });
    const finished = queue();
    await Promise.resolve();
    queue(); queue(); queue();
    release();
    await finished;
    assert.equal(runs, 2);
    assert.equal(maxActive, 1);
});

test('errors remain in the background and a later action retries', async () => {
    let runs = 0;
    let failures = 0;
    const queue = createBackgroundCheckQueue(async () => {
        if (++runs === 1) throw Error('offline');
    }, () => failures++);
    await queue();
    await queue();
    assert.equal(runs, 2);
    assert.equal(failures, 1);
});

test('a collection follow-up is drained without losing the request', async () => {
    let runs = 0;
    const queue = createBackgroundCheckQueue(async () => { if (++runs === 1) queue(); });
    await queue();
    assert.equal(runs, 2);
});
