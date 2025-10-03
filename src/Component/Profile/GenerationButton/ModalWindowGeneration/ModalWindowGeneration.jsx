import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import axios from "axios";
import styles from "./ModalWindowGeneration.module.css";
import gpt from '../../../../img/gpt.gif'
import { toast } from "react-hot-toast";

const ModalWindowGeneration = ({ nerationIsOver, text, addTextGenerationData, isModalOpen, closeModal, goalsDone = [], goalsInProgress = [], setIsModalOpenText }) => {
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
        await addTextGenerationData(goalsDone, goalsInProgress, setGeneratedText, setLoading)
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(generatedText);
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
                            Сгенерировать отчёт о сегодняшних целях
                        </h2>

                        <div className={styles.modalTextInfo}>
                            ✨ В конце дня вы можете собрать готовое сообщение: с галочками,
                            датой и личным комментарием от вашего лица. Такой отчёт удобно
                            копировать и отправлять в Telegram-чат или сохранять для себя.
                        </div>

                        {generatedText && (
                            <div className={styles.generatedBox}>
                                <div onClick={() => setIsModalOpenText(generatedText)} className={styles.previewWrapper}>
                                    <pre className={styles.previewText}>
                                        {generatedText.split("\n").slice(0, 1).join("\n")}
                                        {generatedText.split("\n").length > 1 ? "\n..." : ""}
                                    </pre>
                                </div>
                                <button
                                    className={styles.copyButton}
                                    onClick={copyToClipboard}
                                    aria-label="Копировать отчёт"
                                >
                                    <Copy size={28} />
                                </button>
                            </div>
                        ) || (
                                <button
                                    className={styles.button}
                                    onClick={generation}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className={styles.text}> <img
                                            className={styles.img}
                                            src={gpt}
                                            alt="generate"
                                        /> Генерация...</div>
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
                            )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWindowGeneration;
