import React from "react";
import TodaysGoals from "./TodaysGoals";
import { connect } from "react-redux";
import filter from "../../../utils/Filter/filter";

const TodaysGoalsConteiner = (props) => {
        return <TodaysGoals inProgress={filter(props.goals.goals, "in_progress")} />
}

const mapStateToProps = (state) => ({
    goals: state.goals
})

export default connect(mapStateToProps)(TodaysGoalsConteiner);