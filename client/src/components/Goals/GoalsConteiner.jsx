'use client';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Goals from "./Goals";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { translateGoals } from '@/utils/goalsTranslations';
import Filter from "../../utils/Filter/filter";
import {checkTimeGoalsSaving, addStatusNew, addGoals, addStatus, NewGoals, newSavingGoal, newStatusSavingGoal, deleteGoalsSaving } from '../../redux/goals_reducer';
import { toast } from "react-hot-toast";
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from "./Goals.module.css";
import ModalWindow from "../../utils/ModalWindow/ModalWindow";
import { setPoints, deletePoints } from "../../redux/profile_reducer";

const GoalsConteiner = ({ checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, newSavingGoal, NewGoals, profile, goals, userId, addStatusNew, addGoals, addStatus, setPoints }) => {
    const { t, language } = useLanguage();
    const { onTutorialActionDone, isOpen: isTutorialOpen, currentStep, nextStep, setGoalModalOpen, setGoalModalTutorialPhase, goalModalTutorialPhase, setLastCreatedGoalCategory } = useTutorial();
    const [isModalOpen, setIsModalOpen] = useState(null);
    const [loading, setLoading] = useState(true);

    // Переводим весь массив целей один раз
    const translatedGoals = useMemo(() => {
        if (!goals?.goals || !Array.isArray(goals.goals) || goals.goals.length === 0) {
            return [];
        }
        try {
            const goalsCopy = goals.goals.map(g => ({ ...g }));
            const translated = translateGoals(goalsCopy, language);
            return Array.isArray(translated) && translated.length === goals.goals.length 
                ? translated 
                : goalsCopy;
        } catch (error) {
            console.error('Error translating goals:', error);
            return goals.goals;
        }
    }, [goals?.goals, language]);

    useEffect(() => {
        if (userId) {
            addStatus(userId)
            addGoals(userId)
        }
    }, [userId, addGoals, addStatus]);

    const Modal = (goal) => {
        if (goal.status === "not_started") {
            setIsModalOpen(goal);
            if (isTutorialOpen && (currentStep?.id === 'goals-take-one' || currentStep?.id === 'goals-take-added')) {
                setGoalModalOpen?.(true);
                setGoalModalTutorialPhase?.('duration');
            }
            if (isTutorialOpen && currentStep?.id === 'goals-find-added') {
                // Переходим на шаг с подсказкой для модалки и включаем подсветку
                nextStep?.();
                setGoalModalOpen?.(true);
                setGoalModalTutorialPhase?.('duration');
            }
        }
        if (goal.status === "in_progress") {
            const isModalOpenDone = {
                points: goal.points,
                id: goal.id,
                status: goal.status,
            }
            if (loading) {
                addNewStatusDone(isModalOpenDone)
            }
        }
        if (goal.status === "completed") {
            const isModalOpen = goal
            if (loading) {
                addNewStatusInProgress(isModalOpen)
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(null);
        setGoalModalOpen?.(false);
        setGoalModalTutorialPhase?.(null);
    };

    const handleTutorialDurationSelect = useCallback(() => {
        setGoalModalTutorialPhase?.('button');
    }, [setGoalModalTutorialPhase]);

    const handleNewGoals = useCallback(async (userId, title, category, resetForm, closeModalCb) => {
        await NewGoals(userId, title, category, resetForm, closeModalCb);
        if (isTutorialOpen && currentStep?.id === 'goals-create') {
            setLastCreatedGoalCategory?.(category);
        }
        onTutorialActionDone('create_goal');
    }, [NewGoals, onTutorialActionDone, isTutorialOpen, currentStep?.id, setLastCreatedGoalCategory]);

    const addNewStatus = async (selectedOption, options = {}) => {
        const fromTutorial = options.fromTutorial === true;
        const loadingToastDurationMs = fromTutorial ? 5000 : 0;
        let loadingToast;
        try {
            loadingToast = toast.loading(t('takingGoal'), {
                duration: fromTutorial ? 5000 : undefined,
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                },
            });
            await addStatusNew(isModalOpen.id, userId, "in_progress", selectedOption);
            const dismissAndSuccess = () => {
                toast.dismiss(loadingToast);
                toast.success(`${t('goalTaken')} ${selectedOption} ${t('goalTakenDays')}`, {
                    style: {
                        background: '#333',
                        color: '#fff',
                        marginTop: '80px',
                    }
                });
            };
            if (loadingToastDurationMs > 0) {
                setTimeout(dismissAndSuccess, loadingToastDurationMs);
            } else {
                dismissAndSuccess();
            }
            setIsModalOpen(null);

            const targetDate = new Date().toISOString().slice(0, 10)
            const goalData = {
                idGoals: isModalOpen.id,
                status: "in_progress",
            }


            await newSavingGoal(profile.telegramId, goalData, targetDate, selectedOption);

            if (!fromTutorial) onTutorialActionDone('take_goal');

        } catch (error) {
            if (loadingToast != null) toast.dismiss(loadingToast);
            console.error(t('goalTakeError'), error);
            toast.error(t('goalTakeErrorRetry'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });
        }
    };

    const handleTutorialTakeGoalConfirm = useCallback(() => {
        setGoalModalOpen?.(false);
        setGoalModalTutorialPhase?.(null);
        onTutorialActionDone('take_goal');
    }, [setGoalModalOpen, setGoalModalTutorialPhase, onTutorialActionDone]);

    const addNewStatusDone = async (isModalOpenDone) => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            setLoading(false)
            const loadingToast = toast.loading(t('completingGoal'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                },
                icon: <LoadingSpinner size={20} />
            });
            await addStatusNew(isModalOpenDone.id, userId, "done");
            await checkTimeGoalsSaving(profile.telegramId)
            await setPoints(userId, isModalOpenDone.points)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, until, isModalOpenDone.id, "completed")
            if (result) {
                setLoading(true)
            }
            toast.dismiss(loadingToast);
            toast.success(t('goalCompleted'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });
        } catch (error) {
            console.error(t('goalError'), error);
            toast.error(t('goalErrorRetry'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });
        }
    };

    const addNewStatusInProgress = async (isModalOpen) => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            setLoading(false)
            const loadingToast = toast.loading(t('cancelingGoal'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                },
                icon: <LoadingSpinner size={20} />
            });

            await addStatusNew(isModalOpen.id, userId, "in_progress");
            await deletePoints(userId, isModalOpen.points)
            await checkTimeGoalsSaving(profile.telegramId)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, until, isModalOpen.id, "in_progress")

            toast.dismiss(loadingToast);
            toast.success(t('goalMoved'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });

            if (result) {
                setLoading(true)
            }
        } catch (error) {
            console.error(t('goalMoveError'), error);
            toast.error(t('goalMoveErrorRetry'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });
        }
    };

    const toastStyle = {
        style: { background: '#333', color: '#fff', marginTop: '80px' },
    };

    const addOldStatus = async (goalData) => {
        const loadingToast = toast.loading(t('deletingGoal'), toastStyle);
        try {
            const until = new Date().toISOString().slice(0, 10);
            if (goalData.status === "completed") {
                await deletePoints(userId, goalData.points);
                await checkTimeGoalsSaving(profile.telegramId);
            }
            await addStatusNew(goalData.id, userId, "not_started");
            await deleteGoalsSaving(profile.telegramId, goalData.id);
            toast.dismiss(loadingToast);
            toast.success(t('goalRemoved'), toastStyle);
            onTutorialActionDone('delete_goal');
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error(t('goalRemoveError'), error);
            toast.error(t('goalRemoveErrorRetry'), toastStyle);
        }
    };

    const All_goals = translatedGoals.filter(goal => goal.status === "not_started");
    const goalsSport = All_goals.filter(goal => goal.category === "Sport");
    const goalsDiscipline = All_goals.filter(goal => goal.category === "Discipline");
    const goalsSpirituality = All_goals.filter(goal => goal.category === "Spirituality");
    const goalsSelfDevelopment = All_goals.filter(goal => goal.category === "Self_development");
    return (
        <div className={styles.container}>
            <Goals
                completed={Filter(
                    translatedGoals,
                    "completed",
                    Modal,
                    "https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png", true, addOldStatus
                )}
                inProgress={Filter(translatedGoals, "in_progress", Modal, 'https://i.postimg.cc/hP8bTspx/3836f8c0-0e42-4e08-baaa-4d629dbe4995-no-bg-preview-carve-photos-1.png', true, addOldStatus)}
                sportGoals={Filter(goalsSport, "not_started", Modal)}
                disciplineGoals={Filter(goalsDiscipline, "not_started", Modal)}
                spiritualityGoals={Filter(goalsSpirituality, "not_started", Modal)}
                selfDevelopmentGoals={Filter(goalsSelfDevelopment, "not_started", Modal)}
                userId={userId}
                NewGoals={handleNewGoals}
            />
            <ModalWindow
                isModalOpen={isModalOpen}
                addNewStatus={addNewStatus}
                closeModal={closeModal}
                isTutorialGoalModal={isTutorialOpen && (currentStep?.id === 'goals-take-one' || currentStep?.id === 'goals-take-added') && !!isModalOpen}
                tutorialPhase={goalModalTutorialPhase}
                onTutorialDurationSelect={handleTutorialDurationSelect}
                onTutorialTakeGoalConfirm={handleTutorialTakeGoalConfirm}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals,
    userId: state.profile.profile?.id,
});

export default connect(mapStateToProps, { checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, newSavingGoal, NewGoals, addStatusNew, addGoals, addStatus, setPoints })(GoalsConteiner);
