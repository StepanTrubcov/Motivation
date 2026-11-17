import { getAchievements, initializeAchievements, achievementNewStatus, makingPicture } from "@/lib/api/Api";
import { ACHIEVEMENT_TEMPLATES } from "@/lib/achievementTemplates.mjs";
import { checkAll } from '@/utils/checkAll/checkAll';
import { createBackgroundCheckQueue } from '@/lib/backgroundCheckQueue.mjs';

const backgroundChecks = new Map();

export const checkAchievementsInBackground = (userId) => (dispatch, getState) => {
    if (!userId) return;
    if (!backgroundChecks.has(userId)) {
        const triggered = { current: new Set() };
        const belongsToCurrentUser = () => getState().profile?.profile?.id === userId;
        backgroundChecks.set(userId, createBackgroundCheckQueue(async () => {
            if (!belongsToCurrentUser()) return;
            const achievements = await getAchievements(userId);
            if (!belongsToCurrentUser()) return;
            const state = getState();
            const user = state.profile.profile;
            if (state.goals.goals.some(goal => goal.userId && String(goal.userId) !== String(userId))) return;
            let unlocked = false;
            await checkAll(achievements, triggered, state.goals.goals, async (achievement) => {
                if (!belongsToCurrentUser()) throw new Error('Account changed during achievement check');
                await achievementNewStatus(achievement, userId);
                unlocked = true;
            }, userId, user.registrationDate, user.pts);
            const refreshed = unlocked ? await getAchievements(userId) : achievements;
            if (belongsToCurrentUser()) dispatch(setAssignments(refreshed));
            // A newly unlocked achievement can complete the collection too.
            if (unlocked && belongsToCurrentUser()) dispatch(checkAchievementsInBackground(userId));
        }, error => console.error('Фоновая проверка ачивок не завершена:', error)));
    }
    const queue = backgroundChecks.get(userId);
    return queue().finally(() => {
        if (backgroundChecks.get(userId) === queue && queue.isIdle()) backgroundChecks.delete(userId);
    });
};

const SET_ASSIGNMENTS = 'assignments/SET_ASSIGNMENTS';
const SET_ASSIGNMENTS_LOADED = 'assignments/SET_ASSIGNMENTS_LOADED';

const initial = {
    ownerId: null,
    assignments: [],
    assignmentsLoaded: false // Новое состояние для отслеживания загрузки достижений
};

const AssignmentsReducer = (state = initial, action) => {
    switch (action.type) {
        case "profile/SET_PROFILE":
            return state.ownerId === action.user?.id ? state : { ...initial, ownerId: action.user?.id || null };
        case SET_ASSIGNMENTS:
            return { ...state, assignments: action.assignments, assignmentsLoaded: true };
        case SET_ASSIGNMENTS_LOADED:
            return { ...state, assignmentsLoaded: action.loaded };
        default:
            return state;
            
    }
};

const setAssignments = (assignments) => ({
    type: SET_ASSIGNMENTS,
    assignments,
});

export const getAchievementsData = (customUserId) => async (dispatch, getState) => {
    try {
        const response = await getAchievements(customUserId);
        if (getState().profile?.profile?.id === customUserId) dispatch(setAssignments(response));
    } catch (error) {
        console.error("Ошибка загрузки достижений:", error);
        throw error;
    }
}

export const getInitializeAchievementsData = (customUserId) => async (dispatch) => {
    try {
        await initializeAchievements(customUserId);
        dispatch(getAchievementsData(customUserId));
    } catch (error) {
        console.error("Ошибка инициализации достижений:", error);
        // Даже в случае ошибки устанавливаем флаг загрузки
        throw error;
    }
}

// Lazy init: GET → (если не хватает templateId) POST initialize → GET.
export const ensureAchievementsInitialized = (userId) => async (dispatch, getState) => {
  try {
    const required = ACHIEVEMENT_TEMPLATES.map((achievement) => `v2:${achievement.id}`);
    const first = await getAchievements(userId);

    const firstArr = Array.isArray(first) ? first : [];
    if (firstArr.length && firstArr.every(a => a.catalogBacked)) {
      const records = firstArr.every(a => a.catalogInitialized) ? firstArr : (await initializeAchievements(userId), await getAchievements(userId));
      if (!records.length || !records.every(a => a.catalogBacked && a.catalogInitialized)) throw new Error('Каталог ачивок загружен не полностью');
      if (getState().profile?.profile?.id === userId) dispatch(setAssignments(records));
      return { didInit: !firstArr.every(a => a.catalogInitialized), missingTemplateIds: [] };
    }
    const tpl = new Set(firstArr.map((a) => String(a?.templateId || '')).filter(Boolean));
    const missing = required.filter((id) => !tpl.has(id));
    const hasStaleRows = firstArr.some((achievement) => {
      const template = ACHIEVEMENT_TEMPLATES.find(t => `v2:${t.id}` === achievement.templateId);
      return !template || template.requirement !== achievement.requirement || template.target !== achievement.target || JSON.stringify(template.goalIds) !== JSON.stringify(achievement.goalIds);
    });

    // Если каталог уже точный, не трогаем POST вообще.
    if (missing.length === 0 && !hasStaleRows && firstArr.length === required.length) {
      if (getState().profile?.profile?.id === userId) dispatch(setAssignments(firstArr));
      return { didInit: false, missingTemplateIds: [] };
    }

    await initializeAchievements(userId);
    const second = await getAchievements(userId);
    const secondArr = Array.isArray(second) ? second : [];
    const received = new Set(secondArr.map(a => a.templateId));
    if (required.some(id => !received.has(id))) throw new Error("Каталог ачивок загружен не полностью");
    if (getState().profile?.profile?.id === userId) dispatch(setAssignments(secondArr));
    return { didInit: true, missingTemplateIds: missing };
  } catch (error) {
    console.error("Ошибка ensureAchievementsInitialized:", error);
    throw error;
  }
};

export const getAchievementsNewStatus = (achievement, userId) => async (dispatch) => {
  const res = await achievementNewStatus(achievement, userId);
  await dispatch(getAchievementsData(userId));
  return res;
};

export const getMakingPicture = (isModalOpen, username) => async (dispatch) => {
   const imageUrl = await makingPicture(isModalOpen, username);
   return {
     data: {
       url: imageUrl
     }
   };
}

export default AssignmentsReducer;
