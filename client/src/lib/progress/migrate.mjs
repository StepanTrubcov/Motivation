import assert from 'node:assert/strict';
import { compressCalendar, canonicalCalendar } from './calendar.mjs';
import { legacyCatalogKey, goalTemplateId, migratedGoalDefinitionKey, goalDefinition, hashValue, achievementDefinition } from './catalogs.mjs';
import { readUser, readGoals, readAchievements } from './store.mjs';
import { ACHIEVEMENT_TEMPLATES } from '../achievementTemplates.mjs';
import { getStreakSnapshot } from '../streakCelebrations.mjs';
const asDate = value => value ? new Date(value).toISOString() : null;
export function sourceFingerprint(user, goals, achievements) {
  return hashValue({ calendar: canonicalCalendar(user.savingGoals || []),
    goals: [...goals].sort((a,b) => a.id.localeCompare(b.id)), achievements: [...achievements].sort((a,b) => a.id.localeCompare(b.id)) });
}
export function migrationPlan(user, goals, achievements) {
  const calendar = compressCalendar(user.id, user.savingGoals || []);
  const referenced = new Set(calendar.periods.map(p => p.goalId));
  const definitions = {};
  const personal = [];
  const inactiveDefaults = {};
  for (const goal of goals) {
    const templateId = goalTemplateId(goal);
    const definitionKey = templateId ? migratedGoalDefinitionKey(goal) : null;
    if (templateId) definitions[templateId] = definitionKey;
    if (templateId && goal.status === 'not_started' && goal.progress === 0 && !referenced.has(goal.id)) {
      const defaults = Object.fromEntries(['startDate','completionDate','selectedOption'].filter(k => goal[k] != null).map(k => [k, goal[k] instanceof Date ? goal[k].toISOString() : goal[k]]));
      if (Object.keys(defaults).length) inactiveDefaults[templateId] = defaults;
    }
    if (!templateId || goal.status !== 'not_started' || goal.progress !== 0 || referenced.has(goal.id)) {
      const last = [...(user.savingGoals || [])].sort((a,b) => b.date.localeCompare(a.date)).flatMap(d => d.goalData || []).find(row => row.idGoals === goal.id);
      const settings = Object.fromEntries(['durationMinutes','quantity','targetTime'].filter(k => last?.[k] != null).map(k => [k,last[k]]));
      personal.push({ id: goal.id, userId: user.id, templateId, ...(definitionKey ? { definitionKey } : { custom: goalDefinition(goal) }),
        status: goal.status, progress: goal.progress, startDate: goal.startDate, completionDate: goal.completionDate,
        selectedOption: goal.selectedOption, settings, createdAt: goal.createdAt, updatedAt: goal.updatedAt });
    }
  }
  const current = achievements.length === ACHIEVEMENT_TEMPLATES.length && achievements.every(row => {
    const template = ACHIEVEMENT_TEMPLATES.find(t => `v2:${t.id}` === row.templateId);
    return template && hashValue(achievementDefinition(row)) === hashValue(achievementDefinition({ ...template, templateId: `v2:${template.id}` }));
  });
  const achievementIds = {};
  const earned = achievements.filter(a => a.status === 'my').map(a => ({ id: a.id, userId: user.id,
    templateId: a.templateId || `legacy:${hashValue(achievementDefinition(a))}`, earnedAt: a.earnedAt, createdAt: a.createdAt, updatedAt: a.updatedAt }));
  for (const a of achievements) achievementIds[a.templateId || `legacy:${hashValue(achievementDefinition(a))}`] = a.id;
  return { calendar, personal, earned, meta: { goalCatalog: user.id === 'cmn389tlc0000nz69qkhv5h9c' ? 'testbot-v1' : 'standard-v1',
    definitions, inactiveDefaults, goalOrder: goals.map(g => g.id), achievementCatalog: current ? 'v2' : legacyCatalogKey(achievements), achievementIds,
    achievementsInitialized: true, calendar: calendar.meta, migratedAt: new Date().toISOString(),
    legacyFingerprint: sourceFingerprint(user,goals,achievements) } };
}
export function compareMigration(before, after) {
  assert.equal(after.user.pts, before.user.pts, 'Points changed during migration');
  assert.deepEqual(canonicalCalendar(after.user.savingGoals),canonicalCalendar(before.user.savingGoals || []),'Calendar changed');
  assert.deepEqual(getStreakSnapshot(after.user.savingGoals),getStreakSnapshot(before.user.savingGoals || []),'Streak/freeze changed');
  const fields = ['id','userId','title','points','category','description','status','progress','selectedOption'];
  for (const goal of before.goals) {
    const migrated = after.goals.find(g => g.id === goal.id);
    assert.ok(migrated, `Missing goal ${goal.id}`);
    for (const k of fields) assert.deepEqual(migrated[k] ?? null, goal[k] ?? null, `Goal field ${k} changed for ${goal.id}`);
    for (const k of ['startDate','completionDate']) assert.equal(asDate(migrated[k]),asDate(goal[k]),`Goal ${k} changed`);
  }
  for (const row of before.achievements) {
    const migrated = after.achievements.find(a => a.id === row.id);
    assert.ok(migrated, `Missing achievement ${row.id}`);
    assert.equal(migrated.status === 'my', row.status === 'my','Earned state changed');
    assert.equal(asDate(migrated.earnedAt),asDate(row.earnedAt),'Earned date changed');
    assert.equal(migrated.title,row.title,'Achievement title changed');
    assert.equal(migrated.target,row.target,'Achievement target changed');
    assert.deepEqual(migrated.goalIds,row.goalIds,'Achievement goals changed');
  }
  return true;
}
async function insertChunks(model, rows) {
  for (let i = 0; i < rows.length; i += 200) await model.createMany({ data: rows.slice(i,i+200) });
}
export async function migrateProgressUser(db, userId, { onSnapshot = async () => {} } = {}) {
  return db.$transaction(async tx => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.storageVersion === 1) {
      if (!user.progressMeta?.goalOrder) {
        const legacyGoals = await tx.goal.findMany({ where: { userId } });
        if (legacyGoals.length) await tx.user.update({ where: { id: userId }, data: { progressMeta: { ...user.progressMeta, goalOrder: legacyGoals.map(g => g.id) } } });
      }
      return { userId, alreadyMigrated: true };
    }
    // Lock the account before reading its personal rows. Concurrent serializable mutations retry on the new store.
    await tx.user.update({ where: { id: userId }, data: { updatedAt: user.updatedAt } });
    const goals = await tx.goal.findMany({ where: { userId } });
    const achievements = await tx.achievement.findMany({ where: { userId } });
    const before = { user, goals, achievements };
    await onSnapshot(before);
    const plan = migrationPlan(user,goals,achievements);
    await insertChunks(tx.userGoal,plan.personal);
    await insertChunks(tx.earnedAchievement,plan.earned);
    await insertChunks(tx.goalPeriod,plan.calendar.periods);
    await insertChunks(tx.goalDayState,plan.calendar.states);
    await insertChunks(tx.operationReceipt,plan.calendar.receipts);
    await tx.user.update({ where: { id: userId }, data: { storageVersion: 1, progressMeta: plan.meta } });
    const migrated = await readUser(tx,{id:userId});
    const after = { user:migrated, goals:await readGoals(tx,userId,migrated), achievements:await readAchievements(tx,userId,migrated) };
    compareMigration(before,after);
    return { userId, compared:true, oldGoals:goals.length, personalGoals:plan.personal.length, oldAchievements:achievements.length,
      earnedAchievements:plan.earned.length, oldCalendarEntries:plan.calendar.periods.reduce((n,p) => n + Math.round((Date.parse(p.endDay)-Date.parse(p.startDay))/86400000),0), periods:plan.calendar.periods.length, completions:plan.calendar.states.length };
  }, { isolationLevel:'Serializable', maxWait:10000, timeout:120000 });
}
export async function cleanLegacyProgress(db,userId) {
  return db.$transaction(async tx => {
    const user = await tx.user.findUnique({where:{id:userId}});
    if (user?.storageVersion !== 1 || !user.progressMeta?.legacyFingerprint) throw new Error('Migration has not been verified');
    if (user.progressMeta.legacyCleanedAt) return {userId,alreadyCleaned:true};
    const goals = await tx.goal.findMany({where:{userId}});
    const achievements = await tx.achievement.findMany({where:{userId}});
    assert.equal(sourceFingerprint(user,goals,achievements),user.progressMeta.legacyFingerprint,'Legacy data changed after migration; refusing deletion');
    // Re-check all migrated state immediately before removing its old copies.
    const logicalUser = await readUser(tx,{id:userId});
    compareMigration({user,goals,achievements},{user:logicalUser,goals:await readGoals(tx,userId,logicalUser),achievements:await readAchievements(tx,userId,logicalUser)});
    const oldGoals = await tx.goal.deleteMany({where:{userId}});
    const oldAchievements = await tx.achievement.deleteMany({where:{userId}});
    await tx.user.update({where:{id:userId},data:{savingGoals:[],progressMeta:{...user.progressMeta,legacyCleanedAt:new Date().toISOString()}}});
    const roundtrip = await readUser(tx,{id:userId});
    assert.deepEqual(canonicalCalendar(roundtrip.savingGoals),canonicalCalendar(logicalUser.savingGoals));
    return {userId,deletedGoals:oldGoals.count,deletedAchievements:oldAchievements.count,verified:true};
  },{isolationLevel:'Serializable',maxWait:10000,timeout:120000});
}
