// All fixtures and mutations run inside a transaction that is always rolled back.
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { commitGoalLifecycle } from '../src/lib/goalLifecycle.mjs';
import { syncAchievementCatalog } from '../src/lib/syncAchievementCatalog.mjs';
import { achievementProgress } from '../src/lib/achievementEligibility.mjs';
import { commitGoalCompletion } from '../src/lib/goalCompletion.mjs';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('EXPECTED_TEST_ROLLBACK');
const telegramId = `completion-audit-${randomUUID()}`;
try {
    try {
        await prisma.$transaction(async tx => {
            const user = await tx.user.create({ data: { telegramId, storageVersion: 0, pts: 100, savingGoals: [] } });
            const goal = await tx.goal.create({ data: { title: 'Transaction test', description: 'Temporary rollback fixture',
                points: 20, userId: user.id, status: 'in_progress', progress: 29 } });
            const db = { $transaction: fn => fn(tx) };
            const completeId = randomUUID();
            const completed = await commitGoalCompletion(db, user.id, goal.id, 'complete', completeId);
            assert.equal(completed.user.pts, 120);
            assert.equal(completed.goal.progress, 30);
            assert.equal(completed.goal.status, 'completed');
            assert.equal(completed.user.savingGoals[0].goalData[0].status, 'completed');
            const duplicate = await commitGoalCompletion(db, user.id, goal.id, 'complete', completeId);
            assert.equal(duplicate.user.pts, 120);
            const undo = await commitGoalCompletion(db, user.id, goal.id, 'undo', randomUUID());
            assert.equal(undo.user.pts, 100);
            assert.equal(undo.goal.progress, 29);
            assert.equal(undo.goal.status, 'in_progress');
            const delayed = await commitGoalCompletion(db, user.id, goal.id, 'complete', completeId);
            assert.equal(delayed.user.pts, 100);
            assert.equal(delayed.goal.status, 'in_progress');
            const createdId = randomUUID();
            const customInput = { action: 'create', requestId: createdId, title: 'Temporary lifecycle fixture', category: 'Discipline', selectedOption: 30, durationMinutes: 20 };
            const created = await commitGoalLifecycle(db, user.id, customInput);
            const duplicateCreate = await commitGoalLifecycle(db, user.id, customInput);
            assert.equal(duplicateCreate.goal.id, created.goal.id);
            assert.equal(await tx.goal.count({ where: { userId: user.id, title: customInput.title } }), 1);
            assert.equal(created.user.savingGoals.filter(day => day.goalData.some(row => row.idGoals === created.goal.id)).length, 30);
            const completeCustom = await commitGoalCompletion(db, user.id, created.goal.id, 'complete', randomUUID());
            assert.equal(completeCustom.user.pts, 120);
            const removeId = randomUUID();
            const removed = await commitGoalLifecycle(db, user.id, { action: 'remove', goalId: created.goal.id, requestId: removeId });
            assert.equal(removed.user.pts, 100);
            const removeAgain = await commitGoalLifecycle(db, user.id, { action: 'remove', goalId: created.goal.id, requestId: randomUUID() });
            assert.equal(removeAgain.user.pts, 100);
            assert.equal(removeAgain.goal.status, 'not_started');
            const replayCreate = await commitGoalLifecycle(db, user.id, customInput);
            assert.equal(replayCreate.goal.status, 'not_started');
            const retaken = await commitGoalLifecycle(db, user.id, { action: 'take', goalId: created.goal.id, selectedOption: 60, requestId: randomUUID() });
            assert.equal(retaken.goal.selectedOption, 60);
            const beforeInvalid = await tx.goal.count({ where: { userId: user.id } });
            await assert.rejects(commitGoalLifecycle(db, user.id, { ...customInput, requestId: randomUUID(), title: 'Invalid period', selectedOption: 9 }));
            assert.equal(await tx.goal.count({ where: { userId: user.id } }), beforeInvalid);
            const achievements = await syncAchievementCatalog(db, user.id);
            assert.equal(achievements.length, 27);
            assert.equal(achievements.find(a => a.templateId === 'v2:1').status, 'my');
            const firstHundred = await tx.user.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 100, select: { id: true } });
            assert.equal(achievements.find(a => a.templateId === 'v2:27').status, firstHundred.some(row => row.id === user.id) ? 'my' : 'locked');
            const collector = achievements.find(a => a.templateId === 'v2:26');
            assert.ok(achievementProgress(collector, { assignments: achievements }).percent < 100);
            const secondSync = await syncAchievementCatalog(db, user.id);
            assert.equal(secondSync.find(a => a.templateId === 'v2:1').earnedAt.getTime(), achievements.find(a => a.templateId === 'v2:1').earnedAt.getTime());
            throw rollback;
        }, { isolationLevel: 'Serializable', timeout: 90000 });
    } catch (error) { if (error !== rollback) throw error; }
    assert.equal(await prisma.user.count({ where: { telegramId } }), 0);
    console.log('PASS: PostgreSQL completion, lifecycle create/take/remove, retries, delayed replay, invalid rollback, 27 achievements, stable earned dates and full fixture rollback');
} finally { await prisma.$disconnect(); }
