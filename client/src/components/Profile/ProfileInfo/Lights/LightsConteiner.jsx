import React, { useEffect, useState } from "react";
import Lights from "./Lights";
import { connect } from "react-redux";

const LightsConteiner = ({ profile, timeGoalsSaving }) => {

    const [loading, setLoading] = useState(null)


    const [num, setNum] = useState(0);
    const [isTodayCompleted, setIsTodayCompleted] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {

        const pastDays = timeGoalsSaving.filter(
            (item) => item.date < today
        );

        const todayDay = timeGoalsSaving.filter(
            (item) => item.date === today
        );


        pastDays.map(s => {

            const r = s.goalData.filter(g => g.status === "completed")

            if (r.length >= 1) { setNum(prev => prev + 1); } else if (r.length === 0) { setNum(0); }
        })

        todayDay.map(s => {

            const r = s.goalData.filter(g => g.status === "completed")

            if (r.length > 0) {
                setNum(prev => prev + 1);
                setIsTodayCompleted(true)
            }

            if (r.length === 0) {
                setIsTodayCompleted(false)
            }
        })

        setLoading(true)

    }, [timeGoalsSaving, profile])


    console.log("Серия дней:", num);
    if (loading) {
        return <Lights num={num} isTodayCompleted={isTodayCompleted} />;
    }
};

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    timeGoalsSaving: state.goals.timeGoalsSaving
});

export default connect(mapStateToProps)(LightsConteiner);
