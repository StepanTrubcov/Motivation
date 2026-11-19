import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { planGoalLifecycle, commitGoalLifecycle } from './goalLifecycle.mjs';
import { dailyGoalUpdate } from './dailyGoalRollover.mjs';
import { canUnlockAchievement } from './achievementEligibility.mjs';
import { ACHIEVEMENT_TEMPLATES } from './achievementTemplates.mjs';
import { calcLevelFromPts, LEVEL_THRESHOLDS } from '../utils/levels.js';
const now = new Date('2026-11-01T00:00:01Z');
const user = { id: 'alice', pts: 100, savingGoals: [] };
const goal = { id: 'alice_1', userId: 'alice', status: 'not_started', progress: 30, points: 20 };
test('Taking covers exactly the chosen UTC dates across month boundaries and preserves progress', () => {
  const plan = planGoalLifecycle(user, goal, { action: 'take', requestId: randomUUID(), selectedOption: 30, durationMinutes: 20 }, now);
  assert.equal(plan.goal.progress, undefined);
  assert.equal(plan.user.savingGoals.length, 30);
  assert.equal(plan.user.savingGoals.at(-1).date, '2026-11-30');
  assert.equal(plan.user.savingGoals[0].goalData[0].durationMinutes, 20);
});
test('Removal keeps lifetime progress, removes current/future entries and repeated requests cannot double-debit', () => {
  const requestId = randomUUID();
  const existing = { ...goal, status: 'completed', progress: 31, completionDate: now };
  const plan = planGoalLifecycle({ ...user, savingGoals: [{ date: '2026-10-31', goalData: [{ idGoals: goal.id, status: 'completed' }] }, { date: '2026-11-01', goalData: [{ idGoals: goal.id, status: 'completed' }] }] }, existing, { action: 'remove', requestId }, now);
  assert.equal(plan.goal.progress, 30);
  assert.equal(plan.user.pts, 80);
  assert.equal(plan.user.savingGoals[0].goalData.length, 1);
  assert.equal(plan.user.savingGoals[1].goalData.length, 0);
  assert.equal(planGoalLifecycle({ ...user, ...plan.user }, { ...existing, ...plan.goal }, { action: 'remove', requestId }, now).duplicate, true);
  assert.equal(planGoalLifecycle({ ...user, ...plan.user }, { ...existing, ...plan.goal }, { action: 'remove', requestId: randomUUID() }, now).user.pts, 80);
});
test('Lifecycle rollback covers creation when saving the user fails; serialization retries are bounded', async () => {
  let committed = 0, attempts = 0;
  const db = { $transaction: async fn => {
    attempts++;
    if (attempts === 1) throw Object.assign(new Error('retry'), { code: 'P2034' });
    let created = false;
    try {
      const result = await fn({ user: { findUnique: async () => user, update: async () => { throw new Error('write failed'); } },
        goal: { findFirst: async () => null, create: async ({ data }) => { created = true; return data; } } });
      if (created) committed++;
      return result;
    } catch (error) { throw error; }
  } };
  await assert.rejects(commitGoalLifecycle(db, user.id, { action: 'create', requestId: randomUUID(), title: 'Sing', category: 'Self_development', selectedOption: 30 }), /write failed/);
  assert.equal(attempts, 2);
  assert.equal(committed, 0);
});
test('UTC day rollover handles midnight, leap day, completed expiration and retains progress', () => {
  assert.deepEqual(dailyGoalUpdate({ ...goal, status: 'completed', completionDate: new Date('2026-10-31T23:59:59Z') }, now), { status: 'in_progress', completionDate: null });
  assert.equal(dailyGoalUpdate({ ...goal, status: 'completed', completionDate: now }, now), null);
  assert.equal(dailyGoalUpdate({ ...goal, status: 'completed', startDate: '2026-10-01', completionDate: now, selectedOption: 30 }, now).status, 'not_started');
  assert.equal(dailyGoalUpdate({ ...goal, status: 'in_progress', startDate: '2028-02-01', selectedOption: 30 }, new Date('2028-03-01T23:00Z')), null);
});
test('Every level through 100 is reachable and high point totals never wrap', () => {
  for (let level = 1; level <= 100; level++) assert.equal(calcLevelFromPts(LEVEL_THRESHOLDS[level - 1]), level);
  assert.ok(calcLevelFromPts(1_000_000) >= 100);
});
test('Achievements reject custom suffix collisions, empty collections and ineligible pioneer claims', () => {
  const running = ACHIEVEMENT_TEMPLATES.find(a => a.id === '3');
  assert.equal(canUnlockAchievement(running, { goals: [{ id: 'custom-goal1', userId: 'alice', progress: 30 }] }), false);
  assert.equal(canUnlockAchievement(running, { goals: [{ id: 'alice_3', userId: 'alice', progress: 30 }] }), true);
  assert.equal(canUnlockAchievement(ACHIEVEMENT_TEMPLATES.find(a => a.id === '26'), { assignments: [] }), false);
  const pioneer = ACHIEVEMENT_TEMPLATES.find(a => a.id === '27');
  assert.equal(canUnlockAchievement(pioneer, { first100: false }), false);
  assert.equal(canUnlockAchievement(pioneer, { first100: true }), true);
});
