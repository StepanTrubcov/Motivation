import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENT_TEMPLATES } from '../src/lib/achievementTemplates.mjs';
import { calcLevelFromPts } from '../src/utils/levels.js';
const backup = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (Date.now() - Date.parse(backup.timestamp) > 1800000) throw Error('Fresh backup required');
const users = backup.users.filter(u => [u.firstName,u.username].some(v => String(v || '').toLowerCase() === 'testbot'));
if (users.length !== 1) throw Error('Expected one testBot');
const p = new PrismaClient();
try {
 const result = await p.$transaction(async tx => {
  const user = await tx.user.findUniqueOrThrow({where:{id:users[0].id}});
  const rows = await tx.achievement.findMany({where:{userId:user.id,OR:[{templateId:'v2:22'},{title:'Разносторонний'}]}});
  if(rows.length !== 1) throw Error('Expected exactly one achievement');
  const template = ACHIEVEMENT_TEMPLATES.find(a=>a.id==='22');
  const level = calcLevelFromPts(user.pts);
  return tx.achievement.update({where:{id:rows[0].id},data:{title:template.title,description:template.description,requirement:template.requirement,type:template.type,target:25,goalIds:[],points:0,status:level>=25?'my':'locked',earnedAt:level>=25?new Date():null},select:{id:true,title:true,type:true,target:true,status:true,userId:true}});
 });
 const verified = await p.achievement.findUniqueOrThrow({where:{id:result.id}});
 if(verified.target!==25 || verified.type!=='level_based') throw Error('Verification failed');
 console.log(JSON.stringify(result));
} finally { await p.$disconnect(); }
