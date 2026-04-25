import { addProfileApi, initializeUserGoals, syncUserGoals, TEMPLATE_GOALS_ARRAY, addPoints, removePoints } from '@/lib/api/Api';
import { getAllGoals } from '@/lib/api/Api';
import { addGoals } from './goals_reducer';

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

        if (response && response.id) {
            try {
                const existingGoals = await getAllGoals(response.id);
                if (!existingGoals || existingGoals.length === 0) {
                    const initialized = await initializeUserGoals(response.id);
                    dispatch(addGoals(response.id));
                    if (initialized) {
                        dispatch(setTheFirstTime(true));
                    }
                } else {
                    // Sync template goals: delete removed, add missing, do not touch existing statuses/progress.
                    try {
                        const expected = new Set(TEMPLATE_GOALS_ARRAY.map((g) => String(g.id)));
                        const dbTemplate = new Set(
                            existingGoals
                                .map((g) => {
                                    const id = String(g?.id || '');
                                    const prefix = `${response.id}_`;
                                    if (!id.startsWith(prefix)) return null;
                                    const suffix = id.slice(prefix.length);
                                    return /^\d+$/.test(suffix) ? suffix : null;
                                })
                                .filter(Boolean)
                        );
                        let needsSync = false;
                        for (const id of expected) if (!dbTemplate.has(id)) { needsSync = true; break; }
                        if (!needsSync) for (const id of dbTemplate) if (!expected.has(id)) { needsSync = true; break; }

                        if (needsSync) {
                            await syncUserGoals(response.id);
                        }
                    } catch (e) {
                        console.error('Ошибка синхронизации шаблонных целей:', e);
                    }
                    dispatch(addGoals(response.id));
                }
            } catch (error) {
                console.error("Ошибка проверки целей пользователя:", error);
                initializeUserGoals(response.id).then((initialized) => {
                    dispatch(addGoals(response.id));
                    if (initialized && response) {
                        dispatch(setTheFirstTime(true));
                    }
                });
            }
        }
    });
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