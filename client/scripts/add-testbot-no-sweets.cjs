const fs=require('node:fs');
const {PrismaClient}=require('@prisma/client');
const backupPath=process.argv[2];
if(!backupPath)throw Error('Fresh backup required');
const backup=JSON.parse(fs.readFileSync(backupPath));
if(!['users','goals','achievements'].every(k=>Array.isArray(backup[k]))||Date.now()-Date.parse(backup.timestamp)>1800000)throw Error('Invalid or stale backup');
const catalog=JSON.parse(fs.readFileSync('src/lib/testbot-goal-catalog.json'));
const userId=catalog.userId;
const targets=backup.users.filter(u=>String(u.firstName).toLowerCase()==='testbot');
if(targets.length!==1||targets[0].id!==userId)throw Error('Ambiguous TestBot');
const spec={id:'68',title:'Провести день без сладостей',titleEn:'Spend a day without sweets',category:'Discipline',points:25,durationOptions:[]};
const p=new PrismaClient();
(async()=>{
 await p.$transaction(async tx=>{
  const user=await tx.user.findUnique({where:{id:userId}});
  if(String(user?.firstName).toLowerCase()!=='testbot')throw Error('Target mismatch');
  const id=`${userId}_68`;
  const before=await tx.goal.findUnique({where:{id}});
  if(!before||before.userId!==userId)throw Error('Original goal missing');
  const after=await tx.goal.update({where:{id},data:{title:spec.title,description:'Провести день без сладостей.',category:spec.category,points:spec.points}});
  for(const key of ['id','userId','status','progress','completionDate','startDate','selectedOption','createdAt'])if(JSON.stringify(before[key])!==JSON.stringify(after[key]))throw Error('Goal state changed');
  const userAfter=await tx.user.findUnique({where:{id:userId}});
  if(JSON.stringify(user)!==JSON.stringify(userAfter))throw Error('User data changed');
 },{timeout:120000});
 if(!catalog.goals.some(g=>g.id==='68'))catalog.goals.splice(catalog.goals.findIndex(g=>g.id==='66')+1,0,spec);
 else catalog.goals=catalog.goals.map(g=>g.id==='68'?spec:g);
 for(const path of ['src/lib/testbot-goal-catalog.json','scripts/catalog-plans/testbot-catalog.json'])fs.writeFileSync(path,JSON.stringify(catalog,null,2)+'\n');
 console.log(JSON.stringify({applied:true,onlyTestBot:true,catalogGoals:catalog.goals.length,historyAndProgressPreserved:true}));
})().catch(e=>{console.error('Failed:',e.message);process.exitCode=1}).finally(()=>p.$disconnect());
