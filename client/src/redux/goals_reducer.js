import { getUserSavingGoals, getAllGoals, getAllStatus, checkGoalCompletion, addCustomGoal, addSavingGoal, updateSavingGoalStatus, removeSavingGoalFromToday } from '@/lib/api/Api';

const SET_GOALS = 'goals/SET_GOALS';
const UPDATE_GOAL_STATUS = 'goals/UPDATE_GOAL_STATUS';
const SET_TIME_GOALS_SAVING = 'goals/SET_TIME_GOALS_SAVING'

const initial = {
    goals: [],
    ThereAreUsers: false,
    timeGoalsSaving: null,
};

const GoalsReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_GOALS:
            return { ...state, goals: action.goals, ThereAreUsers: true };
        case UPDATE_GOAL_STATUS:
            return {
                ...state,
                goals: state.goals.map(goal =>
                    goal.id === action.goalId ? { ...goal, status: action.status } : goal
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

const updateGoalStatus = (goalId, status) => ({
    type: UPDATE_GOAL_STATUS,
    goalId,
    status
});

export const addGoals = (userId) => async (dispatch) => {
    try {
        const response = await getAllGoals(userId);
        dispatch(setGoals(response || []));
    } catch (error) {
        console.error("Ошибка загрузки целей:", error);
        dispatch(setGoals([]));
    }
};

export const addStatusNew = (goalId, userId, newStatus, selectedOption = null) => async (dispatch) => {
    try {
        await getAllStatus(userId, goalId, newStatus, selectedOption);
        dispatch(updateGoalStatus(goalId, newStatus));
    } catch (error) {
        console.error(`Ошибка обновления статуса цели ${goalId}:`, error);
        dispatch(addGoals(userId));
    }
};

export const addStatus = (userId) => async (dispatch) => {
    try {
        const response = await checkGoalCompletion(userId);
        if (response && response.length !== 0) {
            dispatch(setGoals(response));
        }
    } catch (error) {
        console.error("Ошибка проверки завершения целей:", error);
    }
};

export const NewGoals = (userId, title, goalCategories, resetForm, closeModal) => async (dispatch) => {
    try {
        await addCustomGoal(userId, title, goalCategories);
        dispatch(addGoals(userId));
        resetForm();
        closeModal();
    } catch (error) {
        console.error("Ошибка добавления новой цели:", error);
    }
};

export const newSavingGoal = (telegramId, goalData, targetDate, selectedOption) => async (dispatch) => {
    try {
        const response = await addSavingGoal(telegramId, goalData, targetDate, selectedOption);
        if (!response.success) {
            console.error('Ошибка при добавлении цели в savingGoals:', response.error);
        }
    } catch (e) {
        console.error('Ошибка при добавлении цели в массив savingGoal:', e);
    }
};

export const newStatusSavingGoal = (telegramId, date, goalId, newStatus) => async (dispatch) => {
    try {
        const response = await updateSavingGoalStatus(telegramId, date, goalId, newStatus);
        if (response.success) {
            await dispatch(setTimeGoalsSaving(response.data.savingGoals));
        } else {
            console.error('Ошибка при обновлении статуса цели в savingGoals:', response.error);
        }
        return response;
    } catch (e) {
        console.error('Ошибка при изменении статуса у цели в массиве savingGoal:', e);
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

export const checkTimeGoalsSaving = (userId) => async (dispatch) => {
    try {
        const response = await getUserSavingGoals(userId);
        const raw = response?.savingGoals;
        const savingGoals =
            raw != null && Array.isArray(raw) ? raw : [];
        dispatch(setTimeGoalsSaving(savingGoals));
    } catch (e) {
        console.error('Ошибка при проверки даты:', e);
        dispatch(setTimeGoalsSaving([]));
    }
}

export default GoalsReducer;