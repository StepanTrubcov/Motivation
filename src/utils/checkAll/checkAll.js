export const checkAll = (assignments, triggeredRef, goals, newStatusAssignment, userId, userRegistrationStub) => {
    try {
        const registrationDate = new Date(userRegistrationStub);

        if (!Array.isArray(assignments)) {
            console.error('Assignments is not an array:', assignments);
            return;
        }

        if (!Array.isArray(goals)) {
            console.error('Goals is not an array:', goals);
            return;
        }

        assignments.forEach((achievement, index) => {
            try {

                const aid = String(achievement.id);
                if (achievement.status === "my") {
                    return;
                }

                if (triggeredRef.current.has(aid)) {
                    return;
                }

                if (achievement.type === "goal_based" && Array.isArray(achievement.goalIds)) {
                    // Теперь фильтруем по названию целей (title), а не по ID
                    const related = goals.filter((g) => {
                        const goalTitle = g.title;
                        const includes = achievement.goalIds.includes(goalTitle);
                        return includes;
                    });

                    if (!Array.isArray(related) || related.length === 0) {
                        return;
                    }

                    let progressSum = 0;
                    related.forEach((goal, goalIndex) => {
                        const progressValue = Number(goal.progress) || 0;
                        progressSum += progressValue;
                    });

                    if (progressSum >= Number(achievement.target || 0)) {
                        triggeredRef.current.add(aid);
                        newStatusAssignment(achievement, userId);
                        return;
                    }
                }

                if (achievement.type === "time_based") {
                    const diffDays = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays > Number(achievement.target || 0)) {
                        triggeredRef.current.add(aid);
                        newStatusAssignment(achievement, userId);
                        return;
                    }
                }
            } catch (achievementError) {
                console.error(`Error processing achievement ${achievement?.title || achievement?.id}:`, achievementError);
            }
        });

    } catch (error) {
        console.error('Error in checkAll function:', error);
    }
};