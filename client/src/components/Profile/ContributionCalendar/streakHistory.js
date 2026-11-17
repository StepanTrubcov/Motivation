import { addStreakDays, buildFrozenStreakTimeline } from '../../../lib/streakFreeze.mjs';
export const addDays = addStreakDays;

export function buildStreakHistory(values, until, length = 14, options) {
    const start = addDays(until, 1 - length);
    const timeline = buildFrozenStreakTimeline(Object.keys(values || {}).filter(date => Number(values[date]) > 0), until, { ...options, archive: values?.streakArchive });
    return Array.from({ length }, (_, index) => {
        const date = addDays(start, index);
        return timeline.days.get(date) || { date, completed: false, frozen: false, streak: 0, runStart: null };
    });
}
