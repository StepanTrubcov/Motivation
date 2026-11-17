export const GOALS_INTRO_STEPS = [
  { id: 'goals-mine', titleKey: 'tutorialMyGoalsTitle', descKey: 'tutorialMyGoalsDesc', screen: 'goals' },
  { id: 'goals-catalog-intro', titleKey: 'tutorialCatalogTitle', descKey: 'tutorialCatalogDesc', screen: 'goals' },
  { id: 'goals-choose-category', titleKey: 'tutorialGoalsChooseCategoryTitle', descKey: 'tutorialGoalsChooseCategoryDesc', requireCategoryClick: true, screen: 'goals' },
];
export function tutorialGoalsTab(stepId) {
  if (['goals-mine', 'goals-completed', 'goals-in-progress','goals-find-added','goals-take-added','goals-delete'].includes(stepId)) return 'mine';
  if (['goals-catalog-intro', 'goals-choose-category', 'goals-available', 'goals-take-one', 'goals-create'].includes(stepId)) return 'catalog';
  return null;
}
export const GOALS_TUTORIAL_TARGETS = {
  'goals-mine': 'goals-tabs',
  'goals-choose-category': 'goals-category-tabs',
  'goals-take-one': 'goals-catalog-list',
  'goals-find-added': 'tutorial-custom-goal',
  'goals-take-added': 'tutorial-custom-goal',
  'goals-delete': 'tutorial-custom-goal',
};
