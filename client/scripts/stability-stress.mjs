import assert from 'node:assert/strict';
import { planGoalCompletion } from '../src/lib/goalCompletion.mjs';
import { frozenStreakSnapshot, buildFrozenStreakTimeline, addStreakDays } from '../src/lib/streakFreeze.mjs';
let seed = 20261029;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
let mutations = 0;
for (let scenario = 0; scenario < 100; scenario++) {
    let user = { pts: 0, savingGoals: [] };
    let goal = { id: 'stress-goal', status: 'in_progress', progress: 0, points: 10, completionDate: null };
    const requests = [];
    for (let day = 0; day < 30; day++) {
        const date = addStreakDays('2026-11-01', day);
        const now = new Date(`${date}T12:00:00Z`);
        goal = { ...goal, status: 'in_progress', completionDate: null };
        for (let event = 0; event < 10; event++) {
            const action = random() < .6 ? 'complete' : 'undo';
            const requestId = requests.length && random() < .25 ? requests[Math.floor(random() * requests.length)] : `request-${scenario}-${day}-${event}`;
            requests.push(requestId);
            const plan = planGoalCompletion(user, goal, action, requestId, now);
            if (!plan.duplicate) { user = { ...user, ...plan.user }; goal = { ...goal, ...plan.goal }; }
            const completed = user.savingGoals.filter(d => d.goalData.some(g => g.status === 'completed')).length;
            assert.equal(user.pts, completed * 10);
            assert.equal(goal.progress, completed);
            assert.ok(['in_progress','completed'].includes(goal.status));
            mutations++;
        }
    }
}
for (let scenario = 0; scenario < 1000; scenario++) {
    const dates = Array.from({ length: 120 }, (_, i) => addStreakDays('2026-11-01', i)).filter(() => random() < .65);
    const until = '2027-02-28';
    const timeline = buildFrozenStreakTimeline(dates, until);
    const months = timeline.freezes.map(f => f.month);
    assert.equal(months.length, new Set(months).size);
    for (const freeze of timeline.freezes) {
        assert.ok(dates.includes(addStreakDays(freeze.date, -1)));
        assert.ok(dates.includes(addStreakDays(freeze.date, 1)));
        assert.ok(!dates.includes(freeze.date));
        assert.equal(timeline.days.get(freeze.date).completed, false);
    }
    const state = frozenStreakSnapshot(dates.map(date => ({ date, goalData: [{ status: 'completed' }] })), until);
    assert.ok(state.days <= dates.length);
}
console.log(JSON.stringify({ completionEvents: mutations, streakHistories: 1000, seed: 20261029, result: 'PASS', databaseWrites: 0 }));
