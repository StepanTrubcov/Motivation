import test from 'node:test';
import assert from 'node:assert/strict';
import {userDay,shiftDay,validTimeZone} from './userDay.mjs';
import {planGoalCompletion} from './goalCompletion.mjs';
test('same instant has correct local day across international date line',()=>{
 const now=new Date('2026-11-03T10:30:00Z');
 assert.equal(userDay(now,'Pacific/Kiritimati'),'2026-11-04');
 assert.equal(userDay(now,'Pacific/Honolulu'),'2026-11-03');
});
test('DST transitions do not skip calendar dates; invalid zones fall back',()=>{
 assert.equal(userDay('2026-03-08T07:00:00Z','America/New_York'),'2026-03-08');
 assert.equal(shiftDay('2026-03-08',-1),'2026-03-07');
 assert.equal(validTimeZone('invalid/zone'),null);
});
test('completion uses account day rather than UTC day',()=>{
 const result=planGoalCompletion({pts:0,timeZone:'Asia/Tokyo',savingGoals:[]},{id:'g',status:'in_progress',points:20,progress:0,startDate:'2026-11-03T10:00:00Z',selectedOption:30},'complete','timezone-request-01',new Date('2026-11-03T16:00:00Z'));
 assert.equal(result.user.savingGoals[0].date,'2026-11-04');
});
