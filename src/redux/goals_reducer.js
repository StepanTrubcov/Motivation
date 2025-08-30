import { getAllGoals, getAllStatus, checkGoalCompletion } from '../Api/Api';

const SET_GOALS = 'goals/SET_GOALS';

const initial = {
    goals: [],
    ThereAreUsers: false,
};

const GoalsReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_GOALS:
            return { ...state, goals: action.goals, ThereAreUsers: true };
        default:
            return state;
    }
};

const setGoals = (goals) => ({
    type: SET_GOALS,
    goals,
});


export const addGoals = (userId) => async (dispatch) => {
    await getAllGoals(userId).then(response => {
        if (response.length != 0) {
            dispatch(setGoals(response))
        }
    })
}

export const addStatusNew = (goalId, userId, newStatus) => async (dispatch) => {
    await getAllStatus(userId, goalId, newStatus,).then(response => {
        dispatch(addGoals(userId))
    })
}

export const addStatus = (userId) => async (dispatch) => {
    await checkGoalCompletion(userId).then(response => {
        if (response.length != 0) {
            dispatch(setGoals(response))
        }
    })
}

export default GoalsReducer;