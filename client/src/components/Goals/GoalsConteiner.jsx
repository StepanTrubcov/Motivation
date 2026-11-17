'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Goals from "./Goals";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { translateGoals } from '@/utils/goalsTranslations';
import Filter from "../../utils/Filter/filter";
import {changeGoalLifecycle, changeGoalCompletion, checkTimeGoalsSaving, addStatusNew, addGoals, addStatus, NewGoals, newSavingGoal, newStatusSavingGoal, deleteGoalsSaving } from '../../redux/goals_reducer';
import { notifications } from "@/lib/notifications";
import styles from "./Goals.module.css";
import ModalWindow from "../../utils/ModalWindow/ModalWindow";
import { setPoints, deletePoints } from "../../redux/profile_reducer";

const GoalsConteiner = ({ changeGoalLifecycle, changeGoalCompletion, checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, newSavingGoal, NewGoals, profile, goals, userId, addStatusNew, addGoals, addStatus, setPoints }) => {
    const { t, language } = useLanguage();
    const { onTutorialActionDone, isOpen: isTutorialOpen, currentStep, nextStep, setGoalModalOpen, setGoalModalTutorialPhase, goalModalTutorialPhase, setLastCreatedGoalCategory, setLastCreatedGoalId } = useTutorial();
    const [isModalOpen, setIsModalOpen] = useState(null);
    const [loading, setLoading] = useState(true);
    const completionBusy = useRef(false);
    const [query, setQuery] = useState('');

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

    const handleNewGoals = useCallback(async (userId, title, category, resetForm, closeModalCb, options = {}) => {
        const selectedCategory = category || 'Discipline';
        const createdGoal = await changeGoalLifecycle(userId, {
            action: 'create', title, category: selectedCategory,
            selectedOption: options.selectedOption, durationMinutes: options.durationMinutes,
        });

        resetForm?.();
        closeModalCb?.();
        if (isTutorialOpen && currentStep?.id === 'goals-create') {
            setLastCreatedGoalCategory?.(selectedCategory);
            setLastCreatedGoalId?.(createdGoal.id);
        }
        onTutorialActionDone('create_goal');
        return createdGoal;
    }, [changeGoalLifecycle, onTutorialActionDone, isTutorialOpen, currentStep?.id, setLastCreatedGoalCategory, t]);

    const addNewStatus = async (selectedOption, options = {}) => {
        const notice = notifications.begin(t('takingGoal'));
        const fromTutorial = options.fromTutorial === true;
        try {

            const timeSettings = {
                quantity: options.quantity,
                durationMinutes: options.durationMinutes,
                targetTime: options.targetTime,
            };
            await changeGoalLifecycle(userId, { action: 'take', goalId: isModalOpen.id, selectedOption, ...timeSettings });

            closeModal();
            notice.success(`${t('goalTaken')} ${selectedOption} ${t('goalTakenDays')}`);
            if (!fromTutorial) onTutorialActionDone('take_goal');

        } catch (error) {

            console.error(t('goalTakeError'), error);
            notice.error(t('goalTakeErrorRetry'));
            throw error;
        }
    };

    const handleTutorialTakeGoalConfirm = useCallback(() => {
        setGoalModalOpen?.(false);
        setGoalModalTutorialPhase?.(null);
        onTutorialActionDone('take_goal');
    }, [setGoalModalOpen, setGoalModalTutorialPhase, onTutorialActionDone]);

    const performCompletion = async (goal, action) => {
        if (completionBusy.current) return;
        completionBusy.current = true;
        setLoading(false);
        const completing = action === 'complete';
        const notice = notifications.begin(t(completing ? 'completingGoal' : 'cancelingGoal'));
        try {
            await changeGoalCompletion(userId, goal.id, action);
            notice.success(t(completing ? 'goalCompleted' : 'goalMoved'));
            onTutorialActionDone(completing ? 'complete_goal' : 'undo_goal', goal.id);
        } catch (error) {
            console.error('Could not save goal completion:', error);
            notice.error(t(completing ? 'goalErrorRetry' : 'goalMoveErrorRetry'));
        } finally {
            completionBusy.current = false;
            setLoading(true);
        }
    };
    const addNewStatusDone = goal => performCompletion(goal, 'complete');
    const addNewStatusInProgress = goal => performCompletion(goal, 'undo');

    const addOldStatus = async (goalData) => {
        const notice = notifications.begin(t('deletingGoal'));

        try {
            await changeGoalLifecycle(userId, { action: 'remove', goalId: goalData.id });

            notice.success(t('goalRemoved'));
            onTutorialActionDone('delete_goal');
        } catch (error) {

            console.error(t('goalRemoveError'), error);
            notice.error(t('goalRemoveErrorRetry'));
        }
    };

    const normalizedQuery = query.trim().toLocaleLowerCase();
    const searchWord = normalizedQuery.split(/\s+/u)[0] || '';
    const matchesQuery = (goal) => {
        if (!searchWord) return true;
        const titleWords = String(goal.title || '').toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
        return titleWords.some((word) => word.startsWith(searchWord));
    };
    const matchingGoals = translatedGoals.filter(matchesQuery);
    const All_goals = translatedGoals.filter(goal => goal.status === "not_started" && !goal.retiredFromCatalog);
    const catalogSearchGoals = All_goals.filter(matchesQuery);
    const goalsSport = All_goals.filter(goal => goal.category === "Sport" && matchesQuery(goal));
    const goalsDiscipline = All_goals.filter(goal => goal.category === "Discipline" && matchesQuery(goal));
    const goalsSpirituality = All_goals.filter(goal => goal.category === "Spirituality" && matchesQuery(goal));
    const goalsSelfDevelopment = All_goals.filter(goal => goal.category === "Self_development" && matchesQuery(goal));
    return (
        <div className={styles.container}>
            <Goals
                completed={Filter(
                    matchingGoals,
                    "completed",
                    Modal,
                    "https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png", false, addOldStatus
                )}
                inProgress={Filter(matchingGoals, "in_progress", Modal, 'https://i.postimg.cc/hP8bTspx/3836f8c0-0e42-4e08-baaa-4d629dbe4995-no-bg-preview-carve-photos-1.png', false, addOldStatus)}
                sportGoals={Filter(goalsSport, "not_started", Modal)}
                disciplineGoals={Filter(goalsDiscipline, "not_started", Modal)}
                spiritualityGoals={Filter(goalsSpirituality, "not_started", Modal)}
                selfDevelopmentGoals={Filter(goalsSelfDevelopment, "not_started", Modal)}
                catalogSearchResults={Filter(catalogSearchGoals, "not_started", Modal, undefined, false)}
                catalogSearchCount={catalogSearchGoals.length}
                query={query}
                setQuery={setQuery}
                myCount={matchingGoals.filter(goal => goal.status === 'in_progress' || goal.status === 'completed').length}
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

export default connect(mapStateToProps, { changeGoalLifecycle, changeGoalCompletion, checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, newSavingGoal, NewGoals, addStatusNew, addGoals, addStatus, setPoints })(GoalsConteiner);
