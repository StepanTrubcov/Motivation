// Exercise the actual Redux thunk/reducer in isolation; never touches a real user.
import fs from 'node:fs';
import vm from 'node:vm';
import { createRetryRequestIds } from '../src/lib/retryRequestIds.mjs';
import { beginGoalMutation, goalReadVersion, canApplyGoalRead } from '../src/lib/goalMutationClock.mjs';
let source = fs.readFileSync(new URL('../src/redux/goals_reducer.js', import.meta.url), 'utf8');
source = source.replace(/^import .*;$/gm, '').replaceAll('export const ', 'const ')
    .replace('export default GoalsReducer;', 'globalThis.audit = { addGoals, GoalsReducer };');
const pending = new Map();
const context = vm.createContext({ console, createRetryRequestIds, beginGoalMutation, goalReadVersion, canApplyGoalRead,
    getAllGoals: userId => new Promise(resolve => pending.set(userId, resolve)) });
vm.runInContext(source, context);
const { addGoals, GoalsReducer } = context.audit;
let state = GoalsReducer(undefined, {});
const dispatch = action => { state = GoalsReducer(state, action); };
let owner = 'account-A';
const getState = () => ({ profile: { profile: { id: owner } } });
const first = addGoals('account-A')(dispatch, getState);
owner = 'account-B';
const second = addGoals('account-B')(dispatch, getState);
pending.get('account-B')([{ id: 'B_1', userId: 'account-B', status: 'in_progress' }]);
await second;
pending.get('account-A')([{ id: 'A_1', userId: 'account-A', status: 'in_progress' }]);
await first;
console.log(JSON.stringify({ scenario: 'Switch to B while A is loading; A responds last',
    expectedOwner: 'account-B', actualOwner: state.goals[0]?.userId,
    result: state.goals[0]?.userId === 'account-B' ? 'PASS' : 'FAIL', databaseWrites: 0 }));

if (state.goals[0]?.userId !== "account-B") process.exitCode = 1;
