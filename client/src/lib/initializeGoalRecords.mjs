const CATEGORIES = new Set(['Sport', 'Discipline', 'Self_development', 'Spirituality']);
const STATUSES = new Set(['not_started', 'in_progress', 'completed']);
export function buildInitialGoalRecords(userId, goalsArray) {
  if (!userId) throw new Error('userId is required');
  if (!Array.isArray(goalsArray) || goalsArray.length === 0) throw new Error('goalsArray must be a non-empty array');
  const ids = new Set();
  return goalsArray.map(goal => {
    const id = String(goal?.id ?? '').trim();
    const title = typeof goal?.title === 'string' ? goal.title.trim() : '';
    const points = goal?.points;
    if (!id || !title || !Number.isInteger(points) || points < 0 || ids.has(id)) throw new Error(`Invalid goal data or duplicate id: ${id}`);
    ids.add(id);
    const status = goal.status === 'done' ? 'completed' : goal.status || 'not_started';
    if (!STATUSES.has(status)) throw new Error(`Invalid status value: ${status}`);
    const date = value => {
      if (!value) return null;
      const result = new Date(value);
      if (Number.isNaN(result.getTime())) throw new Error(`Invalid date for goal: ${id}`);
      return result;
    };
    return {
      id: `${userId}_${id}`, userId: String(userId), title, points, status,
      description: typeof goal.description === 'string' && goal.description.trim() ? goal.description.trim() : title,
      category: CATEGORIES.has(goal.category) ? goal.category : null,
      progress: Number.isInteger(goal.progress) && goal.progress >= 0 ? goal.progress : 0,
      startDate: date(goal.startDate), completionDate: date(goal.completionDate),
    };
  });
}
export async function initializeGoalRecords(db, userId, goalsArray) {
  const data = buildInitialGoalRecords(userId, goalsArray);
  // A single atomic write, safe on retry and concurrent first-login requests.
  return db.goal.createMany({ data, skipDuplicates: true });
}
