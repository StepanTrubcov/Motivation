'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock3, X } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import styles from "./ModalWindowNewGoals.module.css";
import { Formik, Form, Field } from 'formik';
import { formatGoalDurationChoice } from '@/lib/goalTimeOptions';
import { notifications } from '@/lib/notifications';


const ModalWindowNewGoals = ({ NewGoals, isModalOpen, closeModal, userId }) => {
    const { t, language } = useLanguage();
    const { createGoalModalTutorialPhase, setCreateGoalModalTutorialPhase } = useTutorial();
    const [categoryOpen, setCategoryOpen] = useState(false);
    const durationOptions = [10, 20, 30, 60, 90, 120];
    const periodOptions = [30, 60, 120];
    const categoryOptions = [
        ['Sport', 'sport'],
        ['Discipline', 'discipline'],
        ['Spirituality', 'spirituality'],
        ['Self_development', 'selfDevelopment'],
    ];

    useEffect(() => {
        if (!isModalOpen) {
            setCategoryOpen(false);
            setCreateGoalModalTutorialPhase(null);
        }
    }, [isModalOpen, setCreateGoalModalTutorialPhase]);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        const notice = notifications.begin(t('takingGoal'));
        try {
            await NewGoals(
                userId,
                values.title,
                values.category,
                resetForm,
                closeModal,
                {
                    durationMinutes: values.durationMinutes,
                    selectedOption: values.selectedOption,
                }
            );
            setCreateGoalModalTutorialPhase?.(null);
            notice.success(t('goalCreatedAndTaken'));
        } catch (error) {
            console.error(t('addGoalError'), error);
            notice.error(t('addGoalErrorRetry'));
        } finally {
            setSubmitting(false);
        }
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
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!e.target.closest(`.${styles.categoryPicker}`)) setCategoryOpen(false);
                        }}
                        data-tutorial-id="goals-create-modal"
                    >
                        <button
                            onClick={closeModal}
                            className={styles.closeButton}
                            aria-label={t('close')}
                        >
                            <X size={24} />
                        </button>

                        <h2 className={styles.modalTitle}>
                            {t('addCustomGoal')}
                        </h2>
                        <div className={styles.modalTextInfo}>
                            {t('addCustomGoalInfo')}
                        </div>

                        <Formik
                            initialValues={{
                                title: '',
                                category: 'Discipline',
                                durationMinutes: null,
                                selectedOption: null,
                            }}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, values, setFieldValue }) => (
                                <Form className={styles.goalForm}>
                                    <div className={styles.formGroup} data-tutorial-id="goals-create-input">
                                        <label htmlFor="title" className={styles.formLabel}>
                                            {t('goalTitle')}
                                        </label>
                                        <Field
                                            type="text"
                                            id="title"
                                            name="title"
                                            placeholder={t('goalTitlePlaceholder')}
                                            className={styles.formInput}
                                            required
                                            onBlur={() => { if (createGoalModalTutorialPhase === 'name' && values.title.trim()) setCreateGoalModalTutorialPhase?.('category'); }}
                                        />
                                    </div>

                                    {createGoalModalTutorialPhase === 'category' && (
                                        <p className={styles.tutorialHint} role="status">{t('tutorialCreateGoalPhaseCategory')}</p>
                                    )}
                                    <div className={styles.categoryPicker} data-tutorial-id="goals-create-category">
                                        <button
                                            type="button"
                                            className={styles.fixedCategory}
                                            aria-expanded={categoryOpen}
                                            aria-controls="custom-goal-category-options"
                                            onClick={() => setCategoryOpen((open) => !open)}
                                        >
                                            <span>{t('goalCategory')}</span>
                                            <strong>{t(categoryOptions.find(([value]) => value === values.category)?.[1] || 'discipline')}</strong>
                                            <ChevronDown className={categoryOpen ? styles.categoryChevronOpen : ''} size={18} aria-hidden="true" />
                                        </button>
                                        {categoryOpen && (
                                            <div className={styles.categoryOptions} id="custom-goal-category-options" role="group" aria-label={t('goalCategory')}>
                                                {categoryOptions.map(([value, label]) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className={`${styles.categoryOption} ${values.category === value ? styles.categoryOptionSelected : ''}`}
                                                        aria-pressed={values.category === value}
                                                        onClick={() => {
                                                            setFieldValue('category', value);
                                                            setCategoryOpen(false);
                                                            if (createGoalModalTutorialPhase === 'category') setCreateGoalModalTutorialPhase?.('options');
                                                        }}
                                                    >
                                                        {t(label)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.formGroup} data-tutorial-id="goals-create-options">
                                        <div className={styles.formLabel}><span className={styles.labelMain}><Clock3 size={16} />{t('goalTimePerDay')}</span><span className={styles.labelHint}>{t('everyDay')}</span></div>
                                        <div className={styles.choiceGroup} role="group" aria-label={t('goalTimePerDay')}>
                                            <button
                                                type="button"
                                                className={`${styles.choiceButton} ${values.durationMinutes === null ? styles.choiceButtonSelected : ''}`}
                                                aria-pressed={values.durationMinutes === null}
                                                onClick={() => {
                                                    setFieldValue('durationMinutes', null);
                                                    if (createGoalModalTutorialPhase === 'options') setCreateGoalModalTutorialPhase('period');
                                                }}
                                            >
                                                {t('noGoalTime')}
                                            </button>
                                            {durationOptions.map((minutes) => (
                                                <button
                                                    key={minutes}
                                                    type="button"
                                                    className={`${styles.choiceButton} ${values.durationMinutes === minutes ? styles.choiceButtonSelected : ''}`}
                                                    aria-pressed={values.durationMinutes === minutes}
                                                    onClick={() => {
                                                        setFieldValue('durationMinutes', minutes);
                                                        if (createGoalModalTutorialPhase === 'options') setCreateGoalModalTutorialPhase('period');
                                                    }}
                                                >
                                                    {formatGoalDurationChoice(minutes, language)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.formGroup} data-tutorial-id="goals-create-period">
                                        <div className={styles.formLabel}>{t('goalCommitment')}</div>
                                        <div className={styles.choiceGroup} role="group" aria-label={t('goalCommitment')}>
                                            {periodOptions.map((days) => (
                                                <button
                                                    key={days}
                                                    type="button"
                                                    className={`${styles.choiceButton} ${styles.periodChoiceButton} ${values.selectedOption === days ? styles.choiceButtonSelected : ''}`}
                                                    aria-pressed={values.selectedOption === days}
                                                    onClick={() => {
                                                        setFieldValue('selectedOption', days);
                                                        if (['period', 'category', 'options'].includes(createGoalModalTutorialPhase)) setCreateGoalModalTutorialPhase?.('button');
                                                    }}
                                                >
                                                    {t(`days${days}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !values.title.trim() || !values.selectedOption}
                                        className={styles.submitButton}
                                        data-tutorial-id="goals-create-submit"
                                    >
                                        {isSubmitting
                                            ? t('adding')
                                            : `${t('createAndTakeGoal')} ${values.selectedOption ? `${values.selectedOption} ${t('goalTakenDays')}` : ''}`.trim()}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWindowNewGoals;
