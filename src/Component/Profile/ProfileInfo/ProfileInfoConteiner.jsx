import { connect } from "react-redux"
import React from "react"
import ProfileInfo from "./ProfileInfo"

const ProfileInfoConteiner = (props) => {
    return <ProfileInfo {...props} />
}

const mapStateToProps = (state) => ({
    user: state.profile.profile
})

export default connect(mapStateToProps)(ProfileInfoConteiner)