'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getStreakCelebrationColor } from '@/lib/streakImages';
import c from './Lights.module.css';

const CONFETTI = Array.from({ length: 34 }, (_, index) => ({
    left: `${(index * 61) % 100}%`,
    '--drift': `${(index % 2 ? 1 : -1) * (24 + (index * 17) % 65)}px`,
    '--spin': `${(index % 2 ? 1 : -1) * (240 + index * 29)}deg`,
    '--delay': `${350 + (index * 47) % 650}ms`,
    '--duration': `${1900 + (index * 73) % 1000}ms`,
    '--piece-colour': ['var(--celebration-colour)', 'var(--celebration-light)', 'var(--celebration-pale)'][index % 3],
    width: `${4 + index % 3}px`,
    height: `${7 + index % 6}px`,
}));

export default function StreakCelebration({ num, imageUrl, subtitle, onClose, eyebrow }) {
    const { t, language } = useLanguage();
    const buttonRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const form = new Intl.PluralRules(language === 'ru' ? 'ru' : 'en').select(num);
    const days = t(form === 'one' ? 'streakDaysOne' : form === 'few' ? 'streakDaysFew' : 'streakDaysMany');
    const colour = getStreakCelebrationColor(num, imageUrl);

    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => {
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        buttonRef.current?.focus({ preventScroll: true });
        const handleKey = (event) => {
            if (event.key === 'Escape') onCloseRef.current();
            if (event.key === 'Tab') { event.preventDefault(); buttonRef.current?.focus({ preventScroll: true }); }
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', handleKey);
            if (previous?.isConnected) previous.focus?.({ preventScroll: true });
        };
    }, []);

    return <div className={c.fullscreen} style={{ '--celebration-colour': colour }}>
        <div className={c.modal} role="dialog" aria-modal="true" aria-label={`${eyebrow || t('streakMilestone')}: ${num} ${days}`}>
            <div className={c.confetti} aria-hidden="true">
                {CONFETTI.map((style, index) => <span key={index} className={c.confettiPiece} style={style} />)}
            </div>
            <div className={c.celebrationFlash} aria-hidden="true" />
            <p className={c.eyebrow}>{eyebrow || t('streakMilestone')}</p>
            <div className={c.hero}>
                <div className={c.flameGlow} aria-hidden="true" />
                <div className={c.flameRing} aria-hidden="true" />
                <img className={c.modalImg} src={imageUrl} alt="" width={512} height={512} loading="eager" />
            </div>
            <p className={c.number}>{num}</p>
            <h2 className={c.title}>{days}</h2>
            <p className={c.subtitle}>{subtitle || t('streakPreviewSubtitle')}</p>
            <button ref={buttonRef} className={c.button} onClick={onClose}>{t('continue')}</button>
        </div>
    </div>;
}
