import React, { useMemo } from "react";
import GenerationButton from "./GenerationButton";
import { connect } from "react-redux";
import { addTextGenerationData } from "../../../redux/generation_reducer";
import toast from "react-hot-toast";

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

const GenerationButtonConteiner = (props) => {
    const goalsDone = props.goals.filter(g => g.status === "completed")
    const goalsInProgress = props.goals.filter(g => g.status === "in_progress")
    const series = useMemo(() => computeSeries(props.timeSavingGoals), [props.timeSavingGoals])

    return <div>
        <GenerationButton profile={props.profile} yesterdayReport={props.yesterdayReport} telegramId={props.telegramId} addTextGenerationData={props.addTextGenerationData} text={props.text} generationTextYesterday={props.generationTextYesterday} goalsInProgress={goalsInProgress} goalsDone={goalsDone} series={series} />
    </div>
}

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals.goals,
    timeSavingGoals: state.goals.timeGoalsSaving,
    text: state.generation.generationText,
    nerationIsOver: state.generation.nerationIsOver,
    telegramId: state.profile.profile.telegramId,
    yesterdayReport: state.profile.profile.yesterdayReport,
})

export default connect(mapStateToProps, { addTextGenerationData })(GenerationButtonConteiner) 