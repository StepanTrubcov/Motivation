'use client';
import React, { useState, useEffect, useMemo, useRef } from "react";
import TodaysGoals from "./TodaysGoals";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { translateGoals } from '@/utils/goalsTranslations';
import Filter from "../../../utils/Filter/filter";
import { changeGoalLifecycle, changeGoalCompletion, addStatusNew, addGoals, addStatus, newStatusSavingGoal, deleteGoalsSaving,checkTimeGoalsSaving } from "../../../redux/goals_reducer";
import { notifications } from "@/lib/notifications";
import { setPoints, deletePoints } from "../../../redux/profile_reducer";

const TodaysGoalsConteiner = ({ changeGoalLifecycle, changeGoalCompletion,checkTimeGoalsSaving,  deletePoints, deleteGoalsSaving, newStatusSavingGoal, profile, addStatusNew, goals, userId, addStatus, addGoals, setPoints }) => {
    const { t, language } = useLanguage();
    const { isOpen: isTutorialOpen, currentStep, onTutorialActionDone, completeGoalTutorialPhase } = useTutorial();
    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);
    const completionBusy = useRef(false);

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
        } catch (error) {

            console.error(t('goalRemoveError'), error);
            notice.error(t('goalRemoveErrorRetry'));
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
                isTutorialOpen && !(currentStep?.id === 'complete-goal' && completeGoalTutorialPhase === 'undo'),
                false
            )}
            inProgress={Filter(translatedGoals, "in_progress", Modal, 'https://i.postimg.cc/hP8bTspx/3836f8c0-0e42-4e08-baaa-4d629dbe4995-no-bg-preview-carve-photos-1.png', false, addOldStatus, isTutorialOpen && !(currentStep?.id === 'complete-goal' && completeGoalTutorialPhase === 'complete'), false)} />
    </div>
}

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals,
    userId: state.profile.profile.id,
})

export default connect(mapStateToProps, { changeGoalLifecycle, changeGoalCompletion, checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, addStatusNew, addStatus, addGoals, setPoints })(TodaysGoalsConteiner);
