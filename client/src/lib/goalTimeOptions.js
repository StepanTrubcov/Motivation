import frozenCatalogs from './progress/goalCatalogVersions.json';
import catalog from './testbot-goal-catalog.json';

const goalTimeSpecs = new Map(catalog.goals.map((goal) => [String(goal.id), goal]));

export function getGoalTimeConfig(goalOrId) {
    const id = typeof goalOrId === 'object' && goalOrId !== null ? goalOrId.id : goalOrId;
    const value = String(id ?? '');
    const suffix = value.match(/(?:^|_)(\d+)$/)?.[1];
    if (!suffix) return null;

    const spec = typeof goalOrId === 'object' && goalOrId?.catalogVersion ? frozenCatalogs.timeSpecs.find(spec => String(spec.id) === suffix) : goalTimeSpecs.get(suffix);
    if (!spec || (!spec.durationOptions?.length && !spec.timePicker && !spec.quantityOptions?.length)) return null;
    return {
        quantityOptions: spec.quantityOptions || [],
        defaultQuantity: spec.defaultQuantity ?? null,
        quantityUnit: spec.quantityUnit,
        quantityUnitEn: spec.quantityUnitEn,
        quantityTitle: spec.title,
        quantityTitleEn: spec.titleEn,
        durationOptions: spec.durationOptions || [],
        defaultDuration: spec.defaultDuration ?? spec.durationOptions?.[0] ?? null,
        timePicker: Boolean(spec.timePicker),
        defaultTime: spec.defaultTime || null,
    };
}

/** Return the most recently saved time choices for a goal from the existing JSON calendar. */
export function getSavedGoalTimeSettings(goalOrId, savingGoals) {
    const goalId = typeof goalOrId === 'object' && goalOrId !== null ? goalOrId.id : goalOrId;
    if (!goalId || !Array.isArray(savingGoals)) return {};
    const config = getGoalTimeConfig(goalOrId);

    const entries = savingGoals
        .filter((day) => typeof day?.date === 'string' && Array.isArray(day.goalData))
        .sort((a, b) => b.date.localeCompare(a.date));
    for (const day of entries) {
        const saved = day.goalData.find((item) => item?.idGoals === goalId);
        if (!saved) continue;

        const settings = {};
        if (config?.quantityOptions?.includes(saved.quantity)) settings.quantity = saved.quantity;
        if (Number.isInteger(saved.durationMinutes) && saved.durationMinutes > 0 && saved.durationMinutes <= 720 && (!config || config.durationOptions.includes(saved.durationMinutes))) {
            settings.durationMinutes = saved.durationMinutes;
        }
        if (config?.timePicker && typeof saved.targetTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(saved.targetTime)) {
            settings.targetTime = saved.targetTime;
        }
        if (Object.keys(settings).length) return settings;
    }
    return {};
}

export function formatGoalDuration(minutes, language = 'ru') {
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) return '';
    if (language === 'en') {
        if (value < 60) return `${value} ${value === 1 ? 'minute' : 'minutes'}`;
        const hours = Math.floor(value / 60);
        const remainingMinutes = value % 60;
        const hoursLabel = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        return remainingMinutes ? `${hoursLabel} ${remainingMinutes} min` : hoursLabel;
    }
    if (value < 60) {
        const form = value % 10 === 1 && value % 100 !== 11
            ? 'минута'
            : value % 10 >= 2 && value % 10 <= 4 && !(value % 100 >= 12 && value % 100 <= 14)
                ? 'минуты'
                : 'минут';
        return `${value} ${form}`;
    }
    const hours = Math.floor(value / 60);
    const remainingMinutes = value % 60;
    const form = hours % 10 === 1 && hours % 100 !== 11
        ? 'час'
        : hours % 10 >= 2 && hours % 10 <= 4 && !(hours % 100 >= 12 && hours % 100 <= 14)
            ? 'часа'
            : 'часов';
    return remainingMinutes ? `${hours} ч ${remainingMinutes} мин` : `${hours} ${form}`;
}

export function formatGoalDurationChoice(minutes, language = 'ru') {
    const value = Number(minutes);
    if (value > 0 && value < 60) return `${value} ${language === 'en' ? 'min' : 'мин'}`;
    if (value === 60) return language === 'en' ? '1 hour' : '1 час';
    if (value > 60 && value % 60 === 0) return `${value / 60} ${language === 'en' ? 'hr' : 'ч'}`;
    if (value > 60 && value % 60 === 30) return language === 'en' ? `${(value / 60).toFixed(1)} hr` : `${String(value / 60).replace('.', ',')} ч`;
    return formatGoalDuration(value, language);
}

export function formatGoalTitleWithTime(title, { durationMinutes, targetTime, quantity, quantityUnit, quantityUnitEn } = {}, language = 'ru') {
    let result = String(title || '').trim();
    if (durationMinutes !== null && durationMinutes !== undefined) {
        const durationPattern = language === 'en'
            ? /\s*\d+(?:[.,]\d+)?\s*(?:minutes?|mins?\.?|hours?|hrs?\.?)(?:\s+\d+\s*(?:minutes?|mins?\.?))?/gi
            : /\s*\d+(?:[.,]\d+)?\s*(?:минут(?:у|а|ы)?|мин\.?|час(?:а|ов)?|ч\.?)(?:\s+\d+\s*(?:минут(?:у|а|ы)?|мин\.?))?/giu;
        result = result.replace(durationPattern, '').replace(/[\s·—–-]+$/u, '').trim();
        if (language === 'en') result = result.replace(/\s+for$/i, '').trim();
        const duration = formatGoalDuration(durationMinutes, language);
        if (duration) result = `${result} · ${duration}`;
    }
    if (targetTime) {
        if (/\b\d{1,2}:\d{2}\b/.test(result)) {
            result = result.replace(/\b\d{1,2}:\d{2}\b/g, targetTime);
        } else {
            result = result.replace(/\s+(?:at|до|в)$/i, '').trim();
            result = `${result} · ${targetTime}`;
        }
    }
    if (Number.isInteger(quantity) && quantity > 0) result = `${result} · ${formatGoalQuantity(quantity, quantityUnit, quantityUnitEn, language)}`;
    return result;
}

export function decorateGoalTime(goal, language = 'ru') {
    if (!goal) return goal;
    const config = getGoalTimeConfig(goal);
    const durationOptions = goal.durationOptions?.length ? goal.durationOptions : config?.durationOptions || [];
    const timePicker = Boolean(goal.timePicker || config?.timePicker);
    const defaultDuration = goal.defaultDuration ?? config?.defaultDuration ?? durationOptions[0] ?? null;
    const defaultTime = goal.defaultTime || config?.defaultTime || null;
    const baseTitle = config?.quantityOptions?.length ? (language === 'en' ? config.quantityTitleEn : config.quantityTitle) : goal.baseTitle || goal.title;
    const suffix = String(goal.id ?? '').match(/(?:^|_)(\d+)$/)?.[1];
    const durationBaseTitles = {
        '45': { ru: 'Провести время без телефона', en: 'Spend time without your phone' },
        '49': { ru: 'Заниматься йогой', en: 'Practice yoga' },
        '180': { ru: 'Личная молитва', en: 'Personal prayer' },
    };
    const timeBaseTitles = {
        '35': { ru: 'Лечь спать', en: 'Go to bed' },
        '36': { ru: 'Встать', en: 'Wake up' },
    };
    const durationBaseTitle = goal.testCatalog ? baseTitle : durationBaseTitles[suffix]?.[language] || baseTitle;
    const timeBaseTitle = timeBaseTitles[suffix]?.[language] || baseTitle;
    const displayBaseTitle = goal.targetTime ? timeBaseTitle : durationBaseTitle;

    return {
        ...goal,
        ...(config?.quantityOptions?.length ? { quantityOptions: config.quantityOptions, defaultQuantity: config.defaultQuantity, quantityUnit: config.quantityUnit, quantityUnitEn: config.quantityUnitEn } : {}),
        ...(durationOptions.length || timePicker ? { durationOptions, defaultDuration, timePicker, defaultTime } : {}),
        baseTitle,
        durationBaseTitle,
        timeBaseTitle,
        title: formatGoalTitleWithTime(displayBaseTitle, { ...goal, quantity: goal.quantity ?? config?.defaultQuantity, quantityUnit: config?.quantityUnit, quantityUnitEn: config?.quantityUnitEn }, language),
    };
}

export function formatGoalQuantity(value, unit, unitEn, language = 'ru') {
    const forms = { 'раз': ['раз', 'раза', 'раз'], 'шагов': ['шаг', 'шага', 'шагов'], 'задач': ['задача', 'задачи', 'задач'], 'выводов': ['вывод', 'вывода', 'выводов'], 'слов': ['слово', 'слова', 'слов'], 'пунктов': ['пункт', 'пункта', 'пунктов'] };
    const form = new Intl.PluralRules('ru').select(value);
    const label = language === 'ru' ? forms[unit]?.[form === 'one' ? 0 : form === 'few' ? 1 : 2] || unit || 'раз' : unitEn || 'reps';
    return `${value.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')} ${label}`;
}
