'use client';

import { useLanguage } from '@/context/LanguageContext';
import { LEVELS_OF_LIGHTS, GRAY_LIGHT_URL, FROZEN_LIGHT_URL } from '@/lib/streakImages';
import { buildStreakHistory } from './streakHistory';
import c from './ContributionCalendar.module.css';

const fireForDay = streak => streak < 2 ? GRAY_LIGHT_URL
    : (LEVELS_OF_LIGHTS.find(level => streak >= level.daysMin && streak <= level.daysMax)
        || LEVELS_OF_LIGHTS[LEVELS_OF_LIGHTS.length - 1]).url;

export default function StreakStrip({ valuesMap, until }) {
    const { language, t } = useLanguage();
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    const days = buildStreakHistory(valuesMap, until);
    const current = days[13].completed ? days[13].streak : days[12].streak;
    const form = new Intl.PluralRules(locale).select(current);
    const label = t(form === 'one' ? 'streakDaysOne' : form === 'few' ? 'streakDaysFew' : 'streakDaysMany');
    return <div className={c.streakStrip}>
        <div className={c.stripHeader}>
            <img src={fireForDay(current)} className={c.stripHeaderFire} alt="" />
            <strong>{current} {label}</strong>
        </div>
        <div className={c.stripDays}>
            {days.map(day => {
                const date = new Date(`${day.date}T00:00:00Z`);
                const fullDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date);
                const description = `${fullDate}: ${day.frozen ? t('streakFrozenDay') : day.completed ? `${t('calendarStreak')}: ${day.streak}` : t('calendarNoCompletedGoals')}`;
                return <div className={`${c.stripDay} ${day.date === until ? c.stripToday : ''}`} key={day.date} title={description}>
                    <span className={c.stripMark} role="img" aria-label={description}>
                        {day.completed || day.frozen ? <img src={day.frozen ? FROZEN_LIGHT_URL : fireForDay(day.streak)} alt="" className={c.stripFire} decoding="async" /> : <span className={c.stripEmpty} />}
                    </span>
                    <span className={c.stripDate}>{date.getUTCDate()}</span>
                </div>;
            })}
        </div>
        <div className={c.stripCaption}><span>{t('calendarLast14Days')}</span><span>{t('calendarToday')}: {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${until}T00:00:00Z`))}</span></div>
    </div>;
}
