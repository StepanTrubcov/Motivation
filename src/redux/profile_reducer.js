import { addProfileApi } from '../Api/Api';

const SET_PROFILE = 'profile/SET_PROFILE'

const initial = {
    profile: null,
}

const ProfileReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_PROFILE:
            return { ...state, profile: action.user }
        default:
            return state;
    }
}

const setProfile = (user) => ({
    type: SET_PROFILE,
    user: user,
})

export const addProfile = () => async (dispath) => {
    await addProfileApi().then(response => {
        dispath(setProfile(response))
    })
}

export default ProfileReducer