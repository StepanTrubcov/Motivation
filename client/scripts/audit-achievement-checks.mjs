import fs from 'node:fs';
import vm from 'node:vm';
import { ACHIEVEMENT_TEMPLATES as templates } from '../src/lib/achievementTemplates.mjs';
import { checkAll } from '../src/utils/checkAll/checkAll.js';
import { calcLevelFromPts, LEVEL_THRESHOLDS } from '../src/utils/levels.js';

import { TEMPLATE_GOALS_ARRAY as standard } from '../src/lib/goalCatalog.mjs';
import { canUnlockAchievement } from '../src/lib/achievementEligibility.mjs';
const curated = JSON.parse(fs.readFileSync(new URL('../src/lib/testbot-goal-catalog.json', import.meta.url))).goals;
const results = [];
const userId = 'audit-user';
const goal = (id, progress) => ({ id: `${userId}_${id}`, userId, progress });
async function unlocks(achievement, { goals = [], points = 0, registered = new Date(), assignments, triggered = { current: new Set() } } = {}) {
    const unlocked = [];
    await checkAll(assignments || [{ ...achievement, status: 'locked' }], triggered, goals,
        async a => unlocked.push(a.id), userId, registered, points);
    return unlocked.includes(achievement.id);
}

for (const achievement of templates) {
    const checks = {};
    if (achievement.type === 'goal_based') {
        for (const offset of [-1, 0, 1]) {
            checks[`threshold${offset >= 0 ? '+' : ''}${offset}`] =
                await unlocks(achievement, { goals: [goal(achievement.goalIds[0], achievement.target + offset)] }) === (offset >= 0);
        }
        checks.unrelatedGoal = !await unlocks(achievement, { goals: [goal('999', achievement.target)] });
        checks.catalogTestBot = achievement.goalIds.some(id => curated.some(g => String(g.id) === id));
        checks.catalogAllUsers = achievement.goalIds.some(id => standard.some(g => String(g.id) === id));
        const triggered = { current: new Set() };
        const params = { goals: [goal(achievement.goalIds[0], achievement.target)], triggered };
        checks.noDuplicate = await unlocks(achievement, params) && !await unlocks(achievement, params);
    } else if (achievement.type === 'level_based') {
        const threshold = LEVEL_THRESHOLDS[achievement.target - 1];
        checks.reachableLevel = Number.isFinite(threshold);
        if (checks.reachableLevel) {
            checks.before = !await unlocks(achievement, { points: threshold - 1 });
            checks.at = await unlocks(achievement, { points: threshold });
            checks.after = await unlocks(achievement, { points: threshold + 1 });
        }
    } else if (achievement.type === 'completion_count_based') {
        for (const offset of [-1, 0, 1]) checks[`threshold${offset}`] = await unlocks(achievement, {
            goals: [goal('1', 400), goal('2', achievement.target - 400 + offset)],
        }) === (offset >= 0);
    } else if (achievement.type === 'time_based') {
        for (const offset of [-1, 0, 1]) checks[`days${offset}`] = await unlocks(achievement, {
            registered: new Date(Date.now() - (achievement.target + offset) * 86400000 - 1000),
        }) === (offset >= 0);
        checks.invalidDate = !await unlocks(achievement, { registered: 'invalid' });
    } else if (achievement.type === 'collection_based') {
        const all = templates.map(a => ({ ...a, status: a.id === achievement.id ? 'locked' : 'my' }));
        checks.allEarned = await unlocks(achievement, { assignments: all });
        checks.missingOne = !await unlocks(achievement, { assignments: all.map(a => a.id === '4' ? { ...a, status: 'locked' } : a) });
        checks.epicOptional = await unlocks(achievement, { assignments: all.map(a => a.rarity === 'epic' ? { ...a, status: 'locked' } : a) });
        checks.emptyCollection = !await unlocks(achievement);
    } else {
        checks.neverAutoUnlocked = !await unlocks(achievement, { goals: [goal('1', 9999)], points: 9999999, registered: new Date(0) });
        checks.eventWiring = achievement.id === '2'
            ? fs.readFileSync(new URL('../src/components/Tutorial/TutorialOverlay.jsx', import.meta.url), 'utf8').includes('findTutorialAchievement(assignments)')
            : achievement.status === 'my';
        if (achievement.id === '27') checks.first100Eligibility = !canUnlockAchievement(achievement, { first100: false }) && canUnlockAchievement(achievement, { first100: true });
    }
    results.push({ id: achievement.id, title: achievement.title, checks, passed: Object.values(checks).every(Boolean) });
}
const customCollision = await unlocks(templates.find(a => a.id === '3'), { goals: [{ id: 'custom-goal1', title: 'Other goal', progress: 30 }] });
console.log(JSON.stringify({ total: results.length, passed: results.filter(r => r.passed).length,
    results, extra: { customGoalCanUnlockRunning: customCollision, levelAtMillion: calcLevelFromPts(1000000),
        progressResetOnRemoval: /case 'not_started':[\s\S]*?progress: 0/.test(fs.readFileSync(new URL('../src/app/api/goals/[userId]/[goalId]/route.js', import.meta.url), 'utf8')) } }, null, 2));
