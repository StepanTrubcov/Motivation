import { getAllGoals, getAllStatus } from '../Api/Api';
import { db } from '../lib/firebase';

const SET_GOALS = 'goals/SET_GOALS';
const THE_FIRST_TIME = 'goals/THE_FIRST_TIME';
const THE_FIRST_TIME_FALSE = 'goals/THE_FIRST_TIME_FALSE';

const initial = {
    goals: [],
    ThereAreUsers: false,
    TheFirstTime: false,
};

const GoalsReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_GOALS:
            return { ...state, goals: action.goals, ThereAreUsers: true };
        case THE_FIRST_TIME:
            return { ...state, TheFirstTime: true };
        case THE_FIRST_TIME_FALSE:
            return { ...state, TheFirstTime: false };
        default:
            return state;
    }
};

const setGoals = (goals) => ({
    type: SET_GOALS,
    goals,
});

export const setTheFirstTime = () => ({
    type: THE_FIRST_TIME,
});

export const setTheFirstTimeFalse = () => ({
    type: THE_FIRST_TIME_FALSE,
});

export const addGoals = (userId) => async (dispatch) => {
    await getAllGoals(db, userId).then(response => {
        if (response.length != 0) {
            dispatch(setGoals(response))
        }
    })
}

export const addStatusNew = (goalId, userId, newStatus) => async (dispatch) => {
    await getAllStatus(db, userId, goalId, newStatus,).then(response => {
        dispatch(addGoals(userId))
    })
}

export default GoalsReducer;