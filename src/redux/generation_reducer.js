import { getGeneraleText } from "../Api/Api";


const SET_GENERATION_TEXT = 'generation/SET_GENERATION_TEXT';

const initial = {
    generationText: null,
    nerationIsOver: false,
};

const GenerationReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_GENERATION_TEXT:
            return { ...state, generationText: action.generationText, nerationIsOver: true };
        default:
            return state;
    }
};

const setTextData = (generationText) => ({
    type: SET_GENERATION_TEXT,
    generationText,
});

export const addTextGenerationData = (goalsDone, goalsInProgress, setGeneratedText, setLoading) => async (dispatch) => {
    await getGeneraleText(goalsDone, goalsInProgress).then(response => {
        dispatch(setTextData(response))
        setGeneratedText(response)
        setLoading(false)
    })
}


export default GenerationReducer;