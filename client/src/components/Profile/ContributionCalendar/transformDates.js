function transformDates(datesArray) {
    if (!Array.isArray(datesArray)) return {};

    const counts = {};
    datesArray.forEach(date => {
        const normalizedDate = new Date(date).toISOString().slice(0, 10);
        counts[normalizedDate] = (counts[normalizedDate] || 0) + 1;
    });

    return counts;
}

export default transformDates;