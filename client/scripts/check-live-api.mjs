// Read-only/invalid-operation checks against the actual server. Never prints credentials or user data.
import dotenv from 'dotenv';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const production = process.argv.includes('--production');
const portArg = process.argv.find(arg => arg.startsWith('--port='));
const port = portArg ? Number(portArg.slice(7)) : production ? 3001 : 3000;
assert.ok(Number.isInteger(port) && port >= 1024 && port <= 65535, 'Invalid verification port');
const base = `http://localhost:${port}`;
const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
assert.ok(token, 'Telegram bot token is required');
const signed = () => {
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: 123 }) });
  const key = createHmac('sha256', 'WebAppData').update(token).digest();
  params.set('hash', createHmac('sha256', key).update([...params].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n')).digest('hex'));
  return params.toString();
};
const headers = { 'x-telegram-init-data': signed() };
const call = (path, options = {}) => fetch(base + path, { ...options, signal: AbortSignal.timeout(30000) });
const profile = await call('/api/users?telegramId=123', { headers });
assert.equal(profile.status, 200);
const user = await profile.json();
assert.ok(user.id);
assert.match(profile.headers.get('cache-control'), /no-store/);
const own = await call(`/api/goals/${user.id}`, { headers });
assert.equal(own.status, 200);
const goals = await own.json();
assert.ok(goals.length > 0 && goals.every(g => g.userId === user.id));
const foreign = await call('/api/goals/nonexistent-other-account', { headers });
assert.equal(foreign.status, 403);
assert.equal((await call('/api/users?telegramId=456', { headers })).status, 403);
assert.equal((await call(`/api/users/${user.id}/pts/increment`, { method: 'POST', headers, body: JSON.stringify({ amount: 9999 }) })).status, 403);
assert.equal((await call('/api/update-all-achievements', { method: 'POST', headers, body: '{}' })).status, 403);
assert.equal((await call(`/api/goals/${user.id}/lifecycle`, { method: 'POST', headers, body: JSON.stringify({ action: 'take', goalId: 'does-not-exist', requestId: 'invalid' }) })).status, 400);
const bad = await call('/api/users?telegramId=123', { headers: { 'x-telegram-init-data': signed().replace('hash=', 'hash=bad') } });
assert.equal(bad.status, 401);
if (production) {
  assert.equal((await call('/api/users?telegramId=123')).status, 401);
  assert.equal((await call('/api/users?telegramId=123', { headers: { 'x-development-telegram-id': '123' } })).status, 401);
}
const achievements = await call(`/api/users/${user.id}/achievements`, { headers });
assert.equal(achievements.status, 200);
const rows = await achievements.json();
assert.equal(rows.length, 27);
assert.ok(rows.every(a => a.points === 0));
assert.ok(rows.filter(a => a.progress).every(a => a.progress.percent >= 0 && a.progress.percent <= 100));
const media = await call('/api/og-image', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Проверка ачивки', username: 'test', img: '/Image/achievements/achievement-1.webp', rarityClass: 'common' }) });
assert.equal(media.status, 201);
const { url: imageUrl } = await media.json();
const image = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
assert.equal(image.status, 200);
assert.match(image.headers.get('content-type'), /image\/png/);
assert.match(image.headers.get('cache-control'), /no-store/);
assert.ok((await image.arrayBuffer()).byteLength > 1000);
if (process.argv.includes('--burst')) {
  const paths = ['/api/users?telegramId=123', `/api/goals/${user.id}`, '/api/saving-goals?userId=123', `/api/users/${user.id}/achievements`];
  for (let round = 0; round < 3; round++) {
    const started = Date.now();
    const responses = await Promise.all(paths.map(path => call(path, { headers })));
    assert.ok(responses.every(response => response.status === 200), `Parallel startup failed: ${responses.map(response => response.status).join(',')}`);
    await Promise.all(responses.map(response => response.arrayBuffer()));
    const elapsed = Date.now() - started;
    assert.ok(elapsed < 15000, `Parallel startup exceeded client timeout: ${elapsed}`);
    console.log(JSON.stringify({parallelStartupRound: round + 1, requests: paths.length, elapsedMs: elapsed, passed: true}));
  }
}
console.log(`PASS: live ${production ? 'production' : 'development'} API, valid/invalid Telegram signatures, cross-account denial, points protection, catalog, progress, story PNG generation and no-store headers; no user changes`);
