import React from "react";
import Profile from "./Profile";
import { connect } from "react-redux";

const ProfileConteiner = (props) => {
    return <Profile pts={props.profile.profile.pts} />
}

const mapStateToProps = (state) => ({
    profile: state.profile
})

export default connect(mapStateToProps)(ProfileConteiner)