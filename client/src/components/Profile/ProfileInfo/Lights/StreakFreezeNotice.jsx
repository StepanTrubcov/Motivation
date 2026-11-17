'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FROZEN_LIGHT_URL } from '@/lib/streakImages';
import c from './Lights.module.css';
import s from './StreakFreezeNotice.module.css';

export default function StreakFreezeNotice({ frozenDate, onClose }) {
    const { t, language } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const dialogRef = useRef(null);
    const closeRef = useRef(onClose);
    const detailsId = useId();
    useEffect(() => { closeRef.current = onClose; }, [onClose]);
    useEffect(() => {
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.querySelector('button')?.focus({ preventScroll: true });
        const keydown = event => {
            if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
            if (event.key !== 'Tab') return;
            const buttons = [...(dialogRef.current?.querySelectorAll('button') || [])];
            if (!buttons.length) return;
            const first = buttons[0], last = buttons.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', keydown);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', keydown);
            if (previous?.isConnected) previous.focus?.({ preventScroll: true });
        };
    }, []);
    const date = new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric', month: 'long', timeZone: 'UTC',
    }).format(new Date(`${frozenDate}T00:00:00Z`));

    return <div className={c.fullscreen} style={{ '--celebration-colour': '#45b8ff' }}>
        <section ref={dialogRef} className={`${c.modal} ${s.modal}`} role="dialog" aria-modal="true" aria-label={t('freezeNoticeTitle')}>
            <p className={c.eyebrow}>{t('freezeNoticeEyebrow')}</p>
            <div className={`${c.hero} ${expanded ? s.compactHero : ''}`}>
                <div className={c.flameGlow} aria-hidden="true" />
                <img className={`${c.modalImg} ${s.flame}`} src={FROZEN_LIGHT_URL} width={512} height={512} alt="" />
            </div>
            <h2 className={`${c.title} ${s.title}`}>{t('freezeNoticeTitle')}</h2>
            <p className={c.subtitle}>{t('freezeNoticeSummary').replace('{date}', date)}</p>
            <div id={detailsId} className={s.details} hidden={!expanded}>
                <h3>{t('freezeNoticeHow')}</h3>
                <ul>
                    {['freezeRuleReturn', 'freezeRuleMonthly', 'freezeRuleLongGap', 'freezeRuleNoPoints'].map(key => <li key={key}>{t(key)}</li>)}
                </ul>
            </div>
            <div className={s.actions}>
                <button className={c.button} onClick={onClose}>{t('freezeNoticeGreat')}</button>
                <button className={s.more} aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(value => !value)}>
                    {t(expanded ? 'freezeNoticeLess' : 'freezeNoticeMore')}
                </button>
            </div>
        </section>
    </div>;
}
