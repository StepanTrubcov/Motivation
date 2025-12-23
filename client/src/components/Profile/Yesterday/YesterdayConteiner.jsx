import React, { useState, useMemo, useEffect } from "react";
import Yesterday from "./Yesterday";
import { connect } from "react-redux";
import { addStatus, addStatusNew, checkTimeGoalsSaving, newStatusSavingGoal } from "@/redux/goals_reducer";
import { deletePoints, setPoints } from "@/redux/profile_reducer";
import { addTextGenerationData } from "@/redux/generation_reducer";

const YesterdayConteiner = (props) => {

    const [date, setDate] = useState(null);
    const [savingGoals, setSavingGoals] = useState(null);
    
    useEffect(() => {
        checkTimeGoalsSaving(props.profile.telegramId);
    }, [props.timeGoalsSaving])

    const goalsForSelectedDate = useMemo(() => {
        const goalsData = savingGoals || props.timeGoalsSaving;

        if (!date || !goalsData || !props.goals) {
            return [];
        }
        const dateEntry = goalsData.find(entry => entry.date === date);

        if (!dateEntry || !dateEntry.goalData) {
            return [];
        }
        const resultGoals = dateEntry.goalData.map(goalData => {
            const goal = props.goals.find(g => g.id === goalData.idGoals);

            if (goal) {
                return {
                    ...goal,
                    status: goalData.status
                };
            }

            return null;
        }).filter(Boolean);

        return resultGoals;
    }, [date, savingGoals, props.timeGoalsSaving, props.goals]);

    return <Yesterday addTextGenerationData={props.addTextGenerationData} setDisplay={props.setDisplay} deletePoints={props.deletePoints} setSavingGoals={setSavingGoals} newStatusSavingGoal={props.newStatusSavingGoal} profile={props.profile} userId={props.userId} addStatus={props.addStatus} setPoints={props.setPoints} checkTimeGoalsSaving={props.checkTimeGoalsSaving} setDate={setDate} goalsForSelectedDate={goalsForSelectedDate} addStatusNew={props.addStatusNew} />
}

const mapStateToProps = (state) => ({
    timeGoalsSaving: state.goals.timeGoalsSaving,
    userId: state.profile.profile.id,
    profile: state.profile.profile,
    goals: state.goals.goals
})

export default connect(mapStateToProps, {addTextGenerationData, deletePoints, newStatusSavingGoal, addStatusNew, checkTimeGoalsSaving, setPoints, addStatus })(YesterdayConteiner);