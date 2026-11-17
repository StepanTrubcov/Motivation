import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENT_TEMPLATES, validateAchievementTemplates } from './achievementTemplates.mjs';
import { achievementProgress, canUnlockAchievement } from './achievementEligibility.mjs';
import { checkAll } from '../utils/checkAll/checkAll.js';

const streakAchievements = ACHIEVEMENT_TEMPLATES.filter(item => item.type === 'streak_based');
const makeCalendar = (from, count) => Array.from({ length: count }, (_, index) => {
  const date = new Date(`${from}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + index);
  return { date: date.toISOString().slice(0, 10), goalData: [{ status: 'completed' }] };
});
const makeRecentCalendar = count => {
  const from = new Date('2026-01-01T12:00:00Z');
  from.setUTCDate(from.getUTCDate() - count);
  return makeCalendar(from.toISOString().slice(0, 10), count);
};

test('streak milestone templates are complete and use the requested rarities and targets', () => {
  assert.equal(validateAchievementTemplates(), true);
  assert.deepEqual(streakAchievements.map(({ rarity, target }) => [rarity, target]), [
    ['common', 30], ['rare', 100], ['legendary', 365],
  ]);
  assert.ok(streakAchievements.every(item => item.image && item.requirement && item.description));
});

test('streak milestones show correct progress and unlock at 30, 100 and 365 days', () => {
  const expectations = [[30, 29, 30], [100, 99, 100], [365, 364, 365]];
  for (const [target, before, reached] of expectations) {
    const achievement = streakAchievements.find(item => item.target === target);
    const calendarBefore = makeRecentCalendar(before);
    const calendarReached = makeRecentCalendar(reached);
    const beforeProgress = achievementProgress(achievement, {
      calendar: calendarBefore, user: { timeZone: 'UTC' }, now: new Date('2026-01-01T12:00:00Z'),
    });
    const reachedProgress = achievementProgress(achievement, {
      calendar: calendarReached, user: { timeZone: 'UTC' }, now: new Date('2026-01-01T12:00:00Z'),
    });
    assert.equal(beforeProgress.current, before);
    assert.equal(reachedProgress.current, reached);
    assert.equal(canUnlockAchievement(achievement, { calendar: calendarBefore, user: { timeZone: 'UTC' }, now: new Date('2026-01-01T12:00:00Z') }), false);
    assert.equal(canUnlockAchievement(achievement, { calendar: calendarReached, user: { timeZone: 'UTC' }, now: new Date('2026-01-01T12:00:00Z') }), true);
  }
});

test('a streak freeze day preserves the milestone counter without counting as a completed goal', () => {
  const achievement = streakAchievements.find(item => item.target === 30);
  const calendar = makeCalendar('2026-11-01', 31).filter(day => day.date !== '2026-11-15');
  const progress = achievementProgress(achievement, {
    calendar, user: { timeZone: 'UTC' }, now: new Date('2026-12-01T12:00:00Z'),
  });
  assert.equal(progress.current, 30);
  assert.equal(canUnlockAchievement(achievement, { calendar, user: { timeZone: 'UTC' }, now: new Date('2026-12-01T12:00:00Z') }), true);
});

test('background achievement checks request server award only after the streak reaches its target', async () => {
  const achievement = streakAchievements.find(item => item.target === 30);
  const triggered = { current: new Set() };
  const unlocked = [];
  await checkAll([
    { ...achievement, templateId: `v2:${achievement.id}`, id: 'streak-30', progress: { current: 29 } },
    { ...achievement, templateId: `v2:${achievement.id}`, id: 'streak-30', progress: { current: 30 } },
  ], triggered, [], async row => unlocked.push(row.templateId), 'user-1');
  assert.deepEqual(unlocked, [`v2:${achievement.id}`]);
});
