import { ACHIEVEMENT_TEMPLATES } from '@/lib/achievementTemplates.mjs';

// Переводы для всех достижений
export const achievementsTranslations = {
    ru: {
        "1": { title: "Красавчик!", requirement: "" },
        "2": { title: "30 дней бега", requirement: "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 30 раз\n" },
        "3": { title: "Книжный марафон", requirement: "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 30 раз\n" },
        "4": { title: "Кодерский марафон", requirement: "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 30 раз\n" },
        "5": { title: "Здоровый рацион", requirement: "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 30 раз\n" },
        "6": { title: "Ранний старт", requirement: "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 30 раз\n" },
        "7": { title: "Ледяная закалка", requirement: "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 30 раз\n" },
        "8": { title: "Сила отжиманий", requirement: "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 30 раз\n" },
        "9": { title: "Месяц прогресса", requirement: "• Пользоваться ботом и приложением \n на протяжении 30 дней\n" },
        "10": { title: "60 дней бега", requirement: "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 60 раз\n" },
        "11": { title: "Книжный марафон", requirement: "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 60 раз\n" },
        "12": { title: "Кодерский марафон", requirement: "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 60 раз\n" },
        "13": { title: "Здоровый рацион", requirement: "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 60 раз\n" },
        "14": { title: "Ранний старт", requirement: "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 60 раз\n" },
        "15": { title: "Ледяная закалка", requirement: "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 60 раз\n" },
        "16": { title: "Сила отжиманий ", requirement: "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 60 раз\n" },
        "17": { title: "Полгода прогресса", requirement: "• Пользоваться ботом и приложением \n на протяжении 180 дней\n" },
        "18": { title: "120 дней бега", requirement: "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 120 раз\n" },
        "19": { title: "Ледяная закалка", requirement: "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 120 раз\n" },
        "20": { title: "Кодерский марафон", requirement: "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 90 раз\n" },
        "21": { title: "Сила отжиманий", requirement: "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 120 раз\n" },
        "22": { title: "Книжный марафон", requirement: "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 120 раз\n" },
        "23": { title: "Здоровый рацион", requirement: "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 120 раз\n" },
        "24": { title: "Ранний старт", requirement: "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 120 раз\n" },
        "25": { title: "Великий дисциплинатор", requirement: "• Пользоваться ботом и приложением \n на протяжении 365 дней\n" },
        "26": { title: "Один из первых", requirement: "• Эту ачивку получили первые 100\nпользователей бота.\n• Больше эту ачивку получить нельзя! \n" },
    },
    en: {
        "1": { title: "Handsome!", requirement: "" },
        "2": { title: "30 Days of Running", requirement: "• Take the goal «Run»\n• Complete this goal 30 times\n" },
        "3": { title: "Book Marathon", requirement: "• Take the goal «Read a book for 20 min»\n• Complete this goal 30 times\n" },
        "4": { title: "Coding Marathon", requirement: "• Take the goal «Code for 1 hour on 💻»\n• Complete this goal 30 times\n" },
        "5": { title: "Healthy Diet", requirement: "• Take the goal «Day without sweets»\n• Complete this goal 30 times\n" },
        "6": { title: "Early Start", requirement: "• Take the goal «Wake up early»\n• Complete this goal 30 times\n" },
        "7": { title: "Ice Hardening", requirement: "• Take the goal «Pour ❄️ cold water»\n• Complete this goal 30 times\n" },
        "8": { title: "Push-up Power", requirement: "• Take the goal «Do push-ups»\n• Complete this goal 30 times\n" },
        "9": { title: "Month of Progress", requirement: "• Use the bot and app \n for 30 days\n" },
        "10": { title: "60 Days of Running", requirement: "• Take the goal «Run»\n• Complete this goal 60 times\n" },
        "11": { title: "Book Marathon", requirement: "• Take the goal «Read a book for 20 min»\n• Complete this goal 60 times\n" },
        "12": { title: "Coding Marathon", requirement: "• Take the goal «Code for 1 hour on 💻»\n• Complete this goal 60 times\n" },
        "13": { title: "Healthy Diet", requirement: "• Take the goal «Day without sweets»\n• Complete this goal 60 times\n" },
        "14": { title: "Early Start", requirement: "• Take the goal «Wake up early»\n• Complete this goal 60 times\n" },
        "15": { title: "Ice Hardening", requirement: "• Take the goal «Pour ❄️ cold water»\n• Complete this goal 60 times\n" },
        "16": { title: "Push-up Power", requirement: "• Take the goal «Do push-ups»\n• Complete this goal 60 times\n" },
        "17": { title: "Half Year of Progress", requirement: "• Use the bot and app \n for 180 days\n" },
        "18": { title: "120 Days of Running", requirement: "• Take the goal «Run»\n• Complete this goal 120 times\n" },
        "19": { title: "Ice Hardening", requirement: "• Take the goal «Pour ❄️ cold water»\n• Complete this goal 120 times\n" },
        "20": { title: "Coding Marathon", requirement: "• Take the goal «Code for 1 hour on 💻»\n• Complete this goal 90 times\n" },
        "21": { title: "Push-up Power", requirement: "• Take the goal «Do push-ups»\n• Complete this goal 120 times\n" },
        "22": { title: "Book Marathon", requirement: "• Take the goal «Read a book for 20 min»\n• Complete this goal 120 times\n" },
        "23": { title: "Healthy Diet", requirement: "• Take the goal «Day without sweets»\n• Complete this goal 120 times\n" },
        "24": { title: "Early Start", requirement: "• Take the goal «Wake up early»\n• Complete this goal 120 times\n" },
        "25": { title: "Great Disciplinarian", requirement: "• Use the bot and app \n for 365 days\n" },
        "26": { title: "One of the First", requirement: "• This achievement was received by the first 100\nbot users.\n• This achievement can no longer be obtained! \n" },
    }
};

const englishAchievementText = {
    "1": ["Handsome!", "Start using the app.", "You started using the app and took the first step toward your goals."],
    "2": ["In the Game", "Complete the tutorial.", "You completed the tutorial and learned the basics of the app."],
    "3": ["30 Days of Running", "Complete «Run» 30 times.", "You kept returning to running and built a lasting habit."],
    "4": ["Book Marathon", "Complete «Read a book» 30 times.", "Regular reading has become part of your day."],
    "5": ["Coding Marathon", "Complete «Program» 30 times.", "You made regular time for programming."],
    "6": ["Flexibility Starts", "Complete «Stretch after waking up» 45 times.", "Small stretching sessions have grown into a habit."],
    "7": ["Morning in Motion", "Complete «Morning exercise» 30 times.", "You started your mornings with exercise."],
    "8": ["Step by Step", "Complete «Walk outdoors» 30 times.", "You made time for walks in the fresh air."],
    "9": ["Jump Toward Your Goal", "Complete «Jump rope» 45 times.", "You completed many jump-rope sessions."],
    "10": ["Healthy Diet", "Complete «Day without sweets» 90 times.", "You consistently followed your chosen eating habits."],
    "11": ["Early Start", "Complete «Wake up at the planned time» 90 times.", "You built a steady habit of getting up on schedule."],
    "12": ["Ice Hardening", "Complete «Pour cold water» 90 times.", "You practiced cold-water hardening regularly."],
    "13": ["Push-up Strength", "Complete «Do push-ups» 90 times.", "You built a consistent exercise habit."],
    "14": ["Voice of the Soul", "Complete «Practice singing» 90 times.", "You made regular time to practice singing."],
    "15": ["Dance Rhythm", "Complete «Dance» 90 times.", "You made time for dancing and movement."],
    "16": ["Financial Order", "Complete «Record today's expenses» 90 times.", "You consistently tracked your daily expenses."],
    "17": ["Clean Workspace", "Complete «Tidy your workspace» 90 times.", "You kept your workspace tidy."],
    "18": ["Phone-Free Time", "Complete «Spend time without your phone» 90 times.", "You regularly put your phone aside and focused on other things."],
    "19": ["Share Your Progress", "Complete «Share your report» 90 times.", "You shared your results and kept moving forward."],
    "20": ["Language Progress", "Complete «Practice a foreign language» 90 times.", "You studied a foreign language regularly."],
    "21": ["Thought Journal", "Complete «Write a daily reflection» 90 times.", "You regularly reflected on your day and recorded your thoughts."],
    "22": ["A New Level", "Reach level 25.", "You reached level 25."],
    "23": ["Year Streak", "Use the app for 365 days.", "A year of regular work on yourself is a major achievement."],
    "24": ["System Creator", "Reach level 100.", "You reached level 100 through steady progress."],
    "25": ["A Thousand Completions", "Complete any goals 1,000 times in total.", "One thousand completed goals mark a remarkable journey."],
    "26": ["Collector", "Earn every achievement except epic ones.", "You collected all achievements except the epic ones."],
    "27": ["One of the First", "Be among the first 100 bot users.", "This achievement was awarded to the first 100 bot users."],
    "28": ["One-Month Flame", "Maintain a 30-day streak.", "You kept your goal streak alive for 30 days in a row."],
    "29": ["Unquenchable Flame", "Maintain a 100-day streak.", "You kept your goal streak alive for 100 days in a row."],
    "30": ["Year of Fire", "Maintain a 365-day streak.", "You kept your goal streak alive for an entire year."],
};

for (const template of ACHIEVEMENT_TEMPLATES) {
    const id = String(template.id);
    achievementsTranslations.ru[id] = { title: template.title, requirement: template.requirement };
    const [title, requirement] = englishAchievementText[id] || [];
    if (title) achievementsTranslations.en[id] = { title, requirement, description: englishAchievementText[id][2] };
}

// Функция для получения переведенного текста достижения
export const getAchievementTranslation = (achievementId, language, field = 'title') => {
    const translations = achievementsTranslations[language] || achievementsTranslations.ru;
    const achievement = translations[achievementId];
    return achievement?.[field] || '';
};

// Функция для перевода всего массива достижений
export const translateAchievements = (achievements, language) => {
    if (!Array.isArray(achievements) || achievements.length === 0) return achievements || [];
    
    // Если язык русский, возвращаем оригинальные данные
    if (language === 'ru') {
        return achievements;
    }
    
    return achievements.map(achievement => {
        if (!achievement) return achievement;
        
        // Пробуем разные варианты ID
        let id = achievement.id?.toString();
        let foundId = null;
        
        // Сначала пробуем найти по ID (формат "1"-"26")
        if (id && /^[1-9][0-9]{0,2}$/.test(id) && achievementsTranslations.ru[id]) {
            foundId = id;
        } else {
            // Если ID не подходит, пробуем найти по оригинальному русскому title
            const ruTranslations = achievementsTranslations.ru;
            const originalTitle = achievement.title?.trim();
            
            if (originalTitle) {
                // Точное совпадение
                for (const [key, value] of Object.entries(ruTranslations)) {
                    const ruTitle = value.title?.trim();
                    if (ruTitle === originalTitle) {
                        foundId = key;
                        break;
                    }
                }
                
                // Если не нашли точное совпадение, пробуем частичное (на случай лишних пробелов или небольших различий)
                if (!foundId) {
                    for (const [key, value] of Object.entries(ruTranslations)) {
                        const ruTitle = value.title?.trim();
                        if (ruTitle && (
                            ruTitle === originalTitle ||
                            originalTitle.includes(ruTitle) ||
                            ruTitle.includes(originalTitle) ||
                            originalTitle.replace(/\s+/g, ' ') === ruTitle.replace(/\s+/g, ' ')
                        )) {
                            foundId = key;
                            break;
                        }
                    }
                }
            }
        }
        
        // Если ID не найден, возвращаем оригинал
        if (!foundId) {
            return achievement;
        }
        
        const translatedTitle = getAchievementTranslation(foundId, language, 'title');
        const translatedRequirement = getAchievementTranslation(foundId, language, 'requirement');
        const translatedDescription = getAchievementTranslation(foundId, language, 'description');
        
        // Если перевод найден (не пустая строка), используем его, иначе оригинал
        const finalTitle = translatedTitle && translatedTitle.trim() !== '' 
            ? translatedTitle 
            : achievement.title;
        
        const finalRequirement = translatedRequirement && translatedRequirement.trim() !== '' 
            ? translatedRequirement 
            : (achievement.requirement || '');
        
        return {
            ...achievement,
            title: finalTitle,
            requirement: finalRequirement,
            description: translatedDescription || achievement.description || '',
        };
    });
};
