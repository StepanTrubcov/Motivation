const users = new Map();
const entry = id => { if (!users.has(id)) users.set(id, { revision: 0, pending: 0 }); return users.get(id); };
export const goalReadVersion = id => entry(id).revision;
export const canApplyGoalRead = (id, version) => entry(id).pending === 0 && entry(id).revision === version;
export function beginGoalMutation(id) {
    const state = entry(id);
    state.pending++; state.revision++;
    let finished = false;
    return () => {
        if (finished) return;
        finished = true;
        state.pending--; state.revision++;
    };
}
