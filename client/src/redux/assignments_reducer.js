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
        let achievements = await getAchievements(customUserId);
        const isEmpty = !Array.isArray(achievements) || achievements.length === 0;
        if (isEmpty) {
            await initializeAchievements(customUserId);
            achievements = await getAchievements(customUserId);
        }
        dispatch(setAssignments(Array.isArray(achievements) ? achievements : []));
    } catch (error) {
        console.error("Ошибка загрузки/инициализации достижений:", error);
        dispatch(setAssignments([]));
        dispatch(setAssignmentsLoaded(true));
    }
}

export const getAchievementsNewStatus = (achievement, userId) => async (dispatch) => {
    await achievementNewStatus(achievement, userId).then(response => {
         dispatch(getAchievementsData(userId))
    })
}

export const getMakingPicture = (isModalOpen, username) => async (dispatch) => {
   const imageUrl = await makingPicture(isModalOpen, username);
   return {
     data: {
       url: imageUrl
     }
   };
}

export default AssignmentsReducer;