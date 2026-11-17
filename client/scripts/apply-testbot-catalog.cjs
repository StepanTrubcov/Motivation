const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const catalog = require('./catalog-plans/testbot-catalog.json');
const backupPath = process.argv[2];
if (!backupPath) throw new Error('Fresh backup path required');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
if (!['users','goals','achievements'].every(k => Array.isArray(backup[k]))) throw new Error('Invalid backup');
if (Date.now() - Date.parse(backup.timestamp) > 30*60*1000) throw new Error('Backup older than 30 minutes');
const matches = backup.users.filter(u => [u.firstName,u.username].some(v => String(v).toLowerCase()==='testbot'));
if (matches.length!==1 || matches[0].id!==catalog.userId || catalog.goals.length!==48) throw new Error('Target or catalog mismatch');
const p = new PrismaClient();
const serial = v => JSON.stringify(v);
(async()=>{
 const usersBefore = await p.user.findMany({orderBy:{id:'asc'}});
 const achievementsBefore = await p.achievement.findMany({orderBy:{id:'asc'}});
 const goalsBefore = await p.goal.findMany({orderBy:{id:'asc'}});
 const target=usersBefore.find(u=>u.id===catalog.userId);
 if(!target || String(target.firstName).toLowerCase()!=='testbot') throw new Error('Live target mismatch');
 const beforeMap=new Map(goalsBefore.map(g=>[g.id,g]));
 const canonical=new Set(catalog.goals.map(g=>`${catalog.userId}_${g.id}`));
 await p.$transaction(async tx=>{
  for(const spec of catalog.goals){
   const id=`${catalog.userId}_${spec.id}`;
   const description=JSON.stringify({catalogVersion:1,durationOptions:spec.durationOptions,defaultDuration:spec.defaultDuration,timePicker:spec.timePicker,defaultTime:spec.defaultTime});
   await tx.goal.upsert({where:{id},update:{title:spec.title,category:spec.category,points:spec.points,description},create:{id,userId:catalog.userId,title:spec.title,category:spec.category,points:spec.points,description,status:'not_started'}});
  }
  const usersAfter=await tx.user.findMany({orderBy:{id:'asc'}});
  const achievementsAfter=await tx.achievement.findMany({orderBy:{id:'asc'}});
  const goalsAfter=await tx.goal.findMany({orderBy:{id:'asc'}});
  if(serial(usersBefore)!==serial(usersAfter)||serial(achievementsBefore)!==serial(achievementsAfter)) throw new Error('Users or achievements changed');
  const afterMap=new Map(goalsAfter.map(g=>[g.id,g]));
  for(const old of goalsBefore){
   const g=afterMap.get(old.id);if(!g)throw new Error('Goal deleted');
   if(!canonical.has(old.id)){if(serial(old)!==serial(g))throw new Error('Unrelated goal changed');continue;}
   for(const key of ['userId','status','progress','completionDate','startDate','selectedOption','createdAt'])if(serial(old[key])!==serial(g[key]))throw new Error('Goal state changed: '+key);
  }
  for(const g of goalsAfter)if(!beforeMap.has(g.id)&&!canonical.has(g.id))throw new Error('Unrelated new goal');
 },{timeout:120000});
 console.log(JSON.stringify({applied:true,catalogGoals:48,updated:catalog.goals.filter(g=>beforeMap.has(`${catalog.userId}_${g.id}`)).length,created:catalog.goals.filter(g=>!beforeMap.has(`${catalog.userId}_${g.id}`)).length,historyPointsAchievementsPreserved:true,otherUsersUnchanged:true,retiredGoalsKept:true}));
})().catch(e=>{console.error('Migration failed:',e.message);process.exitCode=1}).finally(()=>p.$disconnect());
