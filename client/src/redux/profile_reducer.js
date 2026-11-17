import { addProfileApi, initializeUserGoals, addPoints, removePoints } from '@/lib/api/Api';
import { getAllGoals } from '@/lib/api/Api';

const SET_PROFILE = 'profile/SET_PROFILE';
const THE_FIRST_TIME = 'profile/THE_FIRST_TIME';

const initial = {
    profile: null,
    theFirstTime: false,
};

const ProfileReducer = (state = initial, action) => {
    switch (action.type) {
        case 'goals/LIFECYCLE_COMMITTED':
        case 'goals/COMPLETION_COMMITTED':
            return state.profile?.id === action.user.id ? { ...state,
                profile: { ...state.profile, pts: action.user.pts, savingGoals: action.user.savingGoals } } : state;
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

let profileRequest = 0;
export const addProfile = () => async (dispatch) => {
    const request = ++profileRequest;
    const user = await addProfileApi();
    if (!user?.id) throw new Error('Не удалось загрузить профиль');
    if (user.storageVersion !== 1) {
        const existing = await getAllGoals(user.id);
        await initializeUserGoals(user.id);
        if (!existing.length && request === profileRequest) dispatch(setTheFirstTime(true));
    }
    if (request === profileRequest) dispatch(setProfile(user));
    return user;
};

export const setPoints = (customUserId, points) => async (dispatch) => {
    await addPoints(customUserId, points).then(() => {
        dispatch(addProfile());
    });
};

export const deletePoints = (customUserId, points) => async (dispatch) => {
    await removePoints(customUserId, points).then(() => {
        dispatch(addProfile());
    });
};

export default ProfileReducer;
