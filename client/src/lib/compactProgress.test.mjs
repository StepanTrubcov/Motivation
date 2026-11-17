import test from 'node:test';
import assert from 'node:assert/strict';
import { compressCalendar, expandCalendar, canonicalCalendar, addDay } from './progress/calendar.mjs';
import { planGoalCompletion } from './goalCompletion.mjs';
import { planGoalLifecycle } from './goalLifecycle.mjs';
import { hashValue } from './progress/catalogs.mjs';
const now = new Date('2026-11-02T12:00:00Z');
const user = { id:'fixture', pts:100 };
const goal = { id:'fixture_2', userId:user.id, title:'Read', status:'in_progress', progress:29, points:20 };
const roundtrip = calendar => {
  const compressed = compressCalendar(user.id,calendar);
  const expanded = expandCalendar(compressed.meta,compressed.periods,compressed.states,compressed.receipts);
  assert.deepEqual(canonicalCalendar(expanded),canonicalCalendar(calendar));
  return compressed;
};
test('A goal taken for 120 days uses one period plus sparse completions and preserves empty days', () => {
  const calendar = Array.from({length:120},(_,i) => ({date:addDay('2026-11-01',i),goalData:[{idGoals:goal.id,status:i===1?'completed':'in_progress',durationMinutes:20}]}));
  const compressed = roundtrip(calendar);
  assert.equal(compressed.periods.length,1);
  assert.equal(compressed.states.length,1);
  assert.equal(compressed.meta.ranges.length,1);
  assert.ok(JSON.stringify(compressed).length < JSON.stringify(calendar).length / 5);
  roundtrip([...calendar,{date:addDay('2026-11-01',121),goalData:[]}]);
});
test('Calendar keeps order, gaps, changed time/quantity, metadata, receipts and empty receipt arrays', () => {
  roundtrip([
    {date:'2026-11-01',goalData:[{idGoals:goal.id,status:'completed',durationMinutes:10},{idGoals:'custom',status:'in_progress',quantity:10}],completionRequests:['completion-request-1'],customDayMetadata:{note:'keep'}},
    {date:'2026-11-02',goalData:[{idGoals:'custom',status:'completed',quantity:20},{idGoals:goal.id,status:'in_progress',durationMinutes:30}],mutationRequests:['lifecycle-request-1']},
    {date:'2026-11-04',goalData:[],completionRequests:[]},
  ]);
});
test('JSONB key reordering cannot change a period or template identity', () => {
  const a=compressCalendar(user.id,[{date:'2026-11-01',goalData:[{idGoals:goal.id,status:'in_progress',quantity:10,durationMinutes:20}]}]);
  const b=compressCalendar(user.id,[{date:'2026-11-01',goalData:[{durationMinutes:20,quantity:10,status:'in_progress',idGoals:goal.id}]}]);
  assert.equal(a.periods[0].id,b.periods[0].id);
  assert.equal(hashValue({title:'Read',points:20}),hashValue({points:20,title:'Read'}));
});
test('Completion, undo, delayed retry and removal produce equivalent calendars after compression', () => {
  let record={...user,savingGoals:[{date:'2026-11-02',goalData:[{idGoals:goal.id,status:'in_progress',durationMinutes:20}]}]};
  let current={...goal};
  for (const [action,id] of [['complete','completion-000001'],['undo','completion-000002'],['complete','completion-000001']]) {
    const plan=planGoalCompletion(record,current,action,id,now);
    if (!plan.duplicate) {record={...record,...plan.user};current={...current,...plan.goal};}
    roundtrip(record.savingGoals);
  }
  assert.equal(record.pts,100);
  assert.equal(current.progress,29);
  const removed=planGoalLifecycle(record,current,{action:'remove',requestId:'remove-request-0001'},now);
  roundtrip(removed.user.savingGoals);
  assert.equal(removed.goal.progress,29);
});
test('Invalid historical shapes abort migration instead of silently losing data', () => {
  assert.throws(()=>roundtrip([{date:'2026-11-02',goalData:[]},{date:'2026-11-02',goalData:[]}]),/duplicate/);
  assert.throws(()=>roundtrip([{date:'2026-11-02',goalData:[{idGoals:goal.id,status:'completed'},{idGoals:goal.id,status:'in_progress'}]}]),/Duplicate/);
});

test('Unused catalog goals retain legacy zero selections without creating personal rows', async () => {
  const { migrationPlan } = await import('./progress/migrate.mjs');
  const { readGoals } = await import('./progress/store.mjs');
  const { ACHIEVEMENT_TEMPLATES } = await import('./achievementTemplates.mjs');
  const { default: definitions } = await import('./progress/legacyDefinitions.json', { with: { type: 'json' } });
  const goal = { ...Object.values(definitions.goals)[0], id: 'fixture_5', userId: 'fixture', status: 'not_started', progress: 0, selectedOption: 0 };
  const achievements = ACHIEVEMENT_TEMPLATES.map(a => ({ ...a, id: `fixture-ach-${a.id}`, templateId: `v2:${a.id}` }));
  const plan = migrationPlan({ id: 'fixture', savingGoals: [] }, [goal], achievements);
  assert.equal(plan.personal.length, 0);
  const goals = await readGoals({userGoal:{findMany:async()=>[]}}, 'fixture', { id:'fixture', storageVersion:1, progressMeta:plan.meta });
  assert.equal(goals.find(g=>g.id===goal.id).selectedOption,0);
});

test('The preserved legacy tutorial achievement can still be earned after the move', async () => {
  const { canUnlockAchievement } = await import('./achievementEligibility.mjs');
  const legacy = { id: 'old-row', templateId: '27', rarity: 'common', type: 'event_based' };
  assert.equal(canUnlockAchievement(legacy, { tutorialCompleted: true }), true);
  assert.equal(canUnlockAchievement(legacy, { tutorialCompleted: false }), false);
  assert.equal(canUnlockAchievement({ ...legacy, templateId: 'v2:27', rarity: 'epic' }, { tutorialCompleted: true, first100: false }), false);
});
