import { getGeneraleText } from "../Api/Api";


const SET_GENERATION_TEXT = 'generation/SET_GENERATION_TEXT';
const SET_GENERATION_TEXT_YESTERDAY = 'generation/SET_GENERATION_TEXT_YESTERDAY';

const initial = {
    generationText: null,
    generationTextYesterday: null,
    nerationIsOverYesterday: false,
    nerationIsOver: false,
};

const GenerationReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_GENERATION_TEXT:
            return { ...state, generationText: action.generationText, nerationIsOver: true };
        case SET_GENERATION_TEXT_YESTERDAY:
            return { ...state, generationTextYesterday: action.generationText, nerationIsOverYesterday: true };
        default:
            return state;
    }
};

const setTextData = (generationText) => ({
    type: SET_GENERATION_TEXT,
    generationText,
});


export const addTextGenerationData = (telegramId, goalsDone, goalsInProgress, setGeneratedText, setLoading, loading = false) => async (dispatch) => {
    await getGeneraleText(telegramId, goalsDone, goalsInProgress).then(response => {
        dispatch(setTextData(response))
        if (!loading) {
            setGeneratedText(response)
            setLoading(false)
        }
    })
}


export default GenerationReducer;