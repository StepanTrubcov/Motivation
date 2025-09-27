import styles from './ModalWindowText.module.css'
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";

const ModalWindowText = ({ isModalOpenText, closeModalText }) => {
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
                            { isModalOpenText}
                        </pre>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWindowText;