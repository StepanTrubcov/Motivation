import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import styles from './ModalWindow.module.css'


const ModalWindow = ({
    isModalOpen,
    addNewStatus,
    closeModal,
    isTutorialGoalModal,
    tutorialPhase,
    onTutorialDurationSelect,
    onTutorialTakeGoalConfirm,
}) => {
    const { t } = useLanguage();

    const number = [
        { id: 0, name: t('days120'), value: 120 },
        { id: 1, name: t('days60'), value: 60 },
        { id: 2, name: t('days30'), value: 30 },
    ];

    const [selectedOption, setSelectedOption] = useState(null);
    const [showCongrats, setShowCongrats] = useState(false);
    const modalContentRef = useRef(null);
    const durationBlockRef = useRef(null);
    const [dimRects, setDimRects] = useState(null);

    const showTutorialDurationHighlight = isTutorialGoalModal && tutorialPhase === 'duration';
    const showTutorialButtonHighlight = isTutorialGoalModal && tutorialPhase === 'button';
    const showTutorialDimInModal = showTutorialDurationHighlight && dimRects;

    useLayoutEffect(() => {
        const isDurationStep = isTutorialGoalModal && tutorialPhase === 'duration';
        if (!isDurationStep || !isModalOpen || !modalContentRef.current) {
            setDimRects(null);
            return;
        }
        const measure = () => {
            const modalEl = modalContentRef.current;
            if (!modalEl) return;
            const modal = modalEl.getBoundingClientRect();
            setDimRects({
                modal: { top: modal.top, left: modal.left, width: modal.width, height: modal.height },
                hole: {
                    top: 0,
                    left: 0,
                    width: modal.width,
                    height: modal.height,
                },
            });
        };
        measure();
        const t = requestAnimationFrame(() => requestAnimationFrame(measure));
        const roModal = new ResizeObserver(measure);
        roModal.observe(modalContentRef.current);
        return () => {
            cancelAnimationFrame(t);
            roModal.disconnect();
        };
    }, [isTutorialGoalModal, tutorialPhase, isModalOpen]);

    useEffect(() => {
        if (!isModalOpen) {
            setSelectedOption(null);
            setShowCongrats(false);
        }
    }, [isModalOpen]);

    const handleOptionChange = (id) => {
        setSelectedOption(id);
        if (isTutorialGoalModal && tutorialPhase === 'duration' && onTutorialDurationSelect) {
            onTutorialDurationSelect();
        }
    };

    const handleAddStatus = () => {
        if (selectedOption === null) return;
        if (isTutorialGoalModal) {
            const days = number[selectedOption]?.value;
            addNewStatus(days, { fromTutorial: true });
            onTutorialTakeGoalConfirm?.(days);
            closeModal();
            return;
        }
        addNewStatus(number[selectedOption]?.value);
    };

    const handleCongratsClose = () => {
        setShowCongrats(false);
        if (selectedOption !== null && onTutorialTakeGoalConfirm) {
            onTutorialTakeGoalConfirm(number[selectedOption]?.value);
        }
    };

    /* Затемнение поверх модалки не рендерим: дырка = всё окно, внутри затемнения нет */
    const fixedDimOverlay = null;

    return <>
        <AnimatePresence>
        {isModalOpen && (
            <motion.div
                className={`${styles.modalBackdrop} ${isTutorialGoalModal ? styles.modalBackdropTutorial : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeModal}
            >
                <motion.div
                    ref={modalContentRef}
                    className={`${styles.modalContent} ${showTutorialDimInModal ? styles.modalContentTutorialDim : ''} ${showTutorialDimInModal ? styles.tutorialModalFullHighlight : ''}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={closeModal}
                        className={styles.closeButton}
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                    <h2 className={styles.modalTitle}>{isModalOpen.title}</h2>
                    {isModalOpen.image && (<img className={styles.modalImg} src={isModalOpen.image} />)}
                    <p className={styles.modalText}>{isModalOpen.description}</p>
                    <div>
                        <div
                            ref={durationBlockRef}
                            {...(isTutorialGoalModal ? { 'data-tutorial-id': 'goals-take-modal-duration' } : {})}
                        >
                            <div className={styles.radioGroup}>
                                {number.map((item) => (
                                    <label key={item.id} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="duration"
                                            value={item.id}
                                            checked={selectedOption === item.id}
                                            onChange={() => handleOptionChange(item.id)}
                                            className={styles.radioInput}
                                        />
                                        <span className={styles.radioButton}></span>
                                        {item.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAddStatus}
                            className={`${styles.actionButton} ${showTutorialButtonHighlight ? styles.tutorialHighlightButton : ''}`}
                            disabled={selectedOption === null}
                            {...(isTutorialGoalModal ? { 'data-tutorial-id': 'goals-take-modal-button' } : {})}
                        >
                            {t('takeGoalFor')} {number[selectedOption]?.name}
                        </button>
                    </div>
                </motion.div>

                {!isTutorialGoalModal && (
                    <AnimatePresence>
                        {showCongrats && (
                            <motion.div
                                className={styles.congratsBackdrop}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.div
                                    className={styles.congratsCard}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <p className={styles.congratsText}>{t('tutorialGoalFirstTaken')}</p>
                                    <button type="button" className={styles.actionButton} onClick={handleCongratsClose}>
                                        {t('tutorialDone')}
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </motion.div>
        )}
        </AnimatePresence>
        {fixedDimOverlay}
    </>
}

export default ModalWindow;