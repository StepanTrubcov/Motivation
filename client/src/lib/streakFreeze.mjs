export function addStreakDays(iso, days) {
    const date = new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}
const validDate = date => /^\d{4}-\d{2}-\d{2}$/.test(date || '') &&
    Number.isFinite(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
// Rollout date: historical returns before this feature existed cannot spend its allowance.
// The first rollout-day completion can still protect yesterday's missed day.
export const STREAK_FREEZE_ENABLED_FROM = '2026-10-29';

// Derived from saved completions, so reloads, devices and calendar views agree.
// A freeze preserves the counter; it never creates a completed goal or an extra day.
export function buildFrozenStreakTimeline(dates, until, { enabledFrom = STREAK_FREEZE_ENABLED_FROM, archive = null } = {}) {
    const completed = [...new Set(dates.filter(date => validDate(date) && date <= until))].sort();
    const days = new Map(), freezes = [], usedMonths = new Set(archive?.usedFreezeMonth ? [archive.usedFreezeMonth] : []);
    let previous = archive?.lastCompletedDate || null, streak = Number(archive?.streak) || 0, runStart = archive?.runStart || null;
    for (const date of completed) {
        const gap = previous ? Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86400000) : 0;
        const missed = previous && gap === 2 ? addStreakDays(previous, 1) : null;
        const month = missed?.slice(0, 7);
        if (missed && date >= enabledFrom && !usedMonths.has(month)) {
            usedMonths.add(month);
            const freeze = { date: missed, resumedOn: date, month, runStart };
            freezes.push(freeze);
            days.set(missed, { date: missed, completed: false, frozen: true, streak, runStart });
        } else if (gap !== 1) {
            streak = 0;
            runStart = date;
        }
        streak++;
        days.set(date, { date, completed: true, frozen: false, streak, runStart });
        previous = date;
    }
    return { days, freezes };
}

export function frozenStreakSnapshot(calendar, today = new Date().toISOString().slice(0, 10), options) {
    const ready = Array.isArray(calendar);
    const dates = ready ? calendar.filter(day => Array.isArray(day?.goalData) && day.goalData.some(goal => goal?.status === 'completed')).map(day => day.date) : [];
    const archive = ready ? calendar.find(day => day?.streakArchive)?.streakArchive : null;
    const timeline = buildFrozenStreakTimeline(dates, today, { ...options, archive });
    const isTodayCompleted = Boolean(timeline.days.get(today)?.completed);
    const last = timeline.days.get(isTodayCompleted ? today : addStreakDays(today, -1));
    return { ready, days: last?.streak || 0, runStart: last?.runStart || null, isTodayCompleted, today,
        freezes: timeline.freezes,
        freezeAvailable: !timeline.freezes.some(freeze => freeze.month === today.slice(0, 7)) };
}
