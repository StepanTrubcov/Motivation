import { addDay } from './calendar.mjs';
const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
export function calendarWindow(from, to) {
  if (!valid(from) || !valid(to) || from > to || (Date.parse(to)-Date.parse(from))/86400000 >= 372) throw Object.assign(new Error('Calendar range must contain 1–372 days'),{status:400});
  return {from,to,end:addDay(to)};
}
export function clipCalendar(meta, periods, states, receipts, window) {
  const ranges=(meta?.ranges || []).map(r=>({start:r.start < window.from?window.from:r.start,end:r.end > window.end?window.end:r.end})).filter(r=>r.start<r.end);
  const selected=periods.filter(p=>p.startDay<window.end && p.endDay>window.from).map(p=>({...p,startDay:p.startDay<window.from?window.from:p.startDay,endDay:p.endDay>window.end?window.end:p.endDay}));
  const ids=new Set(selected.map(p=>p.id));
  return {meta:{ranges,extras:Object.fromEntries(Object.entries(meta?.extras||{}).filter(([d])=>d>=window.from&&d<window.end))},periods:selected,states:states.filter(s=>ids.has(s.periodId)&&s.date>=window.from&&s.date<window.end),receipts:receipts.filter(r=>r.date>=window.from&&r.date<window.end)};
}
