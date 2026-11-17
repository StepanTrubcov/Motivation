import test from 'node:test';
import assert from 'node:assert/strict';
import { readSnapshot } from './progress/readSnapshot.mjs';
import { prismaConnectionUrl } from './prismaConnectionOptions.mjs';
test('Read snapshots wait for a busy pool and retry a transient start failure once',async()=>{
 let attempts=0;
 const db={$transaction:async(work,options)=>{assert.equal(options.maxWait,10000);assert.equal(options.isolationLevel,'RepeatableRead');if(attempts++===0)throw Object.assign(new Error('pool busy'),{code:'P2028'});return work({value:42});}};
 assert.equal(await readSnapshot(db,tx=>tx.value),42);assert.equal(attempts,2);
});
test('Read snapshot retries are bounded and do not retry application errors',async()=>{
 let attempts=0;const db={$transaction:async()=>{attempts++;throw Object.assign(new Error('offline'),{code:'P1001'});}};
 await assert.rejects(readSnapshot(db,()=>{}),/offline/);assert.equal(attempts,2);
 attempts=0;await assert.rejects(readSnapshot({$transaction:async()=>{attempts++;throw new Error('invalid data');}},()=>{}),/invalid data/);assert.equal(attempts,1);
});
test('Database pool defaults are bounded while credentials, TLS and explicit settings are preserved',()=>{
 const original=new URL('postgresql://fixture:example@localhost:5432/app?sslmode=require');
 const url=new URL(prismaConnectionUrl(original.toString()));
 assert.equal(url.username,original.username);assert.equal(url.password,original.password);assert.equal(url.searchParams.get('sslmode'),'require');
 assert.equal(url.searchParams.get('connection_limit'),'3');assert.equal(url.searchParams.get('pool_timeout'),'10');
 const explicit=new URL(prismaConnectionUrl('postgresql://localhost/app?connection_limit=7&pool_timeout=30&connect_timeout=5'));
 assert.equal(explicit.searchParams.get('connection_limit'),'7');assert.equal(explicit.searchParams.get('pool_timeout'),'30');assert.equal(explicit.searchParams.get('connect_timeout'),'5');
});
