import fs from 'node:fs';
import assert from 'node:assert/strict';
import { migrationPlan } from '../../src/lib/progress/migrate.mjs';
import { expandCalendar,canonicalCalendar } from '../../src/lib/progress/calendar.mjs';
const backup=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let periods=0,states=0,goals=0,earned=0;
for (const user of backup.users) {
  const plan=migrationPlan(user,backup.goals.filter(g=>g.userId===user.id),backup.achievements.filter(a=>a.userId===user.id));
  const expanded=expandCalendar(plan.calendar.meta,plan.calendar.periods,plan.calendar.states,plan.calendar.receipts);
  assert.deepEqual(canonicalCalendar(expanded),canonicalCalendar(user.savingGoals || []));
  periods+=plan.calendar.periods.length; states+=plan.calendar.states.length;goals+=plan.personal.length;earned+=plan.earned.length;
}
console.log(JSON.stringify({users:backup.users.length,personalGoals:goals,earnedAchievements:earned,periods,dayStates:states,comparison:'PASS',databaseWrites:0}));
