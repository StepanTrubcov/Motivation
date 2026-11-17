import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getStreakSnapshot,getCelebrationMilestones,getPendingStreakCelebration,acknowledgeStreakCelebration} from './streakCelebrations.mjs';
const levels=[2,10,20,36,51,66,81,96,111,141].map(daysMin=>({daysMin}));
const day=(date,status='completed')=>({date,goalData:[{status}]});
const calendar=(start,count)=>Array.from({length:count},(_,i)=>{
 const date=new Date(`${start}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+i);return day(date.toISOString().slice(0,10));
});
const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
const snapshot=days=>({ready:true,days,runStart:'2026-10-01',isTodayCompleted:true,today:'2026-10-28'});

test('no congratulations before history and identity load',()=>{
 assert.equal(getPendingStreakCelebration(getStreakSnapshot(null,'2026-10-28'),'loading',levels),null);
 assert.equal(getPendingStreakCelebration(snapshot(10),null,levels),null);
 assert.equal(getPendingStreakCelebration(getStreakSnapshot([],'2026-10-28'),'empty',levels),null);
});
test('counts consecutive dates, ignores future and merges duplicate day records',()=>{
 const data=[...calendar('2026-10-25',4),day('2026-10-27'),day('2026-10-29')];
 assert.deepEqual(getStreakSnapshot(data,'2026-10-28'),{ready:true,days:4,isTodayCompleted:true,runStart:'2026-10-25',today:'2026-10-28',freezes:[],freezeAvailable:true});
});
test('a missing calendar date breaks the series',()=>{
 assert.equal(getStreakSnapshot([day('2026-10-24'),day('2026-10-26'),day('2026-10-28')],'2026-10-28').days,1);
 assert.equal(getStreakSnapshot([day('2026-10-26')],'2026-10-28').days,0);
});
test('unfinished today retains yesterday’s series and midnight does not fabricate a break',()=>{
 const data=[...calendar('2026-10-25',3),day('2026-10-28','in_progress')];
 const state=getStreakSnapshot(data,'2026-10-28');assert.equal(state.days,3);assert.equal(state.isTodayCompleted,false);
 assert.equal(getStreakSnapshot(data,'2026-10-29').days,0);
});
test('one explicit unfinished day can freeze and leap day is consecutive',()=>{
 const state=getStreakSnapshot([day('2024-02-28'),day('2024-02-29'),day('2024-03-01')],'2024-03-01');assert.equal(state.days,3);
 assert.equal(getStreakSnapshot([day('2026-10-27'),day('2026-10-28','in_progress'),day('2026-10-29')],'2026-10-29').days,2);
});
test('every flame upgrade is a celebration milestone',()=>{
 const milestones=getCelebrationMilestones(levels);
 for(const {daysMin} of levels)assert.ok(milestones.includes(daysMin));
 assert.ok(!milestones.includes(11));
});
test('opening alone never consumes a milestone; closing acknowledges once',()=>{
 const db=storage(),state=snapshot(10),user='dismissal';
 const pending=getPendingStreakCelebration(state,user,levels,db);
 assert.equal(pending.milestone,10);
 assert.deepEqual(getPendingStreakCelebration(state,user,levels,db),pending);
 acknowledgeStreakCelebration(pending,db);
 assert.equal(getPendingStreakCelebration(state,user,levels,db),null);
 assert.equal(getPendingStreakCelebration(snapshot(11),user,levels,db),null);
});
test('missing the exact milestone day recovers only the latest reached milestone',()=>{
 const db=storage(),user='catch-up';
 const event=getPendingStreakCelebration(snapshot(37),user,levels,db);
 assert.equal(event.milestone,36);assert.equal(event.days,37);
 acknowledgeStreakCelebration(event,db);
 assert.equal(getPendingStreakCelebration(snapshot(38),user,levels,db),null);
});
test('a milestone reached yesterday can be recovered before the first goal today',()=>{
 const state=getStreakSnapshot(calendar('2026-10-26',2),'2026-10-28');
 assert.equal(state.isTodayCompleted,false);
 assert.equal(getPendingStreakCelebration(state,'yesterday',levels,storage()).milestone,2);
});
test('new flame and later milestone still appear after an earlier one was closed',()=>{
 const db=storage(),user='growth';
 acknowledgeStreakCelebration(getPendingStreakCelebration(snapshot(10),user,levels,db),db);
 assert.equal(getPendingStreakCelebration(snapshot(20),user,levels,db).milestone,20);
});
test('different users and new runs do not share acknowledgements',()=>{
 const db=storage(),state=snapshot(5);
 acknowledgeStreakCelebration(getPendingStreakCelebration(state,'user-a',levels,db),db);
 assert.equal(getPendingStreakCelebration(state,'user-b',levels,db).milestone,5);
 const newRun={...state,runStart:'2026-10-20'};
 assert.equal(getPendingStreakCelebration(newRun,'user-a',levels,db).milestone,5);
});
test('corrupt storage does not suppress a celebration',()=>{
 const db={getItem:()=>'{broken json',setItem:()=>{}};
 assert.equal(getPendingStreakCelebration(snapshot(10),'corrupt',levels,db).milestone,10);
});
test('blocked storage does not crash and session fallback prevents repeat windows',()=>{
 const db={getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}},user='blocked';
 const event=getPendingStreakCelebration(snapshot(10),user,levels,db);acknowledgeStreakCelebration(event,db);
 assert.equal(getPendingStreakCelebration(snapshot(10),user,levels,db),null);
});
test('refresh respects durable acknowledgements and old global data cannot hide new milestones',()=>{
 const db=storage(),state=snapshot(30),key='streak-celebrations:v2:refresh:2026-10-01';
 db.setItem(key,'30');db.setItem('shownMilestones','[2,5,10,30,60]');
 assert.equal(getPendingStreakCelebration(state,'refresh',levels,db),null);
 assert.equal(getPendingStreakCelebration(snapshot(60),'refresh',levels,db).milestone,60);
 assert.equal(getPendingStreakCelebration(state,'fresh-user',levels,db).milestone,30);
});
