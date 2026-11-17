import { userDay, shiftDay } from './userDay.mjs';
import { dailyGoalUpdate } from './dailyGoalRollover.mjs';
import { readUser, readGoal, writeGoal, writeCalendar } from './progress/store.mjs';
export function planGoalCompletion(user, goal, action, requestId, now = new Date(), requestedDate) {
    const fail = (message, status = 409) => { throw Object.assign(new Error(message), { status }); };
    if (!['complete', 'undo'].includes(action)) fail('Invalid action', 400);
    const days = Array.isArray(user.savingGoals) ? user.savingGoals : [];
    if (days.some(day => day.completionRequests?.includes(requestId))) return { duplicate: true };
    const zone = user.timeZone || user.progressMeta?.timeZone || 'UTC';
    const today = userDay(now, zone);
    const yesterday = shiftDay(today, -1);
    const date = requestedDate || today;
    if (![today, yesterday].includes(date)) fail('Invalid completion date', 400);
    const historical = date !== today;
    const rollover = dailyGoalUpdate(goal, now, zone);
    if (!historical && rollover?.status === 'not_started') fail('Goal period has ended; take the goal again');
    if (!historical && action === 'complete' && rollover) goal = { ...goal, ...rollover };
    const savedGoal = days.find(day => day.date === date)?.goalData?.find(item => String(item.idGoals) === String(goal.id));
    if (historical ? !savedGoal || !['in_progress', 'completed'].includes(savedGoal.status) : !['in_progress', 'completed'].includes(goal.status)) fail('Goal is not active');
    const completedToday = historical ? savedGoal.status === 'completed' : goal.status === 'completed' && goal.completionDate && userDay(goal.completionDate, zone) === date;
    if (!historical && action === 'undo' && goal.status === 'completed' && !completedToday) fail('Refresh goals before undoing a previous day');
    const changed = action === 'complete' ? !completedToday : Boolean(completedToday);
    const delta = changed ? (action === 'complete' ? 1 : -1) : 0;
    const status = action === 'complete' ? 'completed' : 'in_progress';
    const index = days.findIndex(day => day.date === date);
    const day = index < 0 ? { date, goalData: [] } : days[index];
    let found = false;
    const goalData = (day.goalData || []).map(item => {
        if (String(item.idGoals) !== String(goal.id)) return item;
        found = true;
        return { ...item, status };
    });
    if (!found) goalData.push({ idGoals: goal.id, status });
    const updatedDay = { ...day, goalData, completionRequests: [...(day.completionRequests || []), requestId] };
    const savingGoals = [...days];
    if (index < 0) savingGoals.push(updatedDay); else savingGoals[index] = updatedDay;
    return { changed, goal: historical ? { progress: Math.max(0, (Number(goal.progress) || 0) + delta) } : { status, progress: Math.max(0, (Number(goal.progress) || 0) + delta),
        completionDate: action === 'complete' ? (completedToday ? goal.completionDate : now) : null,
        startDate: goal.startDate || now },
        user: { pts: Math.max(0, user.pts + delta * goal.points), savingGoals } };
}

export async function commitGoalCompletion(db, userId, goalId, action, requestId, date) {
    for (let attempt = 0; ; attempt++) {
        try {
            return await db.$transaction(async tx => {
                const user = await readUser(tx, { id: userId });
                const goal = await readGoal(tx, user, goalId);
                if (!user || !goal) throw Object.assign(new Error('User or goal not found'), { status: 404 });
                const plan = planGoalCompletion(user, goal, action, requestId, new Date(), date);
                if (plan.duplicate) return { goal, user: { id: user.id, pts: user.pts, savingGoals: user.savingGoals }, changed: false };
                const updatedGoal = await writeGoal(tx, user, goal, plan.goal);
                const updatedUser = await writeCalendar(tx, user, plan.user.savingGoals, plan.user.pts);
                return { goal: updatedGoal, user: updatedUser, changed: plan.changed };
            }, { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 });
        } catch (error) {
            if (error.code === 'P2034' && attempt < 3) continue;
            throw error;
        }
    }
}
