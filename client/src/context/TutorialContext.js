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
  { id: 'goals-find-added', titleKey: 'tutorialFindAddedGoal', descKey: 'tutorialFindAddedGoalDesc', screen: 'goals' },
  { id: 'goals-take-added', titleKey: 'tutorialTakeAddedGoal', descKey: 'tutorialTakeAddedGoalDesc', requireAction: 'take_goal', screen: 'goals' },
  { id: 'home-tab', titleKey: 'tutorialStepHomeTab', descKey: 'tutorialStepHomeTabDesc', requireClick: true, screen: 'goals' },
];

const ACHIEVEMENTS_STEPS = [
  { id: 'achievements-intro', titleKey: 'tutorialAchievementsIntroTitle', descKey: 'tutorialAchievementsIntroDesc', screen: 'achievements' },
  { id: 'achievements-earned', titleKey: 'tutorialAchievementsEarnedTitle', descKey: 'tutorialAchievementsEarnedDesc', screen: 'achievements' },
  { id: 'achievements-earned-choose', titleKey: 'tutorialAchievementsEarnedChooseTitle', descKey: 'tutorialAchievementsEarnedChooseDesc', requireAction: 'click_achievement', screen: 'achievements' },
  { id: 'achievements-earned-modal', titleKey: 'tutorialAchievementsEarnedModalTitle', descKey: 'tutorialAchievementsEarnedModalDesc', screen: 'achievements' },
  { id: 'achievements-all', titleKey: 'tutorialAchievementsAllTitle', descKey: 'tutorialAchievementsAllDesc', screen: 'achievements' },
  { id: 'achievements-rarities', titleKey: 'tutorialAchievementsRaritiesTitle', descKey: 'tutorialAchievementsRaritiesDesc', screen: 'achievements' },
  { id: 'achievements-cards', titleKey: 'tutorialAchievementsCardsTitle', descKey: 'tutorialAchievementsCardsDesc', screen: 'achievements' },
  { id: 'achievements-how-to-get', titleKey: 'tutorialAchievementsHowToGetTitle', descKey: 'tutorialAchievementsHowToGetDesc', requireAction: 'click_how_to_get_arrow', screen: 'achievements' },
];

const TUTORIAL_COMPLETE_STEP = { id: 'tutorial-complete', titleKey: 'tutorialCompleteTitle', descKey: 'tutorialCompleteDesc', screen: 'achievements' };

/** Шаги: report-view (copy) → achievements-tab → … → goals-delete-intro → goals-delete */
const BRIDGE_STEPS = [
  { id: 'home-two-goals-intro', titleKey: 'tutorialTwoGoalsIntroTitle', descKey: 'tutorialTwoGoalsIntroDesc', screen: 'home' },
  { id: 'complete-goal', titleKey: 'tutorialStepCompleteGoal', descKey: 'tutorialStepCompleteGoalDesc', requireAction: 'complete_goal', screen: 'home' },
  { id: 'generate-report', titleKey: 'tutorialGenerateReportTitle', descKey: 'tutorialGenerateReportDesc', requireAction: 'generate_report', screen: 'home' },
  { id: 'report-view', titleKey: 'tutorialReportViewTitle', descKey: 'tutorialReportViewDesc', requireAction: 'copy_report', screen: 'home' },
  { id: 'achievements-tab', titleKey: 'tutorialStepAchievementsTab', descKey: 'tutorialStepAchievementsTabDesc', requireClick: true, screen: 'home' },
  { id: 'goals-delete-intro', titleKey: 'tutorialGoalsDeleteIntroTitle', descKey: 'tutorialGoalsDeleteIntroDesc', screen: 'goals' },
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
    BRIDGE_STEPS[0], // home-two-goals-intro
    BRIDGE_STEPS[1], // complete-goal
    BRIDGE_STEPS[2], // generate-report
    BRIDGE_STEPS[3], // report-view
    BRIDGE_STEPS[4], // achievements-tab
    ...ACHIEVEMENTS_STEPS,
    TUTORIAL_COMPLETE_STEP, // обучение окончено + ссылка на бота
    BRIDGE_STEPS[5], // goals-delete-intro
    BRIDGE_STEPS[6], // goals-delete
  ];
};

/** Обучение для пользователей с уже существующими целями: только рассказ по блокам, без действий «взять/выполнить/создать/удалить» */
const buildExplanatorySteps = () => {
  const introExistingGoals = { id: 'intro', titleKey: 'tutorialIntroTitleExistingGoals', descKey: 'tutorialIntroDescExistingGoals', screen: 'home' };
  const goalsOverviewOnly = GOALS_STEPS.slice(0, 4); // goals-intro, goals-completed, goals-in-progress, goals-available
  const achievementsExplanatory = [
    { id: 'achievements-intro', titleKey: 'tutorialAchievementsIntroTitle', descKey: 'tutorialAchievementsIntroDesc', screen: 'achievements' },
    { id: 'achievements-earned', titleKey: 'tutorialAchievementsEarnedTitle', descKey: 'tutorialAchievementsEarnedDesc', screen: 'achievements' },
    { id: 'achievements-earned-choose', titleKey: 'tutorialAchievementsEarnedChooseTitle', descKey: 'tutorialAchievementsEarnedChooseDesc', screen: 'achievements' },
    { id: 'achievements-earned-modal', titleKey: 'tutorialAchievementsEarnedModalTitle', descKey: 'tutorialAchievementsEarnedModalDesc', screen: 'achievements' },
    { id: 'achievements-all', titleKey: 'tutorialAchievementsAllTitle', descKey: 'tutorialAchievementsAllDesc', screen: 'achievements' },
    { id: 'achievements-rarities', titleKey: 'tutorialAchievementsRaritiesTitle', descKey: 'tutorialAchievementsRaritiesDesc', screen: 'achievements' },
    { id: 'achievements-cards', titleKey: 'tutorialAchievementsCardsTitle', descKey: 'tutorialAchievementsCardsDesc', screen: 'achievements' },
    { id: 'achievements-how-to-get', titleKey: 'tutorialAchievementsHowToGetTitle', descKey: 'tutorialAchievementsHowToGetDesc', screen: 'achievements' },
  ];
  return [
    introExistingGoals,
    ...HOME_STEPS_FULL.slice(1), // profile-points … goals-tab (включая requireClick для settings-button и goals-tab)
    ...goalsOverviewOnly,
    BRIDGE_STEPS[4], // achievements-tab (requireClick)
    ...achievementsExplanatory,
    TUTORIAL_COMPLETE_STEP,
  ];
};

export const TutorialProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isColorPickerOpenForTutorial, setIsColorPickerOpenForTutorial] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalModalTutorialPhase, setGoalModalTutorialPhase] = useState(null);
  /** Фазы обучения в модалке «Создать свою цель»: name → category → button */
  const [createGoalModalTutorialPhase, setCreateGoalModalTutorialPhase] = useState(null);
  /** Категория цели, созданной в обучении (Sport, Discipline, …) — для шага «найдите цель» */
  const [lastCreatedGoalCategory, setLastCreatedGoalCategory] = useState(null);
  /** Шаг complete-goal: сколько целей выполнено в обучении */
  const [completeGoalsDoneCount, setCompleteGoalsDoneCount] = useState(0);
  /** Шаг complete-goal: фаза (complete -> undo) */
  const [completeGoalTutorialPhase, setCompleteGoalTutorialPhase] = useState('complete');
  /** Шаг achievements-how-to-get: пользователь нажал на стрелку — показываем кнопку «Далее» */
  const [achievementHowToGetArrowClicked, setAchievementHowToGetArrowClicked] = useState(false);

  const goals = useSelector((state) => state.goals?.goals ?? []);
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
    () => (hasExistingGoals ? buildExplanatorySteps() : buildOnboardingSteps(hasTodayGoals)),
    [hasExistingGoals, hasTodayGoals]
  );
  const [steps, setSteps] = useState(computedSteps);

  useEffect(() => {
    if (!isOpen) setSteps(computedSteps);
  }, [computedSteps, isOpen]);

  const startTutorial = useCallback((screenName = 'home') => {
    setSteps(computedSteps);
    setStepIndex(0);
    setIsOpen(true);
  }, [computedSteps]);

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

  const onTutorialActionDone = useCallback((actionId) => {
    if (currentStep?.id === 'complete-goal') {
      if (actionId !== 'complete_goal') return;
      setCompleteGoalsDoneCount((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setCompleteGoalTutorialPhase('undo');
        }
        return next;
      });
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
  }, [currentStep?.id, currentStep?.requireAction, nextStep]);

  useEffect(() => {
    if (currentStep?.id !== 'complete-goal') {
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
        completeGoalsDoneCount,
        completeGoalTutorialPhase,
        achievementHowToGetArrowClicked,
        isExplanatoryTutorial: hasExistingGoals,
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
