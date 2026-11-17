import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENT_TEMPLATES } from '../src/lib/achievementTemplates.mjs';
const catalog = JSON.parse(fs.readFileSync(new URL('../src/lib/testbot-goal-catalog.json', import.meta.url)));
const backup = JSON.parse(fs.readFileSync(process.argv[2]));
assert.ok(Date.now()-Date.parse(backup.timestamp)<1800000,'Fresh backup required');
const users = backup.users.filter(u=>[u.firstName,u.username].some(v=>String(v||'').toLowerCase()==='testbot'));
assert.equal(users.length,1); assert.equal(users[0].id,catalog.userId);
const p=new PrismaClient();
try {
 const result=await p.$transaction(async tx=>{
  const user=await tx.user.findUniqueOrThrow({where:{id:catalog.userId}});
  const allBefore=await tx.goal.findMany({orderBy:{id:'asc'}});
  const achievementsBefore=await tx.achievement.findMany({orderBy:{id:'asc'}});
  const changed=catalog.goals.filter(g=>g.quantityOptions?.length);
  for(const spec of changed) {
   const id=`${user.id}_${spec.id}`;
   await tx.goal.update({where:{id},data:{title:spec.title,description:spec.title}});
  }
  const specs=new Map(changed.map(g=>[`${user.id}_${g.id}`,g]));
  const savingGoals=user.savingGoals.map(day=>({...day,goalData:(day.goalData||[]).map(entry=>{
   const spec=specs.get(entry.idGoals);
   return spec && entry.quantity==null ? {...entry,quantity:spec.defaultQuantity}:entry;
  })}));
  await tx.user.update({where:{id:user.id},data:{savingGoals}});
  for(const template of ACHIEVEMENT_TEMPLATES.filter(a=>['3','9','13'].includes(a.id))) {
   const updated=await tx.achievement.updateMany({where:{userId:user.id,templateId:`v2:${template.id}`},data:{requirement:template.requirement}});
   assert.equal(updated.count,1);
  }
  const allAfter=await tx.goal.findMany({orderBy:{id:'asc'}});
  const achievementsAfter=await tx.achievement.findMany({orderBy:{id:'asc'}});
  assert.deepEqual(allBefore.filter(g=>g.userId!==user.id),allAfter.filter(g=>g.userId!==user.id));
  assert.deepEqual(achievementsBefore.filter(a=>a.userId!==user.id),achievementsAfter.filter(a=>a.userId!==user.id));
  for(const g of allBefore.filter(g=>g.userId===user.id)) {
   const next=allAfter.find(a=>a.id===g.id);
   assert.equal(next.progress,g.progress); assert.equal(next.status,g.status);
  }
  return {goalsUpdated:changed.length,achievementsUpdated:3,otherUsersUnchanged:true};
 },{timeout:120000});
 console.log(JSON.stringify(result));
} finally {await p.$disconnect();}
