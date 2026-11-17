export const ACCENT_COLORS = [
    { name: 'Зелёный', nameEn: 'Green', color: '#59cf8d', previous: '#81b99a', legacy: '#00ff1e' },
    { name: 'Синий', nameEn: 'Blue', color: '#589eea', previous: '#7d9fc9', legacy: '#0080ff' },
    { name: 'Фиолетовый', nameEn: 'Purple', color: '#ac7bea', previous: '#aa94c8', legacy: '#9b4dff' },
    { name: 'Розовый', nameEn: 'Pink', color: '#e77daa', previous: '#cb98ad', legacy: '#ff4d9b' },
    { name: 'Оранжевый', nameEn: 'Orange', color: '#ed9b61', previous: '#caa07f', legacy: '#ff6b35' },
    { name: 'Красный', nameEn: 'Red', color: '#e57575', previous: '#c98c8c', legacy: '#ff3b30' },
    { name: 'Голубой', nameEn: 'Cyan', color: '#50c6dd', previous: '#80b8c5', legacy: '#00d4ff' },
    { name: 'Жёлтый', nameEn: 'Yellow', color: '#e2c75b', previous: '#c5b67c', legacy: '#ffd700' },
    { name: 'Электрик', nameEn: 'Electric blue', color: '#4169ff' },
    { name: 'Яркий фиолетовый', nameEn: 'Vivid purple', color: '#9747ff' },
    { name: 'Фуксия', nameEn: 'Fuchsia', color: '#f238c8' },
    { name: 'Лайм', nameEn: 'Lime', color: '#b4ef28' },
    { name: 'Бирюза', nameEn: 'Turquoise', color: '#00ddb5' },
    { name: 'Мандарин', nameEn: 'Tangerine', color: '#ff8126' },
    { name: 'Коралл', nameEn: 'Coral', color: '#ff5368' },
    { name: 'Солнечный жёлтый', nameEn: 'Sunshine yellow', color: '#ffd329' },
];
export const DEFAULT_ACCENT = ACCENT_COLORS[0].color;
export function normalizeAccent(color) {
    if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) return DEFAULT_ACCENT;
    return ACCENT_COLORS.find(option => (option.legacy === color.toLowerCase() || option.previous === color.toLowerCase()))?.color || color;
}
