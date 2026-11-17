import { getUserSavingGoals, getAllGoals, getAllStatus, checkGoalCompletion, addCustomGoal, addSavingGoal, updateSavingGoalStatus, removeSavingGoalFromToday, appendSavingGoalsDays, resetSavingGoalsStatuses } from '@/lib/api/Api';
import { saveGoalLifecycle, saveGoalCompletion } from '@/lib/api/Api';
import { beginGoalMutation, goalReadVersion, canApplyGoalRead } from '@/lib/goalMutationClock.mjs';
import { createRetryRequestIds } from '@/lib/retryRequestIds.mjs';

const completionJobs = new Map();
const userQueues = new Map();
const retryIds = createRetryRequestIds();
export const changeGoalCompletion = (userId, goalId, action, date) => (dispatch, getState) => {
    const key = `${userId}:${goalId}:${date || new Date().toISOString().slice(0, 10)}`;
    if (completionJobs.has(key)) return completionJobs.get(key);
    const retryKey = `${key}:${action}`;
    const requestId = retryIds.get(retryKey) || crypto.randomUUID();
    retryIds.set(retryKey, requestId);
    const finish = beginGoalMutation(userId);
    const previous = userQueues.get(userId) || Promise.resolve();
    const job = previous.catch(() => {}).then(async () => {
        const result = await saveGoalCompletion(userId, goalId, action, requestId, date);
        retryIds.delete(retryKey);
        if (getState().profile?.profile?.id === userId) {
            dispatch({ type: 'goals/COMPLETION_COMMITTED', ...result });
        }
        return result;
    }).finally(() => {
        finish();
        completionJobs.delete(key);
        if (userQueues.get(userId) === job) userQueues.delete(userId);
    });
    completionJobs.set(key, job);
    userQueues.set(userId, job);
    return job;
};

export const changeGoalLifecycle = (userId, input) => (dispatch, getState) => {
    const key = `${userId}:lifecycle:${input.action}:${input.goalId || input.title}:${input.category || ''}:${input.selectedOption || ''}:${input.durationMinutes || ''}:${input.quantity || ''}:${input.targetTime || ''}`;
    if (completionJobs.has(key)) return completionJobs.get(key);
    const requestId = retryIds.get(key) || crypto.randomUUID();
    retryIds.set(key, requestId);
    const finish = beginGoalMutation(userId);
    const previous = userQueues.get(userId) || Promise.resolve();
    const job = previous.catch(() => {}).then(async () => {
        const result = await saveGoalLifecycle(userId, { ...input, requestId });
        retryIds.delete(key);
        if (getState().profile?.profile?.id === userId) {
            dispatch({ type: 'goals/LIFECYCLE_COMMITTED', ...result });
        }
        return result.goal;
    }).finally(() => {
        finish();
        completionJobs.delete(key);
        if (userQueues.get(userId) === job) userQueues.delete(userId);
    });
    completionJobs.set(key, job);
    userQueues.set(userId, job);
    return job;
};

const SET_GOALS = 'goals/SET_GOALS';
const UPDATE_GOAL_STATUS = 'goals/UPDATE_GOAL_STATUS';
const SET_TIME_GOALS_SAVING = 'goals/SET_TIME_GOALS_SAVING'

const initial = {
    ownerId: null,
    goals: [],
    ThereAreUsers: false,
    timeGoalsSaving: null,
};

const GoalsReducer = (state = initial, action) => {
    switch (action.type) {
        case "profile/SET_PROFILE":
            return state.ownerId === action.user?.id ? state : { ...initial, ownerId: action.user?.id || null };
        case 'goals/LIFECYCLE_COMMITTED':
            return { ...state, timeGoalsSaving: action.user.savingGoals, goals: state.goals.some(g => g.id === action.goal.id)
              ? state.goals.map(g => g.id === action.goal.id ? { ...g, ...action.goal } : g) : [...state.goals, action.goal] };
        case 'goals/COMPLETION_COMMITTED':
            return { ...state, timeGoalsSaving: action.user.savingGoals,
                goals: state.goals.map(goal => goal.id === action.goal.id ? { ...goal,
                    status: action.goal.status, progress: action.goal.progress,
                    completionDate: action.goal.completionDate, startDate: action.goal.startDate } : goal) };
        case SET_GOALS:
            return { ...state, goals: action.goals, ThereAreUsers: true };
        case UPDATE_GOAL_STATUS:
            return {
                ...state,
                goals: state.goals.map(goal =>
                    goal.id === action.goalId ? { ...goal, ...action.updatedGoal, status: action.status } : goal
                )
            };
        case SET_TIME_GOALS_SAVING:
            return { ...state, timeGoalsSaving: action.timeGoalsSaving };
        default:
            return state;
    }
};

const setGoals = (goals) => ({
    type: SET_GOALS,
    goals,
});

const setTimeGoalsSaving = (timeGoalsSaving) => ({
    type: SET_TIME_GOALS_SAVING,
    timeGoalsSaving,
});

const updateGoalStatus = (goalId, status, updatedGoal) => ({
    type: UPDATE_GOAL_STATUS,
    goalId,
    status,
    updatedGoal,
});

export const addGoals = (userId) => async (dispatch, getState) => {
    const version = goalReadVersion(userId);
    try {
        const response = await getAllGoals(userId);
        if (getState().profile?.profile?.id === userId && canApplyGoalRead(userId, version)) dispatch(setGoals(response || []));
    } catch (error) {
        console.error("Ошибка загрузки целей:", error);
        throw error;
    }
};

export const addStatusNew = (goalId, userId, newStatus, selectedOption = null, timeSettings = {}) => async (dispatch) => {
    try {
        const updatedGoal = await getAllStatus(userId, goalId, newStatus, selectedOption, timeSettings);
        const progressFields = updatedGoal ? {
            progress: updatedGoal.progress,
            startDate: updatedGoal.startDate,
            completionDate: updatedGoal.completionDate,
            selectedOption: updatedGoal.selectedOption,
        } : undefined;
        dispatch(updateGoalStatus(goalId, updatedGoal?.status || newStatus, progressFields));
    } catch (error) {
        console.error(`Ошибка обновления статуса цели ${goalId}:`, error);
        throw error;
    }
};

export const addStatus = (userId) => async (dispatch, getState) => {
    const version = goalReadVersion(userId);
    try {
        const response = await checkGoalCompletion(userId);
        if (Array.isArray(response) && getState().profile?.profile?.id === userId && canApplyGoalRead(userId, version)) {
            dispatch(setGoals(response));
        }
    } catch (error) {
        console.error("Ошибка проверки завершения целей:", error);
        throw error;
    }
};

export const NewGoals = (userId, title, goalCategories) => async (dispatch) => {
    try {
        const createdGoal = await addCustomGoal(userId, title, goalCategories);
        await dispatch(addGoals(userId));
        return createdGoal;
    } catch (error) {
        console.error("Ошибка добавления новой цели:", error);
        throw error;
    }
};

export const newSavingGoal = (telegramId, goalData, targetDate, selectedOption) => async (dispatch) => {
    try {
        const response = await addSavingGoal(telegramId, goalData, targetDate, selectedOption);
        if (!response.success) {
            throw new Error(response.error || 'Не удалось сохранить цель в календаре');
        }
        return response;
    } catch (e) {
        console.error('Ошибка при добавлении цели в массив savingGoal:', e);
        throw e;
    }
};

export const newStatusSavingGoal = (telegramId, date, goalId, newStatus) => async (dispatch) => {
    try {
        const response = await updateSavingGoalStatus(telegramId, date, goalId, newStatus);
        if (response.success) {
            await dispatch(setTimeGoalsSaving(response.data.savingGoals));
        } else {
            throw new Error(response.error || 'Не удалось обновить цель');
        }
        return response;
    } catch (e) {
        console.error('Ошибка при изменении статуса у цели в массиве savingGoal:', e);
        throw e;
    }
}

export const deleteGoalsSaving = (userId, goalId) => async (dispatch) => {
    try {
        await removeSavingGoalFromToday(userId, goalId);
        dispatch(checkTimeGoalsSaving(userId));
    } catch (e) {
        console.error('Ошибка при удалении целей из массива savingGoal:', e);
        throw e;
    }
}

export const appendGoalsSavingDays = (userId) => async (dispatch) => {
    try {
        const response = await appendSavingGoalsDays(userId);
        if (response.success) {
            dispatch(setTimeGoalsSaving(response.data?.savingGoals ?? []));
        }
        return response;
    } catch (e) {
        console.error('Ошибка при дописывании дней savingGoals:', e);
        return { success: false, error: e.message };
    }
};

export const resetGoalsSavingStatuses = (telegramId) => async (dispatch, getState) => {
    try {
        const response = await resetSavingGoalsStatuses(telegramId);
        if (response.success) {
            dispatch(setTimeGoalsSaving(response.data?.savingGoals ?? []));
            const userDbId = getState()?.profile?.profile?.id;
            if (userDbId) {
                await dispatch(addGoals(userDbId));
                await dispatch(addStatus(userDbId));
            }
        }
        return response;
    } catch (e) {
        console.error('Ошибка при сбросе статусов savingGoals:', e);
        return { success: false, error: e.message };
    }
};

export const checkTimeGoalsSaving = (userId) => async (dispatch, getState) => {
    const owner = getState().profile?.profile?.id;
    const version = goalReadVersion(owner);
    try {
        const response = await getUserSavingGoals(userId);
        const raw = response?.savingGoals;
        const savingGoals =
            raw != null && Array.isArray(raw) ? raw : [];
        if (getState().profile?.profile?.id === owner && canApplyGoalRead(owner, version)) dispatch(setTimeGoalsSaving(savingGoals));
    } catch (e) {
        console.error('Ошибка при проверки даты:', e);
        throw e;
    }
}

export default GoalsReducer;
