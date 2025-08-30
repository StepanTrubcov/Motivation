import React from "react";
import "./About.css";
import { Link } from "react-router-dom";
import About from "./About";
import { connect } from "react-redux";
import {setTheFirstTime } from '../../redux/profile_reducer'

const AboutConteiner = (props) => {
    return <About {...props} />
};

export default connect(null,{setTheFirstTime})(AboutConteiner);