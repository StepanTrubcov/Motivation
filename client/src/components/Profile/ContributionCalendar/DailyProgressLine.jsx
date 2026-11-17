'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { addDays } from './streakHistory';

export default function DailyProgressLine({ valuesMap, until, goalsCount }) {
    const { language, t } = useLanguage();
    const ref = useRef(null);
    const [width, setWidth] = useState(300);
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            const next = entries[0]?.contentRect.width;
            if (next > 0) setWidth(next);
        });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const maximum = Math.max(0, Math.floor(Number(goalsCount) || 0));
    const left = Math.max(24, String(maximum).length * 7 + 14);
    const height = Math.max(138, maximum * 16 + 22);
    const top = 10;
    const bottom = height - 12;
    const plotWidth = Math.max(1, width - left - 8);
    const scale = Math.max(1, maximum);
    const y = value => bottom - Math.min(maximum, value) / scale * (bottom - top);
    const ticks = Array.from({ length: maximum + 1 }, (_, index) => index);
    const points = Array.from({ length: 12 }, (_, index) => {
        const date = addDays(until, index - 11);
        const value = Math.max(0, Number(valuesMap?.[date] || 0));
        return { date, value, x: left + index / 11 * plotWidth, y: y(value) };
    });
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return <div ref={ref}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', width: '100%', height }} role="img" aria-label={t('calendarLast12Days')}>
            {ticks.map(value => <g key={value}>
                <line x1={left} y1={y(value)} x2={width - 8} y2={y(value)} stroke="var(--border-color, rgba(255,255,255,0.1))" strokeWidth="1" />
                <text x={left - 8} y={y(value) + 4} textAnchor="end" fontSize="11">{value}</text>
            </g>)}
            {points.slice(1).map((point, index) => {
                const previous = points[index];
                const color = point.value > previous.value ? 'var(--chart-rise, #41ed87)'
                    : point.value < previous.value ? 'var(--chart-fall, #ff5262)'
                    : maximum > 0 && point.value === maximum ? 'var(--chart-full, #15994c)'
                    : 'var(--chart-flat, #ffda35)';
                return <line key={point.date} x1={previous.x} y1={previous.y} x2={point.x} y2={point.y} stroke={color} strokeWidth="2.4" strokeLinecap="round" />;
            })}
            {points.map(point => <circle key={point.date} cx={point.x} cy={point.y} r="2.5" fill="var(--foreground, #ededed)">
                <title>{new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${point.date}T00:00:00Z`))}: {point.value}</title>
            </circle>)}
        </svg>
    </div>;
}
