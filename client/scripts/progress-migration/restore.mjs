import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { normalizeBackup,restoreProgressBackup } from '../../src/lib/progress/backup.mjs';
dotenv.config({path:'.env.local',quiet:true});dotenv.config({quiet:true});
const root=path.resolve('scripts/backups');
const file=path.resolve(root,process.argv[2] || '');
if (!process.argv[2] || !file.startsWith(root+path.sep)) throw new Error('Specify a backup file inside scripts/backups');
const text=await fs.readFile(file,'utf8');
const checksum=await fs.readFile(file+'.sha256','utf8').catch(()=>null);
if (checksum && checksum.trim()!==createHash('sha256').update(text).digest('hex')) throw new Error('Backup checksum mismatch');
const data=JSON.parse(text);normalizeBackup(data);
const rl=createInterface({input:process.stdin,output:process.stdout});
const answer=await rl.question('Восстановление заменит текущую БД данными копии. Для подтверждения введите confirm: ');rl.close();
if (answer.trim()!=='confirm') { console.log('Отменено'); process.exit(0); }
// Always save a complete, consistent safety copy before replacing any data.
await import('./backup.mjs');
const db=new PrismaClient();
try {
 const counts=await db.$transaction(tx=>restoreProgressBackup(tx,data),{isolationLevel:'Serializable',maxWait:10000,timeout:180000});
 console.log(JSON.stringify({restored:true,counts}));
} finally {await db.$disconnect();}
