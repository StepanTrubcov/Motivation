import { userDay, shiftDay } from './userDay.mjs';
import { dailyGoalUpdate } from './dailyGoalRollover.mjs';
import { readUser, readGoal, writeGoal, writeCalendar, compact } from './progress/store.mjs';
import { createHash } from 'node:crypto';
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
export function planGoalLifecycle(user, goal, input, now = new Date()) {
  const { action, requestId } = input;
  if (!['take', 'remove', 'create'].includes(action)) fail('Invalid action');
  if (typeof requestId !== 'string' || !/^[\w-]{16,100}$/.test(requestId)) fail('Invalid request ID');
  const zone = user.timeZone || user.progressMeta?.timeZone || 'UTC';
    const today = userDay(now, zone);
  let days = (user.savingGoals || []).map(day => ({ ...day, goalData: [...(day.goalData || [])] }));
  if (!goal) fail('Goal not found', 404);
  if (days.some(day => day.mutationRequests?.includes(requestId))) return { duplicate: true };
  let data = {};
  let pts = user.pts;
  if (action === 'remove') {
    if (goal.status !== 'not_started') {
      const completedToday = goal.status === 'completed' && goal.completionDate && userDay(goal.completionDate, zone) === today;
      // Removing a goal never erases completions earned on earlier dates.
      data = { status: 'not_started', startDate: null, completionDate: null, selectedOption: 0,
        progress: Math.max(0, goal.progress - (completedToday ? 1 : 0)) };
      if (completedToday) pts = Math.max(0, pts - goal.points);
      days = days.map(day => day.date < today ? day : { ...day, goalData: day.goalData.filter(row => row.idGoals !== goal.id) });
    }
  } else {
    const rollover = dailyGoalUpdate(goal, now, zone);
    if (goal.status !== 'not_started' && rollover?.status !== 'not_started') fail('Goal is already active', 409);
    if (![30, 60, 120].includes(input.selectedOption)) fail('Invalid goal period');
    data = { status: 'in_progress', startDate: now, completionDate: null, selectedOption: input.selectedOption };
    for (let i = 0; i < input.selectedOption; i++) {
      const date = shiftDay(today, i);
      let day = days.find(item => item.date === date);
      if (!day) { day = { date, goalData: [] }; days.push(day); }
      const row = { idGoals: goal.id, status: 'in_progress' };
      for (const key of ['durationMinutes', 'quantity', 'targetTime']) if (input[key] != null) row[key] = input[key];
      day.goalData = [...day.goalData.filter(item => item.idGoals !== goal.id), row];
    }
  }
  let receipt = days.find(day => day.date === today);
  if (!receipt) { receipt = { date: today, goalData: [] }; days.push(receipt); }
  receipt.mutationRequests = [...(receipt.mutationRequests || []), requestId];
  return { goal: data, user: { pts, savingGoals: days.sort((a, b) => a.date.localeCompare(b.date)) } };
}

export async function commitGoalLifecycle(db, userId, input, validateSettings = () => {}) {
  const id = input.action === 'create'
    ? `custom-${createHash('sha256').update(`${userId}:${input.requestId}`).digest('hex').slice(0, 32)}` : String(input.goalId || '');
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(async tx => {
        const user = await readUser(tx, { id: userId });
        if (!user) fail('User not found', 404);
        let goal = await readGoal(tx, user, id);
        if (input.action === 'create' && !goal) {
          const title = typeof input.title === 'string' ? input.title.trim() : '';
          if (!title || title.length > 160 || !['Sport', 'Discipline', 'Spirituality', 'Self_development'].includes(input.category)) fail('Invalid title or category');
          goal = { id, userId, title, category: input.category, points: 20, progress: 0, status: 'not_started', description: `Пользовательская цель: ${title}` };
        }
        const plan = planGoalLifecycle(user, goal, input);
        if (plan.duplicate) return { goal, user: { id: user.id, pts: user.pts, savingGoals: user.savingGoals }, changed: false };
        validateSettings(goal, input);
        const settings = Object.fromEntries(['durationMinutes','quantity','targetTime'].filter(k => input[k] != null).map(k => [k,input[k]]));
        const updatedGoal = compact(user) ? await writeGoal(tx, user, goal, { ...plan.goal, ...(input.action !== 'remove' ? { settings } : {}) })
          : input.action === 'create' ? await tx.goal.create({ data: { ...goal, ...plan.goal } })
          : await tx.goal.update({ where: { id }, data: plan.goal });
        const updatedUser = await writeCalendar(tx, user, plan.user.savingGoals, plan.user.pts);
        return { goal: updatedGoal, user: updatedUser, changed: true };
      }, { isolationLevel: 'Serializable', timeout: 15000, maxWait: 5000 });
    } catch (error) {
      if (error.code === 'P2034' && attempt < 3) continue;
      throw error;
    }
  }
}
