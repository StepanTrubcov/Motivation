import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarWindow,clipCalendar} from './progress/calendarWindow.mjs';
import {compressCalendar,expandCalendar,addDay} from './progress/calendar.mjs';
test('bounded reading matches full history slice without losing order, settings or completions',()=>{
 const data=Array.from({length:1800},(_,i)=>({date:addDay('2020-01-01',i),goalData:[{idGoals:'g',durationMinutes:30,status:i%3?'in_progress':'completed'}]}));
 const compressed=compressCalendar('u',data),window=calendarWindow('2023-01-01','2023-12-31');
 const cut=clipCalendar(compressed.meta,compressed.periods,compressed.states,compressed.receipts,window);
 assert.deepEqual(expandCalendar(cut.meta,cut.periods,cut.states,cut.receipts),data.filter(d=>d.date>=window.from&&d.date<=window.to));
});
test('invalid and unbounded windows are rejected',()=>{
 for(const [a,b] of [['2026-02-30','2026-03-01'],['2020-01-01','2026-01-01'],['2026-02-01','2026-01-01']]) assert.throws(()=>calendarWindow(a,b));
});
