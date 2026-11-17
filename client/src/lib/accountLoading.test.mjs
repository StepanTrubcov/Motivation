import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { ACHIEVEMENT_TEMPLATES } from './achievementTemplates.mjs';
const rows = () => ACHIEVEMENT_TEMPLATES.map(a => ({ ...a, templateId: `v2:${a.id}` }));
function harness(fetchAchievements, initialize = async () => {}) {
  let source = fs.readFileSync(new URL('../redux/assignments_reducer.js', import.meta.url), 'utf8');
  source = source.replace(/^import .*;$/gm, '').replaceAll('export const ', 'const ')
    .replace('export default AssignmentsReducer;', 'globalThis.subject = { AssignmentsReducer, ensureAchievementsInitialized, getAchievementsData };');
  const context = vm.createContext({ console: { error: () => {} }, ACHIEVEMENT_TEMPLATES,
    getAchievements: fetchAchievements, initializeAchievements: initialize });
  vm.runInContext(source, context);
  const api = context.subject;
  let owner = 'A', state = api.AssignmentsReducer(undefined, {});
  const dispatch = action => typeof action === 'function' ? action(dispatch, getState) : (state = api.AssignmentsReducer(state, action));
  const getState = () => ({ profile: { profile: { id: owner } }, assignments: state });
  const switchTo = id => { owner = id; dispatch({ type: 'profile/SET_PROFILE', user: { id } }); };
  switchTo(owner);
  return { ...api, dispatch, getState, switchTo };
}
test('Late achievements from a previous account cannot replace the current collection or ready flag', async () => {
  const pending = new Map();
  const h = harness(id => new Promise(resolve => pending.set(id, resolve)));
  const a = h.dispatch(h.ensureAchievementsInitialized('A'));
  h.switchTo('B');
  assert.equal(h.getState().assignments.assignmentsLoaded, false);
  const b = h.dispatch(h.ensureAchievementsInitialized('B'));
  pending.get('B')(rows());
  await b;
  const current = h.getState().assignments.assignments;
  pending.get('A')(rows());
  await a;
  assert.equal(h.getState().assignments.ownerId, 'B');
  assert.equal(h.getState().assignments.assignments, current);
});
test('Failed refresh preserves a loaded collection and failed initial load never masquerades as an empty success', async () => {
  let fail = false;
  const h = harness(async () => { if (fail) throw new Error('offline'); return rows(); });
  await h.dispatch(h.ensureAchievementsInitialized('A'));
  const collection = h.getState().assignments.assignments;
  fail = true;
  await assert.rejects(h.dispatch(h.getAchievementsData('A')), /offline/);
  assert.equal(h.getState().assignments.assignments, collection);
  h.switchTo('B');
  await assert.rejects(h.dispatch(h.ensureAchievementsInitialized('B')), /offline/);
  assert.equal(h.getState().assignments.assignmentsLoaded, false);
});
test('Partial initialization is rejected and can be retried successfully', async () => {
  let partial = true;
  const h = harness(async () => partial ? rows().slice(0, 2) : rows());
  await assert.rejects(h.dispatch(h.ensureAchievementsInitialized('A')), /не полностью/);
  assert.equal(h.getState().assignments.assignmentsLoaded, false);
  partial = false;
  await h.dispatch(h.ensureAchievementsInitialized('A'));
  assert.equal(h.getState().assignments.assignments.length, ACHIEVEMENT_TEMPLATES.length);
  assert.equal(h.getState().assignments.assignmentsLoaded, true);
});
