import { getAchievements, initializeAchievements, achievementNewStatus, makingPicture, clearAchievementImages } from "@/lib/api/Api";

const SET_ASSIGNMENTS = 'assignments/SET_ASSIGNMENTS';
const SET_ASSIGNMENTS_LOADED = 'assignments/SET_ASSIGNMENTS_LOADED';

const initial = {
    assignments: [],
    assignmentsLoaded: false // Новое состояние для отслеживания загрузки достижений
};

const AssignmentsReducer = (state = initial, action) => {
    switch (action.type) {
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

const setAssignmentsLoaded = (loaded) => ({
    type: SET_ASSIGNMENTS_LOADED,
    loaded,
});

export const getAchievementsData = (customUserId) => async (dispatch) => {
    try {
        const response = await getAchievements(customUserId);
        dispatch(setAssignments(response));
    } catch (error) {
        console.error("Ошибка загрузки достижений:", error);
        dispatch(setAssignments([]));
    }
}

export const getInitializeAchievementsData = (customUserId) => async (dispatch) => {
    try {
        await initializeAchievements(customUserId);
        dispatch(getAchievementsData(customUserId));
    } catch (error) {
        console.error("Ошибка инициализации достижений:", error);
        // Даже в случае ошибки устанавливаем флаг загрузки
        dispatch(setAssignmentsLoaded(true));
    }
}

// Lazy init: сначала GET, и только если пусто — POST initialize и снова GET.
export const ensureAchievementsInitialized = (userId) => async (dispatch) => {
  try {
    const required = Array.from({ length: 30 }, (_, i) => String(i + 1));
    const first = await getAchievements(userId);

    const firstArr = Array.isArray(first) ? first : [];
    const tpl = new Set(firstArr.map((a) => String(a?.templateId || '')).filter(Boolean));
    const missing = required.filter((id) => !tpl.has(id));

    // Если у пользователя уже есть все шаблонные templateId — не трогаем POST вообще.
    if (missing.length === 0 && firstArr.length > 0) {
      dispatch(setAssignments(firstArr));
      return { didInit: false, missingTemplateIds: [] };
    }

    await initializeAchievements(userId);
    const second = await getAchievements(userId);
    const secondArr = Array.isArray(second) ? second : [];
    dispatch(setAssignments(secondArr));
    return { didInit: true, missingTemplateIds: missing };
  } catch (error) {
    console.error("Ошибка ensureAchievementsInitialized:", error);
    dispatch(setAssignments([]));
    // setAssignments выставляет assignmentsLoaded=true
    return { didInit: false, error: true };
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