import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

function normTitle(t) {
  return (t || '').trim();
}

function normalizeTemplateId(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!/^([1-9]|1[0-9]|2[0-9]|3[01])$/.test(s)) return null;
  return s;
}

/** Совпадение строки из БД с объектом из шаблона: одно и то же «логическое» достижение (не только title). */
function sameTitleAndTarget(row, ach) {
  if (normTitle(row.title) !== normTitle(ach.title)) return false;
  const rt = row.target != null ? Number(row.target) : null;
  const at = ach.target != null ? Number(ach.target) : null;
  return rt === at;
}

function templateTitleTargetKeyFromAch(ach) {
  return `${normTitle(ach?.title)}|${ach?.target ?? 'null'}`;
}

function pickKeepRow(rows) {
  const my = rows.filter((r) => r.status === 'my');
  const pool = my.length ? my : rows;
  return [...pool].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
}

/** При одинаковом title+target предпочитаем строку с заполненным templateId (основная запись). */
function pickKeepRowPreferTemplate(rows) {
  const withTpl = rows.filter((r) => r.templateId);
  const pool = withTpl.length ? withTpl : rows;
  return pickKeepRow(pool);
}

/**
 * Убирает дубликаты в БД: сначала по templateId, затем по паре (title + target) по всем строкам,
 * чтобы слить «основную» строку и дубликат без templateId с тем же смыслом.
 */
async function dedupeUserAchievements(userId) {
  const rows = await prisma.achievement.findMany({ where: { userId } });
  const idsToDelete = new Set();

  const byTemplate = new Map();
  for (const r of rows) {
    if (!r.templateId) continue;
    const list = byTemplate.get(r.templateId) || [];
    list.push(r);
    byTemplate.set(r.templateId, list);
  }
  for (const [, list] of byTemplate) {
    if (list.length <= 1) continue;
    const keep = pickKeepRow(list);
    for (const r of list) {
      if (r.id !== keep.id) idsToDelete.add(r.id);
    }
  }

  const remainingAfterTpl = rows.filter((r) => !idsToDelete.has(r.id));
  const byTitleTarget = new Map();
  for (const r of remainingAfterTpl) {
    const key = `${normTitle(r.title)}|${r.target ?? 'null'}`;
    const list = byTitleTarget.get(key) || [];
    list.push(r);
    byTitleTarget.set(key, list);
  }
  for (const [, list] of byTitleTarget) {
    if (list.length <= 1) continue;
    const keep = pickKeepRowPreferTemplate(list);
    for (const r of list) {
      if (r.id !== keep.id) idsToDelete.add(r.id);
    }
  }

  if (idsToDelete.size > 0) {
    await prisma.achievement.deleteMany({
      where: { userId, id: { in: [...idsToDelete] } },
    });
  }
}

/**
 * На чтении: один смысловой ключ на карточку — не показываем дубликаты, даже если в БД ещё остались.
 * Приоритет: status my, затем строка с templateId, затем свежая updatedAt.
 */
function rowScore(r) {
  let s = 0;
  if (r.status === 'my') s += 1e9;
  if (r.templateId) s += 1e6;
  s += new Date(r.updatedAt).getTime() / 1000;
  return s;
}

function uniqueAchievementsForClient(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const sorted = [...rows].sort((a, b) => rowScore(b) - rowScore(a));
  const chosenByTitleTarget = new Map();
  for (const r of sorted) {
    const key = `${normTitle(r.title)}|${r.target ?? 'null'}`;
    if (!chosenByTitleTarget.has(key)) chosenByTitleTarget.set(key, r);
  }

  const chosen = [...chosenByTitleTarget.values()];
  return chosen.sort((a, b) => {
    const na = a.templateId ? parseInt(a.templateId, 10) : 999;
    const nb = b.templateId ? parseInt(b.templateId, 10) : 999;
    if (na !== nb) return na - nb;
    return normTitle(a.title).localeCompare(normTitle(b.title));
  });
}

export async function POST(request, { params }) {
  try {
    const { id: userId } = await params;
    const { achievements } = await request.json();

    if (!achievements || !Array.isArray(achievements)) {
      return NextResponse.json({ error: 'Achievements must be an array' }, { status: 400 });
    }

    // Строгая инициализация: обрабатываем только шаблонные ачивки templateId 1..26.
    const incomingByTemplateId = new Map();
    for (const ach of achievements) {
      const templateId = normalizeTemplateId(ach?.id);
      if (!templateId) continue;
      incomingByTemplateId.set(templateId, ach);
    }

    const required = Array.from({ length: 31 }, (_, i) => String(i + 1));
    const missing = required.filter((id) => !incomingByTemplateId.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Missing required template achievements', missingTemplateIds: missing },
        { status: 400 }
      );
    }

    await dedupeUserAchievements(userId);

    let existingAchievements = await prisma.achievement.findMany({ where: { userId } });

    const results = [];
    for (const templateId of required) {
      const ach = incomingByTemplateId.get(templateId);
      const title = ach?.title;
      if (!title) continue;

      let existing = null;
      existing = existingAchievements.find((a) => a.templateId === templateId);
      if (!existing) {
        existing = existingAchievements.find((a) => sameTitleAndTarget(a, ach));
      }

      const desiredStatus = ach.status || 'locked';
      const legacyMyForThis =
        existingAchievements.find((a) => a.id !== existing?.id && sameTitleAndTarget(a, ach) && a.status === 'my') ||
        existingAchievements.find((a) => a.id !== existing?.id && normTitle(a.title) === normTitle(title) && a.status === 'my');
      const nextStatus = existing?.status === 'my' || legacyMyForThis ? 'my' : desiredStatus;

      if (existing) {
        const updated = await prisma.achievement.update({
          where: { id: existing.id },
          data: {
            templateId: templateId || existing.templateId || null,
            description: ach.description || '',
            requirement: ach.requirement || '',
            status: nextStatus,
            image: ach.image || '',
            gif: ach.gif || '',
            points: ach.points || 0,
            type: ach.type || null,
            goalIds: ach.goalIds || [],
            target: ach.target != null ? ach.target : null,
            rarity: ach.rarity || 'common',
          },
        });
        results.push(updated);
        const idx = existingAchievements.findIndex((a) => a.id === existing.id);
        if (idx !== -1) existingAchievements[idx] = updated;
      } else {
        // Если раньше у пользователя уже была полученная (my) legacy-ачивка с тем же смыслом,
        // не даём шаблонной записи “откатиться” в locked — иначе на клиенте она разлочится повторно
        // и очки начислятся снова.
        const legacyMy =
          existingAchievements.find((a) => sameTitleAndTarget(a, ach) && a.status === 'my') ||
          existingAchievements.find((a) => normTitle(a.title) === normTitle(title) && a.status === 'my');

        const created = await prisma.achievement.create({
          data: {
            title,
            templateId: templateId || null,
            description: ach.description || '',
            requirement: ach.requirement || '',
            status: legacyMy ? 'my' : desiredStatus,
            image: ach.image || '',
            gif: ach.gif || '',
            points: ach.points || 0,
            type: ach.type || null,
            goalIds: ach.goalIds || [],
            target: ach.target != null ? ach.target : null,
            rarity: ach.rarity || 'common',
            userId,
          },
        });
        results.push(created);
        existingAchievements.push(created);
      }
    }

    // После строгой синхронизации: удаляем «лишние» строки без templateId,
    // которые дублируют шаблонные (title+target) и могли остаться от старых багов.
    const templateTitleTargetKeys = new Set(required.map((id) => templateTitleTargetKeyFromAch(incomingByTemplateId.get(id))));
    await prisma.achievement.deleteMany({
      where: {
        userId,
        templateId: null,
        // Никогда не удаляем legacy-строки со статусом my
        status: { not: 'my' },
        OR: [...templateTitleTargetKeys].map((k) => {
          const [title, targetRaw] = k.split('|');
          const target = targetRaw === 'null' ? null : Number(targetRaw);
          return { title, target };
        }),
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error saving achievements:', error);
    return NextResponse.json({ error: 'Не удалось сохранить достижения', details: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id: userId } = await params;

    const achievements = await prisma.achievement.findMany({
      where: { userId },
    });

    return NextResponse.json(uniqueAchievementsForClient(achievements));
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Не удалось получить достижения' }, { status: 500 });
  }
}
