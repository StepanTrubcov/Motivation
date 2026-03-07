'use client';

import React from "react";
import Profile from "./Profile";
import { connect } from "react-redux";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

const ProfileConteiner = (props) => {
    return <Profile pts={props.profile.profile.pts} />
}

const mapStateToProps = (state) => ({
    profile: state.profile
})

export default connect(mapStateToProps)(ProfileConteiner)