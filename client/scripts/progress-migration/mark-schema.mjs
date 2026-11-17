import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';
dotenv.config({path:'.env.local',quiet:true});dotenv.config({quiet:true});
for (const migration of ['20261102100000_compact_progress_store','20261102110000_shared_catalog_defaults']) {
 for(let attempt=0;;attempt++) {
  const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','resolve','--applied',migration],{encoding:'utf8',env:process.env,timeout:45000});
  if(result.status===0 || `${result.stdout}${result.stderr}`.includes('P3008')) {console.log(JSON.stringify({migration,registered:true}));break;}
  if(attempt>=2) throw new Error(`Could not register applied migration ${migration}: ${(result.stderr||'').slice(-1000)}`);
  console.log(JSON.stringify({migration,retry:attempt+1}));
 }
}
