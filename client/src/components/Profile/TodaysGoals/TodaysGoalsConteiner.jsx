'use client';
import React, { useState, useEffect, useMemo } from "react";
import TodaysGoals from "./TodaysGoals";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { translateGoals } from '@/utils/goalsTranslations';
import Filter from "../../../utils/Filter/filter";
import { addStatusNew, addGoals, addStatus, newStatusSavingGoal, deleteGoalsSaving,checkTimeGoalsSaving } from "../../../redux/goals_reducer";
import { toast } from "react-hot-toast";
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { setPoints, deletePoints } from "../../../redux/profile_reducer";

const TodaysGoalsConteiner = ({checkTimeGoalsSaving,  deletePoints, deleteGoalsSaving, newStatusSavingGoal, profile, addStatusNew, goals, userId, addStatus, addGoals, setPoints }) => {
    const { t, language } = useLanguage();
    const { isOpen: isTutorialOpen, currentStep, onTutorialActionDone } = useTutorial();
    const [home, setHome] = useState(null);
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

    const inProgressGoals = useMemo(
        () => translatedGoals.filter((g) => g.status === 'in_progress'),
        [translatedGoals]
    );
    const completedGoalsList = useMemo(
        () => translatedGoals.filter((g) => g.status === 'completed'),
        [translatedGoals]
    );
    const completedCount = completedGoalsList.length;
    const totalTodayGoals = inProgressGoals.length + completedGoalsList.length;
    const pointsFromCompletedToday = completedGoalsList.reduce(
        (acc, g) => acc + (Number(g.points) || 0),
        0
    );

    useEffect(() => {
        if (userId) {
            addStatus(userId)
            addGoals(userId)
        }
    }, [userId, addGoals, addStatus]);

    const Modal = (goal) => {
        if (goal.status === "in_progress") {
            const goalData = {
                points: goal.points,
                id: goal.id
            }
            if (loading) {
                addNewStatusDone(goalData)
            }
        }

        if (goal.status === "completed") {
            const goalData = {
                points: goal.points,
                id: goal.id
            }
            if (loading) {
                addNewStatusInProgress(goalData)
            }
        }

    };

    const addNewStatusInProgress = async (goalData) => {
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
            await addStatusNew(goalData.id, userId, "in_progress");
            await deletePoints(userId, goalData.points)
            await checkTimeGoalsSaving(profile.telegramId)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, until, goalData.id, "in_progress")

            if (result) {
                setLoading(true)
            }
            toast.dismiss(loadingToast);
            toast.success(t('goalMoved'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });

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

    const addNewStatusDone = async (isModalOpen) => {
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
            addStatusNew(isModalOpen.id, userId, "done");
            checkTimeGoalsSaving(profile.telegramId)
            setPoints(userId, isModalOpen.points)
            await addStatus(userId);
            addGoals(userId)

            const result = await newStatusSavingGoal(profile.telegramId, until, isModalOpen.id, "completed")

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
            onTutorialActionDone('complete_goal');
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
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error(t('goalRemoveError'), error);
            toast.error(t('goalRemoveErrorRetry'), toastStyle);
        }
    };

    return <div data-tutorial-id="complete-goal">
        <TodaysGoals
            completedCount={completedCount}
            totalTodayGoals={totalTodayGoals}
            pointsFromCompletedToday={pointsFromCompletedToday}
            completed={Filter(
                translatedGoals,
                "completed",
                Modal,
                "https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png",
                false,
                addOldStatus,
                isTutorialOpen,
                true
            )}
            inProgress={Filter(translatedGoals, "in_progress", Modal, 'https://i.postimg.cc/hP8bTspx/3836f8c0-0e42-4e08-baaa-4d629dbe4995-no-bg-preview-carve-photos-1.png', false, addOldStatus, isTutorialOpen && currentStep?.id !== 'complete-goal', true)} />
    </div>
}

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals,
    userId: state.profile.profile.id,
})

export default connect(mapStateToProps, { checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, addStatusNew, addStatus, addGoals, setPoints })(TodaysGoalsConteiner);