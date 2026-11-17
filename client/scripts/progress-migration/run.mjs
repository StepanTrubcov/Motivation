import { connectProgressDb } from './connect.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { migrateProgressUser, cleanLegacyProgress } from '../../src/lib/progress/migrate.mjs';
import { TEST_USER_ID } from '../../src/lib/progress/catalogs.mjs';
dotenv.config({path:'.env.local',quiet:true}); dotenv.config({quiet:true});
const db = new PrismaClient();
const stamp = new Date().toISOString().replace(/[:.]/g,'-');
const folder = path.resolve('scripts/backups',`compact-progress-${stamp}`);
await fs.mkdir(folder,{recursive:true,mode:0o700});
const all = process.argv.includes('--all');
const clean = process.argv.includes('--cleanup');
try {
  await connectProgressDb(db);
  const users = await db.user.findMany({where:all ? {} : {id:TEST_USER_ID},select:{id:true},orderBy:{createdAt:'asc'}});
  const results = [];
  for (const {id} of users) {
    const result = clean ? await cleanLegacyProgress(db,id) : await migrateProgressUser(db,id,{onSnapshot: async snapshot => {
      await fs.writeFile(path.join(folder,`${id}.json`),JSON.stringify(snapshot,null,2),{mode:0o600});
    }});
    results.push(result);
    console.log(JSON.stringify(result));
  }
  await fs.writeFile(path.join(folder,'report.json'),JSON.stringify({stamp,all,clean,results},null,2),{mode:0o600});
  console.log(`Saved migration report: ${folder}`);
} finally { await db.$disconnect(); }
