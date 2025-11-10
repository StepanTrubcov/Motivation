'use client';
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import styles from "./ModalWindowGeneration.module.css";
import { toast } from "react-hot-toast";

const ModalWindowGeneration = ({profile, telegramId, yesterdayReport = [], addTextGenerationData, isModalOpen, closeModal, goalsDone = [], goalsInProgress = [], setIsModalOpenText }) => {
    const [loading, setLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [error, setError] = useState("");
    const [prevGoals, setPrevGoals] = useState({ done: [], inProgress: [] });

    useEffect(() => {
        const currentGoals = {
            done: goalsDone || [],
            inProgress: goalsInProgress || []
        };
        if (JSON.stringify(currentGoals) !== JSON.stringify(prevGoals)) {
            setGeneratedText('');
            setPrevGoals(currentGoals);
        }
    }, [goalsDone, goalsInProgress, prevGoals]);

    const generation = async () => {
        setLoading(true);
        setError("");
        setGeneratedText("");
        
        await addTextGenerationData(profile.usersTag, telegramId, goalsDone, goalsInProgress, setGeneratedText, setLoading)
        toast.success("Отчёт за сегодня успешно сохранён! 📝");
    };
    
    const copyToClipboard = async (text) => {
        await navigator.clipboard.writeText(text);
        toast.success("Отчёт скопирован!");
        closeModal()
    };

    return (
        <AnimatePresence>
            {isModalOpen && (
                <motion.div
                    className={styles.modalBackdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={closeModal}
                >
                    <motion.div
                        className={styles.modalContent}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className={styles.closeButton}
                            aria-label="Закрыть модальное окно"
                        >
                            <X size={24} />
                        </button>

                        <h2 className={styles.modalTitle}>
                            Генерация отчёта о сегодняшних целях
                        </h2>
                        {generatedText && (<div>
                            <div className={styles.generation__text}>
                                Сегодняшний отчёт
                            </div>
                            <div className={styles.generatedBox}>
                                <div onClick={() => setIsModalOpenText(generatedText)} className={styles.previewWrapper}>
                                    <pre className={styles.previewText}>
                                        {generatedText.split("\n").slice(0, 1).join("\n")}
                                        {generatedText.split("\n").length > 1 ? "\n..." : ""}
                                    </pre>
                                </div>
                                <button
                                    className={styles.copyButton}
                                    onClick={() => copyToClipboard(generatedText)}
                                    aria-label="Копировать отчёт"
                                >
                                    <Copy size={28} />
                                </button>
                            </div>
                        </div>
                        ) || (
                                <div>
                                    <div className={styles.modalTextInfo}>
                                        ✨ Сгенерируйте сегодняшний отчёт и можете отправлить его в Хорошую компанию, Telegram-канал или сохранить для себя.
                                    </div>
                                    <button
                                        className={styles.button}
                                        onClick={generation}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className={styles.text}>
                                                Генерация...</div>
                                        ) : (
                                            <div className={styles.text}>
                                                <img
                                                    className={styles.img}
                                                    src="https://cdn-icons-png.flaticon.com/512/11865/11865338.png"
                                                    alt="generate"
                                                />
                                                Сгенерировать
                                            </div>
                                        )}
                                    </button>
                                </div>
                            )}
                        {yesterdayReport[0] && (<div>
                            <div className={styles.generation__text}>
                                Прошлый отчёт
                            </div>
                            <div className={styles.generatedBox}>
                                <div onClick={() => setIsModalOpenText(yesterdayReport[0].text)} className={styles.previewWrapper}>
                                    <pre className={styles.previewText}>
                                        {yesterdayReport[0].text.split("\n").slice(0, 1).join("\n")}
                                        {yesterdayReport[0].text.split("\n").length > 1 ? "\n..." : ""}
                                    </pre>
                                </div>
                                <button
                                    className={styles.copyButton}
                                    onClick={() => copyToClipboard(yesterdayReport[0].text)}
                                    aria-label="Копировать отчёт"
                                >
                                    <Copy size={28} />
                                </button>
                            </div>
                        </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWindowGeneration;
