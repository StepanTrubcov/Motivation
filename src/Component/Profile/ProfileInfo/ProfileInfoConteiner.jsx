import { connect } from "react-redux"
import React from "react"
import ProfileInfo from "./ProfileInfo"
import WinterArc from "./WinterArc/WinterArc"

const ProfileInfoConteiner = (props) => {
    return <div>
        <ProfileInfo {...props} />
        <WinterArc />
    </div>
}

const mapStateToProps = (state) => ({
    user: state.profile.profile
})

export default connect(mapStateToProps)(ProfileInfoConteiner)