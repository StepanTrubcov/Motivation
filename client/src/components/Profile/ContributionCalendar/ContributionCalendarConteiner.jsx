'use client';
import React, { useEffect, useState } from "react";
import ContributionCalendar from "./ContributionCalendar";
import { connect } from "react-redux";

function createCompletedDatesArray(calendarData) {
    const completedDatesArray = [];

    calendarData.forEach(day => {
        const completedGoalsCount = day.goalData.filter(goal => goal.status === 'completed').length;

        for (let i = 0; i < completedGoalsCount; i++) {
            completedDatesArray.push(day.date);
        }
    });

    return completedDatesArray;
}

const ContributionCalendarConteiner = ({ calendarData }) => {
    const [completedDatesArray, setCompletedDatesArray] = useState([]);

    useEffect(() => {
        const newCompletedDatesArray = createCompletedDatesArray(calendarData);
        setCompletedDatesArray(newCompletedDatesArray);
    }, [calendarData]);

    return <ContributionCalendar calendarData={completedDatesArray} />
}

const mapStateToProps = (state) => ({
    calendarData: state.goals.timeGoalsSaving,
    profile: state.profile.profile
})

export default connect(mapStateToProps)(ContributionCalendarConteiner);