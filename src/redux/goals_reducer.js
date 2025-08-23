import { getAllGoals, getAllStatus } from '../Api/Api';
import { db } from '../lib/firebase';

const SET_GOALS = 'goals/SET_GOALS'
const THE_FIRST_TIME = 'goals/THE_FIRST_TIME'

const initial = {
    goals: [],
    ThereAreUsers: false,
    TheFirstTime: false,
}


const GoalsReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_GOALS:
            return { ...state, goals: action.goals, ThereAreUsers: true }
        case THE_FIRST_TIME:
            return { ...state, TheFirstTime: true }
        default:
            return state;
    }
}

const setGoals = (goals) => ({
    type: SET_GOALS,
    goals: goals,
})

export const setTheFirstTime = () => ({
    type: SET_GOALS,
})

export const addGoals = (userId) => async (dispath) => {
    await getAllGoals(db, userId).then(response => {
        dispath(setGoals(response))
    })
}

export const addStatusNew = (goalId, userId, newStatus) => async (dispath) => {
    await getAllStatus(db, userId, goalId, newStatus,).then(response => {
        dispath(addGoals(userId))
    })
}

export default GoalsReducer;