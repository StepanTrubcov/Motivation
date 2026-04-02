'use client';
import React, { useState } from "react";
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
    const [expanded, setExpanded] = useState(false);

    const inProgressRows = toRows(inProgress);
    const completedRows = toRows(completed);

    if (inProgressRows.length === 0 && completedRows.length === 0) {
        return <div data-tutorial-id="today-goals">
            <div className={c.blok}>{t('takeTheTargets')}</div>
        </div>
    }

    const progressText = t('todayGoalsCompletedOfTotal')
        .replace('{done}', String(completedCount))
        .replace('{total}', String(totalTodayGoals));

    const pointsLine = `+${pointsFromCompletedToday} ${t('pts')}`;
    const progressPercent = totalTodayGoals > 0
        ? Math.max(0, Math.min(100, (completedCount / totalTodayGoals) * 100))
        : 0;

    return (
        <div data-tutorial-id="today-goals">
            <div className={c.summaryCard}>
                <div className={c.summaryRow}>
                    <div className={c.name}>{t('todayGoals')}</div>
                    <span className={c.summaryProgress}>{progressText}</span>
                </div>
                <div
                    className={c.progressTrack}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progressPercent)}
                >
                    <div
                        className={c.progressFill}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <button
                    type="button"
                    className={c.viewGoalsBtn}
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                >
                    {expanded ? t('hideTodayGoals') : t('viewTodayGoals')}
                </button>
                <div className={`${c.inlineListWrap} ${expanded ? c.inlineListOpen : ''}`}>
                    <div className={c.inlineList}>
                        {inProgressRows}
                        {completedRows}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodaysGoals;
