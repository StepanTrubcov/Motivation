import test from 'node:test';
import assert from 'node:assert/strict';
import { readOnboardingStage, saveOnboardingStage, findTutorialAchievement } from './firstTimeOnboarding.mjs';
const storage = () => {const data = new Map();return {getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};};
test('new registration starts with language even when goals exist',()=>{
 assert.equal(readOnboardingStage({id:'new',onboardingStage:'language'},[{status:'completed'}],storage()),'language');
});
test('existing registration never repeats onboarding because goals are empty',()=>{
 assert.equal(readOnboardingStage({id:'existing',savingGoals:[]},[],storage()),'done');
});
test('server stage wins over device cache and resumes interrupted tutorial',()=>{
 const store=storage(); saveOnboardingStage('u','welcome',store);
 assert.equal(readOnboardingStage({id:'u',onboardingStage:'done'},[],store),'done');
 assert.equal(readOnboardingStage({id:'u',onboardingStage:'tutorial'},[],store),'tutorial-offer');
});

test('tutorial unlock selects In the Game rather than the epic starting reward',()=>{
 const epic={id:'27',templateId:'v2:27',title:'Один из первых',status:'my'};
 const tutorial={id:'tutorial-db-id',templateId:'v2:2',title:'В игре',status:'locked'};
 assert.equal(findTutorialAchievement([epic,tutorial]),tutorial);
 assert.equal(findTutorialAchievement(null),undefined);
});
