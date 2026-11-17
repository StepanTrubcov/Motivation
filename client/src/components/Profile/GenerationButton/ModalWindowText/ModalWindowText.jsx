'use client';
import styles from './ModalWindowText.module.css'
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { notifications as toast } from "@/lib/notifications";

const ModalWindowText = ({ isModalOpenText, closeModalText }) => {
    const { t } = useLanguage();
    const { onTutorialActionDone, currentStep } = useTutorial();
    const isReportViewStep = currentStep?.id === 'report-view';
    const copyToClipboard = async (text) => {
        const notice = toast.begin(t('generating'));
        try {
            await navigator.clipboard.writeText(text);
            notice.success(t('reportCopied'));
            if (onTutorialActionDone) onTutorialActionDone('copy_report');
            closeModalText();
        } catch (error) {
            console.error(error);
            notice.error(t('shareGenericFailed'));
        }
    };
    const handleCopyClick = () => {
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
                    onClick={isReportViewStep ? undefined : closeModalText}
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
                        <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>{t('reportWindowTitle')}</h2>
                        <button
                            type="button"
                            onClick={isReportViewStep ? undefined : closeModalText}
                            className={isReportViewStep ? `${styles.closeButton} ${styles.closeButtonDisabled}` : styles.closeButton}
                            aria-label={t('close')}
                            disabled={isReportViewStep}
                            tabIndex={isReportViewStep ? -1 : 0}
                        >
                            <X size={24} />
                        </button>
                        </div>
                        <pre className={styles.previewText}>
                            {isModalOpenText}
                        </pre>
                        <div className={styles.copyButtonIsModalBlok}>
                            <button
                                className={styles.copyButtonIsModal}
                                onClick={handleCopyClick}
                                aria-label={t('copy')}
                            >
                                <Copy size={18} aria-hidden="true" />
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
