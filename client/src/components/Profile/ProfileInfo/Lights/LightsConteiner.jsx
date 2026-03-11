import React, { useEffect, useState } from "react";
import Lights from "./Lights";
import { connect } from "react-redux";

function computeSeries(timeGoalsSaving) {
    if (!timeGoalsSaving || !Array.isArray(timeGoalsSaving)) return 0;
    const today = new Date().toISOString().split("T")[0];
    const pastDays = timeGoalsSaving
        .filter((item) => item.date < today)
        .sort((a, b) => a.date.localeCompare(b.date));
    let num = 0;
    pastDays.forEach((s) => {
        const r = (s.goalData || []).filter((g) => g.status === "completed");
        if (r.length >= 1) num += 1;
        else num = 0;
    });
    const todayDay = timeGoalsSaving.find((item) => item.date === today);
    if (todayDay && todayDay.goalData) {
        const r = todayDay.goalData.filter((g) => g.status === "completed");
        if (r.length > 0) num += 1;
    }
    return num;
}

function getIsTodayCompleted(timeGoalsSaving) {
    if (!timeGoalsSaving || !Array.isArray(timeGoalsSaving)) return false;
    const today = new Date().toISOString().split("T")[0];
    const todayDay = timeGoalsSaving.find((item) => item.date === today);
    if (!todayDay || !todayDay.goalData) return false;
    return todayDay.goalData.some((g) => g.status === "completed");
}

const LightsConteiner = ({ timeGoalsSaving }) => {
    const [num, setNum] = useState(0);
    const [isTodayCompleted, setIsTodayCompleted] = useState(false);

    useEffect(() => {
        const series = computeSeries(timeGoalsSaving);
        const todayCompleted = getIsTodayCompleted(timeGoalsSaving);
        setNum(series);
        setIsTodayCompleted(todayCompleted);
    }, [timeGoalsSaving]);

    return <Lights num={num} isTodayCompleted={isTodayCompleted} />;
};

const mapStateToProps = (state) => ({
    timeGoalsSaving: state.goals.timeGoalsSaving
});

export default connect(mapStateToProps)(LightsConteiner);
