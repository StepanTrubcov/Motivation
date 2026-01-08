import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import styles from './ModalWindowAchievements.module.css';

const ModalWindowAchievements = ({ isModalOpen, closeModal }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const rarityClass = isModalOpen?.active;

    return (
        <AnimatePresence>
            {isModalOpen && (
                <motion.div
                    className={styles.modalBackdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                >
                    <motion.div
                        className={styles.modalContent}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className={styles.closeButton}
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
                                    {isModalOpen?.points} pts
                                </div>
                            </div>
                        </div>
                        <div
                            className={`${styles.howToGet} ${styles[rarityClass]} `}
                            onClick={() => setIsExpanded(prev => !prev)}
                        >
                            <div className={styles.howToGetHeader}>
                                <span>Как получить ачивку:</span>
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
                                            • Ачивка сама будет к вам добавлена
                                        </pre>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWindowAchievements;
