/**
 * Нормализует ID цели к «базовому» числовому id (как в шаблоне целей: "1", "68").
 * Поддерживает составные id вида `${userId}_1` или cuid с числовым суффиксом.
 */
export function normalizeGoalIdFromGoal(goal) {
  if (!goal || goal.id == null) return null;
  const id = String(goal.id);
  const m = id.match(/(\d+)$/);
  return m ? m[1] : id;
}

function isNumericGoalIdToken(s) {
  return typeof s === 'string' && /^\d+$/.test(s.trim());
}

/**
 * Цели, относящиеся к achievement.goalIds:
 * - если токен только цифры — матч по normalizeGoalIdFromGoal(goal)
 * - иначе — legacy: матч по goal.title (старые данные в БД)
 */
function goalsMatchingAchievementGoalIds(goals, goalIds) {
  if (!Array.isArray(goals) || !Array.isArray(goalIds)) return [];

  return goals.filter((g) => {
    const norm = normalizeGoalIdFromGoal(g);
    return goalIds.some((token) => {
      const t = typeof token === 'string' ? token.trim() : String(token);
      if (isNumericGoalIdToken(t)) return norm === t;
      return g.title === t;
    });
  });
}

/**
 * Проверка unlock ачивок. newStatusAssignment может быть async — после успеха добавляем id в triggeredRef.
 */
export async function checkAll(
  assignments,
  triggeredRef,
  goals,
  newStatusAssignment,
  userId,
  userRegistrationStub,
  userPts
) {
  try {
    const registrationDate = userRegistrationStub ? new Date(userRegistrationStub) : null;
    const registrationValid =
      registrationDate && !Number.isNaN(registrationDate.getTime());

    if (!Array.isArray(assignments)) {
      console.error('Assignments is not an array:', assignments);
      return;
    }

    if (!Array.isArray(goals)) {
      console.error('Goals is not an array:', goals);
      return;
    }

    for (const achievement of assignments) {
      try {
        const aid = String(achievement.id);
        if (achievement.status === 'my') continue;
        if (triggeredRef.current.has(aid)) continue;

        if (achievement.type === 'level_based') {
          const { calcLevelFromPts } = await import('@/utils/levels');
          const lvl = calcLevelFromPts(userPts);
          const targetLvl = Number(achievement.target || 0);
          if (targetLvl > 0 && lvl >= targetLvl) {
            try {
              await newStatusAssignment(achievement, userId);
              triggeredRef.current.add(aid);
            } catch (e) {
              console.error(`Unlock failed for level_based achievement ${aid}:`, e);
            }
          }
          continue;
        }

        if (achievement.type === 'goal_based' && Array.isArray(achievement.goalIds)) {
          const related = goalsMatchingAchievementGoalIds(goals, achievement.goalIds);

          if (!related.length) continue;

          let progressSum = 0;
          related.forEach((goal) => {
            progressSum += Number(goal.progress) || 0;
          });

          if (progressSum >= Number(achievement.target || 0)) {
            try {
              await newStatusAssignment(achievement, userId);
              triggeredRef.current.add(aid);
            } catch (e) {
              console.error(`Unlock failed for achievement ${aid}:`, e);
            }
          }
          continue;
        }

        if (achievement.type === 'time_based') {
          if (!registrationValid) continue;

          const diffDays = Math.floor(
            (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const target = Number(achievement.target || 0);

          if (diffDays >= target) {
            try {
              await newStatusAssignment(achievement, userId);
              triggeredRef.current.add(aid);
            } catch (e) {
              console.error(`Unlock failed for time_based achievement ${aid}:`, e);
            }
          }
        }
      } catch (achievementError) {
        console.error(
          `Error processing achievement ${achievement?.title || achievement?.id}:`,
          achievementError
        );
      }
    }
  } catch (error) {
    console.error('Error in checkAll function:', error);
  }
}
