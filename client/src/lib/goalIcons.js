const groups = {
    run: [1, 3, 131],
    walk: [14, 134, 63, 137, 51],
    exercise: [5, 8, 18, 25, 135, 49, 61, 52, 62, 184, 64, 65, 132, 133, 136, 139],
    breathing: [138],
    computer: [4, 13, 147, 69],
    clock: [35, 36, 144, 45, 70, 146, 155],
    clean: [66],
    book: [2, 57, 176, 181, 24, 47, 166, 34, 161, 167, 73, 160, 185, 54, 153, 6, 55, 71, 75, 145, 158, 159, 162, 163, 165, 168, 169],
    idea: [72, 74, 164],
    prayer: [174, 175, 179, 180, 58, 60, 177, 178],
    singing: [182],
    star: [183],
    'no-sweets': [68],
};
export const GOAL_ICON_NAMES = [...Object.keys(groups), 'custom'];
const iconById = Object.fromEntries(Object.entries(groups).flatMap(([name, ids]) => ids.map(id => [String(id), name])));
export function goalIconName(goal) {
    const id = String(goal?.id || '');
    const templateId = /^\d+$/.test(id) ? id : id.match(/^[^_]+_(\d+)$/)?.[1];
    return iconById[templateId] || 'custom';
}
