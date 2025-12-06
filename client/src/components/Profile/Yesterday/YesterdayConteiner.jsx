import React, { useState, useMemo } from "react";
import Yesterday from "./Yesterday";
import { connect } from "react-redux";

const YesterdayConteiner = (props) => {
    const [date, setDate] = useState(null);

    const goalsForSelectedDate = useMemo(() => {
        if (!date || !props.timeGoalsSaving || !props.goals) {
            return [];
        }
        const dateEntry = props.timeGoalsSaving.find(entry => entry.date === date);

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
    }, [date, props.timeGoalsSaving, props.goals]);

    console.log('Goals for selected date:', goalsForSelectedDate);

    return <Yesterday setDate={setDate} goalsForSelectedDate={goalsForSelectedDate} />
}

const mapStateToProps = (state) => ({
    timeGoalsSaving: state.goals.timeGoalsSaving,
    goals: state.goals.goals
})

export default connect(mapStateToProps, {})(YesterdayConteiner);