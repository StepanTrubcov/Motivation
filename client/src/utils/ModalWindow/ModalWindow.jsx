import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import GoalIcon from '@/components/GoalIcon/GoalIcon';
import { useLanguage } from '@/context/LanguageContext';
import { formatGoalQuantity, formatGoalDurationChoice, formatGoalTitleWithTime } from '@/lib/goalTimeOptions';
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
    const { t, language } = useLanguage();

    const number = [
        { name: t('days30'), value: 30 },
        { name: t('days60'), value: 60 },
        { name: t('days120'), value: 120 },
    ];

    const [selectedOption, setSelectedOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(null);
    const quantityOptions = isModalOpen?.quantityOptions || [];
    const [showCongrats, setShowCongrats] = useState(false);
    const modalContentRef = useRef(null);
    const durationBlockRef = useRef(null);
    const [dimRects, setDimRects] = useState(null);

    const showTutorialDurationHighlight = isTutorialGoalModal && tutorialPhase === 'duration';
    const showTutorialButtonHighlight = isTutorialGoalModal && tutorialPhase === 'button';
    const showTutorialDimInModal = showTutorialDurationHighlight && dimRects;
    const durationOptions = isModalOpen?.durationOptions || [];
    const hasDurationPicker = durationOptions.length > 0;
    const hasTimePicker = isModalOpen?.timePicker === true;
    const baseTitle = isModalOpen?.baseTitle || isModalOpen?.title || '';
    const liveBaseTitle = hasDurationPicker
        ? isModalOpen?.durationBaseTitle || baseTitle
        : hasTimePicker
            ? isModalOpen?.timeBaseTitle || baseTitle
            : baseTitle;
    const liveTitle = formatGoalTitleWithTime(liveBaseTitle, {
        quantity: quantityOptions.length ? selectedQuantity : undefined,
        quantityUnit: isModalOpen?.quantityUnit,
        quantityUnitEn: isModalOpen?.quantityUnitEn,
        durationMinutes: selectedDuration,
        targetTime: selectedTime,
    }, language);

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
        setSelectedOption(null);
        setShowCongrats(false);
        if (!isModalOpen) {
            setSelectedDuration(null);
            setSelectedTime('');
            return;
        }
        setSelectedQuantity(isModalOpen.quantity ?? isModalOpen.defaultQuantity ?? null);
        setSelectedDuration(isModalOpen.durationMinutes ?? isModalOpen.defaultDuration ?? isModalOpen.durationOptions?.[0] ?? null);
        setSelectedTime(isModalOpen.targetTime || isModalOpen.defaultTime || '');
    }, [isModalOpen]);

    const handleOptionChange = (id) => {
        setSelectedOption(id);
        if (isTutorialGoalModal && tutorialPhase === 'duration' && onTutorialDurationSelect) {
            onTutorialDurationSelect();
        }
    };

    const handleAddStatus = async () => {
        if (submitting || selectedOption === null || (hasDurationPicker && selectedDuration === null) || (hasTimePicker && !selectedTime)) return;
        setSubmitting(true);
        try {
            await addNewStatus(selectedOption, {
                fromTutorial: !!isTutorialGoalModal,
                quantity: quantityOptions.length ? selectedQuantity : undefined,
                durationMinutes: hasDurationPicker ? selectedDuration : undefined,
                targetTime: hasTimePicker ? selectedTime : undefined,
            });
            if (isTutorialGoalModal) onTutorialTakeGoalConfirm?.(selectedOption);
        } catch { /* The request handler displays the error; stay on this step. */ }
        finally { setSubmitting(false); }
    };

    const handleCongratsClose = () => {
        setShowCongrats(false);
        if (selectedOption !== null && onTutorialTakeGoalConfirm) {
            onTutorialTakeGoalConfirm(selectedOption);
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
                    <div className={styles.modalHeading}>
                        <GoalIcon goal={isModalOpen} />
                        <h2 className={styles.modalTitle} aria-live="polite">{liveTitle}</h2>
                    </div>
                    {/* {!hasDurationPicker && !hasTimePicker && <p className={styles.modalText}>{isModalOpen.description}</p>} */}
                    <div>
                        {quantityOptions.length > 0 && <section className={styles.choiceSection}>
                            <div className={styles.choiceHeading}>{language === 'ru' ? 'Количество на день' : 'Daily quantity'}</div>
                            <div className={styles.choiceGroup} role="group" aria-label={language === 'ru' ? 'Количество' : 'Quantity'}>
                                {quantityOptions.map(value => <button type="button" key={value} className={`${styles.choiceButton} ${selectedQuantity === value ? styles.choiceButtonSelected : ''}`} aria-pressed={selectedQuantity === value} onClick={() => setSelectedQuantity(value)}>{formatGoalQuantity(value, isModalOpen.quantityUnit, isModalOpen.quantityUnitEn, language)}</button>)}
                            </div>
                        </section>}
                        {hasDurationPicker && (
                            <section className={styles.choiceSection} aria-label={t('goalTimePerDay')}>
                                <div className={styles.choiceHeading}>{t('goalTimePerDay')} <span>{t('everyDay')}</span></div>
                                <div className={`${styles.choiceGroup} ${styles.timeChoiceGroup}`} role="group" aria-label={t('goalTimePerDay')}>
                                    {durationOptions.map((minutes) => (
                                        <button
                                            key={minutes}
                                            type="button"
                                            className={`${styles.choiceButton} ${selectedDuration === minutes ? styles.choiceButtonSelected : ''}`}
                                            aria-pressed={selectedDuration === minutes}
                                            onClick={() => setSelectedDuration(minutes)}
                                        >
                                            {formatGoalDurationChoice(minutes, language)}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {hasTimePicker && (
                            <section className={styles.choiceSection} aria-label={t('goalTimeAt')}>
                                <label className={styles.timePickerLabel} htmlFor="goal-time-picker">{t('goalTimeAt')}</label>
                                <input
                                    id="goal-time-picker"
                                    className={styles.timePickerInput}
                                    type="time"
                                    value={selectedTime}
                                    onChange={(event) => setSelectedTime(event.target.value)}
                                />
                            </section>
                        )}

                        <section
                            ref={durationBlockRef}
                            className={styles.choiceSection}
                            {...(isTutorialGoalModal ? { 'data-tutorial-id': 'goals-take-modal-duration' } : {})}
                        >
                            <div className={styles.choiceHeading}>{t('goalCommitment')}</div>
                            <div className={styles.choiceGroup} role="group" aria-label={t('goalCommitment')}>
                                {number.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`${styles.choiceButton} ${styles.daysChoiceButton} ${selectedOption === item.value ? styles.choiceButtonSelected : ''}`}
                                        aria-pressed={selectedOption === item.value}
                                        onClick={() => handleOptionChange(item.value)}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <button
                            onClick={handleAddStatus}
                            className={`${styles.actionButton} ${showTutorialButtonHighlight ? styles.tutorialHighlightButton : ''}`}
                            disabled={submitting || selectedOption === null || (hasDurationPicker && selectedDuration === null) || (hasTimePicker && !selectedTime)}
                            {...(isTutorialGoalModal ? { 'data-tutorial-id': 'goals-take-modal-button' } : {})}
                        >
                            {t('takeGoalFor')} {number.find((item) => item.value === selectedOption)?.name}
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
