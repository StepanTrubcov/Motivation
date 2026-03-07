import { connect } from "react-redux"
import React from "react"
import ProfileInfo from "./ProfileInfo"

const ProfileInfoConteiner = (props) => {
    return <div>
        <ProfileInfo {...props} />
    </div>
}

const mapStateToProps = (state) => ({
    user: state.profile.profile
})

export default connect(mapStateToProps)(ProfileInfoConteiner)