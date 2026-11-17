import AchievementImage from '../AchievementImage';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import styles from './ModalWindowAchievements.module.css';

export default function ModalWindowAchievements({ isModalOpen, closeModal }) {
    const { language } = useLanguage();
    const { currentStep, onTutorialActionDone, isOpen: isTutorialOpen } = useTutorial();
    const router = useRouter();
    const ru = language === 'ru';
    const blocked = isTutorialOpen && currentStep?.id === 'achievements-how-to-get';
    const rarity = isModalOpen?.active || 'common';
    const label = ({ common: ru ? 'Обычная' : 'Common', rare: ru ? 'Редкая' : 'Rare', legendary: ru ? 'Легендарная' : 'Legendary', epic: ru ? 'Эпическая' : 'Epic' })[rarity];
    const progress = isModalOpen?.progress;
    const percent = Math.min(100, Math.max(0, Number(progress?.percent) || 0));
    const type = isModalOpen?.type;
    const actionLabel = type === 'level_based' || type === 'time_based'
        ? (ru ? 'На главную' : 'Home')
        : type === 'collection_based' ? (ru ? 'К коллекции' : 'View collection')
        : type === 'goal_based' ? (ru ? 'К цели' : 'View goal')
        : (ru ? 'На главную' : 'Home');
    const navigate = () => {
        if (blocked) { onTutorialActionDone('click_how_to_get_arrow'); return; }
        closeModal();
        if (type === 'collection_based') return;
        if (type === 'goal_based') {
            const goalName = isModalOpen.requirement?.match(/«([^»]+)»/)?.[1];
            router.push(goalName ? `/goals?achievementGoal=${encodeURIComponent(goalName)}` : '/goals');
        } else router.push('/profile');
    };
    return <AnimatePresence>
        {isModalOpen && <motion.div className={styles.modalBackdrop} initial={false} onClick={blocked ? undefined : closeModal}>
            <motion.div className={`${styles.modalContent} ${styles[rarity]}`} initial={{ y: 48 }} animate={{ y: 0 }} exit={{ y: 48 }} transition={{ duration: 0.22 }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={isModalOpen.title} data-tutorial-id="achievements-how-to-get-modal">
                <div className={styles.handle} aria-hidden="true" />
                <button type="button" className={styles.closeButton} onClick={blocked ? undefined : closeModal} aria-disabled={blocked} aria-label={ru ? 'Закрыть' : 'Close'}><X size={24} /></button>
                <div className={styles.imageWrapper}><AchievementImage className={styles.img} image={isModalOpen.img} alt="" /></div>
                <h2 className={styles.title}>{isModalOpen.title}</h2>
                <span className={styles.rarityChip}>{label}</span>
                <div className={styles.explanation} data-tutorial-id="achievements-how-to-get-block">
                    <p className={styles.requirement}>{isModalOpen.requirement}</p>
                    {progress && <div className={styles.progressBlock}>
                        <div className={styles.progressRow}><span>{progress.current} {ru ? 'из' : 'of'} {progress.target}</span><span>{percent}%</span></div>
                        <div className={styles.track} role="progressbar" aria-label={ru ? 'Прогресс ачивки' : 'Achievement progress'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /></div>
                    </div>}
                </div>
                <button type="button" className={styles.action} onClick={navigate} data-tutorial-id="achievement-goal-action">{actionLabel}<ArrowRight size={20} /></button>
            </motion.div>
        </motion.div>}
    </AnimatePresence>;
}
