import test from 'node:test';
import assert from 'node:assert/strict';
import {planGoalCompletion} from './goalCompletion.mjs';
import {planGoalLifecycle} from './goalLifecycle.mjs';
const user={id:'u',pts:140,savingGoals:[]};
const goal={id:'u_1',userId:'u',status:'in_progress',startDate:'2026-10-01T12:00:00Z',selectedOption:30,progress:7,points:20};
const now=new Date('2026-10-31T00:00:00Z');
test('expired goal cannot earn points without a prior list refresh',()=>{
 assert.throws(()=>planGoalCompletion(user,goal,'complete','expiry-request-00001',now),/period has ended/);
 assert.equal(user.pts,140); assert.equal(goal.progress,7);
});
test('expired goal can be retaken atomically without a prior list refresh',()=>{
 const plan=planGoalLifecycle(user,goal,{action:'take',requestId:'expiry-request-00002',selectedOption:60},now);
 assert.equal(plan.goal.status,'in_progress'); assert.equal(plan.user.savingGoals.length,60); assert.equal(plan.user.pts,140); assert.equal(plan.goal.progress,undefined);
});
test('last valid day is still completable',()=>{
 assert.equal(planGoalCompletion(user,goal,'complete','expiry-request-00003',new Date('2026-10-30T23:59:59Z')).user.pts,160);
});
