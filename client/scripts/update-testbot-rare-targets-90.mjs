import fs from 'node:fs';
import assert from 'node:assert/strict';
import {PrismaClient} from '@prisma/client';
import {ACHIEVEMENT_TEMPLATES} from '../src/lib/achievementTemplates.mjs';
const backup=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
assert.ok(Array.isArray(backup.users)&&Array.isArray(backup.achievements)&&Array.isArray(backup.goals));
assert.ok(Date.now()-Date.parse(backup.timestamp)<1800000,'Fresh backup required');
const users=backup.users.filter(u=>[u.firstName,u.username].some(v=>String(v||'').trim().toLowerCase()==='testbot'));
assert.equal(users.length,1,'Expected exactly one testBot');
const templates=ACHIEVEMENT_TEMPLATES.filter(a=>a.rarity==='rare'&&a.type==='goal_based');
assert.equal(templates.length,12);
assert.ok(templates.every(a=>a.target===90));
const p=new PrismaClient();
try{
 const result=await p.$transaction(async tx=>{
  const user=await tx.user.findUniqueOrThrow({where:{id:users[0].id}});
  assert.ok([user.firstName,user.username].some(v=>String(v||'').trim().toLowerCase()==='testbot'));
  const before=await tx.achievement.findMany({orderBy:{id:'asc'}});
  const changedIds=[];
  for(const template of templates){
   const matches=before.filter(a=>a.userId===user.id&&a.templateId===`v2:${template.id}`);
   assert.equal(matches.length,1,`Missing or duplicated ${template.title}`);
   const old=matches[0];changedIds.push(old.id);
   await tx.achievement.update({where:{id:old.id},data:{target:90,requirement:template.requirement}});
  }
  const after=await tx.achievement.findMany({orderBy:{id:'asc'}});
  const changed=new Set(changedIds);
  assert.deepEqual(before.filter(a=>!changed.has(a.id)),after.filter(a=>!changed.has(a.id)));
  for(const id of changedIds){
   const old=before.find(a=>a.id===id),next=after.find(a=>a.id===id);
   const {target:oldTarget,requirement:oldRequirement,updatedAt:oldTime,...oldRest}=old;
   const {target,requirement,updatedAt,...newRest}=next;
   assert.equal(target,90);assert.ok(requirement.endsWith('90 раз.'));
   assert.deepEqual(oldRest,newRest);
  }
  assert.deepEqual(user,await tx.user.findUnique({where:{id:user.id}}));
  return {updated:changedIds.length,allTargets:90,otherRowsUnchanged:true,earnedStatusPreserved:true};
 },{timeout:120000});
 console.log(JSON.stringify(result));
}finally{await p.$disconnect();}
