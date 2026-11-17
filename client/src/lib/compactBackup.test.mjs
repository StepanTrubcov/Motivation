import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBackup,restoreProgressBackup,BACKUP_TABLES } from './progress/backup.mjs';
const backup=()=>({format:'compact-progress-full-v1',...Object.fromEntries(BACKUP_TABLES.map(name=>[name,[]])),user:[{id:'u',telegramId:'123',storageVersion:1,progressMeta:{calendar:{ranges:[],extras:{}}}}],userGoal:[{id:'u_2',userId:'u',status:'in_progress',progress:3}],earnedAchievement:[{id:'a',userId:'u',templateId:'v2:1',earnedAt:'2026-10-23T12:34:56Z'}]});
test('Full backup retains personal goals, earned dates, metadata, and accepts the old format for rollback',()=>{
 const data=normalizeBackup(backup());assert.equal(data.userGoal[0].progress,3);assert.equal(data.earnedAchievement[0].earnedAt,'2026-10-23T12:34:56Z');
 assert.equal(normalizeBackup({users:[{id:'u',telegramId:'123'}],goals:[],achievements:[]}).userGoal.length,0);
});
test('Corrupt compact backups are rejected before any destructive operation',async()=>{
 const data=backup();data.userGoal[0].userId='missing';let writes=0;
 const tx=Object.fromEntries(BACKUP_TABLES.map(name=>[name,{deleteMany:async()=>writes++}]));
 await assert.rejects(restoreProgressBackup(tx,data),/Orphaned/);assert.equal(writes,0);
});
test('Restore inserts legacy copies before enabling compact storage and restores all tables',async()=>{
 const events=[];
 const tx=Object.fromEntries(BACKUP_TABLES.map(name=>[name,{deleteMany:async()=>events.push(['delete',name]),createMany:async({data})=>events.push(['insert',name,data]),update:async({data})=>events.push(['enable',name,data])}]));
 const counts=await restoreProgressBackup(tx,backup());
 assert.equal(counts.earnedAchievement,1);assert.equal(events.find(e=>e[0]==='insert'&&e[1]==='user')[2][0].storageVersion,0);
 assert.equal(events.at(-1)[0],'enable');assert.equal(events.at(-1)[2].storageVersion,1);
});
