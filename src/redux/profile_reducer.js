import { addProfileApi, initializeUserGoals, addPoints } from '../Api/Api';

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

export const addProfile = () => async (dispath) => {
    await addProfileApi().then(response => {
        dispath(setProfile(response))
        initializeUserGoals(response.id).then(response => {
            if (response) {
                dispath(setTheFirstTime(true))
            }
        })
    })
}

export const setPoints = (customUserId, points) => async (dispath) => {
    await addPoints(customUserId, points).then(response => {
        dispath(addProfile())
    })
}

export default ProfileReducer;