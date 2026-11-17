import { frozenStreakSnapshot, addStreakDays } from './streakFreeze.mjs';
export const STREAK_MILESTONES = [2, 5, 10, 30, 60, 100, 120, 150, 180, 210, 240, 270, 300, 330, 365];
const sessionAcknowledgements = new Map();
export const getStreakToday = (now = new Date()) => now.toISOString().slice(0, 10);

export function getStreakSnapshot(calendar, today = getStreakToday(), options) {
    return frozenStreakSnapshot(calendar, today, options);
}

export function getPendingFreezeCelebration(snapshot, userId, storage) {
    if (!snapshot.ready || !userId || !snapshot.runStart) return null;
    const latest = snapshot.freezes?.filter(freeze => freeze.runStart === snapshot.runStart &&
        (freeze.resumedOn === snapshot.today || (!snapshot.isTodayCompleted && freeze.resumedOn === addStreakDays(snapshot.today, -1)))).at(-1);
    if (!latest) return null;
    const key = `streak-freezes:v1:${encodeURIComponent(userId)}:${latest.month}`;
    const milestone = Number(latest.date.replaceAll('-', ''));
    if (readStreakAcknowledgement(key, storage) >= milestone) return null;
    return { key, milestone, kind: 'freeze', frozenDate: latest.date, days: snapshot.days, runStart: snapshot.runStart };
}

export function getCelebrationMilestones(levels = []) {
    return [...new Set([...STREAK_MILESTONES, ...levels.map(level => level.daysMin)])]
        .filter(day => Number.isInteger(day) && day >= 2).sort((a, b) => a - b);
}

export function readStreakAcknowledgement(key, storage) {
    let stored = 0;
    try {
        const value = JSON.parse(storage?.getItem(key) || '0');
        if (Number.isInteger(value) && value >= 0) stored = value;
    } catch { /* Corrupt or unavailable storage must not suppress congratulations. */ }
    return Math.max(stored, sessionAcknowledgements.get(key) || 0);
}

export function acknowledgeStreakCelebration(event, storage) {
    const value = Math.max(event.milestone, readStreakAcknowledgement(event.key, storage));
    sessionAcknowledgements.set(event.key, value);
    try { storage?.setItem(event.key, JSON.stringify(value)); } catch { /* Session fallback remains available. */ }
}

export function getPendingStreakCelebration(snapshot, userId, levels = [], storage) {
    if (!snapshot.ready || !userId || !snapshot.runStart || snapshot.days < 2) return null;
    const key = `streak-celebrations:v2:${encodeURIComponent(userId)}:${snapshot.runStart}`;
    const milestone = getCelebrationMilestones(levels).filter(day => day <= snapshot.days).at(-1);
    if (!milestone || readStreakAcknowledgement(key, storage) >= milestone) return null;
    // Recover only the latest reached milestone instead of showing a queue of old windows.
    return { key, milestone, days: snapshot.days, runStart: snapshot.runStart };
}
