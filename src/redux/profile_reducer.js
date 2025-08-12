
const SET_PROFILE = 'profile/SET_PROFILE'

const initial = {
    profile: {},
    name: 'stepan',
    avatar: 'https://www.shutterstock.com/image-vector/avatar-photo-default-user-icon-600nw-2345549599.jpg',
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

export default ProfileReducer