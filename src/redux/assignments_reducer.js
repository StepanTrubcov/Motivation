import { getAchievements, initializeAchievements } from "../Api/Api";

const SET_ASSIGNMENTS = 'assignments/SET_ASSIGNMENTS';

const initial = {
    assignments: []
};

const AssignmentsReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_ASSIGNMENTS:
            return { ...state, assignments: action.assignments };
        default:
            return state;
    }
};

const setAssignments = (assignments) => ({
    type: SET_ASSIGNMENTS,
    assignments,
});

export const getAchievementsData = (customUserId) => async (dispatch) => {
    await getAchievements(customUserId).then(response => {
        dispatch(setAssignments(response))
        
    })
}

export const getInitializeAchievementsData = (customUserId) => async (dispatch) => {
    await initializeAchievements(customUserId).then(response => {
        dispatch(getAchievementsData(customUserId))
    })
}

export default AssignmentsReducer;