import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { connectProgressDb } from './connect.mjs';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const apply = process.argv.includes('--apply');
const backupArg = process.argv.find((arg) => arg.startsWith('--backup='));
const db = new PrismaClient();

const signature = (row) => JSON.stringify([
  row.id,
  row.userId,
  row.templateId ?? null,
  row.earnedAt ? new Date(row.earnedAt).toISOString() : null,
]);

function assertSameRows(actual, expected, table) {
  const actualRows = actual.map(signature).sort();
  const expectedRows = expected.map(signature).sort();
  if (JSON.stringify(actualRows) !== JSON.stringify(expectedRows)) {
    throw new Error(`${table} changed after the backup; refusing to reset achievements`);
  }
}

try {
  await connectProgressDb(db);

  if (!backupArg) throw new Error('Pass the full backup path with --backup=<path>');
  const backupPath = path.resolve(backupArg.slice('--backup='.length));
  const content = await fs.readFile(backupPath, 'utf8');
  const expectedHash = (await fs.readFile(`${backupPath}.sha256`, 'utf8')).trim();
  const actualHash = createHash('sha256').update(content).digest('hex');
  if (actualHash !== expectedHash) throw new Error('Backup checksum does not match');

  const backup = JSON.parse(content);
  if (backup.format !== 'compact-progress-full-v1') throw new Error('Unsupported backup format');
  if (![backup.user, backup.achievement, backup.earnedAchievement].every(Array.isArray)) {
    throw new Error('Backup is missing user or achievement tables');
  }
  if (backup.user.some((user) => user.storageVersion !== 1)) {
    throw new Error('This reset script only supports fully compact user storage');
  }

  const result = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" FOR UPDATE`;
    const [users, achievementRows, earnedRows] = await Promise.all([
      tx.user.findMany({ select: { id: true, storageVersion: true, progressMeta: true } }),
      tx.achievement.findMany({ select: { id: true, userId: true, templateId: true, earnedAt: true } }),
      tx.earnedAchievement.findMany({ select: { id: true, userId: true, templateId: true, earnedAt: true } }),
    ]);

    const expectedUsers = new Set(backup.user.map((user) => user.id));
    if (users.length !== expectedUsers.size || users.some((user) => !expectedUsers.has(user.id))) {
      throw new Error('The user set changed after the backup; refusing to reset achievements');
    }
    if (users.some((user) => user.storageVersion !== 1)) {
      throw new Error('A user is not using compact storage; refusing a partial reset');
    }
    assertSameRows(achievementRows, backup.achievement, 'Achievement');
    assertSameRows(earnedRows, backup.earnedAchievement, 'EarnedAchievement');

    const before = { users: users.length, achievementRows: achievementRows.length, earnedRows: earnedRows.length };
    if (!apply) return { applied: false, before, after: before };

    await tx.achievement.deleteMany();
    await tx.earnedAchievement.deleteMany();

    for (const user of users) {
      const progressMeta = { ...(user.progressMeta || {}) };
      delete progressMeta.achievementIds;
      progressMeta.achievementCatalog = 'v2';
      progressMeta.achievementsInitialized = false;
      await tx.user.update({ where: { id: user.id }, data: { progressMeta } });
    }

    const [remainingAchievementRows, remainingEarnedRows, updatedUsers] = await Promise.all([
      tx.achievement.count(),
      tx.earnedAchievement.count(),
      tx.user.findMany({ select: { progressMeta: true } }),
    ]);
    if (remainingAchievementRows !== 0 || remainingEarnedRows !== 0) {
      throw new Error('Achievement rows remain after reset');
    }
    if (updatedUsers.some((user) => user.progressMeta?.achievementCatalog !== 'v2'
      || user.progressMeta?.achievementsInitialized !== false
      || Object.hasOwn(user.progressMeta || {}, 'achievementIds'))) {
      throw new Error('Achievement metadata did not reset cleanly');
    }

    return {
      applied: true,
      before,
      after: { users: updatedUsers.length, achievementRows: remainingAchievementRows, earnedRows: remainingEarnedRows },
    };
  }, { isolationLevel: 'Serializable', timeout: 120000, maxWait: 10000 });

  console.log(JSON.stringify({ ...result, backupPath }, null, 2));
  if (!apply) console.log('Dry run only. Add --apply to perform the reset.');
} finally {
  await db.$disconnect();
}
