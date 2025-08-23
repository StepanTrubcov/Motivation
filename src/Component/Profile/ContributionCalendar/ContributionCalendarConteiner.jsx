import React from "react";
import ContributionCalendar from "./ContributionCalendar";
import { connect } from "react-redux";

const ContributionCalendarConteiner = (props) => {
    return <ContributionCalendar {...props} />
}

const mapStateToProps = (state) => ({
    goals: state.goals.goals
})

export default connect(mapStateToProps)(ContributionCalendarConteiner);