import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENT_TEMPLATES, validateAchievementTemplates } from '../src/lib/achievementTemplates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backupPath = process.argv[2] ? path.resolve(process.argv[2]) : '';
if (!backupPath) throw new Error('Pass the fresh database backup JSON path');

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
if (!['users', 'goals', 'achievements'].every((key) => Array.isArray(backup[key]))) {
  throw new Error('Backup is missing users, goals, or achievements');
}
if (!backup.timestamp || Date.now() - Date.parse(backup.timestamp) > 30 * 60 * 1000) {
  throw new Error('Backup is missing or older than 30 minutes');
}
validateAchievementTemplates();

const backupUsers = backup.users.filter((user) =>
  [user.firstName, user.username].some((value) => String(value || '').trim().toLowerCase() === 'testbot')
);
if (backupUsers.length !== 1) throw new Error(`Expected exactly one TestBot in backup; found ${backupUsers.length}`);
const testBot = backupUsers[0];
const expectedTemplateIds = new Set(ACHIEVEMENT_TEMPLATES.map((item) => `v2:${item.id}`));
const goalIds = new Set(backup.goals.filter((goal) => goal.userId === testBot.id).map((goal) => String(goal.id).match(/(\d+)$/)?.[1]));
for (const achievement of ACHIEVEMENT_TEMPLATES) {
  if (achievement.type === 'goal_based') {
    for (const goalId of achievement.goalIds || []) {
      if (!goalIds.has(String(goalId))) throw new Error(`TestBot is missing goal ${goalId} for ${achievement.title}`);
    }
  }
  const imagePath = path.resolve(root, 'public', `.${achievement.image}`);
  if (!imagePath.startsWith(path.resolve(root, 'public') + path.sep) || !fs.existsSync(imagePath)) {
    throw new Error(`Missing local achievement image: ${achievement.image}`);
  }
}

const p = new PrismaClient();
const sameMeaning = (row, template) =>
  String(row.title || '').trim() === template.title.trim() &&
  (row.target == null ? null : Number(row.target)) === (template.target == null ? null : Number(template.target)) &&
  (row.type || null) === (template.type || null) &&
  JSON.stringify((row.goalIds || []).map(String).sort()) === JSON.stringify((template.goalIds || []).map(String).sort());
const dataFor = (template, userId, status) => ({
    templateId: `v2:${template.id}`, title: template.title,
  description: template.description || '', requirement: template.requirement || '',
  status, image: template.image, gif: template.gif || '', points: Number(template.points) || 0,
  rarity: template.rarity || 'common', type: template.type || null,
  goalIds: template.goalIds || [], target: template.target == null ? null : Number(template.target), userId,
});

try {
  const usersBefore = await p.user.findMany({ where: { id: { not: testBot.id } }, select: { id: true, pts: true, updatedAt: true } });
  const otherAchievementsBefore = await p.achievement.findMany({ where: { userId: { not: testBot.id } }, orderBy: [{ userId: 'asc' }, { templateId: 'asc' }, { id: 'asc' }] });
  const user = await p.user.findUnique({ where: { id: testBot.id }, select: { id: true, firstName: true, username: true, pts: true, updatedAt: true } });
  if (!user || String(user.firstName || '').trim().toLowerCase() !== 'testbot') throw new Error('Live database TestBot does not match the backup');

  const goalsBefore = await p.goal.findMany({ where: { userId: testBot.id }, orderBy: { id: 'asc' } });
  const current = await p.achievement.findMany({ where: { userId: testBot.id }, orderBy: { id: 'asc' } });
  const retained = new Map();
  const claimed = new Set();
  for (const template of ACHIEVEMENT_TEMPLATES) {
    const match = current.find((row) => !claimed.has(row.id) && sameMeaning(row, template));
    if (match) { retained.set(String(template.id), match); claimed.add(match.id); }
  }

  await p.$transaction(async (tx) => {
    await tx.achievement.deleteMany({ where: { userId: testBot.id, id: { notIn: [...claimed] } } });
    for (const template of ACHIEVEMENT_TEMPLATES) {
      const old = retained.get(String(template.id));
      const data = dataFor(template, testBot.id, old?.status === 'my' ? 'my' : (template.status || 'locked'));
      if (old) await tx.achievement.update({ where: { id: old.id }, data });
      else await tx.achievement.create({ data });
    }
  }, { timeout: 120000 });

  const after = await p.achievement.findMany({ where: { userId: testBot.id }, orderBy: { templateId: 'asc' } });
  if (after.length !== ACHIEVEMENT_TEMPLATES.length) throw new Error(`Expected ${ACHIEVEMENT_TEMPLATES.length} achievements; found ${after.length}`);
  const afterTemplateIds = new Set(after.map((item) => item.templateId));
  if (afterTemplateIds.size !== ACHIEVEMENT_TEMPLATES.length || [...expectedTemplateIds].some((id) => !afterTemplateIds.has(id))) {
    throw new Error('Live TestBot achievement template IDs do not match the canonical catalog');
  }
  const userAfter = await p.user.findUnique({ where: { id: testBot.id }, select: { id: true, firstName: true, username: true, pts: true, updatedAt: true } });
  const goalsAfter = await p.goal.findMany({ where: { userId: testBot.id }, orderBy: { id: 'asc' } });
  const otherUsersAfter = await p.user.findMany({ where: { id: { not: testBot.id } }, select: { id: true, pts: true, updatedAt: true } });
  const otherAchievementsAfter = await p.achievement.findMany({ where: { userId: { not: testBot.id } }, orderBy: [{ userId: 'asc' }, { templateId: 'asc' }, { id: 'asc' }] });
  const json = (value) => JSON.stringify(value);
  if (json(user) !== json(userAfter) || json(goalsBefore) !== json(goalsAfter)) throw new Error('TestBot user profile or goals changed');
  if (json(usersBefore) !== json(otherUsersAfter) || json(otherAchievementsBefore) !== json(otherAchievementsAfter)) throw new Error('Records outside TestBot changed');

  console.log(JSON.stringify({ synced: true, user: user.firstName, achievements: after.length, preservedEarned: after.filter((item) => item.status === 'my').length, staleRemoved: current.length - claimed.size, otherUsersUnchanged: true, goalsUnchanged: true }));
} finally {
  await p.$disconnect();
}
