'use client';
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
    const [listOpen, setListOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!listOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [listOpen]);

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

    const modal = mounted && createPortal(
        <AnimatePresence>
            {listOpen && (
                <motion.div
                    className={c.sheetBackdrop}
                    role="presentation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setListOpen(false)}
                >
                    <motion.div
                        className={c.sheet}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="today-goals-sheet-title"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={c.sheetHandle} aria-hidden />
                        <button
                            type="button"
                            className={c.sheetClose}
                            onClick={() => setListOpen(false)}
                            aria-label={t('close')}
                        >
                            <X size={22} />
                        </button>
                        <h2 id="today-goals-sheet-title" className={c.sheetTitle}>
                            {t('todayGoals')}
                        </h2>
                        <div className={c.sheetList}>
                            {inProgressRows}
                            {completedRows}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );

    return (
        <div data-tutorial-id="today-goals">
            <div className={c.name}>{t('todayGoals')}</div>
            <div className={c.summaryCard}>
                <div className={c.summaryRow}>
                    <span className={c.summaryFire} aria-hidden>🔥</span>
                    <span className={c.summaryProgress}>{progressText}</span>
                </div>
                <div className={c.summaryPoints}>{pointsLine}</div>
                <button
                    type="button"
                    className={c.viewGoalsBtn}
                    onClick={() => setListOpen(true)}
                >
                    {t('viewTodayGoals')}
                </button>
            </div>
            {modal}
        </div>
    );
}

export default TodaysGoals;
