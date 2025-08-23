import { initializeApp } from "firebase/app";
import { doc, setDoc, collection, getFirestore, getDocs, } from "firebase/firestore";
import { addGoals, setTheFirstTime } from "../redux/goals_reducer";

const firebaseConfig = {
  apiKey: "AIzaSyB-w2pjTrryJUbZLqZZ3BjeK9LFvZUE6Kg",
  authDomain: "motivation-eb181.firebaseapp.com",
  projectId: "motivation-eb181",
  storageBucket: "motivation-eb181.firebasestorage.app",
  messagingSenderId: "251574281380",
  appId: "1:251574281380:web:425f6a0f70df51df1c7231",
  measurementId: "G-1474TGY4PX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);



export async function initializeUserGoals(customUserId) {
  const goalsArray = [
    { "id": 1, "title": "Пробежать 1 км", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 2, "title": "Читать книгу 20 минут", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 3, "title": "Совершить молитву 10 минут", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 4, "title": "Кодить 1 час за ноутбуком", "points": 30, "status": "not_started", "completionDate": "null" },
    { "id": 5, "title": "Сделать 50 приседаний", "points": 25, "status": "not_started", "completionDate": "null" },
    { "id": 6, "title": "Учить английские слова по карточкам", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 7, "title": "Совершить молитву на коленях", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 8, "title": "Сделать 20 отжиманий", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 9, "title": "Гулять на улице 15 минут", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 10, "title": "Прогуляться 30 минут", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 11, "title": "Читать книгу с блокнотом рядом", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 12, "title": "Сделать растяжку 15 минут", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 13, "title": "Слушать подкаст в наушниках", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 14, "title": "Пройти 5000 шагов", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 15, "title": "Протереть пыль дома", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 16, "title": "Сделать дыхательную гимнастику сидя", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 17, "title": "Поговорить с другом по видеосвязи", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 18, "title": "Утренняя зарядка 10 минут", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 19, "title": "Выучить стихотворение вслух", "points": 25, "status": "not_started", "completionDate": "null" },
    { "id": 20, "title": "Нарисовать рисунок на бумаге", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 21, "title": "Пройти 10 000 шагов", "points": 40, "status": "not_started", "completionDate": "null" },
    { "id": 22, "title": "Сделать 100 приседаний", "points": 50, "status": "not_started", "completionDate": "null" },
    { "id": 23, "title": "1 час без телефона (телефон убран в ящик)", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 24, "title": "Смотреть обучающее видео", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 25, "title": "Сделать планку 1 минуту", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 26, "title": "Сделать планку 2 минуты", "points": 30, "status": "not_started", "completionDate": "null" },
    { "id": 27, "title": "Съесть фрукт", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 28, "title": "Погулять на свежем воздухе", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 29, "title": "Прочитать 50 страниц книги", "points": 30, "status": "not_started", "completionDate": "null" },
    { "id": 30, "title": "Поблагодарить 5 человек вслух", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 31, "title": "Смотреть документальный фильм", "points": 25, "status": "not_started", "completionDate": "null" },
    { "id": 32, "title": "Сделать растяжку 5 минут", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 33, "title": "Тренироваться 40 минут", "points": 40, "status": "not_started", "completionDate": "null" },
    { "id": 34, "title": "Выучить 20 английских слов", "points": 40, "status": "not_started", "completionDate": "null" },
    { "id": 35, "title": "Лечь спать до 23:00 (фото часов)", "points": 25, "status": "not_started", "completionDate": "null" },
    { "id": 36, "title": "Проснуться рано без будильника (фото времени)", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 37, "title": "Сделать 200 прыжков на скакалке", "points": 30, "status": "not_started", "completionDate": "null" },
    { "id": 38, "title": "Работать 2 часа за компьютером без отвлечений", "points": 50, "status": "not_started", "completionDate": "null" },
    { "id": 39, "title": "Сделать уборку стола", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 40, "title": "Попробовать новое блюдо (фото еды)", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 41, "title": "Сходить в библиотеку (фото книги)", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 42, "title": "Сделать 30 приседаний", "points": 15, "status": "not_started", "completionDate": "null" },
    { "id": 43, "title": "Играть на музыкальном инструменте 15 минут", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 44, "title": "Сделать дыхательные упражнения стоя", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 45, "title": "2 часа без телефона (телефон в стороне)", "points": 30, "status": "not_started", "completionDate": "null" },
    { "id": 46, "title": "Пробежать 3 км", "points": 30, "status": "not_started", "completionDate": "null" },
    { "id": 47, "title": "Прочитать статью о саморазвитии (фото экрана)", "points": 10, "status": "not_started", "completionDate": "null" },
    { "id": 48, "title": "Составить план на месяц (фото блокнота)", "points": 50, "status": "not_started", "completionDate": "null" },
    { "id": 49, "title": "Сделать 15 минут йоги", "points": 20, "status": "not_started", "completionDate": "null" },
    { "id": 50, "title": "Приготовить здоровый завтрак (фото блюда)", "points": 25, "status": "not_started", "completionDate": "null" }
  ];
  try {
    const userGoalsRef = collection(db, "users", customUserId, "goals");
    const existingGoals = await getDocs(userGoalsRef);
    if (!existingGoals.empty) {
      console.log(`Цели для пользователя ${customUserId} уже существуют. Пропускаем инициализацию.`);
      addGoals(customUserId);
      return;
    }

    // Инициализируем цели
    for (let goal of goalsArray) {
      const userGoal = {
        ...goal,
        status: "not_started",  // Изначальный статус
      };

      await setDoc(doc(db, "users", customUserId, "goals", goal.id.toString()), userGoal);
    }

    console.log(`Цели инициализированы для пользователя ${customUserId}`);
    setTheFirstTime()
    addGoals(customUserId);
  } catch (error) {
    console.error("Ошибка инициализации целей:", error);
  }
}

// const customUserId = "user12345";  
// await initializeUserGoals(customUserId);