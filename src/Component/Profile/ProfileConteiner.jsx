import React from "react";
import Profile from "./Profile";
import { connect } from "react-redux";

const ProfileConteiner = (props) => {
    console.log(props)
    return <Profile />
}

const mapStateToProps = (state) =>({
    profile:state.profile
})

export default connect(mapStateToProps)(ProfileConteiner)