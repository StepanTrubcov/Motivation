'use client';
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import styles from "./ModalWindowNewGoals.module.css";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { addCustomGoal } from '@/lib/api/Api';


const ModalWindowNewGoals = ({ NewGoals, isModalOpen, closeModal, userId }) => {
    const goalCategories = [
        { id: 'sport', name: 'Спорт', value: 'Sport' },
        { id: 'discipline', name: 'Дисциплина', value: 'Discipline' },
        { id: 'spirituality', name: 'Духовность', value: 'Spirituality' },
        { id: 'selfDevelopment', name: 'Саморазвитие', value: 'Self_development' }
    ];

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await NewGoals(
                userId,
                values.title,
                goalCategories.find(cat => cat.id === values.category)?.value,
                resetForm,
                closeModal
            );
        } catch (error) {
            console.error('Ошибка при добавлении цели:', error);
            alert('Не удалось добавить цель. Попробуйте еще раз.');
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
                            Добавить свою цель
                        </h2>
                        <div className={styles.modalTextInfo} >
                            Заполнив все поля вы можете добавить свою цель, которая будет только у вас
                        </div>

                        <Formik
                            initialValues={{
                                title: '',
                                category: goalCategories[0].id
                            }}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form className={styles.goalForm}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="title" className={styles.formLabel}>
                                            Название цели
                                        </label>
                                        <Field
                                            type="text"
                                            id="title"
                                            name="title"
                                            placeholder="Введите название цели"
                                            className={styles.formInput}
                                            required
                                        />
                                        <ErrorMessage name="title" component="div" className={styles.errorMessage} />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Категория цели
                                        </label>
                                        <div className={styles.radioGroup}>
                                            {goalCategories.map((category) => (
                                                <React.Fragment key={category.id}>
                                                    <div className={styles.radioWrapper}>
                                                        <Field
                                                            type="radio"
                                                            id={category.id}
                                                            name="category"
                                                            value={category.id}
                                                            className={styles.radioInput}
                                                        />
                                                        <label htmlFor={category.id} className={styles.radioLabel}>
                                                            {category.name}
                                                        </label>
                                                    </div>
                                                </React.Fragment>

                                            ))}
                                        </div>
                                        <ErrorMessage name="category" component="div" className={styles.errorMessage} />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={styles.submitButton}
                                    >
                                        {isSubmitting ? 'Добавление...' : 'Добавить цель'}
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