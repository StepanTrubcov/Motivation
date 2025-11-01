import { getAllGoals, getAllStatus, checkGoalCompletion, addCustomGoal } from '@/lib/api/Api';

const SET_GOALS = 'goals/SET_GOALS';
const UPDATE_GOAL_STATUS = 'goals/UPDATE_GOAL_STATUS';

const initial = {
    goals: [],
    ThereAreUsers: false,
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
        default:
            return state;
    }
};

const setGoals = (goals) => ({
    type: SET_GOALS,
    goals,
});

const updateGoalStatus = (goalId, status) => ({
    type: UPDATE_GOAL_STATUS,
    goalId,
    status
});

export const addGoals = (userId) => async (dispatch) => {
    try {
        const response = await getAllGoals(userId);
        if (response && response.length !== 0) {
            dispatch(setGoals(response));
        }
    } catch (error) {
        console.error("Ошибка загрузки целей:", error);
    }
};

export const addStatusNew = (goalId, userId, newStatus) => async (dispatch) => {
    try {
        await getAllStatus(userId, goalId, newStatus);
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

export default GoalsReducer;