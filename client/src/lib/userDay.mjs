export function validTimeZone(value) {
  if (typeof value !== 'string' || value.length > 100) return null;
  try { return new Intl.DateTimeFormat('en', {timeZone:value}).resolvedOptions().timeZone; } catch { return null; }
}
export function userDay(now = new Date(), timeZone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:validTimeZone(timeZone)||'UTC',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  const get = type => parts.find(p=>p.type===type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export const shiftDay = (day, offset) => new Date(Date.parse(`${day}T12:00:00Z`)+offset*86400000).toISOString().slice(0,10);
