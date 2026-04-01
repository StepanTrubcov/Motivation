'use client';
import React from "react";
import { useLanguage } from '@/context/LanguageContext';
import c from './TodaysGoals.module.css'

const toRows = (node) => {
    if (node == null) return [];
    return Array.isArray(node) ? node : [node];
};

const TodaysGoals = ({
    inProgress,
    completed,
    completedCount,
    totalTodayGoals,
    pointsFromCompletedToday,
}) => {
    const { t } = useLanguage();

    const inProgressRows = toRows(inProgress);
    const completedRows = toRows(completed);

    if (inProgressRows.length === 0 && completedRows.length === 0) {
        return <div data-tutorial-id="today-goals">
            <div className={c.name} >
                {t('todayGoals')}
            </div>
            <div className={c.blok}>{t('noSuchGoals')}</div>
        </div>
    }

    const progressText = t('todayGoalsCompletedOfTotal')
        .replace('{done}', String(completedCount))
        .replace('{total}', String(totalTodayGoals));

    const pointsLine = `+${pointsFromCompletedToday} ${t('pts')}`;

    return (
        <div data-tutorial-id="today-goals">
            <div className={c.name}>{t('todayGoals')}</div>
            <div className={c.summaryCard}>
                <div className={c.summaryRow}>
                    <span className={c.summaryFire} aria-hidden>🔥</span>
                    <span className={c.summaryProgress}>{progressText}</span>
                </div>
                <div className={c.summaryPoints}>{pointsLine}</div>
            </div>
            <div className={c.carouselWrap}>
                <div
                    className={c.carousel}
                    role="list"
                    aria-label={t('todayGoals')}
                >
                    {inProgressRows}
                    {completedRows}
                </div>
            </div>
        </div>
    );
}

export default TodaysGoals;
