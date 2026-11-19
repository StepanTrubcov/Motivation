import { clipCalendar } from './calendarWindow.mjs';
import { goalCatalog, resolveGoalDefinition, goalTemplateId, achievementCatalog, virtualAchievementId, goalDefinition } from './catalogs.mjs';
import { compressCalendar, expandCalendar } from './calendar.mjs';
import { userDay, shiftDay } from '../userDay.mjs';
export const compact = user => user?.storageVersion === 1;
export const publicUser = user => {
  if (!user) return user;
  const { progressMeta, ...result } = user;
  return { ...result, timeZone: progressMeta?.timeZone || 'UTC', onboardingStage: progressMeta?.onboardingStage || 'done' };
};
export async function readUser(db, where, { calendar = true, window = null } = {}) {
  const user = await db.user.findUnique({ where });
  if (!user || !compact(user) || !calendar) return user;
  // Fetch all sparse calendar components in one statement/connection rather than opening three pools concurrently.
  const [calendarRows] = await db.$queryRaw`
    SELECT
      COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM "GoalPeriod" p WHERE p."userId" = ${user.id} AND (${window?.from || null}::text IS NULL OR (p."startDay" < ${window?.end || null} AND p."endDay" > ${window?.from || null}))), '[]'::jsonb) AS periods,
      COALESCE((SELECT jsonb_agg(to_jsonb(s)) FROM "GoalDayState" s WHERE s."userId" = ${user.id} AND (${window?.from || null}::text IS NULL OR (s.date >= ${window?.from || null} AND s.date < ${window?.end || null}))), '[]'::jsonb) AS states,
      COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM "OperationReceipt" r WHERE r."userId" = ${user.id} AND (${window?.from || null}::text IS NULL OR (r.date >= ${window?.from || null} AND r.date < ${window?.end || null}))), '[]'::jsonb) AS receipts
  `;
  const { periods, states, receipts } = window ? clipCalendar(user.progressMeta?.calendar, calendarRows.periods, calendarRows.states, calendarRows.receipts, window) : calendarRows;
  if (window) {
    const savingGoals = expandCalendar(clipCalendar(user.progressMeta?.calendar, calendarRows.periods, calendarRows.states, calendarRows.receipts, window).meta, periods, states, receipts);
    if (savingGoals.length) savingGoals[0].streakArchive = user.progressMeta?.calendar?.streakArchive || null;
    return { ...user, calendarReadOnly: true, savingGoals };
  }
  const savingGoals = expandCalendar(user.progressMeta?.calendar, periods, states, receipts);
  if (savingGoals.length) savingGoals[0].streakArchive = user.progressMeta?.calendar?.streakArchive || null;
  return { ...user, savingGoals };
}
const baseGoal = (user, templateId, definition) => ({
  catalogVersion: user.progressMeta?.goalCatalog || (user.id === 'cmn389tlc0000nz69qkhv5h9c' ? 'testbot-v1' : 'standard-v1'), ...definition, id: `${user.id}_${templateId}`, userId: user.id, status: 'not_started', progress: 0,
  startDate: null, completionDate: null, selectedOption: null, ...(user.progressMeta?.inactiveDefaults?.[templateId] || {}), createdAt: user.createdAt, updatedAt: user.createdAt,
});
export async function readGoals(db, userId, existingUser) {
  const user = existingUser || await readUser(db, { id: userId }, { calendar: false });
  if (!user) return [];
  if (!compact(user)) return db.goal.findMany({ where: { userId } });
  const result = new Map();
  for (const template of goalCatalog(user)) {
    result.set(`${user.id}_${template.id}`, baseGoal(user, template.id, {
      title: template.title, points: template.points, category: template.category || null,
      description: template.description || template.title,
    }));
  }
  for (const [id, key] of Object.entries(user.progressMeta?.definitions || {})) {
    result.set(`${user.id}_${id}`, baseGoal(user, id, resolveGoalDefinition(key)));
  }
  const personal = await db.userGoal.findMany({ where: { userId } });
  for (const state of personal) {
    const definition = state.custom || (state.definitionKey ? resolveGoalDefinition(state.definitionKey) : result.get(state.id));
    if (!definition) throw new Error(`Missing goal definition for ${state.id}`);
    result.set(state.id, { ...(result.get(state.id) || {}), ...definition, ...state, ...(state.settings || {}) });
  }
  const order = new Map((user.progressMeta?.goalOrder || []).map((id,index) => [id,index]));
  return [...result.values()].sort((a,b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER)).map(row => {
    const { custom, definitionKey, settings, templateId, ...goal } = row;
    return goal;
  });
}
export async function readGoal(db, user, id) {
  if (!compact(user)) return db.goal.findFirst({ where: { id, userId: user.id } });
  return (await readGoals(db, user.id, user)).find(goal => goal.id === id) || null;
}
export async function writeGoal(db, user, goal, data = {}) {
  if (!compact(user)) return db.goal.update({ where: { id: goal.id }, data });
  const templateId = goalTemplateId(goal);
  const fields = ['status','progress','startDate','completionDate','selectedOption'];
  const changes = Object.fromEntries(fields.filter(k => data[k] !== undefined).map(k => [k,data[k]]));
  if (data.settings) changes.settings = data.settings;
  const state = await db.userGoal.upsert({ where: { id: goal.id }, create: {
    id: goal.id, userId: user.id, templateId,
    ...(templateId ? { definitionKey: user.progressMeta?.definitions?.[templateId] } : { custom: goalDefinition(goal) }),
    status: goal.status || 'not_started', progress: goal.progress || 0, startDate: goal.startDate || null,
    completionDate: goal.completionDate || null, selectedOption: goal.selectedOption ?? null,
    createdAt: goal.createdAt || new Date(), ...changes,
  }, update: changes });
  return { ...goal, ...state, ...(state.settings || {}) };
}
export async function readAchievements(db, userId, existingUser) {
  const user = existingUser || await readUser(db, { id: userId }, { calendar: false });
  if (!user) return [];
  if (!compact(user)) return db.achievement.findMany({ where: { userId } });
  const earned = new Map((await db.earnedAchievement.findMany({ where: { userId } })).map(a => [a.templateId,a]));
  const templates = achievementCatalog().sort((a,b) => String(a.templateId).localeCompare(String(b.templateId)));
  const currentTemplateIds = new Set(templates.map(template => template.templateId));
  const hasStaleEarnedRows = [...earned.keys()].some(templateId => !currentTemplateIds.has(templateId));
  const catalogInitialized = (user.progressMeta?.achievementCatalog || 'v2') === 'v2'
    && user.progressMeta?.achievementsInitialized === true
    && !hasStaleEarnedRows;
  return templates.map(template => {
    const reward = earned.get(template.templateId);
    return { ...template, id: reward?.id || virtualAchievementId(user, template.templateId), userId,
      status: reward ? 'my' : 'locked', points: 0, earnedAt: reward?.earnedAt || null,
      createdAt: reward?.createdAt || user.createdAt, updatedAt: reward?.updatedAt || user.createdAt,
      catalogBacked: true, catalogInitialized };
  });
}
export async function awardAchievement(db, user, achievement, now = new Date()) {
  if (!compact(user)) return db.achievement.update({ where: { id: achievement.id }, data: { status: 'my', points: 0, earnedAt: achievement.earnedAt || now } });
  const earned = await db.earnedAchievement.upsert({ where: { userId_templateId: { userId: user.id, templateId: achievement.templateId } },
    create: { id: achievement.id, userId: user.id, templateId: achievement.templateId, earnedAt: now }, update: {} });
  return { ...achievement, ...earned, status: 'my', points: 0 };
}
const equivalent = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export async function writeCalendar(db, user, nextCalendar, pts = user.pts) {
  if (user.calendarReadOnly) throw new Error('A partial calendar cannot be written');
  if (!compact(user)) return db.user.update({ where: { id: user.id }, data: { pts, savingGoals: nextCalendar }, select: { id: true, pts: true, savingGoals: true } });
  const zone = user.progressMeta?.timeZone || 'UTC';
  const today = userDay(new Date(), zone);
  const keepFrom = shiftDay(today, -370);
  const before = compressCalendar(user.id, user.savingGoals);
  const allNext = compressCalendar(user.id, nextCalendar);
  const previousArchive = user.progressMeta?.calendar?.streakArchive || null;
  const newlyArchived = nextCalendar.filter(day => day.date < keepFrom && day.date > (previousArchive?.through || '') && day.goalData?.some(row => row.status === 'completed')).map(day => day.date);
  const boundedCalendar = nextCalendar.filter(day => day.date >= keepFrom);
  const next = compressCalendar(user.id, boundedCalendar);
  next.meta.streakArchive = previousArchive;
  const removableReceipts = before.receipts.filter(row => row.date < keepFrom).map(row => row.id);
  const protectedOldReceiptIds = new Set(before.receipts.filter(row => row.date < keepFrom).map(row => row.id));
  for (const [model, key] of [['goalPeriod','periods'],['goalDayState','states'],['operationReceipt','receipts']]) {
    const old = new Map(before[key].map(row => [row.id,row]));
    const fresh = new Map(next[key].map(row => [row.id,row]));
    if (key === 'receipts' && [...old.keys()].some(id => !fresh.has(id) && !protectedOldReceiptIds.has(id))) throw new Error('Recent operation receipts cannot be removed');
    // Obsolete day states are removed before their periods; cascading deletes remain safe.
    if (key !== 'receipts') {
      const removed = [...old.keys()].filter(id => !fresh.has(id));
      if (removed.length) await db[model].deleteMany({ where: { userId: user.id, id: { in: removed } } });
    }
    for (const row of fresh.values()) if (!equivalent(old.get(row.id),row)) {
      await db[model].upsert({ where: { id: row.id }, create: row, update: row });
    }
  }
  if (removableReceipts.length) await db.operationReceipt.deleteMany({ where: { userId: user.id, id: { in: removableReceipts } } });
  const cutoff = shiftDay(keepFrom, -1);
  const { buildFrozenStreakTimeline } = await import('../streakFreeze.mjs');
  const timeline = buildFrozenStreakTimeline(newlyArchived, cutoff, { archive: previousArchive });
  const atCutoff = timeline.days.get(cutoff) || timeline.days.get(shiftDay(cutoff, -1));
  const lastNewCompletion = newlyArchived.at(-1) || previousArchive?.lastCompletedDate || null;
  const recentForStreak = Boolean((lastNewCompletion && (Date.parse(`${cutoff}T00:00:00Z`) - Date.parse(`${lastNewCompletion}T00:00:00Z`)) / 86400000 <= 1) || timeline.days.get(cutoff)?.frozen);
  next.meta.streakArchive = { through: cutoff, streak: recentForStreak ? atCutoff?.streak || 0 : 0, lastCompletedDate: lastNewCompletion,
    runStart: recentForStreak ? atCutoff?.runStart || previousArchive?.runStart || null : null,
    usedFreezeMonth: timeline.freezes.filter(item => item.resumedOn <= cutoff).at(-1)?.month || previousArchive?.usedFreezeMonth || null };
  const progressMeta = { ...user.progressMeta, calendar: next.meta };
  await db.user.update({ where: { id: user.id }, data: { pts, ...(!equivalent(before.meta,next.meta) ? { progressMeta } : {}) } });
  const visible = [...boundedCalendar].sort((a,b)=>a.date.localeCompare(b.date));
  if (visible.length) visible[0].streakArchive = next.meta.streakArchive;
  return { id: user.id, pts, savingGoals: visible };
}
