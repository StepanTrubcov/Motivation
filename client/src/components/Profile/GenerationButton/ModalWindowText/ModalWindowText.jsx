'use client';
import styles from './ModalWindowText.module.css'
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import toast from "react-hot-toast";

const ModalWindowText = ({ isModalOpenText, closeModalText }) => {
    const { t } = useLanguage();
    const { onTutorialActionDone } = useTutorial();
    const copyToClipboard = async (text) => {
        await navigator.clipboard.writeText(text);
        toast.success(t('reportCopied'), {
            style: {
                background: '#333',
                color: '#fff',
                marginTop: '80px',
            }
        });
        closeModalText();
    };
    const handleCopyClick = () => {
        if (onTutorialActionDone) onTutorialActionDone('copy_report');
        copyToClipboard(isModalOpenText);
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
                        data-tutorial-id="report-modal"
                    >
                        <button
                            onClick={closeModalText}
                            className={styles.closeButton}
                            aria-label={t('close')}
                        >
                            <X size={24} />
                        </button>
                        <pre className={styles.previewText}>
                            {isModalOpenText}
                        </pre>
                        <div className={styles.copyButtonIsModalBlok}>
                            <button
                                className={styles.copyButtonIsModal}
                                onClick={handleCopyClick}
                                aria-label={t('copy')}
                            >
                                {t('copy')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWindowText;
