import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFrozenStreakTimeline as timeline, frozenStreakSnapshot as snapshot } from './streakFreeze.mjs';
import { getPendingFreezeCelebration, acknowledgeStreakCelebration } from './streakCelebrations.mjs';
import { buildStreakHistory as history } from '../components/Profile/ContributionCalendar/streakHistory.js';
const rules = { enabledFrom: '2020-01-01' };
const buildFrozenStreakTimeline = (dates, until) => timeline(dates, until, rules);
const frozenStreakSnapshot = (calendar, today) => snapshot(calendar, today, rules);
const buildStreakHistory = (values, until) => history(values, until, 14, rules);
const calendar = dates => dates.map(date => ({ date, goalData: [{ status: 'completed' }] }));
test('pre-rollout gaps cannot spend the first allowance: real October 28 regression', () => {
    const dates = ['2026-10-09', '2026-10-11', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-29'];
    const state = snapshot(calendar(dates), '2026-10-29');
    assert.deepEqual(state.freezes.map(f => f.date), ['2026-10-28']);
    assert.equal(state.days, 4);
    assert.equal(state.runStart, '2026-10-25');
    const strip = history(Object.fromEntries(dates.map(date => [date, 1])), '2026-10-29');
    assert.equal(strip.find(day => day.date === '2026-10-28').frozen, true);
    assert.equal(strip.at(-1).streak, 4);
});
test('one missed day is protected only after returning; frozen day adds no completion', () => {
    const before = frozenStreakSnapshot(calendar(['2026-10-25','2026-10-26']), '2026-10-28');
    assert.equal(before.freezes.length, 0);
    const after = frozenStreakSnapshot(calendar(['2026-10-25','2026-10-26','2026-10-28']), '2026-10-28');
    assert.equal(after.days, 3);
    assert.equal(after.runStart, '2026-10-25');
    assert.equal(after.freezes[0].date, '2026-10-27');
    assert.equal(after.freezeAvailable, false);
    const row = buildFrozenStreakTimeline(['2026-10-25','2026-10-26','2026-10-28'], '2026-10-28').days.get('2026-10-27');
    assert.equal(row.completed, false); assert.equal(row.frozen, true); assert.equal(row.streak, 2);
});
test('a second missed day in the same month and two consecutive missed days break the run', () => {
    const state = frozenStreakSnapshot(calendar(['2026-10-20','2026-10-22','2026-10-24']), '2026-10-24');
    assert.equal(state.freezes.length, 1); assert.equal(state.days, 1); assert.equal(state.runStart, '2026-10-24');
    assert.equal(frozenStreakSnapshot(calendar(['2026-10-20','2026-10-23']), '2026-10-23').days, 1);
});
test('allowance resets next calendar month and belongs to the missed day month', () => {
    const state = frozenStreakSnapshot(calendar(['2026-10-29','2026-10-31','2026-11-02']), '2026-11-02');
    assert.deepEqual(state.freezes.map(f => f.date), ['2026-10-30','2026-11-01']);
    assert.equal(state.days, 3); assert.equal(state.runStart, '2026-10-29');
    const boundary = frozenStreakSnapshot(calendar(['2026-10-30','2026-11-01']), '2026-11-01');
    assert.equal(boundary.freezes[0].month, '2026-10'); assert.equal(boundary.freezeAvailable, true);
});
test('future dates, duplicates and malformed dates cannot consume a freeze', () => {
    const state = frozenStreakSnapshot(calendar(['2026-10-25','2026-10-25','2026-10-27','2026-10-99']), '2026-10-25');
    assert.equal(state.freezes.length, 0); assert.equal(state.days, 1);
    assert.equal(frozenStreakSnapshot(null, '2026-10-25').ready, false);
});
test('leap day and year boundary are handled in UTC', () => {
    assert.equal(buildFrozenStreakTimeline(['2024-02-28','2024-03-01'], '2024-03-01').freezes[0].date, '2024-02-29');
    assert.equal(buildFrozenStreakTimeline(['2026-12-31','2027-01-02'], '2027-01-02').freezes[0].date, '2027-01-01');
});
test('undoing the return cancels a provisional protection without changing saved history', () => {
    const data = calendar(['2026-10-25','2026-10-27']);
    assert.equal(frozenStreakSnapshot(data, '2026-10-27').freezes.length, 1);
    data[1].goalData[0].status = 'in_progress';
    assert.equal(frozenStreakSnapshot(data, '2026-10-27').freezes.length, 0);
    assert.equal(data.length, 2);
});
test('calendar strip and profile use the same monthly decision even outside visible dates', () => {
    const dates = ['2026-10-01','2026-10-03','2026-10-25','2026-10-27'];
    const values = Object.fromEntries(dates.map(date => [date,1]));
    const strip = buildStreakHistory(values, '2026-10-27');
    assert.equal(strip.find(day => day.date === '2026-10-26').frozen, false);
    assert.equal(strip.at(-1).streak, frozenStreakSnapshot(calendar(dates), '2026-10-27').days);
});
test('freeze explanation is acknowledged once, survives reload and is isolated per user', () => {
    const values = new Map(); const storage = { getItem: key => values.get(key), setItem: (key,value) => values.set(key,value) };
    const state = frozenStreakSnapshot(calendar(['2026-10-25','2026-10-27']), '2026-10-27');
    const event = getPendingFreezeCelebration(state, 'freeze-user-A', storage);
    assert.equal(event.kind, 'freeze'); assert.equal(event.frozenDate, '2026-10-26');
    acknowledgeStreakCelebration(event, storage);
    assert.equal(getPendingFreezeCelebration(state, 'freeze-user-A', storage), null);
    assert.ok(getPendingFreezeCelebration(state, 'freeze-user-B', storage));
});
