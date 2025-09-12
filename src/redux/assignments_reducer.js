
const SET_ASSIGNMENTS = 'assignments/SET_ASSIGNMENTS';

const initial = {
    assignments: [
        {
            "id": 1,
            "title": "30 дней бега",
            "description": "Вы пробегали по 1 км каждый день в течение 30 дней. Это доказательство вашей дисциплины и силы духа.",
            "requirement": "Пробегать минимум 1 км ежедневно на протяжении 30 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/8589MTrk/2025-09-10-17-24-46-no-bg-preview-carve-photos.png",
            "points": 100
        },
        {
            "id": 2,
            "title": "Пятёрка выносливости",
            "description": "Вы пробегали по 5 км в течение 30 дней. Ваша настойчивость заслуживает уважения.",
            "requirement": "Пробегать минимум 5 км ежедневно на протяжении 30 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/9Q6JNJXJ/2025-09-10-17-25-10-no-bg-preview-carve-photos.png",
            "points": 250
        },
        {
            "id": 3,
            "title": "Книжный марафон",
            "description": "Вы каждый день в течение 30 дней читали книги. Эти знания делают вас сильнее и мудрее.",
            "requirement": "Читать минимум 15 страниц ежедневно на протяжении 30 дней.",
            "status": "earned",
            "image": "https://i.postimg.cc/50n5131c/2025-09-10-17-24-51-no-bg-preview-carve-photos.png",
            "points": 150
        },
        {
            "id": 4,
            "title": "Здоровый рацион",
            "description": "Вы придерживались здорового питания 30 дней подряд. Ваше тело скажет вам спасибо!",
            "requirement": "Следовать принципам здорового питания ежедневно на протяжении 30 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/qBFnLgvG/2025-09-10-17-25-30-no-bg-preview-carve-photos.png",
            "points": 200
        },
        {
            "id": 5,
            "title": "Ледяная закалка",
            "description": "Вы закалялись 30 дней подряд. Ваша сила воли закалена, как сталь!",
            "requirement": "Практиковать закаливание (например, холодный душ) ежедневно на протяжении 30 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/BZP5R2yz/2025-09-10-17-25-05-no-bg-preview-carve-photos.png",
            "points": 150
        },
        {
            "id": 6,
            "title": "Кодерский марафон",
            "description": "Вы кодили по 2 часа каждый день в течение 30 дней. Ваш код — это искусство!",
            "requirement": "Заниматься программированием минимум 2 часа ежедневно на протяжении 30 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/Zn2FWxRW/2025-09-10-17-24-55-no-bg-preview-carve-photos.png",
            "points": 300
        },
        {
            "id": 7,
            "title": "Полгода прогресса",
            "description": "Вы стабильно двигались к своим целям в течение полугода. Это настоящий прорыв!",
            "requirement": "Соблюдать дисциплину в любых активностях приложения в течение 180 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/BnbnwB7L/2025-09-10-17-25-39-no-bg-preview-carve-photos.png",
            "points": 500
        },
        {
            "id": 8,
            "title": "Сила отжиманий",
            "description": "Вы отжимались по 20 раз каждый день в течение 30 дней. Ваши мышцы — это мощь!",
            "requirement": "Выполнять минимум 20 отжиманий ежедневно на протяжении 30 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/rsq8G1tp/2025-09-10-17-25-21-no-bg-preview-carve-photos.png",
            "points": 150
        },
        {
            "id": 9,
            "title": "Ранний старт",
            "description": "Вы вставали не позже 6 утра 30 дней подряд. Ваш день начинается с победы!",
            "requirement": "Вставать не позже 6:00 утра ежедневно на протяжении 30 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/MTSxx75Y/2025-09-10-17-25-45-no-bg-preview-carve-photos.png",
            "points": 200
        },
        {
            "id": 10,
            "title": "Великий дисциплинатор",
            "description": "Вы пользовались приложением и соблюдали дисциплину целый год. Вы — легенда!",
            "requirement": "Использовать приложение и выполнять задачи дисциплины ежедневно в течение 365 дней.",
            "status": "locked",
            "image": "https://i.postimg.cc/gJXRFPMh/2025-09-10-17-25-26-no-bg-preview-carve-photos.png",
            "points": 1000
        },
        {
            "id": 11,
            "title": "Красавчик!",
            "description": "Вы начали использовать приложение и сделали первый шаг к своим целям. Ты — красавчик!",
            "requirement": "",
            "status": "my",
            "image": "https://i.postimg.cc/3NRrPtWR/2ba45392-3b7a-48bc-9b47-7f81e64b0867.png",
            "points": 0
        }
    ]
};

const AssignmentsReducer = (state = initial, action) => {
    switch (action.type) {
        case SET_ASSIGNMENTS:
            return { ...state, assignments: action.assignments };
        default:
            return state;
    }
};

// const setAssignments = (assignments) => ({
//     type: SET_ASSIGNMENTS,
//     assignments,
// });

export default AssignmentsReducer;