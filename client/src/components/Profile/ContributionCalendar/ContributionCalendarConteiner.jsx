'use client';
import React, { useEffect } from "react";
import ContributionCalendar from "./ContributionCalendar";
import { connect } from "react-redux";
import { addCalendarData } from "../../../redux/calendar_reducer";

const ContributionCalendarConteiner = ({ addCalendarData, calendarData, profile }) => {

    useEffect(() => {
        addCalendarData(profile.telegramId)
    }, calendarData)

    return <ContributionCalendar calendarData={calendarData} />
}

const mapStateToProps = (state) => ({
    calendarData: state.calendar.calendarData,
    profile: state.profile.profile
})

export default connect(mapStateToProps, { addCalendarData })(ContributionCalendarConteiner);
