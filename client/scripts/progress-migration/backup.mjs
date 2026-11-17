import { connectProgressDb } from './connect.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
dotenv.config({path:'.env.local',quiet:true});dotenv.config({quiet:true});
const db=new PrismaClient();
try {
 await connectProgressDb(db);
 const tables=['user','goal','achievement','userGoal','earnedAchievement','goalPeriod','goalDayState','operationReceipt'];
 const data=await db.$transaction(async tx=>{
  const result={format:'compact-progress-full-v1',createdAt:new Date().toISOString()};
  for (const table of tables) result[table]=await tx[table].findMany();
  return result;
 },{isolationLevel:'RepeatableRead',timeout:120000,maxWait:10000});
 const content=JSON.stringify(data,null,2);
 const file=path.resolve('scripts/backups',`progress-full-${data.createdAt.replace(/[:.]/g,'-')}.json`);
 await fs.writeFile(file,content,{mode:0o600});
 await fs.writeFile(file+'.sha256',createHash('sha256').update(content).digest('hex')+'\n',{mode:0o600});
 console.log(JSON.stringify({file,bytes:Buffer.byteLength(content),counts:Object.fromEntries(tables.map(t=>[t,data[t].length]))}));
} finally {await db.$disconnect();}
