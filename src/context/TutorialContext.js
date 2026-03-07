'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const TutorialContext = createContext();

const HOME_STEPS_FULL = [
  { id: 'intro', titleKey: 'tutorialIntroTitle', descKey: 'tutorialIntroDesc', screen: 'home' },
  { id: 'profile-points', titleKey: 'tutorialStepPoints', descKey: 'tutorialStepPointsDesc', screen: 'home' },
  { id: 'points-scale', titleKey: 'tutorialStepLevel', descKey: 'tutorialStepLevelDesc', screen: 'home' },
  { id: 'profile-info', titleKey: 'tutorialStepProfile', descKey: 'tutorialStepProfileDesc', screen: 'home' },
  { id: 'settings-button', titleKey: 'tutorialStepSettingsButton', descKey: 'tutorialStepSettingsButtonDesc', requireClick: true, screen: 'home' },
  { id: 'settings-theme', titleKey: 'tutorialStepSettingsTheme', descKey: 'tutorialStepSettingsThemeDesc', screen: 'home' },
  { id: 'settings-help', titleKey: 'tutorialStepSettingsHelp', descKey: 'tutorialStepSettingsHelpDesc', screen: 'home' },
  { id: 'settings-color', titleKey: 'tutorialStepSettingsColor', descKey: 'tutorialStepSettingsColorDesc', screen: 'home' },
  { id: 'settings-language', titleKey: 'tutorialStepSettingsLanguage', descKey: 'tutorialStepSettingsLanguageDesc', screen: 'home' },
  { id: 'settings-tutorial', titleKey: 'tutorialStepSettingsTutorial', descKey: 'tutorialStepSettingsTutorialDesc', screen: 'home' },
  { id: 'settings-share', titleKey: 'tutorialStepSettingsShare', descKey: 'tutorialStepSettingsShareDesc', screen: 'home' },
  { id: 'today-goals', titleKey: 'tutorialStepTodayGoals', descKey: 'tutorialStepTodayGoalsDesc', screen: 'home' },
  { id: 'generate-button', titleKey: 'tutorialStepGenerate', descKey: 'tutorialStepGenerateDesc', screen: 'home' },
  { id: 'calendar', titleKey: 'tutorialStepCalendar', descKey: 'tutorialStepCalendarDesc', screen: 'home' },
  { id: 'goals-tab', titleKey: 'tutorialStepGoalsTab', descKey: 'tutorialStepGoalsTabDesc', requireClick: true, screen: 'home' },
];

const GOALS_STEPS = [
  { id: 'goals-intro', titleKey: 'tutorialGoalsIntroTitle', descKey: 'tutorialGoalsIntroDesc', screen: 'goals' },
  { id: 'goals-completed', titleKey: 'tutorialGoalsCompletedTitle', descKey: 'tutorialGoalsCompletedDesc', screen: 'goals' },
  { id: 'goals-in-progress', titleKey: 'tutorialGoalsInProgressTitle', descKey: 'tutorialGoalsInProgressDesc', screen: 'goals' },
  { id: 'goals-available', titleKey: 'tutorialGoalsAvailableTitle', descKey: 'tutorialGoalsAvailableDesc', screen: 'goals' },
  { id: 'goals-choose-category', titleKey: 'tutorialGoalsChooseCategoryTitle', descKey: 'tutorialGoalsChooseCategoryDesc', requireCategoryClick: true, screen: 'goals' },
  { id: 'goals-take-one', titleKey: 'tutorialStepTakeGoal', descKey: 'tutorialStepTakeGoalDesc', requireAction: 'take_goal', screen: 'goals' },
  { id: 'goals-toast-success', titleKey: 'tutorialStepToastTitle', descKey: 'tutorialStepToastDesc', screen: 'goals' },
  { id: 'goals-create', titleKey: 'tutorialStepCreateGoal', descKey: 'tutorialStepCreateGoalDesc', requireAction: 'create_goal', screen: 'goals' },
];

const ACHIEVEMENTS_STEPS = [
  { id: 'achievements-intro', titleKey: 'tutorialAchievementsIntroTitle', descKey: 'tutorialAchievementsIntroDesc', screen: 'achievements' },
  { id: 'achievements-earned', titleKey: 'tutorialAchievementsEarnedTitle', descKey: 'tutorialAchievementsEarnedDesc', screen: 'achievements' },
  { id: 'achievements-all', titleKey: 'tutorialAchievementsAllTitle', descKey: 'tutorialAchievementsAllDesc', screen: 'achievements' },
  { id: 'achievements-rarities', titleKey: 'tutorialAchievementsRaritiesTitle', descKey: 'tutorialAchievementsRaritiesDesc', screen: 'achievements' },
  { id: 'achievements-cards', titleKey: 'tutorialAchievementsCardsTitle', descKey: 'tutorialAchievementsCardsDesc', screen: 'achievements' },
];

/** Шаги между экранами: complete-goal (на главной), achievements-tab, goals-delete (на целях) */
const BRIDGE_STEPS = [
  { id: 'complete-goal', titleKey: 'tutorialStepCompleteGoal', descKey: 'tutorialStepCompleteGoalDesc', requireAction: 'complete_goal', screen: 'home' },
  { id: 'achievements-tab', titleKey: 'tutorialStepAchievementsTab', descKey: 'tutorialStepAchievementsTabDesc', requireClick: true, screen: 'home' },
  { id: 'goals-delete', titleKey: 'tutorialStepDeleteGoal', descKey: 'tutorialStepDeleteGoalDesc', requireAction: 'delete_goal', screen: 'goals' },
];

/** Единая последовательность онбординга: дом → цели (обзор + взять + создать) → главная (выполнить) → достижения → цели (удалить) */
const buildOnboardingSteps = (hasTodayGoals) => {
  const homeSteps = hasTodayGoals
    ? HOME_STEPS_FULL
    : HOME_STEPS_FULL.filter((s) => s.id !== 'generate-button');
  return [
    ...homeSteps,
    ...GOALS_STEPS,
    BRIDGE_STEPS[0], // complete-goal
    BRIDGE_STEPS[1], // achievements-tab
    ...ACHIEVEMENTS_STEPS,
    BRIDGE_STEPS[2], // goals-delete
  ];
};

export const TutorialProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isColorPickerOpenForTutorial, setIsColorPickerOpenForTutorial] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalModalTutorialPhase, setGoalModalTutorialPhase] = useState(null);

  const goals = useSelector((state) => state.goals?.goals ?? []);
  const hasTodayGoals = useMemo(() => {
    const list = Array.isArray(goals) ? goals : [];
    return list.some((g) => g.status === 'in_progress' || g.status === 'completed');
  }, [goals]);

  const steps = useMemo(() => buildOnboardingSteps(hasTodayGoals), [hasTodayGoals]);

  const startTutorial = useCallback((screenName = 'home') => {
    setStepIndex(0);
    setIsOpen(true);
  }, []);

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
  const requireGoalsClick = currentStep?.id === 'goals-tab';
  const requireAchievementsClick = currentStep?.id === 'achievements-tab';
  const requireCategoryClick = currentStep?.requireCategoryClick;
  const requireAction = currentStep?.requireAction;

  const screen = currentStep?.screen || 'home';

  const onTutorialActionDone = useCallback((actionId) => {
    if (currentStep?.requireAction !== actionId) return;
    nextStep();
  }, [currentStep?.requireAction, nextStep]);

  // Сбрасываем флаг выбора цвета при смене шага
  useEffect(() => {
    if (currentStep?.id !== 'settings-color') {
      setIsColorPickerOpenForTutorial(false);
    }
  }, [currentStep?.id]);

  const onTutorialOpenSettings = useCallback(() => {
    setStepIndex((i) => {
      if (i < steps.length && steps[i]?.id === 'settings-button') return i + 1;
      return i;
    });
  }, [steps]);

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
        requireGoalsClick,
        requireAchievementsClick,
        requireCategoryClick,
        requireAction,
        screen,
        onTutorialActionDone,
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
