export const checkAll = (assignments, triggeredRef, goals, newStatusAssignment, userId, userRegistrationStub) => {
    // Преобразуем строку регистрации в объект Date
    const registrationDate = new Date(userRegistrationStub);

    assignments.forEach((achievement) => {
        const aid = String(achievement.id);
        if (achievement.status === "my") return;

        if (triggeredRef.current.has(aid)) return;

        if (achievement.type === "goal_based" && Array.isArray(achievement.goalIds)) {
            const related = goals.filter((g) => achievement.goalIds.includes(String(g.id)));
            const progressSum = related.reduce((acc, g) => acc + (Number(g.progress) || 0), 0);

            if (progressSum >= Number(achievement.target || 0)) {
                triggeredRef.current.add(aid);
                newStatusAssignment(achievement, userId);
                return;
            }
        }

        if (achievement.type === "time_based") {
            const diffDays = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= Number(achievement.target || 0)) {
                triggeredRef.current.add(aid);
                newStatusAssignment(achievement, userId);
                return;
            }
        }
    });
};
