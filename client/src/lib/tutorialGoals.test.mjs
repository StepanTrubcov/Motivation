import test from 'node:test';
import assert from 'node:assert/strict';
import { GOALS_INTRO_STEPS, GOALS_TUTORIAL_TARGETS, tutorialGoalsTab } from './tutorialGoals.mjs';
test('goals onboarding explains My, opens catalog, then requires category selection',()=>{
 assert.deepEqual(GOALS_INTRO_STEPS.map(step=>step.id),['goals-mine','goals-catalog-intro','goals-choose-category']);
 assert.equal(GOALS_INTRO_STEPS[2].requireCategoryClick,true);
 assert.equal(tutorialGoalsTab('goals-mine'),'mine');
 for(const id of ['goals-catalog-intro','goals-choose-category','goals-take-one'])assert.equal(tutorialGoalsTab(id),'catalog');
});
test('spotlight targets match the current tabs, categories and catalog list',()=>{
 assert.equal(GOALS_TUTORIAL_TARGETS['goals-mine'],'goals-tabs');
 assert.equal(GOALS_TUTORIAL_TARGETS['goals-choose-category'],'goals-category-tabs');
 assert.equal(GOALS_TUTORIAL_TARGETS['goals-take-one'],'goals-catalog-list');
 assert.equal(tutorialGoalsTab('unrelated'),null);
});
