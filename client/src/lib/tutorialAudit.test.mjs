import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOnboardingSteps, buildExplanatorySteps } from './tutorialSteps.mjs';
import { tutorialPlacement } from './tutorialPlacement.mjs';
import { tutorialGoalsTab } from './tutorialGoals.mjs';
test('new-user completion and tutorial reward follow the deletion exercise',()=>{
 const steps=buildOnboardingSteps(false),ids=steps.map(s=>s.id);
 assert.equal(ids.at(-1),'tutorial-complete');
 assert.ok(ids.indexOf('goals-delete')<ids.indexOf('tutorial-complete'));
 assert.equal(new Set(ids).size,ids.length);
 assert.ok(!ids.includes('generate-button'));
});
test('created goal is reviewed in My and never taken a second time',()=>{
 const steps=buildOnboardingSteps(false);
 assert.equal(steps.find(s=>s.id==='goals-take-added').requireAction,undefined);
 for(const id of ['goals-find-added','goals-take-added','goals-delete'])assert.equal(tutorialGoalsTab(id),'mine');
});
test('tooltip stays inside a small phone viewport near either edge',()=>{
 for(const viewport of [568,740,844])for(const top of [10,150,viewport-70])for(const prefer of [true,false]){
   const pos=tutorialPlacement({top,height:60},200,viewport,prefer);
   assert.ok(pos.top>=24);assert.ok(pos.top+200<=viewport-76);
 }
});
test('tooltip prefers clear space rather than covering the bottom controls',()=>{
 assert.equal(tutorialPlacement({top:650,height:70},180,844,true).placeBelow,false);
 assert.equal(tutorialPlacement({top:50,height:50},180,844,false).placeBelow,true);
});
test('existing-user tour never requires changing goals and keeps achievement windows reachable',()=>{
 const steps=buildExplanatorySteps();
 assert.ok(steps.length<buildOnboardingSteps(false).length);
 assert.equal(steps.at(-1).id,'tutorial-complete');
 for(const step of steps)assert.ok(!['take_goal','create_goal','complete_goal','delete_goal','copy_report','generate_report'].includes(step.requireAction));
 assert.equal(steps.find(s=>s.id==='achievements-earned-choose').requireAction,'click_achievement');
 assert.equal(steps.find(s=>s.id==='achievements-cards').requireAction,'open_locked_achievement');
 assert.equal(steps.find(s=>s.id==='achievements-how-to-get').requireAction,'click_how_to_get_arrow');
 assert.equal(steps.find(s=>s.id==='goals-choose-category').requireCategoryClick,false);
});
test('existing-user tour skips unavailable achievement examples',()=>{
 const noEarned=buildExplanatorySteps({hasEarned:false});
 assert.ok(!noEarned.some(s=>['achievements-earned-choose','achievements-earned-modal'].includes(s.id)));
 const allEarned=buildExplanatorySteps({hasLocked:false});
 assert.ok(!allEarned.some(s=>['achievements-cards','achievements-how-to-get'].includes(s.id)));
 assert.equal(allEarned.find(s=>s.id==='achievements-tab').screen,'goals');
});
