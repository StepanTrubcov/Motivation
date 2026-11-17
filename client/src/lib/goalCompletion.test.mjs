import test from 'node:test';
import assert from 'node:assert/strict';
import { planGoalCompletion, commitGoalCompletion } from './goalCompletion.mjs';
import { beginGoalMutation, canApplyGoalRead, goalReadVersion } from './goalMutationClock.mjs';
const now = new Date('2026-10-29T12:00:00Z');
const user = { id: 'u', pts: 100, savingGoals: [{ date: '2026-10-29', goalData: [{ idGoals: 'g', status: 'in_progress', durationMinutes: 20 }] }] };
const goal = { id: 'g', userId: 'u', status: 'in_progress', points: 20, progress: 29, completionDate: null, startDate: now };
const id = 'completion-request-1';
test('completion saves status, counter, points and calendar together, preserving time', () => {
    const plan = planGoalCompletion(user, goal, 'complete', id, now);
    assert.equal(plan.goal.status, 'completed');
    assert.equal(plan.goal.progress, 30);
    assert.equal(plan.user.pts, 120);
    assert.equal(plan.user.savingGoals[0].goalData[0].status, 'completed');
    assert.equal(plan.user.savingGoals[0].goalData[0].durationMinutes, 20);
    assert.equal(goal.status, 'in_progress');
});
test('retry and duplicate completion never double-credit', () => {
    const plan = planGoalCompletion(user, goal, 'complete', id, now);
    const updatedUser = { ...user, ...plan.user }, updatedGoal = { ...goal, ...plan.goal };
    assert.equal(planGoalCompletion(updatedUser, updatedGoal, 'complete', id, now).duplicate, true);
    const duplicate = planGoalCompletion(updatedUser, updatedGoal, 'complete', 'different-request', now);
    assert.equal(duplicate.user.pts, 120);
    assert.equal(duplicate.goal.progress, 30);
});
test('undo and delayed completion retry preserve the latest intent', () => {
    const complete = planGoalCompletion(user, goal, 'complete', id, now);
    const undo = planGoalCompletion({ ...user, ...complete.user }, { ...goal, ...complete.goal }, 'undo', 'undo-request', now);
    assert.equal(undo.user.pts, 100);
    assert.equal(undo.goal.progress, 29);
    assert.equal(undo.goal.completionDate, null);
    assert.equal(planGoalCompletion({ ...user, ...undo.user }, { ...goal, ...undo.goal }, 'complete', id, now).duplicate, true);
    const again = planGoalCompletion({ ...user, ...undo.user }, { ...goal, ...undo.goal }, 'undo', 'another-undo', now);
    assert.equal(again.user.pts, 100);
});
test('inactive goals and previous-day undo are rejected before writes', () => {
    assert.throws(() => planGoalCompletion(user, { ...goal, status: 'not_started' }, 'complete', id, now));
    assert.throws(() => planGoalCompletion(user, { ...goal, status: 'completed', completionDate: new Date('2026-10-28') }, 'undo', id, now));
});
test('database failure rolls back goal and points; serialization conflicts retry safely', async () => {
    let state = structuredClone({ user, goal }), failures = 0;
    const db = { $transaction: async fn => {
        const snapshot = structuredClone(state);
        try {
            return await fn({ user: { findUnique: async () => state.user, update: async ({ data }) => {
                if (failures++ === 0) throw Object.assign(new Error('conflict'), { code: 'P2034' });
                state.user = { ...state.user, ...data }; return state.user;
            } }, goal: { findFirst: async () => state.goal, update: async ({ data }) => {
                state.goal = { ...state.goal, ...data }; return state.goal;
            } } });
        } catch (e) { state = snapshot; throw e; }
    } };
    const result = await commitGoalCompletion(db, 'u', 'g', 'complete', id);
    assert.equal(result.user.pts, 120);
    assert.equal(result.goal.progress, 30);
    assert.equal(failures, 2);
    const retry = await commitGoalCompletion(db, 'u', 'g', 'complete', id);
    assert.equal(retry.user.pts, 120);
});
test('old list responses cannot overwrite a pending or completed mutation', () => {
    const before = goalReadVersion('test-user');
    const finish = beginGoalMutation('test-user');
    assert.equal(canApplyGoalRead('test-user', before), false);
    const during = goalReadVersion('test-user');
    assert.equal(canApplyGoalRead('test-user', during), false);
    finish();
    assert.equal(canApplyGoalRead('test-user', during), false);
    assert.equal(canApplyGoalRead('test-user', goalReadVersion('test-user')), true);
});
test('yesterday completion and undo leave today status intact', () => {
    const historicalUser = { ...user, savingGoals: [{ date: '2026-10-28', goalData: [{ idGoals: 'g', status: 'in_progress' }] }, ...user.savingGoals] };
    const plan = planGoalCompletion(historicalUser, goal, 'complete', id, now, '2026-10-28');
    assert.equal(plan.goal.status, undefined);
    assert.equal(plan.goal.progress, 30);
    assert.equal(plan.user.pts, 120);
    assert.equal(plan.user.savingGoals[1].goalData[0].status, 'in_progress');
    const undo = planGoalCompletion({ ...historicalUser, ...plan.user }, { ...goal, ...plan.goal }, 'undo', 'undo-yesterday', now, '2026-10-28');
    assert.equal(undo.goal.progress, 29);
    assert.equal(undo.user.pts, 100);
    assert.throws(() => planGoalCompletion(user, goal, 'complete', id, now, '2026-10-27'));
});
