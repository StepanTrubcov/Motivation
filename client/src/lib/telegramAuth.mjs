import { createHmac, timingSafeEqual } from 'node:crypto';

const BOT_USER_LIST_PATH = '/api/users/all-ids';
const BOT_SERVICE_WINDOW_SECONDS = 60;

export function botServiceSignature(timestamp, method, path, token) {
  return createHmac('sha256', token).update(`${timestamp}:${method}:${path}`).digest('hex');
}

export function isBotServiceRequest(request, { token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN, now = Date.now() } = {}) {
  if (!token || request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (decodeURIComponent(url.pathname) !== BOT_USER_LIST_PATH) return false;
  const [rawTimestamp, signature, extra] = (request.headers.get('x-bot-service-auth') || '').split('.');
  const timestamp = Number(rawTimestamp);
  if (extra !== undefined || !Number.isSafeInteger(timestamp) || Math.abs(Math.floor(now / 1000) - timestamp) > BOT_SERVICE_WINDOW_SECONDS) return false;
  if (!/^[a-f\d]{64}$/i.test(signature || '')) return false;
  const expected = Buffer.from(botServiceSignature(timestamp, request.method, BOT_USER_LIST_PATH, token), 'hex');
  const actual = Buffer.from(signature, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function telegramIdentity(initData, botToken, now = Date.now()) {
  if (!initData || !botToken || initData.length > 16384) return null;
  try {
    const params = new URLSearchParams(initData);
    const keys = [...params.keys()];
    if (new Set(keys).size !== keys.length) return null;
    const hash = params.get('hash');
    const date = Number(params.get('auth_date'));
    if (!/^[a-f\d]{64}$/i.test(hash || '') || !Number.isInteger(date) || date > now / 1000 + 30 || now / 1000 - date > 86400) return null;
    const check = [...params.entries()].filter(([key]) => key !== 'hash').sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => `${key}=${value}`).join('\n');
    const key = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const actual = createHmac('sha256', key).update(check).digest();
    if (!timingSafeEqual(actual, Buffer.from(hash, 'hex'))) return null;
    const user = JSON.parse(params.get('user'));
    if (!Number.isSafeInteger(user?.id) || user.id <= 0) return null;
    return { ...user, telegramId: String(user.id) };
  } catch { return null; }
}

export function requestIdentity(request, { environment = process.env.NODE_ENV, token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN } = {}) {
  const initData = request.headers.get('x-telegram-init-data');
  if (initData) return telegramIdentity(initData, token);
  const url = new URL(request.url);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  // The unsigned browser fixture is strictly local development, never a deployed fallback.
  if (environment === 'development' && ['localhost', '127.0.0.1', '::1'].includes(host)) {
    const id = request.headers.get('x-development-telegram-id') || '123';
    if (/^[1-9]\d{0,15}$/.test(id)) return { id: Number(id), telegramId: id, first_name: 'testBot' };
  }
  return null;
}

export async function authorizeApiRequest(request, db, options) {
  const url = new URL(request.url);
  const path = decodeURIComponent(url.pathname);
  if (isBotServiceRequest(request, options)) return null;
  // Images are short-lived unguessable bearer URLs used by Telegram's media fetcher.
  if (['GET', 'HEAD'].includes(request.method) && ['/api/og-image', '/api/achievement/image'].includes(path) && /^[\da-f-]{36}$/i.test(url.searchParams.get('id') || '')) return null;
  const identity = requestIdentity(request, options);
  if (!identity) return { status: 401, error: 'Откройте приложение через Telegram заново' };
  if (['/api/update-achievements', '/api/update-all-achievements', '/api/users/all-ids'].includes(path)
      || /\/pts\/increment$/.test(path)) return { status: 403, error: 'Operation is not available through the public API' };
  let body = {};
  if (!['GET', 'HEAD'].includes(request.method)) {
    try {
      const text = await request.clone().text();
      body = text.trim() ? JSON.parse(text) : {};
      if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400, error: 'Invalid JSON' };
    } catch { return { status: 400, error: 'Invalid JSON' }; }
  }
  const dbMatch = path.match(/^\/api\/(?:goals|initialize-goals|sync-goals|check-completion|users)\/([^/]+)/);
  const dbId = dbMatch && dbMatch[1] !== 'language' ? dbMatch[1] : null;
  const telegramId = path.match(/^\/api\/generate-report\/([^/]+)/)?.[1]
    || url.searchParams.get('telegramId') || body.telegramId
    || (path.startsWith('/api/saving-goals') ? url.searchParams.get('userId') || body.userId : null);
  if (telegramId != null && String(telegramId) !== identity.telegramId) return { status: 403, error: 'Account does not match' };
  const requestedOwner = dbId || (path === '/api/custom-goals' ? body.userId : null);
  if (requestedOwner) {
    const user = await db.user.findUnique({ where: { id: requestedOwner }, select: { telegramId: true } });
    if (!user || user.telegramId !== identity.telegramId) return { status: 403, error: 'Account does not match' };
  }
  // Old split writes could overwrite calendar receipts or mint arbitrary points.
  if (path === '/api/custom-goals' || /^\/api\/goals\/[^/]+\/[^/]+$/.test(path) && request.method === 'PUT'
      || path === '/api/saving-goals/remove-today'
      || path === '/api/saving-goals' && !['GET', 'HEAD'].includes(request.method)
          && !(request.method === 'POST' && url.searchParams.get('generateReport') === 'true' && [...url.searchParams.keys()].length === 1)
      || /\/completed-dates$/.test(path) && request.method !== 'GET') return { status: 409, error: 'Use the atomic goal operation' };
  return null;
}
