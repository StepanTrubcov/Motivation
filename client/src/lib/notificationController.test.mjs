import test from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationController } from './notificationController.mjs';
function setup() {
  let now = 0, next = 0;
  const jobs = new Map(), events = [];
  const transport = Object.fromEntries(['loading','success','error','remove','dismiss'].map(type => [type, (...args) => events.push({type,args})]));
  const controller = createNotificationController(transport, {
    setTimeout(fn, delay) { const id=++next; jobs.set(id,{fn,at:now+delay}); return id; },
    clearTimeout(id) { jobs.delete(id); },
  });
  return {controller,events,advance(ms) { now+=ms; for(const [id,job] of jobs) if(job.at<=now) { jobs.delete(id); job.fn(); } }};
}
test('cancelled image generation leaves no loader and cannot affect a newer operation',()=>{
 const {controller:c,events:e,advance}=setup();
 const first=c.begin('Image'); first.cancel(); advance(1000); first.success('Old image');
 assert.deepEqual(e.map(x=>x.type),['remove','remove']);
 const old=c.begin('Old'); const current=c.begin('Current');
 old.cancel(); advance(300); current.success('Done');
 assert.equal(e.at(-1).args[0],'Done');
});
test('fast success never flashes a delayed loader',()=>{
 const {controller:c,events:e,advance}=setup(); const a=c.begin('Loading'); advance(120); a.success('Done'); advance(500);
 assert.deepEqual(e.map(x=>x.type),['remove','success']);
});
test('slow operation changes loader to success in the same slot',()=>{
 const {controller:c,events:e,advance}=setup(); const a=c.begin('Loading'); advance(300); a.success('Done');
 const shown=e.filter(x=>x.type!=='remove'); assert.deepEqual(shown.map(x=>x.type),['loading','success']);
 assert.equal(shown[0].args[1].id,shown[1].args[1].id); assert.equal(shown[1].args[1].duration,1400);
});
test('out of order responses cannot replace latest result',()=>{
 const {controller:c,events:e,advance}=setup(); const a=c.begin('First'); advance(100); const b=c.begin('Latest');
 b.success('Latest done'); a.error('Old failure'); a.success('Old done'); advance(1000);
 assert.deepEqual(e.filter(x=>x.type!=='remove').map(x=>x.args[0]),['Latest done']);
});
test('error stops loading and remains until dismissal',()=>{
 const {controller:c,events:e,advance}=setup(); const a=c.begin('Loading'); advance(300); a.error('Retry'); a.success('Wrong'); advance(3000);
 assert.equal(e.at(-1).type,'error'); assert.equal(e.at(-1).args[1].duration,Infinity); c.dismiss(); assert.equal(e.at(-1).type,'dismiss');
});
test('burst cancels pending loaders and only completes latest action',()=>{
 const {controller:c,events:e,advance}=setup(); const actions=Array.from({length:8},()=>c.begin('Loading')); advance(300);
 actions.slice(0,-1).forEach(a=>a.success('Stale')); actions.at(-1).success('Latest');
 assert.deepEqual(e.filter(x=>['loading','success'].includes(x.type)).map(x=>x.type),['loading','success']); assert.equal(e.at(-1).args[0],'Latest');
});
test('standalone error supersedes pending operation without resurrection',()=>{
 const {controller:c,events:e,advance}=setup(); const a=c.begin('Loading'); c.error('Unavailable'); a.success('Old done'); advance(1000);
 assert.deepEqual(e.map(x=>x.type),['remove','error']);
});
test('background achievement does not hide active feedback',()=>{
 const {controller:c,events:e}=setup(); const a=c.begin('Loading'); c.passiveSuccess('Achievement'); a.success('Saved'); c.passiveSuccess('Achievement');
 assert.deepEqual(e.map(x=>x.type),['remove','success']); assert.equal(e.at(-1).args[0],'Saved');
});

test('default browser timers retain their global receiver', async () => {
 const { runInNewContext } = await import('node:vm');
 const { readFileSync } = await import('node:fs');
 const source = readFileSync(new URL('./notificationController.mjs', import.meta.url), 'utf8').replace('export function', 'function');
 runInNewContext(`
   const expected = globalThis;
   globalThis.setTimeout = function () {
     if (this !== expected) throw new TypeError('Illegal invocation');
     return 1;
   };
   globalThis.clearTimeout = function () {
     if (this !== expected) throw new TypeError('Illegal invocation');
   };
   ${source}
   const controller = createNotificationController({ remove() {}, success() {}, error() {}, dismiss() {} });
   const action = controller.begin('Loading');
   action.success('Done');
   controller.dismiss();
 `);
});
