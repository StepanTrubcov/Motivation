import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function normalizeAchievement(a, userId) {
  return {
    id: a.id,
    templateId: a.templateId ?? null,
    title: a.title ?? "",
    gif: a.gif ?? "",
    rarity: a.rarity ?? "common",
    description: a.description ?? null,
    requirement: a.requirement ?? "",
    status: a.status,
    image: a.image ?? "",
    points: Number.isFinite(a.points) ? a.points : 0,
    type: a.type ?? null,
    goalIds: Array.isArray(a.goalIds) ? a.goalIds : [],
    target: a.target ?? null,
    userId,
    createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
    updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
  };
}

async function main() {
  const backupPathArg = process.argv[2];
  const flags = new Set(process.argv.slice(3));
  const forceWipe = flags.has("--force-wipe");
  if (!backupPathArg) {
    console.error(
      "Usage: node scripts/restore-achievements-from-backup.mjs <path-to-backup.json> [--force-wipe]"
    );
    process.exit(1);
  }

  const backupPath = path.isAbsolute(backupPathArg)
    ? backupPathArg
    : path.resolve(process.cwd(), backupPathArg);

  const raw = await fs.readFile(backupPath, "utf8");
  const backup = JSON.parse(raw);

  if (!backup?.users || !Array.isArray(backup.users)) {
    throw new Error("Backup format mismatch: expected { users: [...] }");
  }

  const achievements = [];
  const telegramIdsInBackup = new Set();

  for (const u of backup.users) {
    if (!u?.telegramId) continue;
    telegramIdsInBackup.add(String(u.telegramId));
    const list = Array.isArray(u.achievements) ? u.achievements : [];
    for (const a of list) {
      if (!a?.id) continue;
      // We'll re-map userId by telegramId later.
      achievements.push({ telegramId: String(u.telegramId), raw: a });
    }
  }

  const existingUsers = await prisma.user.findMany({
    where: { telegramId: { in: [...telegramIdsInBackup] } },
    select: { id: true, telegramId: true },
  });
  const telegramIdToUserId = new Map(
    existingUsers.map((u) => [String(u.telegramId), u.id])
  );

  // Normalize + map to current DB userIds.
  const mapped = [];
  for (const item of achievements) {
    const userId = telegramIdToUserId.get(item.telegramId);
    if (!userId) continue;
    mapped.push(normalizeAchievement(item.raw, userId));
  }

  // Deduplicate by achievement id inside the backup file (safety).
  const seen = new Set();
  const deduped = [];
  for (const a of mapped) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    deduped.push(a);
  }

  const skippedUsersCount =
    telegramIdsInBackup.size - telegramIdToUserId.size;
  const skippedAchievementsCount = mapped.length - deduped.length;

  console.log(
    JSON.stringify(
      {
        backupPath,
        telegramIdsInBackup: telegramIdsInBackup.size,
        usersMatchedByTelegramId: existingUsers.length,
        skippedUsersCount,
        achievementsFoundInBackup: achievements.length,
        achievementsToRestore: deduped.length,
        skippedAchievementsCount,
      },
      null,
      2
    )
  );

  if (!forceWipe) {
    if (existingUsers.length === 0) {
      throw new Error(
        "Abort: DB has 0 users matching this backup (by telegramId). Refusing to wipe achievements. " +
          "Check DIRECT_DATABASE_URL points to the correct database, or re-run with --force-wipe."
      );
    }
    if (deduped.length === 0) {
      throw new Error(
        "Abort: 0 achievements to restore (after filtering by existing users). " +
          "Refusing to wipe achievements. Re-run with --force-wipe to wipe anyway."
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    // Restore ONLY achievements, for matched users only:
    // wipe achievements of those users, then re-insert from backup mapped by telegramId.
    const userIds = existingUsers.map((u) => u.id);
    await tx.achievement.deleteMany({ where: { userId: { in: userIds } } });

    for (const part of chunk(deduped, 1000)) {
      await tx.achievement.createMany({
        data: part.map((a) => {
          // Prisma doesn't accept `undefined` for Date fields in createMany data
          const { createdAt, updatedAt, ...rest } = a;
          return {
            ...rest,
            ...(createdAt ? { createdAt } : {}),
            ...(updatedAt ? { updatedAt } : {}),
          };
        }),
        skipDuplicates: true,
      });
    }
  });

  const restoredCount = await prisma.achievement.count({
    where: { userId: { in: existingUsers.map((u) => u.id) } },
  });
  console.log(`Restored achievements for matched users: ${restoredCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

