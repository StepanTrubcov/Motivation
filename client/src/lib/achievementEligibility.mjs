import { calcLevelFromPts } from '../utils/levels.js';
import { getStreakSnapshot } from './streakCelebrations.mjs';
import { userDay } from './userDay.mjs';
export function canonicalGoalId(goal) {
  const id = String(goal?.id || '');
  if (/^\d+$/.test(id)) return id;
  const prefix = `${goal?.userId}_`;
  return goal?.userId && id.startsWith(prefix) && /^\d+$/.test(id.slice(prefix.length)) ? id.slice(prefix.length) : null;
}
export function achievementProgress(achievement, { goals = [], assignments = [], user = {}, calendar = user.savingGoals || [], now = Date.now() } = {}) {
  let target = Number(achievement.target) || 0;
  let current = 0;
  let kind = null;
  switch (achievement.type) {
    case 'goal_based':
      kind = 'goal';
      current = goals.reduce((sum, goal) => sum + ((achievement.goalIds || []).some(id => /^\d+$/.test(String(id))
        ? canonicalGoalId(goal) === String(id) : goal.title === id) ? Math.max(0, Number(goal.progress) || 0) : 0), 0);
      break;
    case 'completion_count_based': kind = 'goal'; current = goals.reduce((sum, goal) => sum + Math.max(0, Number(goal.progress) || 0), 0); break;
    case 'level_based': kind = 'level'; current = calcLevelFromPts(user.pts); break;
    case 'time_based': {
      kind = 'time';
      const date = new Date(user.registrationDate || user.createdAt).getTime();
      current = Number.isFinite(date) ? Math.max(0, Math.floor((now - date) / 86400000)) : 0;
      break;
    }
    case 'streak_based': {
      kind = 'streak';
      const zone = user.timeZone || user.progressMeta?.timeZone || 'UTC';
      const today = userDay(new Date(now), zone);
      current = getStreakSnapshot(calendar, today).days;
      break;
    }
    case 'collection_based': {
      kind = 'collection';
      const required = assignments.filter(a => a.rarity !== 'epic' && a.type !== 'collection_based' && String(a.id) !== String(achievement.id));
      target = required.length;
      current = required.filter(a => a.status === 'my').length;
      break;
    }
    default: return null;
  }
  return { current: Math.min(target, Math.max(0, current)), target, kind, percent: target > 0 ? Math.round(Math.min(1, current / target) * 100) : 0 };
}
export function canUnlockAchievement(achievement, context) {
  if (achievement.type === 'event_based') {
    const id = String(achievement.templateId || `v2:${achievement.id}`);
    return id === 'v2:1' || id === 'v2:27' && context.first100 === true || (id === 'v2:2' || id === '27' && achievement.rarity === 'common') && context.tutorialCompleted === true;
  }
  const progress = achievementProgress(achievement, context);
  return Boolean(progress && progress.target > 0 && progress.current >= progress.target);
}
export async function isFirstHundred(db, userId) {
  const users = await db.user.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 100, select: { id: true } });
  return users.some(user => user.id === userId);
}
