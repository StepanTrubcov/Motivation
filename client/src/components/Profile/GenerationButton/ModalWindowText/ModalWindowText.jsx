'use client';
import styles from './ModalWindowText.module.css'
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import toast from "react-hot-toast";

const ModalWindowText = ({ isModalOpenText, closeModalText }) => {

    const copyToClipboard = async (text) => {
        await navigator.clipboard.writeText(text);
        toast.success("Отчёт скопирован!", {
            style: {
                background: '#333',
                color: '#fff',
            }
        });
        closeModalText()
    };

    return (
        <AnimatePresence>
            {isModalOpenText && (
                <motion.div
                    className={styles.modalBackdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={closeModalText}
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
                            onClick={closeModalText}
                            className={styles.closeButton}
                            aria-label="Закрыть модальное окно"
                        >
                            <X size={24} />
                        </button>
                        <pre className={styles.previewText}>
                            {isModalOpenText}
                        </pre>
                        <div className={styles.copyButtonIsModalBlok}>
                            <button
                                className={styles.copyButtonIsModal}
                                onClick={() => copyToClipboard(isModalOpenText)}
                                aria-label="Копировать отчёт"
                            >
                                Скопировать
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWindowText;
