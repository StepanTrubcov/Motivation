export function formatPoints(value, language) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const absolute = Math.abs(number);
    // Promote rounded thousands to millions instead of displaying 1000k.
    if (absolute >= 999950) {
        return `${formatter.format(number / 1000000)}${language === 'ru' ? 'м' : 'M'}`;
    }
    if (absolute >= 1000) {
        return `${formatter.format(number / 1000)}${language === 'ru' ? 'к' : 'k'}`;
    }
    return formatter.format(number);
}

export function pointsLabelKey(value, language) {
    const number = Number(value);
    if (!Number.isFinite(number) || Math.abs(number) >= 1000) return 'pointsMany';
    const form = new Intl.PluralRules(language === 'ru' ? 'ru' : 'en').select(number);
    return form === 'one' ? 'pointsOne' : form === 'few' ? 'pointsFew' : 'pointsMany';
}
