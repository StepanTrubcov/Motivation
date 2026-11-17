import { canonicalGoalId, canUnlockAchievement } from '../../lib/achievementEligibility.mjs';
export const normalizeGoalIdFromGoal = canonicalGoalId;
export async function checkAll(assignments, triggeredRef, goals, newStatusAssignment, userId, registrationDate, pts) {
  if (!Array.isArray(assignments) || !Array.isArray(goals)) return;
  for (const achievement of assignments) {
    const id = String(achievement.id);
    if (achievement.status === 'my' || triggeredRef.current.has(id) || achievement.type === 'event_based') continue;
    const eligible = achievement.type === 'streak_based'
      ? Number(achievement.progress?.current) >= Number(achievement.target)
      : canUnlockAchievement(achievement, { goals, assignments, user: { registrationDate, pts } });
    if (!eligible) continue;
    await newStatusAssignment(achievement, userId);
    triggeredRef.current.add(id);
  }
}
