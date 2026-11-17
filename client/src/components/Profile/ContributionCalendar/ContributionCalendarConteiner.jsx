'use client';
import React, { useEffect, useState } from "react";
import ContributionCalendar from "./ContributionCalendar";
import { connect } from "react-redux";

function createCompletedDatesArray(calendarData) {
    const completedDatesArray = [];

    (calendarData || []).forEach(day => {
        const completedGoalsCount = (day.goalData || []).filter(goal => goal.status === 'completed').length;

        for (let i = 0; i < completedGoalsCount; i++) {
            completedDatesArray.push(day.date);
        }
    });
    completedDatesArray.streakArchive = calendarData?.find(day => day?.streakArchive)?.streakArchive || null;

    return completedDatesArray;
}

const ContributionCalendarConteiner = ({ calendarData, goals = [] }) => {
    const [completedDatesArray, setCompletedDatesArray] = useState([]);

    useEffect(() => {
        const newCompletedDatesArray = createCompletedDatesArray(calendarData);
        setCompletedDatesArray(newCompletedDatesArray);
    }, [calendarData]);

    const goalsCount = goals.filter(goal => goal.status === 'in_progress' || goal.status === 'completed').length;
    return <ContributionCalendar calendarData={completedDatesArray} goalsCount={goalsCount} />
}

const mapStateToProps = (state) => ({
    calendarData: state.goals.timeGoalsSaving,
    goals: state.goals.goals,
    profile: state.profile.profile
})

export default connect(mapStateToProps)(ContributionCalendarConteiner);
