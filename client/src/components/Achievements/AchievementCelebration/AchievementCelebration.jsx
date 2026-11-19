'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Share2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { achievementImageSrc } from '@/lib/achievementImages';
import c from './AchievementCelebration.module.css';

const CONFETTI = Array.from({ length: 140 }, (_, index) => ({
  left: `${(index * 37 + 3) % 100}%`,
  '--drift': `${(index % 2 ? 1 : -1) * (14 + index * 13 % 64)}px`,
  '--spin': `${(index % 2 ? 1 : -1) * (240 + index * 41)}deg`,
  '--delay': `${index * 53 % 2200}ms`,
  '--duration': `${2800 + index * 71 % 1400}ms`,
  '--piece-color': ['var(--spark)', '#ffe5a3', '#eafcf1'][index % 3],
  width: `${4 + index % 4}px`, height: `${7 + index % 6}px`,
}));

export default function AchievementCelebration({ achievement, onClose, onShare }) {
  const { language } = useLanguage();
  const titleId = useId();
  const panelRef = useRef(null), buttonRef = useRef(null), closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  const en = language === 'en';
  const rarity = ['common', 'rare', 'legendary', 'epic'].includes(achievement.rarity) ? achievement.rarity : 'common';
  const label = ({ common: ['Обычная', 'Common'], rare: ['Редкая', 'Rare'], legendary: ['Легендарная', 'Legendary'], epic: ['Эпическая', 'Epic'] })[rarity][en ? 1 : 0];

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    buttonRef.current?.focus({ preventScroll: true });
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const buttons = [...panelRef.current.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keydown);
      if (previous?.isConnected) previous.focus?.({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div className={`${c.overlay} ${c[rarity]}`} data-achievement-celebration="true">
      <div className={c.confetti} aria-hidden="true">
        {CONFETTI.map((style, index) => <span key={index} className={c.piece} style={style} />)}
      </div>
      <section ref={panelRef} className={c.panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button className={c.close} type="button" onClick={onClose} aria-label={en ? 'Close' : 'Закрыть'}><X size={20} /></button>
        <p className={c.eyebrow}>{en ? 'New achievement!' : 'Новая ачивка!'}</p>
        <div className={c.art}><img src={achievementImageSrc(achievement.image, achievement)} alt="" width={512} height={512} loading="eager" /></div>
        <h2 id={titleId} className={c.title}>{achievement.title}</h2>
        {achievement.description && <p className={c.description}>{achievement.description}</p>}
        <p className={c.rarity}>{label} · {en ? 'In your collection' : 'В коллекции'}</p>
        <button ref={buttonRef} className={c.primary} type="button" onClick={onClose}>{en ? 'Awesome!' : 'Класс!'}</button>
        <button className={c.share} type="button" onClick={onShare}><Share2 size={18} />{en ? 'Share' : 'Поделиться'}</button>
      </section>
    </div>, document.body,
  );
}
