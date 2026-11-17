import { hashValue } from './catalogs.mjs';
export const addDay = (date, count = 1) => new Date(Date.parse(`${date}T00:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
export function datesToRanges(dates) {
  const sorted=[...new Set(dates)].sort(), ranges=[];
  for(const date of sorted){const last=ranges.at(-1);if(last&&last.end===date)last.end=addDay(date);else ranges.push({start:date,end:addDay(date)});}
  return ranges;
}
export function rangesToDates(ranges, until) {
  const dates=[];for(const range of ranges||[])for(let date=range.start;date<range.end&&date<=until;date=addDay(date)) dates.push(date);return dates;
}
export function compressCalendar(userId, calendar) {
  const days = [...(calendar || [])].sort((a,b) => a.date.localeCompare(b.date));
  const dates = new Set();
  const ranges = [], extras = {}, periods = [], states = [], receipts = [];
  const latest = new Map();
  for (const day of days) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || dates.has(day.date)) throw new Error('Invalid or duplicate calendar date');
    dates.add(day.date);
    const last = ranges.at(-1);
    if (last?.end === day.date) last.end = addDay(day.date); else ranges.push({ start: day.date, end: addDay(day.date) });
    const extra = Object.fromEntries(Object.entries(day).filter(([k]) => !['date','goalData','completionRequests','mutationRequests'].includes(k)));
    for (const [field, kind] of [['completionRequests','completion'],['mutationRequests','lifecycle']]) {
      if (day[field] && day[field].length === 0) extra[field] = [];
      (day[field] || []).forEach((requestId, position) => receipts.push({ id: hashValue([userId,kind,requestId]), userId, requestId, kind, date: day.date, position }));
    }
    if (Object.keys(extra).length) extras[day.date] = extra;
    const ids = new Set();
    (day.goalData || []).forEach((row, position) => {
      const goalId = String(row.idGoals);
      if (ids.has(goalId)) throw new Error('Duplicate goal within calendar day');
      ids.add(goalId);
      const data = Object.fromEntries(Object.entries(row).filter(([k]) => k !== 'status'));
      const baseStatus = row.status === 'completed' ? 'in_progress' : row.status;
      const signature = hashValue([goalId, data, baseStatus, position]);
      let period = latest.get(signature);
      if (!period || period.endDay !== day.date) {
        period = { id: hashValue([userId, signature, day.date]), userId, goalId, startDay: day.date, endDay: addDay(day.date), position, data, baseStatus };
        periods.push(period); latest.set(signature, period);
      } else period.endDay = addDay(day.date);
      if (row.status !== baseStatus) states.push({ id: hashValue([period.id,day.date]), userId, periodId: period.id, date: day.date, status: row.status });
    });
  }
  const unique = new Set();
  for (const receipt of receipts) { if (unique.has(receipt.id)) throw new Error('Duplicate operation receipt'); unique.add(receipt.id); }
  return { meta: { ranges, extras }, periods, states, receipts };
}
export function expandCalendar(meta, periods, states = [], receipts = []) {
  const dates = new Map();
  for (const range of meta?.ranges || []) for (let date = range.start; date < range.end; date = addDay(date)) {
    dates.set(date, { date, goalData: [], ...(meta.extras?.[date] || {}) });
  }
  const overrides = new Map(states.map(s => [`${s.periodId}:${s.date}`,s.status]));
  for (const period of [...periods].sort((a,b) => a.position-b.position)) {
    for (let date = period.startDay; date < period.endDay; date = addDay(date)) {
      if (!dates.has(date)) throw new Error('Period outside calendar coverage');
      dates.get(date).goalData.push({ ...period.data, status: overrides.get(`${period.id}:${date}`) ?? period.baseStatus });
    }
  }
  for (const receipt of [...receipts].sort((a,b) => a.position-b.position)) {
    const day = dates.get(receipt.date);
    if (!day) throw new Error('Receipt outside calendar coverage');
    const field = receipt.kind === 'completion' ? 'completionRequests' : 'mutationRequests';
    (day[field] ||= []).push(receipt.requestId);
  }
  return [...dates.values()].sort((a,b) => a.date.localeCompare(b.date));
}
export function canonicalCalendar(calendar) {
  return [...calendar].sort((a,b) => a.date.localeCompare(b.date)).map(day => ({ ...day,
    goalData: (day.goalData || []).map(row => Object.fromEntries(Object.entries(row).sort(([a],[b]) => a.localeCompare(b)))) }));
}
