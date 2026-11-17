'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { buildOnboardingSteps, buildExplanatorySteps } from '@/lib/tutorialSteps.mjs';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isColorPickerOpenForTutorial, setIsColorPickerOpenForTutorial] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalModalTutorialPhase, setGoalModalTutorialPhase] = useState(null);
  /** Фазы обучения в модалке «Создать свою цель»: name → duration → button */
  const [createGoalModalTutorialPhase, setCreateGoalModalTutorialPhase] = useState(null);
  /** Категория цели, созданной в обучении (Sport, Discipline, …) — для шага «найдите цель» */
  const [lastCreatedGoalCategory, setLastCreatedGoalCategory] = useState(null);
  const [lastCreatedGoalId, setLastCreatedGoalId] = useState(null);
  const completedGoalIdsRef = React.useRef(new Set());
  const [isExplanatoryTutorial, setIsExplanatoryTutorial] = useState(false);
  /** Шаг complete-goal: сколько целей выполнено в обучении */
  const [completeGoalsDoneCount, setCompleteGoalsDoneCount] = useState(0);
  /** Шаг complete-goal: фаза (complete -> undo) */
  const [completeGoalTutorialPhase, setCompleteGoalTutorialPhase] = useState('complete');
  /** Шаг achievements-how-to-get: пользователь нажал на стрелку — показываем кнопку «Далее» */
  const [achievementHowToGetArrowClicked, setAchievementHowToGetArrowClicked] = useState(false);

  const goals = useSelector((state) => state.goals?.goals ?? []);
  const assignments = useSelector((state) => state.assignments?.assignments);
  const hasTodayGoals = useMemo(() => {
    const list = Array.isArray(goals) ? goals : [];
    return list.some((g) => g.status === 'in_progress' || g.status === 'completed');
  }, [goals]);
  const hasExistingGoals = useMemo(() => {
    const list = Array.isArray(goals) ? goals : [];
    return list.some((g) => g.status === 'in_progress' || g.status === 'completed');
  }, [goals]);

  // ВАЖНО: список шагов фиксируем на момент старта обучения, иначе после «первой цели»
  // (когда появляется today-goals) индексы сдвигаются и туториал "прыгает" назад.
  const computedSteps = useMemo(
    () => (hasExistingGoals ? buildExplanatorySteps(Array.isArray(assignments) ? {
      hasEarned: assignments.some(a => a.status === 'my'),
      hasLocked: assignments.some(a => a.status !== 'my'),
    } : undefined) : buildOnboardingSteps(hasTodayGoals)),
    [hasExistingGoals, hasTodayGoals, assignments]
  );
  const [steps, setSteps] = useState(computedSteps);

  useEffect(() => {
    if (!isOpen) setSteps(computedSteps);
  }, [computedSteps, isOpen]);

  const startTutorial = useCallback((screenName = 'home') => {
    setSteps(computedSteps);
    setIsExplanatoryTutorial(hasExistingGoals);
    setGoalModalOpen(false);
    setGoalModalTutorialPhase(null);
    setCreateGoalModalTutorialPhase(null);
    setLastCreatedGoalId(null);
    setLastCreatedGoalCategory(null);
    completedGoalIdsRef.current.clear();
    setCompleteGoalsDoneCount(0);
    setCompleteGoalTutorialPhase('complete');
    setStepIndex(0);
    setIsOpen(true);
  }, [computedSteps, hasExistingGoals]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) {
        setIsOpen(false);
        return i;
      }
      return i + 1;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const closeTutorial = useCallback(() => {
    setIsOpen(false);
  }, []);

  const currentStep = steps[stepIndex] || null;
  const isLastStep = stepIndex >= steps.length - 1;
  const isSettingsStep = currentStep?.id?.startsWith('settings-');
  const requireSettingsClick = currentStep?.id === 'settings-button';
  const requireHomeClick = currentStep?.id === 'home-tab';
  const requireGoalsClick = currentStep?.id === 'goals-tab';
  const requireAchievementsClick = currentStep?.id === 'achievements-tab';
  const requireCategoryClick = currentStep?.requireCategoryClick;
  const requireAction = currentStep?.requireAction;

  const screen = currentStep?.screen || 'home';

  const onTutorialActionDone = useCallback((actionId, goalId) => {
    if (currentStep?.id === 'complete-goal') {
      if (actionId === 'undo_goal' && completeGoalTutorialPhase === 'undo') {
        setCompleteGoalTutorialPhase('done');
      }
      if (actionId === 'complete_goal' && goalId) {
        completedGoalIdsRef.current.add(String(goalId));
        const count = completedGoalIdsRef.current.size;
        setCompleteGoalsDoneCount(count);
        if (count >= 2 && completeGoalTutorialPhase === 'complete') setCompleteGoalTutorialPhase('undo');
      }
      return;
    }
    if (currentStep?.id === 'achievements-how-to-get' && actionId === 'click_how_to_get_arrow') {
      setAchievementHowToGetArrowClicked(true);
      return;
    }
    if (currentStep?.id === 'achievements-earned-choose' && actionId === 'click_achievement') {
      nextStep();
      return;
    }
    if (currentStep?.requireAction !== actionId) return;
    nextStep();
  }, [currentStep?.id, currentStep?.requireAction, nextStep, completeGoalTutorialPhase]);

  useEffect(() => {
    if (currentStep?.id !== 'complete-goal') {
      completedGoalIdsRef.current.clear();
      setCompleteGoalsDoneCount(0);
      setCompleteGoalTutorialPhase('complete');
    }
  }, [currentStep?.id]);

  // Сбрасываем флаг выбора цвета при смене шага
  useEffect(() => {
    if (currentStep?.id !== 'settings-color') {
      setIsColorPickerOpenForTutorial(false);
    }
  }, [currentStep?.id]);

  // Сбрасываем флаг «нажал на стрелку» при уходе с шага achievements-how-to-get
  useEffect(() => {
    if (currentStep?.id !== 'achievements-how-to-get') {
      setAchievementHowToGetArrowClicked(false);
    }
  }, [currentStep?.id]);

  const onTutorialOpenSettings = useCallback(() => {
    setStepIndex((i) => {
      if (i < steps.length && steps[i]?.id === 'settings-button') return i + 1;
      return i;
    });
  }, [steps]);

  const onTutorialNavigateToHome = useCallback(() => {
    if (currentStep?.id !== 'home-tab') return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [currentStep?.id, steps.length]);

  const onTutorialNavigateToGoals = useCallback(() => {
    if (currentStep?.id !== 'goals-tab') return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [currentStep?.id, steps.length]);

  const onTutorialNavigateToAchievements = useCallback(() => {
    if (currentStep?.id !== 'achievements-tab') return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [currentStep?.id, steps.length]);

  return (
    <TutorialContext.Provider
      value={{
        isOpen,
        stepIndex,
        steps,
        currentStep,
        isLastStep,
        isSettingsStep,
        requireSettingsClick,
        requireHomeClick,
        requireGoalsClick,
        requireAchievementsClick,
        requireCategoryClick,
        requireAction,
        screen,
        onTutorialActionDone,
        onTutorialNavigateToHome,
        onTutorialNavigateToGoals,
        onTutorialNavigateToAchievements,
        isColorPickerOpenForTutorial,
        setIsColorPickerOpenForTutorial,
        onTutorialOpenSettings,
        startTutorial,
        nextStep,
        prevStep,
        closeTutorial,
        goalModalOpen,
        setGoalModalOpen,
        goalModalTutorialPhase,
        setGoalModalTutorialPhase,
        createGoalModalTutorialPhase,
        setCreateGoalModalTutorialPhase,
        lastCreatedGoalCategory,
        setLastCreatedGoalCategory,
        lastCreatedGoalId,
        setLastCreatedGoalId,
        hasTodayGoals,
        completeGoalsDoneCount,
        completeGoalTutorialPhase,
        achievementHowToGetArrowClicked,
        isExplanatoryTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
};
