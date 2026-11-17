'use client';

import { useLanguage } from '@/context/LanguageContext';
import c from './ContributionCalendar.module.css';

// Fixed completion colours; the app accent never changes this scale.
const COLORS = ['var(--calendar-empty, #343a3d)', 'var(--calendar-1, #ff5c68)', 'var(--calendar-2, #ffad36)', 'var(--calendar-3, #ffdc55)', 'var(--calendar-4, #73eea9)', 'var(--calendar-5, #21d990)'];
const DAYS = { ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };
const addDays = (date, delta) => {
    const result = new Date(`${date}T00:00:00Z`);
    result.setUTCDate(result.getUTCDate() + delta);
    return result.toISOString().slice(0, 10);
};

export default function GoalCalendar({ valuesMap, until, columns }) {
    const { language, t } = useLanguage();
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    const dayNames = DAYS[language] || DAYS.en;
    const today = new Date(`${until}T00:00:00Z`);
    // End each column on Sunday; its first row is always Monday.
    const sunday = addDays(until, (7 - today.getUTCDay()) % 7);
    const start = addDays(sunday, -(columns * 7 - 1));
    const step = 13;
    const left = 30;
    const top = 20;
    const width = left + columns * step;
    const cells = [];
    const months = [];
    const monthGroups = [];
    for (let col = 0; col < columns; col++) {
        const firstDate = addDays(start, col * 7);
        const month = firstDate.slice(0, 7);
        const lastGroup = monthGroups[monthGroups.length - 1];
        if (lastGroup?.month === month) lastGroup.end = col;
        else monthGroups.push({ month, start: col, end: col, date: firstDate });
        for (let row = 0; row < 7; row++) {
            const iso = addDays(firstDate, row);
            if (iso > until) continue;
            const count = Number(valuesMap?.[iso] || 0);
            const label = `${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))}: ${count} ${goalLabel(count, language)}`;
            cells.push(<circle key={iso} cx={left + col * step + 5} cy={top + row * step + 5} r="4.5" fill={COLORS[Math.min(5, Math.max(0, count))]}><title>{label}</title></circle>);
        }
    }
    for (const group of monthGroups) {
        // Centre a label over its weeks; omit narrow edge fragments to avoid collisions.
        if (group.end - group.start < 1 && monthGroups.length > 1) continue;
        const label = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
            .format(new Date(`${group.date}T00:00:00Z`)).replace(/\.$/, '');
        months.push(<text key={group.month} x={left + (group.start + group.end) * step / 2 + 5} y="11" fontSize="10" textAnchor="middle">{label}</text>);
    }
    return <div>
        <svg className={c.goalGrid} viewBox={`0 0 ${width} 112`} role="img" aria-label={t('calendarCompletedGoals')}>
            {months}
            {dayNames.map((day, row) => <text key={day} x="0" y={top + row * step + 8} fontSize="9">{day}</text>)}
            {cells}
        </svg>

    </div>;
}

function goalLabel(count, language) {
    const form = new Intl.PluralRules(language === 'ru' ? 'ru' : 'en').select(count);
    if (language !== 'ru') return form === 'one' ? 'goal' : 'goals';
    return form === 'one' ? 'цель' : form === 'few' ? 'цели' : 'целей';
}

export function GoalCalendarLegend() {
    const { language, t } = useLanguage();
    return (
        <div className={c.legend} aria-label={t('calendarCompletedGoals')}>
            {[1, 3, 5].map(count => <span className={c.legendItem} key={count} aria-label={`${count === 5 ? '5+' : count} ${goalLabel(count, language)}`}><span className={c.legendDot} style={{ backgroundColor: COLORS[count] }} />{count === 5 ? '5+' : count}</span>)}
        </div>
    );
}
