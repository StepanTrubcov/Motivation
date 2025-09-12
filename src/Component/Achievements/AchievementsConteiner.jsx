import React from "react";
import { connect } from "react-redux";
import Achievements from "./Achievements";

const AchievementsConteiner = (props) => {
    return <Achievements assignments={props.assignments} />
}

const mapStateToProps = (state) => ({
    assignments: state.assignments.assignments
})

export default connect(
    mapStateToProps
)(AchievementsConteiner);