import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import c from './Lights.module.css';
import StreakCelebration from './StreakCelebration';
import StreakFreezeNotice from './StreakFreezeNotice';
import { LEVELS_OF_LIGHTS, GRAY_LIGHT_URL } from '@/lib/streakImages';
import { acknowledgeStreakCelebration, getPendingStreakCelebration, getPendingFreezeCelebration } from '@/lib/streakCelebrations.mjs';

const SUBTITLE_KEYS = {
    2: 'milestone2Subtitle', 5: 'milestone5Subtitle', 10: 'milestone10Subtitle',
    30: 'milestone30Subtitle', 60: 'milestone60Subtitle', 100: 'milestone100Subtitle',
    120: 'milestone120Subtitle', 150: 'milestone150Subtitle', 180: 'milestone180Subtitle',
    210: 'milestone210Subtitle', 240: 'milestone240Subtitle', 270: 'milestone270Subtitle',
    300: 'milestone300Subtitle', 330: 'milestone330Subtitle', 365: 'milestone365Subtitle',
};
const getStorage = () => {
    try { return window.localStorage; } catch { return undefined; }
};
const lightForDays = num => LEVELS_OF_LIGHTS.find(level => num >= level.daysMin && num <= level.daysMax)
    || LEVELS_OF_LIGHTS[LEVELS_OF_LIGHTS.length - 1];

const Lights = ({ snapshot, userId }) => {
    const { t, language } = useLanguage();
    const { days: num, isTodayCompleted, runStart, ready, today } = snapshot;
    const [celebration, setCelebration] = useState(null);
    const dayForm = new Intl.PluralRules(language === 'ru' ? 'ru' : 'en').select(num);
    const dayLabel = language === 'ru'
        ? ({ one: 'день', few: 'дня', many: 'дней', other: 'дней' }[dayForm])
        : (num === 1 ? 'day' : 'days');

    useEffect(() => {
        const pending = getPendingFreezeCelebration(snapshot, userId, getStorage()) ||
            getPendingStreakCelebration(snapshot, userId, LEVELS_OF_LIGHTS, getStorage());
        setCelebration(previous => previous?.key === pending?.key && previous?.milestone === pending?.milestone
            ? previous : pending);
    }, [snapshot, userId]);

    const closeCelebration = useCallback(() => {
        if (celebration) acknowledgeStreakCelebration(celebration, getStorage());
        setCelebration(getPendingFreezeCelebration(snapshot, userId, getStorage()) ||
            getPendingStreakCelebration(snapshot, userId, LEVELS_OF_LIGHTS, getStorage()));
    }, [celebration, snapshot, userId]);

    const finalUrl = num >= 2 && isTodayCompleted ? lightForDays(num).url : GRAY_LIGHT_URL;
    const currentKey = userId && runStart ? `streak-celebrations:v2:${encodeURIComponent(userId)}:${runStart}` : null;
    const isFreeze = celebration?.kind === 'freeze';
    const matchesFreeze = isFreeze && userId && celebration.key === `streak-freezes:v1:${encodeURIComponent(userId)}:${celebration.frozenDate.slice(0, 7)}` &&
        celebration.runStart === runStart && snapshot.freezes?.some(freeze => freeze.date === celebration.frozenDate);
    const activeCelebration = (isFreeze ? matchesFreeze : celebration?.key === currentKey) && ready && num >= celebration.days ? celebration : null;
    const subtitleKey = activeCelebration && activeCelebration.days === activeCelebration.milestone
        ? SUBTITLE_KEYS[activeCelebration.milestone] : null;

    return <>
        <div className={c.Lights}>
            <img className={c.img} src={finalUrl} alt={t('seriesFire')} title={t(snapshot.freezeAvailable ? 'streakFreezeAvailable' : 'streakFreezeUsed')} />
            <span className={c.text}>{num} {dayLabel}</span>
        </div>
        {activeCelebration && (isFreeze ? <StreakFreezeNotice
            key={activeCelebration.key}
            frozenDate={activeCelebration.frozenDate}
            onClose={closeCelebration}
        /> : <StreakCelebration
            key={`${activeCelebration.key}:${activeCelebration.milestone}`}
            num={activeCelebration.days}
            imageUrl={lightForDays(activeCelebration.days).url}
            subtitle={t(subtitleKey || 'streakPreviewSubtitle')}
            onClose={closeCelebration}
        />)}
    </>;
};

export default Lights;
