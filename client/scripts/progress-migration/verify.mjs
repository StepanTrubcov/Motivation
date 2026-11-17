import { connectProgressDb } from './connect.mjs';
import fs from 'node:fs';
import dotenv from 'dotenv';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { readUser,readGoals,readAchievements } from '../../src/lib/progress/store.mjs';
import { compareMigration } from '../../src/lib/progress/migrate.mjs';
import { achievementProgress } from '../../src/lib/achievementEligibility.mjs';
dotenv.config({path:'.env.local',quiet:true});dotenv.config({quiet:true});
const backup=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const oldUsers=backup.user || backup.users;
const oldGoals=backup.goal || backup.goals;
const oldAchievements=backup.achievement || backup.achievements;
const db=new PrismaClient();
try {
 await connectProgressDb(db);
 let verified=0;
 for (const oldUser of oldUsers) {
  await db.$transaction(async tx=>{
   const user=await readUser(tx,{id:oldUser.id});
   assert.equal(user.storageVersion,1);
   const goals=await readGoals(tx,user.id,user),achievements=await readAchievements(tx,user.id,user);
   const old={user:oldUser,goals:oldGoals.filter(g=>g.userId===user.id),achievements:oldAchievements.filter(a=>a.userId===user.id)};
   compareMigration(old,{user,goals,achievements});
   for (const achievement of old.achievements) {
    const a=achievements.find(a=>a.id===achievement.id);
    assert.deepEqual(achievementProgress(a,{goals,assignments:achievements,user}),achievementProgress(achievement,{goals:old.goals,assignments:old.achievements,user:oldUser}),'Achievement progress changed');
   }
   verified++;
  },{isolationLevel:'RepeatableRead',timeout:30000});
 }
 const counts={};
 for (const name of ['goal','achievement','userGoal','earnedAchievement','goalPeriod','goalDayState','operationReceipt']) counts[name]=await db[name].count();
 console.log(JSON.stringify({verifiedUsers:verified,fullParity:true,counts}));
} finally {await db.$disconnect();}
