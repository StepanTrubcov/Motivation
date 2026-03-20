import { prisma } from '@/lib/prisma/prismaPostgresClient';
import { NextResponse } from 'next/server';
import { goalsTranslations } from '@/utils/goalsTranslations';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;

    // Определяем язык интерфейса по настройке пользователя в БД.
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { language: true },
    });
    const lang = user?.language === 'ang' ? 'en' : 'ru'; // DB: rus/ang -> UI: ru/en
    const translations = goalsTranslations[lang] || goalsTranslations.ru;

    // Получаем все цели пользователя
    const goals = await prisma.goal.findMany({
      where: { userId: String(userId) }
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Проверяем только цели, которые могут нуждаться в обновлении
    const goalsToUpdate = [];
    const updatedGoals = [];

    for (const goal of goals) {
      let updatedGoal = { ...goal };
      let needsUpdate = false;

      if (goal.status === 'in_progress' && goal.startDate) {
        const startDate = new Date(goal.startDate);
        const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        // Используем значение selectedOption, если оно установлено (включая 0), иначе используем значение по умолчанию 30
        const selectedOption = (goal.selectedOption !== null && goal.selectedOption !== undefined) ? goal.selectedOption : 30;

        if (daysDiff >= selectedOption) {
          updatedGoal = {
            ...goal,
            status: 'not_started',
            startDate: null,
            completionDate: null,
            selectedOption: 0,
          };
          needsUpdate = true;
        }
      }
      else if (goal.status === 'completed' && goal.completionDate) {
        const completionDate = new Date(goal.completionDate);

        // Переводим в статус in_progress только если дата завершения была вчера или раньше
        if (completionDate < startOfToday) {
          updatedGoal = {
            ...goal,
            status: 'in_progress',
            completionDate: null
          };
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        goalsToUpdate.push({
          id: String(goal.id),
          data: updatedGoal
        });
        updatedGoals.push(updatedGoal);
      } else {
        updatedGoals.push(goal);
      }
    }

    // Обновляем только те цели, которые действительно нуждаются в обновлении
    for (const goalToUpdate of goalsToUpdate) {
      await prisma.goal.update({
        where: { id: goalToUpdate.id },
        data: {
          status: goalToUpdate.data.status,
          startDate: goalToUpdate.data.startDate,
          completionDate: goalToUpdate.data.completionDate
        }
      });
    }

    // Переводим только стандартные цели (id вида `${userId}_${goalId}`).
    const translatedGoals = updatedGoals.map((goal) => {
      const m = String(goal.id).match(/(\d+)$/);
      const goalIdSuffix = m?.[1];
      if (!goalIdSuffix) return goal;

      const tr = translations?.[goalIdSuffix];
      if (!tr) return goal;

      return {
        ...goal,
        title: tr.title ?? goal.title,
        description: tr.description ?? goal.description,
      };
    });

    return NextResponse.json(translatedGoals);
  } catch (error) {
    console.error('Error in /api/check-completion/:userId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}