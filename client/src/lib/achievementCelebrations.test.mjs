import test from 'node:test';
import assert from 'node:assert/strict';
import { acknowledgeAchievement, pendingAchievements, readSeenAchievements } from './achievementCelebrations.mjs';
const storage = () => { const values = new Map(); return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }; };
const earned = (id, date = '2026-10-28T12:00:00Z') => ({ id, templateId: `v2:${id}`, status: 'my', earnedAt: date });
test('login recovers earned rewards, ignores locked ones, sorts and deduplicates', () => {
 const first = earned('8'), earlier = earned('9', '2026-10-27T12:00:00Z');
 assert.deepEqual(pendingAchievements([first, {id:'3',status:'locked'}, first, earlier]).map(a=>a.id), ['9','8']);
});
test('dismissal persists, refresh does not repeat, next reward stays pending', () => {
 const store = storage(), first = earned('1'), second = earned('2');
 const seen = acknowledgeAchievement('persist-test', first, store);
 assert.deepEqual(pendingAchievements([first,second],seen),[second]);
 assert.deepEqual(pendingAchievements([first,second],readSeenAchievements('persist-test',store)),[second]);
 assert.equal(pendingAchievements([{...first, updatedAt:'2030-01-01'}],seen).length,0);
});
test('new reward arrives after prior dismissal and user accounts stay separate', () => {
 const store=storage(), first=earned('1'), second=earned('2');
 acknowledgeAchievement('user-A',first,store);
 assert.deepEqual(pendingAchievements([first,second],readSeenAchievements('user-A',store)),[second]);
 assert.equal(pendingAchievements([first],readSeenAchievements('user-B',store)).length,1);
});
test('blocked and corrupt storage do not lose new rewards or repeat acknowledged rewards this session', () => {
 const store={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
 const first=earned('4');
 assert.equal(pendingAchievements([first],readSeenAchievements('blocked',store)).length,1);
 acknowledgeAchievement('blocked',first,store);
 assert.equal(pendingAchievements([first],readSeenAchievements('blocked',store)).length,0);
 assert.equal(readSeenAchievements('corrupt',{getItem:()=>'{broken'}).size,0);
});
test('legacy rewards without earnedAt stay acknowledged when metadata changes', () => {
 const store=storage(), first={id:'old',status:'my'};
 acknowledgeAchievement('legacy',first,store);
 assert.equal(pendingAchievements([{...first,title:'Translated',updatedAt:'2027-01-01'}],readSeenAchievements('legacy',store)).length,0);
 assert.equal(pendingAchievements(null).length,0);
});

test('starting rewards always precede tutorial reward regardless of timestamps', () => {
 const tutorial=earned('2','2026-10-20T12:00:00Z');
 const first=earned('1','2026-10-28T12:00:00Z'), early=earned('27','2026-10-27T12:00:00Z');
 assert.deepEqual(pendingAchievements([tutorial,early,first]).map(a=>a.templateId),['v2:1','v2:27','v2:2']);
});
