import React from "react";
import { connect } from "react-redux";
import Achievements from "./Achievements";

const AchievementsConteiner = (props) => {
    return <Achievements />
}

export default connect()(AchievementsConteiner);