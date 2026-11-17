import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInitialGoalRecords, initializeGoalRecords } from './initializeGoalRecords.mjs';
import { TEMPLATE_GOALS_ARRAY as catalog } from './goalCatalog.mjs';
test('actual catalog initializes without optional status or description',()=>{
 const records=buildInitialGoalRecords('new-user',catalog);
 assert.equal(records.length,catalog.length);
 assert.ok(records.length>0);
 assert.ok(records.every(goal=>goal.status==='not_started'&&goal.description===goal.title&&goal.userId==='new-user'));
 assert.equal(new Set(records.map(g=>g.id)).size,records.length);
});
test('validation covers entire catalog before the first write',async()=>{
 let writes=0;const db={goal:{createMany:async()=>{writes++;}}};
 await assert.rejects(initializeGoalRecords(db,'new-user',[catalog[0],{id:'bad',title:'No points'}]));
 assert.equal(writes,0);
});
test('retry uses duplicate-safe insertion and never updates existing progress',async()=>{
 const calls=[];const db={goal:{createMany:async options=>{calls.push(options);return {count:options.data.length};}}};
 await initializeGoalRecords(db,'new-user',catalog);
 assert.equal(calls.length,1);
 assert.equal(calls[0].skipDuplicates,true);
 assert.equal(calls[0].data.length,catalog.length);
});
test('zero points, completed legacy status and omitted dates are valid',()=>{
 const [row]=buildInitialGoalRecords('user',[{id:'1',title:'Goal',points:0,status:'done'}]);
 assert.equal(row.points,0);assert.equal(row.status,'completed');assert.equal(row.startDate,null);
});
test('invalid and duplicate rows reject before a partial catalog can be created',()=>{
 assert.throws(()=>buildInitialGoalRecords('user',[catalog[0],catalog[0]]));
 assert.throws(()=>buildInitialGoalRecords('user',[]));
 assert.throws(()=>buildInitialGoalRecords('user',[{...catalog[0],status:'unknown'}]));
 assert.throws(()=>buildInitialGoalRecords('user',[{...catalog[0],startDate:'invalid'}]));
});
