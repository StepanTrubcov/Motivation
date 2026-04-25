import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';

function isDigits(s) {
  return typeof s === 'string' && /^\d+$/.test(s);
}

function templateSuffixFromGoalId(goalId, userId) {
  const prefix = `${userId}_`;
  if (typeof goalId !== 'string' || !goalId.startsWith(prefix)) return null;
  const suffix = goalId.slice(prefix.length);
  return isDigits(suffix) ? suffix : null;
}

function statusScore(status) {
  if (status === 'completed') return 3;
  if (status === 'in_progress') return 2;
  return 1; // not_started / unknown
}

function pickBestGoal(goals) {
  return [...goals].sort((a, b) => {
    const sa = statusScore(a.status);
    const sb = statusScore(b.status);
    if (sa !== sb) return sb - sa;
    const pa = Number(a.progress) || 0;
    const pb = Number(b.progress) || 0;
    if (pa !== pb) return pb - pa;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  })[0];
}

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    const { goalsArray } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    if (!Array.isArray(goalsArray)) {
      return NextResponse.json({ error: 'goalsArray must be an array' }, { status: 400 });
    }

    const expectedTemplateIds = new Set(
      goalsArray
        .map((g) => (g?.id != null ? String(g.id) : ''))
        .filter((id) => isDigits(id))
    );
    const goalsById = new Map(goalsArray.map((g) => [String(g?.id), g]));

    const prefix = `${userId}_`;

    // Берём шаблонные цели (canonical) и возможные legacy-дубли по title.
    const templateTitles = goalsArray.map((g) => String(g?.title || '')).filter(Boolean);
    const dbGoals = await prisma.goal.findMany({
      where: {
        userId: String(userId),
        OR: [
          { id: { startsWith: prefix } },
          templateTitles.length ? { title: { in: templateTitles } } : undefined,
        ].filter(Boolean),
      },
      select: {
        id: true,
        title: true,
        category: true,
        points: true,
        status: true,
        progress: true,
        completionDate: true,
        startDate: true,
        selectedOption: true,
        updatedAt: true,
      },
    });

    const dbTemplateIds = new Set();
    const idsToDelete = [];
    const duplicatesToDelete = [];
    let duplicatedTemplateGoalsFixed = 0;

    for (const row of dbGoals) {
      const suffix = templateSuffixFromGoalId(row.id, String(userId));
      if (!suffix) continue; // не трогаем кастомные/нестандартные
      dbTemplateIds.add(suffix);
      if (!expectedTemplateIds.has(suffix)) {
        idsToDelete.push(row.id);
      }
    }

    const missingTemplateIds = [...expectedTemplateIds].filter((id) => !dbTemplateIds.has(id));

    // Repair дублей: для каждого templateId оставляем одну каноничную цель `${userId}_${tplId}`.
    // Если есть legacy-цель с тем же title, переносим её состояние в каноничную (если она лучше), а legacy удаляем.
    const byTitle = new Map(goalsArray.map((g) => [String(g?.title || ''), String(g?.id || '')]));
    const canonicalByTpl = new Map(); // tplId -> goal row
    for (const row of dbGoals) {
      const suffix = templateSuffixFromGoalId(row.id, String(userId));
      if (suffix) canonicalByTpl.set(suffix, row);
    }

    // группируем legacy-цели по tplId через title->id
    const legacyByTpl = new Map();
    for (const row of dbGoals) {
      const suffix = templateSuffixFromGoalId(row.id, String(userId));
      if (suffix) continue; // canonical
      const tplId = byTitle.get(String(row.title || ''));
      if (!tplId || !isDigits(tplId) || !expectedTemplateIds.has(tplId)) continue;
      const list = legacyByTpl.get(tplId) || [];
      list.push(row);
      legacyByTpl.set(tplId, list);
    }

    const goalsToCreate = [];
    for (const tplId of [...expectedTemplateIds].sort((a, b) => Number(a) - Number(b))) {
      const tpl = goalsById.get(tplId);
      const title = String(tpl?.title || '');
      const points = Number(tpl?.points) || 0;
      const category = tpl?.category || null;
      const canonicalId = `${userId}_${tplId}`;
      const canonical = canonicalByTpl.get(tplId) || null;
      const legacy = legacyByTpl.get(tplId) || [];

      if (!canonical) {
        if (legacy.length) {
          const best = pickBestGoal(legacy);
          goalsToCreate.push({
            id: canonicalId,
            title,
            points,
            status: best.status || 'not_started',
            category,
            progress: Number(best.progress) || 0,
            description: `Шаблонная цель: ${title}`,
            userId: String(userId),
            startDate: best.startDate || null,
            completionDate: best.completionDate || null,
            selectedOption: best.selectedOption ?? null,
          });
          duplicatesToDelete.push(...legacy.map((g) => g.id));
          duplicatedTemplateGoalsFixed += legacy.length;
        } else {
          goalsToCreate.push({
            id: canonicalId,
            title,
            points,
            status: 'not_started',
            category,
            progress: 0,
            description: `Шаблонная цель: ${title}`,
            userId: String(userId),
            startDate: null,
            completionDate: null,
            selectedOption: null,
          });
        }
        continue;
      }

      if (legacy.length) {
        const best = pickBestGoal([canonical, ...legacy]);
        if (best.id !== canonical.id) {
          // переносим прогресс/статус в каноничную цель, но не трогаем шаблонные метаданные
          canonicalByTpl.set(tplId, { ...canonical, status: best.status, progress: best.progress });
          duplicatedTemplateGoalsFixed += legacy.length;
        }
        duplicatesToDelete.push(...legacy.map((g) => g.id));
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const del = idsToDelete.length
        ? await tx.goal.deleteMany({ where: { userId: String(userId), id: { in: idsToDelete } } })
        : { count: 0 };

      // Удаляем legacy-дубли (не трогая кастомные).
      const delDup = duplicatesToDelete.length
        ? await tx.goal.deleteMany({ where: { userId: String(userId), id: { in: duplicatesToDelete } } })
        : { count: 0 };

      // Обновляем каноничные цели только если нужно перенести статус/прогресс из legacy.
      // (Это единственный случай, когда мы изменяем существующую цель — чтобы не потерять прогресс.)
      let updated = 0;
      for (const [tplId, canonical] of canonicalByTpl) {
        const legacy = legacyByTpl.get(tplId) || [];
        if (!legacy.length) continue;
        const best = pickBestGoal([canonical, ...legacy]);
        if (best.id === canonical.id) continue;
        await tx.goal.update({
          where: { id: canonical.id },
          data: {
            status: best.status,
            progress: Number(best.progress) || 0,
            completionDate: best.completionDate || null,
            startDate: best.startDate || null,
            selectedOption: best.selectedOption ?? null,
          },
        });
        updated++;
      }

      const created = goalsToCreate.length
        ? await tx.goal.createMany({ data: goalsToCreate, skipDuplicates: true })
        : { count: 0 };

      return { deleted: del.count, deletedDuplicates: delDup.count, created: created.count, updated };
    });

    return NextResponse.json({
      ok: true,
      deleted: result.deleted,
      deletedDuplicates: result.deletedDuplicates,
      updated: result.updated,
      created: result.created,
      missingTemplateIds,
      deletedGoalIds: idsToDelete,
      duplicatedTemplateGoalsFixed,
    });
  } catch (error) {
    console.error('Error in /api/sync-goals/[userId]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

