import { addProfileApi, initializeUserGoals, addPoints } from '@/lib/api/Api';
import { getAllGoals } from '@/lib/api/Api';

const SET_PROFILE = 'profile/SET_PROFILE';
const THE_FIRST_TIME = 'profile/THE_FIRST_TIME';

const initial = {
    profile: null,
    theFirstTime: false,
};

const ProfileReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_PROFILE:
            return { ...state, profile: action.user };
        case THE_FIRST_TIME:
            return { ...state, theFirstTime: action.time };
        default:
            return state;
    }
};

export const setTheFirstTime = (time) => ({
    type: THE_FIRST_TIME,
    time,
});

const setProfile = (user) => ({
    type: SET_PROFILE,
    user: user,
})

export const addProfile = () => async (dispatch) => {
    await addProfileApi().then(async response => {
        dispatch(setProfile(response));
        
        // Проверяем, есть ли уже цели у пользователя, прежде чем инициализировать
        if (response && response.id) {
            try {
                const existingGoals = await getAllGoals(response.id);
                // Инициализируем цели только если их еще нет
                if (!existingGoals || existingGoals.length === 0) {
                    const initialized = await initializeUserGoals(response.id);
                    if (initialized) {
                        dispatch(setTheFirstTime(true));
                    }
                }
            } catch (error) {
                console.error("Ошибка проверки целей пользователя:", error);
                // В случае ошибки всё равно пытаемся инициализировать
                initializeUserGoals(response.id).then(response => {
                    if (response) {
                        dispatch(setTheFirstTime(true));
                    }
                });
            }
        }
    });
};

export const setPoints = (customUserId, points) => async (dispatch) => {
    await addPoints(customUserId, points).then(response => {
        dispatch(addProfile());
    });
};

export default ProfileReducer;