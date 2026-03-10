import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import styles from './ModalWindowAchievements.module.css';

const ModalWindowAchievements = ({ isModalOpen, closeModal }) => {
    const { t } = useLanguage();
    const { currentStep, onTutorialActionDone } = useTutorial();
    const [isExpanded, setIsExpanded] = useState(false);

    const rarityClass = isModalOpen?.active;

    return (
        <AnimatePresence>
            {isModalOpen && (() => {
                const tutorialBlockClose = currentStep?.id === 'achievements-how-to-get';
                return (
                <motion.div
                    className={styles.modalBackdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={tutorialBlockClose ? (e) => { e.preventDefault(); e.stopPropagation(); } : closeModal}
                >
                    <motion.div
                        className={styles.modalContent}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        data-tutorial-id="achievements-how-to-get-modal"
                    >
                        <button
                            type="button"
                            onClick={tutorialBlockClose ? (e) => { e.preventDefault(); e.stopPropagation(); } : closeModal}
                            className={styles.closeButton}
                            aria-label={t('close')}
                            style={tutorialBlockClose ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                            aria-disabled={tutorialBlockClose}
                        >
                            <X size={24} />
                        </button>

                        <div
                            className={`${styles.card} ${styles[rarityClass]}`}
                        >
                            <div className={styles.cardInner}>
                                <div className={styles.imageWrapper}>
                                    <img
                                        className={styles.img}
                                        src={isModalOpen?.gif}
                                        alt={isModalOpen?.title}
                                    />
                                </div>

                                <div className={styles.ribbon}>
                                    <span>{isModalOpen?.rarity}</span>
                                </div>

                                <div className={styles.title}>
                                    {isModalOpen?.title}
                                </div>

                                <div className={styles.points}>
                                    {isModalOpen?.points} {t('pts')}
                                </div>
                            </div>
                        </div>
                        <div
                            className={`${styles.howToGet} ${styles[rarityClass]} `}
                            onClick={() => {
                                if (currentStep?.id === 'achievements-how-to-get') {
                                    onTutorialActionDone('click_how_to_get_arrow');
                                }
                                setIsExpanded(prev => !prev);
                            }}
                            data-tutorial-id="achievements-how-to-get-block"
                        >
                            <div className={styles.howToGetHeader}>
                                <span>{t('howToGetAchievement')}</span>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight size={20} />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        className={styles.howToGetContent}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <pre className={styles.previewText}>
                                            {isModalOpen?.requirement}
                                            {rarityClass !== 'epic' && `\n${t('achievementWillBeAdded')}`}
                                        </pre>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </motion.div>
                </motion.div>
                );
            })()}
        </AnimatePresence>
    );
};

export default ModalWindowAchievements;
