import React from "react";
import "./About.css";
import { Link } from "react-router-dom";
import About from "./About";
import { connect } from "react-redux";
import { setTheFirstTimeFalse } from "../../redux/goals_reducer";

const AboutConteiner = (props) => {
    return <About {...props} />
};

export default connect(null, { setTheFirstTimeFalse })(AboutConteiner);