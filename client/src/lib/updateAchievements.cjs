// Утилита для обновления достижений у всех пользователей
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Новые данные о достижениях (обновленные значения из Api.js)
const updatedAchievements = [
  {
    "id": 1,
    "title": "90 дней бега",
    "description": "Вы пробегали по 1 км в течение 90 дней. Это доказательство вашей дисциплины и силы духа.",
    "requirement": "Пробегать минимум 1 км на протяжении 90 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/8589MTrk/2025-09-10-17-24-46-no-bg-preview-carve-photos.png",
    "points": 100,
    "type": "goal_based",
    "goalIds": ["1"],
    "target": 90
  },
  {
    "id": 2,
    "title": "Пятёрка выносливости",
    "description": "Вы пробегали по 5 км в течение 60 дней. Ваша настойчивость заслуживает уважения.",
    "requirement": "Пробегать минимум 5 км на протяжении 60 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/9Q6JNJXJ/2025-09-10-17-25-10-no-bg-preview-carve-photos.png",
    "points": 250,
    "type": "goal_based",
    "goalIds": ["3"],
    "target": 60
  },
  {
    "id": 3,
    "title": "Книжный марафон",
    "description": "Вы в течение 60 дней читали книги. Эти знания делают вас сильнее и мудрее.",
    "requirement": "Читать минимум 15 страниц на протяжении 60 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/50n5131c/2025-09-10-17-24-51-no-bg-preview-carve-photos.png",
    "points": 150,
    "type": "goal_based",
    "goalIds": ["2"],
    "target": 60
  },
  {
    "id": 4,
    "title": "Здоровый рацион",
    "description": "Вы придерживались здорового питания 60 дней. Ваше тело скажет вам спасибо!",
    "requirement": "Следовать принципам здорового питания на протяжении 60 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/qBFnLgvG/2025-09-10-17-25-30-no-bg-preview-carve-photos.png",
    "points": 200,
    "type": "goal_based",
    "goalIds": ["68"],
    "target": 60
  },
  {
    "id": 5,
    "title": "Ледяная закалка",
    "description": "Вы закалялись 60 дней. Ваша сила воли закалена, как сталь!",
    "requirement": "Практиковать закаливание (например, холодный душ) на протяжении 60 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/BZP5R2yz/2025-09-10-17-25-05-no-bg-preview-carve-photos.png",
    "points": 150,
    "type": "goal_based",
    "goalIds": ["16"],
    "target": 60
  },
  {
    "id": 6,
    "title": "Кодерский марафон",
    "description": "Вы кодили по 1 час в течение 60 дней. Ваш код — это искусство!",
    "requirement": "Заниматься программированием минимум 1 час на протяжении 60 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/Zn2FWxRW/2025-09-10-17-24-55-no-bg-preview-carve-photos.png",
    "points": 300,
    "type": "goal_based",
    "goalIds": ["4"],
    "target": 60
  },
  {
    "id": 7,
    "title": "Полгода прогресса",
    "description": "Вы стабильно двигались к своим целям в течение полугода. Это настоящий прорыв!",
    "requirement": "Соблюдать дисциплину в любых активностях приложения в течение 180 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/BnbnwB7L/2025-09-10-17-25-39-no-bg-preview-carve-photos.png",
    "points": 500,
    "type": "time_based",
    "target": 180
  },
  {
    "id": 8,
    "title": "Сила отжиманий",
    "description": "Вы отжимались по 20 раз в течение 60 дней. Ваши мышцы — это мощь!",
    "requirement": "Выполнять минимум 20 отжиманий на протяжении 60 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/rsq8G1tp/2025-09-10-17-25-21-no-bg-preview-carve-photos.png",
    "points": 150,
    "type": "goal_based",
    "goalIds": ["8"],
    "target": 60
  },
  {
    "id": 9,
    "title": "Ранний старт",
    "description": "Вы вставали не позже 6 утра 90 дней. Ваш день начинается с победы!",
    "requirement": "Вставать не позже 6:00 утра на протяжении 90 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/MTSxx75Y/2025-09-10-17-25-45-no-bg-preview-carve-photos.png",
    "points": 200,
    "type": "goal_based",
    "goalIds": ["36"],
    "target": 90
  },
  {
    "id": 10,
    "title": "Великий дисциплинатор",
    "description": "Вы пользовались приложением и соблюдали дисциплину целый год. Вы — легенда!",
    "requirement": "Использовать приложение и выполнять задачи дисциплины ежедневно в течение 365 дней.",
    "status": "locked",
    "image": "https://i.postimg.cc/gJXRFPMh/2025-09-10-17-25-26-no-bg-preview-carve-photos.png",
    "points": 1000,
    "type": "time_based",
    "target": 365
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
];

// Идентификатор версии достижений (меняйте при каждом обновлении)
const ACHIEVEMENTS_VERSION = "v1.0"; // Увеличивайте версию при каждом изменении

let hasRun = false;

async function updateAllUserAchievements() {
  // Проверяем, чтобы функция выполнялась только один раз
  if (hasRun) {
    return { success: true, message: 'Функция уже была выполнена ранее' };
  }
  
  hasRun = true;
  
  try {
    console.log('Начинаем автоматическое обновление достижений для всех пользователей...');
    
    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        username: true
      }
    });
    
    console.log(`Найдено пользователей: ${users.length}`);
    
    let updatedUsersCount = 0;
    let skippedUsersCount = 0;
    
    // Для каждого пользователя проверяем и обновляем достижения при необходимости
    for (const user of users) {
      console.log(`Проверяем достижения для пользователя: ${user.username || user.firstName} (${user.telegramId})`);
      
      try {
        // Получаем текущие достижения пользователя
        const currentUserAchievements = await prisma.achievement.findMany({
          where: {
            userId: user.id
          },
          select: {
            id: true,
            title: true,
            description: true,
            points: true
          }
        });
        
        // Проверяем, нужно ли обновлять достижения
        let needsUpdate = false;
        
        if (currentUserAchievements.length === 0) {
          // У пользователя нет достижений, нужно создать
          needsUpdate = true;
        } else if (currentUserAchievements.length !== updatedAchievements.length) {
          // Разное количество достижений, нужно обновить
          needsUpdate = true;
        } else {
          // Проверяем конкретные достижения на изменения
          for (const newAchievement of updatedAchievements) {
            const existing = currentUserAchievements.find(a => 
              a.id == newAchievement.id && 
              a.title === newAchievement.title
            );
            
            if (!existing || existing.points !== newAchievement.points || existing.description !== newAchievement.description) {
              needsUpdate = true;
              break;
            }
          }
        }
        
        if (needsUpdate) {
          console.log(`Обновляем достижения для пользователя: ${user.username || user.firstName}`);
          
          // Удаляем все существующие достижения пользователя
          await prisma.achievement.deleteMany({
            where: {
              userId: user.id
            }
          });
          
          // Создаем новые достижения для пользователя
          const achievementsToCreate = updatedAchievements.map(ach => ({
            ...ach,
            userId: user.id
          }));
          
          await prisma.achievement.createMany({
            data: achievementsToCreate,
            skipDuplicates: true
          });
          
          console.log(`Достижения для пользователя ${user.username || user.firstName} успешно обновлены`);
          updatedUsersCount++;
        } else {
          console.log(`Достижения для пользователя ${user.username || user.firstName} уже актуальны, пропускаем`);
          skippedUsersCount++;
        }
      } catch (userError) {
        console.error(`Ошибка при проверке/обновлении достижений для пользователя ${user.username || user.firstName}:`, userError);
      }
    }
    
    const result = {
      success: true,
      message: `Достижения успешно обновлены для ${updatedUsersCount} пользователей, пропущено ${skippedUsersCount} пользователей`
    };
    
    console.log(result.message);
    return result;
  } catch (error) {
    console.error('Ошибка при автоматическом обновлении достижений:', error);
    return { 
      success: false, 
      error: 'Не удалось обновить достижения для пользователей',
      details: error.message 
    };
  }
}

// Экспортируем функцию для использования в других модулях
module.exports = { updateAllUserAchievements };