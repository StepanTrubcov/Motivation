import { addCompletedDate, getCompletedDates } from "@/lib/api/Api";


const SET_CALENDAR = 'calender/SET_CALENDAR';

const initial = {
    calendarData: [

    ]
};

const CalendarReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_CALENDAR:
            return { ...state, calendarData: action.calendarData };
        default:
            return state;
    }
};

const setCalendarData = (calendarData) => ({
    type: SET_CALENDAR,
    calendarData,
});

export const addCalendarData = (customUserId) => async (dispatch) => {
    await getCompletedDates(customUserId).then(response => {
        dispatch(setCalendarData(response))
    })
}

export const addCalendarDataNew = (customUserId, date) => async (dispatch) => {
    await addCompletedDate(customUserId, date).then(response => {
        dispatch(addCalendarData(customUserId))
    })
}


export default CalendarReducer;