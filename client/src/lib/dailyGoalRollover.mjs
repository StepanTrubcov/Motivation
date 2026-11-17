import { userDay } from './userDay.mjs';
import { readUser, readGoals, compact } from './progress/store.mjs';
// All existing calendar keys are UTC dates. Keep that convention across clients and servers.
export function dailyGoalUpdate(goal, now = new Date(), timeZone = 'UTC') {
  if (!['in_progress', 'completed'].includes(goal.status)) return null;
  const today = userDay(now, timeZone);
  const start = goal.startDate && userDay(goal.startDate, timeZone);
  const days = start ? Math.round((Date.parse(today) - Date.parse(start)) / 86400000) : 0;
  if (start && days >= (goal.selectedOption || 30)) return { status: 'not_started', startDate: null, completionDate: null, selectedOption: 0 };
  if (goal.status === 'completed' && goal.completionDate && userDay(goal.completionDate, timeZone) < today) return { status: 'in_progress', completionDate: null };
  return null;
}
export async function rollOverGoals(db, userId, now = new Date()) {
  // Compare-and-update prevents a midnight read from undoing a simultaneous completion.
  const user = await readUser(db, { id: userId }, { calendar: false });
  const goals = await readGoals(db, userId, user);
  for (const goal of goals) {
    const data = dailyGoalUpdate(goal, now, user.progressMeta?.timeZone || 'UTC');
    if (data) await db[compact(user) ? "userGoal" : "goal"].updateMany({ where: { id: goal.id, userId, status: goal.status, updatedAt: goal.updatedAt }, data });
  }
}
