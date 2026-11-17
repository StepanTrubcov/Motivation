import { GOALS_INTRO_STEPS } from './tutorialGoals.mjs';

const HOME_STEPS_FULL = [
  { id: 'intro', titleKey: 'tutorialIntroTitle', descKey: 'tutorialIntroDesc', screen: 'home' },
  { id: 'home-intro', titleKey: 'tutorialHomeIntroTitle', descKey: 'tutorialHomeIntroDesc', screen: 'home' },
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
  ...GOALS_INTRO_STEPS,
  { id: 'goals-take-one', titleKey: 'tutorialStepTakeGoal', descKey: 'tutorialStepTakeGoalDesc', requireAction: 'take_goal', screen: 'goals' },
  { id: 'goals-toast-success', titleKey: 'tutorialStepToastTitle', descKey: 'tutorialStepToastDesc', screen: 'goals' },
  { id: 'goals-create', titleKey: 'tutorialStepCreateGoal', descKey: 'tutorialStepCreateGoalDesc', requireAction: 'create_goal', screen: 'goals' },
  { id: 'goals-take-added', titleKey: 'tutorialTakeAddedGoal', descKey: 'tutorialTakeAddedGoalDesc', screen: 'goals' },
  { id: 'home-tab', titleKey: 'tutorialStepHomeTab', descKey: 'tutorialStepHomeTabDesc', requireClick: true, screen: 'goals' },
];

const ACHIEVEMENTS_STEPS = [
  { id: 'achievements-intro', titleKey: 'tutorialAchievementsIntroTitle', descKey: 'tutorialAchievementsIntroDesc', screen: 'achievements' },
  { id: 'achievements-earned', titleKey: 'tutorialAchievementsEarnedTitle', descKey: 'tutorialAchievementsEarnedDesc', screen: 'achievements' },
  { id: 'achievements-earned-choose', titleKey: 'tutorialAchievementsEarnedChooseTitle', descKey: 'tutorialAchievementsEarnedChooseDesc', requireAction: 'click_achievement', screen: 'achievements' },
  { id: 'achievements-earned-modal', titleKey: 'tutorialAchievementsEarnedModalTitle', descKey: 'tutorialAchievementsEarnedModalDesc', screen: 'achievements' },
  { id: 'achievements-all', titleKey: 'tutorialAchievementsAllTitle', descKey: 'tutorialAchievementsAllDesc', screen: 'achievements' },
  { id: 'achievements-rarities', titleKey: 'tutorialAchievementsRaritiesTitle', descKey: 'tutorialAchievementsRaritiesDesc', screen: 'achievements' },
  { id: 'achievements-cards', titleKey: 'tutorialAchievementsCardsTitle', descKey: 'tutorialAchievementsCardsDesc', requireAction: 'open_locked_achievement', screen: 'achievements' },
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
export const buildOnboardingSteps = (hasTodayGoals) => {
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
    BRIDGE_STEPS[5], // goals-delete-intro
    BRIDGE_STEPS[6], // goals-delete
    TUTORIAL_COMPLETE_STEP, // reward only after the final exercise
  ];
};

/** Обучение для пользователей с уже существующими целями: только рассказ по блокам, без действий «взять/выполнить/создать/удалить» */
export const buildExplanatorySteps = ({ hasEarned = true, hasLocked = true } = {}) => {
  const introExistingGoals = { id: 'intro', titleKey: 'tutorialIntroTitleExistingGoals', descKey: 'tutorialIntroDescExistingGoals', screen: 'home' };
  const goalsOverviewOnly = GOALS_INTRO_STEPS.map(step => ({ ...step, requireCategoryClick: false,
    ...(step.id === 'goals-catalog-intro' ? { descKey: 'tutorialCatalogOverviewDesc' } : {}),
    ...(step.id === 'goals-choose-category' ? { descKey: 'tutorialCategoriesOverviewDesc' } : {}),
  }));
  const achievementsExplanatory = ACHIEVEMENTS_STEPS.filter(step =>
    (hasEarned || !['achievements-earned-choose', 'achievements-earned-modal'].includes(step.id)) &&
    (hasLocked || !['achievements-cards', 'achievements-how-to-get'].includes(step.id))
  );
  return [
    introExistingGoals,
    ...HOME_STEPS_FULL.slice(1), // profile-points … goals-tab (включая requireClick для settings-button и goals-tab)
    ...goalsOverviewOnly,
    { ...BRIDGE_STEPS[4], screen: 'goals' }, // navigate directly from the catalog
    ...achievementsExplanatory,
    TUTORIAL_COMPLETE_STEP,
  ];
};
