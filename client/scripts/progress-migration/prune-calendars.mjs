import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { readUser, writeCalendar, compact } from '../../src/lib/progress/store.mjs';
import { connectProgressDb } from './connect.mjs';
dotenv.config({path:'.env.local',quiet:true});dotenv.config({quiet:true});
const db=new PrismaClient();
try {
  await connectProgressDb(db);
  const users=await db.user.findMany({where:{storageVersion:1},select:{id:true}});
  const results=[];
  for(const {id} of users){
    const result=await db.$transaction(async tx=>{
      await tx.$queryRaw`SELECT id FROM "User" WHERE id=${id} FOR UPDATE`;
      const user=await readUser(tx,{id});
      if(!compact(user)) return {id,skipped:true};
      const before=user.savingGoals.length;
      const after=await writeCalendar(tx,user,user.savingGoals,user.pts);
      return {id,beforeDays:before,retainedDays:after.savingGoals.length,archivedThrough:user.progressMeta?.calendar?.streakArchive?.through||null};
    },{isolationLevel:'Serializable',timeout:120000,maxWait:10000});
    results.push(result);
    console.log(JSON.stringify(result));
  }
  console.log(JSON.stringify({processed:results.length,totalBefore:results.reduce((n,r)=>n+(r.beforeDays||0),0),totalRetained:results.reduce((n,r)=>n+(r.retainedDays||0),0)}));
} finally {await db.$disconnect();}
