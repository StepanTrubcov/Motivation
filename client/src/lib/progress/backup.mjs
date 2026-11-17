export const BACKUP_TABLES = ['user','goal','achievement','userGoal','earnedAchievement','goalPeriod','goalDayState','operationReceipt'];
export function normalizeBackup(input) {
  const data = input.format === 'compact-progress-full-v1' ? input : { user:input.users,goal:input.goals,achievement:input.achievements,
    userGoal:[],earnedAchievement:[],goalPeriod:[],goalDayState:[],operationReceipt:[] };
  for (const name of BACKUP_TABLES) if (!Array.isArray(data[name])) throw new Error(`Missing backup table: ${name}`);
  const users = new Set(data.user.map(user => user.id));
  if (users.size !== data.user.length || new Set(data.user.map(user => user.telegramId)).size !== users.size) throw new Error('Duplicate user identity in backup');
  const periods = new Set(data.goalPeriod.map(row => row.id));
  for (const name of BACKUP_TABLES) {
    const ids = new Set();
    for (const row of data[name]) {
      if (!row.id || ids.has(row.id)) throw new Error(`Missing or duplicate ID in ${name}`);
      ids.add(row.id);
      if (name !== 'user' && !users.has(row.userId)) throw new Error(`Orphaned ${name} row`);
      if (name === 'goalDayState' && !periods.has(row.periodId)) throw new Error('Orphaned calendar state');
    }
  }
  for (const user of data.user) if (user.storageVersion === 1 && !user.progressMeta) throw new Error('Compact account metadata is missing');
  return data;
}
export async function restoreProgressBackup(tx,input) {
  const data = normalizeBackup(input); // Validate relationships before the first deletion.
  for (const name of [...BACKUP_TABLES].reverse()) await tx[name].deleteMany();
  const fields = {
    user:['id','telegramId','language','firstName','username','photoUrl','pts','savingGoals','usersTag','registrationDate','createdAt','updatedAt','storageVersion','progressMeta'],
    goal:['id','title','points','status','category','progress','completionDate','description','userId','startDate','selectedOption','createdAt','updatedAt'],
    achievement:['id','templateId','title','gif','rarity','description','requirement','status','image','points','type','goalIds','target','userId','createdAt','updatedAt','earnedAt'],
    userGoal:['id','userId','templateId','definitionKey','custom','status','progress','startDate','completionDate','selectedOption','settings','createdAt','updatedAt'],
    earnedAchievement:['id','userId','templateId','earnedAt','createdAt','updatedAt'],
    goalPeriod:['id','userId','goalId','startDay','endDay','position','data','baseStatus'],
    goalDayState:['id','userId','periodId','date','status'],operationReceipt:['id','userId','requestId','kind','date','position'],
  };
  const optionalJson = new Set(['progressMeta','custom','settings']);
  for (const name of BACKUP_TABLES) {
    const records = data[name].map(row => Object.fromEntries(fields[name].filter(k => row[k] !== undefined && !(optionalJson.has(k) && row[k] === null)).map(k => [k,row[k]])));
    // Restore old copies before enabling compact storage; this also respects the legacy write guard.
    if (name === 'user') for (const record of records) record.storageVersion = 0;
    for (let i=0;i<records.length;i+=200) await tx[name].createMany({data:records.slice(i,i+200)});
  }
  for (const user of data.user) if (user.storageVersion === 1) await tx.user.update({where:{id:user.id},data:{storageVersion:1,updatedAt:user.updatedAt}});
  return Object.fromEntries(BACKUP_TABLES.map(name => [name,data[name].length]));
}
