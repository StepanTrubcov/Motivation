import { initializeApp } from "firebase/app";
import { doc, writeBatch, collection, getFirestore, getDocs, getDoc } from "firebase/firestore";
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
    { "id": 1, "title": "Пробежать 1 км", "points": 10, "status": "not_started", "completionDate": null, "description": "Пробегайте по 1 км каждый день на протяжении 30 дней. Это укрепит сердце и повысит выносливость." },
    { "id": 2, "title": "Читать книгу 20 минут", "points": 20, "status": "not_started", "completionDate": null, "description": "Читайте по 20 минут ежедневно в течение 30 дней. Это поможет улучшить внимание и концентрацию." },
    { "id": 3, "title": "Совершить молитву 10 минут", "points": 15, "status": "not_started", "completionDate": null, "description": "Ежедневно посвящайте 10 минут молитве на протяжении 30 дней. Это укрепит дух и принесёт спокойствие." },
    { "id": 4, "title": "Кодить 1 час за ноутбуком", "points": 30, "status": "not_started", "completionDate": null, "description": "Занимайтесь программированием по 1 часу ежедневно в течение 30 дней. Это поможет развить дисциплину и навыки." },
    { "id": 5, "title": "Сделать 50 приседаний", "points": 25, "status": "not_started", "completionDate": null, "description": "Выполняйте по 50 приседаний каждый день на протяжении 30 дней. Это укрепит ноги и ягодицы." },
    { "id": 6, "title": "Учить английские слова по карточкам", "points": 20, "status": "not_started", "completionDate": null, "description": "Каждый день изучайте новые английские слова по карточкам в течение 30 дней. Это расширит ваш словарный запас." },
    { "id": 7, "title": "Совершить молитву", "points": 15, "status": "not_started", "completionDate": null, "description": "Молитесь на коленях ежедневно в течение 30 дней. Это укрепит духовную дисциплину и внутренний мир." },
    { "id": 8, "title": "Сделать 20 отжиманий", "points": 15, "status": "not_started", "completionDate": null, "description": "Выполняйте по 20 отжиманий каждый день в течение 30 дней. Это укрепит мышцы груди, рук и спины." },
    { "id": 9, "title": "Гулять на улице 15 минут", "points": 10, "status": "not_started", "completionDate": null, "description": "Каждый день гуляйте по 15 минут на улице на протяжении 30 дней. Это улучшит здоровье и настроение." },
    { "id": 10, "title": "Прогуляться 30 минут", "points": 20, "status": "not_started", "completionDate": null, "description": "Ходите на прогулку по 30 минут каждый день в течение 30 дней. Это поможет организму быть в тонусе." },
    { "id": 11, "title": "Читать книгу с блокнотом рядом", "points": 10, "status": "not_started", "completionDate": null, "description": "Читайте с блокнотом каждый день в течение 30 дней, делая записи и мысли. Это усилит понимание." },
    { "id": 12, "title": "Сделать растяжку 15 минут", "points": 15, "status": "not_started", "completionDate": null, "description": "Делайте растяжку по 15 минут ежедневно на протяжении 30 дней. Это улучшит гибкость и здоровье суставов." },
    { "id": 13, "title": "Слушать подкаст в наушниках", "points": 10, "status": "not_started", "completionDate": null, "description": "Слушайте полезные подкасты каждый день на протяжении 30 дней. Это поможет получать новые знания." },
    { "id": 14, "title": "Пройти 5000 шагов", "points": 20, "status": "not_started", "completionDate": null, "description": "Проходите 5000 шагов ежедневно на протяжении 30 дней. Это укрепит организм и поддержит тонус." },
    { "id": 15, "title": "Протереть пыль дома", "points": 20, "status": "not_started", "completionDate": null, "description": "Протирайте пыль каждый день в течение 30 дней. Это улучшит чистоту и создаст уют в доме." },
    { "id": 16, "title": "Сделать дыхательную гимнастику сидя", "points": 15, "status": "not_started", "completionDate": null, "description": "Выполняйте дыхательную гимнастику сидя ежедневно в течение 30 дней. Это снизит стресс и улучшит концентрацию." },
    { "id": 17, "title": "Поговорить с другом по видеосвязи", "points": 10, "status": "not_started", "completionDate": null, "description": "Общайтесь с другом по видеосвязи каждый день в течение 30 дней. Это улучшит настроение и укрепит отношения." },
    { "id": 18, "title": "Утренняя зарядка 10 минут", "points": 15, "status": "not_started", "completionDate": null, "description": "Делайте утреннюю зарядку по 10 минут ежедневно на протяжении 30 дней. Это придаст энергии на день." },
    { "id": 19, "title": "Выучить стихотворение вслух", "points": 25, "status": "not_started", "completionDate": null, "description": "Каждый день учите часть стихотворения вслух, чтобы за 30 дней запомнить произведение полностью." },
    { "id": 20, "title": "Нарисовать рисунок на бумаге", "points": 15, "status": "not_started", "completionDate": null, "description": "Рисуйте каждый день на протяжении 30 дней. Это поможет развить креативность и снять стресс." },
    { "id": 21, "title": "Пройти 10 000 шагов", "points": 40, "status": "not_started", "completionDate": null, "description": "Проходите по 10 000 шагов ежедневно в течение 30 дней. Это поможет держать организм в форме." },
    { "id": 22, "title": "Сделать 100 приседаний", "points": 50, "status": "not_started", "completionDate": null, "description": "Выполняйте по 100 приседаний ежедневно на протяжении 30 дней. Это укрепит мышцы и повысит выносливость." },
    { "id": 23, "title": "1 час без телефона", "points": 20, "status": "not_started", "completionDate": null, "description": "Ежедневно откладывайте телефон на 1 час в течение 30 дней. Это поможет сосредоточиться." },
    { "id": 24, "title": "Смотреть обучающее видео", "points": 15, "status": "not_started", "completionDate": null, "description": "Смотрите обучающее видео каждый день в течение 30 дней. Это расширит ваши знания." },
    { "id": 25, "title": "Сделать планку 1 минуту", "points": 20, "status": "not_started", "completionDate": null, "description": "Держите планку 1 минуту ежедневно в течение 30 дней. Это укрепит мышцы кора и спины." },
    { "id": 26, "title": "Сделать планку 2 минуты", "points": 30, "status": "not_started", "completionDate": null, "description": "Ежедневно держите планку 2 минуты на протяжении 30 дней. Это развивает силу и выносливость." },
    { "id": 27, "title": "Съесть фрукт", "points": 10, "status": "not_started", "completionDate": null, "description": "Ешьте хотя бы один фрукт каждый день в течение 30 дней. Это добавит витаминов и энергии." },
    { "id": 28, "title": "Погулять на свежем воздухе", "points": 20, "status": "not_started", "completionDate": null, "description": "Ежедневно выходите на прогулку на свежем воздухе в течение 30 дней. Это полезно для здоровья и психики." },
    { "id": 29, "title": "Прочитать 50 страниц книги", "points": 30, "status": "not_started", "completionDate": null, "description": "Читайте по 50 страниц ежедневно в течение 30 дней. Это позволит освоить новые книги." },
    { "id": 30, "title": "Поблагодарить 5 человек вслух", "points": 20, "status": "not_started", "completionDate": null, "description": "Выражайте благодарность 5 людям ежедневно в течение 30 дней. Это поднимет настроение и укрепит отношения." },
    { "id": 31, "title": "Смотреть документальный фильм", "points": 25, "status": "not_started", "completionDate": null, "description": "Смотрите документальные фильмы каждый день в течение 30 дней. Это расширит кругозор." },
    { "id": 32, "title": "Сделать растяжку 5 минут", "points": 10, "status": "not_started", "completionDate": null, "description": "Делайте растяжку по 5 минут каждый день в течение 30 дней. Это улучшит гибкость и самочувствие." },
    { "id": 33, "title": "Тренироваться 40 минут", "points": 40, "status": "not_started", "completionDate": null, "description": "Занимайтесь тренировкой по 40 минут каждый день в течение 30 дней. Это укрепит организм и даст энергию." },
    { "id": 34, "title": "Выучить 20 английских слов", "points": 40, "status": "not_started", "completionDate": null, "description": "Учите по 20 английских слов каждый день на протяжении 30 дней. Это значительно расширит словарный запас." },
    { "id": 35, "title": "Лечь спать до 23:00", "points": 25, "status": "not_started", "completionDate": null, "description": "Ложитесь спать до 23:00 каждый день в течение 30 дней. Это улучшит режим сна." },
    { "id": 36, "title": "Проснуться рано без будильника", "points": 20, "status": "not_started", "completionDate": null, "description": "Старайтесь просыпаться рано без будильника каждый день в течение 30 дней. Это наладит биоритмы." },
    { "id": 37, "title": "Сделать 200 прыжков на скакалке", "points": 30, "status": "not_started", "completionDate": null, "description": "Ежедневно делайте по 200 прыжков на скакалке в течение 30 дней. Это поможет сжечь калории и развить выносливость." },
    { "id": 38, "title": "Работать 2 часа за компьютером без отвлечений", "points": 50, "status": "not_started", "completionDate": null, "description": "Ежедневно работайте 2 часа за компьютером без отвлечений в течение 30 дней. Это улучшит концентрацию." },
    { "id": 39, "title": "Сделать уборку стола", "points": 15, "status": "not_started", "completionDate": null, "description": "Наводите порядок на столе каждый день в течение 30 дней. Это поможет сохранять организованность." },
    { "id": 40, "title": "Попробовать новое блюдо", "points": 20, "status": "not_started", "completionDate": null, "description": "Пробуйте новое блюдо каждый день в течение 30 дней. Это разнообразит рацион и сделает питание интересным." },
    { "id": 41, "title": "Сходить в библиотеку", "points": 15, "status": "not_started", "completionDate": null, "description": "Посещайте библиотеку или берите книги каждый день в течение 30 дней. Это создаст привычку читать." },
    { "id": 42, "title": "Сделать 30 приседаний", "points": 15, "status": "not_started", "completionDate": null, "description": "Выполняйте 30 приседаний каждый день в течение 30 дней. Это укрепит мышцы ног." },
    { "id": 43, "title": "Играть на музыкальном инструменте 15 минут", "points": 20, "status": "not_started", "completionDate": null, "description": "Играйте на музыкальном инструменте каждый день по 15 минут в течение 30 дней. Это улучшит музыкальные навыки." },
    { "id": 44, "title": "Сделать дыхательные упражнения стоя", "points": 10, "status": "not_started", "completionDate": null, "description": "Ежедневно выполняйте дыхательные упражнения стоя в течение 30 дней. Это улучшит здоровье дыхательной системы." },
    { "id": 45, "title": "2 часа без телефона", "points": 30, "status": "not_started", "completionDate": null, "description": "Откладывайте телефон на 2 часа каждый день в течение 30 дней. Это освободит время для важных дел." },
    { "id": 46, "title": "Пробежать 3 км", "points": 30, "status": "not_started", "completionDate": null, "description": "Бегайте по 3 км ежедневно в течение 30 дней. Это поможет развить выносливость и здоровье." },
    { "id": 47, "title": "Прочитать статью о саморазвитии", "points": 10, "status": "not_started", "completionDate": null, "description": "Читайте статьи о саморазвитии каждый день в течение 30 дней. Это поможет стать лучше." },
    { "id": 48, "title": "Составить план на месяц", "points": 50, "status": "not_started", "completionDate": null, "description": "Ежедневно составляйте и корректируйте план на месяц в течение 30 дней. Это улучшит продуктивность." },
    { "id": 49, "title": "Сделать 15 минут йоги", "points": 20, "status": "not_started", "completionDate": null, "description": "Занимайтесь йогой по 15 минут ежедневно на протяжении 30 дней. Это укрепит тело и ум." },
    { "id": 50, "title": "Приготовить здоровый завтрак", "points": 25, "status": "not_started", "completionDate": null, "description": "Готовьте здоровый завтрак каждый день в течение 30 дней. Это придаст энергии и улучшит самочувствие." }
  ];


  try {
    const userGoalsRef = collection(db, "users", customUserId, "goals");
    const existingGoalsSnapshot = await getDocs(userGoalsRef);
    const existingGoalsCount = existingGoalsSnapshot.size;
  
    // If all goals are already initialized, fetch and update the store
    if (existingGoalsCount === goalsArray.length) {
      console.log(`У пользователя ${customUserId} уже есть все цели (${existingGoalsCount}). Пропускаем инициализацию.`);
      await addGoals(customUserId);
      return;
    }
  
    console.log(`У пользователя ${customUserId} найдено ${existingGoalsCount} целей. Инициализируем все цели...`);
  
    const batch = writeBatch(db);
  
    // Add all goals from goalsArray to the batch
    for (let goal of goalsArray) {
      const goalRef = doc(db, "users", customUserId, "goals", goal.id.toString());
      batch.set(goalRef, {
        ...goal,
        status: "not_started",
      });
    }
  
    // Commit the batch to write all goals at once
    await batch.commit();
    console.log(`Все ${goalsArray.length} целей инициализированы для пользователя ${customUserId}.`);
  
    // Fetch and update the store with the initialized goals
    await addGoals(customUserId);
  } catch (error) {
    console.error("Ошибка инициализации целей:", error);
  }
}
