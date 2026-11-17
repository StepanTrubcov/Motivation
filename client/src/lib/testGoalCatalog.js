import frozenCatalogs from './progress/goalCatalogVersions.json';
import catalog from './testbot-goal-catalog.json';
export const TEST_CATALOG_USER_ID = catalog.userId;
export const TEST_GOALS = catalog.goals;
export function decorateTestGoal(goal, language = 'ru') {
    if (goal.userId !== TEST_CATALOG_USER_ID) return goal;
    const prefix = `${TEST_CATALOG_USER_ID}_`;
    if (!goal.id.startsWith(prefix)) return goal;
    const suffix = goal.id.slice(prefix.length);
    if (!/^\d+$/.test(suffix)) return goal;
    const source = goal.catalogVersion === 'testbot-v1' ? frozenCatalogs['testbot-v1'] : TEST_GOALS;
    const spec = source.find(g => g.id === suffix);
    if (!spec) return { ...goal, retiredFromCatalog: true, testCatalog: true };
    const title = language === 'en' ? spec.titleEn : spec.title;
    return { ...goal, title, baseTitle: title, description: title, testCatalog: true, durationOptions: spec.durationOptions,
        defaultDuration: spec.defaultDuration, timePicker: !!spec.timePicker, defaultTime: spec.defaultTime };
}
